import { useState } from 'react';
//@ts-ignore
import TicTacToe from './games/TicTacToe';
//@ts-ignore

import DrawingCanvas from './games/DrawingCanvas';
//@ts-ignore

import MemoryGame from './games/MemoryGame';

interface TVPopupProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  roomslug: string;
  sendGameState: (gameType: string, gameData: any) => void;
  gameState: { gameType: string; gameData: any; player: string } | null;
}

type GameType = 'menu' | 'tictactoe' | 'drawing' | 'memory';

function TVPopup({ isOpen, onClose, username, roomslug, sendGameState, gameState }: TVPopupProps) {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  if (!isOpen) return null;

  const handleBackToMenu = () => {
    setCurrentGame('menu');
  };

  const renderGame = () => {
    switch (currentGame) {
      case 'tictactoe':
        return (
          <TicTacToe
            username={username}
            roomslug={roomslug}
            sendGameState={sendGameState}
            gameState={gameState}
            onBack={handleBackToMenu}
          />
        );
      case 'drawing':
        return (
          <DrawingCanvas
            username={username}
            roomslug={roomslug}
            sendGameState={sendGameState}
            gameState={gameState}
            onBack={handleBackToMenu}
          />
        );
      case 'memory':
        return (
          <MemoryGame
            username={username}
            onBack={handleBackToMenu}
          />
        );
      default:
        return renderMenu();
    }
  };

const renderMenu = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    padding: '30px 15px'
  }}>
    <h2 style={{
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#5D2E0F',
      textShadow: '3px 3px 0 #FFF5E1',
      marginBottom: '8px'
    }}>
      🎮 Game Station 🎮
    </h2>
    <p style={{ 
      color: '#8B4513', 
      fontSize: '15px', 
      marginBottom: '12px',
      fontWeight: '600'
    }}>
      Choose a game to play with others on stage!
    </p>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      width: '100%',
      maxWidth: '650px'
    }}>
      {/* Tic Tac Toe */}
      <button
        onClick={() => setCurrentGame('tictactoe')}
        style={{
          background: 'linear-gradient(180deg, #E8C7A0 0%, #D9B88F 100%)',
          border: '4px solid #8B4513',
          borderRadius: '12px',
          padding: '28px 16px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 6px 0 #5D2E0F, 0 8px 12px rgba(0,0,0,0.2)',
          position: 'relative',
          top: '0'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.style.boxShadow = '0 8px 0 #5D2E0F, 0 10px 16px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 0 #5D2E0F, 0 8px 12px rgba(0,0,0,0.2)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.top = '4px';
          e.currentTarget.style.boxShadow = '0 2px 0 #5D2E0F, 0 4px 8px rgba(0,0,0,0.2)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.top = '0';
          e.currentTarget.style.boxShadow = '0 6px 0 #5D2E0F, 0 8px 12px rgba(0,0,0,0.2)';
        }}
      >
        <span style={{ fontSize: '52px' }}>⭕❌</span>
        <span style={{ 
          color: '#5D2E0F', 
          fontWeight: 'bold', 
          fontSize: '17px',
          textShadow: '1px 1px 0 rgba(255,255,255,0.5)'
        }}>
          Tic Tac Toe
        </span>
        <span style={{ color: '#8B4513', fontSize: '13px', fontWeight: '600' }}>2 Players</span>
      </button>

      {/* Drawing Canvas */}
      <button
        onClick={() => setCurrentGame('drawing')}
        style={{
          background: 'linear-gradient(180deg, #E8C7A0 0%, #D9B88F 100%)',
          border: '4px solid #CD853F',
          borderRadius: '12px',
          padding: '28px 16px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 6px 0 #8B6F47, 0 8px 12px rgba(0,0,0,0.2)',
          position: 'relative',
          top: '0'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.style.boxShadow = '0 8px 0 #8B6F47, 0 10px 16px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 0 #8B6F47, 0 8px 12px rgba(0,0,0,0.2)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.top = '4px';
          e.currentTarget.style.boxShadow = '0 2px 0 #8B6F47, 0 4px 8px rgba(0,0,0,0.2)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.top = '0';
          e.currentTarget.style.boxShadow = '0 6px 0 #8B6F47, 0 8px 12px rgba(0,0,0,0.2)';
        }}
      >
        <span style={{ fontSize: '52px' }}>🎨</span>
        <span style={{ 
          color: '#5D2E0F', 
          fontWeight: 'bold', 
          fontSize: '17px',
          textShadow: '1px 1px 0 rgba(255,255,255,0.5)'
        }}>
          Drawing
        </span>
        <span style={{ color: '#8B4513', fontSize: '13px', fontWeight: '600' }}>Collaborative</span>
      </button>

      {/* Memory Game */}
      <button
        onClick={() => setCurrentGame('memory')}
        style={{
          background: 'linear-gradient(180deg, #E8C7A0 0%, #D9B88F 100%)',
          border: '4px solid #D2691E',
          borderRadius: '12px',
          padding: '28px 16px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 6px 0 #A0522D, 0 8px 12px rgba(0,0,0,0.2)',
          position: 'relative',
          top: '0'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.style.boxShadow = '0 8px 0 #A0522D, 0 10px 16px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 0 #A0522D, 0 8px 12px rgba(0,0,0,0.2)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.top = '4px';
          e.currentTarget.style.boxShadow = '0 2px 0 #A0522D, 0 4px 8px rgba(0,0,0,0.2)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.top = '0';
          e.currentTarget.style.boxShadow = '0 6px 0 #A0522D, 0 8px 12px rgba(0,0,0,0.2)';
        }}
      >
        <span style={{ fontSize: '52px' }}>🧠</span>
        <span style={{ 
          color: '#5D2E0F', 
          fontWeight: 'bold', 
          fontSize: '17px',
          textShadow: '1px 1px 0 rgba(255,255,255,0.5)'
        }}>
          Memory
        </span>
        <span style={{ color: '#8B4513', fontSize: '13px', fontWeight: '600' }}>Single Player</span>
      </button>
    </div>
  </div>
);

