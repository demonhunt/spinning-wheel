import { useEffect, useState } from 'react';
import './App.css';
import PlayerForm from '../features/player/PlayerForm';
import SpinningWheel from '../features/wheel/SpinningWheel';
import { loadWheelOptionsFromGoogleSheet } from '../features/wheel/optionsLoader';
import { Language, LanguageContext, languages } from '../shared/i18n';
import { PlayerInfo } from '../shared/types/player';
import { WheelOption } from '../shared/types/wheel';

type OptionsLoadStatus = 'loading' | 'success' | 'error';

function App() {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [queuedPlayer, setQueuedPlayer] = useState<PlayerInfo | null>(null);
  const [lang, setLang] = useState<Language>('vi');
  const [options, setOptions] = useState<WheelOption[] | null>(null);
  const [optionsStatus, setOptionsStatus] = useState<OptionsLoadStatus>('loading');
  const [optionsProgress, setOptionsProgress] = useState<number>(6);
  const t = languages[lang];

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
  const canOpenWheel = optionsStatus === 'success' && options !== null;

  const handlePlayerSubmit = (info: PlayerInfo) => {
    if (canOpenWheel) {
      setPlayer(info);
      return;
    }
    setQueuedPlayer(info);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="App">
        <div className="lang-switcher">
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''} title="English">🇺🇸</button>
          <button onClick={() => setLang('vi')} className={lang === 'vi' ? 'active' : ''} title="Tiếng Việt">🇻🇳</button>
        </div>
        <h1>{t.appTitle}</h1>
        {canOpenWheel && player ? (
          <SpinningWheel
            options={options!}
            playerInfo={player}
          />) : (
          <PlayerForm onSubmit={handlePlayerSubmit} submitDisabled={!canOpenWheel} />
        )}
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
      </div>
    </LanguageContext.Provider>
  );
}

export default App;
