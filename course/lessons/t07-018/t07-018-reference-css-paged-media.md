
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Paged Media properties

# Scope and version

This lesson covers the one supplied property, `page`, and the paged-media model it selects a named page within. The current CSS Paged Media Level 3 Editor’s Draft is dated 21 October 2026 and explicitly work in progress. The latest published Level 3 document is the 14 September 2023 Working Draft. The CSS Paged Media specification is not a guarantee that every descriptor or margin-box feature works in every browser or print engine. MDN labels the `page` property Baseline Widely available since February 2023; that property-level status does not establish equal support for the broader `@page` feature set. Verify the final PDF or print output in the renderer and printer path that matters.

# How this group fits the mental model

Paged media turns a continuous document flow into discrete page boxes. Three mechanisms answer different questions:

1. **Which page template?** `page` selects a named page type, and a matching `@page` selector describes that page box.
2. **How is content divided between pages?** CSS Fragmentation properties such as `break-before`, `break-after`, `break-inside`, `orphans`, and `widows` control fragmentation and break opportunities.
3. **What appears on the sheet?** `@page` descriptors configure page geometry and print-related behavior, while nested page-margin at-rules create margin boxes for running headers, footers, and counters.

The page box is the pagination analogue of a viewport, but it is a print/output abstraction: the user agent and print dialog still mediate how the page box maps to paper, PDF, or a paged screen presentation. A named page does not by itself create a new page at every element; it selects a page type and can cause a page break when the page type changes at a qualifying break point. Use fragmentation controls when you need a deliberate break regardless of whether the page type changes.

# Supplied names explained

## `page`

**Purpose and grammar.** `page` names the page type on which a box is to be displayed. Its current grammar is `auto | <custom-ident>` plus CSS-wide keywords. The initial value is `auto`; the computed value is the specified value; the animation type is discrete; it is not inherited. The current Level 3 draft says it applies to boxes that create class A break points. Browser documentation often describes the common case as block-level elements in normal flow; user agents may support additional boxes.

An identifier such as `chapter` names the corresponding page type selected by `@page chapter { ... }`. Page type identifiers are case-sensitive. `auto` is an ASCII case-insensitive CSS keyword, not a custom page name. It is not the same as an omitted declaration in the cascade, and it does not mean “always use the unnamed page” in every conforming implementation.

**How named pages choose boundaries.** At a qualifying class A break point, the pagination model compares the page type required by content before and after the boundary. If those page values differ, a page break is forced and the following content continues on a page box of its named type. If adjacent sections have the same named page, the property alone does not force them onto separate sheets. If every chapter must begin on a fresh page, combine the named page with an explicit fragmentation rule such as `break-before: page` on the chapters after the first.

**The subtle `auto` rule.** The property is formally non-inherited, but the current Level 3 prose resolves `auto` to the nearest ancestor’s non-`auto` value; on the root element it resolves to the empty page name. This special used-value behavior is not ordinary CSS inheritance. The specification also retains a legacy-conformance exception: some implementations may treat `auto` as always naming the empty string due to an older inherited definition. The current draft says this exception is expected to be removed in Level 4 and warns that explicitly setting `auto` below a named-page ancestor can therefore be unpredictable. Avoid depending on that edge case; put the named page on the content box that should select it and test pagination.

**What `page` does not do.** It does not set page dimensions, margins, orientation, headers, footers, or the break policy inside a section. Those belong to `@page` descriptors and margin rules or to CSS Fragmentation. It is also not the HTML `page` concept, a JavaScript print API, or an element selector for a physical paper sheet.

## Related `@page` context (not additional inventory properties)

The `@page` at-rule describes a page box; its selector can be omitted for all pages, a named page type such as `chapter`, or combined with page pseudo-classes including `:first`, `:left`, `:right`, and `:blank`. These selectors match generated pages rather than DOM elements. The page context is not the normal declaration context of a document element.

The current Level 3 draft includes the page descriptors `size`, `page-orientation`, `marks`, `bleed`, and `page-margin-safety`, along with applicable page-context properties. Do not treat descriptors as ordinary CSS properties on the document tree. Nested margin at-rules define up to 16 page-margin boxes: `@top-left-corner`, `@top-left`, `@top-center`, `@top-right`, `@top-right-corner`, `@right-top`, `@right-middle`, `@right-bottom`, `@bottom-right-corner`, `@bottom-right`, `@bottom-center`, `@bottom-left`, `@bottom-left-corner`, `@left-bottom`, `@left-middle`, and `@left-top`. Their support is less uniform than the basic `page` property; test them separately.

