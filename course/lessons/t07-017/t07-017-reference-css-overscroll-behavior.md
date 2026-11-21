# CSS layout flexbox grid positioning and responsive design — Reference: CSS Overscroll Behavior properties

# Scope and version

This lesson covers exactly the five supplied properties: `overscroll-behavior`, `overscroll-behavior-block`, `overscroll-behavior-inline`, `overscroll-behavior-x`, and `overscroll-behavior-y`. CSS Overscroll Behavior Level 1 is a Working Draft. It defines author control over boundary default actions, but does not require a platform to implement scroll chaining or any particular overscroll affordance. Check browser and input-device behavior for the product you ship.

# How this group fits the mental model

When a scroll container reaches its boundary, a continuing gesture can be handed to an ancestor (scroll chaining), trigger a local visual response such as rubber-banding, or trigger another browser action such as navigation. Overscroll behavior lets an author opt out of selected boundary actions. It does not create scrolling, set scroll positions, or replace `overflow`; the element still needs to be a scroll container for the property to affect scroll input.

# Supplied names explained

All five properties accept `auto`, `contain`, or `none`; they are not inherited, apply to scroll-container elements, and animate discretely. The longhands have initial value `auto`.

| Exact supplied property | Axis and grammar |
| --- | --- |
| `overscroll-behavior` | Shorthand for physical `overscroll-behavior-x` then `overscroll-behavior-y`. One value sets both; two values set x then y. Its initial pair is `auto auto`. |
| `overscroll-behavior-x` | Physical horizontal-axis behavior. |
| `overscroll-behavior-y` | Physical vertical-axis behavior. |
| `overscroll-behavior-inline` | Flow-relative inline-axis behavior; maps to x or y according to `writing-mode`. |
| `overscroll-behavior-block` | Flow-relative block-axis behavior; maps to x or y according to `writing-mode`. |

The values control different sets of boundary actions:

- `auto` leaves the user agent’s usual chaining, overscroll, and navigation behavior available.
- `contain` prevents non-local actions such as chaining to ancestor scrollers or navigation gestures, while allowing local boundary affordances to remain.
- `none` does what `contain` does and also suppresses local overscroll affordances where the platform provides them.

The properties do not decide whether a given operating system implements an affordance. Programmatic scroll operations are clamped and do not trigger boundary default actions.

# Cross-item comparison

Use the shorthand when both physical axes need the same policy. Use x/y when behavior is intentionally tied to screen orientation; use block/inline when it should follow writing mode. Do not mix shorthand and longhands without considering cascade order: the shorthand writes both physical axes, while logical longhands map onto those axes.

For a nested dialog scroller, `contain` often prevents wheel/touch input at its edge from unexpectedly scrolling the page behind it while retaining the platform’s local feedback. `none` is stronger and can remove familiar boundary feedback, so reserve it for cases where that behavior is intentional and usability has been checked.

# Examples

```css
.dialog__body {
  max-block-size: 70vh;
  overflow: auto;
  overscroll-behavior: contain;
}

/* In vertical writing, this follows the logical block axis. */
.reading-pane {
  overflow: auto;
  overscroll-behavior-block: contain;
}
```

Keep keyboard scrolling, focus visibility, and access to all content working. A property declaration alone does not make a region keyboard-accessible or establish modal semantics.

# Common mistakes

- Expecting overscroll behavior to make a non-overflowing box scrollable.
- Confusing `contain` with `none`; only `none` suppresses local boundary affordances as well as non-local actions.
- Assuming the specification forces the browser to provide rubber-banding or chaining; it only controls behavior where available.
- Using physical x/y values in a component whose intended behavior should follow writing mode.
- Applying it globally and unintentionally disabling pull-to-refresh, edge navigation, or other platform gestures.
- Treating script-driven `scrollTo()` as a boundary gesture governed by these values.

# Knowledge checks with answers

1. **What does the two-value shorthand order mean?** Horizontal x first, vertical y second; one value applies to both.
2. **What is the difference between `contain` and `none`?** Both block non-local boundary actions such as chaining. `none` also blocks local overscroll affordances.
3. **Does `contain` guarantee a rubber-band effect?** No. The platform decides whether local affordances exist; `contain` permits them.
4. **What are `overscroll-behavior-block` and `-inline` relative to?** The element’s writing mode, mapping to physical x/y axes.
5. **Does the property make an element scrollable?** No. Overflow and content determine scrollability; overscroll behavior controls boundary actions.

# Sources

- [CSS Overscroll Behavior Module Level 1](https://www.w3.org/TR/css-overscroll-1/) — §§3–4: scroll chains, boundary actions, value semantics, shorthand order, axes, and programmatic scrolling note; this is a Working Draft.
- [CSS Overflow Module Level 3](https://drafts.csswg.org/css-overflow-3/) — scroll containers and scrollports.
- [CSS Writing Modes Level 4](https://www.w3.org/TR/css-writing-modes-4/) — mapping of logical block/inline axes to physical axes.
