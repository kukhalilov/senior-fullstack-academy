import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/react-and-frontend/t07-018.json';
const sourcePath = 'curriculum/source-snapshots/css-properties-mdn-2026-11-16.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const snapshot = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
const byName = new Map(snapshot.records.map(record => [record.name, record]));
const cssSnapshotUrl = 'https://www.w3.org/TR/css-2026/';
const mdnIndexUrl = 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties';
const w3cIndexUrl = 'https://www.w3.org/Style/CSS/all-properties.en.html';
const extraSources = [cssSnapshotUrl, mdnIndexUrl, w3cIndexUrl];
manifest.sourceSnapshot = {
  authority: 'CSS Snapshot 2026, W3C CSS property index, and MDN CSS property reference summaries captured for offline lesson generation',
  edition: `${manifest.sourceSnapshot.edition}; MDN property descriptions captured 2026-11-16; CSS Snapshot 2026 checked 2026-11-16`,
  checkedAt: '2026-11-16',
  urls: [...new Set([...manifest.sourceSnapshot.urls, ...extraSources, ...snapshot.records.map(record => record.canonicalUrl)])],
};
manifest.comparisonSources = [...new Set([...(manifest.comparisonSources ?? []), cssSnapshotUrl, mdnIndexUrl, w3cIndexUrl])];
manifest.versionNotes = [{
  edition: 'CSS Snapshot 2026 and modular CSS specifications',
  items: [
    'CSS has no single annual language version: modules progress independently. The 2026 CSS Snapshot is a W3C Group Note describing the stable specification set, not a browser-support guarantee or a monolithic CSS 2026 feature release.',
    'The 2026 snapshot supersedes the previous snapshot as the latest published stable-specification profile. Newer draft modules and properties remain separately identified by their specification status; check implementation support before using them.',
    'The property inventory includes standardized names, vendor-prefixed extensions, aliases, and experimental or draft entries from the pinned MDN data snapshot. Names in the inventory do not imply standardization, interoperability, or recommendation for production use.',
  ],
  sourceUrls: [cssSnapshotUrl, mdnIndexUrl, w3cIndexUrl],
}];

const titleCorrections = {
  'experimental-scroll-driven-animations': 'CSS Scroll-Driven Animations properties',
  'experimental-css-animations': 'CSS animation-timeline properties',
  'experimental-css-basic-user-interface': 'CSS Basic User Interface field-sizing properties',
  'experimental-mathml': 'MathML math-shift properties',
  'experimental-css-images': 'CSS image-resolution and object-view-box properties',
  'experimental-css-fonts': 'CSS font synthesis and width properties',
  'experimental-css-inline': 'CSS Inline Layout draft properties',
  'experimental-css-text-decoration': 'CSS text-decoration-skip properties',
  'experimental-css-values-and-units': 'CSS Values and Units experimental properties',
  'experimental-css-rhythmic-sizing': 'CSS rhythmic-sizing draft properties',
  'experimental-css-box-model': 'CSS Box Model margin-trim properties',
  'experimental-css-ruby': 'CSS Ruby ruby-merge properties',
  'experimental-css-speech': 'CSS Speech speak-as properties',
  'experimental-scalable-vector-graphics': 'CSS Fill and Stroke stroke-color properties',
  'experimental-css-mobile-text-size-adjustment': 'CSS text-size-adjust properties',
  'experimental-css-text': 'CSS text-spacing-trim properties',
};
for (const group of manifest.inventory) if (titleCorrections[group.id]) group.title = titleCorrections[group.id];

