export interface WheelOptionConfig {
  label: string;
  ratio: number;
  color: string;
  chance?: number | null;
}

export interface WheelOption extends WheelOptionConfig {
  resolvedChance: number;
}
