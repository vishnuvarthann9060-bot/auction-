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
import { Trophy, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AuctionApp() {
  const { roomState, errorMessage, toastMessage, myTeam } = useSocket();

  const [squadModalOpen, setSquadModalOpen] = useState(false);
  const [selectedSquadTeamId, setSelectedSquadTeamId] = useState("csk");
  const [customPlayerModalOpen, setCustomPlayerModalOpen] = useState(false);

  const handleOpenSquad = (team) => {
    if (team?.id) {
      setSelectedSquadTeamId(team.id);
    } else if (myTeam?.id) {
      setSelectedSquadTeamId(myTeam.id);
    }
    setSquadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative selection:bg-amber-500 selection:text-black">
      
      {/* Stadium Ambient Lights & Radial Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-amber-500/10 via-blue-600/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-purple-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-emerald-600/10 blur-3xl rounded-full" />
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
              className="px-4 py-3 rounded-2xl bg-red-500/90 text-white text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md border border-red-400"
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
              className="px-4 py-3 rounded-2xl bg-amber-500 text-slate-950 text-xs font-black shadow-2xl flex items-center gap-2 backdrop-blur-md"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {!roomState || roomState.status === "LOBBY" ? (
          <Lobby onOpenCustomPlayer={() => setCustomPlayerModalOpen(true)} />
        ) : roomState.status === "ENDED" ? (
          /* AUCTION COMPLETE RECAP */
          <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center max-w-3xl mx-auto my-10 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Tournament Complete
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-3">
                IPL Mega Auction Concluded!
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
                All players have gone under the hammer! All 10 franchises have assembled their official rosters.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleOpenSquad()}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition cursor-pointer"
              >
                Inspect All Franchise Squads
              </button>
            </div>

            <TeamsOverview onSelectTeamDetail={handleOpenSquad} />
          </div>
        ) : (
          /* ACTIVE AUCTION ARENA */
          <div className="space-y-5">
            <HostControls onOpenCustomPlayer={() => setCustomPlayerModalOpen(true)} />
            <AuctionStage />
            <BiddingControls />
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
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-white/5 relative z-10">
        100% Free Open Platform • IPL Mega Auction Live Arena • No Sign-up Required
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
