# CSS selectors at-rules cascade values and box model — Reference: Experimental CSS at-rules

## Scope and version

The pinned [MDN at-rule inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/at-rules.json) classifies this entry as experimental. Check the current CSS Anchor Positioning specification and browser compatibility data before relying on it.

## How this group fits the mental model

Position-try rules provide alternative anchor-positioning strategies when a chosen position cannot fit or satisfy the configured overflow behavior. They let authors describe fallback placements declaratively, rather than calculating every alternative in script. This feature remains subject to implementation and specification evolution.

## Supplied names explained

- **`@position-try`** — Defines a named fallback position option, using declarations such as inset/position-area adjustments and margins that the anchor-positioning algorithm can try. The consuming anchored element references fallback names in its position-try-fallbacks configuration. It is not a general media query and does not itself select an element. Exact allowed declarations and fallback selection behavior are defined by CSS Anchor Positioning.

## Cross-item comparison

`@position-try` describes candidate placements associated with anchor positioning. `@media` and `@container` apply rule groups based on environment/container conditions; a position-try option is instead considered by the positioning algorithm as layout constraints require. Script-driven measurement can implement arbitrary bespoke placement but adds resize/scroll synchronization and can cause layout work; native position-try aims to express common fallback placements in CSS.

## Examples

```css
@position-try --below-start {
  position-area: block-end span-inline-start;
  margin-block-start: 0.5rem;
}

.menu {
  position: fixed;
  position-anchor: --trigger;
  position-try-fallbacks: --below-start, flip-block;
}
```

This is a feature illustration, not a universal production recipe. Validate anchor association, fallback syntax, overflow policy, and browser support. Keep the essential menu usable if the CSS feature is unavailable.

## Common mistakes

- Treating the fallback rule as active merely because it is declared; it is selected in the anchor-positioning fallback process.
- Omitting a valid anchor relationship or using a fallback name that is never referenced.
- Assuming experimental syntax will parse consistently across browsers.
- Replacing functional menu behavior with positioning CSS; CSS placement does not implement focus management or dismissal.

## Knowledge checks with answers

1. **What does `@position-try` define?** A named candidate placement for an anchored element's fallback strategy.
2. **Does it implement menu keyboard behavior?** No; it controls CSS layout placement only.
3. **How should an application use it before broad support?** Provide a working baseline, verify target-browser support, and add the feature as progressive enhancement.
