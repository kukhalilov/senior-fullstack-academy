<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Browser DOM events storage observers and navigation APIs — Reference: Current HTML Sanitizer and safe markup insertion API

# Scope and version

This is the security-sensitive reference for the WHATWG HTML dynamic markup insertion and Sanitizer APIs. The method inventory follows the HTML Living Standard checked 2026-11-16 (last updated 2026-11-14). The new streaming and neighbor-insertion methods are present in the current standard but are not yet broadly documented/implemented; feature-detect them and do not assume deployment support. MDN marks the Sanitizer API limited availability / not Baseline. See [WHATWG dynamic markup insertion](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html), [MDN HTML Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API), and [MDN Element.setHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML).

# How this group fits the mental model

These methods parse HTML strings in an insertion context and build a DOM subtree. Safe methods sanitize during parsing; unsafe-suffixed methods allow more markup according to the supplied configuration and do not provide the safe methods' XSS guarantees. A `Sanitizer` is a reusable policy object; `SanitizerConfig` describes its element/attribute/comment/processing-instruction policy. Parsing context matters: a string parsed inside a table, template, or shadow root can produce different nodes than parsing it as a document.

Use text APIs for text. When rich markup is required, prefer a safe method when available. A third-party sanitizer plus a safe DOM sink may be necessary on browsers without the native API. No sanitizer makes HTML universally trustworthy after serialization and reparsing.

# Supplied names explained

