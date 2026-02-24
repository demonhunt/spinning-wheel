# Spinning Wheel

A localized React spinning wheel app with:
- configurable wheel options loaded from Google Sheets (`options` sheet)
- weighted win chance (`chance`)
- independent visual slice size (`ratio`)
- optional winner logging to Google Sheets

## Project Structure

```text
src/
  app/
    App.tsx
    App.css

  features/
    player/
      PlayerForm.tsx

    wheel/
      SpinningWheel.tsx        # UI composition for wheel + result modal
      wheelCanvas.ts           # canvas drawing and label layout
      useWheelSpin.ts          # spin animation state + winner lifecycle
      wheelMath.ts             # random winner + landing angle math
      winnerLogger.ts          # Google Sheet logging side effect
      optionsLoader.ts         # runtime option fetch from Google Sheets
      options.ts               # typed runtime wrapper for option parser
      options-core.mjs         # shared parser/validator

  shared/
    i18n/
      index.ts
      en.ts
      vi.ts
    types/
      player.ts
      wheel.ts
```

## Data Model (`options` sheet)

Each row supports:
- `label` (required): display text
- `chance` (optional): winning probability in percent
- `ratio` (optional): visual slice proportion

Rules:
- If `chance` is missing, remaining probability is auto-distributed equally.
- If `ratio` is missing, it defaults to `1` (equal visual baseline).

## Scripts

- `npm start`: run dev server
- `npm run build`: create production build
- `npm run deploy`: publish `build/` to GitHub Pages

## Environment Variables

Create `.env.local` if needed:

```env
REACT_APP_GOOGLE_SHEET_URL=your_google_apps_script_url
```

This URL is required at runtime:
- `GET REACT_APP_GOOGLE_SHEET_URL` loads wheel options from sheet `options`
- `POST REACT_APP_GOOGLE_SHEET_URL` writes spin results to sheet `results`

If options cannot be fetched or fail validation, the app shows an error and does not load the wheel.
