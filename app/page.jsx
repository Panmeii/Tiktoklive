'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTikTokLive } from './hooks/useTikTokLive';
import UI from './components/UI';

// Dynamic import untuk GameCanvas (client-side only)
const GameCanvas = dynamic(() => import('./components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="text-[#fe2c55] font-orbitron text-xl animate-pulse">
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
    <main className="relative w-full h-screen bg-gradient-arena overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(254,44,85,0.1),transparent_70%)]" />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#fe2c55]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#25f4ee]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
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
