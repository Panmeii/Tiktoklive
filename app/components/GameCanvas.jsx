'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GAME_CONFIG = {
  gravity: 0.5,
  jumpForce: -12,
  moveSpeed: 4,
  friction: 0.9,
  groundHeight: 100,
  colors: [
    '#fe2c55', '#25f4ee', '#ffe66d', '#ff6b9d', 
    '#4ecdc4', '#a8e6cf', '#ff8b94', '#c7ceea',
    '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b'
  ]
};

export default function GameCanvas({ events, isConnected }) {
  const canvasRef = useRef(null);
  const playersRef = useRef(new Map());
  const particlesRef = useRef([]);
  const animationRef = useRef();
  const processedEventsRef = useRef(new Set());

  // Process game events
  useEffect(() => {
    if (!events.length) return;
    
    const latestEvents = events.slice(-5); // Process last 5 events
    
    latestEvents.forEach(event => {
      if (processedEventsRef.current.has(event.id)) return;
      processedEventsRef.current.add(event.id);
      
      switch(event.type) {
        case 'chat':
          handleChat(event.user, event.msg);
          break;
        case 'gift':
          handleGift(event.user, event.gift, event.count);
          break;
        case 'like':
          handleLike(event.count);
          break;
        case 'join':
          spawnPlayer(event.user);
          break;
      }
    });
  }, [events]);

  const spawnPlayer = useCallback((username) => {
    if (playersRef.current.has(username)) return;
    if (playersRef.current.size >= 30) return; // Max players
    
    const color = GAME_CONFIG.colors[playersRef.current.size % GAME_CONFIG.colors.length];
    
    playersRef.current.set(username, {
      id: username,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: 100,
      vx: 0,
      vy: 0,
      radius: 25,
      color,
      emoji: getRandomEmoji(),
      scale: 1,
      glow: false,
      dancing: false,
      attacking: false,
      health: 100,
      score: 0
    });
  }, []);

  const handleChat = useCallback((username, message) => {
    if (!playersRef.current.has(username)) {
      spawnPlayer(username);
    }
    
    const player = playersRef.current.get(username);
    const cmd = message.toLowerCase();
    
    // Show floating text
    createFloatingText(username, message, player.x, player.y - 50);
    
    // Commands
    if (cmd.includes('jump') || cmd.includes('lompat')) {
      player.vy = GAME_CONFIG.jumpForce;
      createParticles(player.x, player.y + player.radius, player.color, 8);
    }
    else if (cmd.includes('left') || cmd.includes('kiri')) {
      player.vx = -GAME_CONFIG.moveSpeed * 3;
      setTimeout(() => player.vx = 0, 300);
    }
    else if (cmd.includes('right') || cmd.includes('kanan')) {
      player.vx = GAME_CONFIG.moveSpeed * 3;
      setTimeout(() => player.vx = 0, 300);
    }
    else if (cmd.includes('dance') || cmd.includes('joget')) {
      player.dancing = true;
      setTimeout(() => player.dancing = false, 2000);
      createParticles(player.x, player.y, '#ff00ff', 10);
    }
    else if (cmd.includes('attack') || cmd.includes('serang') || cmd.includes('fire')) {
      player.attacking = true;
      createAttackEffect(player);
      setTimeout(() => player.attacking = false, 500);
    }
    else if (cmd.includes('grow') || cmd.includes('besar')) {
      player.scale = 1.5;
      setTimeout(() => player.scale = 1, 3000);
    }
  }, [spawnPlayer]);

  const handleGift = useCallback((username, giftName, count) => {
    if (!playersRef.current.has(username)) {
      spawnPlayer(username);
    }
    
    const player = playersRef.current.get(username);
    
    // Visual buff
    player.glow = true;
    player.scale = 1.3;
    player.score += count * 100;
    
    setTimeout(() => {
      player.glow = false;
      player.scale = 1;
    }, 3000);
    
    // Create gift explosion
    createGiftExplosion(player.x, player.y, giftName);
    createParticles(player.x, player.y, '#ffd700', 20);
  }, [spawnPlayer]);

  const handleLike = useCallback((count) => {
    // Create like rain
    for (let i = 0; i < Math.min(count, 10); i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        createParticles(x, -20, '#fe2c55', 3);
      }, i * 50);
    }
  }, []);

  const createParticles = (x, y, color, count) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = Math.random() * 4 + 2;
      
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: Math.random() * 4 + 2,
        type: 'normal'
      });
    }
  };

  const createFloatingText = (user, text, x, y) => {
    particlesRef.current.push({
      x, y,
      vx: 0,
      vy: -1,
      life: 2,
      text: text.substring(0, 20),
      user: user.substring(0, 10),
      type: 'text'
    });
  };

  const createGiftExplosion = (x, y, giftName) => {
    particlesRef.current.push({
      x, y: y - 100,
      vx: 0,
      vy: -2,
      life: 3,
      giftName,
      type: 'gift'
    });
  };

  const createAttackEffect = (player) => {
    const direction = player.vx >= 0 ? 1 : -1;
    
    particlesRef.current.push({
      x: player.x + (direction * 40),
      y: player.y,
      vx: direction * 8,
      vy: 0,
      life: 0.5,
      color: '#ff0000',
      size: 15,
      type: 'projectile'
    });
  };

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
      // Clear with trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const groundY = canvas.height - GAME_CONFIG.groundHeight;
      
      // Draw grid
      drawGrid(ctx, canvas);
      
      // Update and draw players
      playersRef.current.forEach((player, id) => {
        // Physics
        player.vy += GAME_CONFIG.gravity;
        player.x += player.vx;
        player.y += player.vy;
        
        // Friction
        player.vx *= GAME_CONFIG.friction;
        
        // Ground collision
        if (player.y + player.radius > groundY) {
          player.y = groundY - player.radius;
          player.vy = -player.vy * 0.3; // Bounce
          if (Math.abs(player.vy) < 1) player.vy = 0;
        }
        
        // Wall collision
        if (player.x < player.radius) {
          player.x = player.radius;
          player.vx *= -0.5;
        }
        if (player.x > canvas.width - player.radius) {
          player.x = canvas.width - player.radius;
          player.vx *= -0.5;
        }
        
        // Dance animation
        let drawX = player.x;
        let drawY = player.y;
        
        if (player.dancing) {
          drawX += Math.sin(Date.now() / 100) * 10;
          drawY += Math.abs(Math.sin(Date.now() / 50)) * 5;
        }
        
        // Draw player
        drawPlayer(ctx, player, drawX, drawY);
      });
      
      // Update and draw particles
      updateParticles(ctx);
      
      // Draw ground
      drawGround(ctx, canvas, groundY);
      
      // Draw connection status
      if (!isConnected) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Orbitron';
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

  const drawGrid = (ctx, canvas) => {
    ctx.strokeStyle = 'rgba(254, 44, 85, 0.05)';
    ctx.lineWidth = 1;
    
    const time = Date.now() / 1000;
    const offsetX = (time * 20) % 50;
    
    for (let x = offsetX; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const drawPlayer = (ctx, player, x, y) => {
    const r = player.radius * player.scale;
    
    ctx.save();
    
    // Glow effect
    if (player.glow) {
      ctx.shadowColor = player.color;
      ctx.shadowBlur = 30;
    }
    
    // Outer ring (health indicator)
    ctx.beginPath();
    ctx.arc(x, y, r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${player.health / 200})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Main body
    const gradient = ctx.createRadialGradient(x - r/3, y - r/3, 0, x, y, r);
    gradient.addColorStop(0, lightenColor(player.color, 50));
    gradient.addColorStop(1, player.color);
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Attack effect
    if (player.attacking) {
      ctx.beginPath();
      ctx.arc(x + (player.vx >= 0 ? r + 10 : -r - 10), y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0000';
      ctx.fill();
    }
    
    ctx.restore();
    
    // Emoji
    ctx.font = `${r}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.emoji, x, y);
    
    // Name tag
    ctx.font = 'bold 11px Inter';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(player.id.substring(0, 8), x, y - r - 12);
    ctx.shadowBlur = 0;
    
    // Score
    if (player.score > 0) {
      ctx.font = '10px Inter';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(player.score, x, y + r + 15);
    }
  };

  const updateParticles = (ctx) => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      
      if (p.type === 'text') {
        p.y += p.vy;
        p.life -= 0.02;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        // Background
        const width = ctx.measureText(p.text).width + 20;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.roundRect(p.x - width/2, p.y - 25, width, 35, 8);
        ctx.fill();
        
        // Text
        ctx.fillStyle = '#fe2c55';
        ctx.font = 'bold 10px Inter';
        ctx.fillText(p.user, p.x, p.y - 12);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter';
        ctx.fillText(p.text, p.x, p.y + 5);
        
        ctx.restore();
      }
      else if (p.type === 'gift') {
        p.y += p.vy;
        p.life -= 0.01;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎁', p.x, p.y);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Orbitron';
        ctx.fillText(p.giftName, p.x, p.y - 30);
        ctx.restore();
      }
      else if (p.type === 'projectile') {
        p.x += p.vx;
        p.life -= 0.05;
        
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      else {
        // Normal particle
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.02;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }
  };

  const drawGround = (ctx, canvas, groundY) => {
    // Gradient ground
    const gradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(15, 52, 96, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Neon line
    ctx.shadowColor = '#fe2c55';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#fe2c55';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Grid on ground
    ctx.strokeStyle = 'rgba(254, 44, 85, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 20, canvas.height);
      ctx.stroke();
    }
  };

  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const getRandomEmoji = () => {
    const emojis = ['😀', '😎', '🤠', '🥳', '🤖', '👽', '🐱', '🐶', '🐼', '🦊', '🐸', '🐙', '🔥', '⚡', '💎'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}
