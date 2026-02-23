import { useMemo, useState } from 'react';
import './App.css';
import PlayerForm from '../features/player/PlayerForm';
import SpinningWheel from '../features/wheel/SpinningWheel';
import wheelOptionsConfig from '../features/wheel/config/wheel-options.json';
import { resolveWheelOptions } from '../features/wheel/options';
import { Language, LanguageContext, languages } from '../shared/i18n';
import { PlayerInfo } from '../shared/types/player';
import { WheelOptionConfig } from '../shared/types/wheel';

function App() {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [lang, setLang] = useState<Language>('vi');
  const t = languages[lang];

  const { options, error } = useMemo(() => {
    try {
      return {
        options: resolveWheelOptions(wheelOptionsConfig as WheelOptionConfig[]),
        error: null,
      };
    } catch (err) {
      return {
        options: [],
        error: err instanceof Error ? err.message : 'Failed to load wheel options.',
      };
    }
  }, []);

  const handleFinish = () => {
    setPlayer(null);
  };

  if (error) return <div className="App"><p>{error}</p></div>;
  if (options.length === 0) return <div className="App"><p>{t.loading}</p></div>;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="App">
        <div className="lang-switcher">
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''} title="English">🇺🇸</button>
          <button onClick={() => setLang('vi')} className={lang === 'vi' ? 'active' : ''} title="Tiếng Việt">🇻🇳</button>
        </div>
        <h1>{t.appTitle}</h1>
        {player ? (
          <SpinningWheel
            options={options}
            playerInfo={player}
            onFinish={handleFinish}
          />
        ) : (
          <PlayerForm onSubmit={setPlayer} />
        )}
      </div>
    </LanguageContext.Provider>
  );
}

export default App;