const context = {
  'css-custom-properties-for-cascading-variables': {
    mental: 'Custom properties participate in the cascade and inherit by default. `var()` substitutes their computed token stream into another declaration; registration with `@property` can add a syntax, inheritance behavior, an initial value, and typed interpolation.',
    comparison: 'Unregistered custom properties preserve token sequences and can be used in many property values, but invalid substitution can invalidate the consuming declaration at computed-value time. Registered custom properties are typed and may animate by computed value; their inheritance and initial-value rules depend on registration.',
    example: 'A component can inherit one theme value and use a fallback when no custom value is supplied.',
    codeExample: ':root { --brand: rebeccapurple; }\n.button { color: var(--brand, navy); }',
    mistakes: ['Assuming `var()` is textual preprocessing; substitution occurs in CSS value processing.', 'Assuming a fallback is used whenever a custom property is empty or has any unexpected token sequence.', 'Forgetting unregistered custom properties inherit and are case-sensitive.', 'Using `@property` without a valid syntax and required initial-value/inherits behavior.'],
  },
  'webkit-extensions': {
    mental: 'These are WebKit-prefixed extensions and compatibility names. Some remain implemented for web compatibility; others are legacy, unsupported, or have an unprefixed/logical replacement. They are not one coherent standardized module.',
    comparison: 'Prefer the unprefixed interoperable property or modern logical/flexbox equivalent when it matches the need. A prefixed declaration can be a narrowly tested fallback, but must not be the only implementation unless the target environment explicitly requires it.',
    example: 'Use `text-overflow`, `line-clamp`, or modern flexbox features where they satisfy the goal; verify each legacy alias and target browser instead of assuming every `-webkit-` property is supported.',
    mistakes: ['Treating a vendor prefix as proof of current support or standardization.', 'Copying a prefix-only snippet from an old example.', 'Using physical-direction aliases when a logical property is correct.', 'Assuming two prefixed names with similar spelling are equivalent.'],
  },
  'css-basic-user-interface': {
    mental: 'These properties style browser-facing control affordances such as appearance, caret, focus outline, cursor, text selection, resize, and pointer interaction. Recent `interactivity` and `interest-delay*` properties also connect CSS to inertness and Interest Invoker event timing; their support and behavior are still evolving. Styling must preserve discoverability, keyboard focus, and expected control behavior.',
    comparison: '`outline` paints an indicator without taking layout space; `border` participates in the box. `pointer-events` changes pointer hit testing, not keyboard focus or accessibility semantics. `appearance` affects native-like rendering and does not create or remove the control’s semantics.',
    example: 'Retain a visible keyboard focus treatment instead of relying on pointer hover.',
    codeExample: 'button:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }',
    mistakes: ['Removing focus outlines without an equally visible replacement.', 'Using `pointer-events: none` as a way to disable a control.', 'Assuming `appearance: none` removes native semantics or validation.', 'Applying `user-select: none` broadly and preventing useful text selection.'],
  },
  'css-inline': {
    mental: 'Inline layout controls line boxes, baselines, leading, vertical alignment, and drop caps. These properties interact with font metrics, writing mode, and the inline formatting context; the visible glyph bounds are not always the line box bounds.',
    comparison: '`line-height` controls inline line-box height; baseline properties align inline-level content to typographic baselines; `vertical-align` has context-dependent behavior and is not a general flex/grid alignment tool. New text-box properties trim or select font-derived edges where implemented.',
    example: 'Use `line-height` to set readable line spacing; use `vertical-align` for inline/table-cell alignment, not to vertically center arbitrary block content.',
    mistakes: ['Using `vertical-align` to center a block in a container.', 'Assuming font glyph outlines exactly define line-box size.', 'Using draft text-box or initial-letter features without checking browser support and script-sensitive behavior.'],
  },
  'css-cascading-and-inheritance': {
    mental: 'The `all` shorthand resets most properties on an element to a CSS-wide keyword, but excludes custom properties and directionality/unicode-bidi properties. It is a cascade tool, not a complete reset stylesheet.',
    comparison: '`all: initial` applies each property’s initial value; `inherit` forces inherited values; `unset` acts as inherit for naturally inherited properties and initial otherwise; `revert` and `revert-layer` roll back to earlier cascade origins/layers.',
    example: 'A component can use `all: unset` only with a clear plan to restore needed display, font, focus, and interaction styles; applying it indiscriminately can remove useful defaults.',
    mistakes: ['Assuming `all` resets custom properties or directionality.', 'Confusing `revert` with `initial`.', 'Using reset shorthands without restoring accessibility-critical focus styles.'],
  },
  'css-animations': {
    mental: 'Animation properties define named keyframes, timeline, duration, delay, iteration, direction, fill, easing, composition, and newer triggers. The `animation` shorthand combines several longhands; list-valued longhands align by list position and repetition rules.',
    comparison: 'Time-based animations use a document timeline; scroll/view timelines map progress to scroll state. Animation trigger properties are draft-level evolving syntax. `animation-fill-mode` controls styles outside the active interval, not whether the animation runs.',
    example: 'A short opacity animation can signal a nonessential appearance change; content must remain available without waiting for it.',
    codeExample: '@keyframes fade { from { opacity: 0; } to { opacity: 1; } }\n.notice { animation: fade 180ms ease-out both; }',
    mistakes: ['Assuming `animation` shorthand retains previous longhand values; omitted shorthand components reset to their initial values.', 'Animating expensive layout properties without measuring performance.', 'Ignoring reduced-motion preferences or making essential information available only during motion.', 'Treating animation-trigger properties as a stable baseline.'],
  },
  'filter-effects': {
    mental: 'Filter Effects properties connect CSS filter functions and SVG filter-paint values. Filters can create a new compositing context, increase rendering cost, and change visual contrast or stacking behavior.',
    comparison: '`filter` affects the element and its rendered descendants as a filtered image; `backdrop-filter` samples pixels behind a translucent element. SVG filter primitives have distinct inputs, color interpolation, and output effects.',
    example: 'A subtle `backdrop-filter: blur(8px)` overlay needs a readable fallback background for browsers that do not support backdrop filtering.',
    mistakes: ['Confusing foreground filtering with backdrop filtering.', 'Using filters as the sole conveyance of state or meaning.', 'Applying large animated blur/filter surfaces without performance checks.'],
  },
  'css-transforms': {
    mental: 'Transforms map an element’s coordinate system in two or three dimensions without changing normal-flow layout. The transform origin and reference box affect the result; transformed elements can establish stacking and containing-block behavior.',
    comparison: 'The individual `translate`, `rotate`, and `scale` properties coexist with the `transform` list and are composed in a defined order. `perspective` and `transform-style` affect 3D context; `backface-visibility` controls rendering of a reversed 3D face.',
    example: 'A hover lift can use a transform while leaving neighboring flow layout in place.',
    codeExample: '.card { transform: translateY(-4px) scale(1.02); transform-origin: center; }',
    mistakes: ['Expecting a transform to move neighboring layout content.', 'Assuming transform function order is interchangeable.', 'Forgetting transformed elements can alter stacking/containing-block behavior.', 'Using transforms for text scaling when zoom/reflow is required.'],
  },
  'css-backgrounds-and-borders': {
    mental: 'Backgrounds paint one or more layers behind an element’s content; border properties control edges, radii, images, and shadows. Shorthand order and layer alignment matter, and backgrounds can be attached to the border, padding, or content box.',
    comparison: 'Each comma-separated background layer has its own image, position, size, repeat, origin, clip, and attachment; the first image is painted closest to the user. Border image properties slice, size, repeat, and place a source image around the border area. Shadows do not affect layout geometry.',
    example: 'Layer a decorative image above a solid color so unsupported or failed image loading still leaves a usable background.',
    codeExample: '.hero { background: url("hero.webp") center / cover no-repeat, #243044; border-radius: 1rem; }',
    mistakes: ['Forgetting shorthand resets omitted longhands.', 'Assuming backgrounds enlarge the box or replace the background color.', 'Using `background-size: cover` without considering crop/content focal points.', 'Treating shadows as borders for hit testing or layout.'],
  },
  'compositing-and-blending': {
    mental: 'Compositing controls how rendered element groups are combined with backdrops; blending modes operate on color channels. Opacity applies to the element group as a whole and can create a stacking context.',
    comparison: '`mix-blend-mode` blends an element with content behind it; `background-blend-mode` blends an element’s background layers; `isolation` can establish a separate blending group. These effects do not change DOM order or semantic hierarchy.',
    example: 'Use a blend mode only when the contrast remains sufficient over every supported backdrop; otherwise add a solid fallback color.',
    mistakes: ['Assuming blend output is constant across backgrounds.', 'Using group opacity when only a background should be translucent.', 'Forgetting isolated stacking contexts change the blending backdrop.'],
  },
  'css-masking': {
    mental: 'Clipping limits painting to a geometric region; masking uses alpha/luminance image data to control visibility. Mask layers combine with positions, sizes, repeats, modes, and compositing operations.',
    comparison: '`clip-path` produces a hard geometric or path boundary; `mask`/mask-image can provide graded transparency. Masks affect visual rendering, not the underlying DOM, hit testing in all cases, or accessibility exposure.',
    example: 'Keep text and controls usable when decorative masks fail to load; avoid masking essential content without an equivalent fallback.',
    mistakes: ['Treating a visual mask as semantic hiding.', 'Assuming masks and clipping have identical hit-testing or edge behavior.', 'Forgetting multiple mask layers and list values align by index.'],
  },
  'css-color': {
    mental: 'CSS Color covers color values, interpolation, color spaces, opacity, profiles, contrast, and newer wide-gamut/HDR functionality. Color behavior depends on the selected space and rendering environment.',
    comparison: 'Legacy sRGB syntax remains interoperable; modern syntax can express wider gamuts and perceptual spaces. `color` applies foreground color, while `opacity` composites the entire element group. Relative color functions derive channels from another color; gamut mapping may affect displayed values.',
    example: 'Provide robust foreground/background contrast and test colors on target displays; a numerically valid wide-gamut color can appear differently after gamut mapping.',
    mistakes: ['Assuming all devices display every color space identically.', 'Using color alone to communicate status.', 'Confusing element opacity with alpha in one color value.', 'Treating experimental color/HDR properties as universally supported.'],
  },
  'css-generated-content': {
    mental: 'Generated-content properties and counters style list numbering and content inserted by CSS pseudo-elements. The `content` grammar includes strings, images, counters, quotes, attribute values, and in newer syntax an alternative-text component after a slash. Generated text is presentation; essential content and control labels belong in the document or accessible name.',
    comparison: '`content` creates pseudo-element content and can change marker generation; counter properties maintain nested custom numbering, while `quotes` chooses language-sensitive quote pairs. CSS Content drafts define alternative text for some generated content, but support and accessibility-tree mapping vary, so essential information should remain in DOM content.',
    example: 'Use a real heading or button label for essential wording; reserve `::before` content for decorative symbols or supplementary formatting.',
    mistakes: ['Putting essential instructions only in `content`.', 'Assuming CSS-generated text is always announced or copied.', 'Forgetting counter scope and reset/increment ordering.'],
  },
  'css-lists-and-counters': {
    mental: 'List-style properties control markers and their placement; counters provide author-defined nested numbering. Native ordered/unordered list markup should communicate list structure; CSS customizes its presentation.',
    comparison: '`list-style-position` controls marker placement; `list-style-type` chooses a marker style; `list-style-image` supplies an image marker. Counter reset/set/increment and `counter()`/`counters()` formatting form a separate generated numbering system.',
    example: 'Prefer `<ol>` for ordered steps, then use CSS counters only when the visual numbering scheme is more specialized than native list markers.',
    mistakes: ['Using visual counters to replace semantic lists.', 'Assuming a list-style image is automatically a meaningful text alternative.', 'Mis-scoping nested counter resets.'],
  },
  'scalable-vector-graphics': {
    mental: 'SVG presentation attributes can be styled through CSS when the SVG element and property are applicable. SVG has a separate coordinate, paint, and geometry model; many fill/stroke features are draft additions rather than established browser behavior.',
    comparison: 'SVG presentation attributes and CSS declarations participate in different precedence positions in the cascade. `fill` paints interiors; `stroke` paints outlines. New stroke geometry/paint properties extend this model but must be treated according to the cited draft and browser support.',
    example: 'Use `fill` and `stroke` for ordinary SVG shapes, and keep meaningful SVG labels/semantics in the SVG/HTML content rather than relying on paint alone.',
    mistakes: ['Assuming every SVG-specific property applies to HTML boxes.', 'Confusing CSS fill/stroke presentation properties with SVG attributes.', 'Teaching draft stroke geometry as a widely implemented baseline.'],
  },
  'css-fonts': {
    mental: 'Font properties select families and faces, configure variation/feature axes, control synthesis, loading, optical sizing, and font metrics. Font availability and shaping depend on the user agent, platform, script, and loaded font files.',
    comparison: '`font-family` selects fallback order; `font-weight`, `font-stretch`, and `font-style` select face characteristics. `font-feature-settings` and `font-variation-settings` expose lower-level OpenType controls; prefer higher-level properties where available. `font-size-adjust` and metric overrides can stabilize fallback geometry.',
    example: 'Provide a generic family at the end of `font-family`, and test complex scripts and fallback fonts rather than assuming the local font exists.',
    mistakes: ['Using low-level feature settings when a high-level property exists.', 'Assuming a requested weight exists and cannot be synthesized.', 'Failing to include generic fallback families.', 'Ignoring layout shift from late font loading.'],
  },
  'css-text': {
    mental: 'Text properties control whitespace, wrapping, line breaking, transformation, alignment, spacing, and overflow. Their results depend on language, writing mode, font shaping, and available inline size.',
    comparison: '`white-space` governs spaces, wrapping, and line-break preservation; `overflow-wrap` permits breaks inside long tokens; `word-break` changes break opportunities; `hyphens` enables language-sensitive hyphenation. `text-overflow` only signals clipped inline overflow and does not itself cause clipping.',
    example: 'Use `overflow-wrap: anywhere` or a suitable wrapping strategy for untrusted long identifiers; retain readable line lengths and test real multilingual text.',
    mistakes: ['Using `word-break: break-all` as the default fix for overflow.', 'Treating `text-overflow: ellipsis` as a complete clipping solution.', 'Forgetting language metadata affects hyphenation and line breaking.', 'Teaching `word-wrap` as a separate modern property; it is an alias of `overflow-wrap`.'],
  },
  'css-images': {
    mental: 'Image properties define image values, gradients, image resolution/rendering, and replaced-element fitting/positioning. They control painted content but do not provide HTML alternative text or document semantics.',
    comparison: '`object-fit` sizes replaced content inside its box; `object-position` chooses the alignment/crop position. `image-rendering` controls scaling quality hints. Gradients are image values and can be layered like external images.',
    example: 'Pair `object-fit: cover` with an intentional `object-position` when cropping an image, and provide meaningful alternative text in HTML when the image conveys information.',
    mistakes: ['Confusing visual crop with semantic alternative text.', 'Assuming a gradient is a solid color for contrast calculations.', 'Ignoring intrinsic image ratio and object positioning.'],
  },
  'mathml': {
    mental: 'These CSS properties style MathML layout and mathematical presentation. MathML structure carries mathematical relationships; CSS should not replace that structure with visually positioned ordinary text.',
    comparison: 'Use the specified MathML properties only on relevant MathML layout boxes. Browser support and exact behavior vary by implementation; verify equations with assistive technology as well as visual rendering.',
    example: 'Keep a semantic MathML expression and use these properties only for its presentation; provide a textual explanation for complex notation when the surrounding lesson needs it.',
    mistakes: ['Assuming visual math layout alone exposes equation structure.', 'Applying MathML-specific properties to unrelated HTML boxes.', 'Treating emerging MathML styling support as universal.'],
  },
  'motion-path': {
    mental: 'Motion-path properties place and orient an element along a path. Offset distance and anchor define position, while rotation and path geometry determine orientation and the route.',
    comparison: 'Motion-path placement is distinct from a transform translation: it follows path geometry and can rotate with the tangent. Motion effects change visual position, not normal-flow allocation.',
    example: 'Use a short decorative motion path for a nonessential icon, and preserve a static readable state when animation is reduced or unavailable.',
    mistakes: ['Assuming path movement changes surrounding layout.', 'Animating motion without reduced-motion consideration.', 'Confusing `offset-*` with unrelated logical inset properties.'],
  },
  'css-paged-media': {
    mental: 'Paged-media properties control page boxes and page-dependent margins for print or other paginated output. They have limited or varying browser support and may behave differently in print engines.',
    comparison: 'Screen layout uses a continuous viewport; paged media creates page fragments with page size, margins, and breaks. Use fragmentation properties for break behavior and paged-media properties for page context.',
    example: 'Test print styles through the actual browser/renderer used by the audience; do not assume screen preview matches page boxes and printed output.',
    mistakes: ['Assuming every browser supports all page-margin features.', 'Using page-size rules to fix screen layout.', 'Forgetting links, contrast, and content order in printed output.'],
  },
  'css-ruby': {
    mental: 'Ruby properties style interlinear annotations commonly used to provide pronunciation or short readings alongside East Asian base text. Ruby markup establishes base/annotation relationships; properties control placement, alignment, spacing, merging, and overhang.',
    comparison: '`ruby-position` controls annotation placement; `ruby-align` aligns annotation and base; `ruby-merge` governs shared annotation space for group readings; `ruby-overhang` controls whether annotations can extend. Support varies, especially for advanced values.',
    example: 'Use semantic `<ruby>` markup for base and annotation text, then apply ruby properties only where their supported behavior improves readability.',
    mistakes: ['Styling ruby as unrelated superscript text and losing the association.', 'Assuming all ruby values work identically across engines.', 'Using merge/overhang behavior without testing line breaks and Japanese compound readings.'],
  },
  'css-shapes': {
    mental: 'CSS Shapes changes the float exclusion shape so inline content can wrap around nonrectangular geometry. It does not create a general-purpose arbitrary layout engine; shape geometry interacts with floats, margins, and box dimensions.',
    comparison: '`shape-outside` defines the wrapping contour; `shape-margin` expands the exclusion boundary; `shape-image-threshold` interprets image alpha for contours. The float still occupies its normal box and controls where the shape applies.',
    example: 'Use a circular float with `shape-outside: circle()` for a text wrap, and ensure the reading order remains meaningful without the visual contour.',
    mistakes: ['Expecting shapes to affect non-floated elements as a general layout feature.', 'Confusing the visible shape with the float’s actual box.', 'Using image alpha without checking the threshold and fallback.'],
  },
  'css-text-decoration': {
    mental: 'Text-decoration properties control underline/overline/line-through lines, style, color, thickness, offsets, skip-ink behavior, emphasis marks, and shadows. Decoration lines can be propagated across inline descendants and follow text shaping.',
    comparison: '`text-decoration-line` selects lines; style, color, thickness, and offset configure them. `text-emphasis` adds marks used in some scripts. `text-shadow` paints a visual shadow and should not reduce text legibility.',
    example: 'Use text decoration for links with sufficient contrast and an additional non-color affordance; preserve visible focus separately.',
    mistakes: ['Removing underlines from links without another cue.', 'Assuming decoration applies only to the element’s own glyphs.', 'Using shadows to simulate contrast or focus indicators.'],
  },
  'pointer-events': {
    mental: 'The `pointer-events` property controls whether an element can be the target of pointer hit testing, with SVG-specific values and HTML applicability rules. It does not disable keyboard focus, events dispatched by script, or accessibility semantics.',
    comparison: 'Use native disabled state for disabled form controls, not `pointer-events: none`. A transparent overlay may still affect pointer targeting according to its value and stacking position.',
    example: 'If a decorative overlay should not intercept clicks, apply pointer-events behavior to that decoration while leaving the actual controls operable.',
    mistakes: ['Treating `pointer-events: none` as a complete disabled state.', 'Forgetting keyboard users can still focus an element.', 'Using SVG-only values as if they were consistently meaningful on HTML.'],
  },
  'css-transitions': {
    mental: 'Transition properties interpolate between computed values when a property changes. They control property selection, duration, delay, easing, and newer discrete-transition behavior; transitions are triggered by state changes rather than keyframe timelines.',
    comparison: 'Transitions need a before/after computed value and usually run when style changes. Animations define keyframes and can repeat or run independently. `transition-behavior` controls whether discrete properties may transition where supported.',
    example: 'Transition opacity between two computed states while keeping content and controls usable in either state.',
    codeExample: '.panel { opacity: 0; transition: opacity 160ms ease; }\n.panel.is-open { opacity: 1; }',
    mistakes: ['Assuming nonanimatable properties interpolate continuously.', 'Using a transition duration without a reduced-motion alternative.', 'Forgetting shorthand values reset omitted transition longhands.'],
  },
  'css-view-transitions': {
    mental: 'View-transition properties coordinate visual snapshots between document states or navigations. They work with the View Transition API and pseudo-elements; CSS naming and animation rules style snapshots, not the underlying semantic content.',
    comparison: 'A transition can be same-document or cross-document depending on API and navigation support. `view-transition-name` associates elements across states; group/image-pair/old/new pseudo-elements expose snapshot layers. Support and navigation integration vary.',
    example: 'Keep navigation and content updates correct without animation first; add a view transition as progressive enhancement and honor reduced-motion preferences.',
    mistakes: ['Assuming a CSS property alone starts a view transition.', 'Using duplicate transition names in a snapshot when the API requires unique association.', 'Making essential state understandable only through the visual animation.'],
  },
  'css-will-change': {
    mental: '`will-change` hints that an element is likely to change a property so the browser may prepare an optimization. It is advisory, can consume resources, and should be applied shortly before a real change and removed afterward.',
    comparison: 'A transform/opacity animation may be optimized without a hint. `will-change` does not guarantee acceleration or smoother rendering and can create stacking/containing-block effects for some values.',
    example: 'Profile first; add `will-change` only to a small set of elements shortly before an observed bottleneck, then remove it when the interaction ends.',
    mistakes: ['Applying `will-change` to every element preemptively.', 'Treating it as a performance guarantee.', 'Ignoring memory use and stacking side effects.'],
  },
  'experimental-scroll-driven-animations': {
    mental: 'Scroll-driven animation properties connect animation progress to scroll or view progress rather than elapsed time. Timeline source, axis, insets, and ranges determine how progress maps. In the 2026-11-16 MDN capture, the supplied scroll/view timeline and range names are marked Baseline 2026; older browsers may lack them, and specification status remains module-specific.',
    comparison: 'Document timelines advance with time; scroll timelines advance with a scroll container; view timelines track a subject through a scrollport. Scroll triggers can activate at ranges, while progress timelines continuously map progress.',
    example: 'Prototype a nonessential progress animation with `@supports (animation-timeline: scroll())`, and ensure the content is understandable without the effect.',
    mistakes: ['Assuming every scroll animation is a trigger or every trigger is a progress timeline.', 'Ignoring nested scroll containers and axis selection.', 'Treating experimental `timeline-trigger*` properties as a stable cross-browser baseline.'],
  },
};

