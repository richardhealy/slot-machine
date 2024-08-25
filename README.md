# Slot Machine Game

A simple web-based slot machine game built with React, Vite, and TypeScript. Players can spin the reels, place bets, and win virtual currency. The game includes smooth reel animations, randomized symbols, and a basic betting system.

## Features

- **Spin Reels**: Click the "Spin" button to spin the reels.
- **Randomized Symbols**: The symbols on the reels are randomly generated, with the winning symbol appearing in the second row.
- **Betting System**: Players can place bets and win or lose virtual currency based on the outcome of the spin.
- **Smooth Animations**: The reels animate smoothly, with the winning symbol appearing in the correct position after the spin.

## Technologies Used

- **React**: Frontend framework for building the UI components.
- **TypeScript**: For type safety and better development experience.
- **Vite**: A fast build tool and development server.
- **pnpm**: Fast, disk space-efficient package manager.
- **CSS**: For styling the components and creating smooth animations.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine.
- **pnpm**: Install pnpm if you don't have it:

```
npm install -g pnpm
```

## Installation

### Clone the repository:

```
git clone https://github.com/your-username/slot-machine.git
cd slot-machine
pnpm install
```

### Run the development server:

```
pnpm dev
```

Open the game in your browser: Navigate to http://localhost:5173 to see the slot machine in action. (Note: Vite typically uses port 5173.)

### API

The game expects a backend API endpoint at /api/spin that accepts a POST request with the following payload:

```
{
  "bet": number
}
```

The API should respond with the following JSON structure:

```
{
  "positions": [0, 2, 4], // Array of winning symbol positions for each reel
  "winAmount": number // Amount the player wins
}
```
