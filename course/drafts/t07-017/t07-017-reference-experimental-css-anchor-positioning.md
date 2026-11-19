# CSS layout flexbox grid positioning and responsive design — Reference: CSS Anchor Positioning properties, functions, and APIs

# Scope and version

This lesson covers all eight assigned properties plus `anchor()`, `anchor-size()`, `anchor-center`, `@position-try`, `CSSPositionTryRule`, and `CSSPositionTryDescriptors`. The current CSS Anchor Positioning Level 1 Editor’s Draft checked is dated 6 September 2026; the latest W3C-published Working Draft is dated 27 March 2026. The 2026-11-16 MDN snapshot labels all eight assigned properties Baseline 2026, but that property-level browser-support label does not certify every value, function, rule, or CSSOM interface. The module remains a Working Draft; browser support data is not a claim that its specification is final.

# How this group fits the mental model

Anchor positioning places an absolutely positioned box relative to another laid-out box. The anchor can be named in CSS, supplied implicitly by a host feature such as an HTML popover invoker, or directly referenced in a function. You can describe placement in three ways: choose a region in a 3×3 grid around a default anchor (`position-area`), calculate an inset from a particular anchor edge (`anchor()`), or size from an anchor dimension (`anchor-size()`). Fallbacks form alternate position options when the initial placement overflows.

This is visual geometry only. It does not create a semantic, focus, or accessibility relationship. Use Popover, dialog, ARIA, and ordinary DOM relationships for those purposes. The HTML Popover API can establish invoker/popover semantics and an implicit anchor relationship; avoid adding redundant named-anchor plumbing when that implicit relationship is the intended one. The CSS Editor’s Draft still contains an unfinished note around implicit-anchor examples, so check current HTML and browser behavior for a specific integration.

# Supplied names explained

## Finding the anchor

| Exact supplied name | Grammar and behavior |
| --- | --- |
| `anchor-name` | `none \| <anchor-name>#`, where each `<anchor-name>` is a dashed identifier such as `--menu-trigger`; initial `none`; non-inherited. Gives an element that generates a principal box one or more names. Names are tree-scoped but need not be globally unique. When multiple visible anchors share a name, lookup prefers the nearest acceptable ancestor, otherwise the last matching element in tree order. Only acceptable, laid-out-before targets can resolve; anchors in skipped `content-visibility: hidden` contents are not acceptable to outside elements. |
| `anchor-scope` | `none \| all \| <anchor-name>#`; initial `none`; non-inherited. Limits the named anchors visible to descendants in a subtree. `all` scopes all applicable names; a name list scopes only those names. It has no effect on implicit anchors. This is useful for repeated components whose internal anchor names would otherwise collide. |
| `position-anchor` | Current Editor’s Draft: `normal \| none \| auto \| <anchor-name> \| match-parent`; initial `normal`; non-inherited; absolutely positioned boxes only; reset-only subproperty of `position`. `normal` behaves as `none` when `position-area` is `none`, otherwise as `auto`. `auto` selects a host-provided implicit anchor if one exists. A name selects the matching default anchor. `match-parent` reuses the parent’s (or pseudo-element’s originating element’s) default anchor if it is an acceptable target. The published Working Draft predates some of these changes; use the version column above when comparing syntax. |

Anchor names are not automatically scoped by layout or style containment. Shadow-tree name visibility follows tree-scoped matching rules. CSS `anchor-scope` is an explicit scoping tool; containment is not a substitute.

## Positioning and sizing

| Exact supplied name | Grammar and behavior |
| --- | --- |
| `position-area` | `none \| <position-area>`; initial `none`; non-inherited. Selects one or more tracks of a 3×3 grid formed by the default anchor’s edges and the positioned box’s containing-block edges. The grammar accepts paired physical values (`top`, `bottom`, `left`, `right`, `center`), axis values (`x-start/end`, `y-start/end`), flow-relative values (`block-start/end`, `inline-start/end`, `start/end`), self-relative values, and their `span-*` forms plus `span-all`. A single unambiguous value spans the other axis; `center` alone centers on both axes. Logical values map through the containing block’s writing mode; `self-*` maps through the positioned box’s writing mode. A non-`none` value makes the selected area the positioned box’s containing block, resolves auto insets/margins to zero, and changes normal self-alignment. It has no effect without a default anchor or on a non-absolutely-positioned box. |
| `anchor()` | Function added to inset properties; grammar `anchor( <anchor-name>? && <anchor-side>, <length-percentage>? )`. `<anchor-side>` includes `inside`, `outside`, `top`, `right`, `bottom`, and `left` in the current Editor’s Draft. The optional name chooses a particular anchor; when omitted, the default anchor is used. It resolves to an inset length. A physical side must match the inset axis. If the function cannot resolve, its fallback is used; without one, the declaration becomes invalid at computed-value time. It is only valid in inset properties on an absolutely positioned box. |
| `anchor-size()` | Function usable in accepted sizing properties and insets in the draft; grammar `anchor-size( [ <anchor-name> || <anchor-size> ]?, <length-percentage>? )`. `<anchor-size>` is `width`, `height`, `block`, `inline`, `self-block`, or `self-inline`. It returns the selected anchor dimension as a length; an omitted dimension defaults to the axis of the property using it. Unlike `anchor()`, physical width/height may size a different axis (for example, `width: anchor-size(--trigger height)`). An unresolved function uses its fallback, or makes the declaration invalid at computed-value time if no fallback is supplied. |
| `anchor-center` | New value for `align-self` and `justify-self` on an absolutely positioned box. Centers the box over its default anchor in the relevant axis, using the scrollable containing block where applicable; auto insets and margins resolve to zero. If there is no default anchor or the box is not absolutely positioned, it behaves like `center`. The current draft removed it from `align-items` and `justify-items`, which do not align absolutely positioned boxes. |

