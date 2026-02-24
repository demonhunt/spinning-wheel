import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../../shared/i18n';
import { PlayerInfo } from '../../shared/types/player';
import { WheelOption } from '../../shared/types/wheel';
import { drawWheel } from './wheelCanvas';
import { useWheelSpin } from './useWheelSpin';
import { logWinnerToGoogleSheet } from './winnerLogger';

interface SpinningWheelProps {
  options: WheelOption[];
  playerInfo: PlayerInfo;
}

const MIN_WHEEL_SIZE = 280;
const MAX_WHEEL_SIZE = 920;

function getResponsiveWheelSize(): number {
  const targetByHeight = Math.floor(window.innerHeight * 0.8);
  const targetByWidth = Math.floor(window.innerWidth * 0.92);
  return Math.max(MIN_WHEEL_SIZE, Math.min(MAX_WHEEL_SIZE, targetByHeight, targetByWidth));
}

function SpinningWheel({ options, playerInfo }: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [centerLogo, setCenterLogo] = React.useState<HTMLImageElement | null>(null);
  const [wheelSize, setWheelSize] = React.useState<number>(() => getResponsiveWheelSize());
  const { t } = useTranslation();

  const { rotation, spinning, winner, showResult, spin } = useWheelSpin({
    options,
    onSpinEnd: (winnerLabel) => logWinnerToGoogleSheet(playerInfo, winnerLabel),
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

  const handleCloseTab = () => {
    window.open('', '_self');
    window.close();
  };

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

      {showResult && (
        <div className="result-overlay">
          <div className="result-modal">
            <h2>{t.congratulations}</h2>
            <p className="winner-label">{t.youWon}</p>
            <p className="winner-name">{winner}</p>
            <button className="finish-button" onClick={handleCloseTab}>
              {t.returnToLogin}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpinningWheel;
