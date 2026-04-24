# Raft Consensus Visualization

> **Real-time interactive dashboard for a distributed Raft consensus cluster.**
> Visualize leader elections, log replication, heartbeat propagation, and fault injection across a five-node cluster -- all animated live via WebSocket.

---

## Table of Contents

- [What Is This?](#what-is-this)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [UI Components](#ui-components)
- [Architecture Overview](#architecture-overview)
- [Scripts](#scripts)

---

## What Is This?

**Raft Consensus Visualization** is a single-page React application built as the companion dashboard for the [Raft Go Backend](https://github.com/Tushar-Jawale/raft-go-backend). It connects to the backend over WebSocket and renders every internal Raft event in real time, making the normally invisible internals of distributed consensus fully observable.

Instead of reading server logs, you get a live command centre to:

- Watch leader elections unfold with animated vote requests and responses
- See heartbeat pulses radiate from the leader to all followers
- Track log entries as they replicate across nodes and commit on majority
- Kill and revive individual nodes to trigger re-elections and log catch-up
- Read and write to a distributed key-value store backed by the Raft log
- Inspect the committed state machine table as entries are applied

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Network Topology** | SVG-based cluster visualization with nodes positioned in a circular layout; color-coded by role (Leader, Follower, Candidate, Dead) |
| **Animated Elections** | Vote request lines, vote response animations, progress bars showing vote tallies, and a victory pulse when a leader is elected |
| **Heartbeat Visualization** | Animated lines from leader to followers and an expanding pulse ring on every heartbeat cycle |
| **Log Replication Feed** | Per-node log entry stream showing append, replication, and commit events in real time |
| **KV Store Operations** | Interactive form to SET, GET, and DELETE key-field-value entries on the distributed store |
| **State Machine Table** | Live table of all committed key-value entries with the node and timestamp of last update |
| **Fault Injection** | Power toggle button on each node to kill or revive it, triggering re-elections and log recovery |
| **Connection Status** | Header indicator showing WebSocket connection state and last heartbeat timestamp |
| **Auto-Reconnect** | WebSocket automatically reconnects on disconnect with a 3-second backoff |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [React 18](https://react.dev/) |
| **Build Tool** | [Vite 5](https://vite.dev/) |
| **Language** | JavaScript (JSX) |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + Vanilla CSS |
| **Real-Time** | Native WebSocket API |
| **Linting** | ESLint with React Hooks + React Refresh plugins |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A running instance of the [Raft Go Backend](https://github.com/Tushar-Jawale/raft-go-backend) (default `localhost:8765`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Tushar-Jawale/raft-frontend.git
cd raft-frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

In development, Vite proxies all API and WebSocket requests (`/kv-store`, `/cluster`, `/health`, `/ws`) to the backend at `localhost:8765`. No additional configuration is needed for local development.

> **Production / Remote Backend:** If the backend runs on a different host, set the `VITE_BACKEND_URL` environment variable before building or starting the dev server.

---

## Project Structure

```
raft-frontend/
├── src/
│   ├── main.jsx                    # React entry point
│   ├── App.jsx                     # Root component, composes all panels
│   ├── App.css                     # App-level layout styles
│   ├── globals.css                 # Global base styles
│   ├── index.css                   # Tailwind directives and overrides
│   │
│   ├── components/                 # UI components
│   │   ├── Header.jsx              # Connection status + title bar
│   │   ├── Header.css
│   │   ├── ElectionStatus.jsx      # Election progress panel with vote bars
│   │   ├── ElectionStatus.css
│   │   ├── KVInputForm.jsx         # SET / GET / DELETE input form
│   │   ├── KVInputForm.css
│   │   ├── NetworkTopology.jsx     # SVG cluster topology with animations
│   │   ├── NetworkTopology.css
│   │   ├── NodeLogs.jsx            # Per-node log entry feed
│   │   ├── NodeLogs.css
│   │   ├── StateMachineTable.jsx   # Committed KV store table
│   │   ├── StateMachineTable.css
│   │   ├── Legend.jsx              # Node state color legend
│   │   └── Legend.css
│   │
│   ├── context/                    # State management
│   │   ├── RaftContext.jsx         # Central React Context (cluster + election + KV state)
│   │   ├── constants.js            # Node colors and coordinate calculations
│   │   ├── useClusterApi.js        # Custom hook for HTTP API operations
│   │   └── handlers/               # WebSocket event handlers
│   │       ├── index.js            # Barrel export
│   │       ├── clusterHandlers.js  # Heartbeat, peer response, node power events
│   │       ├── electionHandlers.js # Vote request, vote response, election result
│   │       └── logHandlers.js      # Log entry, commit, KV store update events
│   │
│   └── assets/                     # Static assets (icons, images)
│
├── public/                         # Public static files
├── index.html                      # HTML entry point
├── vite.config.js                  # Vite config with dev proxy rules
├── tailwind.config.js              # Tailwind theme (custom colors, animations, glows)
├── postcss.config.js               # PostCSS plugins (Tailwind + Autoprefixer)
├── eslint.config.js                # ESLint flat config
└── package.json
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BACKEND_URL` | *(empty -- uses Vite proxy)* | Full URL of the Raft backend (e.g. `https://raft-backend.onrender.com`). Only needed in production or when the backend is not on `localhost:8765`. |

In development, all API paths are proxied by Vite to `http://localhost:8765` automatically. Setting `VITE_BACKEND_URL` is only necessary for production builds or remote deployments.

---

## UI Components

| Component | Description |
|-----------|-------------|
| **Header** | Displays the application title, WebSocket connection indicator (connected/disconnected), and last heartbeat timestamp |
| **ElectionStatus** | Conditionally rendered during elections; shows each candidate's vote tally as an animated progress bar with voter names |
| **KVInputForm** | Split-button form for SET, GET, and DELETE operations against the distributed key-value store; disables when disconnected |
| **NetworkTopology** | SVG-based circular layout of all cluster nodes with Framer Motion animations for heartbeats, vote requests/responses, and election victory pulses; includes per-node power toggle buttons |
| **NodeLogs** | Scrollable feed of real-time Raft events per node (log appends, commits, state changes) |
| **StateMachineTable** | Table displaying all committed key-value entries with their source node and last update timestamp |
| **Legend** | Color-coded legend explaining node states: Leader (orange), Follower (blue), Candidate (purple), Dead (grey) |

---

## Architecture Overview

The application follows a **Context-driven architecture** with centralized state and modular event handling.

```
+-----------------------------------+
|        App (Root Component)       |  -- Composes all panels
+-----------------------------------+
|        RaftContext (Provider)     |  -- Central state + WebSocket connection
+-----------------------------------+
|    WebSocket Event Handlers       |  -- clusterHandlers, electionHandlers, logHandlers
+-----------------------------------+
|    useClusterApi (Custom Hook)    |  -- HTTP API calls (KV CRUD, node toggle)
+-----------------------------------+
|        UI Components              |  -- Header, Topology, Logs, KV Form, Table
+-----------------------------------+
```

### Key Patterns

- **Single Context Provider** -- All cluster, election, and KV state lives in `RaftContext`, avoiding prop drilling across seven components.
- **Handler Factories** -- WebSocket event handlers are split into three factory modules (`clusterHandlers`, `electionHandlers`, `logHandlers`) that receive state setters via dependency injection.
- **Message Router** -- A single `switch` statement in `RaftContext` routes incoming WebSocket messages to the appropriate handler by `type`.
- **Custom API Hook** -- `useClusterApi` encapsulates all HTTP interactions (KV operations and node power toggling), keeping side effects out of the context provider.
- **Vite Dev Proxy** -- In development, Vite proxies `/kv-store`, `/cluster`, `/health`, and `/ws` to the backend, eliminating CORS issues without middleware.

---

## Scripts

```bash
# Development server (with hot reload + API proxy)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint the codebase
npm run lint
```

---

