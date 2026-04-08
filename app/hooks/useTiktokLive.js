'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useTikTokLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    viewers: 0,
    likes: 0,
    gifts: 0
  });
  
  const socketRef = useRef(null);
  const eventsRef = useRef([]);

  const connect = useCallback(async (username) => {
    if (!username || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Gunakan environment variable atau fallback ke demo mode
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
      
      // Jika tidak ada server URL, aktifkan demo mode
      if (!SERVER_URL) {
        console.log('⚠️ No server URL, starting DEMO mode');
        startDemoMode(username);
        return;
      }

      const socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
      });
      
      socket.on('connect', () => {
        console.log('✅ Connected to game server');
        socket.emit('connect-to-live', { username: username.replace('@', '') });
      });
      
      socket.on('connected', (data) => {
        console.log('✅ TikTok Live connected:', data);
        setIsConnected(true);
        setIsConnecting(false);
      });
      
      socket.on('live-event', (data) => {
        const event = {
          ...data,
          id: data.uniqueId || `${Date.now()}-${Math.random()}`
        };
        
        eventsRef.current = [...eventsRef.current.slice(-99), event];
        setEvents([...eventsRef.current]);
        
        setStats(prev => ({
          viewers: event.type === 'join' ? prev.viewers + 1 : prev.viewers,
          likes: event.type === 'like' ? prev.likes + (event.count || 1) : prev.likes,
          gifts: event.type === 'gift' ? prev.gifts + 1 : prev.gifts
        }));
      });
      
      socket.on('error', (err) => {
        console.error('❌ Server error:', err);
        setError(err.message || 'Connection failed');
        setIsConnecting(false);
      });
      
      socket.on('connect_error', (err) => {
        console.error('❌ Connection error:', err);
        // Fallback ke demo mode
        startDemoMode(username);
      });
      
      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);
      });
      
      socketRef.current = socket;
      
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnecting(false);
      // Fallback ke demo mode
      startDemoMode(username);
    }
  }, [isConnecting]);

  const startDemoMode = (username) => {
    console.log('🎮 Starting DEMO mode');
    setIsConnected(true);
    setIsConnecting(false);
    
    // Generate fake events
    const demoNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const demoCommands = ['jump', 'left', 'right', 'dance', 'attack', 'hello'];
    const demoGifts = ['Rose', 'GG', 'TikTok', 'Love'];
    
    const interval = setInterval(() => {
      if (!socketRef.current) {
        const rand = Math.random();
        
        if (rand < 0.6) {
          // Chat
          const name = demoNames[Math.floor(Math.random() * demoNames.length)] + Math.floor(Math.random() * 100);
          const cmd = demoCommands[Math.floor(Math.random() * demoCommands.length)];
          const event = {
            type: 'chat',
            user: name,
            msg: Math.random() > 0.3 ? cmd : 'Hello!',
            id: `${Date.now()}-${Math.random()}`
          };
          
          eventsRef.current = [...eventsRef.current.slice(-99), event];
          setEvents([...eventsRef.current]);
          
          setStats(prev => ({
            ...prev,
            viewers: prev.viewers + 1
          }));
        } else if (rand < 0.8) {
          // Like
          const event = {
            type: 'like',
            count: Math.floor(Math.random() * 5) + 1,
            id: `${Date.now()}-${Math.random()}`
          };
          eventsRef.current = [...eventsRef.current.slice(-99), event];
          setEvents([...eventsRef.current]);
          
          setStats(prev => ({
            ...prev,
            likes: prev.likes + event.count
          }));
        } else {
          // Gift
          const name = demoNames[Math.floor(Math.random() * demoNames.length)];
          const gift = demoGifts[Math.floor(Math.random() * demoGifts.length)];
          const event = {
            type: 'gift',
            user: name,
            gift: gift,
            count: Math.floor(Math.random() * 10) + 1,
            id: `${Date.now()}-${Math.random()}`
          };
          eventsRef.current = [...eventsRef.current.slice(-99), event];
          setEvents([...eventsRef.current]);
          
          setStats(prev => ({
            ...prev,
            gifts: prev.gifts + 1
          }));
        }
      }
    }, 2000);
    
    // Simpan interval untuk cleanup
    socketRef.current = { 
      isDemo: true, 
      demoInterval: interval,
      disconnect: () => clearInterval(interval)
    };
  };

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.isDemo) {
        // Demo mode cleanup
        clearInterval(socketRef.current.demoInterval);
      } else {
        // Real socket cleanup
        socketRef.current.emit('disconnect-live');
        socketRef.current.disconnect();
      }
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setEvents([]);
    eventsRef.current = [];
    setStats({ viewers: 0, likes: 0, gifts: 0 });
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        if (socketRef.current.isDemo) {
          clearInterval(socketRef.current.demoInterval);
        } else {
          socketRef.current.disconnect();
        }
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    events,
    stats,
    connect,
    disconnect
  };
}
