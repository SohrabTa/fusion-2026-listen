#!/usr/bin/env node
// Validate every SoundCloud link in fusion_music.json against SoundCloud's oEmbed
// endpoint (the same resolver the embed widget uses). Prints any that don't return 200.
//   node validate_soundcloud.js
// A 200 means the track/profile exists and is embeddable; 403/404 means private/deleted.
const data = require('./fusion_music.json');
const byUrl = {};
for (const a of data) for (const l of a.links)
  if (l.platform === 'soundcloud') (byUrl[l.url] = byUrl[l.url] || []).push(a.artist);
const urls = Object.keys(byUrl);
let i = 0; const bad = [];
async function worker() {
  while (i < urls.length) {
    const u = urls[i++];
    try { const r = await fetch('https://soundcloud.com/oembed?format=json&url=' + encodeURIComponent(u));
          if (r.status !== 200) bad.push([r.status, u]); }
    catch (e) { bad.push(['ERR', u]); }
  }
}
(async () => {
  await Promise.all(Array.from({ length: 16 }, worker));
  console.log(`Checked ${urls.length} SoundCloud links — ${bad.length} broken`);
  for (const [code, u] of bad) console.log(`  [${code}] ${(byUrl[u] || []).join(', ')}  ${u}`);
  process.exit(bad.length ? 1 : 0);
})();
