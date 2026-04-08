'use client';

import { useState, useEffect } from 'react';

export default function UI({ 
  isConnected, 
  isConnecting, 
  error, 
  stats, 
  events,
  onConnect, 
  onDisconnect 
}) {
  const [username, setUsername] = useState('');
  const [showEvents, setShowEvents] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    setRecentEvents(events.slice(-10).reverse());
  }, [events]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onConnect(username.trim());
    }
  };

  // Connection Panel
  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🎮</div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fe2c55] to-[#25f4ee]">
              TIKTOK LIVE
            </h1>
            <p className="text-gray-400 mt-2">Interactive Battle Arena</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-4 border border-white/20">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Username TikTok Live
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full bg-black/50 border border-white/20 rounded-xl py-4 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55] focus:ring-2 focus:ring-[#fe2c55]/20"
                  disabled={isConnecting}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isConnecting || !username.trim()}
              className="w-full bg-gradient-to-r from-[#fe2c55] to-[#ff6b6b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isConnecting ? 'Connecting...' : 'ENTER ARENA'}
            </button>

            <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-white/10">
              <p>📱 Pastikan Anda sedang LIVE di TikTok</p>
              <p>⚡ Demo mode aktif jika server tidak tersedia</p>
              <p>🎮 Chat: jump, left, right, dance, attack</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // HUD (Heads Up Display)
  return (
    <div className="relative z-10 pointer-events-none">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 flex items-center gap-4 border border-white/20">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Status</div>
            <div className="font-bold text-green-400">LIVE</div>
          </div>
        </div>

        <div className="flex gap-3">
          <StatBox label="Warriors" value={stats.viewers} color="#fe2c55" icon="⚔️" />
          <StatBox label="Likes" value={stats.likes} color="#25f4ee" icon="❤️" />
          <StatBox label="Gifts" value={stats.gifts} color="#ffd700" icon="🎁" />
        </div>
      </div>

      {/* Event Feed */}
      {showEvents && (
        <div className="fixed right-4 top-24 w-72 max-h-96 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-gray-300">BATTLE LOG</h3>
              <button onClick={() => setShowEvents(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {recentEvents.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">Waiting for action...</p>
              ) : (
                recentEvents.map((event, i) => (
                  <EventItem key={event.id || i} event={event} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!showEvents && (
        <button
          onClick={() => setShowEvents(true)}
          className="fixed right-4 top-24 bg-black/60 p-3 rounded-xl pointer-events-auto hover:bg-white/10"
        >
          📜
        </button>
      )}

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <h4 className="font-bold text-xs text-[#fe2c55] mb-2 uppercase">Commands</h4>
          <div className="flex flex-wrap gap-2">
            {['jump', 'left', 'right', 'dance', 'attack'].map(cmd => (
              <span key={cmd} className="bg-[#fe2c55]/20 border border-[#fe2c55]/50 text-[#fe2c55] px-3 py-1 rounded-lg text-xs font-bold">
                {cmd}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onDisconnect}
          className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 px-6 py-3 rounded-xl font-bold transition-all"
        >
          DISCONNECT
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, icon }) {
  return (
    <div className="bg-black/60 backdrop-blur-lg rounded-xl p-3 min-w-[80px] text-center border border-white/20">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 uppercase">{label}</div>
    </div>
  );
}

function EventItem({ event }) {
  const getIcon = () => {
    switch(event.type) {
      case 'chat': return '💬';
      case 'gift': return '🎁';
      case 'like': return '❤️';
      case 'join': return '👋';
      default: return '✨';
    }
  };

  const getColor = () => {
    switch(event.type) {
      case 'chat': return 'text-blue-400';
      case 'gift': return 'text-yellow-400';
      case 'like': return 'text-pink-400';
      case 'join': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg bg-white/5 text-sm">
      <span className="text-lg">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-bold truncate ${getColor()}`}>
          {event.user || 'Unknown'}
        </div>
        <div className="text-gray-400 text-xs truncate">
          {event.type === 'chat' && event.msg}
          {event.type === 'gift' && `Sent ${event.gift} x${event.count}`}
          {event.type === 'like' && `Liked x${event.count}`}
          {event.type === 'join' && 'Joined the arena'}
        </div>
      </div>
    </div>
  );
}
