import { useState, useEffect } from 'react';

interface MemoryGameProps {
  username: string;
  onBack: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎢', '🎡'];

function MemoryGame({ username, onBack }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  // Initialize game
  useEffect(() => {
    initializeGame();
    // Load best score from localStorage
    const saved = localStorage.getItem(`memory_best_${username}`);
    if (saved) setBestScore(parseInt(saved));
  }, [username]);

  const initializeGame = () => {
    // Create pairs of cards
    const pairs = [...EMOJIS, ...EMOJIS];
    // Shuffle
    const shuffled = pairs
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
    setGameComplete(false);
  };

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    // Flip the card
    const newCards = cards.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [first, second] = newFlipped;
      const firstCard = newCards.find(c => c.id === first);
      const secondCard = newCards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === EMOJIS.length) {
              setGameComplete(true);
              // Save best score
              const finalMoves = moves + 1;
              if (!bestScore || finalMoves < bestScore) {
                setBestScore(finalMoves);
                localStorage.setItem(`memory_best_${username}`, finalMoves.toString());
              }
            }
            return newMatches;
          });
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '10px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '2px solid #666',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>
        <h2 style={{
          fontSize: '24px',
          color: '#ffaa00',
          textShadow: '0 0 10px #ffaa00'
        }}>
          🧠 Memory Game
        </h2>
        <div style={{ width: '80px' }} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '24px',
        padding: '12px 24px',
        background: 'linear-gradient(145deg, #1a1a2e, #0f0f1a)',
        borderRadius: '12px',
        border: '2px solid #3a3a4a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '12px' }}>Moves</p>
          <p style={{ color: '#00ffff', fontSize: '24px', fontWeight: 'bold' }}>{moves}</p>
        </div>
        <div style={{ width: '1px', background: '#3a3a4a' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '12px' }}>Matches</p>
          <p style={{ color: '#00ff88', fontSize: '24px', fontWeight: 'bold' }}>{matches}/{EMOJIS.length}</p>
        </div>
        {bestScore && (
          <>
            <div style={{ width: '1px', background: '#3a3a4a' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '12px' }}>Best</p>
              <p style={{ color: '#ffaa00', fontSize: '24px', fontWeight: 'bold' }}>{bestScore}</p>
            </div>
          </>
        )}
      </div>

      {/* Game Complete Message */}
      {gameComplete && (
        <div style={{
          padding: '16px 32px',
          background: 'linear-gradient(145deg, #00ff88, #00cc6a)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#000', fontSize: '20px', fontWeight: 'bold' }}>
            🎉 Congratulations! 🎉
          </p>
          <p style={{ color: '#000', fontSize: '14px' }}>
            Completed in {moves} moves!
          </p>
          <button
            onClick={initializeGame}
            style={{
              marginTop: '10px',
              background: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              color: '#00ff88',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        padding: '20px',
        background: 'linear-gradient(145deg, #0a0a15, #0f0f1a)',
        borderRadius: '16px',
        boxShadow: '0 0 30px rgba(255, 170, 0, 0.1)'
      }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '12px',
              border: card.isMatched 
                ? '2px solid #00ff88' 
                : '2px solid #3a3a4a',
              background: card.isFlipped || card.isMatched
                ? 'linear-gradient(145deg, #2a2a3e, #1a1a2e)'
                : 'linear-gradient(145deg, #ffaa00, #ff8800)',
              cursor: card.isMatched ? 'default' : 'pointer',
              fontSize: '32px',
              transition: 'all 0.3s ease',
              transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0)',
              boxShadow: card.isMatched 
                ? '0 0 15px rgba(0, 255, 136, 0.3)'
                : card.isFlipped 
                  ? '0 0 15px rgba(0, 255, 255, 0.3)'
                  : '0 4px 8px rgba(0,0,0,0.3)',
              opacity: card.isMatched ? 0.7 : 1
            }}
          >
            {(card.isFlipped || card.isMatched) ? (
              <span style={{ display: 'inline-block', transform: 'rotateY(180deg)' }}>
                {card.emoji}
              </span>
            ) : '?'}
          </button>
        ))}
      </div>

      {/* Reset button */}
      {!gameComplete && (
        <button
          onClick={initializeGame}
          style={{
            background: 'linear-gradient(145deg, #e94560, #c73e54)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Reset Game
        </button>
      )}
    </div>
  );
}

export default MemoryGame;
