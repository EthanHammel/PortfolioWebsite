SELF-HOSTED FONTS
=================

Place your .woff2 font files here. The CSS @font-face declarations in
src/styles/global.css will load them automatically once they exist.

Expected filenames:
  playfair-display-400.woff2
  playfair-display-400-italic.woff2
  playfair-display-700.woff2
  playfair-display-700-italic.woff2
  libre-baskerville-400.woff2
  libre-baskerville-400-italic.woff2
  libre-baskerville-700.woff2
  dm-mono-400.woff2
  dm-mono-500.woff2

How to get these files:
  1. Go to https://fonts.google.com
  2. Search for each font, click Download family
  3. Extract the zip — you'll find .ttf files inside
  4. Convert .ttf → .woff2 at https://cloudconvert.com/ttf-to-woff2
  5. Rename to match the filenames above and drop them in this folder
  6. Rebuild: npm run build

Until these files are present, the site falls back to the Google Fonts CDN
(the @import at the top of global.css). The CDN version works fine — 
self-hosting just improves load speed and privacy.
