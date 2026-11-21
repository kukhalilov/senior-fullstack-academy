
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Cascading and Inheritance properties

# Scope and version

This reference audits the sole supplied name, `all`. Its definition is in CSS Cascading and Inheritance. The published Level 5 Candidate Recommendation Snapshot is from 13 January 2022; the current Level 5 Editor’s Draft adds clarifications and the newer `revert-rule` CSS-wide keyword. The latter is work in progress: do not assume it is implemented merely because it appears in the current draft. Other familiar values such as `initial`, `inherit`, `unset`, `revert`, and `revert-layer` have their own histories and support characteristics; check the exact target browsers when using rollback values.

`all` is unusual because it accepts only CSS-wide keywords and resets a broad set of properties at once. It does not reset custom properties, `direction`, or `unicode-bidi`. Those exclusions and the effects of the selected keyword are central to using it safely.

# How this group fits the mental model

A CSS declaration normally sets one property. A shorthand sets a coordinated set of subproperties. `all` is a reset shorthand that applies one CSS-wide keyword to nearly all CSS properties on the target element, including properties the author did not name individually. It changes the cascade/defaulting result, not the source declarations: DevTools can still show rules that lost, and declarations in stronger cascade positions may still win.

Its broad reach makes `all` useful for intentionally isolating a component from ambient styles, but dangerous as a casual “make this look normal” tool. For a component reset, decide which inherited values, user-agent defaults, focus styles, display behavior, writing-direction settings, and application custom properties must remain available. A narrowly selected list of declarations is often easier to reason about than resetting every property.

# Supplied names explained

## `all`

**Grammar and model.** The property accepts one CSS-wide keyword, not an ordinary value or a list: `initial | inherit | unset | revert | revert-layer`, plus `revert-rule` in the current Level 5 Editor’s Draft. CSS-wide keywords are used alone; for example, `all: initial color: red` is not a valid combined value. `all` is a shorthand and applies each selected keyword to its resettable subproperties. Those subproperties retain their own applicability, inheritance, computed-value, and animation rules.

**What it resets and excludes.** `all` resets every CSS property except `direction` and `unicode-bidi`; it also does not reset custom properties (including registered custom properties). Therefore a declaration such as `all: initial` does not clear `--theme-color`, change text direction, or neutralize bidirectional isolation/override. To change direction, use the appropriate document-language markup such as HTML `dir` when that expresses the content direction, or set `direction` deliberately where CSS is appropriate. Do not rely on `all` to clean up host-language attributes, event behavior, DOM state, or non-CSS rendering behavior.

**The CSS-wide keyword selected by `all` determines the result:**

- `initial` sets each resettable property to that property’s initial value. It does not mean “the browser’s default look.” For example, `display` may become its initial value `inline`, even on an element that the user-agent stylesheet normally displays as a block. It also blocks ordinary inheritance for reset properties.
- `inherit` makes each resettable property take its parent’s computed value, including properties that normally do not inherit. On the root, inherited values resolve from the property’s initial value.
- `unset` behaves as `inherit` for properties that are inherited by default and as `initial` for non-inherited properties. It therefore does not mean “remove my declaration and go back to the previous rule.”
- `revert` rolls the cascade back to the earlier origin for each property. In author-origin use, it removes the author-origin result for that property so lower-precedence origins such as user and user-agent styles can supply the result. It does not mean `initial`, and it is not limited to one cascade layer.
- `revert-layer` rolls back the current layer’s contribution for each property, allowing an earlier layer within the cascade to supply the value. If there is no lower-precedence declaration in the same origin, rollback can continue to an earlier origin. Layer ordering for important declarations is reversed, so test the actual cascade context.
- `revert-rule` appears in the current Level 5 Editor’s Draft. It rolls back as though the current style rule were absent, rather than rolling back an origin (`revert`) or layer (`revert-layer`). It is a work-in-progress value, so check browser support before using it; the current draft also shows it in conditional `if()` values.

For the rollback keywords, “earlier” is determined by the cascade, not simply by the previous line in the same stylesheet. The computed result may come from another author rule, a user stylesheet, a user-agent stylesheet, or inheritance/defaulting depending on which keyword and declarations are involved.

# Cross-item comparison

| Declaration | What it does to resettable properties | What it does not mean |
| --- | --- | --- |
| `all: initial` | Uses each property’s defined initial value | “Restore the browser’s ordinary element style” |
| `all: inherit` | Forces the parent’s computed value for every resettable property | “Only inherit properties that normally inherit” |
| `all: unset` | Uses inheritance for normally inherited properties; initial values otherwise | “Undo this rule and reveal the earlier declaration” |
| `all: revert` | Rolls back the current cascade origin’s contribution | “Roll back only this layer” |
| `all: revert-layer` | Rolls back the current layer’s contribution | “Remove this entire rule” |
| `all: revert-rule` | Current draft: treats the current style rule as absent | A stable, universally supported reset value |

