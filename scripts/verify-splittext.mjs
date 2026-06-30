import { parse } from 'node-html-parser';
import fs from 'fs';

// Candidate SplitText algorithm -> produces the inner HTML of the .split-text span
function splitTextInner(str) {
  const chars = [...str];
  const N = chars.length;
  const groups = str.match(/[^ ]+ */g) || [];
  let i = 0;
  let html = '';
  for (const g of groups) {
    html += '<span class="inline-flex flex-nowrap">';
    for (const ch of [...g]) {
      const show = i * 18;
      const hide = (N - 1 - i) * 9;
      html += `<span class="split-char inline-block whitespace-pre" style="--show-char-delay:${show}ms;--hide-char-delay:${hide}ms">${ch}</span>`;
      i++;
    }
    html += '</span>';
  }
  return html;
}

const s = fs.readFileSync('src/modules/spring2026/_dump/sections/hero.html', 'utf-8');
const root = parse(s);

function checkOne(label, fullText, splitTextEl) {
  const expected = splitTextEl.innerHTML;
  const got = splitTextInner(fullText);
  const ok = expected === got;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  (text=${JSON.stringify(fullText)})`);
  if (!ok) {
    // show first diff
    for (let k=0;k<Math.max(expected.length,got.length);k++){
      if (expected[k]!==got[k]){ console.log('  first diff @',k,'\n  exp:',JSON.stringify(expected.slice(k-20,k+40)),'\n  got:',JSON.stringify(got.slice(k-20,k+40))); break; }
    }
  }
}

// nav items
for (const a of root.querySelectorAll('a[data-component-name="menu-item-link"]')) {
  const sr = a.querySelector('.sr-only').textContent;
  const st = a.querySelector('.split-text');
  checkOne('nav:'+sr, sr, st);
}
// description
const desc = root.querySelector('.hero-description-text .split-text');
const descSr = root.querySelector('.hero-description-text .sr-only').textContent;
checkOne('description', descSr, desc);
