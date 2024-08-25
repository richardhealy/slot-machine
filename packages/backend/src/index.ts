import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes } from 'crypto';

// Initialize a Fastify application instance with logging enabled
const app: FastifyInstance = fastify({ logger: true });

// Define an interface to represent a symbol in the slot machine
interface Symbol {
  id: number;
  name: string;
  value: number;
}

// Array of available symbols with their unique IDs, names (emojis), and values
const symbols: Symbol[] = [
  { id: 1, name: '🍒', value: 10 },
  { id: 2, name: '🍋', value: 20 },
  { id: 3, name: '🍊', value: 30 },
  { id: 4, name: '🍇', value: 40 },
  { id: 5, name: '🔔', value: 50 },
  { id: 6, name: '💎', value: 100 },
];

// Function to get a random position (index) for a symbol on the reel
function getRandomPosition(): number {
  // Generate a random 4-byte integer
  const randomInt = randomBytes(4).readUInt32BE(0);
  // Return the remainder of dividing the random integer by the length of the symbols array
  return randomInt % symbols.length;
}

// Function to calculate the win amount based on the positions of the symbols on the payline
function calculateWinAmount(positions: number[], bet: number): number {
  // Map positions to the corresponding symbols
  const symbolsOnPayline = positions.map(position => symbols[position]);
  
  // Check if all symbols on the payline are the same (winning condition)
  if (symbolsOnPayline.every(symbol => symbol.id === symbolsOnPayline[0].id)) {
    // If all symbols are the same, calculate the win amount
    return bet * symbolsOnPayline[0].value;
  }

  // If the symbols are not all the same, return 0 (no win)
  return 0;
}

// Define an interface to represent the body of the spin request
interface SpinBody {
  bet: number;
}

// Define a POST route for the spin action
app.post<{
  Body: SpinBody
}>('/api/spin', async (request: FastifyRequest<{ Body: SpinBody }>, reply: FastifyReply) => {
  const { bet } = request.body; // Extract the bet amount from the request body

  // Validate the bet amount
  if (typeof bet !== 'number' || bet <= 0) {
    return reply.code(400).send({ error: 'Invalid bet amount' }); // Return a 400 error for invalid bets
  }

  // Get random positions for the three symbols on the payline
  const positions = [getRandomPosition(), getRandomPosition(), getRandomPosition()];
  // Calculate the win amount based on the positions and the bet
  const winAmount = calculateWinAmount(positions, bet);

  // Send the positions and win amount as the response
  return reply.send({ positions, winAmount });
});

// Function to start the Fastify server
const start = async () => {
  try {
    // Attempt to start the server on port 3000 and listen on all network interfaces
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000'); // Log a message when the server starts
  } catch (err) {
    // If an error occurs during startup, log the error and exit the process
    app.log.error(err);
    process.exit(1);
  }
};

// Start the server
start();