# HTML / editable PPTX layout review — 2026-10-02

30 slides were rendered from HTML in Chromium at 1600×900 (2× capture), exported to PPTX, and independently rendered using LibreOffice. Paired images were visually inspected across every slide. Exact PPTX source images also matched each HTML capture byte-for-byte.

Added video placeholder slides 27–29 after the three-case overview at 26. Business Value is now 30. The 16:9 stage, play icon and text are editable; no video media is embedded.

Corrections found during review:
- Video play icons were obscured by exported native rectangles: rebuilt as native triangles without theme effects.
- CSS font names unavailable in the runtime produced different fallback selection: export now captures the actual Chromium font and sets Korean typefaces explicitly.
- DOM fragments lost layout gaps when concatenated: preserve independent positions for separated fragments, while adjoining inline fragments remain one text box to prevent overlap.
- CSS character spacing was missing: write it into native text runs.

Result: major image, table, card and video-stage positions are retained. No major clipping or content loss observed in the paired views after corrections. Editable output is not pixel-identical: small text width/baseline/weight differences and shape-edge rendering remain, particularly in dense tables and TCO/OPEX formulas. PowerPoint itself was not available for rendering; Microsoft PowerPoint appearance depends on installed fonts. Liberation Sans and Noto Sans CJK KR were used in this environment. For exact appearance use SAP_NOW_exact.pptx.

The percentage below counts pixels with a maximum RGB-channel difference above 32, at 1600×900. It includes text, image resampling and antialiasing; it is a diagnostic, not a layout pass threshold.

| Slide | HTML source | Review | Changed pixels |
|---|---|---|---|
| 1 | 1page.html | Layout retained; minor rendering differences | 1.427% |
| 2 | agenda.html | Layout retained; minor rendering differences | 2.679% |
| 3 | divider-01-vision.html | Layout retained; minor rendering differences | 2.072% |
| 4 | ai-native.html | Layout retained; minor rendering differences | 2.214% |
| 5 | 8page.html | Layout retained; minor rendering differences | 2.927% |
| 6 | 3page.html | Layout retained; minor rendering differences | 3.057% |
| 7 | 7page.html | Layout retained; minor rendering differences | 1.703% |
| 8 | app-ai-development-draft.html | Layout retained; minor rendering differences | 3.389% |
| 9 | 6page.html | Layout retained; minor rendering differences | 3.723% |
| 10 | divider-02-agents.html | Layout retained; minor rendering differences | 1.860% |
| 11 | 10page.html | Layout retained; minor rendering differences | 3.057% |
| 12 | 9page.html | Layout retained; minor rendering differences | 4.532% |
| 13 | 11page.html | Layout retained; minor rendering differences | 4.353% |
| 14 | app-builder-explanation.html | Layout retained; minor rendering differences | 4.045% |
| 15 | 12page.html | Layout retained; minor rendering differences | 3.617% |
| 16 | 13page.html | Layout retained; minor rendering differences | 3.764% |
| 17 | divider-04-platform.html | Layout retained; minor rendering differences | 1.885% |
| 18 | 19page.html | Layout retained; minor rendering differences | 3.105% |
| 19 | 20page.html | Layout retained; minor rendering differences | 4.040% |
| 20 | 16page.html | Layout retained; minor rendering differences | 5.950% |
| 21 | 17page.html | Layout retained; minor rendering differences | 5.540% |
| 22 | 21page.html | Layout retained; minor rendering differences | 2.064% |
| 23 | 2page.html | Layout retained; minor rendering differences | 7.645% |
| 24 | 4page.html | Layout retained; minor rendering differences | 2.685% |
| 25 | 5page.html | Layout retained; minor rendering differences | 2.089% |
| 26 | 22page.html | Layout retained; minor rendering differences | 5.540% |
| 27 | demo-video-01-inbound.html | Layout retained; minor rendering differences | 1.900% |
| 28 | demo-video-02-exception.html | Layout retained; minor rendering differences | 1.775% |
| 29 | demo-video-03-orchestration.html | Layout retained; minor rendering differences | 2.042% |
| 30 | 23page.html | Layout retained; minor rendering differences | 2.727% |

Local paired review: `exports/rendered/review/SAP_NOW_layout_review.pdf` (ignored intermediate). Reproduce using `scripts/README.md`.
