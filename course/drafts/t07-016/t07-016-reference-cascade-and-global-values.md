# CSS selectors at-rules cascade values and box model — Reference: Cascade layers, value stages, and CSS-wide keywords

## Scope and version

Cascade ordering follows [CSS Cascading and Inheritance Level 6](https://www.w3.org/TR/css-cascade-6/); selector matching and specificity follow [Selectors Level 4](https://www.w3.org/TR/selectors-4/). Practical value resolution is summarized in [MDN property value processing](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Property_value_processing). The exact source inventory for names is in the [CSS manifest snapshot](https://www.w3.org/TR/css-2026/).

## How this group fits the mental model

For each element/property pair, CSS first identifies declarations that are syntactically valid and relevant. The cascade chooses one declaration using origin/importance and context, layer order, specificity, scope proximity, and source order. CSS then resolves the selected declaration through inheritance and value stages. Box sizing and layout determine used geometry; they are downstream of which declaration won.

## Supplied names explained

### Cascade origins, importance, and layers

- **Cascade origin** — The source category of a declaration: user-agent, user, author, animations, and transitions, with element-attached declarations and encapsulation contexts also ordered by the cascade model.
- **User-agent origin** — Browser default styles and internal presentation rules.
- **User origin** — User-provided styles, including accessibility/personal preference styles where applicable.
- **Author origin** — Styles provided by the document/application, such as linked, embedded, inline, or component stylesheets.
- **Transition origin** — Temporary interpolated values produced while a transition is active; transitions have very high cascade precedence during that interval.
- **Importance** — The priority distinction between normal and important declarations; `!important` changes cascade ordering and should be used deliberately.
- **`!important`** — Annotation on a declaration that gives it important status within its origin/context ordering. Important user and user-agent rules can outrank author-important rules; active transitions have higher precedence.
- **Cascade layer** — An ordered bucket within an origin that organizes declarations; normal and important layer order run in opposite directions.
- **Unlayered style rules** — Rules outside explicit layers; for normal declarations in the same origin they outrank explicit layers, while important ordering treats implicit/unlayered placement according to the reversed cascade-layer rules.
- **Cascade order** — The complete ordered decision process: relevance, origin/importance and context, layer order, specificity, scoping proximity, then source order, with transitions and other cascade origins placed by the specification.
- **Specificity** — Selector weight compared after earlier cascade criteria; pseudo-class/function weighting follows the selector's defined rule, not visual complexity.
- **Scoping proximity** — For otherwise tied declarations in scope, preference for the declaration whose scope root is closer to the matched element; it is considered after specificity and before order of appearance.
- **Inheritance** — Value transfer from parent to child for properties that inherit by default or are explicitly told to inherit; it is not the same as cascade conflict resolution on the child.

### Value stages

- **Declared value** — The value written in a declaration that is syntactically valid for the property; multiple declarations may exist.
- **Cascaded value** — The value selected after cascade conflict resolution, or the absence of a winning declaration.
- **Specified value** — The value after applying cascade and defaulting rules, including inheritance or initial values where needed.
- **Computed value** — The specified value processed as far as possible without layout-dependent information, resolving many relative values, variables, and inheritance dependencies.
- **Used value** — The computed value resolved for layout/rendering, including context-dependent dimensions and constraints.
- **Actual value** — The used value after implementation/device limitations or approximations, such as pixel rounding or available rendering capability.

### CSS-wide keywords and declaration shape

- **CSS-wide keyword initial (`initial`)** — Sets the property to its specification-defined initial value, which may differ from browser defaults and is not necessarily inherited.
- **CSS-wide keyword inherit (`inherit`)** — Uses the parent's computed value; can force inheritance for normally non-inherited properties.
- **CSS-wide keyword unset (`unset`)** — Acts as `inherit` for inherited properties and `initial` for non-inherited properties.
- **CSS-wide keyword revert (`revert`)** — Rolls the value back to the prior cascade origin (or user-agent/default behavior as applicable), not merely to the preceding declaration.
- **CSS-wide keyword revert-layer (`revert-layer`)** — Rolls the value back to the previous cascade layer within the same origin/context, allowing a lower-priority layer's value to apply.
- **CSS-wide keyword revert-rule (`revert-rule`)** — Rolls back as if the current matching style rule were absent, allowing the cascade to choose from remaining rules. It is newer and not broadly implemented; it differs from `revert-layer`, which removes a layer's declarations, and `revert`, which rolls back an origin.
- **Shorthand property** — A property that sets several longhand components together; omitted subproperties may reset to their initial values, and shorthand expansion can clear earlier longhand configuration.
- **Longhand property** — An individual property component that can be set independently, though a later shorthand may reset it.
- **Logical property** — Expresses a dimension or side relative to inline/block axes and writing mode, such as inline size or block-start margin.
- **Physical property** — Expresses a fixed top/right/bottom/left or width/height axis independent of writing mode.
- **`box-sizing: content-box`** — The declared width/height describe the content box; padding and border add outside the declared dimensions.
- **`box-sizing: border-box`** — The declared width/height include content, padding, and border; margin remains outside.

## Cross-item comparison

Cascade order chooses a declaration; value processing resolves what that declaration means. Inheritance supplies a child's default only when appropriate; it does not beat a declaration that wins on the child. `initial` selects the property's initial value, `inherit` copies the parent, and `unset` chooses between them based on the property's inheritance behavior. `revert` returns to a prior origin; `revert-layer` returns to a lower layer; `revert-rule` acts as if the current style rule were absent. A shorthand can reset omitted longhands. Logical dimensions adapt to writing modes; physical width/height do not. `content-box` and `border-box` differ only in how the declared dimensions account for padding and border; margin is always outside.

## Examples

```css
@layer reset, components;
@layer components {
  .card { color: navy; margin-inline: 1rem; }
}
.card { color: teal; }

.card--user-theme { color: revert-layer; }
.legacy-control { margin: 0; margin-inline-start: 1rem; }
```

The unlayered normal color wins over the layered normal color. The `revert-layer` example asks the cascade to use a value from a lower layer for that property; inspect the actual layer ordering and other origins before predicting the result. The shorthand `margin: 0` resets all physical margin longhands before the later logical declaration applies.

## Common mistakes

- Saying specificity always wins; it is considered after origin/importance, context, and layer order.
- Assuming `!important` defeats every declaration, including active transitions and user/UA important rules.
- Treating computed, used, and actual values as synonyms for the final visible pixel width.
- Thinking `initial` means the browser's user-agent style; it means the property's CSS initial value.
- Treating `revert-layer` as equivalent to `revert` or as “undo the previous source line.”
- Forgetting that shorthand declarations reset omitted components.
- Mixing physical and logical properties without considering writing mode and cascade order.
- Assuming unlayered important rules have the same layer precedence they have for normal rules.

## Knowledge checks with answers

1. **What happens before specificity is compared?** Relevance and the earlier cascade criteria including origin/importance/context and layer order.
2. **How does `unset` behave?** Like `inherit` for inherited properties, otherwise like `initial`.
3. **What is the main difference between `revert` and `revert-layer`?** Origin-level rollback versus rollback to a lower layer in the cascade.
4. **Does `border-box` include margin?** No; it includes content, padding, and border.
5. **What order follows specificity for scoped rules?** Scoping proximity, then source order when prior criteria tie.