function esc(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}
function groupContext(group) {
  return context[group.id] ?? {
    mental: `The supplied names belong to the ${group.title} CSS family. Their definitions specify accepted value syntax, applicable boxes/elements, inheritance, computed values, and rendering effects. A property can be listed in an index even when its specification or implementations are experimental.`,
    comparison: `Compare each property's role and value grammar with adjacent properties in this module. Shorthands may reset omitted longhands; aliases and vendor-specific properties may share behavior without identical standards status. Check the individual description and the current browser support data before depending on an entry.`,
    example: `Choose a property from this group based on the actual rendering need, then test its computed value and visual result in the target browsers. Keep a fallback for content and layout if the property is unsupported.`,
    mistakes: ['Treating the property name alone as enough to infer its allowed values.', 'Assuming listed means standardized or interoperable.', 'Forgetting cascade, inheritance, writing mode, or containing-block effects.', 'Using an experimental property without a fallback or browser-support check.'],
  };
}
function propertyRow(name) {
  const record = byName.get(name);
  const url = record.canonicalUrl;
  let description = record.description.replaceAll('\n', ' ').trim();
  if (name.startsWith('-webkit-')) description = `Vendor-prefixed extension: ${description}`;
  if (name === 'word-wrap') description = 'Legacy alias of `overflow-wrap`; the modern property allows breaks inside an otherwise unbreakable string to prevent inline overflow.';
  if (name === 'window-drag') description += ' This is a recent Working Draft feature, not a general browser window API.';
  if (name === 'stroke-color') description += ' Treat it as draft rather than a stable cross-browser baseline.';
  if (name === 'initial-letter-align') description += ' The feature is defined in an evolving CSS Inline Layout draft and is not broadly implemented.';
  if (name === 'ruby-merge') description += ' This is evolving draft behavior with limited implementation.';
  const status = record.supportLabel ? ` **Support snapshot:** ${record.supportLabel}${record.experimental ? '; MDN marks the feature experimental' : ''}.` : ' **Support snapshot:** no MDN baseline label was captured; check the linked specification and compatibility data.';
  return `| \`${esc(name)}\` | ${esc(description)}${esc(status)} [MDN/spec reference](${url}) |`;
}

