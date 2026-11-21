import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/react-and-frontend/t07-017.json';
const snapshotPath = 'curriculum/source-snapshots/css-layout-mdn-2026-11-16.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
const byName = new Map(snapshot.records.map(record => [record.name, record]));
const cssSnapshotUrl = 'https://www.w3.org/TR/css-2026/';
const mdnIndexUrl = 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties';
const w3cIndexUrl = 'https://www.w3.org/Style/CSS/all-properties.en.html';
const sources = [cssSnapshotUrl, mdnIndexUrl, w3cIndexUrl,
  'https://drafts.csswg.org/css-flexbox-2/',
  'https://drafts.csswg.org/css-overflow-4/',
  'https://drafts.csswg.org/css-overflow-5/',
  'https://drafts.csswg.org/css-scroll-snap-2/',
  'https://drafts.csswg.org/css-display-4/',
  'https://drafts.csswg.org/css-anchor-position-1/'];

manifest.sourceSnapshot = {
  authority: 'W3C CSS Snapshot 2026, W3C CSS property index, MDN property summaries and status captured for this lesson set, and the cited current CSS Working Group drafts for emerging layout features',
  edition: 'MDN data commit 1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27; property descriptions captured 2026-11-16; CSS Snapshot 2026 and cited current drafts checked 2026-11-16',
  checkedAt: '2026-11-16',
  urls: [...new Set([...manifest.sourceSnapshot.urls, ...sources, ...snapshot.records.map(record => record.canonicalUrl)])],
};
manifest.comparisonSources = [...new Set([...(manifest.comparisonSources ?? []), ...sources])];
manifest.versionNotes = [{
  edition: 'CSS modular specifications; CSS Snapshot 2026',
  items: [
    'CSS 1 and CSS 2 were defined as large specifications; CSS beyond Level 2 is developed in independently evolving modules. There is no single monolithic CSS 3 or CSS 2026 release. The CSS Snapshot 2026 is a Group Note profiling specification maturity, not a browser-support table.',
    'Major layout evolution came through separate modules: Flexbox and Grid added distinct one- and two-dimensional layout models; logical properties generalized physical sides for writing modes; container queries enabled component-local adaptation; and anchor positioning and scroll markers extend positioned and scroll interfaces in modules whose maturity and support must be checked individually.',
    'This inventory is a frozen set of 189 names from the supplied MDN data snapshot. The 2026-11-16 MDN summaries/support labels are captured locally so lessons remain usable offline; an individual browser compatibility table can change after capture.',
  ],
  sourceUrls: sources,
}];

