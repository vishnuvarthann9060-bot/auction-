# 🏏 IPL Mega Auction - 100% Free Public Web Platform

An open, community-first cricket franchise auction web platform where anyone across the internet can jump in, match with random cricket fans or friends, banter in real-time, and experience a broadcast-grade auction with animations and sound effects.

Everything is built to be **100% free of cost**, with **zero sign-up**, **no paywalls**, and **no hidden fees**.

![IPL Mega Auction](https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

- **⚡ Instant Quick Match & Public Arenas**: One-click matchmaking into live public waiting rooms, or browse all active public auctions.
- **🤖 Smart AI Franchise Bots**: Solo players or small groups can auto-fill unowned franchises with intelligent AI bidders that actively evaluate ratings and team purse.
- **💬 Real-Time Live Chat & Reactions**: Banter with managers in the live war room and send floating celebration emoji bursts (🔥, 🔨, 💸, 👑, 😱).
- **🎨 Broadcast-Grade Stadium UI**: 3D player cards with IPL career stats, circular animated countdown ring, and wooden gavel drop animations.
- **🔊 Procedural Web Audio API Sound Engine**: Authentic wooden gavel strikes, ticking clocks, outbid alarms, and victory fanfares synthesized in browser with zero lag.
- **🏏 Realistic IPL Roster**: 80+ pre-loaded marquee stars (Kohli, Rohit, Dhoni, Bumrah, Starc, Head, Cummins, etc.) + custom player injector.
- **🔗 1-Click Shareable Direct Links**: Share `/?room=IPL-XXXX` links that auto-load the room immediately for friends.
- **🛡️ 100% Free Forever**: Zero sign-up, zero logins, and no paywalls.

---

## 🚀 1-Click Free Deployment Guide (Single Platform: Render)

You do **NOT** need two platforms (no Vercel + Render split needed). The application runs as a **single unified full-stack service** on Render for free:

1. Sign up for free at [**Render.com**](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/vishnuvarthann9060-bot/auction-`.
4. Configure these simple settings:
   - **Name**: `ipl-auction` (or any name you choose)
   - **Region**: Closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Click **Create Web Service**.

That's it! Render will automatically build the React frontend, start the Express + Socket.io server, and give you a live free URL (e.g. `https://ipl-auction.onrender.com`).

---

## 💻 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Run Locally
```bash
# Install all dependencies and run concurrently:
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend WebSocket Server**: `http://localhost:4000`

---

## 📁 Project Architecture

```
ipl-auction/
├── package.json              # Unified build & start orchestrator
├── .gitignore
├── server/                   # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── index.js          # Server entry, static SPA routing & Socket events
│   │   ├── roomManager.js    # Rooms, AI bots, chat, state machine
│   │   ├── auctionEngine.js  # Bid validation, purse calculations
│   │   └── data/
│   │       └── players.js    # 80+ IPL players with stats & ratings
│   └── package.json
└── client/                   # Vite + React 18 + Tailwind CSS + Framer Motion
    ├── src/
    │   ├── App.jsx
    │   ├── context/SocketContext.jsx # Dynamic single-origin socket state
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
