export interface WheelOptionConfig {
  label: string;
  ratio?: number;
  chance?: number | null;
}

export interface WheelOption extends Omit<WheelOptionConfig, 'ratio'> {
  ratio: number;
  resolvedChance: number;
}
