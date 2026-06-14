# HiFuture Index QA

source visual truth path: `/Users/nedved/Tool/Workspace/HiFuture/src/assets/OpenAI Playground 2026-06-14 at 04.46.11.png`

implementation screenshot path: `/Users/nedved/Tool/Workspace/HiFuture/design-qa-assets/index-1280x720.png`

viewport: 1280x720 default browser viewport, plus responsive check at 390x844.

state: top of index page, no hover state.

full-view comparison evidence: the implementation uses the supplied 3840x2160 background as the first-screen visual base, with all logo, navigation, hero headline, subcopy, story line, and business text rendered as HTML/CSS overlays.

focused region comparison evidence: checked header/spark area, hero headline area, story copy over green path, three-business text band, and mobile headline/subcopy wrap.

**Findings**

- No P0/P1/P2 issues remain for the current static index pass.

**Patches Made Since Previous QA Pass**

- Rebuilt the React index around the new 16:9 4K background image.
- Removed old portrait artboard assumptions and old SVG animation overlays from the React page.
- Moved logo/menu/contact, hero copy, story copy, and service copy into HTML/CSS layers.
- Added left-side scroll rail.
- Adjusted header top position so the contact button avoids the orange spark.
- Added a subtle readability veil under the three business blocks.
- Fixed mobile subtitle wrapping so 「で、」 does not become an orphan line.
- Shifted story copy down on taller desktop viewports so the background green path does not cross the text.

**Follow-up Polish**

- The service row can still be tuned by annotation if the client wants the three businesses to sit closer to the original V12 rhythm.
- A later pass can add scroll-triggered SVG animation after the static composition is approved.

final result: passed
