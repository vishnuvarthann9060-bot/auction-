import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import confetti from "canvas-confetti";
import { sounds } from "../utils/sound";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [publicRooms, setPublicRooms] = useState([]);
  const [userName, setUserName] = useState(() => localStorage.getItem("ipl_user_name") || "");
  const [errorMessage, setErrorMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Check URL for ?room=CODE
  const [urlRoomCode, setUrlRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || "";
  });

  // Initialize socket
  useEffect(() => {
    // In local Vite dev (port 5173), point to backend port 4000.
    // In production single-platform deployment, connect to the exact same origin!
    const serverUrl = window.location.port === "5173"
      ? (window.location.hostname === "localhost" ? "http://localhost:4000" : `http://${window.location.hostname}:4000`)
      : window.location.origin;

    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true
    });

    newSocket.on("connect", () => {
      console.log("Connected to auction server:", newSocket.id);
      setConnected(true);

      // Fetch public rooms immediately upon connect
      newSocket.emit("get_public_rooms", (res) => {
        if (res && res.rooms) setPublicRooms(res.rooms);
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    newSocket.on("room_state_update", (updatedRoom) => {
      setRoomState(updatedRoom);
    });

    newSocket.on("error_message", ({ message }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    newSocket.on("toast_message", ({ message }) => {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
    });

    newSocket.on("timer_tick", ({ timer }) => {
      if (timer <= 4 && timer > 0) {
        sounds.playHeartbeat();
      } else if (timer <= 8 && timer > 0) {
        sounds.playTick();
      }
    });

    newSocket.on("auction_warning", () => {
      sounds.playWarning();
    });

    newSocket.on("player_sold", (soldData) => {
      sounds.playSoldFanfare();
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.55 },
        colors: [soldData.teamColor || '#F59E0B', '#FFD700', '#FDE68A', '#FFFFFF', '#6366F1']
      });
    });

    newSocket.on("player_unsold", () => {
      sounds.playHammer();
    });

    // Floating reaction listener
    newSocket.on("reaction_burst", (reaction) => {
      const id = `${Date.now()}-${Math.random()}`;
      setFloatingReactions((prev) => [...prev.slice(-15), { ...reaction, id }]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2500);
    });

    setSocket(newSocket);

    // Polling interval to refresh public rooms every 6 seconds if in lobby
    const refreshInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("get_public_rooms", (res) => {
          if (res && res.rooms) setPublicRooms(res.rooms);
        });
      }
    }, 6000);

    return () => {
      clearInterval(refreshInterval);
      newSocket.disconnect();
    };
  }, []);

  // Listen for bids to trigger outbid alerts & sound
  useEffect(() => {
    if (!socket) return;

    let lastBidTime = 0;

    const handleNewBid = ({ bid, outbidTeamId, timer }) => {
      const now = Date.now();
      const timeSinceLastBid = now - lastBidTime;
      lastBidTime = now;

      // Sound selection based on game context
      if (timer !== undefined && timer <= 3) {
        sounds.playSniper();
      } else if (timeSinceLastBid < 2500 && timeSinceLastBid > 0) {
        sounds.playBiddingWar();
      } else {
        sounds.playBid();
      }

      const myTeam = roomState?.teams?.find(t => t.ownerId === socket.id);
      if (myTeam && outbidTeamId === myTeam.id) {
        sounds.playOutbid();
        setToastMessage(`⚠️ ${bid.teamShortName} outbid you with ₹${(bid.amount / 10000000).toFixed(2)} Cr!`);
      }
    };

    socket.on("new_bid_placed", handleNewBid);
    return () => {
      socket.off("new_bid_placed", handleNewBid);
    };
  }, [socket, roomState]);

  // Current user & team
  const currentUser = useMemo(() => {
    if (!roomState || !socket) return null;
    return roomState.users.find(u => u.id === socket.id);
  }, [roomState, socket]);

  const myTeam = useMemo(() => {
    if (!roomState || !currentUser || !currentUser.teamId) return null;
    return roomState.teams.find(t => t.id === currentUser.teamId);
  }, [roomState, currentUser]);

  const isHost = currentUser?.isHost || false;

  // Actions
  const createRoom = (name, customRules) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject("No socket connection");
      localStorage.setItem("ipl_user_name", name);
      setUserName(name);

      socket.emit("create_room", { hostName: name, rules: customRules }, (response) => {
        if (response.success) {
          setRoomState(response.roomState);
          window.history.pushState({}, "", `?room=${response.roomId}`);
          resolve(response.roomId);
        } else {
          reject(response.error);
        }
      });
    });
  };

  const joinRoom = (code, name) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject("No socket connection");
      localStorage.setItem("ipl_user_name", name);
      setUserName(name);

      socket.emit("join_room", { roomId: code.trim().toUpperCase(), userName: name }, (response) => {
        if (response.success) {
          setRoomState(response.roomState);
          window.history.pushState({}, "", `?room=${response.roomId}`);
          resolve(response.roomId);
        } else {
          reject(response.error);
        }
      });
    });
  };

  const quickMatch = (name) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject("No socket connection");
      localStorage.setItem("ipl_user_name", name);
      setUserName(name);

      socket.emit("quick_match", { userName: name }, (response) => {
        if (response.success) {
          setRoomState(response.roomState);
          window.history.pushState({}, "", `?room=${response.roomId}`);
          resolve(response.roomId);
        } else {
          reject(response.error);
        }
      });
    });
  };

  const selectTeam = (teamId) => {
    if (!socket || !roomState) return;
    socket.emit("select_team", { roomId: roomState.id, teamId });
  };

  const toggleAIBots = (enabled) => {
    if (!socket || !roomState) return;
    socket.emit("toggle_ai_bots", { roomId: roomState.id, enabled });
  };

  const sendChat = (text) => {
    if (!socket || !roomState || !text.trim()) return;
    socket.emit("send_chat", { roomId: roomState.id, text });
  };

  const sendReaction = (emoji) => {
    if (!socket || !roomState) return;
    socket.emit("send_reaction", { roomId: roomState.id, emoji });
  };

  const updateRules = (newRules) => {
    if (!socket || !roomState) return;
    socket.emit("update_rules", { roomId: roomState.id, rules: newRules });
  };

  const addCustomPlayer = (player) => {
    if (!socket || !roomState) return;
    socket.emit("add_custom_player", { roomId: roomState.id, player });
  };

  const startAuction = () => {
    if (!socket || !roomState) return;
    socket.emit("start_auction", { roomId: roomState.id });
  };

  const placeBid = (amount) => {
    if (!socket || !roomState) return;
    socket.emit("place_bid", { roomId: roomState.id, amount });
  };

  const hostForceSell = () => {
    if (!socket || !roomState) return;
    socket.emit("host_force_sell", { roomId: roomState.id });
  };

  const hostMarkUnsold = () => {
    if (!socket || !roomState) return;
    socket.emit("host_mark_unsold", { roomId: roomState.id });
  };

  const hostNextPlayer = () => {
    if (!socket || !roomState) return;
    socket.emit("host_next_player", { roomId: roomState.id });
  };

  const hostTogglePause = () => {
    if (!socket || !roomState) return;
    socket.emit("host_toggle_pause", { roomId: roomState.id });
  };

  const toggleSound = () => {
    const active = sounds.toggleSound();
    setSoundMuted(!active);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        roomState,
        publicRooms,
        userName,
        urlRoomCode,
        currentUser,
        myTeam,
        isHost,
        errorMessage,
        toastMessage,
        soundMuted,
        floatingReactions,
        createRoom,
        joinRoom,
        quickMatch,
        selectTeam,
        toggleAIBots,
        sendChat,
        sendReaction,
        updateRules,
        addCustomPlayer,
        startAuction,
        placeBid,
        hostForceSell,
        hostMarkUnsold,
        hostNextPlayer,
        hostTogglePause,
        toggleSound
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