The `page` value is one part of the page-selection model, not all of Paged Media. Page counters such as `counter(page)` and `counter(pages)` are commonly placed in margin boxes using `content`; the page counter advances for generated pages, while the total-page counter represents the document’s page count. Running headers can require additional generated-content features and have their own support constraints.

# Cross-item comparison

| Need | Mechanism | What it controls | Example |
| --- | --- | --- | --- |
| Select a named page design | `page` declaration and matching named `@page` selector | Which page type content uses | `section { page: chapter; }` with `@page chapter { ... }` |
| Set paper/page-box geometry | `@page` descriptors | Page size, orientation and page margins | `@page chapter { size: A4 landscape; margin: 18mm; }` |
| Break before/after a particular element | CSS Fragmentation properties | Where the flow must or may split | `break-before: page` |
| Keep content together or control widows/orphans | CSS Fragmentation properties | Fragmentation constraints | `break-inside`, `orphans`, `widows` |
| Add repeated folios or running matter | `@page` margin at-rules and generated content/counters | Header/footer content in page margins | `@bottom-center { content: counter(page); }` |

# Examples

```css
@media print {
  @page {
    size: A4 portrait;
    margin: 18mm 20mm;

    @bottom-center {
      content: "Page " counter(page) " of " counter(pages);
      font: 9pt sans-serif;
    }
  }

  @page chapter {
    size: A4 landscape;
    margin: 18mm;

    @top-center {
      content: "Chapter";
    }
  }

  .chapter {
    page: chapter;
  }

  /* The page name chooses the template; this rule creates the chapter break. */
  .chapter + .chapter {
    break-before: page;
  }

  .avoid-split {
    break-inside: avoid;
  }
}
```

Use a real print preview or produce the final PDF to inspect this result. Printer-safe margins, a user-selected paper size, page scaling, font availability, and unsupported margin boxes can change the output. A CSS declaration being accepted by the parser is not proof the page engine honors it.

# Common mistakes

- Assuming `page: chapter` creates a fresh page before every matching section. It changes the page type; use an explicit break when a fresh page is required.
- Defining `page: chapter` without a matching `@page chapter` rule and expecting custom size or margins to appear.
- Putting page descriptors such as `size` in a normal element rule, or putting normal element declarations in the wrong page/margin context.
- Treating page selectors such as `:left` or `:first` as DOM pseudo-classes that select elements.
- Confusing the `page` property with `@page`, the page-size descriptor, `break-before`, or the browser print API.
- Assuming formally non-inherited `page` behaves exactly like a typical non-inherited property when its value is `auto`; Level 3 retains a compatibility exception.
- Assuming baseline support for `page` guarantees support for `@top-center`, page counters, `page-orientation`, bleed, or every descriptor.
- Validating only in continuous screen media. Pagination, widows/orphans, forced breaks, and printer margins change the result.
- Forcing a break before every item without checking whether the first item receives an unwanted leading blank page.
- Hiding essential content or relying on background printing; user settings and print dialogs can omit backgrounds.

# Knowledge checks with answers

1. **What declaration chooses a landscape chapter page, and what declaration defines that page’s shape?** `page: chapter` chooses the named type; `@page chapter { size: A4 landscape; ... }` defines its page box.
2. **Will two adjacent elements with `page: chapter` necessarily start on separate sheets?** No. The matching page type alone does not force a break between them; use a fragmentation property such as `break-before: page` when needed.
3. **Why is `page: auto` under a named-page ancestor a portability concern?** Level 3’s current used-value rule resolves it through the ancestor, but a legacy compatibility exception allows implementations to treat `auto` as an empty name. Avoid depending on that case.
4. **Where should a repeated page number be declared?** In a page-margin at-rule inside `@page`, using generated content such as `content: counter(page)`; verify margin-box support in the target renderer.
5. **Does “Baseline Widely available” for `page` imply reliable support for every Paged Media descriptor and margin box?** No. Check each feature and test the actual print/PDF pipeline.
6. **What controls a forced page break, versus the page design used afterward?** Fragmentation properties request or require the break; `page` selects a named page type and `@page` styles that type.

# Sources

- [CSS Paged Media Module Level 3 Editor’s Draft](https://drafts.csswg.org/css-page-3/) — 21 October 2026 work in progress; page model, page selectors, page-margin boxes, descriptors, counters, and named-page property semantics.
- [CSS Fragmentation Module Level 3 Editor’s Draft](https://drafts.csswg.org/css-break-3/) — break properties, break opportunities, and fragmentation behavior.
- [CSS 2.2, Paged Media](https://www.w3.org/TR/CSS22/page.html) — foundational page-box and legacy page-break model.
- [MDN: `page`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/page) — property summary, formal definition and compatibility entry point.
- [MDN: `@page`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@page) — practical overview of the page rule, descriptors and margin at-rules; support varies by feature.
