# CSS selectors at-rules cascade values and box model — Reference: Experimental, draft, and legacy CSS at-rules

## Scope and version

This reference covers the draft, nonstandard, and legacy at-rules added to the pinned inventory after checking the current [MDN at-rule index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules), [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/), and current CSS Working Group drafts. A name appearing in MDN or an editor's draft does not mean it is standardized or broadly implemented. The Snapshot organizes specifications by maturity, not browser support; check compatibility for each feature.

## How this group fits the mental model

These rules represent different stages and kinds of CSS work. `@position-try` describes alternate geometry for anchor-positioned boxes. `@color-profile` associates a name with an external color profile. `@custom-media` names a media-query expression. `@function` proposes reusable typed computations in CSS. `@when` and `@else` propose conditional rule chains. `@document` is a deprecated, nonstandard legacy feature. Their shared `@` spelling does not make their status or purpose interchangeable.

## Supplied names explained

### Current editor-draft features

- **`@position-try`** — Defines a named position option, written with a dashed identifier, containing only the positioning and sizing declarations permitted by the Anchor Positioning specification. A positioned box refers to the option through `position-try-fallbacks` (or the `position-try` shorthand); the browser evaluates options according to the fallback order and overflow rules. It requires a valid anchor-positioning setup and is not a general-purpose conditional rule. The rule rejects unsupported declarations; `!important` makes the declaration it annotates invalid rather than invalidating the entire rule.
- **`@color-profile`** — Names a color profile for later use in color values, such as `color(--press-profile ...)`. Its prelude uses a dashed name or the special `device-cmyk` keyword, and its descriptors include `src` and `rendering-intent`. A fetched profile must be a valid supported ICC profile; an invalid profile makes colors that reference it invalid. This remains an evolving specification feature, so do not assume browser or print-workflow support.
- **`@custom-media`** — Defines a dashed-name alias for a media-query list, or an explicit `true`/`false` condition, for later use in media-query boolean contexts. It is a named logical condition, not textual replacement: conditions combine according to media-query logic, and circular aliases fail. This at-rule is specified in Media Queries Level 5, but support is not uniform; preprocessors have historically provided a build-time alternative with different runtime semantics.
- **`@function`** — Defines a custom CSS function whose name begins with `--`, accepts optional typed parameters, and computes a result from CSS values and variables. It is invoked with dashed-function notation, for example `--double(2px)`, in contexts that allow variable substitution. The current CSS Custom Functions and Mixins draft includes parameter/default/type rules, a `result` descriptor, scoping, cascade, evaluation, and cycle handling. This is an editor-draft feature; use a fallback or build-time computation for target browsers that do not support it.
- **`@when`** — In the CSS Conditional Rules Level 5 editor draft, applies a rule list when a boolean condition built from media and supports tests evaluates true. It generalizes separate `@media` and `@supports` wrappers; the rule's presence in a draft does not guarantee parser support.
- **`@else`** — In the same draft, continues a consecutive conditional-rule chain started by `@when` or another non-`@else` conditional group. Only the first matching condition in that uninterrupted chain is selected; a standalone `@else`, or any intervening non-whitespace/non-comment token that breaks the chain, makes it invalid. An omitted condition is the final unconditional branch. This remains draft syntax and must not be used as if it were universally supported.

### Deprecated and nonstandard legacy feature

- **`@document`** — Was proposed to conditionally apply rules by document URL, including URL/prefix/domain/regular-expression functions. MDN marks it deprecated and nonstandard; its remaining Firefox-only support is legacy and restricted for security reasons, while `@-moz-document` had additional restrictions. Do not use either form in production CSS. Use application-level classes, document-specific stylesheets, or another explicit application mechanism instead.

## Cross-item comparison

## Examples

The following examples illustrate syntax from editor drafts; they are not cross-browser production guarantees.

```css
/* CSS Anchor Positioning Level 1 draft */
.trigger { anchor-name: --menu-trigger; }
.menu {
  position: fixed;
  position-anchor: --menu-trigger;
  position-area: block-end span-inline-start;
  position-try-fallbacks: --menu-above;
}
@position-try --menu-above {
  position-area: block-start span-inline-start;
  margin-block-end: 0.5rem;
}

/* Media Queries Level 5 draft */
@custom-media --compact (width < 40rem);
@media (--compact) { .layout { grid-template-columns: 1fr; } }

/* Conditional Rules Level 5 draft: the rules must stay adjacent. */
@when media(width >= 50rem) and supports(display: grid) {
  .layout { display: grid; }
} @else {
  .layout { display: block; }
}
```

For current applications, retain a working baseline and verify each feature independently. Do not assume one feature query can detect all aspects of an experimental feature or protect against implementation bugs.

## Common mistakes

- Assuming every rule listed in an index is a standard with interoperable browser support.
- Putting unrestricted declarations inside `@position-try`; its allowed property set is intentionally constrained.
- Declaring a position option but forgetting to reference it, or failing to establish a usable anchor relationship.
- Treating `@custom-media` as textual substitution, or overlooking cycles and boolean-context requirements.
- Confusing draft `@function` with JavaScript, Sass, or ordinary custom properties; its evaluation timing and scoping are CSS-specific.
- Splitting an `@when`/`@else` chain with another rule or comment-free token, or using a standalone `@else`.
- Treating invalid or unavailable `@color-profile` resources as harmless fallbacks; colors using an invalid profile are invalid.
- Using `@document`/`@-moz-document` in new stylesheets or assuming historical Firefox support is unrestricted.

## Knowledge checks with answers

1. **What selects a named `@position-try` option?** The anchor-position fallback configuration such as `position-try-fallbacks` or the `position-try` shorthand, evaluated under the defined fallback order and overflow rules.
2. **Does `@custom-media` paste media-query text into each use?** No. It defines a named query whose truth is evaluated logically; its use must be in a supported boolean media-query context.
3. **When is `@else` valid in the current draft?** Only as a consecutive continuation of a conditional chain; it is invalid by itself.
4. **Should new application CSS use `@document`?** No. It is deprecated, nonstandard legacy syntax with limited, security-constrained support.

## Sources and maturity

- [MDN CSS at-rules index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules) and [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) establish the reference inventory and explain the difference between specification maturity and browser adoption.
- [CSS Anchor Positioning Level 1 Working Draft](https://drafts.csswg.org/css-anchor-position-1/) §6.4: `@position-try` grammar, permitted declarations, naming, and fallback association.
- [CSS Color Level 5 Editor's Draft](https://drafts.csswg.org/css-color-5/) §5.3: `@color-profile`, its name, profile source, rendering intent, and color use.
- [Media Queries Level 5 Working Draft](https://drafts.csswg.org/mediaqueries-5/) §10: custom media names, boolean evaluation, aliases, and cycle handling.
- [CSS Custom Functions and Mixins Level 1 Editor's Draft](https://drafts.csswg.org/css-mixins-1/) §§2–3: function grammar, typed parameters, results, invocation, and evaluation. This is work in progress.
- [CSS Conditional Rules Level 5 Editor's Draft](https://drafts.csswg.org/css-conditional-5/) §§3–4: draft `@when` and `@else` conditions and chained-rule behavior.
- [MDN `@document`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40document): explicitly marks the feature deprecated and nonstandard, and documents its restricted Firefox-only legacy status.
- [MDN `@color-profile`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40color-profile), [MDN `@custom-media`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40custom-media), [MDN `@function`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40function), and [MDN `@position-try`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40position-try) provide compatibility and author-oriented syntax summaries. Recheck target-browser support before use.
