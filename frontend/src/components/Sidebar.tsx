import { useEffect, useRef, useState } from 'react';
import type { BroadcastedMSG, PlayerData } from '../hooks/useWebSocket';

interface SidebarProps {
  roomslug: string;
  username: string;
  isConnected: boolean;
  messages: BroadcastedMSG[];
  sendMessage: (content: string, roomslug: string, username: string) => void;
  players: Map<string, PlayerData>;
  videoId: string;
  onVideoChange?: (videoId: string) => void;
  onLeave?: () => void;
}

export default function Sidebar({ 
  roomslug, 
  username, 
  isConnected, 
  messages, 
  sendMessage,
  players,
  videoId,
  onVideoChange,
  onLeave
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'members'>('messages');
  const messageRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [videoInput, setVideoInput] = useState('');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageRef.current && messageRef.current.value.trim()) {
      sendMessage(messageRef.current.value, roomslug, username);
      messageRef.current.value = '';
    }
  };

  const extractVideoId = (url: string): string | null => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVideoId = extractVideoId(videoInput.trim());
    if (newVideoId && onVideoChange) {
      onVideoChange(newVideoId);
      setVideoInput('');
    }
  };

  // Convert players map to array for display
  const membersList = Array.from(players.values());

  if (!isConnected) {
    return (
      <div className="w-full h-full bg-[#392e2b] flex items-center justify-center">
        <div className="text-[#e8d4b7] animate-pulse">Connecting...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#392e2b] h-full flex flex-col border-l-4 border-[#5d4037] shadow-lg text-[#e8d4b7]">
      <div className={`px-2 py-1 text-xs ${isConnected ? 'bg-green-800' : 'bg-red-800'}`}>
        {isConnected ? '● Connected to chat' : '○ Disconnected - trying to reconnect...'}
      </div>

      <div className="h-3/5 flex flex-col">
        <div className="flex border-b-4 border-[#5d4037]">
          <button
            className={`flex-1 py-2 px-4 text-center transition-colors ${
              activeTab === 'messages' 
                ? 'bg-[#cb803e] text-white' 
                : 'bg-[#392e2b] hover:bg-[#4d3c38]'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            <div className="text-lg mb-1">💬</div>
            <span className="text-sm">Messages</span>
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center transition-colors ${
              activeTab === 'members' 
                ? 'bg-[#cb803e] text-white' 
                : 'bg-[#392e2b] hover:bg-[#4d3c38]'
            }`}
            onClick={() => setActiveTab('members')}
          >
            <div className="text-lg mb-1">👥</div>
            <span className="text-sm">Members ({membersList.length})</span>
          </button>
        </div>

        <div className="flex-grow overflow-auto p-3 bg-[#2e2421]">
          {activeTab === 'messages' && (
            <div className="messages-container overflow-y-auto max-h-full space-y-3 px-2">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message border-2 border-[#5d4037] bg-[#3e322f] p-3 rounded-lg ${
                    message.isOwnMessage ? 'ml-6 border-l-4 border-l-[#cb803e]' : 'mr-6'
                  }`}
                >
                  <div className="message-header flex justify-between items-center">
                    <span className="font-bold text-[#ffc107] text-sm">
                      {message.isOwnMessage ? 'You' : message.sender}
                    </span>
                    <span className="text-xs text-[#a1887f]">
                      {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="message-body mt-1 text-[#e8d4b7] text-sm break-words">
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />

              {messages.length === 0 && (
                <div className="text-center text-[#a1887f] mt-8 text-sm">
                  No messages yet. Be the first to say hello! 👋
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="grid grid-cols-1 gap-2">
              <div className="member-card p-3 border-2 border-[#4caf50] bg-[#3e322f] rounded-lg flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-[#cb803e] rounded-lg text-xl mr-3">
                  👤
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="font-bold text-[#ffc107]">{username} (You)</span>
                  <span className="text-xs text-[#4caf50]">● Online</span>
                </div>
                {players.get(username)?.onStage && (
                  <span className="text-xs bg-[#ffaa00] text-black px-2 py-1 rounded">On Stage</span>
                )}
              </div>

              {membersList
                .filter(member => member.username !== username)
                .map(member => (
                  <div 
                    key={member.username} 
                    className="member-card p-3 border-2 border-[#5d4037] bg-[#3e322f] rounded-lg flex items-center"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-[#5d4037] rounded-lg text-xl mr-3">
                      👤
                    </div>
                    <div className="flex flex-col flex-grow">
                      <span className="font-bold">{member.username}</span>
                      <span className="text-xs text-[#4caf50]">● Online</span>
                    </div>
                    {member.onStage && (
                      <span className="text-xs bg-[#ffaa00] text-black px-2 py-1 rounded">On Stage</span>
                    )}
                  </div>
                ))}

              {membersList.length <= 1 && (
                <div className="text-center text-[#a1887f] mt-4 text-sm">
                  No other players in the room yet.
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab === 'messages' && (
          <form
            className="chat-input-container p-3 bg-[#3e322f] border-t-4 border-[#5d4037]"
            onSubmit={handleSendMessage}
          >
            <div className="flex">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-grow p-2 rounded-l-lg bg-[#2e2421] border-2 border-[#5d4037] text-[#e8d4b7] focus:outline-none focus:border-[#cb803e] text-sm"
                ref={messageRef}
                disabled={!isConnected}
              />
              <button
                type="submit"
                className={`px-4 py-2 ${
                  isConnected 
                    ? 'bg-[#cb803e] hover:bg-[#b36d2d]' 
                    : 'bg-gray-500 cursor-not-allowed'
                } text-white rounded-r-lg transition-colors font-bold`}
                disabled={!isConnected}
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="h-2/5 border-t-4 border-[#5d4037] flex flex-col">
        <div className="bg-[#392e2b] p-2 border-b-2 border-[#5d4037]">
          <h3 className="font-bold text-[#ffc107] px-2 flex items-center gap-2">
            📺 Watch Together
          </h3>
        </div>

        <div className="flex-grow bg-[#2e2421] p-2 flex flex-col">
          {/* Video input */}
          <form onSubmit={handleVideoSubmit} className="mb-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder="Paste YouTube link..."
                className="flex-grow p-1.5 rounded-l-lg bg-[#3e322f] border-2 border-[#5d4037] text-[#e8d4b7] focus:outline-none focus:border-[#cb803e] text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#cb803e] hover:bg-[#b36d2d] text-white rounded-r-lg transition-colors text-xs font-bold"
              >
                Play
              </button>
            </div>
          </form>

          {/* YouTube embed */}
          <div className="flex-grow border-4 border-[#5d4037] rounded-lg overflow-hidden bg-black">
            {videoId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#a1887f] text-sm">
                No video playing. Paste a YouTube link above!
              </div>
            )}
          </div>

          {/* Leave button */}
          {onLeave && (
            <button
              onClick={onLeave}
              className="mt-3 w-full py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg transition-colors font-bold text-sm"
            >
              🚪 Leave Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
