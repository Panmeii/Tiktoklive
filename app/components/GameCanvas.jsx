'use client';

import { useEffect, useRef, useCallback } from 'react';

const CONFIG = {
  gravity: 0.5,
  jumpForce: -12,
  moveSpeed: 4,
  friction: 0.9,
  groundHeight: 100,
  colors: ['#fe2c55', '#25f4ee', '#ffe66d', '#ff6b9d', '#4ecdc4', '#a8e6cf', '#ff8b94', '#c7ceea']
};

export default function GameCanvas({ events, isConnected }) {
  const canvasRef = useRef(null);
  const playersRef = useRef(new Map());
  const particlesRef = useRef([]);
  const animationRef = useRef();
  const processedEventsRef = useRef(new Set());

  const spawnPlayer = useCallback((username) => {
    if (playersRef.current.has(username)) return;
    if (playersRef.current.size >= 30) return;

    const color = CONFIG.colors[playersRef.current.size % CONFIG.colors.length];
    
    playersRef.current.set(username, {
      id: username,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: 100,
      vx: 0,
      vy: 0,
      radius: 25,
      color,
      emoji: ['😀', '😎', '🤠', '🥳', '🤖', '👽', '🐱', '🐶'][Math.floor(Math.random() * 8)],
      scale: 1,
      glow: false,
      dancing: false
    });
  }, []);

  const handleChat = useCallback((username, message) => {
    if (!playersRef.current.has(username)) {
      spawnPlayer(username);
    }
    
    const player = playersRef.current.get(username);
    const cmd = message.toLowerCase();
    
    if (cmd.includes('jump') || cmd.includes('lompat')) {
      player.vy = CONFIG.jumpForce;
      createParticles(player.x, player.y + player.radius, player.color, 8);
    }
    else if (cmd.includes('left') || cmd.includes('kiri')) {
      player.vx = -CONFIG.moveSpeed * 3;
      setTimeout(() => player.vx = 0, 300);
    }
    else if (cmd.includes('right') || cmd.includes('kanan')) {
      player.vx = CONFIG.moveSpeed * 3;
      setTimeout(() => player.vx = 0, 300);
    }
    else if (cmd.includes('dance') || cmd.includes('joget')) {
      player.dancing = true;
      setTimeout(() => player.dancing = false, 2000);
    }
  }, [spawnPlayer]);

  const handleGift = useCallback((username) => {
    if (!playersRef.current.has(username)) {
      spawnPlayer(username);
    }
    const player = playersRef.current.get(username);
    player.glow = true;
    player.scale = 1.3;
    setTimeout(() => {
      player.glow = false;
      player.scale = 1;
    }, 3000);
    createParticles(player.x, player.y, '#ffd700', 20);
  }, [spawnPlayer]);

  const createParticles = (x, y, color, count) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: Math.random() * 4 + 2
      });
    }
  };

  // Process events
  useEffect(() => {
    if (!events.length) return;
    
    events.slice(-5).forEach(event => {
      if (processedEventsRef.current.has(event.id)) return;
      processedEventsRef.current.add(event.id);
      
      switch(event.type) {
        case 'chat':
          handleChat(event.user, event.msg);
          break;
        case 'gift':
          handleGift(event.user);
          break;
        case 'like':
          createParticles(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight,
            '#fe2c55',
            5
          );
          break;
        case 'join':
          spawnPlayer(event.user);
          break;
      }
    });
  }, [events, handleChat, handleGift, spawnPlayer]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);

    const gameLoop = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const groundY = canvas.height - CONFIG.groundHeight;
      
      // Draw grid
      ctx.strokeStyle = 'rgba(254, 44, 85, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Update and draw players
      playersRef.current.forEach((player) => {
        // Physics
        player.vy += CONFIG.gravity;
        player.x += player.vx;
        player.y += player.vy;
        player.vx *= CONFIG.friction;
        
        // Ground collision
        if (player.y + player.radius > groundY) {
          player.y = groundY - player.radius;
          player.vy = -player.vy * 0.3;
          if (Math.abs(player.vy) < 1) player.vy = 0;
        }
        
        // Wall collision
        if (player.x < player.radius) {
          player.x = player.radius;
          player.vx = 0;
        }
        if (player.x > canvas.width - player.radius) {
          player.x = canvas.width - player.radius;
          player.vx = 0;
        }
        
        // Dance animation
        let drawX = player.x;
        if (player.dancing) {
          drawX += Math.sin(Date.now() / 100) * 10;
        }
        
        // Draw player
        ctx.save();
        if (player.glow) {
          ctx.shadowColor = player.color;
          ctx.shadowBlur = 30;
        }
        
        const r = player.radius * player.scale;
        const gradient = ctx.createRadialGradient(drawX - r/3, player.y - r/3, 0, drawX, player.y, r);
        gradient.addColorStop(0, lightenColor(player.color, 50));
        gradient.addColorStop(1, player.color);
        
        ctx.beginPath();
        ctx.arc(drawX, player.y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        
        // Emoji
        ctx.font = `${r}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.emoji, drawX, player.y);
        
        // Name
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(player.id.substring(0, 8), drawX, player.y - r - 12);
      });
      
      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.02;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }
      
      // Draw ground
      const gradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 52, 96, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      
      ctx.shadowColor = '#fe2c55';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#fe2c55';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Connection status
      if (!isConnected) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WAITING FOR CONNECTION...', canvas.width / 2, canvas.height / 2);
      }
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isConnected]);

  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