const context = {
  'css-display': {
    mental: 'Display establishes the outer participation of a box and the inner formatting context for its children. It is the switchboard that determines whether children use flow, flex, grid, table, or another model; it is not just a visibility toggle.',
    comparison: '`display` creates the formatting model; `visibility` affects painting while generally retaining layout space; `order` changes flex/grid layout order but normally leaves DOM source order untouched. `reading-flow` and `reading-order` are evolving tools for aligning sequential navigation with a rendered layout; they do not excuse an incoherent source order.',
    example: 'Use semantic source order for a card list, then choose grid for two-dimensional placement. Avoid reordering a meaningful process visually unless the sequential reading and focus order stay understandable.',
    code: '.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: 1rem; }',
    mistakes: ['Assuming `display: none` is equivalent to `visibility: hidden`; the former removes the box from layout and rendering.', 'Using `order` to disguise incorrect DOM order.', 'Assuming `visibility: hidden` removes allocated space.', 'Using emerging reading-flow features without checking keyboard and assistive-technology behavior.'],
  },
  'css-box-alignment': {
    mental: 'Box Alignment defines alignment subjects, alignment containers, axes, distribution, and overflow behavior across flex, grid, and some block/multicol contexts. The same keyword can have context-specific effects because the available axis and free space differ.',
    comparison: '`align-*` usually addresses the cross/block axis appropriate to the formatting context; `justify-*` addresses the main/inline axis. `*-items` sets defaults for children, `*-self` overrides one item, and `*-content` distributes tracks or lines when extra space exists. `place-*` combines the corresponding alignment longhands; `gap` sets gutters rather than alignment.',
    example: 'Center a grid’s items within their cells with `place-items: center`; to distribute the grid tracks in a larger container, consider `place-content` instead. Verify whether tracks or items are the alignment subject.',
    code: '.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }',
    mistakes: ['Treating `align-content` and `align-items` as synonyms.', 'Expecting content-distribution properties to create free space.', 'Forgetting auto margins can consume free space before alignment.', 'Using physical alignment assumptions in vertical writing modes.'],
  },
  'css-flexible-box-layout': {
    mental: 'Flexbox lays out items along a main axis, forms lines when wrapping is enabled, and distributes positive or negative free space through flex base sizes, grow/shrink factors, and constraints. It is best for a one-dimensional relationship; wrapped lines do not share track sizing as a grid does.',
    comparison: '`flex-basis` supplies the starting main size before free-space distribution; `flex-grow` and `flex-shrink` distribute positive and negative free space; `flex` combines all three. `flex-direction` chooses the main axis and its direction, while `flex-wrap` controls line formation and, in newer draft syntax, balancing. `flex-flow` combines direction and wrapping.',
    example: 'For a row of cards that may wrap, set a basis that describes a useful minimum and allow items to shrink only where content can do so. Add `min-inline-size: 0` to a flex item only when its automatic minimum is the specific source of overflow.',
    code: '.row { display: flex; flex-flow: row wrap; gap: 1rem; }\n.row > * { flex: 1 1 16rem; min-inline-size: 0; }',
    mistakes: ['Assuming `flex: 1` means exactly equal final width in every circumstance; min-size constraints, gaps, and content matter.', 'Assuming a flex item always shrinks below its min-content size.', 'Using flexbox for a two-dimensional shared-track layout.', 'Treating `flex-line-count` or `wrap balance` as a broadly supported baseline; the feature is experimental and only applies to balanced wrapping.'],
  },
  'css-grid-layout': {
    mental: 'Grid defines rows and columns as tracks, places items on grid lines or areas, and sizes tracks from fixed, intrinsic, flexible, and min/max constraints. Explicit tracks are authored; implicit tracks are created when placement exceeds that definition.',
    comparison: '`grid-template-*` defines explicit tracks and named areas; `grid-auto-*` controls implicit tracks and auto-placement; `grid-row`/`grid-column` place items by line; `grid-area` combines row/column line placement or a named area; `grid` is a resetting shorthand. Flexbox distributes along one axis, while grid coordinates both axes.',
    example: 'Use `minmax(0, 1fr)` when a track should share remaining space but must be allowed to shrink below its min-content contribution. Use `minmax(min(100%, 18rem), 1fr)` to avoid a fixed minimum wider than a narrow container.',
    code: '.layout { display: grid; grid-template-columns: minmax(0, 2fr) minmax(16rem, 1fr); gap: 1.5rem; }\n@media (max-width: 48rem) { .layout { grid-template-columns: 1fr; } }',
    mistakes: ['Assuming `1fr` alone always shrinks below intrinsic minimums.', 'Confusing explicit and implicit tracks.', 'Creating visual reading order that conflicts with source order.', 'Using auto-placement where a stable, intentional placement is required.'],
  },
  'css-positioned-layout': {
    mental: 'Positioning changes how a box participates in normal flow or establishes an inset reference. The containing block, inset properties, writing mode, and stacking context determine where it appears; `float` and `clear` are older flow-wrapping tools, not modern general layout systems.',
    comparison: '`relative` remains in flow and offsets its painted box; `absolute` is out of flow and uses a containing block; `fixed` is generally viewport-fixed but can be affected by ancestor containing-block creation; `sticky` participates in flow and sticks within a scrollport after a threshold. `inset` and logical inset shorthands set edge offsets. `z-index` orders positioned/flex/grid items within stacking-context rules.',
    example: 'Use a positioned wrapper as the deliberate containing block for a badge; keep the badge decorative and verify it does not cover text or focus outlines at zoom.',
    code: '.card { position: relative; }\n.card__badge { position: absolute; inset-block-start: .5rem; inset-inline-end: .5rem; }',
    mistakes: ['Assuming a large `z-index` escapes an ancestor stacking context.', 'Forgetting absolute positioning removes the box from normal flow.', 'Assuming fixed always means the visual viewport regardless of transforms/containment.', 'Using float for page-level columns rather than its text-wrapping purpose.'],
  },
  'css-overflow': {
    mental: 'Overflow compares a box’s content with its scrollport or clip edge. Values determine whether excess content is visible, clipped, or scrollable; scroll containers then participate in wheel/touch navigation, scroll snapping, scrollbar allocation, and scroll chaining.',
    comparison: '`overflow: hidden` clips and creates a scroll container that can still be scrolled programmatically; `clip` clips without creating a scroll container. `overflow-x/y` use physical axes, while block/inline longhands follow writing mode. `line-clamp` limits visible lines; the prefixed legacy recipe has special dependencies. Scroll marker properties create navigation affordances and are still limited/draft features.',
    example: 'For a decorative horizontal carousel, provide a keyboard-accessible alternative navigation method and visible focus. Use `overflow: auto` so content remains reachable when it does not fit; avoid clipping essential content.',
    code: '.carousel { overflow-x: auto; overflow-y: hidden; scroll-snap-type: inline mandatory; }\n.carousel > * { scroll-snap-align: start; }',
    mistakes: ['Assuming `overflow: hidden` and `overflow: clip` behave identically for programmatic scrolling and formatting contexts.', 'Clipping focus rings or content without an alternate way to reach it.', 'Treating scroll markers as stable, universally supported UI.', 'Assuming line clamping preserves all hidden text in every assistive-technology experience.'],
  },
  'css-scroll-snap': {
    mental: 'Scroll Snap defines preferred resting positions for a scroll container and its children. The browser retains control of scrolling physics and may account for gestures, focus, programmatic movement, and other priorities; snap is not a script-driven frame-by-frame animation.',
    comparison: '`scroll-snap-type` establishes the container axis and strictness; `scroll-snap-align` marks a child’s snap area alignment; `scroll-padding` adjusts the snapport, often for fixed headers; `scroll-margin` expands a child’s snap area. Physical and logical longhands address different axes.',
    example: 'For a horizontal card rail, make each card a start snap target, add scroll padding for an overlaying toolbar, and keep free scrolling possible. Do not force mandatory snapping if it prevents users from reaching content at unusual zoom or viewport sizes.',
    code: '.rail { overflow-x: auto; scroll-snap-type: x proximity; scroll-padding-inline: 1rem; }\n.rail > * { scroll-snap-align: start; scroll-margin-inline: .25rem; }',
    mistakes: ['Expecting `scroll-snap-type` to define exact animation duration or physical momentum.', 'Using `mandatory` where tall content can trap the reader between snap points.', 'Confusing the container’s snapport adjustment with the target’s snap area.', 'Treating `scroll-initial-target` as stable; it is a Scroll Snap Level 2 draft.'],
  },
  'css-multi-column-layout': {
    mental: 'Multi-column layout fragments continuous block content into newspaper-like columns. The browser balances or fills columns according to available height and fragmentation constraints; it is not a grid of independent semantic columns.',
    comparison: '`columns` combines count and width hints; `column-count` requests a count, while `column-width` guides desired width. `column-rule` is a shorthand for the visual divider. `column-span: all` lets a child span the columns and can split a multicol fragmentainer sequence.',
    example: 'Use multicol for flowing prose or reference lists, not for a collection that must remain row-aligned. Test keyboard reading and print fragmentation as column order can differ from common web navigation expectations.',
    code: '.glossary { columns: 18rem 3; column-gap: 2rem; column-rule: 1px solid #bbb; }',
    mistakes: ['Expecting independent row alignment like grid.', 'Fixing both count and width without considering the container size.', 'Assuming `column-span: all` is supported identically in all engines.', 'Using multicol for source-order-sensitive navigation without testing.'],
  },
  'css-fragmentation': {
    mental: 'Fragmentation breaks one flow across pages, columns, or regions. Break preferences are constraints considered by a fragmentation algorithm; “avoid” values can be overridden when honoring all constraints is impossible.',
    comparison: '`break-before`, `break-after`, and `break-inside` express break opportunities and avoidance around boxes; `orphans` and `widows` request minimum line counts on adjacent fragments. `box-decoration-break` controls whether border/padding decoration is cloned or sliced at fragment boundaries.',
    example: 'For printable sections, request that a short heading stay with following content using a break-avoid rule, but ensure long sections can still break to prevent blank pages.',
    code: '@media print { h2 { break-after: avoid-page; } .keep-together { break-inside: avoid-page; } }',
    mistakes: ['Treating break-avoid as an absolute guarantee.', 'Confusing page, column, and region fragmentation contexts.', 'Using a keep-together rule on content taller than a page.', 'Assuming decoration is always repeated on every fragment.'],
  },
  'css-table': {
    mental: 'Table layout uses rows, columns, cells, and column sizing constraints rather than ordinary block flow. The table formatting algorithm can coordinate column widths across rows, while border model and caption placement affect geometry and painting.',
    comparison: '`table-layout: fixed` bases horizontal column sizing on table width and early row/caption inputs rather than all cell content; `auto` considers content contributions. `border-collapse` chooses shared versus separated borders; `border-spacing` matters only in separated mode. `empty-cells` and `caption-side` affect presentation, not whether semantic table markup is appropriate.',
    example: 'Use a real table for data with row/column relationships and headers. Select fixed layout when a known table width and predictable columns matter, then handle long cell content explicitly.',
    code: 'table { table-layout: fixed; width: 100%; border-collapse: collapse; }\nth, td { overflow-wrap: anywhere; border: 1px solid #888; }',
    mistakes: ['Using a table solely for page layout.', 'Expecting border-spacing to affect collapsed borders.', 'Setting fixed layout without a table width that permits its algorithm.', 'Omitting captions and header associations for data tables.'],
  },
  'css-containment': {
    mental: 'Containment lets authors declare that selected layout, style, paint, or size effects are isolated from surroundings, enabling optimizations and changing formatting behavior. The promise is semantic: declaring containment that the component does not satisfy can produce clipped content or incorrect sizing.',
    comparison: '`contain` selects containment dimensions; `content-visibility` can skip rendering work for offscreen content while preserving a skippable subtree. `contain-intrinsic-size` (outside this manifest) supplies a placeholder size when contents are skipped; do not assume containment automatically determines a useful intrinsic size.',
    example: 'Apply `content-visibility: auto` only to independent long-page sections after checking focus navigation, find-in-page, and layout shifts. Use an estimated intrinsic size when needed and test the rendered transition into view.',
    code: '.article-section { content-visibility: auto; contain-intrinsic-size: auto 30rem; }',
    mistakes: ['Adding `contain: size` without supplying a meaningful size model.', 'Assuming paint containment is harmless when shadows or popovers must escape.', 'Using rendering skipping on tiny content where complexity exceeds benefit.', 'Claiming guaranteed speedups instead of measuring.'],
  },
  'css-conditional-rules': {
    mental: 'Container properties name an eligible ancestor and determine which aspects descendants may query. A query container establishes a relationship between component layout and its own available size or state, reducing dependence on global viewport breakpoints.',
    comparison: '`container-name` labels a query container; `container-type` establishes the containment/query capability; `container` is a shorthand that sets both. Size containment has consequences for intrinsic sizing, so the chosen type matters. Query rules themselves are at-rules and outside this property-only group.',
    example: 'Make a card respond to the inline size of its host, not the viewport. Ensure a query container exists above the component and that the chosen containment does not collapse its intrinsic size.',
    code: '.card-host { container: card / inline-size; }\n@container card (inline-size > 32rem) { .card { display: grid; grid-template-columns: 10rem 1fr; } }',
    mistakes: ['Expecting a container query to match when no eligible ancestor exists.', 'Confusing viewport media queries with element-relative container queries.', 'Applying size containment without accounting for intrinsic sizing.', 'Assuming a container can query its own size in its own descendants’ style.'],
  },
  'css-overscroll-behavior': {
    mental: 'Overscroll behavior controls what happens at a scroll container’s boundary when the user continues a gesture. It can prevent scroll chaining or the browser’s boundary affordance on a selected axis without replacing ordinary overflow or scrollability.',
    comparison: 'The shorthand sets both axes; x/y are physical axes, block/inline follow writing mode. `contain` prevents chaining beyond the element and may suppress boundary affordances; `none` additionally suppresses overscroll affordances where applicable; `auto` leaves browser behavior intact.',
    example: 'A modal’s inner scroller may use `overscroll-behavior: contain` to keep a scroll gesture from moving the page behind it, while retaining access to every item inside the modal.',
    code: '.dialog__body { overflow: auto; overscroll-behavior: contain; }',
    mistakes: ['Using overscroll control without making the inner region actually scrollable.', 'Disabling expected platform boundary feedback without usability consideration.', 'Forgetting horizontal and vertical axes can need different behavior.', 'Treating it as a substitute for focus management or modal semantics.'],
  },
  'css-scrollbars-styling': {
    mental: 'Scrollbar styling changes the scrollbar’s color and approximate thickness while the browser and platform retain control of much of its appearance. Scrollbars remain user-navigation affordances and can be overlaid or reserved depending on platform settings.',
    comparison: '`scrollbar-color` selects thumb and track colors; `scrollbar-width` offers standardized sizing keywords rather than arbitrary dimensions. Older pseudo-element styling mechanisms are outside this inventory and have different engine-specific behavior.',
    example: 'Use a contrasting thumb and track and avoid `thin` if it makes pointer targeting difficult. Preserve keyboard and touch scrolling and test high-contrast/forced-color environments.',
    code: '.results { scrollbar-color: #536dfe #e8eaf6; scrollbar-width: auto; }',
    mistakes: ['Assuming custom scrollbar colors render identically on every OS.', 'Removing scrollbar visibility cues or reducing target size without a reason.', 'Relying on color alone to indicate scroll position.', 'Expecting these standardized properties to style every platform scrollbar detail.'],
  },
  'css-writing-modes': {
    mental: 'Writing mode determines the direction and orientation of inline and block flow. Direction sets inline base direction for text, while text orientation and combination affect glyph presentation; bidi controls interact with the Unicode Bidirectional Algorithm and should be used sparingly.',
    comparison: '`writing-mode` establishes block-flow orientation; `direction` sets inline base direction; `text-orientation` handles glyph orientation in vertical text; `text-combine-upright` combines short runs upright in vertical layout; `unicode-bidi` controls embedding/isolation behavior. Logical properties resolve against these axes.',
    example: 'Test a localized component with `writing-mode: vertical-rl` and RTL text to reveal assumptions in physical margins, alignment, and icon orientation.',
    code: '.vertical-label { writing-mode: vertical-rl; text-orientation: mixed; }',
    mistakes: ['Using `direction` as a replacement for correct language and Unicode text.', 'Setting `unicode-bidi` without understanding embedding/isolation effects.', 'Assuming vertical text is simply horizontal text rotated.', 'Mapping logical properties to physical edges without checking writing mode.'],
  },
  'css-logical-properties-and-values': {
    mental: 'Logical properties describe start/end and inline/block dimensions in the element’s writing mode. Their physical mapping changes for RTL and vertical writing; this makes one rule adapt across scripts instead of encoding left/right assumptions.',
    comparison: '`inline-size`/`block-size` map to width/height according to writing mode; inline start/end correspond roughly to text progression, while block start/end describe block progression. Logical border, margin, and padding properties mirror physical longhands and shorthands. When both logical and physical declarations set the same underlying side, cascade order and mapping determine the winner.',
    example: 'Use `margin-inline: auto` for centering along the inline axis and `padding-block` for block-axis breathing room; test horizontal LTR, horizontal RTL, and vertical writing modes.',
    code: '.panel { inline-size: min(100%, 52rem); margin-inline: auto; padding-block: 1.5rem; padding-inline: 1rem; }',
    mistakes: ['Assuming inline always means horizontal or block always means vertical.', 'Mixing a physical property and its logical counterpart without understanding the cascade mapping.', 'Using `start`/`end` as synonyms for left/right.', 'Overlooking corner naming: block/inline start and end combine into logical corners.'],
  },
  'css-scroll-anchoring': {
    mental: 'Scroll anchoring attempts to keep the user’s apparent reading position stable when content above the viewport changes size. Authors may opt out in a subtree when the browser’s selected anchor causes a harmful jump, but should first fix avoidable layout shifts.',
    comparison: '`overflow-anchor: none` opts an element out of anchor selection; `auto` leaves normal anchoring behavior available. It does not reserve image dimensions, prevent every shift, or control scroll snapping.',
    example: 'Reserve image and ad space to prevent layout shift. Only if a specific virtualized region produces a demonstrated bad anchor adjustment should you narrowly opt it out.',
    code: '.unstable-virtualized-region { overflow-anchor: none; }',
    mistakes: ['Disabling anchoring globally to conceal missing size reservations.', 'Assuming the browser will select a particular descendant as the anchor.', 'Confusing scroll anchoring with scroll snapping or smooth scrolling.', 'Ignoring browser-specific support and interactions.'],
  },
  'css-viewport': {
    mental: 'The viewport property here is `zoom`, which changes the zoom factor of an element and its descendants. It is distinct from browser page zoom and from `transform: scale()`, and its layout effects and support need careful testing.',
    comparison: '`zoom` participates in layout sizing behavior; `transform: scale()` visually scales a rendered box without reflowing neighboring layout. Browser page zoom is a user-agent control. Use responsive CSS and user zoom support rather than substituting element zoom for accessible text resizing.',
    example: 'For responsive enlargement, change fluid constraints or component layout instead of shrinking surrounding layout with a transform. Test at browser zoom and text resizing levels.',
    code: '.diagram { max-inline-size: 100%; block-size: auto; }',
    mistakes: ['Confusing CSS `zoom` with browser zoom.', 'Using transforms to defeat required reflow at high zoom.', 'Assuming `zoom` and transform have identical coordinate and layout effects.', 'Changing page-scale behavior in a way that prevents user control.'],
  },
  'experimental-css-positioned-layout': {
    mental: '`overlay` concerns whether an element that is already in the top layer is rendered there during a discrete transition. It does not promote an arbitrary element into the top layer; dialog/popover APIs perform that state change.',
    comparison: 'Top-layer membership is established by platform behavior such as showing a modal dialog or popover. The `overlay` property can be included in a transition with `transition-behavior: allow-discrete` so the top-layer removal can be delayed until the transition finishes.',
    example: 'Treat this as progressive enhancement for a dialog close transition; ensure the dialog closes and content remains available when the property is unsupported.',
    code: 'dialog { transition: opacity 160ms, overlay 160ms allow-discrete; }',
    mistakes: ['Assuming `overlay` itself puts an element in the top layer.', 'Forgetting `allow-discrete` for discrete transitions.', 'Treating limited-support transition behavior as universal.', 'Making dismissal depend on the animation completing.'],
  },
  'experimental-css-anchor-positioning': {
    mental: 'Anchor positioning relates an out-of-flow positioned box to a named anchor box, allowing popovers and tooltips to follow their trigger without script measuring coordinates. Fallback options handle available space, but the anchor relationship, containing block, and scope must be correct.',
    comparison: '`anchor-name` exports names; `position-anchor` selects a default anchor; `anchor-scope` limits name visibility; `position-area` places a box in a logical tile around the anchor; `position-try-fallbacks` and `position-try-order` handle alternative placement; `position-try` combines the latter; `position-visibility` provides anchor/overflow conditions. Anchor functions also exist but are outside this manifest.',
    example: 'Position a non-modal tooltip relative to its button, provide flip fallback styles for viewport edges, and keep dismissal, focus, and accessible description behavior in HTML/ARIA.',
    code: '.trigger { anchor-name: --trigger; }\n.tip { position: fixed; position-anchor: --trigger; position-area: block-end; position-try-fallbacks: flip-block; }',
    mistakes: ['Assuming an anchor name is globally visible across every scope.', 'Forgetting anchor positioning applies to positioned boxes and is not a replacement for interaction semantics.', 'Hard-coding viewport coordinates instead of considering writing mode and fallback.', 'Assuming every target browser supports the full feature set identically.'],
  },
  'experimental-css-overflow': {
    mental: '`max-lines` is a CSS Overflow Level 4 draft longhand involved in line clamping and fragmentation. It is not a broadly supported standalone substitute for established clamping patterns.',
    comparison: 'The draft defines `max-lines` as a clamp point for line-clamp containers or a forced region break under fragmentation; the `line-clamp` shorthand combines line count and ellipsis behavior. Current support for the draft longhand is distinct from legacy `-webkit-line-clamp` compatibility.',
    example: 'For production truncation, use an approach supported by target browsers and provide access to the full text; consider expansion controls when truncation hides important content.',
    code: '.excerpt { line-clamp: 3; overflow: hidden; }',
    mistakes: ['Assuming the draft longhand is implemented because a related shorthand has legacy behavior.', 'Treating visual ellipsis as deletion of the hidden content or a complete accessibility pattern.', 'Using a line limit that hides required information without a way to reveal it.'],
  },
  'experimental-css-scroll-snap': {
    mental: '`scroll-initial-target` is proposed for selecting where a scroll container initially lands. It belongs to CSS Scroll Snap Level 2, an Editor’s Draft; it supplements, rather than replaces, user-controlled scrolling and established snap behavior.',
    comparison: 'The draft keyword `nearest` marks an element as a potential initial target for its nearest scroll container. It is separate from `scroll-snap-align`, which defines preferred resting alignment during snapping, and from fragment navigation or script-driven scrolling.',
    example: 'For stable behavior, use meaningful document order and fragment links; only layer this draft property behind feature detection when its exact behavior is needed.',
    mistakes: ['Claiming the initial target property is broadly interoperable.', 'Confusing initial position selection with snap alignment on later scrolls.', 'Overriding user scroll state after the user has begun interacting.'],
  },
};