const baseTitle = manifest.title;
const overview = `
# ${baseTitle} — Big-picture orientation and mental model

# Problem and purpose

CSS has hundreds of properties because visual presentation spans layout, text, color, painting, interaction, motion, and specialized media. Learning a property as an isolated name is ineffective: each property participates in the cascade, has a value grammar, applies to particular boxes, and interacts with browser rendering and other properties.

# Plain-language mental model

Think of a stylesheet as a set of declarations competing through the cascade to compute values for elements and pseudo-elements. A property name selects the kind of behavior; its value chooses the specific behavior. The browser then applies module rules to layout and paint. The same declaration may behave differently when inheritance, writing mode, containing blocks, animation, or browser support changes.

This curriculum uses the pinned MDN property dataset for the names, individual MDN property descriptions for the short explanations, and W3C CSS Snapshot 2026 for specification status. CSS modules evolve independently. The 2026 snapshot is a stable specification profile, not a single “CSS 2026” release and not a browser support matrix. Vendor-prefixed, alias, and experimental entries are explicitly called out.

# How the parts fit together

1. Read the property's purpose and accepted grammar.
2. Check whether it is a shorthand, longhand, alias, vendor extension, or experimental entry.
3. Determine which elements/boxes it applies to, whether it inherits, and how its computed value is formed.
4. Identify interactions with related properties, writing modes, stacking, layout, and animations.
5. Check target-browser support and provide a fallback when required.
6. Inspect the computed result and test responsive, accessibility, performance, and reduced-motion behavior.

# Concept map

| Family | Question | Typical concerns |
| --- | --- | --- |
| Cascade and variables | Which declaration wins and how are values reused? | Specificity, layers, custom properties, invalid substitutions |
| Typography and inline layout | How are glyphs shaped and arranged into lines? | Font fallback, baselines, wrapping, language, line boxes |
| Color and painting | What is drawn and how are layers combined? | Color spaces, backgrounds, borders, filters, masks, blending |
| Motion and transforms | How does presentation change over time or space? | Stacking, compositing, scroll timelines, reduced motion |
| Specialized modules | Which domain-specific model applies? | SVG, MathML, ruby, printing, shapes, view transitions |

# End-to-end walkthrough

Suppose a card needs a responsive image, readable title, subtle hover lift, and a branded surface. Use an image-fitting property for the replaced image, text/font properties for the heading, a transform for the lift, and background/border properties for the surface. Check that the transform does not change the flow, the image crop preserves the subject, focus styles remain visible, contrast holds across the background, motion is optional, and unsupported effects retain a usable fallback.

# When to use it and tradeoffs

Prefer the simplest standardized property that expresses the desired behavior. Shorthands reduce repetition but reset omitted longhands; logical properties adapt to writing modes but require understanding inline/block axes; powerful filters and animations can cost performance; experimental entries may not interoperate. Treat the W3C status and implementation support as separate facts.

# What later lessons cover

The concepts lesson teaches how property families fit together. Each reference covers an exact supplied property group with concise individual explanations, comparisons, examples, and pitfalls. Practice applies the cascade, text/layout, painting, and motion model; interview questions test tradeoffs and support judgment.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS properties reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
`;