- `HTML Sanitizer API` — The browser API for configuring sanitization and parsing/inserting HTML strings into a document, element, or shadow root. The standard defines a broad family of methods; actual support is incomplete and must be feature-detected.
- `Element.setHTML()` — Contextually parses and sanitizes markup, then replaces the element's children. It removes XSS-unsafe markup regardless of a custom allowlist.
- `Element.appendHTML()` — Contextually sanitizes/parses and appends nodes after the last child.
- `Element.prependHTML()` — Contextually sanitizes/parses and inserts nodes before the first child.
- `Element.beforeHTML()` — Parses relative to the parent context and inserts sanitized nodes before the element; if it has no parent, it does nothing.
- `Element.afterHTML()` — Inserts sanitized nodes after the element in its parent context; without a parent, it does nothing.
- `Element.replaceWithHTML()` — Replaces the element with sanitized parsed nodes in the parent's parsing context.
- `Element.streamHTML()` — Returns a `WritableStream` that incrementally parses/sanitizes chunks and replaces children. It is a current-standard API with limited implementation availability; the target must not be a script element.
- `Element.streamAppendHTML()` — Returns a stream that incrementally parses/sanitizes and appends chunks to the element.
- `Element.streamPrependHTML()` — Returns a stream that incrementally inserts before the element's first child captured at call time; if none existed then, streamed content appends.
- `Element.streamBeforeHTML()` — Incrementally parses/sanitizes chunks before this element in its parent context. The node/parent relationship must remain suitable while streaming.
- `Element.streamAfterHTML()` — Incrementally inserts sanitized chunks after this element in its parent context.
- `Element.streamReplaceWithHTML()` — Incrementally parses sanitized chunks and replaces this element in its parent context.
- `Element.setHTMLUnsafe()` — Parses into the element context and replaces children. Without an explicit sanitizer it allows potentially unsafe markup; use only when a requirement genuinely needs markup excluded by the safe API and the exact policy has been reviewed.
- `Element.appendHTMLUnsafe()` — Appends parsed markup with the same unsafe-default caveat.
- `Element.prependHTMLUnsafe()` — Prepends parsed markup with the same unsafe-default caveat.
- `Element.beforeHTMLUnsafe()` — Inserts parsed markup before this element using its parent context; without a sanitizer it can retain unsafe constructs.
- `Element.afterHTMLUnsafe()` — Inserts parsed markup after this element using its parent context; without a sanitizer it can retain unsafe constructs.
- `Element.replaceWithHTMLUnsafe()` — Replaces this element with parsed markup in its parent context; without sanitization it can retain unsafe constructs.
- `Element.streamHTMLUnsafe()` — Streams parsed markup while replacing the element's children, without safe sanitization unless explicitly configured. Treat all chunks as untrusted.
- `Element.streamAppendHTMLUnsafe()` — Streams parsed markup appended to the element; no safe default sanitization.
- `Element.streamPrependHTMLUnsafe()` — Streams parsed markup prepended relative to the first child captured at stream creation; no safe default sanitization.
- `Element.streamBeforeHTMLUnsafe()` — Streams parsed markup before the element, with unsafe-default behavior.
- `Element.streamAfterHTMLUnsafe()` — Streams parsed markup after the element, with unsafe-default behavior.
- `Element.streamReplaceWithHTMLUnsafe()` — Streams parsed markup that replaces the element, with unsafe-default behavior.
- `ShadowRoot.setHTML()` — Contextually sanitizes markup against the shadow host's parsing context and replaces shadow-root children.
- `ShadowRoot.appendHTML()` — Contextually sanitizes and appends markup to the shadow root.
- `ShadowRoot.prependHTML()` — Contextually sanitizes and prepends markup to the shadow root.
- `ShadowRoot.streamHTML()` — Stream-based safe-default replacement of shadow-root content, parsed in the host context.
- `ShadowRoot.streamAppendHTML()` — Stream-based safe-default append into the shadow root.
- `ShadowRoot.streamPrependHTML()` — Stream-based safe-default prepend into the shadow root; it retains the prepend anchor rules of the stream algorithm.
- `ShadowRoot.setHTMLUnsafe()` — Replaces shadow-root children using parsed markup; absent an explicit sanitizer it is unsafe for untrusted input.
- `ShadowRoot.appendHTMLUnsafe()` — Appends parsed markup with unsafe-default behavior.
- `ShadowRoot.prependHTMLUnsafe()` — Prepends parsed markup with unsafe-default behavior.
- `ShadowRoot.streamHTMLUnsafe()` — Streams parsed markup into the shadow root while replacing contents, without safe default sanitization.
- `ShadowRoot.streamAppendHTMLUnsafe()` — Streams unsanitized-by-default markup appended to the shadow root.
- `ShadowRoot.streamPrependHTMLUnsafe()` — Streams unsanitized-by-default markup prepended to the shadow root.
- `Document.parseHTML()` — Static safe parser returning a new HTML `Document` without a browsing context. It uses the safe default sanitizer unless given another configuration; scripts are not executed in the returned inert document.
- `Document.parseHTMLUnsafe()` — Static parser returning a new document but without the safe method's default XSS filtering. Parsed scripts are not executed merely because parsing occurred, but content can become dangerous if moved into an active document.
- `Sanitizer` — Reusable, mutable sanitizer configuration object. Its configuration is cloned/canonicalized on construction; invalid or contradictory configuration throws.
- `Sanitizer() constructor` — Creates a sanitizer. Omitting configuration or using the `default` preset uses the built-in safe default configuration; a custom `SanitizerConfig` can be supplied.
- `Sanitizer.get()` — Returns a copy of the current configuration, not the live mutable internal object.
- `Sanitizer.allowElement()` — Adds/updates an allowed element rule, optionally including local allowed/removed attributes; returns whether configuration changed.
- `Sanitizer.removeElement()` — Adds an element to the removal policy and reconciles conflicting rules.
- `Sanitizer.replaceElementWithChildren()` — Removes an element wrapper while retaining its children. Some built-in structural elements cannot be replaced because doing so could produce invalid trees or unsafe reparsing.
- `Sanitizer.allowProcessingInstruction()` — Adds a processing-instruction target to the sanitizer's allow policy for relevant non-HTML/XML content contexts.
- `Sanitizer.removeProcessingInstruction()` — Adds a processing-instruction target to the removal policy.
- `Sanitizer.allowAttribute()` — Adds a global allowed-attribute rule, identified by name and optionally namespace.
- `Sanitizer.removeAttribute()` — Adds a global attribute-removal rule.
- `Sanitizer.setComments()` — Controls whether comments are retained; the default sanitizer removes them.
- `Sanitizer.setDataAttributes()` — Controls custom `data-*` attributes. The default sanitizer removes these because application/framework script gadgets can interpret them.
- `Sanitizer.setJavascriptURLs()` — Controls whether URL-valued attributes with a `javascript:` scheme are allowed in the policy. Safe methods still remove unsafe constructs regardless of configuration; enabling this is not safe for untrusted content.
- `Sanitizer.removeUnsafe()` — Mutates policy to remove elements/attributes considered script-capable or otherwise unsafe by the standard's safe baseline.
- `SanitizerConfig.elements` — Allowlist of elements; each can optionally specify a namespace and element-local attribute allow/remove lists.
- `SanitizerConfig.removeElements` — Blocklist of elements, used instead of the global element allowlist.
- `SanitizerConfig.replaceWithChildrenElements` — Elements removed while retaining children. It cannot include built-in non-replaceable structural elements.
- `SanitizerConfig.processingInstructions` — Processing-instruction allowlist.
- `SanitizerConfig.removeProcessingInstructions` — Processing-instruction blocklist.
- `SanitizerConfig.attributes` — Global attribute allowlist; may coexist with per-element lists only under the configuration's consistency rules.
- `SanitizerConfig.removeAttributes` — Global attribute blocklist; cannot be combined arbitrarily with allowlists.
- `SanitizerConfig.comments` — Boolean controlling whether HTML comments remain.
- `SanitizerConfig.dataAttributes` — Boolean for allowing custom `data-*` attributes; valid only with compatible attribute allowlist configuration.
- `SanitizerConfig.javascriptURLs` — Boolean policy for `javascript:` URL values. Enabling it is high risk and safe insertion still removes script-capable markup.
- `Safe sanitization methods` — `setHTML`, `appendHTML`, `prependHTML`, sibling insertion/replacement methods, their streaming forms, and `Document.parseHTML` sanitize while parsing and strip unsafe markup even if an allow rule asks to retain it.
- `Unsafe sanitization methods` — Methods ending in `Unsafe` and `Document.parseHTMLUnsafe` honor supplied sanitizer options but do not apply safe filtering by default. “Unsafe” is about the security guarantee, not a claim that the parser itself is malformed.
- `Default sanitizer preset` — Built-in safe default policy, narrower than the XSS-safe baseline. It removes unsafe constructs plus comments, custom data attributes, and additional attack-surface markup such as clickjacking/spoofing helpers.
- `HTML sanitizer context-sensitive parsing` — Element methods parse using the target element/parent/host context; invalid-in-context elements are discarded. The same string can yield different trees at different insertion points.
- `Streaming HTML insertion` — The streaming methods return `WritableStream`s and incrementally parse chunks as they are written. Streaming variants are in the latest standard but have uncertain browser support; detect before use and handle stream errors/cancellation.
- `Trusted Types interaction with unsafe sanitization methods` — Unsafe methods are Trusted Types sinks. Under enforcement, trusted `TrustedHTML` or an approved `TrustedHTMLParserOptions` policy is required as applicable. Safe Sanitizer methods already apply safe filtering and do not use Trusted Types as a second sanitizer gate.
- `Sanitizer does not prevent server-side XSS` — It operates on DOM parsing/insertion in the browser; it cannot protect server-rendered output or other consumers of stored content.
- `Sanitizer does not prevent DOM clobbering by default` — Malicious `id`/`name` values may shadow DOM properties or confuse application code. Remove these attributes where untrusted markup does not need them.
- `Sanitizer does not prevent framework script gadgets` — Inert-looking markup/attributes can trigger existing application/framework code that interprets them. Review `data-*`, slots, templates, and third-party library behavior.
- `Sanitized serialization must be re-sanitized before reparsing` — A sanitized node tree serialized to a string loses its context-bound guarantee. Treat the serialized string as untrusted and sanitize it again at the next insertion context; context changes can enable mutation-XSS patterns.

