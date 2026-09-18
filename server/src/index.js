import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { RoomManager } from "./roomManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager(io);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", activeRooms: roomManager.rooms.size });
});

// Public rooms directory endpoint
app.get("/api/public-rooms", (req, res) => {
  res.json({
    rooms: roomManager.getPublicRooms(),
    activeCount: roomManager.rooms.size
  });
});

// In-Memory User Store for Player Progress & Career Sync
const userProfiles = new Map();

function getOrCreateUser(userId, data = {}) {
  if (!userId) return null;
  let user = userProfiles.get(userId);
  if (!user) {
    user = {
      id: userId,
      name: data.name || "Franchise Manager",
      email: data.email || "",
      avatar: data.avatar || "",
      createdAt: Date.now(),
      stats: {
        auctionsJoined: 0,
        tournamentsWon: 0,
        playersBought: 0,
        totalPurseSpent: 0
      },
      savedSquads: []
    };
    userProfiles.set(userId, user);
  } else {
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.avatar) user.avatar = data.avatar;
  }
  return user;
}

// User Profile REST Endpoints
app.get("/api/user/profile/:userId", (req, res) => {
  const user = userProfiles.get(req.params.userId);
  if (!user) {
    return res.json({ success: true, user: null });
  }
  res.json({ success: true, user });
});

app.post("/api/user/profile", (req, res) => {
  const { userId, name, email, avatar } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: "userId required" });
  }
  const user = getOrCreateUser(userId, { name, email, avatar });
  res.json({ success: true, user });
});