const titleCorrections = {
  'experimental-css-anchor-positioning': 'CSS Anchor Positioning properties',
};
for (const group of manifest.inventory) if (titleCorrections[group.id]) group.title = titleCorrections[group.id];

const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').trim();
function row(name) {
  const record = byName.get(name);
  if (!record) throw new Error(`Missing snapshot record for ${name}`);
  let description = record.description;
  if (name === '-webkit-line-clamp') description += ' Legacy behavior requires the WebKit box/orientation combination and overflow clipping; prefer line-clamp when its support is sufficient.';
  if (name === 'max-lines') description += ' This is an evolving Overflow Level 4 draft longhand; do not infer broad browser support from the related legacy clamp behavior.';
  if (name === 'scroll-axis-lock') description += ' It is a proposal, not a replacement for touch-action or overscroll-behavior.';
  const status = record.supportLabel
    ? ` **MDN support snapshot:** ${record.supportLabel}${record.experimental ? '; MDN marks it experimental' : ''}.`
    : ' **MDN support snapshot:** no Baseline label captured; check the linked compatibility table.';
  return `| \`${esc(name)}\` | ${esc(description)} ${esc(status)} [MDN/spec](${record.canonicalUrl}) |`;
}

const baseTitle = manifest.title;
const overview = `# ${baseTitle} — Big-picture orientation and mental model

# Problem and purpose

CSS layout turns a document’s boxes into a readable arrangement that adapts to available space, content, language, input method, and user settings. A layout is not a pile of coordinates: it is a set of formatting rules that respond to intrinsic content and constraints.

# Plain-language mental model

Imagine arranging bookshelves. Normal flow places boxes in a predictable sequence; flexbox arranges a row or column and shares space; grid creates row-and-column tracks; positioned layout anchors selected boxes to a containing block; overflow determines what happens when content does not fit. Responsive CSS changes constraints when the viewport or a component’s own container changes. The browser repeatedly computes these relationships as content and available space change.

CSS has independently evolving modules, not one monolithic annual release. This set uses the CSS Snapshot 2026 for the specification landscape, a local capture of the supplied 189-name inventory, and dated MDN descriptions/support labels. A Baseline label is not a promise for every browser or embedded webview; a W3C draft is not evidence of interoperable implementation. [W3C CSS Snapshot 2026](${cssSnapshotUrl})

# How the parts fit together

1. The browser creates boxes from document elements and their computed \`display\` values.
2. A formatting context places boxes: flow, flex, grid, table, or another model.
3. Intrinsic sizes and constraints negotiate dimensions; min/max sizes and available space can change an apparently simple fraction or percentage.
4. Alignment distributes items, tracks, or free space on axes defined by layout and writing mode.
5. Positioning, stacking, clipping, and scrolling determine overlap and reachability.
6. Viewport and container conditions adapt the design while preserving content order and accessibility.

# Concept map

| Need | Primary model | Key question |
| --- | --- | --- |
| Sequential document content | Normal flow | Does content wrap, expand, and reflow naturally? |
| A one-dimensional control or item row | Flexbox | Which axis is primary, and how is free space shared? |
| Two-dimensional shared rows and columns | Grid | Which tracks are explicit, and how should intrinsic content size them? |
| Content that exceeds a box | Overflow and scrolling | Is it clipped, reachable, or a scroll container? |
| A local overlay or sticky item | Positioned layout | What is its containing block and scrollport? |
| Responsive component behavior | Container queries and fluid constraints | Does it respond to its own available inline size? |
| Internationalized layout | Writing modes and logical properties | Are dimensions expressed in inline/block axes? |

# End-to-end walkthrough

For a product page, keep semantic content in source order. Use grid for the overall content/sidebar relationship and a container query to collapse the sidebar when the component narrows. Within a row of actions, flexbox handles alignment and gaps. A badge can be positioned within a card’s containing block. A horizontal media rail can remain scrollable with snap points, but its content must still be reachable by keyboard and touch. At each step inspect intrinsic minimums, zoom, RTL/vertical writing modes, focus order, and narrow containers.

# When to use it and tradeoffs

Use normal flow for prose; flexbox when one axis is primary; grid when both axes and shared tracks matter; positioning for overlays and defined offsets; multicol for flowing text fragments. Prefer fluid constraints and container-aware rules over device-specific coordinate assumptions. More capable layouts bring sizing and source-order edge cases; test real content rather than only empty boxes.

# What later lessons cover

The concepts lesson builds the box, sizing, alignment, positioning, scrolling, and responsive mental model before the reference list. The 22 reference lessons explain every exact property in the manifest and mark experimental names. Practice and interview lessons ask you to diagnose layouts rather than memorize isolated declarations.

# Sources

- [W3C CSS Snapshot 2026](${cssSnapshotUrl})
- [MDN CSS property reference](${mdnIndexUrl})
- [W3C CSS property index](${w3cIndexUrl})
`;

