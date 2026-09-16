import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { RoomManager } from "./roomManager.js";

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

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Get live public rooms
  socket.on("get_public_rooms", (callback) => {
    if (callback) {
      callback({ rooms: roomManager.getPublicRooms() });
    }
  });

  // Quick match / Instant play
  socket.on("quick_match", ({ userName }, callback) => {
    try {
      const room = roomManager.quickMatch(socket, userName);
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
  socket.on("create_room", ({ hostName, rules }, callback) => {
    try {
      const room = roomManager.createRoom(socket, hostName, rules);
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
  socket.on("join_room", ({ roomId, userName }, callback) => {
    try {
      const room = roomManager.joinRoom(socket, roomId, userName);
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

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`⚡ IPL Auction Server running on port ${PORT}`);
});
