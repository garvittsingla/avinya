//@ts-ignore
import { WebSocketServer, WebSocket } from "ws";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

interface User {
    ws: WebSocket;
    rooms: string[];
    username: string;
    position?: { x: number; y: number };
    onStage?: boolean;
    lastHeartbeat?: number;
}

const users: User[] = [];

// Store current video ID for each room
const roomVideos: Map<string, string> = new Map();

// Heartbeat interval in milliseconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT = 60000; // 60 seconds

// Function to remove a user and notify others
function removeUser(user: User) {
    const index = users.indexOf(user);
    if (index > -1) {
        // Notify all users in the same rooms that this user has left
        user.rooms.forEach(room => {
            const usersInRoom = users.filter(u => u.rooms.includes(room) && u !== user);
            usersInRoom.forEach(u => {
                u.ws.send(JSON.stringify({
                    type: "player_left",
                    username: user.username,
                    roomslug: room
                }));
            });
        });
        users.splice(index, 1);
        console.log(`User ${user.username} removed. Total users: ${users.length}`);
    }
}

// Start heartbeat check interval
setInterval(() => {
    const now = Date.now();
    users.forEach(user => {
        if (user.lastHeartbeat && (now - user.lastHeartbeat) > HEARTBEAT_TIMEOUT) {
            console.log(`User ${user.username} timed out, removing...`);
            removeUser(user);
        }
    });
}, HEARTBEAT_INTERVAL);

console.log(`WebSocket server started on port ${PORT}`);