# Choosing a path

| Requirement | Preferred path | Key boundary |
| --- | --- | --- |
| Insert plain user text | `textContent` or text nodes | It creates text, not markup |
| Insert modest rich HTML in a supported browser | Safe `setHTML`/related method with a reviewed policy | Feature-detect; the sanitizer is context-sensitive |
| Support browsers without the native Sanitizer API | Maintained sanitizer library plus a safe DOM sink/Trusted Types policy as appropriate | Do not fall back to raw `innerHTML` |
| Need a markup construct removed by safe methods | Reassess requirement; if unavoidable, narrowly configure unsafe method and Trusted Types | Unsafe method does not guarantee safety |
| Parse a full HTML fragment/document for inspection | `Document.parseHTML` when available; otherwise inert parser plus explicit sanitization before activation | Inert parsing alone does not make later insertion safe |

# Examples

The following progressively enhances browsers that implement `Element.setHTML()`. The fallback remains text-only; do not silently fall back to unsanitized `innerHTML`.

```js
function renderComment(container, untrustedMarkup) {
  if (typeof container.setHTML === "function") {
    container.setHTML(untrustedMarkup); // built-in safe default policy
    return;
  }

  // Use an application-maintained sanitizer in browsers without setHTML.
  const fragment = DOMPurify.sanitize(untrustedMarkup, { RETURN_DOM_FRAGMENT: true });
  container.replaceChildren(fragment);
}
```

