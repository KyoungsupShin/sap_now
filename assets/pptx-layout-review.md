# HTML / editable PPTX layout review — 2026-10-02

31 slides were rendered from HTML in Chromium at 1600×900 (2× capture), exported to PPTX, and independently rendered using LibreOffice. Paired images were visually inspected across every slide. Exact PPTX source images also matched each HTML capture byte-for-byte.

Added video placeholder slides 28–30 after the three-case overview at 27. Business Value is now 31. LLM Wiki is restored as slide 12, immediately before HANA Knowledge Graph (13) from dry-run PDF page 6. The 16:9 stage, play icon and text are editable; no video media is embedded.

Corrections found during review:
- Video play icons were obscured by exported native rectangles: rebuilt as native triangles without theme effects.
- CSS font names unavailable in the runtime produced different fallback selection: export now captures the actual Chromium font and sets Korean typefaces explicitly.
- DOM fragments lost layout gaps when concatenated: preserve independent positions for separated fragments, while adjoining inline fragments remain one text box to prevent overlap.
- CSS character spacing was missing: write it into native text runs.

Result: major image, table, card and video-stage positions are retained. No major clipping or content loss observed in the paired views after corrections. Editable output is not pixel-identical: small text width/baseline/weight differences and shape-edge rendering remain, particularly in dense tables and TCO/OPEX formulas. PowerPoint itself was not available for rendering; Microsoft PowerPoint appearance depends on installed fonts. Liberation Sans and Noto Sans CJK KR were used in this environment. For exact appearance use SAP_NOW_exact.pptx.

The percentage below counts pixels with a maximum RGB-channel difference above 32, at 1600×900. It includes text, image resampling and antialiasing; it is a diagnostic, not a layout pass threshold.

Font emphasis was reviewed across all 31 slides: regular body text, medium hierarchy and 41 bold HTML text fragments (previously 236). Team foundation thumbnails were regenerated with the same typography.

Slide 24 follow-up: the complete enterprise KPI message is bold, single-line and exported as exactly one text box. Compared HTML and LibreOffice PPTX render; no clipping or collision with neighboring table sections observed.

Main-title follow-up: all 31 h1 titles use weight 700 and export as bold text. Verified all main titles fit on a single line within the slide boundary. Body and component emphasis remain unchanged.

| Slide | HTML source | Review | Changed pixels |
|---|---|---|---|
| 1 | 1page.html | Layout retained; minor rendering differences | 1.591% |
| 2 | agenda.html | Layout retained; minor rendering differences | 2.752% |
| 3 | divider-01-vision.html | Layout retained; minor rendering differences | 2.280% |
| 4 | ai-native.html | Layout retained; minor rendering differences | 2.274% |
| 5 | 8page.html | Layout retained; minor rendering differences | 2.978% |
| 6 | 3page.html | Layout retained; minor rendering differences | 3.198% |
| 7 | 7page.html | Layout retained; minor rendering differences | 1.763% |
| 8 | app-ai-development-draft.html | Layout retained; minor rendering differences | 3.510% |
| 9 | 6page.html | Layout retained; minor rendering differences | 3.987% |
| 10 | divider-02-agents.html | Layout retained; minor rendering differences | 2.034% |
| 11 | 10page.html | Layout retained; minor rendering differences | 3.178% |
| 12 | llm-wiki-explanation.html | Layout retained; minor rendering differences | 3.327% |
| 13 | 9page.html | Layout retained; minor rendering differences | 4.728% |
| 14 | 11page.html | Layout retained; minor rendering differences | 4.493% |
| 15 | app-builder-explanation.html | Layout retained; minor rendering differences | 4.144% |
| 16 | 12page.html | Layout retained; minor rendering differences | 3.803% |
| 17 | 13page.html | Layout retained; minor rendering differences | 3.963% |
| 18 | divider-04-platform.html | Layout retained; minor rendering differences | 2.109% |
| 19 | 19page.html | Layout retained; minor rendering differences | 3.286% |
| 20 | 20page.html | Layout retained; minor rendering differences | 4.290% |
| 21 | 16page.html | Layout retained; minor rendering differences | 5.563% |
| 22 | 17page.html | Layout retained; minor rendering differences | 5.200% |
| 23 | 21page.html | Layout retained; minor rendering differences | 2.343% |
| 24 | 2page.html | Layout retained; minor rendering differences | 7.838% |
| 25 | 4page.html | Layout retained; minor rendering differences | 2.511% |
| 26 | 5page.html | Layout retained; minor rendering differences | 1.988% |
| 27 | 22page.html | Layout retained; minor rendering differences | 5.030% |
| 28 | demo-video-01-inbound.html | Layout retained; minor rendering differences | 2.065% |
| 29 | demo-video-02-exception.html | Layout retained; minor rendering differences | 1.918% |
| 30 | demo-video-03-orchestration.html | Layout retained; minor rendering differences | 2.245% |
| 31 | 23page.html | Layout retained; minor rendering differences | 2.818% |

Local paired review: `exports/rendered/review/SAP_NOW_layout_review.pdf` (ignored intermediate). Reproduce using `scripts/README.md`.
