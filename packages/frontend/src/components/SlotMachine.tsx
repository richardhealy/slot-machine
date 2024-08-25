import React, { useState, useRef, useEffect } from 'react';
import './SlotMachine.css';

// Interface representing a symbol on the slot machine reel
interface Symbol {
  id: number;
  name: string;
  value: number;
}

// Array of available symbols with unique IDs, names (emojis), and values
const symbols: Symbol[] = [
  { id: 1, name: '🍒', value: 10 },
  { id: 2, name: '🍋', value: 20 },
  { id: 3, name: '🍊', value: 30 },
  { id: 4, name: '🍇', value: 40 },
  { id: 5, name: '🔔', value: 50 },
  { id: 6, name: '💎', value: 100 },
];

// Constants defining the appearance and behavior of the slot machine
const SYMBOL_HEIGHT = 100; // Height of each symbol in pixels
const VISIBLE_SYMBOLS = 3; // Number of symbols visible on the reel
const REEL_LENGTH = 100; // Total number of symbols in each reel

// Main SlotMachine component
const SlotMachine: React.FC = () => {
  // State variables
  const [spinning, setSpinning] = useState(false); // Whether the machine is currently spinning
  const [balance, setBalance] = useState(1000); // Player's balance
  const [bet, setBet] = useState(10); // Player's current bet
  const [result, setResult] = useState(''); // Result message displayed after spin
  const [reels, setReels] = useState<Symbol[][]>([]); // Array of symbols for each reel

  // Refs for the reels to control their animations
  const reelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  // useEffect hook to initialize the reels with random symbols when the component mounts
  useEffect(() => {
    setReels(Array(3).fill(null).map(() => generateReelSymbols()));
  }, []);

  // Function to generate an array of random symbols for a reel
  const generateReelSymbols = (): Symbol[] => {
    return Array(REEL_LENGTH).fill(null).map(() => symbols[Math.floor(Math.random() * symbols.length)]);
  };

  // Function to handle the spin action
  const spin = async () => {
    // Prevent spin if balance is insufficient or the machine is already spinning
    if (balance < bet || spinning) {
      return;
    }

    // Set spinning state to true and deduct the bet from the balance
    setSpinning(true);
    setBalance(prevBalance => prevBalance - bet);
    setResult('Spinning...'); // Set result message to indicate spinning

    try {
      // Make an API request to get the spin results
      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet }),
      });

      if (!response.ok) {
        throw new Error('Spin request failed');
      }

      const data = await response.json();

      // Update the reels with the winning symbols and simulate random symbols for the other rows
      const newReels = reels.map((reel, index) => {
        const newReel = [...reel];
        newReel[1] = symbols[data.positions[index]]; // Set the winning symbol at the second row
        newReel[0] = symbols[Math.floor(Math.random() * symbols.length)]; // Simulate random symbol in the first row
        newReel[2] = symbols[Math.floor(Math.random() * symbols.length)]; // Simulate random symbol in the third row
        return newReel;
      });
      setReels(newReels);

      // Animate the reels
      const spinPromises = reelRefs.current.map((reel, index) => 
        animateReel(reel, 2000 + index * 500)
      );

      // Wait for all reels to finish spinning
      await Promise.all(spinPromises);

      // Update balance with the winning amount and display the result
      setBalance(prevBalance => prevBalance + data.winAmount);
      setResult(`You won ${data.winAmount}!`);
    } catch (error) {
      // Handle any errors during the spin
      console.error('Error:', error);
      setResult('An error occurred. Please try again.');
    } finally {
      // Reset spinning state
      setSpinning(false);
    }
  };

  // Function to animate a reel spinning
  const animateReel = (reel: HTMLDivElement | null, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!reel) {
        resolve(); // Resolve if the reel reference is null
        return;
      }
  
      const startTime = performance.now(); // Get the start time of the animation
      const startPosition = (REEL_LENGTH - VISIBLE_SYMBOLS) * SYMBOL_HEIGHT; // Start from the bottom
      const endPosition = 0; // End at the top
  
      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime; // Calculate elapsed time
        const progress = Math.min(elapsedTime / duration, 1); // Calculate progress (capped at 1)
  
        // Easing function for smooth deceleration
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress); // Apply easing to the progress
  
        const currentPosition = startPosition - (startPosition - endPosition) * easedProgress; // Calculate the current position of the reel
        reel.style.transform = `translateY(-${currentPosition}px)`; // Move the reel
  
        if (progress < 1) {
          requestAnimationFrame(animate); // Continue the animation if progress is less than 1
        } else {
          resolve(); // Resolve the promise when the animation is complete
        }
      };
  
      requestAnimationFrame(animate); // Start the animation
    });
  };

  return (
    <div className="slot-machine">
      <div className="reels">
        {reels.map((reel, reelIndex) => (
          <div key={reelIndex} className="reel">
            <div className="reel-container" ref={el => reelRefs.current[reelIndex] = el}>
              {reel.map((symbol, symbolIndex) => (
                <div key={symbolIndex} className="symbol">
                  {symbol.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="controls">
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(Math.max(1, parseInt(e.target.value)))}
          disabled={spinning}
        />
        <button onClick={spin} disabled={spinning}>
          Spin
        </button>
      </div>
      <div className="balance">Balance: ${balance}</div>
      <div className="result">{result}</div>
    </div>
  );
};

export default SlotMachine;