const concepts = `# ${baseTitle} — Core concepts and how they fit together

# Learning objectives

Explain how CSS creates layout boxes, select flow/flex/grid/positioned models, reason about intrinsic sizing and free space, distinguish alignment subjects, predict overflow and scroll behavior, use logical axes and responsive constraints, and identify draft versus supported features.

# Prerequisites

Know HTML document structure, selectors and declarations, the cascade, the box model, common length units, and browser DevTools. The following sequence introduces the layout-specific model before listing individual property definitions.

# Core concepts

## The box tree and formatting contexts

CSS operates on generated boxes, not simply one rectangle per DOM element. Some elements generate no principal box; inline content participates in line layout; anonymous boxes may be created to repair formatting structures. \`display\` establishes outer participation (such as block or inline) and an inner formatting context (such as flow, flex, grid, or table). A formatting context supplies rules for children and their interaction with surrounding content.

## Normal flow and intrinsic sizing

Normal flow is the default. Block-level boxes generally stack in the block direction; inline content forms line boxes. Intrinsic sizes arise from content: min-content is a limiting small contribution, max-content is an unwrapped contribution, and fit-content algorithms balance available space against those limits. These intrinsic contributions explain why a nominal \`1fr\`, flex item, or percentage can refuse to shrink as expected. Use a zero minimum only when overflow and text wrapping are intentionally handled.

## Flexbox: one primary axis

A flex container chooses a main axis and cross axis. Items have a flex base size, then positive free space may be distributed according to grow factors and negative free space according to shrink factors weighted by base sizes. Min/max constraints can freeze items, causing another distribution pass. Wrapping creates separate lines; each line resolves its own flexible sizes. Alignment then positions items/lines in available space. Flexbox is convenient for a toolbar or card row; it does not create shared column tracks between separate lines.

## Grid: two axes and track sizing

Grid lays out items against row and column tracks. Explicit tracks are defined by templates; auto-placement can create implicit tracks. Track sizing accounts for fixed/intrinsic limits, flexible fractions, spanning items, and available space. A fractional track requests a share of leftover space, but intrinsic minimums can keep it from shrinking. \`minmax(0, 1fr)\` changes that minimum constraint; it should be paired with an intentional overflow/wrapping policy.

## Alignment subjects and axes

Alignment is not one generic “center” operation. The subject may be an individual item, a group of items, a track, or content distributed through a container. Main/cross, inline/block, and physical x/y axes depend on the formatting context and writing mode. Shorthands reduce repetition but preserve their own grammar and reset semantics. Gaps create gutters; they do not distribute leftover space.

## Positioning and stacking

Relative positioning offsets a box while retaining its normal-flow allocation. Absolute positioning removes it from flow and resolves insets against a containing block. Fixed and sticky positioning each have special containing-block/scrollport rules. Stacking contexts create local ordering scopes, so an arbitrarily large \`z-index\` cannot escape an ancestor’s context. Float remains useful for text wrapping, while clear affects that wrapping flow. Top-layer UI is a separate browser-managed mechanism; the \`overlay\` property concerns discrete transitions of existing top-layer elements, not promotion into that layer.

## Overflow, scrollports, and snap

Overflow controls clipping and whether a box becomes a scroll container. Hidden overflow can still be scrolled programmatically; clip does not create a scroll container. Scroll padding adjusts the snapport; scroll margin expands a target’s snap area. Snap points are preferences enforced by the user agent, not fixed animation physics. Draft scroll markers can create navigation patterns but have accessibility roles and focus interactions that require deliberate design and compatibility checks.

## Responsive and internationalized layout

Media conditions answer questions about the environment; container conditions answer questions about a named ancestor. Fluid sizes, min/max constraints, and intrinsic sizing can reduce breakpoint dependence. Logical properties map inline and block axes to the writing mode; the mapping changes for RTL and vertical text. A component should be tested with translated content, zoom, long words, and varied font metrics.

## Containment and rendering work

Containment constrains how descendant layout/paint affects outside boxes. \`content-visibility: auto\` can allow the browser to skip rendering work for offscreen subtrees, but placeholder size, focus navigation, and find-in-page behavior must be considered. It is not an unconditional speed switch: measure the actual page and avoid containment assumptions that contradict content.

## Specification status is not implementation status

The CSS Snapshot 2026 is a W3C Group Note that describes CSS specification maturity, not a browser-support matrix. MDN Baseline labels describe broad availability on a particular reference date; Limited availability and Experimental labels need per-browser inspection. Editor’s Draft syntax can change. The supplied capture records what was visible on 2026-11-16 and should be refreshed for future compatibility decisions. [W3C CSS Snapshot 2026](${cssSnapshotUrl})

# Mechanisms and relationships

| Mechanism | Inputs | Result | Debugging question |
| --- | --- | --- | --- |
| Formatting context | display, child roles | box placement rules | Which formatting context owns this child? |
| Intrinsic sizing | text, replaced content, min/max constraints | minimum/maximum contributions | What min-content constraint prevents shrinking? |
| Flex/grid sizing | available space, tracks, base sizes, gaps | used dimensions | Is free space positive, negative, or already consumed? |
| Alignment | subject, container, axis, free space | position/distribution | Am I aligning items, tracks, or content? |
| Positioning | containing block, inset, scrollport | offset or sticky placement | Which ancestor establishes the reference? |
| Overflow | scrollable overflow, clip edge | visible/clip/scroll | Can users reach the excess content? |
| Responsive conditions | viewport or query container | alternate declarations | Which box is being queried? |

# Worked examples

## Grid with a controlled minimum

\`\`\`css
.page { display: grid; grid-template-columns: minmax(0, 2fr) minmax(15rem, 1fr); gap: 1.5rem; }
.page__main { min-inline-size: 0; overflow-wrap: anywhere; }
@media (max-width: 48rem) { .page { grid-template-columns: 1fr; } }
\`\`\`

The flexible columns share leftover space, while a long unbreakable value can otherwise contribute a large min-content size. The main column is explicitly allowed to shrink and the text receives a break strategy. The media query responds to viewport width; a reusable embedded component might instead query a named container.

## Component-local layout

\`\`\`css
.card-list { container: cards / inline-size; }
.card { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@container cards (inline-size > 34rem) {
  .card { grid-template-columns: 10rem minmax(0, 1fr); align-items: start; }
}
\`\`\`

The host establishes an inline-size query container. Descendant cards switch arrangement based on that host’s inline size, so the component can be reused in a sidebar or main column. Check that the queried container has a real size and that the threshold works with translated text and zoom.

## Positioning inside a scroll-aware component

\`\`\`css
.card { position: relative; }
.card__badge { position: absolute; inset-block-start: .5rem; inset-inline-end: .5rem; }
.rail { display: flex; overflow-x: auto; scroll-snap-type: x proximity; }
.rail > * { flex: 0 0 min(85%, 24rem); scroll-snap-align: start; }
\`\`\`

The card establishes an intended containing block; the badge uses logical insets. The rail is scrollable and snap points are proximity preferences. Ensure the badge does not cover content and the rail remains keyboard/touch accessible.

# Misconceptions and edge cases

- A flex row and a grid are not interchangeable: flex lines size independently; grid tracks coordinate two dimensions.
- \`1fr\` is not a magic “always shrink” value; intrinsic minimums can constrain it.
- Aligning items is different from distributing tracks or lines.
- Absolute positioning removes normal-flow space; relative positioning does not.
- \`z-index\` operates within stacking contexts.
- \`overflow: hidden\` and \`overflow: clip\` do not provide identical scrolling behavior.
- Scroll snapping does not define fixed physical scrolling or animation behavior.
- Responsive layout should not depend on one device model or viewport width alone.
- Logical axes depend on writing mode and direction.
- A draft property name in an index is not a stable implementation guarantee.

# Knowledge checks with answers

1. **When is grid a stronger fit than flexbox?** When both rows and columns need coordinated tracks or two-dimensional placement.
2. **Why can a grid column overflow despite using \`1fr\`?** Its automatic minimum can reflect a large min-content contribution; use a deliberate track/item minimum and wrapping policy.
3. **What does \`position: absolute\` change?** It removes the box from normal flow and positions it relative to its containing block.
4. **What is the difference between scroll padding and scroll margin?** Padding adjusts the container snapport; margin expands a target’s snap area.
5. **What does container-type do?** It establishes a query container capability and the associated containment behavior.
6. **Does CSS Snapshot 2026 guarantee browser support?** No; it profiles specification maturity.

# Sources

- [W3C CSS Snapshot 2026](${cssSnapshotUrl})
- [MDN CSS property reference](${mdnIndexUrl})
- [W3C CSS property index](${w3cIndexUrl})
- [CSS Flexible Box Layout Level 2 draft](https://drafts.csswg.org/css-flexbox-2/)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
`;