Every row still leaves custom properties, `direction`, and `unicode-bidi` outside `all`’s reset. `all` also does not remove the declaration from the stylesheet or guarantee that no higher-priority declaration or animation affects the final value.

# Examples

```css
/* Preserve a deliberate, narrow reset rather than clearing every property. */
.widget {
  box-sizing: border-box;
  color: CanvasText;
  font: inherit;
}

/* Broad isolation: this also clears normal UA display defaults and typography. */
.isolated-widget {
  all: initial;
  display: block;
  font: inherit;
  color: inherit;
}

/* Remove this layer's values and allow an earlier layer to provide them. */
@layer base, components;
@layer base {
  .card { color: navy; }
}
@layer components {
  .card { all: revert-layer; }
}
```

In the isolated example, `all: initial` resets the element’s `display`, font, color, and other resettable properties; the following declarations then set selected properties again. Any custom properties on the element remain, as do its `direction` and `unicode-bidi` values. The `revert-layer` example is deliberately layer-dependent: if an earlier layer has no declaration for a property, normal cascade/defaulting determines its result. Do not copy broad reset examples without checking focus, native control appearance, writing direction, forced colors, and user styles in the component’s actual context.

# Common mistakes

- Treating `all` as a conventional shorthand with arbitrary values. It accepts CSS-wide keywords only.
- Saying `all: initial` restores user-agent styles. It sets resettable properties to their formal initial values and can erase UA defaults such as block display.
- Assuming `all` clears `--custom-property` values. Custom properties are explicitly excluded, including registered properties.
- Assuming `all` changes `direction` or `unicode-bidi`. Both are excluded; direction is often better expressed through host-language markup.
- Treating `unset`, `revert`, and `revert-layer` as synonyms. They perform defaulting, origin rollback, and layer rollback, respectively.
- Assuming `revert` means “go to the browser default.” User styles and cascade origins can affect the result.
- Assuming `revert-layer` always reveals a value in an earlier author layer. If there is no lower-precedence same-origin declaration, the cascade can fall back to another origin/defaulting.
- Treating `revert-rule` as established syntax because it appears in the current Editor’s Draft. It is a newer work-in-progress keyword and needs explicit support checks.
- Expecting `all` to erase user-agent behavior, markup attributes, browser state, or declarations with greater cascade priority.
- Applying `all: unset` or `all: initial` to interactive controls without restoring keyboard focus, native affordances, text sizing, and contrast.

# Knowledge checks with answers

1. **Does `all: initial` change a custom property such as `--brand`?** No. Custom properties are not reset by `all`.
2. **Why can `all: initial` make a `<div>` display inline?** It resets the `display` property to its formal initial value; the user-agent stylesheet’s usual block display is another cascade declaration.
3. **What is the difference between `unset` and `revert`?** `unset` chooses inherit or initial based on the property’s default inheritance behavior; `revert` rolls back the current cascade origin’s contribution.
4. **Which two CSS properties are explicitly excluded besides custom properties?** `direction` and `unicode-bidi`.
5. **How do `revert-layer` and `revert-rule` differ?** `revert-layer` ignores the current layer’s contribution; the current draft’s `revert-rule` ignores the current style rule. Check support before using the newer value.
6. **Is `all: initial` a complete component reset?** No. It leaves custom properties, direction, and Unicode bidi settings untouched, and it does not erase markup, browser state, or higher-priority cascade effects.

# Sources

- [CSS Cascading and Inheritance Level 5 Editor’s Draft](https://drafts.csswg.org/css-cascade-5/) — §3.2 `all`, §§4–7 value processing, defaulting and rollback keywords, and the `revert-rule` addition; work in progress.
- [CSS Cascading and Inheritance Level 5 Candidate Recommendation Snapshot](https://www.w3.org/TR/2022/CR-css-cascade-5-20220113/) — published snapshot predating the `revert-rule` addition; useful for separating stable published text from current draft changes.
- [CSS Custom Properties for Cascading Variables Level 1](https://www.w3.org/TR/css-variables-1/) — custom-property exclusion.
- [CSS Writing Modes Level 3](https://www.w3.org/TR/css-writing-modes-3/) — directionality and markup relationship.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity context, not browser support.
- [MDN: `all`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/all) — compatibility cross-check; the specification is the source for exact cascade semantics.
