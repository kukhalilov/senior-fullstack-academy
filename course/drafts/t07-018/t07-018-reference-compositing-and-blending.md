<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Compositing and Blending properties

# Scope and version

This reference audits the three supplied properties: `background-blend-mode`, `isolation`, and `mix-blend-mode`. The published Compositing and Blending Level 1 document is a 2024 Candidate Recommendation Draft; its current Level 1 Editor’s Draft is dated 8 October 2026. The current Level 2 Editor’s Draft, dated 13 December 2025, introduces `plus-lighter` as an additional `mix-blend-mode` value and uses that extended property value type for `background-blend-mode`. These are evolving drafts; the value extension is not a promise of uniform browser support.

This lesson focuses on the CSS properties, not the full Canvas `globalCompositeOperation` API or every Porter–Duff compositing operator. In particular, `plus-lighter` in the Level 2 draft is a compositing operator exposed as a property value for blending use; the Canvas operator list is a separate grammar and includes additional names such as `source-over` and `destination-in`.

# How this group fits the mental model

The browser paints elements in an order and combines each source graphic with a backdrop. **Blending** calculates how overlapping colors mix. **Compositing** combines the source and backdrop, including their alpha, to produce the resulting image. A **group** is an intermediate rendering of content; a **stacking context** determines which content is grouped and where that group participates in paint order.

The three properties answer different questions. `background-blend-mode` blends an element’s own background layers and background color. `mix-blend-mode` blends an element’s rendered content with the content behind it in the relevant stacking context. `isolation` controls whether an element establishes an isolated group/stacking context so descendants do not blend through to the outside backdrop. These effects happen after layout has sized and positioned the elements; they do not rearrange DOM order or replace layout properties.

# Supplied names explained

## Blend modes shared by the two blending properties

The Level 1 `<blend-mode>` grammar has these 16 keywords. They describe color mixing, not the full list of Porter–Duff compositing operators.

| Value | Practical effect |
| --- | --- |
| `normal` | No blend formula; the source color is used before ordinary alpha compositing. |
| `multiply` | Multiplies source and backdrop components; it darkens, white leaves the backdrop unchanged, black produces black. |
| `screen` | Inverse-style multiplication that lightens; black leaves the backdrop unchanged, white produces white. |
| `overlay` | Combines multiply and screen based on the backdrop color, preserving its highlights and shadows. |
| `darken` / `lighten` | Selects the darker / lighter value per color component. |
| `color-dodge` | Brightens the backdrop according to the source; black source leaves it unchanged. |
| `color-burn` | Darkens the backdrop according to the source; white source leaves it unchanged. |
| `hard-light` | Uses multiply or screen according to the source color; a harder spotlight-like contrast effect. |
| `soft-light` | Source-dependent darkening or lightening with a softer effect than hard-light. |
| `difference` | Uses the absolute difference between source and backdrop components; white inverts and black leaves the backdrop unchanged. |
| `exclusion` | Similar to difference but with lower contrast. |
| `hue` | Uses source hue with backdrop saturation and luminosity. |
| `saturation` | Uses source saturation with backdrop hue and luminosity. |
| `color` | Uses source hue and saturation with backdrop luminosity; useful for tinting while retaining backdrop lightness. |
| `luminosity` | Uses source luminosity with backdrop hue and saturation; the inverse component choice of `color`. |

These descriptions are visual intuition, not a substitute for the specification’s per-channel equations. Results depend on the exact source, backdrop, alpha, color values, paint order, and group boundaries.

## `background-blend-mode`

**Role and definition.** This non-inherited property chooses the blend mode for each background layer of an element. Its initial value is `normal`; it applies to HTML elements. A comma-separated list is matched in order to `background-image`: the first mode applies to the topmost (first-listed) image layer. If there are too few mode values, the list repeats to cover the image layers; excess values do not create additional images.

