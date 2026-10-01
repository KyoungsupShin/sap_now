/* Faithful 16:9 render of active slides; needs Playwright and Chromium. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');
(async () => {
  const root = path.resolve(__dirname, '..');
  const output = path.resolve(process.argv[2] || path.join(root, 'exports', 'rendered'));
  fs.mkdirSync(output, { recursive: true });
  const slides = vm.runInNewContext(fs.readFileSync(path.join(root, 'slides.js'), 'utf8') + ';slides');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
    for (const slide of slides) {
      await page.goto((process.env.SLIDE_BASE_URL || 'http://127.0.0.1:8002/') + slide.file, { waitUntil: 'load' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(i => i.decode()));
      });
      const box = await page.locator('main.slide').boundingBox();
      if (!box || box.width !== 1600 || box.height !== 900) throw new Error(`Unexpected slide dimensions: ${slide.file} ${JSON.stringify(box)}`);
      const filename = `${String(slide.order).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(output, filename), clip: box, animations: 'disabled' });
      // Render simple card backgrounds as editable native PowerPoint rectangles.
      const cards = await page.evaluate(() => {
        if(document.querySelector('main.original-scenario'))return [];
        const selector = '.cap,.development-step,.execution-stage,.process-node,.item,.model-node,.oversight-card,.request,.shared-entry';
        return [...document.querySelectorAll(selector)].filter(e => !e.querySelector(selector)).map((e, i) => {
          e.dataset.exportCard = i;
          const b = e.getBoundingClientRect(), c = getComputedStyle(e);
          const lines=[];
          const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
          while(walker.nextNode()) {
            const node=walker.currentNode, style=getComputedStyle(node.parentElement);
            if(style.visibility==='hidden'||style.display==='none') continue;
            let line;
            for(let j=0;j<node.textContent.length;j++) {
              const range=document.createRange();range.setStart(node,j);range.setEnd(node,j+1);
              const r=range.getBoundingClientRect(),char=node.textContent[j];
              if(!r.width||!r.height)continue;
              if(!line||Math.abs(line.y-r.y)>1){line={text:'',x:r.x,y:r.y,width:0,height:r.height,fontSize:parseFloat(style.fontSize),font:style.fontFamily.split(',')[0].replaceAll('"',''),weight:style.fontWeight,color:style.color,italic:style.fontStyle==='italic'};lines.push(line);}
              line.text+=char;line.width=r.right-line.x;
            }
          }
          return {id:i,x:b.x,y:b.y,width:b.width,height:b.height,fill:c.backgroundColor,border:c.borderLeftColor,borderWidth:parseFloat(c.borderLeftWidth),topColor:c.borderTopColor,topWidth:parseFloat(c.borderTopWidth),radius:parseFloat(c.borderTopLeftRadius),textLines:lines};
        });
      });
      await page.addStyleTag({content:'[data-export-card]{visibility:hidden !important}[data-export-card]::after{visibility:visible !important}'});
      await page.screenshot({ path:path.join(output, `${String(slide.order).padStart(2,'0')}-base.png`),clip:box,animations:'disabled'});
      slide.nativeCards = cards;
      console.log(`${slide.order}/${slides.length}: ${slide.title} (${cards.length} editable cards)`);
    }
    fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(slides, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
