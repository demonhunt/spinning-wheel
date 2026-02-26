import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../../shared/i18n';
import { WheelOption } from '../../shared/types/wheel';
import { drawWheel } from './wheelCanvas';
import { useWheelSpin } from './useWheelSpin';

interface SpinningWheelProps {
  options: WheelOption[];
  onSpinComplete: (winnerLabel: string) => void;
  disableWinnerLog?: boolean;
}

const MIN_WHEEL_SIZE = 220;
const MAX_WHEEL_SIZE = 920;

function getResponsiveWheelSize(): number {
  const isMobile = window.innerWidth <= 768;
  const targetByHeight = Math.floor(window.innerHeight * (isMobile ? 0.62 : 0.8));
  const targetByWidth = Math.floor(window.innerWidth - (isMobile ? 16 : 24));
  return Math.max(MIN_WHEEL_SIZE, Math.min(MAX_WHEEL_SIZE, targetByHeight, targetByWidth));
}

function SpinningWheel({
  options,
  onSpinComplete,
  disableWinnerLog = false,
}: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [centerLogo, setCenterLogo] = React.useState<HTMLImageElement | null>(null);
  const [wheelSize, setWheelSize] = React.useState<number>(() => getResponsiveWheelSize());
  const { t } = useTranslation();

  const { rotation, spinning, spin } = useWheelSpin({
    options,
    onSpinEnd: (winnerLabel) => {
      onSpinComplete(winnerLabel);
    },
  });

  useEffect(() => {
    let active = true;
    const logoCandidates = ['wheel-center-logo.png', 'logo192.png'];

    const loadLogo = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
      });

    (async () => {
      for (const candidate of logoCandidates) {
        const src = `${process.env.PUBLIC_URL}/${candidate}`;
        try {
          const image = await loadLogo(src);
          if (active) setCenterLogo(image);
          return;
        } catch {
          // Try next logo candidate.
        }
      }

      if (active) setCenterLogo(null);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onResize = () => setWheelSize(getResponsiveWheelSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWheel(ctx, options, rotation, centerLogo);
  }, [centerLogo, options, rotation, wheelSize]);

  return (
    <div className="wheel-container">
      <div className="wheel-pointer" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        width={wheelSize}
        height={wheelSize}
        className="wheel-canvas"
      />
      <button className="spin-button" onClick={spin} disabled={spinning}>
        {spinning ? t.spinning : t.spin}
      </button>
    </div>
  );
}

export default SpinningWheel;
