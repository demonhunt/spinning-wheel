import { WheelOption, WheelOptionConfig } from '../../shared/types/wheel';
import { resolveWheelOptions } from './options';

const GOOGLE_SHEET_URL = process.env.REACT_APP_GOOGLE_SHEET_URL || '';

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toOptionalNumber(value: unknown, fieldName: 'chance' | 'ratio', label: string): number | undefined {
  if (value === null || typeof value === 'undefined') return undefined;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`Option "${label}" has invalid ${fieldName}: ${value}`);
    }
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const normalized = trimmed.replace(/%$/, '');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Option "${label}" has invalid ${fieldName}: ${value}`);
    }
    return parsed;
  }
  throw new Error(`Option "${label}" has invalid ${fieldName}: ${String(value)}`);
}

function toWheelOptionConfigs(payload: unknown): WheelOptionConfig[] {
  if (isJsonRecord(payload) && payload.ok === false) {
    const error = typeof payload.error === 'string' ? payload.error : 'Options endpoint returned an error.';
    throw new Error(error);
  }

  const rawOptions = Array.isArray(payload)
    ? payload
    : (isJsonRecord(payload) ? payload.options : undefined);

  if (!Array.isArray(rawOptions)) {
    throw new Error('Options endpoint must return { options: [...] }.');
  }

  return rawOptions
    .map((item, index) => {
      if (!isJsonRecord(item)) {
        throw new Error(`Invalid option entry at index ${index}.`);
      }

      const label = typeof item.label === 'string' ? item.label.trim() : '';
      const chance = toOptionalNumber(item.chance, 'chance', label || `<index:${index}>`);
      const ratio = toOptionalNumber(item.ratio, 'ratio', label || `<index:${index}>`);

      return { label, chance, ratio };
    })
    .filter((option) => option.label || option.chance != null || option.ratio != null);
}

export async function loadWheelOptionsFromGoogleSheet(): Promise<WheelOption[]> {
  if (!GOOGLE_SHEET_URL) {
    throw new Error('REACT_APP_GOOGLE_SHEET_URL is required to load wheel options.');
  }

  let response: Response;
  try {
    response = await fetch(GOOGLE_SHEET_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    throw new Error(
      `Failed to fetch options from Google Sheet: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to load options sheet (HTTP ${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Options endpoint returned a non-JSON response.');
  }

  const configs = toWheelOptionConfigs(payload);
  return resolveWheelOptions(configs);
}