const concepts = `
# ${baseTitle} — Core concepts and how they fit together

# Learning objectives

Explain the cascade and computed-value pipeline; distinguish CSS property families and status; read a property reference; understand inheritance, logical axes, shorthands, list-valued properties, animation, rendering side effects, and progressive enhancement; and evaluate a declaration in real browsers.

# Prerequisites

Know HTML selectors, rules, declarations, common layout concepts, responsive design, and basic browser DevTools. The exact property names are supplied in the reference lessons so study can focus on meaning and relationships.

# Core concepts

## A declaration is more than a name/value pair

A property definition has a grammar and semantic constraints. The cascade selects a specified value; variables and substitutions are resolved; inheritance/defaulting and value computation produce computed/used values; layout and painting consume them. A syntactically accepted declaration may still be invalid at computed-value time or have no visual effect in the current layout context.

## The cascade, inheritance, and custom values

Origin, importance, cascade layer, specificity, scope, and source order determine precedence. Inheritance supplies values to descendants only for inherited properties unless a CSS-wide keyword changes behavior. Custom properties participate in this same cascade, usually inherit, and substitute token streams with \`var()\`; registration with \`@property\` adds typing and defined inheritance/initial behavior.

## Shorthands and list-valued properties

A shorthand sets a related group of longhands and resets omitted components to their initial values. Animation, background, transition, and font properties often accept comma-separated layers/lists; corresponding longhands align by list position and have defined repetition behavior. Editing one shorthand can unintentionally erase another longhand setting.

## Logical properties and writing modes

Physical terms such as left/right/top/bottom refer to physical edges. Logical terms such as inline-start/block-end refer to writing-mode axes. Logical properties support international layouts, but their meaning depends on the element's writing mode and direction. Do not mechanically translate one axis into a physical side without knowing context.

## Layout, text, and paint have different effects

Some properties affect intrinsic sizing and layout; transforms can move painting without moving normal-flow neighbors; filters, masks, and opacity change compositing; generated content can affect presentation without supplying reliable document semantics. The distinction predicts reflow, stacking, overflow, hit-testing, and performance effects.

## Standards status and implementation support are separate

CSS modules progress independently through drafts and Recommendations. The CSS Snapshot describes specification maturity; it does not guarantee all browser engines implement every included feature. MDN data also includes vendor extensions, aliases, and experimental properties. Use feature queries and graceful fallbacks where support varies, then test actual target browsers.

## Brief version history

| Period | Major change in how CSS evolved |
| --- | --- |
| CSS 1 and CSS 2 | Core features were defined in a small number of large specifications. |
| CSS 3 onward | The CSS Working Group moved to independently versioned modules, so there is no single universal CSS 3 feature set or later monolithic CSS version. |
| Modern CSS modules | Custom properties, flexbox/grid, logical properties, wide-gamut color, container queries, scroll-driven animation, and view transitions arrived through separate modules and support timelines. |
| CSS Snapshot 2026 | W3C publishes a stable specification profile; this is a snapshot of module maturity, not a browser release or a “CSS 2026” language edition. |

# Mechanisms and relationships

| Mechanism | What it determines | Check |
| --- | --- | --- |
| Cascade | Winning declaration | Importance, origin, layer, specificity, order |
| Value processing | Computed/used value | Substitutions, inheritance, percentages, containing block |
| Formatting model | Geometry | Layout participation, writing mode, intrinsic sizing |
| Painting/compositing | Pixels and stacking | Background layers, transform/filter/opacity contexts |
| Timeline/interpolation | Change over time/progress | Animatable type, timeline source, motion preference |
| Support | Whether target browser implements it | Baseline/compatibility data and runtime feature query |

# Worked examples

\`\`\`css
:root { --accent: #375fe8; }
.button { color: white; background: var(--accent, navy); }
.button:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }
\`\`\`

The custom property participates in cascade and inheritance. \`var()\` supplies a value at substitution time; its fallback is used when the custom property is missing/invalid under the substitution rules. The focus outline does not occupy layout space and is intentionally visible. Verify contrast, forced-colors behavior, and keyboard focus.

\`\`\`css
@media (prefers-reduced-motion: no-preference) {
  .card { transition: transform 160ms ease; }
  .card:hover { transform: translateY(-3px); }
}
\`\`\`

The transform changes visual painting rather than normal-flow allocation. The media query avoids adding motion for users who request reduced motion; essential state must remain clear without the transition.

# Misconceptions and edge cases

- “A property list is a list of stable features.” It can include aliases, prefixes, drafts, and unsupported names.
- “A shorthand only changes the values I write.” It resets omitted longhands in its shorthand set.
- “Transform changes the layout position.” It changes painting and can affect stacking/containing blocks, but does not reflow neighbors.
- “Logical properties always mean left and top.” Their edges depend on writing mode and direction.
- “A valid CSS declaration must visibly work.” Applicability, layout context, computed-value validity, and support can prevent an effect.
- “A CSS reset is harmless.” It can remove focus and native affordances or override useful user-agent styles.
- “A W3C Snapshot is a browser support table.” It reflects specification stability, not adoption.
- “Vendor-prefixed means browser-safe.” Prefixes can describe legacy or proprietary behavior.

# Knowledge checks with answers

1. **What does a property grammar tell you?** Which values and combinations are valid for that property.
2. **What can a shorthand do to omitted longhands?** Reset them to their initial values.
3. **Does transform reflow neighboring boxes?** No; it changes the transformed element's rendered position and can create other rendering side effects.
4. **What is the difference between CSS Snapshot status and browser support?** Specification stability versus implementation availability.
5. **When is a logical property useful?** When layout should adapt to writing direction and writing mode.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS properties reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
`;