The fallback must be an actually installed and maintained sanitizer; the name in the example is illustrative. Never silently replace the missing API with `container.innerHTML = untrustedMarkup`.

# Common mistakes

- Using an `Unsafe` method without specifying a strict sanitizer leaves dangerous markup available by default.
- Assuming a custom safe-method allowlist can preserve event handlers or script-capable elements. Safe methods strip unsafe content anyway.
- Treating a serialized sanitized result as permanently safe. Its guarantee is tied to the original insertion context.
- Allowing all `data-*` attributes without understanding what the application/framework reads from them.
- Confusing the safe baseline with the default preset: default removes additional items such as comments and data attributes.
- Configuring contradictory allow/remove lists. Construction can throw `TypeError`; validate configuration once and reuse a `Sanitizer`.
- Assuming `DOMParser` or `parseHTMLUnsafe` scripts run immediately. They may be inert in the returned document, but importing/inserting their nodes into an active document is a separate risk.
- Assuming browser support from the standard alone. Feature-detect the exact method, especially 2026 streaming and sibling insertion methods.
- Using a sanitizer to claim protection from server-side XSS, DOM clobbering, or app-specific gadget behavior. These need separate defenses.

# Cross-item comparison

- **Safe vs unsafe suffix:** Safe methods filter XSS-unsafe content regardless of configuration; unsafe-suffixed methods use explicit options and otherwise can preserve dangerous markup.
- **Default vs custom policy:** The default policy minimizes attack surface. Custom allowlists preserve product-required markup but add review work and can introduce gadget/clobbering risks.
- **String vs node:** Sanitizer methods turn strings into node trees in context. A sanitized node tree can be inserted safely as returned; serializing it and reparsing the string discards that contextual assurance.
- **Whole subtree vs incremental stream:** `setHTML` replaces children from a complete string; `streamHTML` parses chunks incrementally and has streaming lifecycle/error behavior. Both need a correct target policy.
- **Native API vs library fallback:** Native methods understand browser parsing context; a maintained library can support more browsers. Both need feature detection/appropriate safe sinks and server protections remain separate.

# Knowledge checks with answers

1. **Does `setHTML()` allow an event-handler attribute because it appears in a custom allowlist?** No. Safe methods remove XSS-unsafe elements/attributes even if the custom policy asks to keep them.
2. **What is the difference between `Sanitizer.get()` and the live configuration?** `get()` returns a copy, so editing that copy does not mutate the existing `Sanitizer`.
3. **Why is `Sanitizer.setJavascriptURLs(true)` dangerous?** It allows `javascript:` URL values in the policy. Safe methods still remove unsafe constructs, but an unsafe method may retain them.
4. **What happens if a safe method is unavailable?** Feature-detect and use a maintained sanitizer plus safe node insertion; do not use raw `innerHTML` as a fallback for untrusted text.
5. **Can the Sanitizer API prevent a server from returning reflected XSS?** No. It filters browser DOM parsing/insertion only.
6. **Does `streamHTML()` currently have reliable cross-browser support?** Do not assume so; it is listed in the current Living Standard but browser implementation coverage is limited.

# Further reading

- [WHATWG HTML: dynamic markup insertion and sanitizer algorithms](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html)
- [MDN: HTML Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)
- [MDN: Sanitizer](https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer)
- [MDN: SanitizerConfig](https://developer.mozilla.org/en-US/docs/Web/API/SanitizerConfig)
- [MDN: Element.setHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)
- [MDN: Trusted Types API](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)
