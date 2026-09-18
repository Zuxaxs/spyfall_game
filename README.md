# Spyfall Game (Multiplayer)

Ein Multiplayer-Spyfall-Spiel mit Angular-Frontend und Node.js/Socket.IO-Backend.

## Aufbau

| Ordner | Beschreibung |
| --- | --- |
| `spyfall-game-client` | Angular 21 Frontend |
| `spyfall-game-server` | Express 5 + Socket.IO Server |

## Voraussetzungen

- Node.js (aktuelle LTS-Version)
- npm

## Installation

```bash
# Server
cd spyfall-game-server
npm install

# Client
cd ../spyfall-game-client
npm install
```

## Starten

```bash
# Terminal 1 – Server
cd spyfall-game-server
npm run dev

# Terminal 2 – Client
cd spyfall-game-client
npm start
```

Der Client läuft anschließend unter `http://localhost:4200`.

## Tech-Stack

- Angular 21, RxJS, FontAwesome
- Express 5, Socket.IO 4
- TypeScript, Vitest, Prettier