await fs.mkdir('course/lessons/t07-018', {recursive: true});
await fs.writeFile('course/lessons/t07-018/t07-018-overview.md', overview);
await fs.writeFile('course/lessons/t07-018/t07-018-concepts.md', concepts);

for (const group of manifest.inventory) {
  const detail = groupContext(group);
  const records = group.items.map(name => byName.get(name));
  const experimentalCount = records.filter(record => record.experimental).length;
  const baselineCount = records.filter(record => record.supportLabel.startsWith('Baseline')).length;
  const limitedCount = records.filter(record => record.supportLabel === 'Limited availability').length;
  const status = group.id === 'webkit-extensions'
      ? 'These are vendor-prefixed extensions/compatibility names, not a single standard module. Check whether a modern unprefixed equivalent is available.'
      : group.id === 'css-custom-properties-for-cascading-variables'
        ? 'Custom properties are part of the CSS cascade model; registered and unregistered custom properties have different typing and inheritance behavior.'
        : `${baselineCount} supplied ${baselineCount === 1 ? 'name has' : 'names have'} an MDN Baseline label, ${limitedCount} ${limitedCount === 1 ? 'is' : 'are'} marked Limited availability, and ${experimentalCount} ${experimentalCount === 1 ? 'is' : 'are'} explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation.`;
  const rows = group.items.map(propertyRow).join('\n');
  const renderedExample = detail.codeExample ? `\`\`\`css\n${detail.codeExample}\n\`\`\`` : '';
  const keyItems = group.items.slice(0, 3).map(name => `\`${name}\``).join(', ');
  const ref = `
# ${baseTitle} — Reference: ${group.title}

# Scope and version

This reference explains all ${group.items.length} supplied names in **${group.title}**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. ${status} The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](${cssSnapshotUrl})

# How this group fits the mental model

${detail.mental} Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
${rows}

# Cross-item comparison

${detail.comparison}

| Item | How to interpret it |
| --- | --- |
${group.items.slice(0, 2).map(name => `| \`${name}\` | See its individual linked definition above; apply its property-specific value grammar and context. |`).join('\n')}

