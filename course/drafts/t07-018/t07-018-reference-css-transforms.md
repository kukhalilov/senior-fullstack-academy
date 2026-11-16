<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Transforms properties

# Scope and version

This reference explains all 10 supplied names in **CSS Transforms properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 10 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Transforms map an element’s coordinate system in two or three dimensions without changing normal-flow layout. The transform origin and reference box affect the result; transformed elements can establish stacking and containing-block behavior. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `backface-visibility` | The backface-visibility CSS property sets whether the back face of an element is visible when turned towards the user. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backface-visibility) |
| `perspective` | The perspective CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/perspective) |
| `perspective-origin` | The perspective-origin CSS property determines the position at which the viewer is looking. It is used as the vanishing point by the perspective property. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/perspective-origin) |
| `rotate` | The rotate CSS property allows you to specify rotation transforms individually and independently of the transform property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the transform property. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/rotate) |
| `scale` | The scale CSS property allows you to specify scale transforms individually and independently of the transform property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the transform value. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scale) |
| `transform` | The transform CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform) |
| `transform-box` | The transform-box CSS property defines the layout box to which the transform, individual transform properties translate, scale, and rotate, and transform-origin properties relate. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-box) |
| `transform-origin` | The transform-origin CSS property sets the origin for an element's transformations. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-origin) |
| `transform-style` | The transform-style CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style) |
| `translate` | The translate CSS property allows you to specify translation transforms individually and independently of the transform property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the transform value. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/translate) |

# Cross-item comparison

The individual `translate`, `rotate`, and `scale` properties coexist with the `transform` list and are composed in a defined order. `perspective` and `transform-style` affect 3D context; `backface-visibility` controls rendering of a reversed 3D face.

| Item | How to interpret it |
| --- | --- |
| `backface-visibility` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `perspective` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

A hover lift can use a transform while leaving neighboring flow layout in place.

```css
.card { transform: translateY(-4px) scale(1.02); transform-origin: center; }
```

The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Expecting a transform to move neighboring layout content.
- Assuming transform function order is interchangeable.
- Forgetting transformed elements can alter stacking/containing-block behavior.
- Using transforms for text scaling when zoom/reflow is required.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `backface-visibility`, `perspective`, `perspective-origin`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