const lessonFiles = [];
await fs.mkdir('course/lessons/t07-017', {recursive: true});
const write = async (suffix, content) => {
  const file = `course/lessons/t07-017/t07-017-${suffix}.md`;
  await fs.writeFile(file, `${content.trim()}\n`);
  lessonFiles.push(file);
};
await write('overview', overview);
await write('concepts', concepts);

for (const group of manifest.inventory) {
  const detail = context[group.id];
  if (!detail) throw new Error(`Missing authored group context for ${group.id}`);
  const records = group.items.map(name => byName.get(name));
  const experimental = records.filter(record => record.experimental).length;
  const baseline = records.filter(record => record.supportLabel.startsWith('Baseline')).length;
  const limited = records.filter(record => record.supportLabel === 'Limited availability').length;
  const rows = group.items.map(row).join('\n');
  const statusSummary = `${baseline} names have an MDN Baseline label, ${limited} have Limited availability, and ${experimental} are explicitly marked Experimental in the 2026-11-16 capture. These labels can overlap; the row for every name preserves its own status. A missing Baseline label is not proof that no browser implements it.`;
  const compare = group.items.length > 1
    ? detail.comparison
    : `This group contains only \`${group.items[0]}\`, so no within-group name comparison applies. ${detail.comparison}`;
  const mistakes = detail.mistakes.map(item => `- ${item}`).join('\n');
  const exactNames = group.items.map(name => `\`${name}\``).join(', ');
  const ref = `# ${baseTitle} — Reference: ${group.title}

# Scope and version

This lesson explains all ${group.items.length} supplied properties in **${group.title}** and no additional inventory names. MDN descriptions and support labels were captured on 2026-11-16. ${statusSummary} Support can change after this capture. The CSS Snapshot 2026 reports specification maturity rather than browser adoption. [W3C CSS Snapshot 2026](${cssSnapshotUrl})

# How this group fits the mental model

${detail.mental} The overview and concepts lessons explain the surrounding layout model; this catalog now ties every supplied name to its role. A short MDN description is not a complete grammar. Follow the linked specification/reference for exact values, applicability, inheritance, computed-value rules, and browser-specific support before using an unfamiliar value.

# Supplied names explained

| Exact supplied property | Meaning in this model |
| --- | --- |
${rows}

# Cross-item comparison

${compare}

# Examples

${detail.example}

\`\`\`css
${detail.code}
\`\`\`

The example illustrates a layout choice; adapt it to actual content and test target browsers, zoom, writing modes, keyboard use, and narrow containers.

# Common mistakes

${mistakes}
- Inferring a property’s full value grammar from its name or the brief definition alone.
- Assuming MDN support labels prove support in every browser version or embedded webview.
- Confusing the CSS Working Group draft status with a browser implementation guarantee.

# Knowledge checks with answers

1. **Which exact names are represented here?** ${exactNames}. Each has an individual definition and support link above.
2. **What should be checked beyond this concise description?** Full grammar, applicable boxes, inheritance, computed behavior, interactions, and the target browser compatibility data.
3. **What is the MDN status label’s date?** The local reference capture is dated 2026-11-16; consult current compatibility data for future production decisions.

# Sources

- [W3C CSS Snapshot 2026](${cssSnapshotUrl})
- [MDN CSS property reference](${mdnIndexUrl})
- [W3C CSS property index](${w3cIndexUrl})
- [CSS Flexible Box Layout Level 2 draft](https://drafts.csswg.org/css-flexbox-2/)
- [CSS Overflow Level 4 draft](https://drafts.csswg.org/css-overflow-4/)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
- [CSS Display Level 4 draft](https://drafts.csswg.org/css-display-4/)
- [CSS Anchor Positioning Level 1 draft](https://drafts.csswg.org/css-anchor-position-1/)
`;
  await write(`reference-${group.id}`, ref);
}

