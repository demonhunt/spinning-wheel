import { WheelOption, WheelOptionConfig } from '../../shared/types/wheel';
import { validateAndResolveOptions } from './options-core.mjs';

export function resolveWheelOptions(configs: WheelOptionConfig[]): WheelOption[] {
  return validateAndResolveOptions(configs) as WheelOption[];
}
