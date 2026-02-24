import { PlayerInfo } from '../../shared/types/player';

const GOOGLE_SHEET_URL = process.env.REACT_APP_GOOGLE_SHEET_URL || '';

export async function logWinnerToGoogleSheet(playerInfo: PlayerInfo, winnerLabel: string): Promise<void> {
  if (!GOOGLE_SHEET_URL) {
    console.warn('Google Sheet URL not configured, skipping log.');
    return;
  }

  const params = new URLSearchParams({
    email: playerInfo.email,
    phone: playerInfo.phone,
    winner: winnerLabel,
    timestamp: new Date().toISOString(),
  });

  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: params,
    });
  } catch (err) {
    console.error('Failed to log to Google Sheet:', err);
  }
}