const practice = `# ${baseTitle} — Exercises and worked solutions

# Goals

Diagnose the formatting model, reason about intrinsic sizing, choose flex or grid, preserve content reachability, apply logical and responsive constraints, and separate stable properties from evolving drafts.

# Worked example

\`\`\`css
.dashboard { display: grid; grid-template-columns: minmax(0, 1fr) 18rem; gap: 1rem; }
.dashboard__main { min-inline-size: 0; overflow-wrap: anywhere; }
@media (max-width: 50rem) { .dashboard { grid-template-columns: 1fr; } }
\`\`\`

The grid coordinates two columns. The zero track minimum and item minimum allow the main column to shrink; wrapping protects against an unbroken token. The media query stacks columns at a viewport threshold. A reusable dashboard embedded in variable regions could use a named container query instead.

# Exercises

1. A grid’s main column overflows because it contains a long URL. Explain the intrinsic sizing cause and fix it without clipping the text.
2. A toolbar has one row on desktop but should wrap into readable groups on narrow screens. Choose flexbox or grid and specify the relevant sizing/alignment concerns.
3. A card badge is absolutely positioned and overlaps the title at 200% zoom. Diagnose the missing constraint and propose a more robust design.
4. A scroll rail uses mandatory snap points around tall cards. Explain how this can harm access and propose safer behavior.
5. A reusable card layout changes based on the width of its sidebar slot. Explain why a viewport media query may be the wrong condition.
6. An engineer sees a \`scroll-marker-group\` example and wants to ship it universally. Explain how to evaluate the feature and provide a fallback.
7. A translated page uses RTL and vertical writing modes, but its spacing is reversed incorrectly. Identify the class of properties to prefer.

# Progressive hints

1. Grid track and item automatic minimums can use min-content contributions.
2. Ask if one or two axes need coordinated shared tracks; wrapping and gaps consume space.
3. Absolute positioning does not reserve room for the badge.
4. Snap is a user-agent preference; a tall item may not provide reachable snap positions if overly constrained.
5. The component needs the host’s size, not necessarily the device viewport.
6. Check exact spec maturity and browser support; keep ordinary links and native scrolling.
7. Inline/block axes map through writing mode.

# Complete solutions

1. A long URL contributes a large min-content width. Use \`minmax(0, 1fr)\` for the flexible track and \`min-inline-size: 0\` plus \`overflow-wrap: anywhere\` on the relevant content box. This permits shrinkage and readable wrapping instead of hiding text.
2. Flexbox is suitable if the toolbar is a one-dimensional sequence that may wrap. Give controls an intentional basis or \`flex\` value, use a gap, and test min-content labels. If controls must align to shared rows and columns, grid may fit better.
3. Absolute positioning removes the badge from normal flow. Reserve room, put the badge in a non-overlapping grid area, or allow the card to grow at zoom. Test translated labels and focus indicators; a media query alone is not a substitute for content constraints.
4. Mandatory snapping can make intermediate content difficult to reach, especially when a card exceeds the scrollport. Use proximity or remove snapping where appropriate, ensure continuous scroll remains available, and test keyboard, touch, zoom, and tall content.
5. A viewport media query measures the viewport, not the card’s available host size. Establish a named inline-size query container and query it from descendants, while accounting for the containment behavior of the chosen container type.
6. \`scroll-marker-group\` is a CSS Overflow Level 5 draft/limited feature in this captured set. Keep native scroll and document links functional, use feature enhancement only where supported, and verify generated marker focus/roles with assistive technology in targets.
7. Prefer logical margin, padding, sizing, border, and inset properties where appropriate. Confirm each element’s writing mode; do not assume that inline means horizontal or block means vertical.

# Tests and edge cases

Test minimum and maximum content; long URLs and unbreakable identifiers; empty/late-loading content; 200% and 400% zoom; RTL and vertical writing; translated labels; keyboard focus and scroll reachability; nested scroll containers; tall snap targets; browser support fallbacks; print fragmentation; and reduced-motion preferences for any animated layout transitions. Inspect computed styles and containing blocks in DevTools.

# Reflection questions

- What formatting context owns each box?
- Which intrinsic minimum or containing block explains the observed size?
- Is alignment acting on items, tracks, lines, or distributed content?
- Can every overflowed item still be reached?
- Is the responsive condition tied to the viewport or to a named component host?
- What behavior remains when a draft property is ignored?

# Sources

- [W3C CSS Snapshot 2026](${cssSnapshotUrl})
- [MDN CSS property reference](${mdnIndexUrl})
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
- [CSS Scroll Snap Level 2 draft](https://drafts.csswg.org/css-scroll-snap-2/)
`;
await write('practice', practice);

