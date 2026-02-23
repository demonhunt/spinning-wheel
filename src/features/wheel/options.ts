import { WheelOption, WheelOptionConfig } from '../../shared/types/wheel';
// options-core is CommonJS so scripts and browser runtime can share the same parser.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const optionsCore = require('./options-core') as {
  validateAndResolveOptions: (configs: WheelOptionConfig[]) => WheelOption[];
};

export function resolveWheelOptions(configs: WheelOptionConfig[]): WheelOption[] {
  return optionsCore.validateAndResolveOptions(configs);
}
