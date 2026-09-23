/* Runs during the GitHub build (it has internet there).
   1. Downloads html2canvas + Google Fonts and stores them INSIDE the app
   2. Rewrites index.html so it never needs the internet
   3. Injects native-bridge.js                                          */
const fs = require('fs');
const path = require('path');
const https = require('https');

const WWW = path.join(__dirname, '..', 'www');
const VENDOR = path.join(WWW, 'vendor');
const FONTS = path.join(VENDOR, 'fonts');
fs.mkdirSync(FONTS, { recursive: true });

function get(url, asBuffer) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Safari/537.36' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(new URL(res.headers.location, url).href, asBuffer));
      }
      if (res.statusCode !== 200) return reject(new Error(res.statusCode + ' for ' + url));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => { const b = Buffer.concat(chunks); resolve(asBuffer ? b : b.toString('utf8')); });
    }).on('error', reject);
  });
}

(async () => {
  let html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');

  /* ---- html2canvas ---- */
  console.log('Downloading html2canvas...');
  const h2c = await get('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', true);
  fs.writeFileSync(path.join(VENDOR, 'html2canvas.min.js'), h2c);
  html = html.replace(
    /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas\/1\.4\.1\/html2canvas\.min\.js"><\/script>/,
    '<script src="vendor/html2canvas.min.js"></script>'
  );

  /* ---- Google Fonts -> local files ---- */
  console.log('Downloading fonts...');
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Poppins:wght@300;400;500;600;700&display=swap';
  let css = await get(cssUrl, false);
  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))];
  let i = 0;
  for (const u of urls) {
    const name = 'font' + (i++) + '.woff2';
    fs.writeFileSync(path.join(FONTS, name), await get(u, true));
    css = css.split(u).join('fonts/' + name);
  }
  fs.writeFileSync(path.join(VENDOR, 'fonts.css'), css);
  console.log('Saved ' + urls.length + ' font files');

  html = html
    .replace(/<link rel="preconnect"[^>]*>\s*/g, '')
    .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>/, '<link rel="stylesheet" href="vendor/fonts.css">');

  /* ---- native bridge (must load BEFORE the app script) ---- */
  html = html.replace('<script src="vendor/html2canvas.min.js"></script>',
    '<script src="vendor/html2canvas.min.js"></script>\n<script src="native-bridge.js"></script>');

  fs.writeFileSync(path.join(WWW, 'index.html'), html);

  /* ---- safety check ---- */
  const leftover = (html.match(/https?:\/\/(?!wa\.me|www\.w3\.org)[^"' )]+/g) || []);
  if (leftover.length) console.warn('WARNING still online:', leftover);
  else console.log('OK: index.html is fully offline');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
