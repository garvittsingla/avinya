import { useState, useEffect, useRef, useCallback } from 'react';
import * as Phaser from "phaser";
import { useRoomSocket } from "../hooks/useWebSocket";
import TVPopup from "../components/TVPopup";
import Sidebar from "../components/Sidebar";

// Define SceneMain type before using it in useRef
interface ISceneMain extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Physics.Arcade.Sprite;
  map: Phaser.Tilemaps.Tilemap;
  layer1: Phaser.Tilemaps.TilemapLayer;
  layer2: Phaser.Tilemaps.TilemapLayer;
  playerOnStage: boolean;
  otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite>;
  lastPositionUpdate: number;
  nameLabels: Map<string, Phaser.GameObjects.Text>;
  updateOtherPlayers(players: Map<string, PlayerData>): void;
}

interface PlayerData {
  username: string;
  position: { x: number; y: number };
  onStage?: boolean;
}

interface GamePageProps {
  username: string;
  roomslug: string;
  onLeave?: () => void;
}

function GamePage({ username, roomslug, onLeave }: GamePageProps) {
  // Game state refs
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<ISceneMain | null>(null);

  // Screen dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // WebSocket connection
  const {
    isConnected,
    messages,
    players,
    sendPlayerMove,
    sendPlayerOnStage,
    joinRoom,
    leaveRoom,
    playersOnStage,
    sendMessage,
    sendGameState,
    gameState,
    sendTVVideo,
    currentVideo
  } = useRoomSocket();

  // TV Popup state
  const [showTVPopup, setShowTVPopup] = useState(false);
  const [wasOnStage, setWasOnStage] = useState(false);

  // Track if player is on stage for TV popup
  const isPlayerOnStage = players.get(username)?.onStage || false;
  
  // Show TV popup when player enters stage
  useEffect(() => {
    if (isPlayerOnStage && !wasOnStage) {
      setShowTVPopup(true);
    } else if (!isPlayerOnStage && wasOnStage) {
      setShowTVPopup(false);
    }
    setWasOnStage(isPlayerOnStage);
  }, [isPlayerOnStage, wasOnStage]);

  // Wrapper function for sendGameState
  const handleSendGameState = useCallback((gameType: string, gameData: any) => {
    sendGameState(gameType, gameData, roomslug, username);
  }, [sendGameState, roomslug, username]);

  // Get screen size
  useEffect(() => {
    function getScreenSize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    getScreenSize();

    window.addEventListener('resize', getScreenSize);
    return () => window.removeEventListener('resize', getScreenSize);
  }, []);

  // Join room when component mounts
  useEffect(() => {
    if (!isConnected) {
      console.log("Waiting for WebSocket connection...");
      return;
    }

    if (roomslug && username) {
      console.log("Joining room with username:", username, "roomslug:", roomslug);
      joinRoom(username, roomslug);
    }

    // Cleanup when component unmounts
    return () => {
      if (roomslug && username) {
        console.log("Component unmounting, leaving room...");
        leaveRoom(username, roomslug);
      }
    };
  }, [isConnected, roomslug, username, joinRoom, leaveRoom]);

  // Update other players when their positions change
  useEffect(() => {
    if (sceneRef.current) {
      console.log("Players state updated:", Array.from(players.entries()));
      sceneRef.current.updateOtherPlayers(players);
    }
  }, [players]);

  // Initialize Phaser game
  useEffect(() => {
    if (dimensions.width === 0) return;

    class SceneMain extends Phaser.Scene implements ISceneMain {
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      player!: Phaser.Physics.Arcade.Sprite;
      map!: Phaser.Tilemaps.Tilemap;
      layer1!: Phaser.Tilemaps.TilemapLayer;
      layer2!: Phaser.Tilemaps.TilemapLayer;
      playerOnStage: boolean = false;
      otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
      lastPositionUpdate = 0;
      nameLabels: Map<string, Phaser.GameObjects.Text> = new Map();

      constructor() {
        super("SceneMain");
      }

      preload() {
        this.load.image("tiles", "/assets/tilemap.png");
        this.load.tilemapTiledJSON("map", "/assets/bed1.json");
        this.load.image("player", "/assets/player.png");
      }

      create() {
        // Store reference to this scene
        sceneRef.current = this;

        // Get canvas width
        const canvasWidth = this.sys.game.canvas.width;

        // Create tilemap
        this.map = this.make.tilemap({
          key: "map"
        });
        const tileset = this.map.addTilesetImage("mapv1", "tiles");

        // Create layers with null checks
        if (tileset) {
          this.layer1 = this.map.createLayer("Tile Layer 1", tileset, 0, 0)!;
          this.layer2 = this.map.createLayer("Tile Layer 2", tileset, 0, 0)!;
        } else {
          console.error("Failed to create tileset");
          return;
        }

        // Calculate scale factor to make map fit canvas
        const mapWidth = this.map.widthInPixels;
        const scaleX = canvasWidth / mapWidth;

        // Scale map layers
        this.layer1.setScale(scaleX);
        this.layer2.setScale(scaleX);

        // Calculate scaled map height
        const scaledMapHeight = this.map.heightInPixels * scaleX;

        // Resize game to match scaled height
        this.scale.resize(canvasWidth, scaledMapHeight);

        // Set camera bounds
        this.cameras.main.setBounds(0, 0, canvasWidth, scaledMapHeight);

        // Add player sprite
        this.player = this.physics.add.sprite(canvasWidth / 2, scaledMapHeight / 2, 'player');
        this.player.setScale(1.5);
        this.player.setOrigin(0.5, 0.5);
        this.player.setCollideWorldBounds(true);

        // Add username label above player
        const playerLabel = this.add.text(
          this.player.x,
          this.player.y - 30,
          username,
          { font: '14px Arial', color: '#ffffff', backgroundColor: '#000000' }
        );
        playerLabel.setOrigin(0.5);
        this.nameLabels.set(username, playerLabel);

        // Set up keyboard input
        if (this.input && this.input.keyboard) {
          this.cursors = this.input.keyboard.createCursorKeys();
        } else {
          console.error("Keyboard input not available");
        }

        // Set collisions
        this.layer1.setCollisionByProperty({ collides: true });
        this.layer2.setCollisionByProperty({ collides: true });

        // Make player collide with tilemap layers
        this.physics.add.collider(this.player, this.layer1);
        this.physics.add.collider(this.player, this.layer2);

        // Make camera follow player
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Center camera initially
        this.cameras.main.centerOn(canvasWidth / 2, scaledMapHeight / 2);

        // Clean up on scene destroy
        this.events.on('destroy', () => {
          sceneRef.current = null;
        });
      }

      update(time: number) {
        // Reset velocity
        this.player.setVelocity(0);

        const speed = 160;
        let playerMoved = false;

        // Handle player movement
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-speed);
          playerMoved = true;
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(speed);
          playerMoved = true;
        }

        if (this.cursors.up.isDown) {
          this.player.setVelocityY(-speed);
          playerMoved = true;
        } else if (this.cursors.down.isDown) {
          this.player.setVelocityY(speed);
          playerMoved = true;
        }

        // Normalize diagonal movement with null checks
        if (this.player.body && this.player.body.velocity) {
          if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            this.player.body.velocity.normalize().scale(speed);
          }
        }

        // Update player label position
        const playerLabel = this.nameLabels.get(username);
        if (playerLabel) {
          playerLabel.setPosition(this.player.x, this.player.y - 30);
        }

        // Check if player is on a stage tile
        const playerTileX = this.layer1.worldToTileX(this.player.x);
        const playerTileY = this.layer1.worldToTileY(this.player.y);

        const tileLayer1 = this.map.getTileAt(playerTileX!, playerTileY!, false, 'Tile Layer 1');
        const tileLayer2 = this.map.getTileAt(playerTileX!, playerTileY!, false, 'Tile Layer 2');

        const isOnStage =
          (tileLayer1 && tileLayer1.properties && tileLayer1.properties.stage === true) ||
          (tileLayer2 && tileLayer2.properties && tileLayer2.properties.stage === true);

        // Handle stage entry/exit
        if (isOnStage && !this.playerOnStage) {
          console.log('Player is on stage!');
          this.playerOnStage = true;

          // Send stage status to other players
          if (roomslug && isConnected) {
            sendPlayerOnStage(true, roomslug, username);
          }

          // Visual effect when on stage (optional glow)
          this.player.setTint(0xffff00);

        } else if (!isOnStage && this.playerOnStage) {
          console.log('Player left the stage!');
          this.playerOnStage = false;

          // Send stage status to other players
          if (roomslug && isConnected) {
            sendPlayerOnStage(false, roomslug, username);
          }

          // Remove visual effect
          this.player.clearTint();
        }

        // Send position updates to other players when this player moves
        if (playerMoved && roomslug && isConnected && time - this.lastPositionUpdate > 100) {
          this.lastPositionUpdate = time;
          console.log("Sending player move:", { x: this.player.x, y: this.player.y });
          sendPlayerMove({ x: this.player.x, y: this.player.y }, roomslug, username);
        }
      }

      // Update the updateOtherPlayers method in SceneMain class:
      updateOtherPlayers(players: Map<string, PlayerData>) {
        console.log("updateOtherPlayers called with players:", players);

        players.forEach((playerData, playerName) => {
          // Skip current player
          if (playerName === username) {
            console.log("Skipping current player:", playerName);
            return;
          }

          const position = playerData.position;
          if (!position) {
            console.log("No position data for player:", playerName);
            return; // Skip if no position data
          }

          console.log("Processing player:", playerName, "at position:", position);

          // Get or create sprite for this player
          let playerSprite = this.otherPlayers.get(playerName);
          if (!playerSprite) {
            console.log("Creating new sprite for player:", playerName);
            playerSprite = this.physics.add.sprite(position.x, position.y, 'player');
            playerSprite.setScale(1.5);
            this.otherPlayers.set(playerName, playerSprite);

            // Add collision with map
            this.physics.add.collider(playerSprite, this.layer1);
            this.physics.add.collider(playerSprite, this.layer2);

            // Add username label
            const nameLabel = this.add.text(
              position.x,
              position.y - 30,
              playerName,
              { font: '14px Arial', color: '#ffffff', backgroundColor: '#000000' }
            );
            nameLabel.setOrigin(0.5);
            this.nameLabels.set(playerName, nameLabel);
          }

          // Apply tint if player is on stage
          if (playerData.onStage) {
            playerSprite.setTint(0xffff00);
          } else {
            playerSprite.clearTint();
          }

          // Only update position if it's different to prevent jitter
          if (playerSprite.x !== position.x || playerSprite.y !== position.y) {
            console.log("Updating sprite position for:", playerName, "from", { x: playerSprite.x, y: playerSprite.y }, "to", position);
            this.tweens.add({
              targets: playerSprite,
              x: position.x,
              y: position.y,
              duration: 100,
              ease: 'Linear'
            });
          }

          // Update label position
          const label = this.nameLabels.get(playerName);
          if (label) {
            label.setPosition(position.x, position.y - 30);
          }
        });

        // Clean up disconnected players
        const currentPlayerNames = Array.from(players.keys());
        this.otherPlayers.forEach((sprite, playerName) => {
          if (!currentPlayerNames.includes(playerName)) {
            console.log("Removing disconnected player:", playerName);
            // Remove sprite
            sprite.destroy();
            this.otherPlayers.delete(playerName);

            // Remove label
            const label = this.nameLabels.get(playerName);
            if (label) {
              label.destroy();
              this.nameLabels.delete(playerName);
            }
          }
        });
      }
    }

    // Create the Phaser game
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: (dimensions.width / 4) * 3,
      height: dimensions.height,
      parent: 'game-container',
      scene: [SceneMain],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, [dimensions, isConnected, roomslug, username, sendPlayerMove, sendPlayerOnStage]);

  // Audio UI indicators - show who's currently on stage
  const renderPlayersOnStage = () => {
    if (playersOnStage.length === 0) return null;

    return (
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '320px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '8px',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>On Stage:</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {playersOnStage.map(player => (
            <li key={player} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                marginRight: '8px'
              }}></span>
              {player}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', position: 'relative' }}>
      <div id="game-container" style={{ width: '75%', height: '100%' }}></div>
      
      {/* Sidebar with chat, members, and YouTube TV */}
      <Sidebar
        username={username}
        roomslug={roomslug}
        isConnected={isConnected}
        messages={messages}
        players={players}
        sendMessage={sendMessage}
        videoId={currentVideo?.videoId || ''}
        onVideoChange={(videoId) => sendTVVideo(videoId, roomslug, username)}
        onLeave={onLeave}
      />

      {/* Audio status indicators */}
      {renderPlayersOnStage()}

      {/* Stage status indicator */}
      {players.get(username)?.onStage && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#fca5a5',
            borderRadius: '50%',
            marginRight: '8px',
            animation: 'pulse 2s infinite'
          }}></div>
          You're on stage!
          <button
            onClick={() => setShowTVPopup(true)}
            style={{
              marginLeft: '12px',
              padding: '4px 12px',
              backgroundColor: '#00ffff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            📺 Open TV
          </button>
        </div>
      )}

      {/* TV Popup */}
      <TVPopup
        isOpen={showTVPopup}
        onClose={() => setShowTVPopup(false)}
        username={username}
        roomslug={roomslug}
        sendGameState={handleSendGameState}
        gameState={gameState}
      />
    </div>
  );
}

export default GamePage;
