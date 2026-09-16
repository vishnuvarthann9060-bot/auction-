import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { X, Sparkles, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CustomPlayerModal({ isOpen, onClose }) {
  const { addCustomPlayer } = useSocket();

  const [name, setName] = useState("");
  const [role, setRole] = useState("All-Rounder");
  const [country, setCountry] = useState("India");
  const [isOverseas, setIsOverseas] = useState(false);
  const [basePriceCr, setBasePriceCr] = useState("2.0");
  const [rating, setRating] = useState(90);
  const [matches, setMatches] = useState(25);
  const [runs, setRuns] = useState(450);
  const [wickets, setWickets] = useState(15);
  const [imageUrl, setImageUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const basePriceNum = Math.round(parseFloat(basePriceCr) * 10000000);

    addCustomPlayer({
      name: name.trim(),
      role,
      country: country.trim() || "India",
      isOverseas,
      basePrice: basePriceNum,
      rating: Number(rating),
      image: imageUrl.trim() || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80",
      stats: {
        matches: Number(matches),
        runs: Number(runs),
        wickets: Number(wickets)
      }
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl relative z-10"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Add Custom Player to Pool</h3>
                <p className="text-xs text-slate-400">Inject yourself, your friends, or iconic stars into the auction</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                Player Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Dravid / Your Friend's Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Playing Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Batter">Batter</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Base Price (Crores)
                </label>
                <select
                  value={basePriceCr}
                  onChange={(e) => setBasePriceCr(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="0.2">₹20 Lakhs (0.2 Cr)</option>
                  <option value="0.5">₹50 Lakhs (0.5 Cr)</option>
                  <option value="1.0">₹1.00 Crore</option>
                  <option value="1.5">₹1.50 Crore</option>
                  <option value="2.0">₹2.00 Crores</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. India / Australia"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Overall Rating (OVR)
                </label>
                <input
                  type="number"
                  min="60"
                  max="99"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="isOverseas"
                checked={isOverseas}
                onChange={(e) => setIsOverseas(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <label htmlFor="isOverseas" className="text-slate-300 font-medium">
                Counts as an Overseas (Foreign) Player
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Matches</label>
                <input
                  type="number"
                  value={matches}
                  onChange={(e) => setMatches(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Runs</label>
                <input
                  type="number"
                  value={runs}
                  onChange={(e) => setRuns(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1">Wickets</label>
                <input
                  type="number"
                  value={wickets}
                  onChange={(e) => setWickets(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Custom Photo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://... (leave empty for default player silhouette)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              Add to Auction Roster ✨
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
