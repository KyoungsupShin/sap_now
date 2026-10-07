/* Faithful 16:9 render of active slides; needs Playwright and Chromium. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync}=require('node:child_process');
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
      // Fit accidental wrapping for the PPTX export only; preserve explicit breaks.
      const fitAdjustments=await page.evaluate(()=>{
        const root=document.querySelector('main.slide');
        for(const e of root.querySelectorAll('*'))if(getComputedStyle(e).fontWeight==='500')e.style.setProperty('font-weight','700','important');
        const changes=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
        const lineCount=n=>{const r=document.createRange();r.selectNodeContents(n);return new Set([...r.getClientRects()].filter(x=>x.width>1&&x.height>1).map(x=>Math.round(x.y))).size;};
        while(walker.nextNode()){
          const n=walker.currentNode,e=n.parentElement;
          if(!n.textContent.trim()||e.closest('svg,script,style')||e.childElementCount)continue;
          const st=getComputedStyle(e);if(st.whiteSpace.startsWith('pre')||st.display==='none'||st.visibility==='hidden')continue;
          const before=lineCount(n);if(before<2)continue;
          const original=parseFloat(st.fontSize);const minimum=Math.max(14,original*.5);let best=original;
          for(let size=original-.5;size>=minimum;size-=.5){e.style.setProperty('font-size',size+'px','important');best=size;if(lineCount(n)<=1)break;}
          changes.push({text:n.textContent.trim(),original,fontSize:best,before,after:lineCount(n)});
        }
        const cover=root.querySelector('.cover-subtitle');if(cover){const h=root.querySelector('h1');cover.style.top=(h.getBoundingClientRect().bottom+24)+'px';}
        return changes;
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
      // Keep the six team thumbnails in sync with the live foundation typography.
      if (slide.file === '4page.html') {
        await page.locator('.assistant-map').screenshot({path:path.join(root,'assets','connected-foundation-thumbnail.png'),animations:'disabled'});
      }
      await page.evaluate(async()=>{for(const v of document.querySelectorAll('video')){v.pause();if(v.readyState>=1)v.currentTime=2;}});
      for(const v of await page.locator('video').all()) await v.evaluate(async v=>{if(v.readyState>=1){await new Promise(resolve=>{if(!v.seeking){resolve();return;}v.addEventListener('seeked',resolve,{once:true});});}});
      const filename = `${String(slide.order).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(output, filename), clip: box, animations: 'disabled' });
      const nativeMedia=[];
      for(const [index,e] of (await page.locator('main.slide img,main.slide video').all()).entries()){
        const m=await e.evaluate(e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return {kind:e.tagName.toLowerCase(),src:e.currentSrc||e.src,poster:e.poster||null,x:r.x,y:r.y,width:r.width,height:r.height,naturalWidth:e.naturalWidth||e.videoWidth,naturalHeight:e.naturalHeight||e.videoHeight,fit:c.objectFit};});
        if(m.width<=0||m.height<=0)continue;
        m.preview=path.join(output,`${String(slide.order).padStart(2,'0')}-media-${index}.png`);
        await e.screenshot({path:m.preview});
        if(m.kind==='video')execFileSync('ffmpeg',['-y','-v','error','-ss','2','-i',path.join(root,decodeURIComponent(new URL(m.src).pathname)),'-frames:v','1','-vf',`scale=${Math.round(m.width*2)}:${Math.round(m.height*2)}`,m.preview]);
        nativeMedia.push(m);
      }
      const nativeCurves=await page.evaluate(()=>[...document.querySelectorAll('.flow-ribbon')].map(svg=>{const r=svg.getBoundingClientRect();const curves=[...svg.querySelectorAll('path')].map(p=>({d:p.getAttribute('d'),stroke:p.getAttribute('stroke'),width:Number(p.getAttribute('stroke-width'))}));svg.style.visibility='hidden';return {x:r.x,y:r.y,width:r.width,height:r.height,viewWidth:svg.viewBox.baseVal.width,viewHeight:svg.viewBox.baseVal.height,curves};}));
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
          let owner=parent.matches('.enterprise-kpis > span') ? parent : (parent.closest('h1,h2,h3,h4,p,li,dt,dd,th,td,.conclusion') || parent);
          // Inline labels and emphasis belong to one editable line, even if
          // their CSS styles or flex spacing differ.
          const inlineContainer=parent.closest('.bridge,.shared-goal,.flow-step');
          if(inlineContainer)owner=inlineContainer;
          else if(parent.matches('.closing-pillar h2,.closing-pillar .outcome'))owner=parent.closest('.closing-pillar');
          else if(owner===parent){
            while(owner.parentElement&&getComputedStyle(owner).display.startsWith('inline'))owner=owner.parentElement;
          }
          if(!owners.has(owner))owners.set(owner,owners.size);
          let scale=1;
          for(let e=parent;e&&e!==root.parentElement;e=e.parentElement){const t=getComputedStyle(e).transform;if(t!=='none'){const m=new DOMMatrix(t);scale*=Math.hypot(m.c,m.d);}}
          let line;
          for (let j=0; j<node.textContent.length; j++) {
            const range=document.createRange(); range.setStart(node,j); range.setEnd(node,j+1);
            const r=range.getBoundingClientRect(); let char=node.textContent[j];
            if (!r.width || !r.height || r.bottom<=0 || r.top>=900) continue;
            if (style.textTransform==='uppercase') char=char.toUpperCase();
            if (style.textTransform==='lowercase') char=char.toLowerCase();
            if (!line || Math.abs(line.y-r.y)>1) {
              line={owner:owners.get(owner),text:'',x:r.x,y:r.y,width:0,height:r.height,fontSize:parseFloat(style.fontSize)*scale,font:parent.dataset.exportFont || style.fontFamily.split(',')[0].replaceAll('"',''),weight:style.fontWeight,letterSpacing:(parseFloat(style.letterSpacing)||0)*scale,color:style.color,italic:style.fontStyle==='italic'};
              textLines.push(line);
            }
            line.text+=char; line.width=r.right-line.x; parents.add(parent);
          }
        }
        const selector='.demo-video-placeholder,.enterprise-kpis,.cap,.development-step,.execution-stage,.process-node,.item,.model-node,.oversight-card,.request,.shared-entry,.business-context-detail .operation-table td,.business-context-detail .operation-table th,.business-context-detail .response-table th,.team-card,.bridge,.challenge,.solution,.operation,.flow-step,.shared-goal,.capability-card,.assistant-card,.team-tile,.module,.stack,.detail-header,.flow-step small';
        const cards=document.querySelector('main.original-scenario') ? [] : [...root.querySelectorAll(selector)].map((e,i)=> {
          const b=e.getBoundingClientRect(),c=getComputedStyle(e);
          e.dataset.exportCard=i;
          return {id:i,x:b.x,y:b.y,width:b.width,height:b.height,fill:c.backgroundColor,border:c.borderLeftColor,borderWidth:parseFloat(c.borderLeftWidth),topColor:c.borderTopColor,topWidth:parseFloat(c.borderTopWidth),radius:parseFloat(c.borderTopLeftRadius),edges:['Top','Right','Bottom','Left'].map(side=>({side,width:parseFloat(c['border'+side+'Width']),color:c['border'+side+'Color']}))};
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
          e.style.setProperty('box-shadow','none','important');
        }
        for(const e of root.querySelectorAll('img,video')) e.style.visibility='hidden';
        return {cards,icons,textLines:textLines.filter(l=>l.text.trim())};
      });
      // Preserve CSS-generated arrow glyphs in the raster background.
      await page.addStyleTag({content:'main.slide *::before,main.slide *::after{-webkit-text-fill-color:initial !important}'});
      await page.screenshot({path:path.join(output,`${String(slide.order).padStart(2,'0')}-base.png`),clip:box,animations:'disabled'});
      const cards=content.cards;
      slide.fitAdjustments=fitAdjustments;
      slide.nativeMedia=nativeMedia;
      slide.nativeCurves=nativeCurves;
      slide.nativeText=content.textLines;
      slide.nativeCards = cards;
      slide.nativeIcons = content.icons;
      console.log(`${slide.order}/${slides.length}: ${slide.title} (${cards.length} cards, ${content.textLines.length} editable text boxes)`);
    }
    fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(slides, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
