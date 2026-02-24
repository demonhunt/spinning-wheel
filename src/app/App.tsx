import { useState } from 'react';
import './App.css';
import DebugWheelScreen from '../features/debug/DebugWheelScreen';
import { isDebugWheelEndpoint } from '../features/debug/debugWheelConfig';
import StandardWheelScreen from '../features/wheel/StandardWheelScreen';
import { Language, LanguageContext, languages } from '../shared/i18n';

function App() {
  const [lang, setLang] = useState<Language>('vi');
  const [debugWheelMode] = useState<boolean>(() => isDebugWheelEndpoint());
  const t = languages[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {debugWheelMode ? (
        <DebugWheelScreen lang={lang} onChangeLanguage={setLang} />
      ) : (
        <StandardWheelScreen lang={lang} onChangeLanguage={setLang} />
      )}
    </LanguageContext.Provider>
  );
}

export default App;