Each background layer blends with the layer below it and ultimately with the element’s own background color. The background group is isolated: these layers do **not** blend with arbitrary content painted behind the element. For a single image, one mode is enough. With multiple images, use one mode per layer when distinct effects are intended.

The `background` shorthand resets `background-blend-mode` to its initial value. Therefore a later `background: ...` declaration can erase a previously declared blend mode even though `background-blend-mode` is not written in that shorthand.

In the current Level 2 Editor’s Draft, the value type is tied to `mix-blend-mode`, which adds draft-only `plus-lighter`; check support before using that extension with background layers.

## `mix-blend-mode`

**Role and definition.** This non-inherited property blends an element’s rendered content with its backdrop: the already-painted content behind it in the relevant stacking context. Its initial value is `normal`, and its value is one `<blend-mode>` keyword. Any value other than `normal` creates a stacking context for the element, which is then composited with the containing stacking context.

Its effect is not limited to the element’s text fill or background color; it concerns the element’s rendered content as a group. The backdrop can include multiple painted siblings/ancestors underneath it, subject to stacking-context and isolation boundaries. It does not change which node is before another in the DOM, but changing stacking contexts can change the paint result.

The Level 2 Editor’s Draft extends the grammar with `plus-lighter`. That operator can help construct a cross-fade when overlapping elements animate opacity in opposite directions: ordinary source-over stacking can dim or change alpha during the fade. It is not one of the 16 Level 1 blend formulas, and support should be checked independently.

## `isolation`

**Role and definition.** This non-inherited property accepts `auto | isolate`; its initial value is `auto`. `isolate` creates a stacking context and an isolated group. `auto` does not itself request isolation, but an element that creates a stacking context for another reason is rendered as an isolated group under the compositing model.

Isolation controls the backdrop boundary for blending, not visibility or clipping. A child with `mix-blend-mode` can blend with content inside its isolated ancestor’s group; it does not blend through that boundary with page content outside it. Conversely, putting `isolation: isolate` on an ancestor may prevent a child’s blend from interacting with the outer page background. The background layers of an element and HTML `<img>` image content are isolated groups by specification even without explicitly setting this property.

# Cross-item comparison

| Intended interaction | Property | Backdrop/content relationship |
| --- | --- | --- |
| Blend background images with each other and the element’s own background color | `background-blend-mode` | Per-layer blend list; isolated from content behind the element |
| Blend an element’s rendered content with what is painted behind it | `mix-blend-mode` | Uses the backdrop within its relevant stacking context; non-`normal` creates a stacking context |
| Keep a blending subtree from reaching outside its group | `isolation: isolate` | Creates an isolated group/stacking context that bounds descendant blending |
| Change opacity of an entire rendered group | `opacity` (related, not in this inventory) | Applies alpha to the group and can itself create a stacking context; not equivalent to a color blend mode |

Do not confuse `blend-mode` keywords with Porter–Duff operators. The 16 blend modes determine a color-mixing formula; compositing operators such as `source-over`, `source-in`, `destination-out`, and `xor` determine how source and backdrop coverage/alpha combine. Those operators are available in Canvas APIs and the Level 2 compositing model, not as ordinary Level 1 `mix-blend-mode` keywords.

# Examples

```css
/* Blend a top gradient with a photo below it, then with this box's color. */
.hero {
  background-color: #172033;
  background-image:
    linear-gradient(rgb(20 40 80 / 35%), rgb(20 40 80 / 35%)),
    url("hero.jpg");
  background-blend-mode: multiply, normal;
}

/* Blend a badge with the page backdrop, but constrain it to this component. */
.promo-card {
  isolation: isolate;
}

.promo-card__badge {
  mix-blend-mode: screen;
}

/* Level 2 draft example: consider support and alpha behavior before use. */
.crossfade-to {
  mix-blend-mode: plus-lighter;
}
```