wss.on("connection", (ws) => {
    const user: User = {
        ws: ws,
        rooms: [],
        username: "",
        lastHeartbeat: Date.now()
    };

    users.push(user);
    console.log("New connection established. Total users:", users.length);

    // Set up heartbeat for this connection
    const heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
        }
    }, HEARTBEAT_INTERVAL);

    ws.on("message", async (message) => {
        try {
            let request;
            if (typeof message === "string") {
                request = JSON.parse(message);
            } else {
                request = JSON.parse(message.toString());
            }

            // Update last heartbeat time for any message
            user.lastHeartbeat = Date.now();

            if (request.type === "pong") {
                return;
            }

            console.log("Server received message:", request);

            if (request.type === "join") {
                const roomslug = request.roomslug;
                const username = request.username;

                console.log(`Processing join request for user ${username} in room ${roomslug}`);

                // Check if user already exists in the room
                if (user.rooms.includes(roomslug)) {
                    console.log(`User ${username} is already in room ${roomslug}`);
                    return;
                }

                user.rooms.push(roomslug);
                user.username = username;

                const usersInRoom = users.filter(x => x.rooms.includes(roomslug));
                console.log(`Users in room ${roomslug}:`, usersInRoom.map(u => u.username));

                // Notify existing users about the new player
                for (const existingUser of usersInRoom) {
                    if (existingUser !== user) {
                        console.log(`Notifying ${existingUser.username} about new player ${username}`);

                        // Send chat notification
                        existingUser.ws.send(JSON.stringify({
                            type: "chat",
                            content: `${username} joined ${roomslug}`,
                            username: "Server"
                        }));

                        // Send player_joined notification
                        existingUser.ws.send(JSON.stringify({
                            type: "player_joined",
                            username: username,
                            position: user.position || { x: 0, y: 0 }
                        }));
                    }
                }

                // Send existing players to the new user
                const existingPlayers = usersInRoom
                    .filter(x => x !== user)
                    .map(x => ({
                        username: x.username,
                        position: x.position || { x: 0, y: 0 },
                        onStage: x.onStage || false
                    }));

                console.log(`Sending existing players to ${username}:`, existingPlayers);

                ws.send(JSON.stringify({
                    type: "existing_players",
                    players: existingPlayers
                }));

                // Send current video if one is playing in this room
                const currentVideo = roomVideos.get(roomslug);
                if (currentVideo) {
                    ws.send(JSON.stringify({
                        type: "tv_video",
                        videoId: currentVideo,
                        username: "Server"
                    }));
                }

                console.log(`Join process completed for ${username} in ${roomslug}`);
            }
            else if (request.type === "leave") {
                const roomslug = request.roomslug;
                const username = request.username;

                console.log(`User ${username} is leaving room ${roomslug}`);

                // Remove room from user's rooms
                const roomIndex = user.rooms.indexOf(roomslug);
                if (roomIndex > -1) {
                    user.rooms.splice(roomIndex, 1);

                    // Notify other users in the room
                    const usersInRoom = users.filter(x => x.rooms.includes(roomslug) && x !== user);
                    for (const userInRoom of usersInRoom) {
                        userInRoom.ws.send(JSON.stringify({
                            type: "player_left",
                            username: username,
                            roomslug: roomslug
                        }));
                    }
                }

                ws.send(JSON.stringify({ type: "left" }));
            }
            else if (request.type === "chat") {
                const roomslug = request.roomslug;
                const content = request.content;
                const username = request.username;
                const sentTime = request.sentTime || new Date();

                console.log(`Processing chat message from ${username} in room ${roomslug}:`, content);

                // Broadcast to all users in the room except sender
                const usersInRoom = users.filter(x => x.rooms.includes(roomslug) && x !== user);
                for (const userInRoom of usersInRoom) {
                    userInRoom.ws.send(JSON.stringify({
                        type: "chat",
                        content: content,
                        username: username,
                        time: sentTime,
                        sender: username
                    }));
                }
            }
            else if (request.type === "player_move") {
                const roomslug = request.roomslug;
                const username = request.username;
                const position = request.position;

                // Update user position
                user.position = position;

                // Broadcast position to all users in the same room
                const usersInRoom = users.filter(x => x.rooms.includes(roomslug) && x !== user);
                for (const userInRoom of usersInRoom) {
                    userInRoom.ws.send(JSON.stringify({
                        type: "player_move",
                        username: username,
                        roomslug: roomslug,
                        position: position
                    }));
                }
            }
            else if (request.type === "player_on_stage") {
                const roomslug = request.roomslug;
                const username = request.username;
                const onStage = request.onStage;

                // Update user stage status
                user.onStage = onStage;

                // Broadcast stage status to all users in the same room
                const usersInRoom = users.filter(x => x.rooms.includes(roomslug) && x !== user);
                for (const userInRoom of usersInRoom) {
                    userInRoom.ws.send(JSON.stringify({
                        type: "player_on_stage",
                        username: username,
                        roomslug: roomslug,
                        onStage: onStage
                    }));
                }
            }
            else if (request.type === "game_state") {
                const roomslug = request.roomslug;
                const username = request.username;
                const gameType = request.gameType;
                const gameData = request.gameData;

                console.log(`Game state update from ${username} in room ${roomslug}:`, gameType);

                // Broadcast game state to all users on stage in the same room (except sender)
                const usersOnStage = users.filter(x => 
                    x.rooms.includes(roomslug) && 
                    x !== user && 
                    x.onStage === true
                );
                
                for (const userOnStage of usersOnStage) {
                    userOnStage.ws.send(JSON.stringify({
                        type: "game_state",
                        username: username,
                        roomslug: roomslug,
                        gameType: gameType,
                        gameData: gameData
                    }));
                }
            }
            else if (request.type === "tv_video") {
                const roomslug = request.roomslug;
                const username = request.username;
                const videoId = request.videoId;

                console.log(`TV video update from ${username} in room ${roomslug}: ${videoId}`);

                // Store the video for this room
                roomVideos.set(roomslug, videoId);

                // Broadcast to all users in the room (including sender for confirmation)
                const usersInRoom = users.filter(x => x.rooms.includes(roomslug));
                for (const userInRoom of usersInRoom) {
                    userInRoom.ws.send(JSON.stringify({
                        type: "tv_video",
                        username: username,
                        roomslug: roomslug,
                        videoId: videoId
                    }));
                }
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on("close", () => {
        console.log(`Connection closed for user ${user.username}`);
        clearInterval(heartbeatInterval);
        removeUser(user);
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        clearInterval(heartbeatInterval);
        removeUser(user);
    });
});