## Cross-item comparison

Use `position-area` for a simple relationship to the default anchor. Use `anchor()` when explicit edge math, a fallback length, or multiple named anchors are needed. Use `anchor-size()` when the anchored box should track an anchor’s dimensions. Functions can be combined with ordinary `calc()`, `min()`, `max()`, and `clamp()` expressions where the property grammar permits them.

## Overflow fallback and visibility

| Exact supplied name | Grammar and behavior |
| --- | --- |
| `position-try-fallbacks` | `none \| [ <dashed-ident> || <try-tactic> ] \| <position-area> #`; initial `none`; non-inherited; absolutely positioned boxes only. Supplies comma-separated position options tried after the base style when the box overflows its inset-modified containing block. A dashed identifier names an `@position-try` rule; a tactic transforms the base styles; a `<position-area>` makes an option using that area. Tactics are `flip-block`, `flip-inline`, `flip-start`, `flip-x`, and `flip-y`; multiple tactics compose in order. Logical flips use the containing block’s writing mode. |
| `position-try-order` | `normal \| most-width \| most-height \| most-block-size \| most-inline-size`; initial `normal`; non-inherited; absolutely positioned boxes only. `normal` preserves the list order. A `most-*` value stably sorts options by the available inset-modified containing-block size they produce, largest first; it prioritizes room over declaration order. |
| `position-try` | Shorthand for `position-try-order` and `position-try-fallbacks`. If order is omitted, it resets to its initial `normal`, so setting a shorthand can reset an order set earlier. |
| `position-visibility` | Current Editor’s Draft: `always \| [ anchor-valid || anchor-visible || no-overflow ]`; initial `anchor-visible`; non-inherited; absolutely positioned boxes only; discrete. `always` disables the checks. `anchor-valid` hides a box when a referenced default anchor cannot resolve; `anchor-visible` hides it when its anchor is invisible or fully clipped by intervening boxes; `no-overflow` hides it if it still overflows after fallback options. Hiding is expressed through the draft `visibility: force-hidden` behavior. The March 2026 published draft used plural spellings `anchors-valid`/`anchors-visible`; the current Editor’s Draft uses singular spellings and permits user agents to recognize the plural forms as legacy aliases. |

`position-try-fallbacks` options include the base style as the first option. The browser tests options using the specification’s fallback algorithm; it does not promise to choose the visually most attractive result. Add a scrollable max-size strategy if a menu cannot fit in any candidate area.

## Custom fallback rules and CSSOM interfaces

| Exact supplied name | Role and API surface |
| --- | --- |
| `@position-try` | Defines a named `<dashed-ident>` position option used by `position-try-fallbacks`. Its declarations are restricted to inset properties, margins, sizing properties, self-alignment properties, `position-anchor`, and `position-area`. `!important` is invalid for declarations in the rule. The rule’s declarations participate in the Position Fallback Origin, between author and animation origins. Repeated rules with the same name cascade together. |
| `CSSPositionTryRule` | CSSOM interface representing `@position-try`; extends `CSSRule` and exposes read-only `name` and `style` attributes. |
| `CSSPositionTryDescriptors` | The `style` object type; extends `CSSStyleDeclaration`. It exposes declarations from the accepted property families (margins, insets, sizes, self-alignment, `position-anchor`, and `position-area`) as CSSOM attributes and supports the inherited declaration API. The draft enumerates physical and logical aliases, such as `marginBlockStart`/`margin-block-start` and `insetInlineEnd`/`inset-inline-end`. Use `style.cssText`, `getPropertyValue()`, `setProperty()`, `removeProperty()`, and the inherited enumeration members according to the CSSOM contract; the exact accepted declarations remain restricted by `@position-try`. |

Example CSSOM inspection, where a stylesheet is same-origin and its rules are accessible:

