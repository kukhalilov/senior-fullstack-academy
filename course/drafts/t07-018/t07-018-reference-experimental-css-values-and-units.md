<!-- GENERATED DRAFT: manually fact-checked against linked CSSWG and W3C sources; remains in drafts pending overall curriculum release. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Values and Units experimental properties

## Scope and version

This reference covers exactly two inventoried properties: `interpolate-size` and `link-parameters`. They are unrelated features grouped together because both are experimental or evolving CSS platform additions. `interpolate-size` controls whether a sizing property can animate between a numeric size and a context-appropriate intrinsic sizing keyword. `link-parameters` passes CSS values from an embedding element to a linked resource such as an external SVG so that the resource can consume them through `env()`.

As of 19 November 2026, `interpolate-size` is defined in CSS Box Sizing Module Level 4. The current Editor’s Draft records its transfer from CSS Values and Units Level 5; older references may therefore still link to Values and Units. MDN marks it Experimental and Limited availability. `link-parameters` is defined in CSS Linked Parameters Module Level 1, whose First Public Working Draft was published 3 November 2026; this is an early, evolving proposal, not a stable cross-browser feature. MDN likewise marks it Experimental and Limited availability. Check current support for the exact browser versions and behavior you intend to ship.

## How this group fits the mental model

CSS layout often has to calculate a size from content rather than from a fixed number. Values such as `auto`, `min-content`, and `max-content` represent sizing algorithms or content-dependent results; they are not ordinary lengths. Historically, a transition from `height: 0` to `height: auto` was discrete: the box snapped between endpoints. `interpolate-size` is an opt-in for certain transitions between a `<length-percentage>` and a sizing keyword, so CSS can interpolate intermediate sizes while layout responds to the content.

A linked image or document is also a separate styling context. An outer page generally cannot select into an external SVG loaded by `<img>` or make ordinary CSS inheritance cross that resource boundary. `link-parameters` is a proposal for explicitly passing named values across that boundary; the linked resource can read them as environment variables. This is a narrow theming/customization channel, not general DOM access, arbitrary selector reach-through, or script messaging.

## Supplied names explained

### `interpolate-size`

**Grammar:** `numeric-only | allow-keywords`, plus CSS-wide keywords. **Initial:** `numeric-only`. **Applies to:** all elements. **Inherited:** yes. **Computed value:** as specified. **Animation type of the property itself:** not animatable.

`numeric-only` preserves the ordinary behavior: a sizing keyword does not become interpolable with a `<length-percentage>` just because a transition is declared. Compatible `calc-size()` values can still interpolate under their own rules.

`allow-keywords` opts into interpolation when one endpoint is a `<length-percentage>` and the other is a size keyword valid for that sizing property. It does not mean every pair of sizing values can be blended. In particular, two different intrinsic sizing keywords generally remain non-interpolable because changing between them can change the layout algorithm, not just a numeric size. The keyword is interpreted in the context of the property: `content`, for example, is relevant to `flex-basis`; other keywords are only usable where their property grammar allows them. `calc-size()` provides a more explicit way to calculate from a sizing keyword and may be useful when interpolation needs arithmetic or special handling.

Example: opt in only for a component that reveals content, and make its open state usable by hover and keyboard focus:

```css
.disclosure__body {
  height: 0;
  overflow: clip;
  interpolate-size: allow-keywords;
  transition: height 220ms ease;
}

.disclosure:hover .disclosure__body,
.disclosure:focus-within .disclosure__body {
  height: auto;
}
```

With support, a length-to-`auto` transition can interpolate to the content-dependent size. Without support, the declared sizing values still govern layout, but the change may snap. This is progressive enhancement, not a guarantee of smooth motion. Use a real disclosure control and preserve access to the content; CSS hover alone is not an accessible interaction model. Respect reduced-motion preferences for nonessential transitions.

Because the property inherits, setting it on `:root` can opt an entire page in. That scope may affect transitions throughout the site, including legacy ones that expected keyword changes to snap. Prefer a component-level declaration unless page-wide behavior is intentional and tested. The computed value on the element when the transition begins is the relevant value; changing the property after an animation has started does not retroactively restart it.

