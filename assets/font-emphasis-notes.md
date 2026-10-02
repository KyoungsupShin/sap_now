# Selective font emphasis

All active HTML slides load selective-emphasis.css last. Body copy, descriptions, step labels, subtitles, numbering and table detail use weight 400. Titles, headers and component names use weight 500. Only specific conclusions, enterprise KPI names, SAP BTP column main labels, demo case names, the active agenda heading and final outcome message use weight 600.

This removes inherited bold from general b/strong markup and legacy inline slide CSS. Explicit emphasis is controlled centrally; add key-emphasis only to a genuinely important phrase. Raster illustrations retain their source typography.

Before this change, 236 of 725 captured HTML text fragments had computed font weight >=600. Current counts are measured from the final render manifest. PowerPoint exports bold only for those fragments with weight >=600.

After: 41 of 725 captured HTML text fragments have weight >=600. The foundation thumbnail is regenerated from the current .assistant-map during slide rendering, so team diagrams follow the same typography.

Slide 24 follow-up: the complete enterprise KPI message uses key-emphasis and a single plain text node, producing one fully bold native PowerPoint text box.
