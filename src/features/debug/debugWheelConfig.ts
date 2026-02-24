import { resolveWheelOptions } from '../wheel/options';
import { PlayerInfo } from '../../shared/types/player';
import { WheelOption, WheelOptionConfig } from '../../shared/types/wheel';

export const DEBUG_PLAYER: PlayerInfo = {
  email: 'debug@example.com',
  phone: '+84 999 999 999',
};

const DEBUG_WHEEL_OPTIONS_CONFIG: WheelOptionConfig[] = [
  { label: 'Debug Option A', chance: 15, ratio: 1 },
  { label: 'Debug Option B', chance: 20, ratio: 1.4 },
  { label: 'Debug Option C', chance: 10, ratio: 0.8 },
  { label: 'Debug Option D', chance: 18, ratio: 1.3 },
  { label: 'Debug Option E', chance: 12, ratio: 0.9 },
  { label: 'Debug Option F', chance: 25, ratio: 1.6 },
];

export const DEBUG_WHEEL_OPTIONS: WheelOption[] = resolveWheelOptions(DEBUG_WHEEL_OPTIONS_CONFIG);

export function isDebugWheelEndpoint(locationLike: Pick<Location, 'pathname' | 'hash' | 'search'> = window.location): boolean {
  const path = locationLike.pathname.toLowerCase();
  const hash = locationLike.hash.toLowerCase();
  const query = new URLSearchParams(locationLike.search);

  return (
    path.endsWith('/debug-wheel') ||
    hash === '#/debug-wheel' ||
    hash === '#debug-wheel' ||
    query.get('debugWheel') === '1'
  );
}
