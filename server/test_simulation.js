import { io } from "socket.io-client";

console.log("🚀 Starting End-to-End IPL Auction Simulation Test...");

const socket1 = io("http://localhost:4000");
let socket2 = null;
let roomId = null;

socket1.on("connect", () => {
  console.log("✅ Socket 1 (Host) connected:", socket1.id);

  socket1.emit("create_room", { hostName: "Thala Dhoni", rules: { timerSeconds: 5, totalPurse: 1000000000 } }, (res) => {
    if (!res.success) {
      console.error("❌ Room creation failed:", res.error);
      process.exit(1);
    }
    roomId = res.roomId;
    console.log(`✅ Room Created successfully: ${roomId}`);

    // Host selects CSK
    socket1.emit("select_team", { roomId, teamId: "csk" });

    // Connect Player 2 (Rohit)
    socket2 = io("http://localhost:4000");
    socket2.on("connect", () => {
      console.log("✅ Socket 2 (Player 2) connected:", socket2.id);

      socket2.emit("join_room", { roomId, userName: "Hitman Rohit" }, (joinRes) => {
        if (!joinRes.success) {
          console.error("❌ Player 2 join failed:", joinRes.error);
          process.exit(1);
        }
        console.log(`✅ Player 2 joined room ${roomId}`);

        // Player 2 selects MI
        socket2.emit("select_team", { roomId, teamId: "mi" });

        // Host starts auction
        setTimeout(() => {
          console.log("🏁 Host starting auction...");
          socket1.emit("start_auction", { roomId });
        }, 500);
      });
    });

    socket2.on("player_up_for_bid", ({ player }) => {
      console.log(`🏏 Player up for bidding: ${player.name} (Base Price: ₹${player.basePrice / 10000000} Cr)`);
      
      // Socket 1 (CSK) places opening bid
      setTimeout(() => {
        console.log("💰 CSK placing opening bid of ₹2.0 Cr...");
        socket1.emit("place_bid", { roomId, amount: 20000000 });
      }, 500);
    });

    socket1.on("new_bid_placed", ({ bid, bidOptions }) => {
      console.log(`🔔 New bid placed by ${bid.teamShortName} (${bid.bidderName}): ₹${bid.amount / 10000000} Cr`);

      // If CSK just bid ₹2.0 Cr, MI counters with ₹2.25 Cr or next option
      if (bid.teamShortName === "CSK" && bid.amount === 20000000) {
        setTimeout(() => {
          const counterBid = bidOptions[0];
          console.log(`🔥 MI countering with ₹${counterBid / 10000000} Cr...`);
          socket2.emit("place_bid", { roomId, amount: counterBid });
        }, 500);
      } else if (bid.teamShortName === "MI") {
        // CSK raises once more to win
        setTimeout(() => {
          const winningBid = bidOptions[0];
          console.log(`👑 CSK raising bid to ₹${winningBid / 10000000} Cr...`);
          socket1.emit("place_bid", { roomId, amount: winningBid });
        }, 500);
      }
    });

    socket1.on("player_sold", (soldRecord) => {
      console.log(`🎉 SOLD RECORD RECEIVED!`);
      console.log(`   Player: ${soldRecord.player.name}`);
      console.log(`   Winning Franchise: ${soldRecord.teamName} (${soldRecord.teamShortName})`);
      console.log(`   Winning Bid: ₹${soldRecord.amount / 10000000} Cr`);

      setTimeout(() => {
        console.log("🎯 ALL TESTS PASSED! Simulation completed cleanly.");
        socket1.disconnect();
        socket2.disconnect();
        process.exit(0);
      }, 1000);
    });
  });
});
