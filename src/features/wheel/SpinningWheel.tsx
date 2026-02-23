import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../../shared/i18n';
import { PlayerInfo } from '../../shared/types/player';
import { WheelOption } from '../../shared/types/wheel';
import { drawWheel, WHEEL_SIZE } from './wheelCanvas';
import { useWheelSpin } from './useWheelSpin';
import { logWinnerToGoogleSheet } from './winnerLogger';

interface SpinningWheelProps {
  options: WheelOption[];
  playerInfo: PlayerInfo;
  onFinish: () => void;
}

function SpinningWheel({ options, playerInfo, onFinish }: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();

  const { rotation, spinning, winner, showResult, spin } = useWheelSpin({
    options,
    onSpinEnd: (winnerLabel) => logWinnerToGoogleSheet(playerInfo, winnerLabel),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWheel(ctx, options, rotation);
  }, [options, rotation]);

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
        {spinning ? t.spinning : t.spin}
      </button>

      {showResult && (
        <div className="result-overlay">
          <div className="result-modal">
            <h2>{t.congratulations}</h2>
            <p className="winner-label">{t.youWon}</p>
            <p className="winner-name">{winner}</p>
            <button className="finish-button" onClick={onFinish}>
              {t.returnToLogin}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpinningWheel;
