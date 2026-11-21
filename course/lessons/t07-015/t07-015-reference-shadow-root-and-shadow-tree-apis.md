
# Browser DOM events storage observers and navigation APIs — Reference: ShadowRoot state, encapsulation, selection, and stylesheets

# Scope and version

This lesson covers the `ShadowRoot` interface and its interaction with a host element, slots, focus, events, stylesheets, and serialization. The inventory is based on the current WHATWG DOM/HTML standards and MDN references checked 2026-11-19. Root options such as `serializable`, `clonable`, and scoped custom-element registries have varying support. MDN documents `referenceTarget`, but that member was not present in the current WHATWG DOM IDL when checked; treat it as a limited-availability, evolving feature and feature-detect it. See [WHATWG DOM](https://dom.spec.whatwg.org/), [WHATWG HTML shadow trees](https://html.spec.whatwg.org/multipage/dom.html#shadow-trees), and [MDN ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot).

# How this group fits the mental model

A shadow tree is a separate node subtree attached to a host. It participates in rendering through slot distribution but has its own tree scope and style scoping. A `ShadowRoot` is a `DocumentFragment` with a `host`, lifecycle, focus/selection context, and shadow-specific serialization behavior. “Closed” limits ordinary JavaScript access through `host.shadowRoot`; it is not a security boundary against code that already runs in the page. Components still need accessible semantics and explicit public APIs.

# Supplied names explained

- `ShadowRoot` — Root object for a shadow tree; it inherits from `DocumentFragment` and exposes shadow-specific state/methods.
- `ShadowRoot.mode` — `open` or `closed`; this controls exposure through `Element.shadowRoot`, not privilege isolation.
- `ShadowRoot.host` — The element to which this root is attached.
- `Element.attachShadow()` and `ShadowRootInit` — `attachShadow()` creates the root and requires a `mode`; the other `ShadowRootInit` fields configure focus delegation, slot assignment, serialization, cloning, and an optional scoped custom-element registry.
- `ShadowRootInit.mode` — Required `"open"` or `"closed"` setting that controls whether `host.shadowRoot` exposes the root.
- `ShadowRootInit.delegatesFocus` — Optional boolean, default false, controlling focus delegation behavior.
- `ShadowRootInit.slotAssignment` — Optional `"named"` or `"manual"`, default `"named"`.
- `ShadowRootInit.serializable` — Optional boolean, default false; permits inclusion by serialization when requested.
- `ShadowRootInit.clonable` — Optional boolean, default false; permits inclusion when its host is cloned/imported.
- `ShadowRootInit.customElementRegistry` — Optional nullable scoped `CustomElementRegistry`; when omitted/null the standard’s applicable registry behavior is used. Support varies.
- `ShadowRoot.delegatesFocus` — Whether focus targeting can delegate from a non-focusable host into focusable shadow content.
- `ShadowRoot.slotAssignment` — `named` or `manual`, describing how light-DOM children are assigned to slots.
- `ShadowRoot.clonable` — Whether cloning the host also clones the shadow root; this is configured when the root is created.
- `ShadowRoot.serializable` — Whether serialization options may include this root; this is configured at creation and does not make serialization safe for untrusted input.
- `ShadowRoot.referenceTarget` — MDN documents a nullable string naming an internal target for external element references to the host. It was absent from the current WHATWG DOM IDL checked for this lesson, so treat it as an evolving, limited-availability feature rather than a portable standard contract.
- `ShadowRoot.customElementRegistry` — The registry associated with the shadow root when scoped registries are used, otherwise null.
- `ShadowRoot.activeElement` — Focused element within this shadow tree, or null when focus is outside it.
- `ShadowRoot.fullscreenElement` — Element in this shadow tree currently presented fullscreen, or null.
- `ShadowRoot.pictureInPictureElement` — Element in this shadow tree currently presented in picture-in-picture, or null.
- `ShadowRoot.pointerLockElement` — Element in this tree that currently owns pointer lock, or null when not applicable.
- `ShadowRoot.styleSheets` — Read-only list of stylesheets linked/embedded in the shadow tree; constructed sheets are handled separately through `adoptedStyleSheets`.
- `ShadowRoot.adoptedStyleSheets` — Mutable list of constructed stylesheets shared within the same document; update the sheet's `replaceSync()`/`replace()` content to change shared rules.
- `ShadowRoot.innerHTML` — Gets/sets markup within the root. The setter parses markup and is a security-sensitive sink unless content is trusted/sanitized.
- `ShadowRoot.elementFromPoint()` — Returns the topmost hit-tested element in the shadow tree at viewport coordinates, or null.
- `ShadowRoot.elementsFromPoint()` — Returns hit-tested elements in the shadow tree from topmost downward.
- `ShadowRoot.getAnimations()` — Returns animations affecting elements in this shadow subtree.
- `ShadowRoot.getSelection()` — Returns the selection/caret associated with this shadow tree where implemented; support differs, so feature-detect.
- `ShadowRoot.slotchange event` — A `slotchange` event bubbles from a slot through its shadow tree when its assigned-node set changes; it is not composed across the host boundary. It does not report every descendant mutation inside assigned nodes.
- `Shadow DOM open and closed mode` — Open roots can be obtained from `host.shadowRoot`; closed roots return null there. A component may still retain a reference internally.
- `Shadow DOM event retargeting and composed paths` — Events crossing the boundary can retarget `target`; composed events can cross boundaries. `composedPath()` exposes the path subject to closed-root encapsulation.
- `Shadow DOM style encapsulation and part export` — Shadow styles are scoped; `part` and `exportparts` deliberately expose named styling hooks rather than all internals.
- `Shadow DOM declarative serialization and clonable roots` — `getHTML()` options can serialize selected or serializable roots; cloning can include roots created with `clonable`. This is separate from ordinary `innerHTML` serialization and depends on options/support.

# Slot distribution and lifecycle

The host's light-DOM children are not moved into the shadow tree. Slots project them into render positions. `slotAssignment: "named"` matches a child `slot` attribute to a slot's `name`; default slots receive unmatched children. Manual assignment uses the slot APIs and requires the manual mode. `assignedSlot` on a slotted element and `assignedNodes()`/`assignedElements()` on a slot help inspect distribution; fallback children render when nothing is assigned. A `slotchange` event reports changes to the slot's assigned-node list, not arbitrary edits inside an already assigned descendant.

The root exists for the lifetime of its host unless explicitly detached by host removal (which does not necessarily destroy it). Reconnection can reuse the same tree. Component teardown should remove external listeners/observers and release resources even if the shadow tree object remains reachable.

# Focus, events, selection, and styles

Focus can be inside a shadow tree while `document.activeElement` reports the host; inspect `shadowRoot.activeElement` when the root reference is available. `delegatesFocus` changes focus behavior but does not replace correct tab order, labels, or keyboard interaction. Event retargeting is an encapsulation behavior, not event suppression; use composed custom events as the component's intentional public signal.

Document-level selection APIs and shadow-root selection are not identical across implementations. `ShadowRoot.getSelection()` is documented by MDN but is not part of the current WHATWG `ShadowRoot` IDL checked for this lesson; feature-detect it and provide a fallback. Constructed stylesheets can be adopted by multiple roots from the same document; mutation to a shared sheet affects every adopter. Use ordinary `<style>`/`<link>` within the root when that better suits component loading and CSP policy.

# Examples

```js
class SearchBox extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open", delegatesFocus: true });
    root.innerHTML = `
      <label>Search <input type="search"></label>
      <slot name="help"></slot>
    `;
    root.addEventListener("input", event => {
      if (event.target instanceof HTMLInputElement) {
        this.dispatchEvent(new CustomEvent("search-change", {
          detail: { value: event.target.value },
          bubbles: true,
          composed: true
        }));
      }
    });
  }
}
```

This uses a closed-over root reference only if needed; here the constructor does not store it. For production code, static trusted template markup is different from injecting user input: never assign untrusted strings to `innerHTML`. The public event intentionally crosses the shadow boundary with a minimal payload.

# Common mistakes

- Treating a closed root as a security mechanism; it is API encapsulation, not protection from same-page scripts or DevTools.
- Assuming host light-DOM children are physically moved into the root by slotting.
- Expecting `slotchange` when only a descendant inside an already-assigned node changes.
- Assuming `document.activeElement` always reveals the focused internal control.
- Sharing one constructed stylesheet across roots without realizing updates are shared.
- Serializing a shadow root and assuming its markup is trusted, portable, or includes closed roots automatically.
- Assuming `innerHTML` is a safe sanitizer sink.
- Relying on `ShadowRoot.getSelection()` or newer serialization/reference-target features without checking browser support.
- Treating MDN-documented `referenceTarget` as a cross-browser WHATWG-standard contract; it was not in the current DOM IDL checked here.
- Emitting a custom event with `composed: true` without deciding which internal details become public.

# Cross-item comparison

| Concern | Shadow DOM mechanism | Boundary |
| --- | --- | --- |
| Encapsulate DOM/CSS | `attachShadow()` and `ShadowRoot` | Closed mode is not a security boundary |
| Project host children | `<slot>` and assignment mode | Projection does not move nodes into the root |
| Observe assigned-node changes | `slotchange` | Not a generic subtree mutation event |
| Share component styling | `adoptedStyleSheets` | Shared sheet edits affect all adopters |
| Expose component event | Composed custom event | Choose payload/retargeting deliberately |
| Serialize component internals | `getHTML()` options / serializable roots | Not included by default and not a trust guarantee |

# Knowledge checks with answers

1. **Does closed mode prevent page code from inspecting a root?** No. It prevents lookup through the host's `shadowRoot` property; code holding a reference can still inspect it.
2. **Does slotting move a light-DOM child into the shadow tree?** No. It affects rendering/distribution while the node remains a child of the host.
3. **What does `slotchange` indicate?** The assigned node set changed; it does not signal arbitrary changes inside those nodes.
4. **Why might `document.activeElement` be the host while a control has focus?** Focus is retargeted across the shadow boundary; inspect the root's `activeElement` when available.
5. **Are adopted stylesheets copied when added to multiple roots?** No. They can be shared; changing the constructed sheet affects each adopter.

# Further reading

- [WHATWG DOM Standard](https://dom.spec.whatwg.org/)
- [WHATWG HTML shadow trees](https://html.spec.whatwg.org/multipage/dom.html#shadow-trees)
- [MDN ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)
- [MDN Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
