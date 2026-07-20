import React, { useEffect, useRef } from 'react';

export const NeonBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating wavy line data
    const lines = [
      {
        yOffset: height * 0.25,
        amplitude: 50,
        frequency: 0.001,
        speed: 0.006,
        color: 'rgba(168, 85, 247, 0.2)', // Violet/Purple glow
        glow: 'rgba(168, 85, 247, 0.8)',
        phase: 0,
      },
      {
        yOffset: height * 0.5,
        amplitude: 70,
        frequency: 0.0008,
        speed: -0.004,
        color: 'rgba(99, 102, 241, 0.18)', // Indigo glow
        glow: 'rgba(99, 102, 241, 0.75)',
        phase: Math.PI / 3,
      },
      {
        yOffset: height * 0.75,
        amplitude: 45,
        frequency: 0.0015,
        speed: 0.007,
        color: 'rgba(236, 72, 153, 0.15)', // Pink glow
        glow: 'rgba(236, 72, 153, 0.65)',
        phase: (Math.PI * 2) / 3,
      }
    ];

    const animate = () => {
      // Create a very subtle trail effect for smoother movement
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'; // Slate-950 background color
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      lines.forEach((line) => {
        line.phase += line.speed;

        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = line.color;
        
        // Neon glow settings
        ctx.shadowBlur = 18;
        ctx.shadowColor = line.glow;

        for (let x = 0; x < width; x += 10) {
          // Double sine wave calculation for random wavy motion
          const y = line.yOffset + 
            Math.sin(x * line.frequency + line.phase) * line.amplitude +
            Math.cos(x * (line.frequency * 0.45) - line.phase) * (line.amplitude * 0.35);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Reset canvas context settings for performance
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#020617]"
    />
  );
};
