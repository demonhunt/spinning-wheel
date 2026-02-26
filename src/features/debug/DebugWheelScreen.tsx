import SpinningWheel from '../wheel/SpinningWheel';
import { Language } from '../../shared/i18n';
import AppShell from '../../shared/ui/AppShell';
import { DEBUG_PLAYER, DEBUG_WHEEL_OPTIONS } from './debugWheelConfig';

interface DebugWheelScreenProps {
  lang: Language;
  onChangeLanguage: (lang: Language) => void;
}

function DebugWheelScreen({ lang, onChangeLanguage }: DebugWheelScreenProps) {
  return (
    <AppShell appClassName="wheel-active" lang={lang} onChangeLanguage={onChangeLanguage}>
      <SpinningWheel
        options={DEBUG_WHEEL_OPTIONS}
        onSpinComplete={() => {}}
        disableWinnerLog
      />
      <div className="debug-wheel-note">Debug wheel endpoint active</div>
    </AppShell>
  );
}

export default DebugWheelScreen;
