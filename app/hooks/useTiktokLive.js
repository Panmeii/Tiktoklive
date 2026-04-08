'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
  
  const wsRef = useRef(null);
  const eventsRef = useRef([]);

  const connect = useCallback(async (username) => {
    if (!username || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Determine WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `${protocol}//${window.location.host}/api/socket`
        : 'ws://localhost:3001';
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({
          action: 'connect',
          username: username.replace('@', '')
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleEvent(data);
      };
      
      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection failed. Please try again.');
        setIsConnecting(false);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
      
      wsRef.current = ws;
      
    } catch (err) {
      setError(err.message);
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const handleEvent = useCallback((data) => {
    switch(data.type) {
      case 'connected':
        setIsConnected(true);
        setIsConnecting(false);
        break;
        
      case 'error':
        setError(data.message);
        setIsConnecting(false);
        break;
        
      case 'chat':
      case 'gift':
      case 'like':
      case 'join':
      case 'follow':
        // Add to events queue
        const newEvent = {
          ...data,
          id: Date.now() + Math.random(),
          timestamp: Date.now()
        };
        
        eventsRef.current = [...eventsRef.current.slice(-49), newEvent];
        setEvents(eventsRef.current);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          viewers: data.type === 'join' ? prev.viewers + 1 : prev.viewers,
          likes: data.type === 'like' ? prev.likes + data.count : prev.likes,
          gifts: data.type === 'gift' ? prev.gifts + 1 : prev.gifts
        }));
        break;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setEvents([]);
    setStats({ viewers: 0, likes: 0, gifts: 0 });
  }, []);

  const clearEvents = useCallback(() => {
    eventsRef.current = [];
    setEvents([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
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
    disconnect,
    clearEvents
  };
}