const interview = `# ${baseTitle} — Interview questions and reasoning

# Core questions

Explain what layout model you would choose, how you would debug an overflow, and how you distinguish current browser support from specification status.

# Concise interview answers

1. **Flexbox or grid?** Flexbox when one primary axis is central; grid when two-dimensional placement/shared tracks are central. Either can size content responsively, so decide from the relationship rather than a slogan.
2. **Why does \`1fr\` overflow?** The track’s automatic minimum may reflect min-content size. Set a suitable min track sizing function and content wrapping/minimum policy.
3. **What does \`min-inline-size: 0\` do in a flex/grid item?** It permits the item to shrink below its automatic minimum along the inline axis; a wrapping or overflow strategy must then handle content.
4. **How does absolute differ from relative positioning?** Absolute removes the box from normal flow; relative offsets it while retaining its flow allocation.
5. **What is the difference between scroll padding and scroll margin?** One adjusts the container snapport; the other expands the target’s snap area.
6. **Why use container queries?** They let reusable descendants adapt to an ancestor’s size rather than assuming the viewport predicts their available space.
7. **Does CSS Snapshot 2026 establish browser support?** No. It is a W3C Group Note profiling specification maturity.

# Deep follow-up answers

Flex sizing has a base size, grow/shrink distribution, and min/max constraints; items may freeze and free space be recalculated. Grid track sizing coordinates explicit and implicit tracks and incorporates intrinsic contributions, spanning items, and flexible fractions. Alignment’s subject and axis vary by formatting context. A positioned element’s containing block is not automatically its nearest DOM parent; inspect transforms, containment, and positioned ancestors. Scroll containers, snap ports, and scroll chains interact with input and browser decisions. For each claim about support, use dated compatibility data and test the actual target browsers.

# Scenario questions

1. **A sidebar disappears at a particular viewport, but the component is also reused in a narrow panel.** Use a query container for component-local layout if the condition is the component’s own available size; retain viewport queries for environment-level changes.
2. **A popup has a large \`z-index\` but remains behind another overlay.** Inspect stacking-context ancestry and top-layer membership; a child cannot outrank an ancestor context.
3. **A horizontally scrollable carousel cannot be used by keyboard.** Preserve native scrolling, ensure scrollable content is focusable/reachable and controls have accessible labels, and provide real links/buttons rather than relying only on experimental generated markers.

# Tradeoffs and alternatives

Grid and flexbox can overlap in capability but express different constraints. Absolute overlays offer precise anchoring but do not reserve space; in-flow grid/flex areas can prevent overlap. Clipping can simplify visual boundaries but can hide content or focus. Viewport breakpoints are simple for page-wide changes; container queries better match reusable components. Draft features can reduce code but require feature support checks and a complete fallback.

# Common weak answers

- “Grid is always for two dimensions and flexbox can never wrap.”
- “\`1fr\` always shrinks.”
- “A high \`z-index\` fixes any overlap.”
- “Hidden overflow means inaccessible content is gone.”
- “A CSS draft is supported because it appears on MDN.”
- “Use a mobile breakpoint” without identifying the actual constrained box.

# Self-check rubric

Score 0–2 for each answer: correct model selection; sizing/axis reasoning; overflow reachability; clear explanation of source order and writing mode; exact distinction between spec maturity and implementation support; and a testable fallback. Strong answers identify the box/axis/containing block before proposing a declaration.

# Sources

- [W3C CSS Snapshot 2026](${cssSnapshotUrl})
- [MDN CSS property reference](${mdnIndexUrl})
- [W3C CSS property index](${w3cIndexUrl})
- [CSS Flexible Box Layout Level 2 draft](https://drafts.csswg.org/css-flexbox-2/)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
`;
await write('interview', interview);

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${lessonFiles.length} CSS layout lessons (${manifest.inventory.length} property groups, ${snapshot.propertyCount} exact inventory names).`);
