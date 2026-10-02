# Presentation exports

The active `slides.js` manifest determines the export order.

Requirements: Node.js with Playwright, Chromium (`CHROMIUM_PATH` override supported), Python with `python-pptx`, PyMuPDF and Pillow.

From the repository root, start a static server in one terminal:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Render and package in another terminal:

```bash
SLIDE_BASE_URL=http://127.0.0.1:8000/ node scripts/render-slides.cjs
python scripts/package-slide-exports.py
```

Outputs:

- `exports/SAP_NOW_exact.pptx`: one full-bleed image per slide for original appearance.
- `exports/SAP_NOW.pdf`: identical 3200×1800 render images, 31 landscape pages.
- `exports/SAP_NOW_editable.pptx`: all visible HTML text (cover, titles, body copy, tables, agenda labels and page numbers) is editable PowerPoint text. Simple card backgrounds and borders are native shapes. Page 23 also exposes the KPI band and organizational/team table cell backgrounds as editable rectangles; KPI labels remain separate editable text boxes. Complex diagrams, images and CSS decorations retain the raster rendering as a PowerPoint picture background fill, rather than a selectable full-slide picture shape. Text already embedded within image assets stays in those images; this is not an all-vector reconstruction. Native text uses the actual Chromium-rendered font family, with explicit Korean font selection; substitution in PowerPoint may change typography when that font is unavailable. Use the exact version when appearance takes priority.

The export captures each HTML page at a 1600×900 viewport and device scale 2 after fonts and images finish loading. Intermediate renders are local build outputs. Regenerate all three files after changing slides.

To update only the editable PPTX while leaving the exact PPTX and PDF unchanged:

```bash
SLIDE_BASE_URL=http://127.0.0.1:8000/ node scripts/render-slides.cjs
python scripts/package-slide-exports.py --editable-only
```

Demo video slides (28–30) provide editable 16:9 placeholder rectangles. No video file is embedded; insert each case video in PowerPoint.

Layout review (requires LibreOffice and NumPy):

```bash
mkdir -p /tmp/sap-now-review
soffice --headless --convert-to pdf --outdir /tmp/sap-now-review exports/SAP_NOW_editable.pptx
python scripts/verify-slide-layouts.py /tmp/sap-now-review/SAP_NOW_editable.pdf
```

The review PDF under `exports/rendered/review/` pairs each HTML slide with its rendered editable PPTX. Pixel metrics are diagnostics; manually inspect every page. The check also verifies that every exact PPTX image matches its HTML screenshot byte-for-byte. LibreOffice rendering does not certify Microsoft PowerPoint font rendering. Use Liberation Sans and Noto Sans CJK KR on the viewing machine for the fonts used by this export environment.

## Speaker script PDF

`exports/SAP_NOW_speaker_script_50min.md` contains the Korean narration for all 31 slides. With current slide renders available, run:

```bash
node scripts/build-speaker-script.cjs
```

This creates `exports/SAP_NOW_speaker_script_50min.pdf`: an A4 guide followed by one script page per slide, with slide previews, section bookmarks, target durations and cumulative timing. The 50-minute timeline assumes a 2-minute opening video and three 90-second demo videos; actual narration pace and video duration should be checked in rehearsal. Q&A is separate.