return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      {/* TV Frame - Outer shell */}
      <div style={{
        position: 'relative',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        background: 'linear-gradient(145deg, #6d5437, #5d4a37)',
        borderRadius: '24px',
        padding: '12px',
        overflowY: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 5px #3d2f1f, inset 0 4px 16px rgba(255, 255, 255, 0.08)'
      }}>
        {/* TV Bezel - Inner frame */}
        <div className="hide-scrollbar" style={{
          background: 'linear-gradient(180deg, #8b7355 0%, #6d5437 50%, #4a3820 100%)',
          borderRadius: '20px',
          padding: '10px',
          border: '4px solid #5d4a37',
          boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.4)',
          overflowY: 'scroll'
        }}>
          {/* Screen background */}
          <div className="hide-scrollbar" style={{
            background: 'linear-gradient(180deg, #f4d8b8 0%, #e8c4a0 100%)',
            borderRadius: '16px',
            minHeight: '550px',
            maxHeight: '70vh',
            position: 'relative',
            boxShadow: 'inset 0 5px 20px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0,0,0,0.25)',
            border: '4px solid #8b6f47',
            overflowY: 'scroll',
            scrollbarWidth: 'none',       
            msOverflowStyle: 'none' 
          }}>
            
            {/* Game content */}
            <div style={{ position: 'relative', zIndex: 0, padding: '20px'}}>
              {renderGame()}
            </div>
          </div>

          {/* TV Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '28px',
            // marginTop: '22px',
            padding: '12px'
          }}>
            {/* Power/Close button */}
            <button
              onClick={onClose}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #6d5437, #5d4a37)',
                border: '3px solid #4a3820',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 5px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
                position: 'relative',
                top: '0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #7d6447, #6d5437)';
                e.currentTarget.style.boxShadow = '0 7px 14px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.15), 0 0 20px rgba(212, 165, 116, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #6d5437, #5d4a37)';
                e.currentTarget.style.boxShadow = '0 5px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.top = '3px';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.4)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.top = '0';
                e.currentTarget.style.boxShadow = '0 5px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)';
              }}
            >
              <span style={{ 
                color: '#d4a574', 
                fontSize: '24px', 
                fontWeight: 'bold',
                textShadow: '0 2px 3px rgba(0,0,0,0.6)'
              }}>
                ⏻
              </span>
            </button>

            {/* Brand */}
            <div style={{
              color: '#8b7355',
              fontSize: '15px',
              fontFamily: 'monospace',
              letterSpacing: '5px',
              fontWeight: 'bold',
              textShadow: '2px 2px 3px rgba(0,0,0,0.6)'
            }}>
              VOXEL TV
            </div>

            {/* LED indicator */}
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #5cb85c 0%, #4cae4c 100%)',
              boxShadow: '0 0 20px #5cb85c, 0 0 6px #4cae4c, inset 0 2px 3px rgba(255,255,255,0.5)',
              animation: 'pulse 2s ease-in-out infinite',
              border: '2px solid #3d8b3d'
            }} />
          </div>
        </div>

        {/* TV Stand */}
        <div style={{
          width: '42%',
          height: '20px',
          background: 'linear-gradient(180deg, #6d5437, #5d4a37)',
          margin: '0 auto',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
          border: '3px solid #3d2f1f',
          borderTop: 'none'
        }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(0.92);
          }
        }
      `}</style>
    </div>
  );
}

export default TVPopup;