# Examples

${detail.example}

${renderedExample}

The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

${detail.mistakes.map(mistake => `- ${mistake}`).join('\n')}
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** ${keyItems}. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](${cssSnapshotUrl})
- [MDN CSS property index](${mdnIndexUrl})
- [W3C CSS property index](${w3cIndexUrl})
`;
  await fs.writeFile(`course/lessons/t07-018/t07-018-reference-${group.id}.md`, ref);
}

const practice = `
# ${baseTitle} — Exercises and worked solutions

# Goals

Practice tracing property values through the cascade, selecting a suitable property family, recognizing shorthand and layout side effects, writing a robust fallback, and evaluating draft/vendor support.

# Worked example

\`\`\`css
.card { background: white; background-color: #fff; transform: translateY(-2px); }
\`\`\`

The background shorthand appears first and sets/reset its included background longhands; the later \`background-color\` overrides that component. The transform visually moves the card but does not move adjacent flow boxes. Check stacking, focus indicators, contrast, and reduced motion.

# Exercises

1. A long unbroken user-supplied identifier overflows a card. Choose a text wrapping approach and explain the difference between \`overflow-wrap\` and \`word-break\`.
2. A button uses \`outline: none\` and changes only its background on hover. Identify the problem and provide a keyboard focus style.
3. A design asks to animate a card on scroll using \`animation-timeline\` and \`timeline-trigger\`. Distinguish progress timelines from trigger features and plan support fallback.
4. A theme uses \`--accent\` and expects it to animate as a typed color. Explain why registration may matter and which behavior differs from an unregistered custom property.
5. A team wants \`will-change: transform\` on every card to prevent jank. Explain why this is risky and how to investigate.
6. An SVG icon uses \`stroke-color\` and fails in stable browsers. Diagnose status and suggest a supported alternative.

# Progressive hints

1. Find the modern standard property and consider whether breaks are permitted at arbitrary positions.
2. Hover is not keyboard focus; outlines do not allocate layout space.
3. A scroll timeline maps progress; a trigger activates at a condition. These draft additions need feature checks.
4. Unregistered custom properties preserve tokens; registration can provide syntax and interpolation behavior.
5. Hints are not guarantees and can use memory/stacking resources.
6. Check whether the property is only present in a First Public Working Draft.

# Complete solutions

1. Use \`overflow-wrap: anywhere\` where arbitrary long-token breaks are acceptable. \`word-break\` changes line-break opportunities more broadly; \`word-wrap\` is a legacy alias of \`overflow-wrap\`. Test long URLs and multilingual text.
2. Provide a visible \`:focus-visible\` indicator that remains clear in forced colors, e.g. \`outline: 3px solid currentColor; outline-offset: 2px\`. Do not rely only on hover or color.
3. \`animation-timeline\` associates progress with a scroll/view timeline; \`timeline-trigger*\` draft properties define activation behavior. Guard nonessential effects with support checks, honor reduced motion, and keep content understandable without animation.
4. \`@property\` can specify a syntax, inheritance, and initial value, which makes typed interpolation possible for supported values. An unregistered custom property is an untyped token sequence; it does not necessarily interpolate as a color.
5. \`will-change\` is a hint with memory and rendering costs, not a promise of acceleration. Profile first, scope to the few elements about to change, and remove the hint afterward.
6. \`stroke-color\` belongs to a W3C First Public Working Draft. Use established SVG \`stroke\`/\`color\` mechanisms for reliable behavior and verify actual implementation support before progressive enhancement.

# Tests and edge cases

Inspect computed values and cascade layers; test RTL and vertical writing modes for logical properties; zoom/reflow and forced colors for UI; no-prefers-motion and reduced-motion states; unsupported-property fallback; print output; long/untrusted text; and representative browser engines. Profile complex animations and filters on constrained devices.

# Reflection questions

- Which declaration won and why?
- Is the property stable, vendor-specific, aliased, experimental, or merely included in a draft index?
- What changes in layout versus only paint/compositing?
- What does the fallback do when the browser ignores the declaration?
- Which tests confirm usability as well as visual appearance?

# Sources

- [W3C CSS Snapshot 2026](${cssSnapshotUrl})
- [MDN CSS properties reference](${mdnIndexUrl})
- [W3C CSS property index](${w3cIndexUrl})
`;
await fs.writeFile('course/lessons/t07-018/t07-018-practice.md', practice);