app.post("/api/user/save-squad", (req, res) => {
  const { userId, squadData } = req.body;
  if (!userId || !squadData) {
    return res.status(400).json({ success: false, error: "userId and squadData required" });
  }
  const user = getOrCreateUser(userId);
  const squadItem = {
    id: `squad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    teamId: squadData.teamId,
    teamName: squadData.teamName,
    shortName: squadData.shortName,
    color: squadData.color,
    totalPlayers: squadData.squad ? squadData.squad.length : 0,
    totalSpent: squadData.spent || 0,
    purseLeft: squadData.purseLeft || 0,
    squad: squadData.squad || [],
    savedAt: Date.now()
  };
  user.savedSquads.unshift(squadItem);
  if (user.savedSquads.length > 25) user.savedSquads.pop();
  res.json({ success: true, squad: squadItem });
});

app.post("/api/user/stats", (req, res) => {
  const { userId, deltaStats } = req.body;
  if (!userId) return res.status(400).json({ success: false, error: "userId required" });
  const user = getOrCreateUser(userId);
  if (deltaStats) {
    if (deltaStats.auctionsJoined) user.stats.auctionsJoined += Number(deltaStats.auctionsJoined);
    if (deltaStats.tournamentsWon) user.stats.tournamentsWon += Number(deltaStats.tournamentsWon);
    if (deltaStats.playersBought) user.stats.playersBought += Number(deltaStats.playersBought);
    if (deltaStats.totalPurseSpent) user.stats.totalPurseSpent += Number(deltaStats.totalPurseSpent);
  }
  res.json({ success: true, stats: user.stats });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Get live public rooms
  socket.on("get_public_rooms", (callback) => {
    if (callback) {
      callback({ rooms: roomManager.getPublicRooms() });
    }
  });

  // Reconnect user to existing room (prevents lost progress on page reload)
  socket.on("reconnect_user", ({ roomId, userId, userName, userAuth }, callback) => {
    try {
      const room = roomManager.reconnectUser(socket, roomId, userId, userName, userAuth);
      console.log(`[User Reconnected] ${userName || userId} -> Room ${room.id}`);
      if (callback) {
        callback({
          success: true,
          roomId: room.id,
          roomState: roomManager.getPublicRoomState(room)
        });
      }
    } catch (err) {
      console.log(`[Reconnect Failed] ${err.message}`);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Quick match / Instant play
  socket.on("quick_match", ({ userName, userAuth }, callback) => {
    try {
      const room = roomManager.quickMatch(socket, userName, userAuth);
      console.log(`[Quick Match] ${userName} -> Room ${room.id}`);
      if (callback) {
        callback({
          success: true,
          roomId: room.id,
          roomState: roomManager.getPublicRoomState(room)
        });
      }
    } catch (err) {
      console.error("Error in quick match:", err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Create room
  socket.on("create_room", ({ hostName, rules, userAuth }, callback) => {
    try {
      const room = roomManager.createRoom(socket, hostName, rules, userAuth);
      console.log(`[Room Created] ${room.id} by ${hostName} (Public: ${room.isPublic})`);
      if (callback) {
        callback({
          success: true,
          roomId: room.id,
          roomState: roomManager.getPublicRoomState(room)
        });
      }
    } catch (err) {
      console.error("Error creating room:", err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Join room
  socket.on("join_room", ({ roomId, userName, userAuth }, callback) => {
    try {
      const room = roomManager.joinRoom(socket, roomId, userName, userAuth);
      console.log(`[User Joined] ${userName} -> Room ${room.id}`);
      if (callback) {
        callback({
          success: true,
          roomId: room.id,
          roomState: roomManager.getPublicRoomState(room)
        });
      }
    } catch (err) {
      console.error("Error joining room:", err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Team selection
  socket.on("select_team", ({ roomId, teamId }) => {
    roomManager.selectTeam(socket, roomId, teamId);
  });

  // Toggle AI Bots
  socket.on("toggle_ai_bots", ({ roomId, enabled }) => {
    roomManager.toggleAIBots(socket, roomId, enabled);
  });

  // Live Chat
  socket.on("send_chat", ({ roomId, text }) => {
    roomManager.sendChatMessage(socket, roomId, text);
  });

  // Floating Emoji Reaction Burst
  socket.on("send_reaction", ({ roomId, emoji }) => {
    roomManager.sendReaction(socket, roomId, emoji);
  });

  // Host updates custom rules
  socket.on("update_rules", ({ roomId, rules }) => {
    roomManager.updateRules(socket, roomId, rules);
  });

  // Host adds custom player
  socket.on("add_custom_player", ({ roomId, player }) => {
    roomManager.addCustomPlayer(socket, roomId, player);
  });

  // Host starts auction
  socket.on("start_auction", ({ roomId }) => {
    console.log(`[Auction Started] Room ${roomId}`);
    roomManager.startAuction(socket, roomId);
  });

  // Place a bid
  socket.on("place_bid", ({ roomId, amount }) => {
    roomManager.placeBid(socket, roomId, amount);
  });

  // Host manual actions
  socket.on("host_force_sell", ({ roomId }) => {
    roomManager.hostForceSell(socket, roomId);
  });

  socket.on("host_mark_unsold", ({ roomId }) => {
    roomManager.hostMarkUnsold(socket, roomId);
  });

  socket.on("host_next_player", ({ roomId }) => {
    roomManager.hostNextPlayer(socket, roomId);
  });

  socket.on("host_toggle_pause", ({ roomId }) => {
    roomManager.hostTogglePause(socket, roomId);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    roomManager.handleDisconnect(socket);
  });
});

// Global SEO headers for search engine crawlers
app.use((req, res, next) => {
  res.setHeader("X-Robots-Tag", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  next();
});

// Explicit SEO endpoints for Googlebot (Before static middleware)
const clientDistPath = path.resolve(__dirname, "../../client/dist");

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("X-Robots-Tag", "all");
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://ipl-auction-game-vvdr.onrender.com/sitemap.xml\n`);
});

app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(clientDistPath, "sitemap.xml"));
});

// Serve static frontend in production
app.use(express.static(clientDistPath));

// For SPA client routing, return index.html for all remaining routes
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send("IPL Auction Server is running! Run 'npm run build' to generate the client UI.");
    }
  });
});

// Self-ping to prevent Render sleep mode and keep-alive for Googlebot
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || "https://ipl-auction-game-vvdr.onrender.com";
setInterval(() => {
  fetch(`${RENDER_EXTERNAL_URL}/api/health`)
    .then(() => console.log("💓 Keep-alive heartbeat ping successful"))
    .catch(() => {});
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`⚡ IPL Auction Server running on 0.0.0.0:${PORT}`);
});
