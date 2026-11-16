# HTML document structure metadata and semantic content elements — Reference: Image, media, embedded, SVG, and MathML elements

## Scope and version

Current HTML Living Standard. See [WHATWG embedded content](https://html.spec.whatwg.org/multipage/embedded-content.html) and [MDN elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements).

## How this group fits the mental model

Media elements connect a document to images, audio, video, mapped regions, or embedded documents. Alternatives, captions, dimensions, loading behavior, and security settings are part of the design.

## Supplied names explained

- `<area>` — Defines a clickable region within an image map, with a destination and text alternative when used as a link.
- `<audio>` — Embeds audio. Provide accessible controls or a meaningful alternative; autoplay with sound is disruptive and often blocked.
- `<img>` — Embeds an image. `alt` conveys its purpose or is empty for decorative images; dimensions and responsive sources help layout and delivery.
- `<map>` — Defines an image map containing associated `<area>` elements.
- `<track>` — Supplies timed text such as captions or subtitles for a media element, selected using kind/language metadata.
- `<video>` — Embeds video, optionally with controls, poster, and timed text tracks. Captions and accessible controls are important.
- `<embed>` — Integrates external content through a plugin-like embedding point; use cautiously because capabilities, fallback, and security vary.
- `<iframe>` — Embeds another browsing context. Give it an accessible title and consider `sandbox`, permissions, and origin boundaries.
- `<object>` — Represents an external resource and can contain fallback content. Its data/type and security implications need careful handling.
- `<picture>` — Provides alternate image sources, typically for art direction or format selection; the nested image is the fallback/rendering element.
- `<source>` — Offers candidate media or image resources to a parent media element or picture. It is not rendered independently.
- `<svg>` — Embeds scalable vector graphics and enters SVG foreign-content parsing; SVG has its own element/attribute semantics.
- `<math>` — Embeds MathML mathematical notation and enters MathML foreign-content parsing.

## Cross-item comparison

`<picture>` selects among sources for one image presentation; `<img>` embeds the chosen image and carries the alternative text. `<track>` provides timed text; it does not replace authored transcripts where those are needed. `<iframe>` creates a nested browsing context; `<object>` and `<embed>` have different resource/fallback semantics. SVG and MathML use foreign vocabularies rather than ordinary HTML elements.

## Examples

```html
<picture>
  <source srcset="/images/chart.avif" type="image/avif">
  <source srcset="/images/chart.webp" type="image/webp">
  <img src="/images/chart.png" alt="Sales rose steadily from January through June" width="800" height="450">
</picture>

<video controls>
  <source src="/media/demo.mp4" type="video/mp4">
  <track kind="captions" src="/media/demo-en.vtt" srclang="en" label="English">
</video>
```

## Common mistakes

- Omitting useful `alt`, repeating nearby text, or putting a filename in `alt`.
- Using a nonempty alternative for purely decorative images.
- Forgetting dimensions and causing layout shifts while images load.
- Assuming `loading="lazy"` is suitable for the above-the-fold LCP image.
- Embedding untrusted or cross-origin content without a threat model, title, and permission limits.
- Treating captions, subtitles, audio description, and transcripts as interchangeable.
- Using image maps without keyboard-accessible, clearly named regions.

## Knowledge checks with answers

1. **Which element provides the image semantics and alternative text in a picture set?** `<img>`.
2. **What does `<track>` supply?** Timed text such as captions/subtitles.
3. **Why title an iframe?** So users of assistive technology can identify the embedded browsing context.
