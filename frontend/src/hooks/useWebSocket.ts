import { useState, useEffect, useRef, useCallback } from "react";

// Message types for type safety
export interface ChatMessage {
  type: 'chat';
  username: string;
  roomslug: string;
  content: string;
  sentTime?: Date;
}

export interface JoinMessage {
  type: 'join';
  username: string;
  roomslug: string;
}

export interface LeaveMessage {
  type: 'leave';
  roomslug: string;
  username: string;
}

export interface PlayerMoveMessage {
  type: 'player_move';
  username: string;
  roomslug: string;
  position: { x: number, y: number };
}

export interface PlayerOnStageMessage {
  type: 'player_on_stage';
  username: string;
  roomslug: string;
  onStage: boolean;
}

export interface PlayerJoinedMessage {
  type: 'player_joined';
  username: string;
  roomslug: string;
  position: { x: number, y: number };
}

export interface ExistingPlayersMessage {
  type: 'existing_players';
  roomslug: string;
  players: Array<{
    username: string;
    position: { x: number, y: number };
    onStage?: boolean;
  }>;
}

export type WebSocketMessage =
  | ChatMessage
  | JoinMessage
  | LeaveMessage
  | PlayerMoveMessage
  | PlayerOnStageMessage
  | PlayerJoinedMessage
  | ExistingPlayersMessage;

export interface BroadcastedMSG {
  type: "chat" | "system";
  sender: string;
  content: string;
  time: Date;
  isOwnMessage?: boolean;
}

export interface PlayerData {
  username: string;
  position: { x: number, y: number };
  onStage?: boolean;
}

export interface GameStateData {
  gameType: string;
  gameData: any;
  player: string;
}

export interface TVVideoData {
  videoId: string;
  username: string;
}

interface UseRoomSocketReturn {
  isConnected: boolean;
  messages: BroadcastedMSG[];
  players: Map<string, PlayerData>;
  joinRoom: (username: string, roomslug: string) => void;
  sendMessage: (msg: string, roomslug: string, username: string) => void;
  sendPlayerMove: (position: { x: number, y: number }, roomslug: string, username: string) => void;
  sendPlayerOnStage: (onStage: boolean, roomslug: string, username: string) => void;
  leaveRoom: (username: string, roomslug: string) => void;
  playersOnStage: string[];
  sendGameState: (gameType: string, gameData: any, roomslug: string, username: string) => void;
  gameState: GameStateData | null;
  sendTVVideo: (videoId: string, roomslug: string, username: string) => void;
  currentVideo: TVVideoData | null;
}

const WS_URL = "ws://localhost:8080";

