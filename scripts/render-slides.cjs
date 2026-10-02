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
      // Capture the fonts Chromium actually used, including CSS fallback fonts.
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
      await page.evaluate(() => {
        let index=0;
        for(const e of document.querySelectorAll('main.slide *')) {
          if([...e.childNodes].some(n=>n.nodeType===Node.TEXT_NODE && n.textContent.trim())) e.dataset.exportFontId=index++;
        }
      });
      const {root:domRoot}=await cdp.send('DOM.getDocument');
      const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:domRoot.nodeId,selector:'[data-export-font-id]'});
      for(const nodeId of nodeIds) {
        const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
        if(!fonts.length) continue;
        const font=fonts.find(f=>!f.familyName.includes('CJK')) || fonts[0];
        const {object}=await cdp.send('DOM.resolveNode',{nodeId});
        await cdp.send('Runtime.callFunctionOn',{objectId:object.objectId,functionDeclaration:'function(font){this.dataset.exportFont=font}',arguments:[{value:font.familyName}]});
      }
      await cdp.detach();
      const box = await page.locator('main.slide').boundingBox();
      if (!box || box.width !== 1600 || box.height !== 900) throw new Error(`Unexpected slide dimensions: ${slide.file} ${JSON.stringify(box)}`);
      const filename = `${String(slide.order).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(output, filename), clip: box, animations: 'disabled' });
      const content = await page.evaluate(() => {
        const root = document.querySelector('main.slide');
        const textLines = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const parents = new Set();
        const owners = new Map();
        while (walker.nextNode()) {
          const node = walker.currentNode, parent = node.parentElement;
          if (parent.closest('script,style,svg')) continue;
          const style = getComputedStyle(parent);
          if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue;
          const owner=parent.matches('.enterprise-kpis > span') ? parent : (parent.closest('h1,h2,h3,h4,p,li,dt,dd,th,td,.conclusion') || parent);
          if(!owners.has(owner))owners.set(owner,owners.size);
          let line;
          for (let j=0; j<node.textContent.length; j++) {
            const range=document.createRange(); range.setStart(node,j); range.setEnd(node,j+1);
            const r=range.getBoundingClientRect(); let char=node.textContent[j];
            if (!r.width || !r.height || r.bottom<=0 || r.top>=900) continue;
            if (style.textTransform==='uppercase') char=char.toUpperCase();
            if (style.textTransform==='lowercase') char=char.toLowerCase();
            if (!line || Math.abs(line.y-r.y)>1) {
              line={owner:owners.get(owner),text:'',x:r.x,y:r.y,width:0,height:r.height,fontSize:parseFloat(style.fontSize),font:parent.dataset.exportFont || style.fontFamily.split(',')[0].replaceAll('"',''),weight:style.fontWeight,letterSpacing:parseFloat(style.letterSpacing)||0,color:style.color,italic:style.fontStyle==='italic'};
              textLines.push(line);
            }
            line.text+=char; line.width=r.right-line.x; parents.add(parent);
          }
        }
        const selector='.demo-video-placeholder,.enterprise-kpis,.cap,.development-step,.execution-stage,.process-node,.item,.model-node,.oversight-card,.request,.shared-entry,.business-context-detail .operation-table td,.business-context-detail .operation-table th,.business-context-detail .response-table th';
        const cards=document.querySelector('main.original-scenario') ? [] : [...root.querySelectorAll(selector)].filter(e=>!e.querySelector(selector)).map((e,i)=> {
          const b=e.getBoundingClientRect(),c=getComputedStyle(e);
          e.dataset.exportCard=i;
          return {id:i,x:b.x,y:b.y,width:b.width,height:b.height,fill:c.backgroundColor,border:c.borderLeftColor,borderWidth:parseFloat(c.borderLeftWidth),topColor:c.borderTopColor,topWidth:parseFloat(c.borderTopWidth),radius:parseFloat(c.borderTopLeftRadius)};
        });
        const icons=[...root.querySelectorAll('.demo-video-play')].map(e=>{const b=e.getBoundingClientRect();e.style.visibility='hidden';return {x:b.x,y:b.y,width:b.width,height:b.height,color:'#0070f2'};});
        // Hide text ink only: retain layout, images, card geometry and icons.
        for (const parent of parents) {
          parent.style.setProperty('color','transparent','important');
          parent.style.setProperty('-webkit-text-fill-color','transparent','important');
          parent.style.setProperty('text-shadow','none','important');
          parent.style.setProperty('text-decoration-color','transparent','important');
        }
        for (const e of root.querySelectorAll('[data-export-card]')) {
          e.style.setProperty('background','transparent','important');
          e.style.setProperty('border-color','transparent','important');
        }
        return {cards,icons,textLines:textLines.filter(l=>l.text.trim())};
      });
      // Preserve CSS-generated arrow glyphs in the raster background.
      await page.addStyleTag({content:'main.slide *::before,main.slide *::after{-webkit-text-fill-color:initial !important}'});
      await page.screenshot({path:path.join(output,`${String(slide.order).padStart(2,'0')}-base.png`),clip:box,animations:'disabled'});
      const cards=content.cards;
      slide.nativeText=content.textLines;
      slide.nativeCards = cards;
      slide.nativeIcons = content.icons;
      console.log(`${slide.order}/${slides.length}: ${slide.title} (${cards.length} cards, ${content.textLines.length} editable text boxes)`);
    }
    fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(slides, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
