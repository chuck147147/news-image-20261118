import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(join(homedir(), 'workspace/tools/playwright-lab/package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  await page.goto(new URL('./news.html', import.meta.url).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL('./entry.png', import.meta.url).pathname, type: 'png' });
  const png = readFileSync(new URL('./entry.png', import.meta.url));
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  console.log(`PNG size: ${png.length} bytes; dimensions: ${width}×${height}`);
  if (png.length > 1048576 || width !== 1024 || height !== 1024) throw new Error('PNG fails size or dimension requirements');
  const overflow = await page.evaluate(() => {
    const errors = [];
    for (const el of document.querySelectorAll('.story, .masthead, .markets, footer')) {
      const box = el.getBoundingClientRect();
      if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) errors.push(`${el.className || el.tagName}: overflow`);
      for (const child of el.querySelectorAll('h2,p,.date,.subline')) {
        const r = child.getBoundingClientRect();
        if (r.bottom > box.bottom + 0.5 || r.right > box.right + 0.5) errors.push(`${child.textContent}: outside container`);
      }
      if (box.bottom > 1024 || box.right > 1024) errors.push('Outside canvas');
    }
    return errors;
  });
  if (overflow.length) throw new Error(overflow.join('\n'));
  console.log('Layout verified: all cards and text fit within the canvas.');
} finally {
  await browser.close();
}
