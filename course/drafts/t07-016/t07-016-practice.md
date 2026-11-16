# CSS selectors at-rules cascade values and box model — Exercises and worked solutions

## Goals

Trace why CSS matches and wins, compute box dimensions, distinguish value stages, and choose a maintainable way to organize conflicts. The exercises use [CSS Cascading and Inheritance Level 6](https://www.w3.org/TR/css-cascade-6/), [MDN box model guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction), and [MDN property value processing](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Property_value_processing).

## Worked example

```css
@layer reset, components;
@layer components { .panel { width: 20rem; box-sizing: content-box; } }
.panel { width: 22rem; padding: 1rem; border: 2px solid; }
```

The normal unlayered width wins over the layered width, even though both selectors have equal specificity. `content-box` remains from the component layer because no competing declaration changes it. The outer width is `22rem + 2rem padding + 4px border`, assuming the root font size and no additional constraints.

## Exercises

1. A type selector rule and a class selector rule both match the same element and have the same origin, importance, and layer. Which wins, and what if specificity ties?
2. In one author origin, a normal declaration is in a later layer and an important declaration is in an earlier layer. Compare the two layer-order rules for normal versus important declarations.
3. A `:where(.menu) a` rule competes with `.menu a`. Explain the specificity difference.
4. An element has `width: 300px`, 20px padding on both sides, and 1px borders. Compute the border-box width under content-box and border-box sizing.
5. Why might `min-width: auto` or intrinsic content prevent a flex/grid item from shrinking to the apparent available width?
6. A declaration uses a relative unit and a percentage. Explain why the computed value might not equal the final used pixels.
7. A team uses `!important` to fix every conflict. Describe a safer debugging sequence.

## Progressive hints

1. The cascade checks origin/importance and layer before specificity; source order is a late tie-breaker.
2. Important layer order is reversed relative to normal layer order.
3. `:where()` contributes zero specificity, including its argument list.
4. Content-box adds padding and border outside the declared content width; border-box includes them.
5. Intrinsic minimum sizes reflect unbreakable content or an item's intrinsic contribution.
6. Percentages can depend on layout context; used values incorporate layout-specific resolution.
7. Inspect matching declarations, relevance, origin/importance, layers, specificity, scope, source order, then computed/used values.

## Complete solutions

1. The class selector has greater specificity and wins if all earlier criteria tie. If specificity ties, scoping proximity and then order of appearance decide.
2. For normal declarations, the later layer wins. For important declarations, the earlier layer wins; importance changes layer precedence.
3. `:where()` adds zero specificity, so `:where(.menu) a` weighs only the type selector. `.menu a` includes a class plus a type and therefore has greater specificity.
4. With content-box: `300 + 40 + 2 = 342px` outer border-box. With border-box: the border box is 300px; content width is 258px after subtracting padding and borders.
5. The item's minimum contribution can be based on intrinsic content, such as an unbreakable word or image. Setting an appropriate minimum (often zero) may allow shrinking, but verify overflow and readability.
6. A computed value may preserve a percentage or resolve some relative units while waiting for layout. The used value incorporates layout, and the actual output can also reflect device/user-agent constraints.
7. Confirm the selector matches; inspect conditions and cascade origin/importance/layer; compare specificity, scope proximity, and source order; inspect inheritance and CSS-wide keywords; then evaluate computed/used geometry. Fix the source rule or layer design instead of escalating importance by default.

## Tests and edge cases

- Inspect the matched-rule and computed-style panels; toggle one declaration at a time and identify the actual winning rule.
- Check media/supports/container conditions and pseudo-class state before assuming a conflict.
- Test long unbreakable text, localization, zoom, narrow viewports, and non-default writing modes.
- Include border, padding, min/max constraints, intrinsic images, and scrollbar behavior in sizing calculations.
- Verify fallback behavior when a newer selector, at-rule, function, or property is unsupported.
- Distinguish browser layout values from device pixels and screenshot raster dimensions.

## Reflection questions

1. Which cascade stage did you inspect first, and what evidence identified the winner?
2. Which sizing assumption most often makes a width calculation wrong?
3. How would cascade layers reduce the need for high-specificity selectors in a large application?
