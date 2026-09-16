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
