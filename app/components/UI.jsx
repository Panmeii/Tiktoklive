'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
    // Keep only last 10 events for display
    setRecentEvents(events.slice(-10).reverse());
  }, [events]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onConnect(username.trim());
    }
  };

  return (
    <div className="relative z-10 pointer-events-none">
      {/* Connection Panel */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md"
            >
              {/* Logo */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-block text-6xl mb-4"
                >
                  🎮
                </motion.div>
                <h1 className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] neon-text">
                  TIKTOK LIVE
                </h1>
                <p className="text-gray-400 mt-2">Interactive Battle Arena</p>
              </div>

              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
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
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55] focus:ring-2 focus:ring-[#fe2c55]/20 transition-all"
                      disabled={isConnecting}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isConnecting || !username.trim()}
                  className="w-full bg-gradient-to-r from-[#fe2c55] to-[#ff6b6b] hover:from-[#ff3d6b] hover:to-[#ff7c7c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] font-orbitron"
                >
                  {isConnecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        ⏳
                      </motion.span>
                      Connecting...
                    </span>
                  ) : (
                    'ENTER ARENA'
                  )}
                </button>

                <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-white/10">
                  <p>📱 Pastikan Anda sedang LIVE di TikTok</p>
                  <p>⚡ Biarkan browser tetap terbuka</p>
                  <p>🎮 Chat commands: jump, left, right, dance, attack</p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD - Heads Up Display */}
      {isConnected && (
        <>
          {/* Top Bar */}
          <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-auto">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="glass rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Status</div>
                <div className="font-orbitron font-bold text-green-400">LIVE</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex gap-3"
            >
              <StatBox label="Warriors" value={stats.viewers} color="#fe2c55" icon="⚔️" />
              <StatBox label="Likes" value={stats.likes} color="#25f4ee" icon="❤️" />
              <StatBox label="Gifts" value={stats.gifts} color="#ffd700" icon="🎁" />
            </motion.div>
          </div>

          {/* Event Feed */}
          <AnimatePresence>
            {showEvents && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="fixed right-4 top-24 w-72 max-h-96 overflow-hidden pointer-events-auto"
              >
                <div className="glass rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-orbitron font-bold text-sm text-gray-300">BATTLE LOG</h3>
                    <button
                      onClick={() => setShowEvents(false)}
                      className="text-gray-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {recentEvents.length === 0 ? (
                      <p className="text-gray-600 text-sm text-center py-4">Waiting for action...</p>
                    ) : (
                      recentEvents.map((event, i) => (
                        <EventItem key={event.id} event={event} index={i} />
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Event Button */}
          {!showEvents && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setShowEvents(true)}
              className="fixed right-4 top-24 glass p-3 rounded-xl pointer-events-auto hover:bg-white/10"
            >
              📜
            </motion.button>
          )}

          {/* Bottom Controls */}
          <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-auto">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass rounded-2xl p-4 max-w-md"
            >
              <h4 className="font-orbitron font-bold text-xs text-[#fe2c55] mb-2 uppercase">Commands</h4>
              <div className="flex flex-wrap gap-2">
                <CommandTag text="jump" desc="lompat" />
                <CommandTag text="left" desc="kiri" />
                <CommandTag text="right" desc="kanan" />
                <CommandTag text="dance" desc="joget" />
                <CommandTag text="attack" desc="serang" />
                <CommandTag text="grow" desc="besar" />
              </div>
            </motion.div>

            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={onDisconnect}
              className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 px-6 py-3 rounded-xl font-bold transition-all"
            >
              DISCONNECT
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value, color, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass rounded-xl p-3 min-w-[80px] text-center"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div 
        className="text-2xl font-orbitron font-black"
        style={{ color }}
      >
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

function EventItem({ event, index }) {
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
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-2 rounded-lg bg-white/5 text-sm"
    >
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
    </motion.div>
  );
}

function CommandTag({ text, desc }) {
  return (
    <div className="group relative">
      <span className="inline-block bg-[#fe2c55]/20 border border-[#fe2c55]/50 text-[#fe2c55] px-3 py-1 rounded-lg text-xs font-bold cursor-help">
        {text}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {desc}
      </div>
    </div>
  );
}