```js
const rule = [...document.styleSheets[0].cssRules]
  .find((candidate) => candidate instanceof CSSPositionTryRule);

if (rule) {
  console.log(rule.name, rule.style.getPropertyValue("position-area"));
}
```

Cross-origin stylesheet access can be blocked by CSSOM security rules. `CSSPositionTryRule` availability and browser support for its descriptors must be checked independently from ordinary CSS fallback support.

# Examples

This example uses a named anchor and a custom fallback that constrains a tall menu. Keep the trigger/popover semantic relationship in HTML and provide focus, dismissal, and keyboard behavior separately.

```html
<button class="trigger" popovertarget="menu">Open menu</button>
<div id="menu" popover>…menu items…</div>
```

```css
.trigger { anchor-name: --menu-trigger; }

#menu {
  position: fixed;
  position-anchor: --menu-trigger;
  position-area: block-end span-inline-end;
  position-try: most-height, flip-block, --above-scrollable;
  min-inline-size: anchor-size(--menu-trigger inline);
  max-block-size: 24rem;
  overflow: auto;
}

@position-try --above-scrollable {
  position-area: block-start span-inline-end;
  align-self: stretch;
}
```

The exact interaction between Popover’s implicit anchor and an explicitly selected `position-anchor` can depend on host rules and draft evolution; avoid redundant explicit declarations when the implicit invoker relationship is sufficient. Test within the actual containing block, nested scrollers, writing modes, zoom, top-layer state, and narrow viewports.

# Common mistakes

- Assuming visual anchoring creates an accessible description, ownership relation, or focus relationship.
- Assuming a name is global, unique, or automatically scoped; anchor names are tree-scoped and collisions are resolved by lookup rules.
- Forgetting that `anchor-scope` does not scope implicit anchors.
- Expecting a static or relatively positioned box to use anchor positioning; these features target absolutely positioned boxes.
- Using `anchor()` in a sizing property or `anchor-size()` in an unsupported property.
- Omitting function fallbacks where an anchor can be absent; unresolved functions without fallbacks invalidate declarations at computed-value time.
- Treating `position-area` as a margin shorthand; it changes the effective containing block and percentage basis.
- Assuming `position-try-order: most-height` preserves the fallback declaration order; it sorts options by available space.
- Using `position-visibility` as an interaction or accessibility mechanism.
- Assuming draft `anchor-valid`/`anchor-visible` and older published `anchors-valid`/`anchors-visible` spellings are identical support signals.
- Assuming a CSS Working Draft or MDN Baseline property label guarantees every function, value, at-rule, or CSSOM interface in every browser.
- Trusting `CSSPositionTryRule` inspection to work on cross-origin stylesheets.

# Knowledge checks with answers

1. **When is `position-area` simpler than `anchor()`?** When positioning a box in a region of the default anchor/containing-block 3×3 grid is enough; use `anchor()` for explicit edge math or multiple anchors.
2. **What is the difference between `anchor()` and `anchor-size()`?** The former supplies an anchor-relative inset length; the latter supplies an anchor dimension for supported sizing/inset declarations.
3. **Which draft tactic flips an option across the block axis?** `flip-block`; `flip-inline`, `flip-start`, `flip-x`, and `flip-y` address other directions.
4. **What does `position-try-order: most-height` prioritize?** The candidate option that yields the largest available inset-modified containing-block height, with stable ordering for ties.
5. **Does `@position-try` accept arbitrary visual styling?** No. Its declaration list is limited to positioning, margin, sizing, self-alignment, `position-anchor`, and `position-area` properties.
6. **What does `CSSPositionTryRule.style` expose?** A `CSSPositionTryDescriptors` object that inherits CSSStyleDeclaration and provides CSSOM access to the rule’s accepted declarations.
7. **What is the current visibility-check spelling in the September 2026 Editor’s Draft?** `anchor-valid` and `anchor-visible`; the March 2026 W3C Working Draft used plural spellings.

# Sources

- [CSS Anchor Positioning Module Level 1, latest Editor’s Draft](https://drafts.csswg.org/css-anchor-position-1/) — §§2–8: anchor discovery/scope, properties and functions, area grid, fallback values and rules, visibility, accessibility, and CSSOM interfaces. Editor’s Draft dated 2026-09-06; evolving proposal.
- [CSS Anchor Positioning Module Level 1, latest W3C-published Working Draft](https://www.w3.org/TR/css-anchor-position-1/) — dated 2026-03-27; useful for comparing published syntax, including the earlier plural `anchors-valid`/`anchors-visible` names.
- [HTML Living Standard](https://html.spec.whatwg.org/) — Popover invoker semantics and implicit anchor integration.
- [CSSOM](https://www.w3.org/TR/cssom-1/) — inherited CSSStyleDeclaration API and stylesheet rule access model.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity context, not a browser-compatibility table.
