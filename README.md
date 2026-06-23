# Fusion 2026 — Listen Station

A single-page "listen station" for the music acts of [Fusion Festival 2026](https://timetable.fusion-festival.de/#/timetable)
(June 25–28). One row per **DJ / Band / Live Act** (1,058 acts), each with an inline
YouTube/SoundCloud/Spotify/Mixcloud player, set times and stage, filters (day, genre,
stage, platform), search, and "★ want to see" stars saved in your browser.

**Live page:** https://SohrabTa.github.io/fusion-2026-listen/

## How it was built

The timetable is a single-page app, but the full artist dataset is embedded in one of its JS
chunks. `build_page.js` reads the cleaned dataset (`fusion_music.json`) and emits the
self-contained `index.html` — no backend, no build step beyond Node.

```sh
node build_page.js   # regenerates index.html from fusion_music.json
```

Listen links are the festival's own curated `website` / `soundsample` fields; 951 of 1,058 acts
had one. The page loads each player on demand from YouTube/SoundCloud/etc. (needs internet).

Lineup data reflects the timetable as of its `lastUpdate` field — re-fetch and rebuild closer to
the festival for the latest set times.
