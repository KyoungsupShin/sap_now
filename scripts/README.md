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
- `exports/SAP_NOW.pdf`: identical 3200×1800 render images, 27 landscape pages.
- `exports/SAP_NOW_editable.pptx`: all visible HTML text (cover, titles, body copy, tables, agenda labels and page numbers) is editable PowerPoint text. Simple card backgrounds and borders are native shapes. Complex diagrams, images and CSS decorations retain the raster rendering as a PowerPoint picture background fill, rather than a selectable full-slide picture shape. Text already embedded within image assets stays in those images; this is not an all-vector reconstruction. Native text uses the original CSS font family; substitution in PowerPoint may change typography when that font is unavailable. Use the exact version when appearance takes priority.

The export captures each HTML page at a 1600×900 viewport and device scale 2 after fonts and images finish loading. Intermediate renders are local build outputs. Regenerate all three files after changing slides.

To update only the editable PPTX while leaving the exact PPTX and PDF unchanged:

```bash
SLIDE_BASE_URL=http://127.0.0.1:8000/ node scripts/render-slides.cjs
python scripts/package-slide-exports.py --editable-only
```
