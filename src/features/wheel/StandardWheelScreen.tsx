import { useEffect, useState } from 'react';
import PlayerForm from '../player/PlayerForm';
import { Language, useTranslation } from '../../shared/i18n';
import { PlayerInfo } from '../../shared/types/player';
import { WheelOption } from '../../shared/types/wheel';
import AppShell from '../../shared/ui/AppShell';
import { loadWheelOptionsFromGoogleSheet } from './optionsLoader';
import SpinningWheel from './SpinningWheel';
import { logWinnerToGoogleSheet } from './winnerLogger';

type OptionsLoadStatus = 'loading' | 'success' | 'error';
type StandardScreen = 'wheel' | 'result' | 'done';

interface StandardWheelScreenProps {
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
}

function StandardWheelScreen({ lang, onChangeLanguage }: StandardWheelScreenProps) {
  const [winner, setWinner] = useState<string | null>(null);
  const [playerSubmitted, setPlayerSubmitted] = useState(false);
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

  const optionsReady = optionsStatus === 'success' && options !== null;

  const handlePlayerSubmit = (info: PlayerInfo) => {
    setPlayerSubmitted(true);
    if (winner) {
      logWinnerToGoogleSheet(info, winner);
    }
  };

  const screen: StandardScreen = playerSubmitted
    ? 'done'
    : winner
      ? 'result'
      : 'wheel';

  const appScreenClass = screen === 'wheel'
    ? 'wheel-active'
    : screen === 'result'
      ? 'form-active'
      : '';

  const renderMainContent = () => {
    switch (screen) {
      case 'done':
        return (
          <div className="result-page">
            <div className="result-card">
              <h2>{t.congratulations}</h2>
              <p className="winner-label">{t.youWon}</p>
              <p className="winner-name">{winner}</p>
              <p className="result-note">{t.resultFollowupMessage}</p>
            </div>
            <div className="result-contact-bar">
              <span className="contact-label">{t.contactName}</span>
              <a className="contact-badge contact-phone-badge" href={`tel:${t.contactPhone.replace(/\./g, '')}`}>
                <svg className="phone-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1.01.46 1.01 1.01v3.49c0 .55-.46 1.01-1.01 1.01C10.81 21.02 2.98 13.19 2.98 3.98c0-.55.46-1.01 1.01-1.01H7.5c.55 0 1.01.46 1.01 1.01 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.01l-2.22 2.23z"/></svg>
                {t.contactPhone}
              </a>
            </div>
          </div>
        );
      case 'result':
        return (
          <div className="result-page">
            <div className="result-card result-card-with-form">
              <div className="result-card-header">
                <h2>{t.congratulations}</h2>
                <p className="winner-label">{t.youWon}</p>
                <p className="winner-name">{winner}</p>
              </div>
              <PlayerForm onSubmit={handlePlayerSubmit} inline />
            </div>
          </div>
        );
      case 'wheel':
      default:
        if (!optionsReady || !options) return null;
        return (
          <SpinningWheel
            options={options}
            onSpinComplete={setWinner}
          />
        );
    }
  };

  return (
    <AppShell appClassName={appScreenClass} lang={lang} onChangeLanguage={onChangeLanguage}>
      {renderMainContent()}
      {optionsStatus === 'loading' && (
        <progress
          className="options-progress-strip"
          aria-label={t.loading}
          value={Math.round(optionsProgress)}
          max={100}
        />
      )}
    </AppShell>
  );
}

export default StandardWheelScreen;
