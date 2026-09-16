import { io } from "socket.io-client";

console.log("🌐 Testing Public Web Platform Features...");

const socket1 = io("http://localhost:4000");
let socket2 = null;
let roomId = null;

socket1.on("connect", () => {
  console.log("✅ Socket 1 (Host) connected");

  socket1.emit("create_room", { 
    hostName: "PublicHost", 
    rules: { isPublic: true, timerSeconds: 5 } 
  }, async (res) => {
    if (!res.success) {
      console.error("❌ Failed to create public room:", res.error);
      process.exit(1);
    }
    roomId = res.roomId;
    console.log(`✅ Public Room Created: ${roomId}`);

    // Check REST API
    const response = await fetch("http://localhost:4000/api/public-rooms");
    const data = await response.json();
    console.log(`✅ /api/public-rooms returned ${data.rooms.length} room(s)`);

    // Host selects CSK
    socket1.emit("select_team", { roomId, teamId: "csk" });

    // Host enables AI Bots
    socket1.emit("toggle_ai_bots", { roomId, enabled: true });
    console.log("🤖 Host enabled AI Franchise Bots");

    // Socket 2 performs Quick Match
    socket2 = io("http://localhost:4000");
    socket2.on("connect", () => {
      console.log("✅ Socket 2 (Random Stranger) connected");

      socket2.emit("quick_match", { userName: "RandomGamer99" }, (matchRes) => {
        if (!matchRes.success) {
          console.error("❌ Quick match failed:", matchRes.error);
          process.exit(1);
        }
        console.log(`✅ Quick Match matched user into Room ${matchRes.roomId}`);

        // Socket 2 selects MI
        socket2.emit("select_team", { roomId, teamId: "mi" });

        // Chat test
        socket2.emit("send_chat", { roomId, text: "Let's play! Good luck all!" });
        socket2.emit("send_reaction", { roomId, emoji: "🔥" });
      });
    });

    socket1.on("new_chat_message", (chat) => {
      console.log(`💬 Chat received from [${chat.teamShortName || 'Anon'}] ${chat.sender}: "${chat.text}"`);

      // Start auction once chat verified
      setTimeout(() => {
        console.log("🏁 Starting auction with AI bots...");
        socket1.emit("start_auction", { roomId });
      }, 500);
    });

    socket1.on("reaction_burst", (reaction) => {
      console.log(`✨ Reaction burst received: ${reaction.emoji} by ${reaction.sender}`);
    });

    socket1.on("player_up_for_bid", ({ player }) => {
      console.log(`🏏 Auctioning: ${player.name}`);
    });

    socket1.on("new_bid_placed", ({ bid }) => {
      console.log(`💰 Bid placed by ${bid.teamShortName} (${bid.bidderName}): ₹${bid.amount / 10000000} Cr`);

      setTimeout(() => {
        console.log("🎉 ALL PUBLIC PLATFORM TESTS SUCCEEDED!");
        socket1.disconnect();
        socket2.disconnect();
        process.exit(0);
      }, 1500);
    });
  });
});