### `link-parameters`

**Grammar:** `none | <param()>#`, plus CSS-wide keywords. The `#` means one or more comma-separated `param()` functions. **Initial:** `none`. **Applies to:** all elements and pseudo-elements. **Inherited:** no. **Computed value:** as specified. **Animation:** discrete.

A parameter has a name and a value. The name can be the predefined `color` or `accent-color`, or a custom dashed name such as `--icon-fill`; a custom name can optionally have a `<css-type>`. In the current CSS Linked Parameters draft, the shared function grammar is:

```css
param() = param(<param-spec> [ ':' <declaration-value>? ]?)
<param-spec> = color | accent-color | [<dashed-ident> <css-type>?]
```

Examples of the colon form in the draft:

```css
param(color: rebeccapurple)
param(--icon-fill: tomato)
param(--theme-color <color>: currentcolor)
param(--optional:)
param(--icon-fill)
```

For `color` and `accent-color`, the type is `<color>`. If their explicit value is omitted, the value comes from the corresponding property on the source element. For a custom dashed name, an explicit value is passed; if omitted, its value is taken from the matching custom property on the source element. A trailing colon with no value explicitly supplies an empty value; omitting the colon and value means use the source element’s matching property/custom property. When a type is given, the value is parsed as that type and an invalid typed parameter is ignored. Values that need an element context to resolve (for example, a custom property used as the default) cannot be resolved if no such context exists and are ignored.

There are three parameter-delivery routes in the draft:

1. **The `link-parameters` property:** attaches parameters to the external resource represented by the element, when applicable, and to external resources used by CSS properties on that element. All of that element’s linked images can receive the list, even if a particular resource does not use every name.
2. **A `param()` URL modifier:** attaches parameters to one URL, useful when the element has multiple resources or the same resource is used with different settings. The draft’s syntax is `url("icon.svg" param(--icon-fill: tomato))`.
3. **A URL fragment directive:** `icon.svg#:~:param(--icon-fill:tomato)`. The directive is URL-decoded and parsed as a `param()`; malformed directives are ignored. URL encoding rules still matter.

If parameters arrive through more than one route, the draft appends them in this order: property values, URL fragment directives, then URL-modifier values. If a name occurs more than once, the last value in the combined list wins. Do not confuse this precedence rule with CSS cascade order; it is how a resource’s parameter list is assembled.

In a linked CSS-aware resource, `env(--icon-fill, currentColor)` can read a passed custom parameter. The draft also gives the standard names `color` and `accent-color` special effects for a linked resource’s initial properties and SVG user-agent styles. Custom parameter values need a useful fallback in the SVG/resource so that the asset remains usable when no parameter is supplied or the feature is unsupported.

```css
.brand-icon {
  color: rebeccapurple;
  link-parameters: param(--icon-fill: currentcolor);
}
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="env(--icon-fill, currentColor)" d="..." />
</svg>
```

The SVG’s `env()` fallback keeps a default fill. Where the environment variable is not defined, the fallback is used. This mechanism does not rewrite the SVG file and does not let the outer stylesheet target arbitrary nodes inside it.

## Examples

### Transition a panel to its content size

```css
:root {
  interpolate-size: allow-keywords;
}

.panel {
  height: 0;
  overflow: clip;
  transition: height 180ms ease;
}

.panel[data-open="true"] {
  height: max-content;
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    transition-duration: 0.01ms;
  }
}
```

This uses a document-wide opt-in to demonstrate inheritance. For a production component, scope the opt-in if other keyword-size transitions should retain their prior behavior. If support is unavailable, expect the panel’s size to change discretely; the `data-open` state and content must still work.

### Pass a theme value only to one background resource

```css
.icon {
  background-image: url("icon.svg" param(--icon-fill <color>: var(--brand-color, navy)));
}
```

This applies the parameter to that URL rather than every external resource on the element. The linked SVG must opt in by using a matching environment variable, such as `fill: env(--icon-fill, navy)`. Because the feature is an early draft, keep a normal SVG fallback, alternate asset, or inline SVG strategy for target browsers that do not implement it.

