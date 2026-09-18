import { io } from "socket.io-client";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import { RoomManager } from "./src/roomManager.js";

console.log("\n=======================================================");
console.log("🛡️ TESTING GOOGLE SIGN-IN & RECONNECTION PROGRESS PRESERVATION");
console.log("=======================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${details ? "- " + details : ""}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runLocalSuite() {
  // Start temporary local test server on port 4444
  const app = express();
  app.use(express.json());

  // User Profile store
  const userProfiles = new Map();
  function getOrCreateUser(userId, data = {}) {
    let user = userProfiles.get(userId);
    if (!user) {
      user = {
        id: userId,
        name: data.name || "Franchise Manager",
        email: data.email || "",
        avatar: data.avatar || "",
        stats: { auctionsJoined: 0, tournamentsWon: 0, playersBought: 0, totalPurseSpent: 0 },
        savedSquads: []
      };
      userProfiles.set(userId, user);
    }
    return user;
  }

  app.get("/api/user/profile/:userId", (req, res) => {
    res.json({ success: true, user: userProfiles.get(req.params.userId) || null });
  });

  app.post("/api/user/profile", (req, res) => {
    const user = getOrCreateUser(req.body.userId, req.body);
    res.json({ success: true, user });
  });

  app.post("/api/user/save-squad", (req, res) => {
    const user = getOrCreateUser(req.body.userId);
    const item = { id: `squad-${Date.now()}`, ...req.body.squadData, savedAt: Date.now() };
    user.savedSquads.unshift(item);
    res.json({ success: true, squad: item });
  });

  app.post("/api/user/stats", (req, res) => {
    const user = getOrCreateUser(req.body.userId);
    if (req.body.deltaStats?.tournamentsWon) user.stats.tournamentsWon += req.body.deltaStats.tournamentsWon;
    res.json({ success: true, stats: user.stats });
  });

  const httpServer = http.createServer(app);
  const ioServer = new Server(httpServer, { cors: { origin: "*" } });
  const roomManager = new RoomManager(ioServer);

  ioServer.on("connection", (socket) => {
    socket.on("create_room", ({ hostName, rules, userAuth }, cb) => {
      const room = roomManager.createRoom(socket, hostName, rules, userAuth);
      if (cb) cb({ success: true, roomId: room.id, roomState: roomManager.getPublicRoomState(room) });
    });

    socket.on("select_team", ({ roomId, teamId }) => {
      roomManager.selectTeam(socket, roomId, teamId);
    });

    socket.on("reconnect_user", ({ roomId, userId, userName, userAuth }, cb) => {
      try {
        const room = roomManager.reconnectUser(socket, roomId, userId, userName, userAuth);
        if (cb) cb({ success: true, roomId: room.id, roomState: roomManager.getPublicRoomState(room) });
      } catch (err) {
        if (cb) cb({ success: false, error: err.message });
      }
    });

    socket.on("disconnect", () => {
      roomManager.handleDisconnect(socket);
    });
  });

  await new Promise((resolve) => httpServer.listen(4444, resolve));
  console.log("Local test harness running on port 4444");

  try {
    // 1. Test Profile REST API
    console.log("\n📡 [PHASE 1] Testing REST Endpoints for Cloud Progress Sync...");
    const profileRes = await fetch("http://localhost:4444/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "google_1092837465",
        name: "Virat Kohli",
        email: "virat@rcb.cricket",
        avatar: "https://example.com/virat.jpg"
      })
    });
    const profileData = await profileRes.json();
    assert(profileData.success === true, "Google Profile creation succeeds");
    assert(profileData.user.name === "Virat Kohli", "Google Profile name saved");

    // 2. Test Squad Save REST API
    const squadRes = await fetch("http://localhost:4444/api/user/save-squad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "google_1092837465",
        squadData: {
          teamId: "rcb",
          teamName: "Royal Challengers Bengaluru",
          shortName: "RCB",
          spent: 980000000,
          squad: [{ name: "Virat Kohli", role: "Batter", soldPrice: 210000000 }]
        }
      })
    });
    const squadData = await squadRes.json();
    assert(squadData.success === true, "Championship squad saved to Google profile");
    assert(squadData.squad.shortName === "RCB", "Saved squad metadata matches");

    // 3. Test Active Auction Disconnect & Reconnection
    console.log("\n🔌 [PHASE 2] Testing Browser Reload / Socket Reconnection Without Losing Team...");
    const client1 = io("http://localhost:4444", { transports: ["websocket"] });
    await new Promise((resolve) => client1.on("connect", resolve));

    let createdRoomId = null;
    let initialRoomState = null;

    // Create room with Google auth credentials
    await new Promise((resolve) => {
      client1.emit(
        "create_room",
        {
          hostName: "King Kohli",
          rules: { timerSeconds: 15 },
          userAuth: {
            userId: "google_1092837465",
            userEmail: "virat@rcb.cricket"
          }
        },
        (res) => {
          createdRoomId = res.roomId;
          initialRoomState = res.roomState;
          resolve();
        }
      );
    });

    assert(createdRoomId && createdRoomId.startsWith("IPL-"), `Room created with PIN ${createdRoomId}`);

    // Select RCB
    client1.emit("select_team", { roomId: createdRoomId, teamId: "rcb" });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Disconnect client 1 (Simulating page reload / browser refresh)
    console.log("  👉 Simulating browser page reload (socket disconnect)...");
    client1.disconnect();
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Connect a new socket (representing the newly loaded browser page)
    console.log("  👉 New socket connected after page reload, calling reconnect_user...");
    const client2 = io("http://localhost:4444", { transports: ["websocket"] });
    await new Promise((resolve) => client2.on("connect", resolve));

    let reconnectedState = null;
    await new Promise((resolve) => {
      client2.emit(
        "reconnect_user",
        {
          roomId: createdRoomId,
          userId: "google_1092837465",
          userName: "King Kohli",
          userAuth: { userId: "google_1092837465", userEmail: "virat@rcb.cricket" }
        },
        (res) => {
          assert(res.success === true, "reconnect_user responded with success: true");
          reconnectedState = res.roomState;
          resolve();
        }
      );
    });

    // Verify team ownership is restored!
    const rcbTeam = reconnectedState.teams.find((t) => t.id === "rcb");
    assert(rcbTeam.ownerId === client2.id, "RCB franchise ownership seamlessly rebound to new socket ID");
    assert(rcbTeam.ownerUserId === "google_1092837465", "RCB franchise maintains persistent Google userId");
    assert(reconnectedState.hostId === client2.id, "Host status retained across page reload");
    assert(reconnectedState.users.length === 1, "User list contains exactly 1 user (no duplicate ghost users)");

    client2.disconnect();

    console.log(`\n=======================================================`);
    console.log(`🎉 ALL ${passedTests}/${totalTests} PROGRESS PRESERVATION TESTS PASSED!`);
    console.log(`=======================================================\n`);
  } finally {
    httpServer.close();
  }
}

runLocalSuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
