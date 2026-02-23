# Spinning Wheel

A localized React spinning wheel app with:
- configurable wheel options from JSON
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
      options.ts               # typed runtime wrapper for option parser
      options-core.mjs         # shared parser/validator (used by app + build script)
      config/
        wheel-options.json

  shared/
    i18n/
      index.ts
      en.ts
      vi.ts
    types/
      player.ts
      wheel.ts

scripts/
  validate-options.js          # build-time option validation (reuses options-core.js)
```

## Data Model (`wheel-options.json`)

Each option supports:
- `label` (required): display text
- `color` (required): slice color
- `chance` (optional): winning probability in percent
- `ratio` (optional): visual slice proportion

Rules:
- If `chance` is missing, remaining probability is auto-distributed equally.
- If `ratio` is missing, it defaults to `1` (equal visual baseline).

## Scripts

- `npm start`: validate options, then run dev server
- `npm run validate`: validate wheel options only
- `npm run build`: validate options, then create production build
- `npm run deploy`: publish `build/` to GitHub Pages

## Environment Variables

Create `.env.local` if needed:

```env
REACT_APP_GOOGLE_SHEET_URL=your_google_apps_script_url
```

If not set, winner logging is skipped.
