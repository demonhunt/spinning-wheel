import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WheelOption } from './types';
import { pickWinnerIndex, getTargetAngleForIndex } from './wheelUtils';

interface SpinningWheelProps {
  options: WheelOption[];
  playerInfo: { email: string; phone: string };
  onFinish: () => void;
}

const WHEEL_SIZE = 400;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 10;
const GOOGLE_SHEET_URL = process.env.REACT_APP_GOOGLE_SHEET_URL || '';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function autoFontSize(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number,
  startSize: number,
  minSize: number
): number {
  for (let size = startSize; size >= minSize; size--) {
    ctx.font = `bold ${size}px Arial`;
    const fits = lines.every((line) => ctx.measureText(line).width <= maxWidth);
    if (fits) return size;
  }
  return minSize;
}

function SpinningWheel({ options, playerInfo, onFinish }: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const animationRef = useRef<number>(0);

  const totalRatio = options.reduce((sum, o) => sum + o.ratio, 0);

  const saveToGoogleSheet = async (winnerLabel: string) => {
    if (!GOOGLE_SHEET_URL) {
      console.warn('Google Sheet URL not configured, skipping log.');
      return;
    }
    try {
      const params = new URLSearchParams({
        email: playerInfo.email,
        phone: playerInfo.phone,
        winner: winnerLabel,
        timestamp: new Date().toISOString(),
      });
      await fetch(`${GOOGLE_SHEET_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors',
      });
    } catch (err) {
      console.error('Failed to log to Google Sheet:', err);
    }
  };

  const drawWheel = useCallback((currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    let startAngle = currentRotation;

    options.forEach((option) => {
      const sliceAngle = (option.ratio / totalRatio) * 2 * Math.PI;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = option.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label with word wrap and auto-sizing
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.textAlign = 'center';

      const maxWidth = RADIUS - 45;
      const lines = wrapText(ctx, option.label, maxWidth, 'bold 14px Arial');
      const fontSize = autoFontSize(ctx, lines, maxWidth, 14, 8);
      ctx.font = `bold ${fontSize}px Arial`;
      const lineHeight = fontSize * 1.3;
      const totalHeight = lines.length * lineHeight;
      const startY = -totalHeight / 2 + lineHeight / 2;
      const textX = 30 + (RADIUS - 45) / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, textX, startY + i * lineHeight);
      });

      ctx.restore();

      startAngle += sliceAngle;
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [options, totalRatio]);

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation, drawWheel]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    setShowResult(false);

    const winnerIdx = pickWinnerIndex(options);
    const targetAngle = getTargetAngleForIndex(options, winnerIdx);
    
    // Extra rotations for effect
    const extraSpins = 5 * 2 * Math.PI;
    const totalRotationToApply = targetAngle + extraSpins;

    const duration = 5000;
    const startTime = performance.now();
    const startRotation = rotation;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // Ease-out quartic
      const currentRotation = startRotation + totalRotationToApply * eased;
      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        const winnerLabel = options[winnerIdx].label;
        setSpinning(false);
        setWinner(winnerLabel);
        setShowResult(true);
        saveToGoogleSheet(winnerLabel);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="wheel-container">
      <div className="wheel-pointer">▼</div>
      <canvas
        ref={canvasRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        className="wheel-canvas"
      />
      <button className="spin-button" onClick={spin} disabled={spinning}>
        {spinning ? 'Spinning...' : 'SPIN!'}
      </button>

      {showResult && (
        <div className="result-overlay">
          <div className="result-modal">
            <h2>🎉 Congratulations! 🎉</h2>
            <p className="winner-label">You won:</p>
            <p className="winner-name">{winner}</p>
            <button className="finish-button" onClick={onFinish}>
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpinningWheel;
