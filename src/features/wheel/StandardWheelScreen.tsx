import { useEffect, useState } from 'react';
import PlayerForm from '../player/PlayerForm';
import { Language, useTranslation } from '../../shared/i18n';
import { PlayerInfo } from '../../shared/types/player';
import { WheelOption } from '../../shared/types/wheel';
import AppShell from '../../shared/ui/AppShell';
import { loadWheelOptionsFromGoogleSheet } from './optionsLoader';
import SpinningWheel from './SpinningWheel';

type OptionsLoadStatus = 'loading' | 'success' | 'error';
type StandardScreen = 'form' | 'wheel' | 'result';

interface StandardWheelScreenProps {
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
}

function StandardWheelScreen({ lang, onChangeLanguage }: StandardWheelScreenProps) {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [queuedPlayer, setQueuedPlayer] = useState<PlayerInfo | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [options, setOptions] = useState<WheelOption[] | null>(null);
  const [optionsStatus, setOptionsStatus] = useState<OptionsLoadStatus>('loading');
  const [optionsProgress, setOptionsProgress] = useState<number>(6);
  const { t } = useTranslation();

  useEffect(() => {
    if (optionsStatus !== 'loading') return;
    const timer = window.setInterval(() => {
      setOptionsProgress((prev) => {
        if (prev >= 92) return prev;
        const step = Math.max(1, Math.ceil((100 - prev) / 10));
        return Math.min(92, prev + step);
      });
    }, 220);

    return () => window.clearInterval(timer);
  }, [optionsStatus]);

  useEffect(() => {
    let active = true;
    setOptionsStatus('loading');
    setOptionsProgress(10);

    (async () => {
      try {
        const loadedOptions = await loadWheelOptionsFromGoogleSheet();
        if (!active) return;
        setOptions(loadedOptions);
        setOptionsStatus('success');
        setOptionsProgress(100);
      } catch (err) {
        if (!active) return;
        console.error('Wheel options initialization failed:', err);
        setOptionsStatus('error');
        setOptionsProgress(100);
        setOptions(null);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (optionsStatus === 'success' && options && queuedPlayer) {
      setPlayer(queuedPlayer);
      setQueuedPlayer(null);
    }
  }, [options, optionsStatus, queuedPlayer]);

  const optionsReady = optionsStatus === 'success' && options !== null;

  const handlePlayerSubmit = (info: PlayerInfo) => {
    if (optionsReady) {
      setPlayer(info);
      return;
    }
    setQueuedPlayer(info);
  };

  const screen: StandardScreen = winner
    ? 'result'
    : (optionsReady && player ? 'wheel' : 'form');

  const appScreenClass = screen === 'wheel'
    ? 'wheel-active'
    : screen === 'form'
      ? 'form-active'
      : '';

  const renderMainContent = () => {
    switch (screen) {
      case 'result':
        return (
          <div className="result-page">
            <div className="result-card">
              <h2>{t.congratulations}</h2>
              <p className="winner-label">{t.youWon}</p>
              <p className="winner-name">{winner}</p>
              <p className="result-note">{t.resultFollowupMessage}</p>
            </div>
          </div>
        );
      case 'wheel':
        if (!options || !player) return null;
        return (
          <SpinningWheel
            options={options}
            playerInfo={player}
            onSpinComplete={setWinner}
          />
        );
      case 'form':
      default:
        return (
          <PlayerForm
            onSubmit={handlePlayerSubmit}
            submitDisabled={!optionsReady}
          />
        );
    }
  };

  return (
    <AppShell appClassName={appScreenClass} lang={lang} onChangeLanguage={onChangeLanguage}>
      {renderMainContent()}
      {optionsStatus === 'loading' && (
        <div
          className="options-progress-strip"
          role="progressbar"
          aria-label={t.loading}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(optionsProgress)}
        >
          <div className="options-progress-strip-fill" style={{ width: `${Math.round(optionsProgress)}%` }} />
        </div>
      )}
    </AppShell>
  );
}

export default StandardWheelScreen;