export const useRoomSocket = (): UseRoomSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<BroadcastedMSG[]>([]);
  const [players, setPlayers] = useState<Map<string, PlayerData>>(new Map<string, PlayerData>());
  const [playersOnStage, setPlayersOnStage] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [currentVideo, setCurrentVideo] = useState<TVVideoData | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const userRef = useRef<string | null>(null);

  const joinRoom = useCallback((username: string, roomslug: string) => {
    console.log("joinRoom called with:", { username, roomslug });
    console.log("WebSocket state:", socketRef.current?.readyState);

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected. State:", socketRef.current?.readyState);
      return;
    }

    userRef.current = username;
    console.log("Setting userRef to:", username);

    const joinMessage: JoinMessage = {
      type: "join",
      username,
      roomslug,
    };

    console.log("Sending join message:", joinMessage);
    socketRef.current.send(JSON.stringify(joinMessage));
  }, []);

  const sendMessage = useCallback((msg: string, roomslug: string, username: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    const sentTime = new Date();
    const userMsg: ChatMessage = {
      type: 'chat',
      username,
      roomslug,
      content: msg,
      sentTime
    };

    // Add message to local state for immediate feedback
    setMessages(prevMessages => [
      ...prevMessages,
      {
        type: "chat",
        sender: username,
        content: msg,
        time: sentTime,
        isOwnMessage: true
      }
    ]);

    console.log("Sending chat message:", userMsg);
    socketRef.current.send(JSON.stringify(userMsg));
  }, []);

  // Send player position update
  const sendPlayerMove = useCallback((position: { x: number, y: number }, roomslug: string, username: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    const moveMsg: PlayerMoveMessage = {
      type: 'player_move',
      username,
      roomslug,
      position
    };

    socketRef.current.send(JSON.stringify(moveMsg));

    // Update local player data too
    setPlayers(prev => {
      const newMap = new Map(prev);
      const currentData = newMap.get(username) || { username, position: { x: 0, y: 0 } };
      newMap.set(username, { ...currentData, position });
      return newMap;
    });
  }, []);

  // Send player stage status update
  const sendPlayerOnStage = useCallback((onStage: boolean, roomslug: string, username: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    const stageMsg: PlayerOnStageMessage = {
      type: 'player_on_stage',
      username,
      roomslug,
      onStage
    };

    socketRef.current.send(JSON.stringify(stageMsg));

    // Update local player data
    setPlayers(prev => {
      const newMap = new Map(prev);
      const currentData = newMap.get(username) || {
        username,
        position: { x: 0, y: 0 }
      };
      newMap.set(username, { ...currentData, onStage });
      return newMap;
    });

    // Update players on stage list
    if (onStage) {
      setPlayersOnStage(prev => {
        if (!prev.includes(username)) {
          return [...prev, username];
        }
        return prev;
      });
    } else {
      setPlayersOnStage(prev => prev.filter(player => player !== username));
    }
  }, []);

  const leaveRoom = useCallback((username: string, roomslug: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    const leaveMsg: LeaveMessage = {
      type: 'leave',
      roomslug,
      username
    };

    socketRef.current.send(JSON.stringify(leaveMsg));
    console.log(`User ${username} left room ${roomslug}`);
  }, []);

  // Send game state update to other players on stage
  const sendGameState = useCallback((gameType: string, gameData: any, roomslug: string, username: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    const gameStateMsg = {
      type: 'game_state',
      username,
      roomslug,
      gameType,
      gameData
    };

    console.log("Sending game state:", gameStateMsg);
    socketRef.current.send(JSON.stringify(gameStateMsg));
  }, []);

  // Send TV video to all players in room
  const sendTVVideo = useCallback((videoId: string, roomslug: string, username: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    const tvVideoMsg = {
      type: 'tv_video',
      username,
      roomslug,
      videoId
    };

    console.log("Sending TV video:", tvVideoMsg);
    socketRef.current.send(JSON.stringify(tvVideoMsg));
  }, []);

  const connect = useCallback(() => {
    try {
      console.log("Attempting to connect to WebSocket...");
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected successfully. State:", ws.readyState);
        setIsConnected(true);
      };

      ws.onmessage = (e) => {
        try {
          const parsedMessage = JSON.parse(e.data);

          // Don't log ping/pong messages to reduce noise
          if (parsedMessage.type !== "ping" && parsedMessage.type !== "pong") {
            console.log("Received WebSocket message:", parsedMessage);
          }

          // Handle heartbeat ping
          if (parsedMessage.type === "ping") {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: "pong" }));
            }
            return;
          }

          // Process message based on type
          switch (parsedMessage.type) {
            case "chat":
              // Extract sender username and handle chat message
              const senderUsername = parsedMessage.username || parsedMessage.sender;
              const isFromCurrentUser = senderUsername === userRef.current;

              if (!isFromCurrentUser) {
                console.log("Received chat message:", parsedMessage);
                setMessages(prevMessages => [
                  ...prevMessages,
                  {
                    type: "chat",
                    sender: senderUsername,
                    content: parsedMessage.content,
                    time: new Date(parsedMessage.time) || new Date(),
                    isOwnMessage: false
                  }
                ]);
              }
              break;

            case "player_joined":
              // Add new player to our map
              const { username: joinUsername } = parsedMessage;
              const initialPosition = parsedMessage.position || { x: 0, y: 0 };
              console.log("Player joined:", joinUsername, "at position:", initialPosition);

              setPlayers(prev => {
                const newMap = new Map(prev);
                newMap.set(joinUsername, {
                  username: joinUsername,
                  position: initialPosition
                });
                console.log("Updated players after join:", Array.from(newMap.entries()));
                return newMap;
              });
              break;

            case "player_move":
              // Update player position in our map
              const { username: moveUsername, position } = parsedMessage;
              console.log("Player move:", moveUsername, "to position:", position);

              setPlayers(prev => {
                const newMap = new Map(prev);
                const currentData = newMap.get(moveUsername) || {
                  username: moveUsername,
                  position: { x: 0, y: 0 }
                };
                newMap.set(moveUsername, { ...currentData, position });
                return newMap;
              });
              break;

            case "player_on_stage":
              // Update player stage status
              const { username: stageUsername, onStage } = parsedMessage;
              console.log("Player stage status update:", stageUsername, onStage);

              setPlayers(prev => {
                const newMap = new Map(prev);
                const currentData = newMap.get(stageUsername) || {
                  username: stageUsername,
                  position: { x: 0, y: 0 }
                };
                newMap.set(stageUsername, { ...currentData, onStage });
                return newMap;
              });

              // Update players on stage list
              if (onStage) {
                setPlayersOnStage(prev => {
                  if (!prev.includes(stageUsername)) {
                    return [...prev, stageUsername];
                  }
                  return prev;
                });
              } else {
                setPlayersOnStage(prev =>
                  prev.filter(player => player !== stageUsername)
                );
              }
              break;

            case "existing_players":
              // Initialize map with existing players
              const existingPlayers = parsedMessage.players || [];
              console.log("Received existing players:", existingPlayers);

              setPlayers(prev => {
                const newMap = new Map(prev);
                existingPlayers.forEach((player: PlayerData) => {
                  newMap.set(player.username, player);
                  // Add to players on stage list if they're on stage
                  if (player.onStage) {
                    setPlayersOnStage(prevPlayers => {
                      if (!prevPlayers.includes(player.username)) {
                        return [...prevPlayers, player.username];
                      }
                      return prevPlayers;
                    });
                  }
                });
                console.log("Updated players after existing_players:", Array.from(newMap.entries()));
                return newMap;
              });
              break;

            case "player_left":
              const { username: leftUsername } = parsedMessage;
              console.log("Player left:", leftUsername);

              setPlayers(prev => {
                const newMap = new Map(prev);
                newMap.delete(leftUsername);
                console.log("Updated players after leave:", Array.from(newMap.entries()));
                return newMap;
              });

              // Remove from players on stage if they were there
              setPlayersOnStage(prev =>
                prev.filter(player => player !== leftUsername)
              );
              break;

            case "game_state":
              // Handle incoming game state from other players
              const { username: gamePlayer, gameType, gameData } = parsedMessage;
              console.log("Received game state from:", gamePlayer, gameType);
              
              setGameState({
                gameType,
                gameData,
                player: gamePlayer
              });
              break;

            case "tv_video":
              // Handle TV video update from server
              const { username: videoUsername, videoId } = parsedMessage;
              console.log("Received TV video from:", videoUsername, videoId);
              
              setCurrentVideo({
                videoId,
                username: videoUsername
              });
              break;
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      console.log("Cleaning up WebSocket connection...");
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    messages,
    players,
    joinRoom,
    sendMessage,
    sendPlayerMove,
    sendPlayerOnStage,
    leaveRoom,
    playersOnStage,
    sendGameState,
    gameState,
    sendTVVideo,
    currentVideo
  };
};