The first `background-blend-mode` item corresponds to the first (topmost) `background-image` layer. The `promo-card` creates a boundary so its badge’s screen blend does not reach into unrelated page content. Inspect the actual paint order and all possible backgrounds; blend output may alter contrast enough to make text unreadable. Keep a solid background fallback and verify text, controls, forced-colors behavior, and target browser output.

# Common mistakes

- Expecting `background-blend-mode` to blend the element’s background with a sibling or page background. Its layers blend with one another and the element’s own background color inside an isolated group.
- Expecting `mix-blend-mode` to alter only a background image. It operates on the element’s rendered content, while `background-blend-mode` handles its background layers.
- Assuming `isolation: isolate` means “hide overflow,” “clip children,” or “make the element transparent.” It creates a group/stacking context; clipping and alpha are separate controls.
- Assuming `isolation: auto` removes isolation caused by opacity, transform, or another stacking-context trigger. Existing stacking contexts are isolated groups under the compositing model.
- Forgetting that a non-`normal` `mix-blend-mode` itself creates a stacking context and therefore can change the backdrop seen by nested or neighboring blends.
- Assuming blend modes make a color transparent. A blend mode changes the mixing formula; alpha compositing still determines how source coverage combines with the backdrop.
- Using `opacity` on a parent to fade only its background. Group opacity affects the rendered group, including text and descendants; use alpha in the relevant background color when only that color should be translucent.
- Forgetting that the `background` shorthand resets `background-blend-mode`.
- Treating `plus-lighter` as one of the 16 Level 1 blend modes or assuming the newer Level 2 value is supported in all browsers.
- Choosing a blend mode based on one screenshot without checking alternate content, color schemes, images, forced-colors, contrast, and stacking contexts.
- Confusing CSS blend modes with Canvas Porter–Duff `globalCompositeOperation` values.

# Knowledge checks with answers

1. **A gradient should tint only the photo backgrounds of a card. Which property should you start with?** `background-blend-mode`; its layers blend with the card’s background color, not arbitrary content behind it.
2. **Why can `mix-blend-mode: multiply` behave differently after adding `opacity: .9` to an ancestor?** Opacity creates a stacking context/group, changing the blend backdrop and isolating descendants from content outside that group.
3. **What does `isolation: isolate` do for a child blend?** It bounds the child’s blending to the isolated group so it does not blend through to the outer backdrop.
4. **What happens when `background-image` has three layers but `background-blend-mode` has one value?** That value repeats to supply a mode for each image layer.
5. **Does `mix-blend-mode: screen` set alpha to screen or make the element semi-transparent?** No. It changes color mixing; compositing still applies the source and backdrop alpha.
6. **Which Level 2 draft value is designed for some cross-fade uses, and what caveat applies?** `plus-lighter`; it is a newer draft value and needs a target-browser support check.
7. **Name one blend mode and one Porter–Duff operator.** `multiply` is a blend mode; `source-over` is a compositing operator used by Canvas, not a Level 1 `mix-blend-mode` keyword.

# Sources

- [Compositing and Blending Level 1 Editor’s Draft](https://drafts.csswg.org/compositing-1/) — §3 property definitions, layer behavior, isolation, backdrop rules, and blend-mode algorithms; work in progress.
- [Compositing and Blending Level 1 Candidate Recommendation Draft](https://www.w3.org/TR/compositing-1/) — published Level 1 snapshot and property behavior cross-check.
- [Compositing and Blending Level 2 Editor’s Draft](https://drafts.csswg.org/compositing-2/) — `plus-lighter` extension and current draft property grammar; work in progress.
- [CSS Backgrounds and Borders Level 3 Editor’s Draft](https://drafts.csswg.org/css-backgrounds/) — background layers and shorthand reset interactions; work in progress.
- [MDN: `background-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/background-blend-mode), [MDN: `isolation`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/isolation), and [MDN: `mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mix-blend-mode) — compatibility cross-checks; draft extensions still require browser verification.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — standards maturity context, not a support guarantee.
