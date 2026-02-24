import { useCallback, useEffect, useRef, useState } from 'react';
import { WheelOption } from '../../shared/types/wheel';
import { getTargetAngleForIndex, pickWinnerIndex } from './wheelMath';

interface UseWheelSpinArgs {
  options: WheelOption[];
  onSpinEnd?: (winnerLabel: string) => void | Promise<void>;
}

interface WheelSpinState {
  rotation: number;
  spinning: boolean;
  spin: () => void;
}

export function useWheelSpin({ options, onSpinEnd }: UseWheelSpinArgs): WheelSpinState {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef(0);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const spin = useCallback(() => {
    if (spinning) return;

    setSpinning(true);

    const winnerIdx = pickWinnerIndex(options);
    const targetAngle = getTargetAngleForIndex(options, winnerIdx);
    const extraSpins = 5 * 2 * Math.PI;
    const totalRotationToApply = targetAngle + extraSpins;

    const duration = 5000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + totalRotationToApply * eased;

      setRotation(currentRotation);
      rotationRef.current = currentRotation;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const winnerLabel = options[winnerIdx].label;
      setSpinning(false);

      if (onSpinEnd) {
        Promise.resolve(onSpinEnd(winnerLabel)).catch((err) => {
          console.error('Failed to run spin end handler:', err);
        });
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [onSpinEnd, options, spinning]);

  return {
    rotation,
    spinning,
    spin,
  };
}
