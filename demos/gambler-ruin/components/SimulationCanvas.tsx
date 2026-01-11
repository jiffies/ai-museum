import React, { useRef, useEffect, useState } from 'react';
import { SimulationConfig } from '../types';

interface SimulationCanvasProps {
  config: SimulationConfig;
}

interface Walker {
  x: number;
  y: number;
  history: { x: number; y: number }[];
  color: string;
  isDead: boolean;
  startOffset: number;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const requestRef = useRef<number>();
  const walkersRef = useRef<Walker[]>([]);
  
  // Use a ref for config to access latest values in animation loop without re-triggering effects
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset simulation when config mode changes strictly
  // We do NOT reset on simple parameter tweaks (like drift/speed) to allow real-time playing
  useEffect(() => {
    walkersRef.current = [];
  }, [config.mode]);

  const spawnWalker = (h: number, w: number) => {
    const startY = h / 2; 
    
    walkersRef.current.push({
      x: 50, 
      y: startY,
      history: [{x: 50, y: startY}],
      color: `hsl(${Math.random() * 40 + 200}, 90%, 60%)`, 
      isDead: false,
      startOffset: Math.random() * 100
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    
    const render = () => {
      frameCount++;
      const { width, height } = dimensions;
      const currentConfig = configRef.current; // Read latest config from ref
      
      // Clear with trail effect for intro, solid for others
      ctx.fillStyle = currentConfig.mode === 'intro' ? 'rgba(248, 250, 252, 0.2)' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid
      drawGrid(ctx, width, height);

      // Draw Barriers
      drawBarriers(ctx, width, height, currentConfig);

      // Manage Walkers
      const maxWalkers = currentConfig.mode === 'intro' ? 50 : 1;
      
      // Auto-spawn loop
      if (walkersRef.current.length < maxWalkers && Math.random() > 0.9) {
        spawnWalker(height, width);
      }
      // Ensure at least one for main demos
      if (currentConfig.mode !== 'intro' && walkersRef.current.filter(w => !w.isDead).length === 0 && Math.random() > 0.95) {
         spawnWalker(height, width);
      }

      // Update and Draw Walkers
      walkersRef.current.forEach((walker, index) => {
        if (walker.isDead) {
            // Fade out dead walkers
            drawWalkerPath(ctx, walker, 0.3);
            // Remove old dead walkers
            if(Math.random() > 0.95) walkersRef.current.splice(index, 1);
            return;
        }

        // Physics Step
        updateWalker(walker, currentConfig, width, height);
        
        // Draw
        drawWalkerPath(ctx, walker, 1);
        drawWalkerHead(ctx, walker);
      });

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions]); // Only restart if dimensions change

  const updateWalker = (walker: Walker, cfg: SimulationConfig, w: number, h: number) => {
    const speed = cfg.simulationSpeed;
    
    // X movement is constant time
    const dx = 2 * speed;
    
    // Y movement is the random walk + drift
    const randomForce = (Math.random() - 0.5) * 2 * cfg.volatility * 5;
    
    // Drift is constant directional force
    // In Canvas, Y increases downwards. 
    // Wealth going UP means Y decreasing.
    // Wealth going DOWN means Y increasing.
    
    const dy = -(randomForce + (cfg.drift * 1.5)); // Invert because canvas Y is down

    walker.x += dx;
    walker.y += dy;

    walker.history.push({ x: walker.x, y: walker.y });

    // Max history length optimization
    if (walker.history.length > 1000) walker.history.shift();

    // Check bounds / Absorption
    const cliffY = h - 50; // Bottom of screen
    const wallY = 50; // Top of screen (Visual limit)
    
    // Condition 1: Hit the cliff (bottom)
    if (cfg.showCliff && walker.y >= cliffY) {
        walker.y = cliffY;
        walker.isDead = true;
        walker.color = '#ef4444'; // Red
    }

    // Condition 2: Hit top (Market Wall)
    if (walker.y < wallY) {
        walker.y = wallY; 
    }

    // Reset if off screen right
    if (walker.x > w) {
        walker.isDead = true;
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y < h; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
  };

  const drawBarriers = (ctx: CanvasRenderingContext2D, w: number, h: number, cfg: SimulationConfig) => {
    const wallHeight = 50; // Visual height of top/bottom areas
    
    // Wall (Top - Implicit Market Cap)
    if (cfg.showWall) {
         // Gradient for the wall (Top down)
         const gradient = ctx.createLinearGradient(0, 0, 0, wallHeight);
         gradient.addColorStop(0, 'rgba(71, 85, 105, 0.2)'); // Slate-700 low opacity
         gradient.addColorStop(1, 'rgba(71, 85, 105, 0)');
         
         ctx.fillStyle = gradient;
         ctx.fillRect(0, 0, w, wallHeight);
         
         // Solid line at top visual boundary
         ctx.beginPath();
         ctx.strokeStyle = '#64748b'; // Slate-500
         ctx.lineWidth = 2;
         ctx.moveTo(0, 10); 
         ctx.lineTo(w, 10);
         ctx.stroke();

         // Text Label
         ctx.fillStyle = '#475569';
         ctx.font = 'bold 12px Inter';
         ctx.textBaseline = 'middle';
         ctx.textAlign = 'right';
         ctx.fillText('MARKET LIQUIDITY / THE DEALER (∞)', w - 20, 25);
         
         // Little lock icon or symbol
         ctx.beginPath();
         ctx.arc(w - 10, 25, 2, 0, Math.PI*2);
         ctx.fill();
    }

    // Cliff (Bottom)
    if (cfg.showCliff) {
        const cliffStart = h - wallHeight;
        
        const gradient = ctx.createLinearGradient(0, cliffStart, 0, h);
        gradient.addColorStop(0, 'rgba(254, 202, 202, 0)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, cliffStart, w, wallHeight);
        
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.moveTo(0, cliffStart);
        ctx.lineTo(w, cliffStart);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('YOUR CAPITAL / BANKRUPTCY (0)', w - 20, h - 25);
    }
    
    // Wind effect for negative drift
    if (cfg.drift < 0) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 1;
        const time = Date.now() / 800;
        // Draw arrows pointing DOWN (since drift is negative / loss)
        for(let i=0; i<15; i++) {
            const x = (time * 50 + i * 150) % w;
            const y = (i * (h/15)) % (h - 100) + 50; 
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 10, y + 10); // Arrow pointing down-right
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + 10, y); // Arrowhead
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x, y + 10); // Arrowhead
            ctx.stroke();
        }
    }
    
    // Positive drift wind (Upwards)
    if (cfg.drift > 0) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 1;
        const time = Date.now() / 800;
        for(let i=0; i<15; i++) {
            const x = (time * 50 + i * 150) % w;
            const y = h - ((i * (h/15)) % (h - 100) + 50); 
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 10, y - 10); // Arrow pointing up-right
            ctx.moveTo(x + 10, y - 10);
            ctx.lineTo(x + 10, y); // Arrowhead
            ctx.moveTo(x + 10, y - 10);
            ctx.lineTo(x, y - 10); // Arrowhead
            ctx.stroke();
        }
    }
  };

  const drawWalkerPath = (ctx: CanvasRenderingContext2D, walker: Walker, alpha: number) => {
    ctx.beginPath();
    ctx.strokeStyle = walker.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    
    if (walker.history.length > 1) {
        ctx.moveTo(walker.history[0].x, walker.history[0].y);
        for (let i = 1; i < walker.history.length; i++) {
            const xc = (walker.history[i].x + walker.history[i-1].x) / 2;
            const yc = (walker.history[i].y + walker.history[i-1].y) / 2;
            ctx.quadraticCurveTo(walker.history[i-1].x, walker.history[i-1].y, xc, yc);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const drawWalkerHead = (ctx: CanvasRenderingContext2D, walker: Walker) => {
    ctx.beginPath();
    ctx.fillStyle = walker.isDead ? '#ef4444' : '#3b82f6';
    ctx.shadowBlur = 10;
    ctx.shadowColor = walker.isDead ? '#ef4444' : '#3b82f6';
    ctx.arc(walker.x, walker.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 z-0">
      <canvas 
        ref={canvasRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="block"
      />
    </div>
  );
};