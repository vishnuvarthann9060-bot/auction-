import React, { useState } from "react";
import { useSocket, SocketProvider } from "./context/SocketContext";
import { Navbar } from "./components/Navbar";
import { Lobby } from "./components/Lobby";
import { AuctionStage } from "./components/AuctionStage";
import { BiddingControls } from "./components/BiddingControls";
import { TeamsOverview } from "./components/TeamsOverview";
import { HostControls } from "./components/HostControls";
import { SquadModal } from "./components/SquadModal";
import { SoldCelebration } from "./components/SoldCelebration";
import { CustomPlayerModal } from "./components/CustomPlayerModal";
import { LiveChat } from "./components/LiveChat";
import { TEAMS_DATA } from "./data/teams";
import { Trophy, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AuctionApp() {
  const { roomState, errorMessage, toastMessage, myTeam } = useSocket();

  const [squadModalOpen, setSquadModalOpen] = useState(false);
  const [selectedSquadTeamId, setSelectedSquadTeamId] = useState("csk");
  const [customPlayerModalOpen, setCustomPlayerModalOpen] = useState(false);

  // Dynamic stadium arena glow based on active leading bidder
  const activeBidderTeamId = roomState?.currentAuction?.highestBidderTeamId;
  const activeBidderMeta = activeBidderTeamId ? TEAMS_DATA[activeBidderTeamId] : null;
  const activeGlowHex = activeBidderMeta?.glowHex || (myTeam ? TEAMS_DATA[myTeam.id]?.glowHex : "#F59E0B");

  const handleOpenSquad = (team) => {
    if (team?.id) {
      setSelectedSquadTeamId(team.id);
    } else if (myTeam?.id) {
      setSelectedSquadTeamId(myTeam.id);
    }
    setSquadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f3f4f6] font-sans flex flex-col relative selection:bg-[#6366f1] selection:text-white">
      
      {/* Stadium Ambient Lights, Dynamic Franchise Glows & Floodlight Beams */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle Sweeping Stadium Floodlight Beams */}
        <div 
          className="absolute -top-32 -left-20 w-[350px] h-[650px] bg-gradient-to-b from-[#6366f1]/10 via-[#a855f7]/5 to-transparent blur-3xl animate-floodlight-left pointer-events-none"
        />
        <div 
          className="absolute -top-32 -right-20 w-[350px] h-[650px] bg-gradient-to-b from-[#6366f1]/10 via-blue-500/5 to-transparent blur-3xl animate-floodlight-right pointer-events-none"
        />

        {/* Dynamic Center Stage Spotlight (Pulsing in Franchise Colors) */}
        <motion.div 
          animate={{ 
            backgroundColor: activeGlowHex,
            opacity: [0.08, 0.14, 0.08],
            scale: [1, 1.04, 1]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[550px] blur-[120px] rounded-full transition-colors duration-700"
        />

        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#6366f1]/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-[#a855f7]/10 blur-[100px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <Navbar onOpenSquads={() => handleOpenSquad()} />

      {/* Floating Notifications */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-4 py-3 rounded-2xl bg-red-500/90 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md border border-red-400"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-4 py-3 rounded-2xl bg-[#6366f1] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md border border-[#818cf8]"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 px-3 sm:px-6 lg:px-8 py-3 sm:py-6 max-w-[1600px] mx-auto w-full">
        {!roomState || roomState.status === "LOBBY" ? (
          <Lobby onOpenCustomPlayer={() => setCustomPlayerModalOpen(true)} />
        ) : roomState.status === "ENDED" ? (
          /* AUCTION COMPLETE RECAP */
          <div className="glass-panel p-6 sm:p-12 rounded-3xl text-center max-w-3xl mx-auto my-6 sm:my-10 space-y-5 border border-[#27272a] bg-[#121212]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] text-white flex items-center justify-center mx-auto shadow-2xl shadow-[#6366f1]/30">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#818cf8] bg-[#6366f1]/15 px-3 py-1 rounded-full border border-[#6366f1]/30">
                Tournament Complete
              </span>
              <h2 className="text-2xl sm:text-5xl font-heading font-bold text-white mt-3 tracking-[-0.03em]">
                IPL Mega Auction Concluded!
              </h2>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 max-w-lg mx-auto leading-relaxed">
                All players have gone under the hammer! All 10 franchises have assembled their official rosters.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleOpenSquad()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-bold text-sm tracking-tight shadow-lg shadow-[#6366f1]/25 transition cursor-pointer"
              >
                Inspect All Franchise Squads
              </button>
            </div>

            <TeamsOverview onSelectTeamDetail={handleOpenSquad} />
          </div>
        ) : (
          /* ACTIVE AUCTION ARENA */
          <div className="space-y-3 sm:space-y-4">
            <HostControls onOpenCustomPlayer={() => setCustomPlayerModalOpen(true)} />
            <AuctionStage />
            <TeamsOverview onSelectTeamDetail={handleOpenSquad} />
          </div>
        )}
      </main>

      {/* Modals & Full-Screen Overlays */}
      <SquadModal
        isOpen={squadModalOpen}
        onClose={() => setSquadModalOpen(false)}
        initialTeamId={selectedSquadTeamId}
      />

      <CustomPlayerModal
        isOpen={customPlayerModalOpen}
        onClose={() => setCustomPlayerModalOpen(false)}
      />

      <SoldCelebration />

      {/* In-Game Live Chat & Floating Reactions */}
      <LiveChat />

      {/* Footer */}
      <footer className="w-full py-6 sm:py-8 text-center text-xs sm:text-sm text-[#9ca3af] border-t border-[#27272a] relative z-10 bg-[#050505]">
        100% Free Open Platform • IPL Mega Auction Live Arena • Built for Indian Cricket Fans
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <AuctionApp />
    </SocketProvider>
  );
}