## Cross-item comparison

| Need | `interpolate-size` | `link-parameters` |
| --- | --- | --- |
| Problem addressed | Smooth interpolation between a length/percentage and a compatible intrinsic sizing keyword | Explicitly pass values into a linked CSS-aware resource |
| Where it acts | Sizing-property animation/transition behavior in the source document | At a resource boundary, with values consumed inside the linked resource |
| Main opt-in | `interpolate-size: allow-keywords` | `link-parameters: param(...)`, a URL `param()` modifier, or a fragment directive |
| Key limitation | Does not make every keyword pair interpolable; depends on property grammar and implementation | Early draft; not general inheritance or selector access into the resource |

Neither feature is a substitute for ordinary layout or for the other feature. Use regular lengths when exact animation endpoints are required; use inline SVG or another established theming strategy when cross-browser resource styling is required today.

## Common mistakes

- Assuming `interpolate-size: allow-keywords` makes `auto` animate to every other intrinsic keyword. It only enables compatible length/percentage-to-keyword interpolation under the sizing rules.
- Expecting `interpolate-size` to animate itself. The property is not animatable; it changes how eligible sizing values can interpolate.
- Setting `interpolate-size` on `:root` without checking inherited effects on the rest of the site.
- Treating `calc-size()` and `interpolate-size` as synonyms. `calc-size()` expresses a calculation based on a size keyword; it can support more specialized arithmetic cases.
- Expecting `link-parameters` to be inherited. It is not; it is attached to the source element and its relevant resources.
- Assuming the outer page’s selectors or custom properties automatically cross into an external SVG. The resource has to consume passed values through the defined mechanism (for example, `env()`).
- Confusing `param(--x:)` (explicitly empty) with `param(--x)` (use the source element’s `--x` value).
- Applying a property-level parameter list when only one image should receive the value. A `param()` URL modifier has narrower scope.
- Relying on the linked-parameters draft for a required brand or accessibility signal without an implementation fallback.
- Assuming latest MDN examples always match the newest CSSWG syntax: this module is a new draft and syntax can evolve; follow its current official draft for grammar.

## Knowledge checks with answers

1. **What does `allow-keywords` add?** It permits eligible transitions between a `<length-percentage>` and a size keyword valid for that sizing property.
2. **Does it enable interpolation between `auto` and `max-content`?** No, not merely by enabling this property; two distinct intrinsic sizing keywords generally remain non-interpolable.
3. **Why does `interpolate-size` inherit?** It lets an opt-in set on an ancestor, including `:root`, apply to descendant sizing transitions; scope it carefully.
4. **What does `link-parameters` send?** Named CSS values to an external resource that can use them as environment variables, according to the linked-parameters model.
5. **What is the difference between `param(--brand)` and `param(--brand:)`?** The former takes the source element’s `--brand` value; the latter explicitly sends an empty value.
6. **How are duplicate parameter names resolved across delivery routes?** The values are appended in the defined route order, and the last value for the same name is used.
7. **Does `link-parameters` let page CSS select into an external SVG?** No. It passes explicitly named values; the resource itself must use them.
8. **Which feature is at the earlier maturity stage?** `link-parameters`, whose latest published specification is a First Public Working Draft; both features still require support checks.

## Sources

- [CSS Box Sizing Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-sizing-4/) — current `interpolate-size` grammar, interpolation behavior, inheritance, compatibility rationale, and transfer history.
- [CSS Linked Parameters Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-link-params/) — exact current `param()` grammar, property definition, delivery methods, resolution/precedence behavior, resource consumption, and security considerations.
- [CSS Linked Parameters Module Level 1 First Public Working Draft, 3 November 2026](https://www.w3.org/TR/css-link-params-1/) — published status and maturity.
- [MDN `interpolate-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size) — secondary syntax, behavior, and browser support summary.
- [MDN `link-parameters`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/link-parameters) — secondary property summary and support caveat; verify syntax against the newer CSSWG draft.
