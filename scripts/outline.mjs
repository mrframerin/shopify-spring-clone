import { parse } from 'node-html-parser';
import fs from 'fs';

const file = process.argv[2];
const maxDepth = parseInt(process.argv[3] || '40', 10);
const html = fs.readFileSync(file, 'utf-8');
const root = parse(html, { comment: false, blockTextElements: { script: true, style: true } });

const SKIP_TEXTTAGS = new Set(['svg','path','g','circle','style','script','defs','lineargradient','radialgradient','filter']);
function out(el, depth) {
  if (depth > maxDepth) return;
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { // text
      const t = n.rawText.replace(/\s+/g,' ').trim();
      if (t) console.log('  '.repeat(depth) + '· ' + JSON.stringify(t.slice(0,70)));
      continue;
    }
    if (n.nodeType !== 1) continue;
    const tag = n.tagName.toLowerCase();
    const id = n.getAttribute('id');
    const cls = (n.getAttribute('class')||'');
    const clsShort = cls.split(/\s+/).filter(Boolean).slice(0,4).join('.');
    const extra = [];
    for (const a of ['src','href','poster','data-section-key','data-component-name','aria-label','alt','data-component-extra-section-handle']) {
      const v = n.getAttribute(a);
      if (v) extra.push(`${a}=${JSON.stringify(v.length>50?v.slice(0,50)+'…':v)}`);
    }
    console.log('  '.repeat(depth) + `<${tag}${id?'#'+id:''}${clsShort?' .'+clsShort:''}>` + (extra.length?'  '+extra.join(' '):''));
    if (tag === 'svg') { console.log('  '.repeat(depth+1)+'…(svg)'); continue; }
    out(n, depth + 1);
  }
}
console.log(`# ${file}`);
out(root, 0);
