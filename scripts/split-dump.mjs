import { parse } from 'node-html-parser';
import fs from 'fs';
import path from 'path';

const DUMP = 'src/modules/spring2026/_dump/bodyDump.html';
const REG = 'src/modules/spring2026/_dump/regions';
const SEC = 'src/modules/spring2026/_dump/sections';
fs.mkdirSync(REG, { recursive: true });
fs.mkdirSync(SEC, { recursive: true });

const dump = fs.readFileSync(DUMP, 'utf-8');
const root = parse(dump, { comment: true, blockTextElements: { script: true, style: true, noscript: true, pre: true } });
const top = root.childNodes.filter(n => n.nodeType === 1);

// semantic keys for the 9 top-level regions, in document order
const REGION_KEYS = [
  'shared-tooltip', 'page-loading-style', 'page-loading-overlay', 'top-nav-gradient',
  'signup-modal', 'video-modal', 'background-container', 'pill-nav', '__MAIN__', 'outro',
];
if (top.length !== REGION_KEYS.length) {
  console.error(`Expected ${REGION_KEYS.length} top-level regions, got ${top.length}`);
  top.forEach((el,i)=>console.error(`  [${i}] <${el.tagName.toLowerCase()}> ${(el.getAttribute('class')||'').slice(0,50)}`));
  process.exit(1);
}

const manifest = { regions: [], mainOpenTag: '', sections: [] };
top.forEach((el, i) => {
  const key = REGION_KEYS[i];
  if (key === '__MAIN__') {
    const html = el.outerHTML;
    manifest.mainOpenTag = html.slice(0, html.indexOf('>') + 1);
    const secs = el.childNodes.filter(n => n.nodeType === 1);
    secs.forEach(s => {
      const id = s.getAttribute('id') || s.getAttribute('data-component-extra-section-handle') || 'sec';
      const file = path.join(SEC, `${id}.html`);
      fs.writeFileSync(file, s.outerHTML);
      manifest.sections.push({ id, file: path.relative('src/modules/spring2026', file), len: s.outerHTML.length });
    });
  } else {
    const file = path.join(REG, `${key}.html`);
    fs.writeFileSync(file, el.outerHTML);
    manifest.regions.push({ key, file: path.relative('src/modules/spring2026', file), len: el.outerHTML.length });
  }
});

fs.writeFileSync('src/modules/spring2026/_dump/manifest.json', JSON.stringify(manifest, null, 2));
console.log('Regions:', manifest.regions.map(r=>`${r.key}(${r.len})`).join(' '));
console.log('mainOpenTag:', manifest.mainOpenTag);
console.log('Sections:', manifest.sections.map(s=>`${s.id}(${s.len})`).join(' '));
