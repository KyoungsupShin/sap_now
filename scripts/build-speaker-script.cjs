/* Build the sectioned, Korean speaker script from its reviewable Markdown source. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const slides=vm.runInNewContext(fs.readFileSync(path.join(root,'slides.js'),'utf8')+';slides');
const source=fs.readFileSync(path.join(root,'exports','SAP_NOW_speaker_script_50min.md'),'utf8');
const parts=source.split(/^## (\d\d)\s*$/m);
const durations=[170,70,30,100,100,90,90,90,100,30,120,120,150,150,150,150,150,30,130,140,100,80,20,80,40,30,40,130,130,130,60];
const videos={1:120,28:90,29:90,30:90};
const sectionStarts={1:['OPENING','오프닝 · 소개 영상 · 목차'],3:['SECTION 01','Autonomous Enterprise & Governance'],10:['SECTION 02','Agentic Execution'],18:['SECTION 03','SAP BTP Architecture'],23:['SECTION 04','Demo & Business Value']};
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const time=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const duration=s=>s<60 ? `${s}초` : `${Math.floor(s/60)}분${s%60 ? ` ${s%60}초`:''}`;
if(slides.length!==31 || durations.reduce((a,b)=>a+b,0)!==3000 || parts.length!==63)throw new Error('Unexpected script structure or timeline');
let elapsed=0, section='';
let blocks='';
const audit=[];
for(let i=1;i<parts.length;i+=2){
 const n=Number(parts[i]), slide=slides[n-1];
 if(n!==slide.order)throw new Error('Slide order mismatch');
 if(sectionStarts[n])section=sectionStarts[n];
 const paragraphs=parts[i+1].trim().split(/\n\s*\n/);
 const spoken=paragraphs.filter(p=>!p.startsWith('['));
 audit.push({slide:n,title:slide.title,start:time(elapsed),end:time(elapsed+durations[n-1]),seconds:durations[n-1],videoSeconds:videos[n]||0,spokenCharacters:spoken.join('').length});
 const imagePath=path.join(root,'exports','rendered',`${String(n).padStart(2,'0')}.png`);
 const image='data:image/png;base64,'+fs.readFileSync(imagePath).toString('base64');
 blocks+=`<section class="script-page"><div class="section-bar">${escape(section[0])} &nbsp; ${escape(section[1])}</div><div class="slide-head"><div><div class="slide-number">SLIDE ${String(n).padStart(2,'0')}</div><h2>${escape(slide.title)}</h2><p class="timing">목표 ${duration(durations[n-1])} · ${time(elapsed)}–${time(elapsed+durations[n-1])}</p><p class="speech-time">발표·화면 설명 ${duration(durations[n-1]-(videos[n]||0))}${videos[n]?` + 영상 ${duration(videos[n])}`:''}</p></div><img src="${image}" alt="Slide ${n}"></div><div class="script-body">${paragraphs.map(p=>`<p class="${p.startsWith('[영상]')?'video-cue':p.startsWith('[')?'cue':'spoken'}">${escape(p).replaceAll('\n','<br>')}</p>`).join('')}</div></section>`;
 elapsed+=durations[n-1];
}
const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>SAP NOW · 50분 발표 스크립트</title><style>
@page{size:A4;margin:15mm 15mm 18mm}*{box-sizing:border-box}body{margin:0;color:#1d2d3e;font-family:"Noto Sans CJK KR",Arial,sans-serif;font-size:13.5px;line-height:1.75}h1,h2{line-height:1.35;word-break:keep-all}h1{font-size:35px;letter-spacing:-1px;margin:24px 0 18px}h2{font-size:19px;letter-spacing:-.4px;margin:7px 0 10px}.cover{break-after:page}.cover .eyebrow{font-size:13px;color:#0070f2;font-weight:700;letter-spacing:1px}.cover .subtitle{font-size:19px;color:#475e75;margin:0 0 34px}.cover p{margin:16px 0}.cover h3{font-size:16px;margin:30px 0 10px}.cover table{border-collapse:collapse;width:100%;font-size:12px;margin:24px 0}th{background:#0070f2;color:white;text-align:left}th,td{padding:10px;border-bottom:1px solid #d5dde5}.cover .note{background:#f1f7fd;border-left:4px solid #0070f2;padding:12px 16px}.section-bar{border-bottom:2px solid #0070f2;color:#0070f2;padding-bottom:9px;font-size:11px;font-weight:700}.script-page{break-before:page;break-after:page}.script-page:last-child{break-after:auto}.slide-head{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:18px;align-items:start;margin:20px 0 16px}.slide-head img{width:210px;height:118px;object-fit:contain;border:1px solid #d5dde5}.slide-number{font-size:11px;color:#0070f2;font-weight:700;letter-spacing:1px}.timing{font-size:12px;font-weight:600;margin:0}.speech-time{font-size:11px;color:#556b82;margin:3px 0 0}.script-body p{margin:0 0 10px;word-break:keep-all;overflow-wrap:anywhere}.cue{font-size:11px;color:#556b82;border-left:3px solid #b5d6f7;background:#f5f9fd;padding:8px 11px}.video-cue{font-size:12px;font-weight:600;color:#0057a9;background:#eaf3ff;border:1px solid #b5d6f7;padding:10px 12px}.spoken{font-weight:400}p{orphans:3;widows:3}
</style></head><body><section class="cover"><div class="eyebrow">SAP NOW · PRESENTER COPY</div><h1>50분 발표 스크립트</h1><p class="subtitle">31개 슬라이드 · 섹션별 발표 원고</p><p>현재 발표 자료의 순서와 화면을 기준으로 작성했습니다.<br>2026년 10월 2일 · Wiki 12페이지, HANA Knowledge Graph 13페이지</p><table><thead><tr><th>구간</th><th>슬라이드</th><th>시간</th><th>종료</th></tr></thead><tbody><tr><td>오프닝·소개 영상·목차</td><td>1–2</td><td>4분</td><td>04:00</td></tr><tr><td>01 Enterprise & Governance</td><td>3–9</td><td>10분</td><td>14:00</td></tr><tr><td>02 Agentic Execution</td><td>10–17</td><td>17분</td><td>31:00</td></tr><tr><td>03 SAP BTP Architecture</td><td>18–22</td><td>8분</td><td>39:00</td></tr><tr><td>04 Demo & Business Value</td><td>23–31</td><td>11분</td><td>50:00</td></tr></tbody></table><div class="note">총 50분은 발표·화면 설명 43분 30초와 영상 6분 30초를 포함한 목표 시간입니다. 질의응답은 별도입니다.</div><h3>영상과 시간 조정</h3><p>오프닝 소개 영상은 2분, 데모 영상 3개는 각각 1분 30초로 가정합니다. 실제 영상 파일은 이 PDF에 포함되어 있지 않습니다.</p><p>영상이 길어지면 27페이지 요약과 28–30페이지 전후 멘트를 줄입니다. 영상이 짧아지면 24페이지의 부서별 판단 예시나 17페이지의 팀 간 조건 조율을 보완합니다.</p><h3>원고 사용법</h3><p>[화면 안내]와 [영상]은 읽지 않고 진행 동작으로 사용합니다. 각 장의 시간에는 짧은 호흡과 화면을 짚는 동작을 포함했습니다. 목표 시간은 실제 영상 길이와 발표 속도에 맞춰 리허설에서 확인합니다.</p></section>${blocks}</body></html>`;
(async()=>{
 const output=path.join(root,'exports','rendered','speaker-script');fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'SAP_NOW_speaker_script_50min.html'),html);
 fs.writeFileSync(path.join(output,'timing.json'),JSON.stringify(audit,null,2));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{const page=await browser.newPage();await page.setContent(html,{waitUntil:'load'});await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});await page.pdf({path:path.join(root,'exports','SAP_NOW_speaker_script_50min.pdf'),printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,headerTemplate:'<div></div>',footerTemplate:'<div style="font-family:Arial,sans-serif;font-size:9px;width:100%;padding:0 56px;color:#556b82;display:flex;justify-content:space-between"><span>SAP NOW · Speaker Script</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'});const toc=[[1,'발표 안내 · 50분 시간표',1]];
for(const slide of slides){if(sectionStarts[slide.order])toc.push([1,sectionStarts[slide.order][1],slide.order+1]);toc.push([2,`${String(slide.order).padStart(2,'0')} · ${slide.title}`,slide.order+1]);}
execFileSync('python',['-c','import fitz,json,sys; d=fitz.open(sys.argv[1]); d.set_toc(json.loads(sys.argv[2])); d.set_metadata({"title":"SAP NOW · 50분 발표 스크립트","subject":"31-slide Korean speaker script with section timing and video cues","author":"SAP NOW"}); d.saveIncr()',path.join(root,'exports','SAP_NOW_speaker_script_50min.pdf'),JSON.stringify(toc)]);
console.log('Created full 31-slide speaker script. Timeline: 50:00; videos: 06:30.');}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
