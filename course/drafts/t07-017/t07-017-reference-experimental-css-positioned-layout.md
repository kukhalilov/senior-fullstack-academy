# CSS layout flexbox grid positioning and responsive design — Reference: Experimental css positioned layout properties

# Scope and version

This lesson explains the one supplied property, `overlay`, in **Experimental css positioned layout properties**. The current CSS Positioned Layout Level 4 Editor’s Draft defines it, but the draft is work in progress and MDN labels the property experimental and Limited availability (snapshot checked 2026-11-19). Verify compatibility for each target browser. A standards definition is not a deployment guarantee.

# How this group fits the mental model

The top layer is a browser-managed rendering layer above ordinary document stacking contexts. HTML operations such as showing a popover or modal dialog put an element there. `overlay` controls whether an element already in that layer is currently rendered there and lets CSS transitions delay its removal. It does not promote an ordinary element into the layer.

The property has an unusual cascade rule: user-agent important rules control its value. Authors do not set `overlay: auto` or `overlay: none` as an ordinary style. Authors can name `overlay` in a transition, opt into its discrete transition, and coordinate opacity, transforms, and `display` around the browser-controlled change.

# Supplied names explained

| Exact supplied property | Grammar and behavior |
| --- | --- |
| `overlay` | `none \| auto`; initial `none`; applies to all elements; not inherited; computed value is as specified. If the element is in the top layer, `auto` renders it there and `none` does not. The user agent controls the value. `overlay` has special discrete transition behavior: when transitioning to or from `none`, the visible `auto` state is retained for the transition’s duration. To start a transition for this discrete property, include it in the transition list with `allow-discrete`. |

# Cross-item comparison

Top-layer membership and top-layer rendering are related but distinct. HTML places a popover or modal dialog in the document’s top layer; the rendering status follows the UA-controlled `overlay` value. While an overlay transition is running, an element being hidden can remain rendered in the top layer until the transition allows removal. Ordinary `z-index` cannot move an element above the top layer.

Three pieces often work together for a smooth entry and exit: `@starting-style` supplies a start style when an element first becomes rendered; discrete transitions on `display` keep it rendered long enough to animate; and `overlay` delays removal from the top layer. These solve different parts of the transition. `overlay` alone does not create a visible fade or scale effect.

# Examples

This popover uses the HTML popover mechanism for top-layer membership. The `overlay` declaration appears only in `transition`; the UA controls its actual value. `@starting-style` enables an entry transition, and discrete `display` transition keeps the popover rendered during exit.

```html
<button popovertarget="help">Show help</button>
<div id="help" popover>Help text</div>
```

```css
#help {
  opacity: 0;
  transform: translateY(-0.25rem);
  transition:
    opacity 160ms,
    transform 160ms,
    display 160ms allow-discrete,
    overlay 160ms allow-discrete;
}

#help:popover-open {
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  #help:popover-open {
    opacity: 0;
    transform: translateY(-0.25rem);
  }
}
```

Check reduced-motion preferences and test the popover’s keyboard, focus, dismissal, and fallback behavior separately. Animation is decoration; it must not become the only way to expose or dismiss the content.

# Common mistakes

- Assuming `overlay` puts an element in the top layer. Use the appropriate HTML or browser API.
- Trying to author-set `overlay: auto`; the user agent controls this property.
- Forgetting `allow-discrete`, so a transition for `overlay` or `display` does not start.
- Omitting `display` from an entry/exit transition and then wondering why an element disappears before its exit effect is visible.
- Omitting `@starting-style` when an entry transition must begin from a defined state on first rendering.
- Assuming the UA-controlled overlay transition itself fades or scales the element. Animate visual properties such as `opacity` or `transform` separately.
- Treating draft syntax or the MDN support snapshot as universal browser support.

# Knowledge checks with answers

1. **What are the two `overlay` values?** `none` and `auto`. `auto` renders an element in the top layer only when it has been placed there; `none` does not.
2. **Can author CSS promote a normal element by declaring `overlay: auto`?** No. Top-layer membership is managed by platform operations, and user-agent important rules control the overlay value.
3. **Why include `overlay` in a transition?** With `allow-discrete`, removal from the top layer can wait for the transition so the exit animation remains visible.
4. **Why might `display` and `@starting-style` also be needed?** `display` keeps the element rendered through entry and exit; `@starting-style` supplies the missing initial style when the element first becomes rendered.
5. **Does an overlay transition create a fade?** No. It coordinates top-layer rendering; animate `opacity`, `transform`, or other visual properties separately.

# Sources

- [CSS Positioned Layout Module Level 4, Editor’s Draft](https://drafts.csswg.org/css-position-4/) — §3.3–3.4 defines top-layer membership, the `overlay` values, UA control, and transition behavior. Work in progress.
- [CSS Transitions Module Level 2, Editor’s Draft](https://drafts.csswg.org/css-transitions-2/) — §§2.1, 2.5–2.6 define discrete transition opt-in using `allow-discrete`. Work in progress.
- [HTML Living Standard: popovers](https://html.spec.whatwg.org/multipage/popover.html) — HTML popover behavior and top-layer rendering.
- [MDN `overlay` reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overlay) — grammar, practical transition example, maturity, and compatibility table.
