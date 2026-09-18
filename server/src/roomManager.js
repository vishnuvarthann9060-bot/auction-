import { DEFAULT_PLAYERS } from './data/players.js';
import { validateBid, getBidOptions } from './auctionEngine.js';

export const INITIAL_TEAMS = [
  { id: "csk", name: "Chennai Super Kings", shortName: "CSK", color: "#F9CD05", secondaryColor: "#1D428A", accent: "#F9CD05" },
  { id: "mi", name: "Mumbai Indians", shortName: "MI", color: "#004BA0", secondaryColor: "#D1AB3E", accent: "#004BA0" },
  { id: "rcb", name: "Royal Challengers Bengaluru", shortName: "RCB", color: "#D71920", secondaryColor: "#000000", accent: "#D71920" },
  { id: "kkr", name: "Kolkata Knight Riders", shortName: "KKR", color: "#3A225D", secondaryColor: "#D4AF37", accent: "#7D3C98" },
  { id: "srh", name: "Sunrisers Hyderabad", shortName: "SRH", color: "#F26522", secondaryColor: "#000000", accent: "#F26522" },
  { id: "rr", name: "Rajasthan Royals", shortName: "RR", color: "#EA1A85", secondaryColor: "#254AA5", accent: "#EA1A85" },
  { id: "dc", name: "Delhi Capitals", shortName: "DC", color: "#0078BC", secondaryColor: "#B9251C", accent: "#0078BC" },
  { id: "gt", name: "Gujarat Titans", shortName: "GT", color: "#1B2133", secondaryColor: "#E2AA3E", accent: "#45B69C" },
  { id: "lsg", name: "Lucknow Super Giants", shortName: "LSG", color: "#38A3A5", secondaryColor: "#E05A47", accent: "#57CC99" },
  { id: "pbks", name: "Punjab Kings", shortName: "PBKS", color: "#DD1F2D", secondaryColor: "#A7A9AC", accent: "#ED2939" }
];

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "IPL-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(socket, hostName, customRules = {}, userAuth = {}) {
    const roomId = this.generateRoomCode();
    const isPublic = customRules.isPublic !== false; // default true for public matching
    const auctionMode = customRules.auctionMode || "MEGA"; // "MEGA" or "MINI"

    const rules = {
      totalPurse: customRules.totalPurse || 1000000000, // 100 Cr default
      minSquadSize: customRules.minSquadSize || 15,
      maxSquadSize: customRules.maxSquadSize || 25,
      maxOverseas: customRules.maxOverseas || 8,
      timerSeconds: Math.max(5, Math.min(60, Number(customRules.timerSeconds) || 15)),
      auctionMode
    };

    const teams = INITIAL_TEAMS.map(team => ({
      ...team,
      ownerId: null,
      ownerName: null,
      ownerUserId: null,
      isBot: false,
      purse: rules.totalPurse,
      squad: []
    }));

    const room = {
      id: roomId,
      hostId: socket.id,
      hostUserId: userAuth?.userId || null,
      rules,
      isPublic,
      aiBotsEnabled: false,
      status: "LOBBY", // LOBBY, ACTIVE, PAUSED, ENDED
      users: new Map(),
      teams,
      playersPool: [...DEFAULT_PLAYERS],
      currentPlayerIndex: 0,
      currentAuction: null,
      soldPlayers: [],
      unsoldPlayers: [],
      chats: [],
      timerInterval: null,
      botTimeout: null
    };

    this.rooms.set(roomId, room);
    this.joinUserToRoom(socket, roomId, hostName, true, userAuth);
    return room;
  }

  joinRoom(socket, roomId, userName, userAuth = {}) {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) {
      throw new Error("Room not found. Please check the code!");
    }
    return this.joinUserToRoom(socket, room.id, userName, false, userAuth);
  }

  quickMatch(socket, userName, userAuth = {}) {
    // Find an active public room in LOBBY with free team slots
    for (const [id, room] of this.rooms.entries()) {
      if (room.isPublic && room.status === "LOBBY") {
        const freeTeams = room.teams.filter(t => !t.ownerId && !t.isBot);
        if (freeTeams.length > 0) {
          return this.joinUserToRoom(socket, id, userName, false, userAuth);
        }
      }
    }
    // If no suitable room found, automatically create a new public room!
    return this.createRoom(socket, userName || "CricketFan", { isPublic: true }, userAuth);
  }

  getPublicRooms() {
    const list = [];
    for (const [id, room] of this.rooms.entries()) {
      if (room.isPublic && room.status === "LOBBY") {
        const claimedCount = room.teams.filter(t => t.ownerId || t.isBot).length;
        list.push({
          id: room.id,
          hostName: Array.from(room.users.values()).find(u => u.isHost)?.name || "Host",
          userCount: room.users.size,
          claimedTeamsCount: claimedCount,
          totalTeams: room.teams.length,
          totalPurse: room.rules.totalPurse,
          auctionMode: room.rules.auctionMode || "MEGA",
          aiBotsEnabled: room.aiBotsEnabled
        });
      }
    }
    return list;
  }

  joinUserToRoom(socket, roomId, userName, isHost = false, userAuth = {}) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    socket.join(roomId);

    const userId = userAuth?.userId || null;
    const userEmail = userAuth?.userEmail || null;
    const userAvatar = userAuth?.userAvatar || null;

    // Check if user with this permanent userId already exists in room (e.g. reconnecting on page reload)
    let existingUser = null;
    let oldSocketId = null;
    if (userId) {
      for (const [sId, u] of room.users.entries()) {
        if (u.userId === userId) {
          existingUser = u;
          oldSocketId = sId;
          break;
        }
      }
    }

    if (existingUser) {
      if (oldSocketId !== socket.id) {
        room.users.delete(oldSocketId);
      }
      existingUser.id = socket.id;
      existingUser.name = userName || existingUser.name;
      if (userEmail) existingUser.email = userEmail;
      if (userAvatar) existingUser.avatar = userAvatar;
      existingUser.disconnectedAt = null;

      const wasHost = existingUser.isHost || room.hostUserId === userId || room.hostId === oldSocketId;
      if (wasHost || isHost) {
        existingUser.isHost = true;
        room.hostId = socket.id;
        room.hostUserId = userId;
      }

      room.users.set(socket.id, existingUser);

      // Rebind team ownership to new socket
      if (existingUser.teamId) {
        const team = room.teams.find(t => t.id === existingUser.teamId);
        if (team) {
          team.ownerId = socket.id;
          team.ownerName = existingUser.name;
          team.ownerUserId = userId;
        }
      }

      this.broadcastRoomState(roomId);
      return room;
    }

    room.users.set(socket.id, {
      id: socket.id,
      userId,
      email: userEmail,
      avatar: userAvatar,
      name: userName || `Manager-${socket.id.slice(0, 4)}`,
      isHost,
      teamId: null,
      disconnectedAt: null
    });

    if (isHost && userId) {
      room.hostUserId = userId;
    }

    this.broadcastRoomState(roomId);
    return room;
  }

  reconnectUser(socket, roomId, userId, userName = "", userAuth = {}) {
    const room = this.rooms.get(roomId?.toUpperCase());
    if (!room) {
      throw new Error("Room not found or session has expired.");
    }
    return this.joinUserToRoom(socket, room.id, userName, false, { userId, ...userAuth });
  }

  selectTeam(socket, roomId, teamId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (!user) return;

    const targetTeam = room.teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    if (targetTeam.ownerId && targetTeam.ownerId !== socket.id && !targetTeam.isBot) {
      socket.emit("error_message", { message: `${targetTeam.name} is already selected by ${targetTeam.ownerName}!` });
      return;
    }

    // Release previously selected team if any
    if (user.teamId) {
      const prevTeam = room.teams.find(t => t.id === user.teamId);
      if (prevTeam && prevTeam.ownerId === socket.id) {
        prevTeam.ownerId = null;
        prevTeam.ownerName = null;
        prevTeam.isBot = false;
      }
    }

    // Assign new team (replaces bot if it was a bot)
    targetTeam.ownerId = socket.id;
    targetTeam.ownerName = user.name;
    targetTeam.ownerUserId = user.userId || null;
    targetTeam.isBot = false;
    user.teamId = teamId;

    this.broadcastRoomState(roomId);
  }

  toggleAIBots(socket, roomId, enabled) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    room.aiBotsEnabled = enabled;

    // If enabled, mark all currently unowned teams as AI Bots
    room.teams.forEach(team => {
      if (!team.ownerId) {
        team.isBot = enabled;
        team.ownerName = enabled ? `AI • ${team.shortName} Bot` : null;
      }
    });

    this.broadcastRoomState(roomId);
    this.io.to(roomId).emit("toast_message", {
      message: enabled ? "🤖 AI Franchise Bots enabled for open teams!" : "AI Bots disabled."
    });
  }

  sendChatMessage(socket, roomId, text) {
    const room = this.rooms.get(roomId);
    if (!room || !text.trim()) return;

    const user = room.users.get(socket.id);
    const userTeam = user?.teamId ? room.teams.find(t => t.id === user.teamId) : null;

    const chatItem = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: user ? user.name : "Spectator",
      teamShortName: userTeam ? userTeam.shortName : null,
      teamColor: userTeam ? userTeam.color : "#94A3B8",
      text: text.trim().slice(0, 150),
      timestamp: Date.now()
    };

    room.chats.push(chatItem);
    if (room.chats.length > 50) room.chats.shift();

    this.io.to(roomId).emit("new_chat_message", chatItem);
  }

  sendReaction(socket, roomId, emoji) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(socket.id);
    const userTeam = user?.teamId ? room.teams.find(t => t.id === user.teamId) : null;

    this.io.to(roomId).emit("reaction_burst", {
      emoji,
      sender: user ? user.name : "Manager",
      teamShortName: userTeam ? userTeam.shortName : null
    });
  }

  updateRules(socket, roomId, newRules) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    if (room.status !== "LOBBY") {
      socket.emit("error_message", { message: "Cannot edit rules once auction has started." });
      return;
    }

    room.rules = {
      ...room.rules,
      ...newRules
    };

    if (newRules.isPublic !== undefined) {
      room.isPublic = Boolean(newRules.isPublic);
    }

    if (newRules.totalPurse) {
      room.teams.forEach(team => {
        team.purse = newRules.totalPurse;
      });
    }

    this.broadcastRoomState(roomId);
  }

  addCustomPlayer(socket, roomId, playerData) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    const newPlayer = {
      id: `custom-${Date.now()}`,
      name: playerData.name || "Custom Star",
      role: playerData.role || "All-Rounder",
      country: playerData.country || "India",
      isOverseas: playerData.isOverseas || false,
      basePrice: Number(playerData.basePrice) || 20000000,
      set: "Custom Set",
      stats: playerData.stats || { matches: 20, runs: 450, wickets: 15 },
      rating: Number(playerData.rating) || 90,
      image: playerData.image || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80"
    };

    room.playersPool.push(newPlayer);
    this.broadcastRoomState(roomId);
    socket.emit("toast_message", { message: `Added ${newPlayer.name} to the auction pool!` });
  }

  startAuction(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    room.status = "ACTIVE";
    room.currentPlayerIndex = 0;
    this.bringNextPlayer(room);
  }

  bringNextPlayer(room) {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }
    if (room.botTimeout) {
      clearTimeout(room.botTimeout);
      room.botTimeout = null;
    }

    if (room.currentPlayerIndex >= room.playersPool.length) {
      room.status = "ENDED";
      room.currentAuction = null;
      this.broadcastRoomState(room.id);
      this.io.to(room.id).emit("auction_completed", {
        teams: room.teams,
        soldPlayers: room.soldPlayers
      });
      return;
    }

    const player = room.playersPool[room.currentPlayerIndex];
    room.currentAuction = {
      player,
      currentBid: 0,
      highestBidderTeamId: null,
      highestBidderName: null,
      bidHistory: [],
      timer: room.rules.timerSeconds,
      status: "BIDDING",
      bidOptions: getBidOptions(0, player.basePrice)
    };

    this.broadcastRoomState(room.id);
    this.io.to(room.id).emit("player_up_for_bid", { player });
    this.startTimer(room);

    // Schedule AI Bot bid check if enabled
    this.scheduleBotDecision(room);
  }

  scheduleBotDecision(room) {
    if (!room.aiBotsEnabled || room.status !== "ACTIVE" || !room.currentAuction) return;

    if (room.botTimeout) clearTimeout(room.botTimeout);

    // Random delay between 1.5s and 3.5s to mimic human hesitation
    const delay = Math.floor(Math.random() * 2000) + 1500;

    room.botTimeout = setTimeout(() => {
      this.evaluateAndPlaceBotBid(room);
    }, delay);
  }

  evaluateAndPlaceBotBid(room) {
    if (!room.aiBotsEnabled || room.status !== "ACTIVE" || !room.currentAuction) return;

    const auction = room.currentAuction;
    const player = auction.player;

    // Filter all active bot teams
    const botTeams = room.teams.filter(t => t.isBot && t.id !== auction.highestBidderTeamId);
    if (botTeams.length === 0) return;

    // Shuffle bots to vary who bids
    const candidateBots = [...botTeams].sort(() => Math.random() - 0.5);

    for (const botTeam of candidateBots) {
      const targetBid = auction.currentBid === 0 ? player.basePrice : auction.bidOptions[0];

      // Calculate maximum price this bot is willing to pay based on player rating
      // Rating 95+ -> willing to bid up to ₹16-24 Cr
      // Rating 90-94 -> willing to bid up to ₹10-15 Cr
      // Rating 85-89 -> willing to bid up to ₹4-8 Cr
      const rating = player.rating || 85;
      let maxWillingMultiplier = 2.0;
      if (rating >= 95) maxWillingMultiplier = 10.0;
      else if (rating >= 90) maxWillingMultiplier = 6.0;
      else if (rating >= 85) maxWillingMultiplier = 3.5;

      const maxBotPrice = player.basePrice * maxWillingMultiplier;

      // 65% probability of bidding if within price range and purse permits
      if (targetBid <= maxBotPrice && Math.random() < 0.65) {
        const validation = validateBid(botTeam, player, targetBid, room.rules);
        if (validation.valid) {
          // Place bot bid!
          this.executeBid(room, botTeam, `AI (${botTeam.shortName})`, targetBid);
          // Schedule next bot check
          this.scheduleBotDecision(room);
          break;
        }
      }
    }
  }

  startTimer(room) {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
    }

    room.timerInterval = setInterval(() => {
      if (room.status !== "ACTIVE" || !room.currentAuction) return;

      room.currentAuction.timer -= 1;

      const totalT = room.rules.timerSeconds || 15;
      const onceThreshold = totalT <= 5 ? 3 : 5;
      const twiceThreshold = totalT <= 5 ? 1 : 2;

      if (room.currentAuction.timer === onceThreshold) {
        room.currentAuction.status = "GOING_ONCE";
        this.io.to(room.id).emit("auction_warning", { stage: "GOING_ONCE" });
      } else if (room.currentAuction.timer === twiceThreshold) {
        room.currentAuction.status = "GOING_TWICE";
        this.io.to(room.id).emit("auction_warning", { stage: "GOING_TWICE" });
      }

      if (room.currentAuction.timer <= 0) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
        this.resolveAuction(room);
      } else {
        this.io.to(room.id).emit("timer_tick", {
          timer: room.currentAuction.timer,
          status: room.currentAuction.status
        });
      }
    }, 1000);
  }

  placeBid(socket, roomId, bidAmount) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== "ACTIVE" || !room.currentAuction) return;

    const user = room.users.get(socket.id);
    if (!user || !user.teamId) {
      socket.emit("error_message", { message: "You must join a team to place a bid!" });
      return;
    }

    const team = room.teams.find(t => t.id === user.teamId);
    if (!team) {
      socket.emit("error_message", { message: "Team not found!" });
      return;
    }

    const auction = room.currentAuction;
    if (auction.status === "SOLD" || auction.status === "UNSOLD") {
      return;
    }

    // Validation
    const validation = validateBid(team, auction.player, bidAmount, room.rules);
    if (!validation.valid) {
      socket.emit("error_message", { message: validation.reason });
      return;
    }

    // Minimum Bid Increment Logic
    const minRequiredBid = getNextMinBid(auction.currentBid, auction.player.basePrice);
    if (bidAmount < minRequiredBid) {
      socket.emit("error_message", { 
        message: `Bid must be at least ₹${minRequiredBid >= 10000000 ? (minRequiredBid / 10000000) + ' Cr' : (minRequiredBid / 100000) + ' Lakhs'}` 
      });
      return;
    }

    this.executeBid(room, team, user.name, bidAmount);
  }

  executeBid(room, team, bidderName, bidAmount) {
    const auction = room.currentAuction;
    const prevBidderTeamId = auction.highestBidderTeamId;

    auction.currentBid = bidAmount;
    auction.highestBidderTeamId = team.id;
    auction.highestBidderName = `${team.shortName} (${bidderName})`;
    auction.status = "BIDDING";
    auction.timer = Math.max(room.rules.timerSeconds, 5);

    const bidRecord = {
      teamId: team.id,
      teamShortName: team.shortName,
      teamColor: team.color,
      bidderName: bidderName,
      amount: bidAmount,
      timestamp: Date.now()
    };
    auction.bidHistory.unshift(bidRecord);
    auction.bidOptions = getBidOptions(bidAmount, auction.player.basePrice);

    this.broadcastRoomState(room.id);
    this.io.to(room.id).emit("new_bid_placed", {
      bid: bidRecord,
      timer: auction.timer,
      bidOptions: auction.bidOptions,
      outbidTeamId: prevBidderTeamId
    });
  }

  resolveAuction(room) {
    const auction = room.currentAuction;
    if (!auction) return;

    if (auction.highestBidderTeamId && auction.currentBid > 0) {
      const team = room.teams.find(t => t.id === auction.highestBidderTeamId);
      team.purse -= auction.currentBid;
      const boughtPlayer = {
        ...auction.player,
        soldPrice: auction.currentBid,
        boughtBy: team.shortName
      };
      team.squad.push(boughtPlayer);

      const soldRecord = {
        player: boughtPlayer,
        teamId: team.id,
        teamName: team.name,
        teamShortName: team.shortName,
        teamColor: team.color,
        amount: auction.currentBid
      };
      room.soldPlayers.unshift(soldRecord);
      auction.status = "SOLD";

      this.broadcastRoomState(room.id);
      this.io.to(room.id).emit("player_sold", soldRecord);
    } else {
      auction.status = "UNSOLD";
      room.unsoldPlayers.unshift(auction.player);
      this.broadcastRoomState(room.id);
      this.io.to(room.id).emit("player_unsold", { player: auction.player });
    }

    setTimeout(() => {
      if (room.status === "ACTIVE") {
        room.currentPlayerIndex += 1;
        this.bringNextPlayer(room);
      }
    }, 5000);
  }

  hostForceSell(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id || !room.currentAuction) return;
    if (room.timerInterval) clearInterval(room.timerInterval);
    if (room.botTimeout) clearTimeout(room.botTimeout);
    this.resolveAuction(room);
  }

  hostMarkUnsold(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id || !room.currentAuction) return;
    if (room.timerInterval) clearInterval(room.timerInterval);
    if (room.botTimeout) clearTimeout(room.botTimeout);
    room.currentAuction.highestBidderTeamId = null;
    room.currentAuction.currentBid = 0;
    this.resolveAuction(room);
  }

  hostNextPlayer(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;
    room.currentPlayerIndex += 1;
    this.bringNextPlayer(room);
  }

  hostTogglePause(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    if (room.status === "ACTIVE") {
      room.status = "PAUSED";
      if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
      }
      if (room.botTimeout) {
        clearTimeout(room.botTimeout);
        room.botTimeout = null;
      }
      this.broadcastRoomState(room.id);
      this.io.to(room.id).emit("toast_message", { message: "Auction PAUSED by Host" });
    } else if (room.status === "PAUSED") {
      room.status = "ACTIVE";
      this.startTimer(room);
      this.broadcastRoomState(room.id);
      this.io.to(room.id).emit("toast_message", { message: "Auction RESUMED" });
      if (room.aiBotsEnabled) {
        this.scheduleBotDecision(room);
      }
    }
  }

  handleDisconnect(socket) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);

        if (user.userId) {
          // Keep user profile & team intact for 5-minute reconnection grace period
          user.disconnectedAt = Date.now();
          console.log(`[User Temporarily Disconnected] ${user.name} (${user.userId}) in Room ${roomId}`);

          setTimeout(() => {
            const currentRoom = this.rooms.get(roomId);
            if (!currentRoom) return;
            const u = currentRoom.users.get(socket.id);
            if (u && u.disconnectedAt) {
              currentRoom.users.delete(socket.id);
              if (u.teamId) {
                const team = currentRoom.teams.find(t => t.id === u.teamId);
                if (team && team.ownerId === socket.id) {
                  team.ownerId = null;
                  team.ownerName = null;
                  team.ownerUserId = null;
                }
              }
              if (currentRoom.hostId === socket.id) {
                const nextUser = currentRoom.users.values().next().value;
                if (nextUser) {
                  currentRoom.hostId = nextUser.id;
                  nextUser.isHost = true;
                }
              }
              this.broadcastRoomState(roomId);
            }
          }, 300000); // 5 min

          this.broadcastRoomState(roomId);
          break;
        } else {
          // Anonymous user without userId
          room.users.delete(socket.id);

          if (user.teamId) {
            const team = room.teams.find(t => t.id === user.teamId);
            if (team && team.ownerId === socket.id) {
              team.ownerId = null;
              team.ownerName = null;
              team.ownerUserId = null;
            }
          }

          if (room.hostId === socket.id) {
            const nextUser = room.users.values().next().value;
            if (nextUser) {
              room.hostId = nextUser.id;
              nextUser.isHost = true;
            }
          }

          // Clean up empty rooms after 15 minutes to save memory
          if (room.users.size === 0) {
            setTimeout(() => {
              const currentRoom = this.rooms.get(roomId);
              if (currentRoom && currentRoom.users.size === 0) {
                if (currentRoom.timerInterval) clearInterval(currentRoom.timerInterval);
                if (currentRoom.botTimeout) clearTimeout(currentRoom.botTimeout);
                this.rooms.delete(roomId);
                console.log(`[Cleaned Idle Room] ${roomId}`);
              }
            }, 900000);
          }

          this.broadcastRoomState(roomId);
          break;
        }
      }
    }
  }

  sendChatMessage(socket, roomId, text) {
    const room = this.rooms.get(roomId);
    if (!room || !text || !text.trim()) return;

    const user = room.users.get(socket.id);
    const userTeam = room.teams.find((t) => t.ownerId === socket.id);

    const chatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      userId: socket.id,
      sender: user ? user.name : "Cricket Fan",
      teamShortName: userTeam ? userTeam.shortName : null,
      teamColor: userTeam ? userTeam.color : null,
      text: text.trim().slice(0, 200),
      timestamp: Date.now()
    };

    if (!room.chats) room.chats = [];
    room.chats.push(chatMessage);
    if (room.chats.length > 50) room.chats.shift();

    this.io.to(roomId).emit("chat_message", chatMessage);
    this.broadcastRoomState(roomId);
  }

  sendReaction(socket, roomId, emoji) {
    const room = this.rooms.get(roomId);
    if (!room || !emoji) return;

    const user = room.users.get(socket.id);
    const userTeam = room.teams.find((t) => t.ownerId === socket.id);

    const reactionPayload = {
      emoji: emoji.slice(0, 4),
      sender: user ? user.name : "Cricket Fan",
      teamShortName: userTeam ? userTeam.shortName : null,
      teamColor: userTeam ? userTeam.color : "#F59E0B",
      timestamp: Date.now()
    };

    this.io.to(roomId).emit("reaction_burst", reactionPayload);
  }

  getPublicRoomState(room) {
    return {
      id: room.id,
      hostId: room.hostId,
      status: room.status,
      rules: room.rules,
      isPublic: room.isPublic,
      aiBotsEnabled: room.aiBotsEnabled,
      users: Array.from(room.users.values()),
      teams: room.teams,
      totalPlayersCount: room.playersPool.length,
      currentPlayerIndex: room.currentPlayerIndex,
      currentAuction: room.currentAuction,
      soldPlayersCount: room.soldPlayers.length,
      unsoldPlayersCount: room.unsoldPlayers.length,
      soldPlayers: room.soldPlayers,
      unsoldPlayers: room.unsoldPlayers,
      chats: room.chats || []
    };
  }

  broadcastRoomState(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    this.io.to(roomId).emit("room_state_update", this.getPublicRoomState(room));
  }
}
