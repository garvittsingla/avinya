import { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  username: string;
  roomslug: string;
  sendGameState: (gameType: string, gameData: any) => void;
  gameState: { gameType: string; gameData: any; player: string } | null;
  onBack: () => void;
}

interface DrawAction {
  type: 'draw' | 'clear';
  x?: number;
  y?: number;
  prevX?: number;
  prevY?: number;
  color?: string;
  size?: number;
}

const COLORS = [
  '#ffffff', '#e94560', '#00ffff', '#00ff88', '#ffaa00', 
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'
];

const SIZES = [2, 5, 10, 20];

function DrawingCanvas({ username, roomslug, sendGameState, gameState, onBack }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#00ffff');
  const [brushSize, setBrushSize] = useState(5);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas background
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Handle incoming draw actions from other players
  useEffect(() => {
    if (gameState && gameState.gameType === 'drawing' && gameState.player !== username) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const data = gameState.gameData as DrawAction;

      if (data.type === 'clear') {
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (data.type === 'draw' && data.x !== undefined && data.y !== undefined) {
        ctx.strokeStyle = data.color || '#ffffff';
        ctx.lineWidth = data.size || 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        if (data.prevX !== undefined && data.prevY !== undefined) {
          ctx.moveTo(data.prevX, data.prevY);
        } else {
          ctx.moveTo(data.x, data.y);
        }
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      }
    }
  }, [gameState, username]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getCanvasCoordinates(e);
    setLastPos(pos);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasCoordinates(e);

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPos) {
      ctx.moveTo(lastPos.x, lastPos.y);
    } else {
      ctx.moveTo(pos.x, pos.y);
    }
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Send draw action to other players
    sendGameState('drawing', {
      type: 'draw',
      x: pos.x,
      y: pos.y,
      prevX: lastPos?.x,
      prevY: lastPos?.y,
      color,
      size: brushSize
    });

    setLastPos(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Send clear action to other players
    sendGameState('drawing', { type: 'clear' });
  };

  // Suppress unused variable warning
  void roomslug;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
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
          color: '#00ff88',
          textShadow: '0 0 10px #00ff88'
        }}>
          🎨 Collaborative Drawing
        </h2>
        <div style={{ width: '80px' }} />
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        padding: '12px 20px',
        background: 'linear-gradient(145deg, #1a1a2e, #0f0f1a)',
        borderRadius: '12px',
        border: '2px solid #3a3a4a',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Colors */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: '12px', marginRight: '4px' }}>Color:</span>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: c,
                border: color === c ? '3px solid #fff' : '2px solid #444',
                cursor: 'pointer',
                boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '30px', background: '#444' }} />

        {/* Brush sizes */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: '12px', marginRight: '4px' }}>Size:</span>
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setBrushSize(s)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: brushSize === s 
                  ? 'linear-gradient(145deg, #3a3a4a, #2a2a3a)'
                  : 'linear-gradient(145deg, #1a1a2e, #0f0f1a)',
                border: brushSize === s ? '2px solid #00ffff' : '2px solid #333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: `${Math.min(s + 4, 20)}px`,
                height: `${Math.min(s + 4, 20)}px`,
                borderRadius: '50%',
                background: color
              }} />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '30px', background: '#444' }} />

        {/* Clear button */}
        <button
          onClick={clearCanvas}
          style={{
            background: 'linear-gradient(145deg, #e94560, #c73e54)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          🗑️ Clear
        </button>
      </div>

      {/* Canvas */}
      <div style={{
        background: 'linear-gradient(145deg, #0a0a15, #0f0f1a)',
        borderRadius: '12px',
        padding: '8px',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)',
        border: '2px solid #3a3a4a'
      }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            borderRadius: '8px',
            cursor: 'crosshair',
            display: 'block'
          }}
        />
      </div>

      {/* Info */}
      <p style={{ color: '#666', fontSize: '12px' }}>
        Draw together with others on stage! Everyone can see your drawings in real-time.
      </p>
    </div>
  );
}

export default DrawingCanvas;
