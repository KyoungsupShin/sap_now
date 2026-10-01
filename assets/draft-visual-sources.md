# Six-slide PDF visual replacement

The six self-authored SVG diagrams from the previous pass were removed and replaced with images extracted directly from the SAP presentation supplied by the user. No new illustration, generative-image treatment, recoloring, or replacement of text within a source diagram was used. Supporting storyline labels are HTML alongside the images, separate from the original diagrams.

The supplied PDF is not added to the repository. Extraction coordinates, embedded-image xrefs, output dimensions, filename and source SHA-256 are recorded in sap-pdf-image-sources.json. Native embedded images retain their original alpha masks. Vector regions are rendered at 2.5 pixels per PDF point to preserve small labels. For page 39, the lower diagram strip and the central upper Joule graphic are clipped separately and kept in their original relative positions, excluding neighboring prose and an unrelated callout; the source artwork and its labels are unchanged.

| HTML slide | PDF file page | Original visual | Extraction |
| --- | --- | --- | --- |
| 03 | 19 (printed slide 24) | Joule Studio architecture, agent context, Business Data Cloud and Knowledge Graph | Diagram region rendered from PDF vectors |
| 06 | 15 | A2A Protocol, Agent Gateway and agent interoperability | Diagram region rendered from PDF vectors |
| 07 | 7 | Apps / Data / AI continuous improvement loop | Diagram region rendered from PDF vectors |
| 14 | 39 (printed slide 47) | Joule and the connected Joule Work experience | Diagram region rendered from source PDF |
| 15 | 40 (printed slide 48) | Business AI Platform: Build / Contextualize & Reason / Govern | Original embedded image xref 3163 |
| 23 | 5 (printed slide 6) | Autonomous Enterprise domains on the Business AI Platform | Original embedded image xref 208 |

The six business messages and slide order remain unchanged. The Apps / Data / AI picture is described accurately as a context feedback loop; the six execution stages remain separate HTML labels. The Joule Work picture is an experience illustration, with the four human responsibility levels expressed separately in HTML. The Business AI Platform picture retains its original Build / Contextualize & Reason / Govern labels; Build / Run / Observe is the accompanying lifecycle explanation.

Source markings: PDF file page 19 is marked CONFIDENTIAL – SAP and Customers; page 5 is marked INTERNAL – SAP and Partners Only. These source markings are retained in the HTML source credits. Other selected pages show no classification mark in their page text. No independent external verification of publication or licensing is asserted. The user explicitly approved pushing the replacement to public GitHub main after being informed that the PDF contains INTERNAL / CONFIDENTIAL markings.

SAP graphics remain attributed to the supplied SAP presentation. Existing shared CSS, unrelated slides, slides.js and presentation-preview.html are unchanged.
