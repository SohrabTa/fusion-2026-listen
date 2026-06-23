#!/usr/bin/env node
// Builds a self-contained interactive "listen station" page for Fusion 2026 music acts.
// Input : fusion_music.json  (produced from the timetable's embedded artists chunk)
// Output: fusion-2026-listen.html
// Re-run: node build_page.js
const fs = require('fs');
const path = require('path');
const here = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(here, 'fusion_music.json'), 'utf8'));

const json = JSON.stringify(data).replace(/<\//g, '<\\/');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fusion 2026 — Listen Station</title>
<style>
  :root{
    --bg:#0e0f13; --panel:#16181f; --panel2:#1d2029; --line:#2a2e3a;
    --txt:#e7e9ee; --dim:#9aa0ad; --accent:#ff5c8a; --accent2:#48d597; --yt:#ff4444; --sc:#ff7700;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  header{position:sticky;top:0;z-index:20;background:rgba(14,15,19,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:12px 16px}
  h1{margin:0 0 8px;font-size:18px;letter-spacing:.3px}
  h1 small{color:var(--dim);font-weight:400;font-size:13px}
  .controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .controls .group{display:flex;gap:4px;flex-wrap:wrap;align-items:center}
  input[type=search],select{background:var(--panel2);color:var(--txt);border:1px solid var(--line);border-radius:8px;padding:7px 10px;font-size:14px}
  input[type=search]{min-width:220px}
  button.chip{background:var(--panel2);color:var(--txt);border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:13px;cursor:pointer}
  button.chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
  button.act{background:var(--accent2);color:#06231a;border:none;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:600;cursor:pointer}
  .count{color:var(--dim);font-size:13px;margin-left:auto}
  main{max-width:1100px;margin:0 auto;padding:14px 16px 120px}
  .row{background:var(--panel);border:1px solid var(--line);border-radius:10px;margin:8px 0;padding:10px 12px}
  .row.fav{border-color:var(--accent)}
  .top{display:flex;gap:10px;align-items:flex-start}
  .star{font-size:20px;line-height:1;cursor:pointer;user-select:none;color:#444;margin-top:1px}
  .star.on{color:var(--accent)}
  .meta{flex:1;min-width:0}
  .name{font-weight:600;font-size:16px}
  .badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:3px}
  .b{font-size:11px;padding:2px 7px;border-radius:6px;background:var(--panel2);color:var(--dim);border:1px solid var(--line)}
  .b.g{color:#cdd2dd}
  .shows{color:var(--dim);font-size:12.5px;margin-top:4px}
  .shows span{white-space:nowrap}
  .links{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
  .plat{font-size:11px;padding:2px 6px;border-radius:5px;font-weight:700}
  .plat.youtube{background:var(--yt);color:#fff}.plat.soundcloud{background:var(--sc);color:#fff}
  .plat.spotify{background:#1db954;color:#06231a}.plat.bandcamp{background:#629aa9;color:#04202a}
  .plat.mixcloud{background:#5000ff;color:#fff}.plat.web{background:#555;color:#fff}
  a.lk,button.lk{background:var(--panel2);color:var(--txt);border:1px solid var(--line);border-radius:8px;padding:6px 11px;font-size:13px;cursor:pointer;text-decoration:none;display:inline-block}
  a.lk:hover,button.lk:hover{border-color:var(--accent)}
  .player{margin-top:10px}
  .player iframe{width:100%;border:0;border-radius:8px}
  .nolink{color:#6b7280;font-size:12.5px;font-style:italic}
  footer{position:fixed;bottom:0;left:0;right:0;background:rgba(14,15,19,.96);border-top:1px solid var(--line);padding:8px 16px;display:flex;gap:10px;align-items:center;font-size:13px;z-index:20}
  footer .count{margin-left:0}
  .hint{color:var(--dim);font-size:12px;margin-top:6px}
</style>
</head>
<body>
<header>
  <h1>Fusion 2026 — Listen Station <small>· DJ · Band · Live Act · listen to one sample per act, star the ones you want to see</small></h1>
  <div class="controls">
    <input type="search" id="q" placeholder="Search artist, stage, genre…" autocomplete="off">
    <div class="group" id="days"></div>
    <div class="group" id="genres"></div>
    <select id="floor"><option value="">All stages</option></select>
    <select id="platform">
      <option value="">Any platform</option>
      <option value="youtube">YouTube</option>
      <option value="soundcloud">SoundCloud</option>
      <option value="bandcamp">Bandcamp</option>
      <option value="spotify">Spotify</option>
      <option value="mixcloud">Mixcloud</option>
      <option value="web">Other site</option>
      <option value="__none">No link</option>
    </select>
    <button class="chip" id="favOnly">★ Favourites</button>
    <button class="act" id="playAllYt" title="Open the currently visible acts that have a YouTube video as one auto-playing YouTube playlist (no login)">▶ Play visible on YouTube</button>
    <span class="count" id="count"></span>
  </div>
  <div class="hint">Click <b>Listen</b> to load a player inline. Players stream from YouTube/SoundCloud (needs internet). Stars are saved in this browser. Export your picks at the bottom.</div>
  <div id="fileWarn" style="display:none;margin-top:8px;padding:8px 12px;border:1px solid #b4541f;background:#3a1e10;border-radius:8px;color:#ffd2b3;font-size:13px">⚠ You opened this as a local file, so YouTube previews fail with "Error 153" (YouTube blocks the <code>file://</code> origin). SoundCloud still works. For YouTube, open the hosted page: <a style="color:#ffb380" href="https://sohrabta.github.io/fusion-2026-listen/">sohrabta.github.io/fusion-2026-listen</a></div>
</header>
<main id="list"></main>
<footer>
  <span class="count" id="footCount"></span>
  <button class="lk" id="export">⬇ Export my picks (.txt)</button>
  <button class="lk" id="clearFav">Clear favourites</button>
  <span class="count" id="favCount"></span>
</footer>

<script>
const DATA = ${json};
const $=s=>document.querySelector(s);
const LS_FAV='fusion26_fav';
let favs=new Set(JSON.parse(localStorage.getItem(LS_FAV)||'[]'));
function saveFav(){localStorage.setItem(LS_FAV,JSON.stringify([...favs]))}

// ----- derive filter option sets -----
const DAYS=[...new Set(DATA.flatMap(a=>a.shows.map(s=>(s.start||'').slice(0,10))).filter(Boolean))].sort();
const FLOORS=[...new Set(DATA.flatMap(a=>a.shows.map(s=>s.floor)).filter(Boolean))].sort();
const dayLabel=d=>{const wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(d+'T12:00:00').getDay()];return wd+' '+d.slice(8,10)+'.'+d.slice(5,7)+'.'};
const fmtTime=iso=>{if(!iso)return'';const t=iso.slice(11,16);return t};

const state={q:'',days:new Set(),genres:new Set(),floor:'',platform:'',favOnly:false};

// build day chips
const daysEl=$('#days');
DAYS.forEach(d=>{const b=document.createElement('button');b.className='chip';b.textContent=dayLabel(d);b.onclick=()=>{state.days.has(d)?state.days.delete(d):state.days.add(d);b.classList.toggle('on');render()};daysEl.appendChild(b)});
// genre chips
const genresEl=$('#genres');
['DJ','Band','Live Act'].forEach(g=>{const b=document.createElement('button');b.className='chip';b.textContent=g;b.onclick=()=>{state.genres.has(g)?state.genres.delete(g):state.genres.add(g);b.classList.toggle('on');render()};genresEl.appendChild(b)});
// floors
const floorSel=$('#floor');FLOORS.forEach(f=>{const o=document.createElement('option');o.value=f;o.textContent=f;floorSel.appendChild(o)});
floorSel.onchange=()=>{state.floor=floorSel.value;render()};
$('#platform').onchange=e=>{state.platform=e.target.value;render()};
$('#q').oninput=e=>{state.q=e.target.value.toLowerCase().trim();render()};
$('#favOnly').onclick=()=>{state.favOnly=!state.favOnly;$('#favOnly').classList.toggle('on');render()};

function matches(a){
  if(state.favOnly && !favs.has(a.id)) return false;
  if(state.genres.size && !state.genres.has(a.genre)) return false;
  if(state.days.size && !a.shows.some(s=>state.days.has((s.start||'').slice(0,10)))) return false;
  if(state.floor && !a.shows.some(s=>s.floor===state.floor)) return false;
  if(state.platform==='__none'){ if(a.primary) return false; }
  else if(state.platform){ if(!a.links.some(l=>l.platform===state.platform)) return false; }
  if(state.q){
    const hay=(a.artist+' '+a.genre+' '+a.sub.join(' ')+' '+a.shows.map(s=>s.floor).join(' ')).toLowerCase();
    if(!hay.includes(state.q)) return false;
  }
  return true;
}

function embed(link){
  const u=link.url;
  if(link.platform==='youtube'&&link.kind==='video')
    return '<iframe height="200" src="https://www.youtube-nocookie.com/embed/'+link.id+'?rel=0&modestbranding=1" allow="encrypted-media" allowfullscreen loading="lazy"></iframe>'+
           '<div style="margin-top:4px"><a class="lk" href="https://www.youtube.com/watch?v='+link.id+'" target="_blank" rel="noopener">↗ Not playing? Watch on YouTube</a></div>';
  if(link.platform==='soundcloud')
    return '<iframe height="'+(link.kind==='profile'?166:120)+'" src="https://w.soundcloud.com/player/?url='+encodeURIComponent(u)+'&color=%23ff5500&auto_play=true&show_comments=false&visual=false" loading="lazy"></iframe>';
  if(link.platform==='mixcloud')
    return '<iframe height="120" src="https://www.mixcloud.com/widget/iframe/?feed='+encodeURIComponent(u)+'&autoplay=1" loading="lazy"></iframe>';
  if(link.platform==='spotify'){
    const m=u.match(/spotify\\.com\\/(track|album|artist|playlist)\\/([A-Za-z0-9]+)/);
    if(m) return '<iframe height="152" src="https://open.spotify.com/embed/'+m[1]+'/'+m[2]+'" loading="lazy"></iframe>';
  }
  return null; // not embeddable -> open in new tab
}

function render(){
  const list=$('#list');list.innerHTML='';
  const shown=DATA.filter(matches);
  for(const a of shown){
    const row=document.createElement('div');row.className='row'+(favs.has(a.id)?' fav':'');
    const star=document.createElement('div');star.className='star'+(favs.has(a.id)?' on':'');star.textContent='★';
    star.onclick=()=>{favs.has(a.id)?favs.delete(a.id):favs.add(a.id);saveFav();render();updateCounts()};
    const meta=document.createElement('div');meta.className='meta';
    const showsHtml=a.shows.length?('<div class="shows">'+a.shows.map(s=>'<span>'+(s.start?dayLabel(s.start.slice(0,10))+' '+fmtTime(s.start)+'–'+fmtTime(s.end):'?')+' · '+(s.floor||'?')+'</span>').join(' &nbsp;|&nbsp; ')+'</div>'):'<div class="shows">no set time listed</div>';
    const subB=a.sub.map(s=>'<span class="b">'+s+'</span>').join('');
    // links area
    let linksHtml='';
    if(!a.primary){ linksHtml='<span class="nolink">no listen link in timetable — search manually</span>'; }
    else {
      const btns=a.links.map((l,i)=>{
        const lbl=(l.platform.charAt(0).toUpperCase()+l.platform.slice(1));
        const canEmbed=!!embed(l);
        if(canEmbed) return '<button class="lk" data-aid="'+a.id+'" data-idx="'+i+'">'+(i===0?'▶ Listen':'▶')+' <span class="plat '+l.platform+'">'+lbl+'</span></button>';
        return '<a class="lk" href="'+l.url+'" target="_blank" rel="noopener">↗ '+lbl+'</a>';
      }).join('');
      linksHtml='<div class="links">'+btns+'</div>';
    }
    meta.innerHTML='<div class="name">'+escapeHtml(a.artist)+'</div>'+
      '<div class="badges"><span class="b g">'+a.genre+'</span>'+subB+'</div>'+
      showsHtml+
      '<div style="margin-top:8px">'+linksHtml+'</div>'+
      '<div class="player" data-player="'+a.id+'"></div>';
    const top=document.createElement('div');top.className='top';
    top.appendChild(star);top.appendChild(meta);row.appendChild(top);list.appendChild(row);
  }
  // wire embed buttons
  list.querySelectorAll('button.lk[data-aid]').forEach(btn=>{
    btn.onclick=()=>{
      const a=DATA.find(x=>x.id==btn.dataset.aid);const l=a.links[+btn.dataset.idx];
      const slot=list.querySelector('[data-player="'+a.id+'"]');
      const code=embed(l);
      if(slot.innerHTML){slot.innerHTML='';return;}
      slot.innerHTML=code||'';
    };
  });
  $('#count').textContent=shown.length+' / '+DATA.length+' acts';
  updateCounts();
}
function updateCounts(){
  $('#favCount').textContent=favs.size+' starred';
  $('#footCount').textContent=DATA.length+' music acts · '+DAYS.length+' days · '+FLOORS.length+' stages';
}
function escapeHtml(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

// Play-all-visible on YouTube (anonymous playlist, no login)
$('#playAllYt').onclick=()=>{
  const ids=DATA.filter(matches).map(a=>a.links.find(l=>l.platform==='youtube'&&l.kind==='video')).filter(Boolean).map(l=>l.id);
  if(!ids.length){alert('No visible acts have a direct YouTube video. Adjust filters or set Platform = YouTube.');return;}
  const chunk=ids.slice(0,50);
  window.open('https://www.youtube.com/watch_videos?video_ids='+chunk.join(','),'_blank');
  if(ids.length>50) alert('Opened the first 50 of '+ids.length+' YouTube videos as one playlist. Narrow filters (e.g. one day + one stage) to page through the rest.');
};

$('#export').onclick=()=>{
  const picks=DATA.filter(a=>favs.has(a.id));
  if(!picks.length){alert('No favourites starred yet.');return;}
  const lines=picks.map(a=>{
    const when=a.shows.map(s=>s.start?dayLabel(s.start.slice(0,10))+' '+fmtTime(s.start)+'-'+fmtTime(s.end)+' @'+s.floor:'').filter(Boolean).join('; ');
    const url=a.primary?a.primary.url:'(no link)';
    return '• '+a.artist+'  ['+a.genre+']  '+when+'\\n    '+url;
  });
  const blob=new Blob(['Fusion 2026 — my picks ('+picks.length+')\\n\\n'+lines.join('\\n')],{type:'text/plain'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='fusion2026-my-picks.txt';link.click();
};
$('#clearFav').onclick=()=>{if(confirm('Clear all '+favs.size+' starred acts?')){favs.clear();saveFav();render()}};

if(location.protocol==='file:')document.getElementById('fileWarn').style.display='block';
render();
</script>
</body>
</html>`;

// index.html is the canonical file (served by GitHub Pages); also mirror to the friendly name.
fs.writeFileSync(path.join(here, 'index.html'), html);
fs.writeFileSync(path.join(here, 'fusion-2026-listen.html'), html);
console.log('wrote index.html + fusion-2026-listen.html  (' + (html.length/1024).toFixed(0) + ' KB, ' + data.length + ' acts)');
