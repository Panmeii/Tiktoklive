'use client';

import { useTikTokLive } from './hooks/useTikTokLive';
import dynamic from 'next/dynamic';
import UI from './components/UI';

// Dynamic import untuk GameCanvas
const GameCanvas = dynamic(() => import('./components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="text-[#fe2c55] font-bold text-xl animate-pulse">
        Loading Arena...
      </div>
    </div>
  )
});

export default function Home() {
  const {
    isConnected,
    isConnecting,
    error,
    events,
    stats,
    connect,
    disconnect
  } = useTikTokLive();

  return (
    <main className="relative w-full h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: 'linear-gradient(rgba(254,44,85,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(254,44,85,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#fe2c55]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#25f4ee]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Game Canvas */}
      <GameCanvas 
        events={events} 
        isConnected={isConnected}
      />
      
      {/* UI Overlay */}
      <UI
        isConnected={isConnected}
        isConnecting={isConnecting}
        error={error}
        stats={stats}
        events={events}
        onConnect={connect}
        onDisconnect={disconnect}
      />
    </main>
  );
}