const interview = `
# ${baseTitle} — Interview questions and reasoning

# Core questions

Explain how you determine property meaning, maturity, and behavior instead of relying on names or remembered snippets.

# Concise interview answers

1. **What steps occur after a declaration is parsed?** The cascade selects a declaration; value substitution/defaulting and computation produce values that layout/painting consume. Valid syntax alone does not prove a visible effect.
2. **What does a shorthand do?** It sets a defined set of longhands and resets omitted components to their initial values.
3. **How do custom properties differ from ordinary variables in a programming language?** They participate in the CSS cascade and usually inherit; \`var()\` substitution follows CSS value processing. \`@property\` can register syntax and inheritance/initial behavior.
4. **Does transform change normal flow?** No; it changes visual rendering and can affect stacking and containing-block behavior.
5. **What does CSS Snapshot 2026 mean?** A W3C Group Note profiling specification stability, not one browser feature release or support table.
6. **How do you handle a newly listed property?** Read its linked specification/MDN definition, identify standards status, check target-browser implementation, use \`@supports\` when useful, and retain a usable fallback.

# Deep follow-up answers

Shorthand resets matter because a later \`animation\` or \`background\` declaration can silently clear earlier longhands. Custom properties defer value substitution, so an invalid token sequence may invalidate a consuming declaration at computed-value time. Logical properties use inline/block axes and therefore adapt to writing mode. Effects that only alter paint (transform, filter, opacity) have different layout and performance consequences than sizing or typography properties. Specification maturity and deployment remain separate dimensions.

# Scenario questions

1. **A property appears in MDN but has no support in the target Safari version. What do you do?** Provide a baseline design using interoperable properties; use the new declaration as progressive enhancement after checking runtime support.
2. **The computed style contains your value but the display looks unchanged. Why?** The property may not apply to the element/box, the value may compute to an equivalent/default result, a later paint/layout rule may dominate, or the property may be unsupported/partially implemented.
3. **A scroll animation is smooth on desktop but causes issues on mobile. What do you inspect?** Timeline source/axis and nested scrollers, compositing and layout cost, reduced-motion behavior, fallback, and target device performance.

# Tradeoffs and alternatives

Shorthands improve concision but hide resets; longhands are clearer for overrides. Logical properties improve localization but require understanding writing modes. Native/browser defaults reduce implementation burden, while resets increase control but can remove useful affordances. New features can simplify code but require progressive enhancement and support testing.

# Common weak answers

- “The property is in CSS so all browsers support it.”
- “The W3C Snapshot means it is widely implemented.”
- “Transform changes layout.”
- “A custom property is a JavaScript variable.”
- “Use a reset to remove unwanted browser styles” without considering focus and accessibility.
- “The animation works on my laptop” without reduced-motion, performance, and support checks.

# Self-check rubric

Score 0–2 for each answer: accurate property meaning; cascade/layout/paint model; version and support distinction; concrete fallback; and meaningful verification. A strong answer separates stable specifications from experimental entries and user-facing behavior from implementation details.

# Sources

- [W3C CSS Snapshot 2026](${cssSnapshotUrl})
- [MDN CSS properties reference](${mdnIndexUrl})
- [W3C CSS property index](${w3cIndexUrl})
`;
await fs.writeFile('course/lessons/t07-018/t07-018-interview.md', interview);
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote overview, concepts, ${manifest.inventory.length} property references, practice, and interview. Captured ${snapshot.records.length} property sources.`);
