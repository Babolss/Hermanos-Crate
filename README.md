# SFX Preview: starter (steps 1 and 2)

1. Create the base project:
   npm create @quick-start/electron@latest sfx-preview
   (choose: TypeScript, React, no extras needed)

2. Copy the files from this zip over the new project (same folder paths, overwrite when asked).

3. Install and run:
   cd sfx-preview
   npm install
   npm run dev

4. Test: click a sound to preview it, then drag a row into CapCut or the Premiere Pro project panel / timeline.

If the window opens blank or `window.api` is undefined, check that the preload build output is
`out/preload/index.js` (if your template outputs `index.mjs`, change the preload path in src/main/index.ts).
