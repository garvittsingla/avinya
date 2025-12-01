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
      gap: '24px',
      padding: '20px',
      background: 'linear-gradient(180deg, #f4d8b8 0%, #e8c4a0 100%)',
      borderRadius: '12px',
      border: '6px solid #8b6f47',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      minHeight: '600px'
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
            background: '#d4a574',
            border: '3px solid #8b6f47',
            borderRadius: '6px',
            padding: '10px 20px',
            color: '#3d2f1f',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 3px 0 #6d5437',
            transition: 'all 0.1s ease'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = '0 1px 0 #6d5437';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 0 #6d5437';
          }}
        >
          ← Back
        </button>
        <h2 style={{
          fontSize: '32px',
          color: '#3d2f1f',
          textShadow: '2px 2px 0 rgba(255,255,255,0.5)',
          fontWeight: 'bold',
          letterSpacing: '2px',
          fontFamily: 'monospace'
        }}>
          🧠 MEMORY GAME
        </h2>
        <div style={{ width: '100px' }} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '24px',
        padding: '16px 32px',
        background: '#d4a574',
        borderRadius: '8px',
        border: '4px solid #8b6f47',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#5d4a37', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Moves</p>
          <p style={{ color: '#3d2f1f', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>{moves}</p>
        </div>
        <div style={{ width: '2px', background: '#8b6f47' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#5d4a37', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Matches</p>
          <p style={{ color: '#3d2f1f', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>{matches}/{EMOJIS.length}</p>
        </div>
        {bestScore && (
          <>
            <div style={{ width: '2px', background: '#8b6f47' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#5d4a37', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Best</p>
              <p style={{ color: '#d9534f', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>{bestScore}</p>
            </div>
          </>
        )}
      </div>

      {/* Game Complete Message */}
      {gameComplete && (
        <div style={{
          padding: '20px 40px',
          background: '#5cb85c',
          borderRadius: '8px',
          border: '4px solid #4cae4c',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <p style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
            🎉 Congratulations! 🎉
          </p>
          <p style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
            Completed in {moves} moves!
          </p>
          <button
            onClick={initializeGame}
            style={{
              background: '#3d8b3d',
              border: '3px solid #2d6b2d',
              borderRadius: '6px',
              padding: '10px 24px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 3px 0 #1d4b1d',
              transition: 'all 0.1s ease'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px)';
              e.currentTarget.style.boxShadow = '0 1px 0 #1d4b1d';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 0 #1d4b1d';
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
        background: '#c89968',
        borderRadius: '8px',
        border: '6px solid #8b6f47',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
      }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            style={{
              width: '75px',
              height: '75px',
              borderRadius: '6px',
              border: card.isMatched 
                ? '4px solid #5cb85c' 
                : '4px solid #8b6f47',
              background: card.isFlipped || card.isMatched
                ? '#e8c4a0'
                : '#f0ad4e',
              cursor: card.isMatched ? 'default' : 'pointer',
              fontSize: '36px',
              transition: 'all 0.3s ease',
              transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0)',
              boxShadow: card.isMatched 
                ? '0 0 15px rgba(92, 184, 92, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)'
                : card.isFlipped 
                  ? 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  : '0 4px 0 #c89336, inset 0 -2px 4px rgba(0,0,0,0.1)',
              opacity: card.isMatched ? 0.8 : 1,
              position: 'relative',
              fontFamily: 'system-ui'
            }}
            onMouseEnter={(e) => {
              if (!card.isMatched && !card.isFlipped) {
                e.currentTarget.style.background = '#ffb85f';
              }
            }}
            onMouseLeave={(e) => {
              if (!card.isMatched && !card.isFlipped) {
                e.currentTarget.style.background = '#f0ad4e';
              }
            }}
          >
            {(card.isFlipped || card.isMatched) ? (
              <span style={{ display: 'inline-block', transform: 'rotateY(180deg)' }}>
                {card.emoji}
              </span>
            ) : (
              <span style={{ 
                color: '#fff', 
                fontSize: '44px', 
                fontWeight: 'bold',
                textShadow: '2px 2px 0 rgba(0,0,0,0.2)'
              }}>
                ?
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reset button */}
      {!gameComplete && (
        <button
          onClick={initializeGame}
          style={{
            background: '#d9534f',
            border: '3px solid #a94442',
            borderRadius: '6px',
            padding: '12px 28px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 4px 0 #8b3a39',
            transition: 'all 0.1s ease'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = '0 2px 0 #8b3a39';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 0 #8b3a39';
          }}
        >
          🔄 Reset Game
        </button>
      )}
    </div>
  );
}

export default MemoryGame;