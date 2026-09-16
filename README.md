# 🏏 IPL Mega Auction - Real-Time Multiplayer Web Platform

An open, 100% free cricket franchise auction game built for real-time multiplayer. Play with friends using room PINs, or match with random cricket fans online via **Instant Quick Match**!

![IPL Mega Auction](https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

- **🌐 Public Arenas & Instant Quick Match**: One-click matchmaking into live public waiting rooms, or create private rooms for friends.
- **🤖 Smart AI Franchise Bots**: Solo players or small groups can auto-fill unowned franchises with intelligent AI bidders.
- **💬 Real-Time Live Chat & Reactions**: Banter with managers in the live war room and send floating celebration emoji bursts (🔥, 🔨, 💸, 👑, 😱).
- **🎨 Broadcast-Grade Stadium UI**: 3D player cards with IPL career stats, circular animated countdown ring, and wooden gavel drop animations.
- **🔊 Procedural Web Audio API Sound Engine**: Authentic wooden gavel strikes, ticking clocks, outbid alarms, and victory fanfares synthesized in browser with zero lag.
- **🏏 Realistic IPL Roster**: 80+ pre-loaded marquee stars (Kohli, Rohit, Dhoni, Bumrah, Starc, Head, Cummins, etc.) + custom player injector.
- **🛡️ 100% Free Forever**: Zero sign-up, zero logins, and no paywalls.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### 1. Installation
Clone the repository and install all dependencies:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Run the Application
From the root directory:
```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend WebSocket Server**: `http://localhost:4000`

---

## 📁 Project Architecture

```
ipl-auction/
├── package.json              # Root orchestrator
├── .gitignore
├── server/                   # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── index.js          # Server entry & Socket events
│   │   ├── roomManager.js    # Rooms, AI bots, chat, state machine
│   │   ├── auctionEngine.js  # Bid validation, purse calculations
│   │   └── data/
│   │       └── players.js    # 80+ IPL players with stats & ratings
│   └── package.json
└── client/                   # Vite + React 18 + Tailwind CSS + Framer Motion
    ├── src/
    │   ├── App.jsx
    │   ├── context/SocketContext.jsx # Real-time socket state
    │   ├── components/
    │   │   ├── Navbar.jsx            # Room PIN & shareable invite link
    │   │   ├── Lobby.jsx             # Public room browser, quick match, franchise selector
    │   │   ├── AuctionStage.jsx      # 3D player card, timer ring, gavel
    │   │   ├── BiddingControls.jsx   # Dynamic bid paddle & budget validator
    │   │   ├── TeamsOverview.jsx     # Franchise purse balances & rosters
    │   │   ├── SquadModal.jsx        # Deep dive team roster inspector
    │   │   ├── HostControls.jsx      # Pause, hammer sold, unsold, skip
    │   │   ├── LiveChat.jsx          # Real-time chat & floating reaction burst
    │   │   ├── SoldCelebration.jsx   # Confetti & victory fanfare
    │   │   └── CustomPlayerModal.jsx # Inject custom players
    │   ├── data/teams.js             # 10 official IPL franchises
    │   └── utils/sound.js            # Web Audio API sound synthesizer
    └── package.json
```

---

## 🤝 License
MIT License - Free to use, modify, and distribute.
