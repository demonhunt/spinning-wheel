import { ReactNode } from 'react';
import { Language, useTranslation } from '../i18n';

interface AppShellProps {
  appClassName?: string;
  children: ReactNode;
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
}

function AppShell({ appClassName, children, lang, onChangeLanguage }: AppShellProps) {
  const { t } = useTranslation();

  return (
    <div className={`App${appClassName ? ` ${appClassName}` : ''}`}>
      <div className="lang-switcher">
        <button
          onClick={() => onChangeLanguage('en')}
          className={lang === 'en' ? 'active' : ''}
          title="English"
        >
          🇺🇸
        </button>
        <button
          onClick={() => onChangeLanguage('vi')}
          className={lang === 'vi' ? 'active' : ''}
          title="Tiếng Việt"
        >
          🇻🇳
        </button>
      </div>
      <h1>{t.appTitle}</h1>
      {children}
    </div>
  );
}

export default AppShell;
