# React DOM components forms resource hints portals and preload APIs — Reference: Common React DOM props and custom elements

## Scope and version

This reference covers the supplied common React DOM props and custom-element behaviors against React 19.3: React-only props, key/ref handling, standard global prop spelling, custom attributes, and forwarding to custom element attributes, properties, and events. Native attribute definitions are in the HTML topics; this lesson focuses on React's mapping and exceptions. [Common components](https://react.dev/reference/react-dom/components/common) [React DOM components](https://react.dev/reference/react-dom/components) [React versions](https://react.dev/versions)

## How this group fits the mental model

JSX props are inputs to React's reconciler, which writes supported values onto browser nodes. Most standard properties follow DOM-oriented naming, while a few React-specific props control tree content, raw HTML, refs, CSS styles, or hydration diagnostics. Custom elements have an additional attributes-versus-properties distinction.

## Supplied names explained

- `children prop` is the React node content nested inside a component. It can be elements, strings/numbers, portals, empty nodes, or arrays. It is distinct from the DOM `children` property and is not supported on void elements such as `<input>`. [Common components](https://react.dev/reference/react-dom/components/common)
- `key prop` is React's reconciliation identity hint among siblings; React consumes it and does not forward it as an ordinary DOM prop. Use stable data identity, never an array index when reordering can change component identity. [React DOM components](https://react.dev/reference/react-dom/components)
- `ref prop` attaches an imperative reference to a DOM node (or a callback/object ref). In React 19 callback refs may return cleanup functions; changed callback identity causes detach/attach behavior. Refs are imperative handles, not declarative displayed state. [Common components](https://react.dev/reference/react-dom/components/common)
- `ref callback cleanup function` runs when the referenced DOM node detaches. In React 19, returning cleanup is the forward-compatible form; for compatibility React currently calls the callback with `null` if no cleanup was returned, and that fallback is documented for removal in a future version. Strict Mode performs an extra development setup/cleanup check. [Common components](https://react.dev/reference/react-dom/components/common) [React 19](https://react.dev/blog/2024/12/05/react-19)
- `className prop` sets the class attribute using JSX/DOM naming. For static styles, classes and CSS are generally preferable to inline `style`; React Compiler does not change this DOM mapping. [Common components](https://react.dev/reference/react-dom/components/common)
- `htmlFor prop` is the React spelling of HTML `for`, commonly used to associate a `<label>` with a control. It uses the DOM property name rather than the source HTML attribute spelling. [Common components](https://react.dev/reference/react-dom/components/common)
- `style prop object` accepts a JavaScript object with camelCase CSS property names. Numeric values gain `px` except for unitless properties; CSS custom properties use their documented custom-property form. Avoid building a fresh styling system in render when static CSS classes suffice. [Common components](https://react.dev/reference/react-dom/components/common)
- `dangerouslySetInnerHTML prop` accepts an object containing `__html` and inserts raw HTML into the node. It cannot be used together with `children`. The name is a security warning: untrusted strings can create XSS; sanitize with a context-appropriate trusted process and use Trusted Types where configured. [Common components](https://react.dev/reference/react-dom/components/common) [React 19.3](https://react.dev/blog/2026/09/09/react-19-3)
- `suppressContentEditableWarning prop` suppresses React's warning when an element combines React children with `contentEditable`. It is intended for libraries that fully manage editable content manually; it does not synchronize the browser-edited DOM with React. [Common components](https://react.dev/reference/react-dom/components/common)
- `suppressHydrationWarning prop` suppresses mismatch warnings for one element level in rare unavoidable server/client differences, such as a timestamp. It does not reconcile or fix mismatched HTML and should remain an escape hatch. [Common components](https://react.dev/reference/react-dom/components/common)
- `data-* attributes` retain their dashed lowercase spelling and carry string-valued custom data in markup. React supports them, though application state/props should usually remain the source of application data. [Common components](https://react.dev/reference/react-dom/components/common)
- `aria-* attributes` retain their exact HTML/ARIA lowercase dashed names. React does not camelCase them; choose the proper semantic element and accessible name before adding ARIA. [Common components](https://react.dev/reference/react-dom/components/common)
- `camelCase DOM prop names` are used for standard DOM properties such as `tabIndex`, `autoFocus`, and `htmlFor`; this avoids HTML source attribute casing differences. `data-*` and `aria-*` are important exceptions that keep their exact dash spelling. [Common components](https://react.dev/reference/react-dom/components/common)
- `accessKey prop` is the browser keyboard-shortcut attribute spelling `accessKey`; browser and operating-system behavior varies, so it is not generally recommended as a primary interaction route. [Common components](https://react.dev/reference/react-dom/components/common)
- `autoCapitalize prop` maps the HTML `autocapitalize` behavior for text entry; it is a hint to input methods, not a guaranteed transformation of user data. [Common components](https://react.dev/reference/react-dom/components/common)
- `contentEditable prop` lets the browser edit an element's contents. React warns when also controlling children because browser edits and React reconciliation compete for ownership. Rich-text editors should deliberately own and synchronize that DOM. [Common components](https://react.dev/reference/react-dom/components/common)
- `dir prop` specifies text direction such as `ltr` or `rtl`; it is a standard DOM property and should be set from document/content language needs rather than styling assumptions. [Common components](https://react.dev/reference/react-dom/components/common)
- `draggable prop` enables native drag behavior and is separate from React's drag event handlers. A drop target normally cancels `onDragOver` to accept a drop. [Common components](https://react.dev/reference/react-dom/components/common)
- `enterKeyHint prop` hints the action label for a virtual keyboard's Enter key; it does not handle submission itself. [Common components](https://react.dev/reference/react-dom/components/common)
- `hidden prop` controls the browser's hidden state; unlike CSS opacity it removes visual presentation, and it should not be used to conceal content from assistive technology when the content remains intended to be available. [Common components](https://react.dev/reference/react-dom/components/common)
- `id prop` sets an element's identifier. Keep IDs unique in the document; `useId` can create hydration-safe identifiers for relationships, but does not replace domain identity or list keys. [Common components](https://react.dev/reference/react-dom/components/common)
- `is prop` identifies a customized built-in element using the browser's custom-element mechanism. React treats that built-in tag as a custom element. [React DOM components](https://react.dev/reference/react-dom/components)
- `inputMode prop` hints the virtual keyboard layout for text input; it does not validate the entered value or change the element's native type. [Common components](https://react.dev/reference/react-dom/components/common)
- `itemProp prop` associates an element with structured metadata. It also changes React `<title>` special head behavior for that title instance. [Common components](https://react.dev/reference/react-dom/components/common) [React title](https://react.dev/reference/react-dom/components/title)
- `lang prop` specifies the language of the element's content and can affect screen readers, spellchecking, and language processing. [Common components](https://react.dev/reference/react-dom/components/common)
- `role prop` explicitly supplies an accessibility role. Prefer native semantics; a mismatched role can override the expected behavior and confuse assistive technology. [Common components](https://react.dev/reference/react-dom/components/common)
- `slot prop` names the slot into which a node is distributed by Shadow DOM. React composition often uses JSX props instead, depending on the custom element API. [Common components](https://react.dev/reference/react-dom/components/common)
- `spellCheck prop` enables/disables browser spellchecking with a boolean-like value. [Common components](https://react.dev/reference/react-dom/components/common)
- `tabIndex prop` sets keyboard focus order. Prefer only `0` (normal sequential focus) and `-1` (programmatic focus) in application UI; positive values create fragile ordering. [Common components](https://react.dev/reference/react-dom/components/common)
- `title prop` supplies browser tooltip text and can be inaccessible as the only label; use a visible/accessibility label for essential instructions. For React's `<title>` component, it instead sets document metadata. [Common components](https://react.dev/reference/react-dom/components/common) [React title](https://react.dev/reference/react-dom/components/title)
- `translate prop` is the standard `translate` attribute, with `yes`/`no` values controlling whether text should be translated. [Common components](https://react.dev/reference/react-dom/components/common)
- `custom lowercase attributes` may be passed through React when the name is lowercase and does not begin with `on`; values are stringified, and `null`/`undefined` removes the attribute. Do not assume unknown camelCase props are forwarded unchanged. [Common components](https://react.dev/reference/react-dom/components/common)
- `custom element attributes` are string markup values. By default React passes JSX-bound values as attributes; non-string values are serialized unless recognized as a custom element property. [React DOM components](https://react.dev/reference/react-dom/components)
- `custom element properties` are not reflected in markup and may hold arbitrary JavaScript values. React can assign a value as a property when the property exists on the custom element instance during construction; test lifecycle/registration timing and SSR/hydration behavior for the actual element. [React DOM components](https://react.dev/reference/react-dom/components)
- `custom element on-prefixed events` attach listeners using an `on`-prefixed JSX property such as `onspeak`. These are different from React's built-in camel-cased event props and preserve the custom element's event naming. [React DOM components](https://react.dev/reference/react-dom/components)
- `case-sensitive custom element events` preserve event type casing; `sayHi` and `sayhi` are different event names. [React DOM components](https://react.dev/reference/react-dom/components)
- `dashed custom element event names` preserve dashes exactly, such as `onsay-hi`; do not normalize the event name. [React DOM components](https://react.dev/reference/react-dom/components)

## Cross-item comparison

`key prop` is consumed by React for sibling reconciliation; `id prop` is emitted to the DOM and may be referenced by labels/ARIA. `ref prop` provides imperative node access; `children prop` describes rendered content. `dangerouslySetInnerHTML prop` bypasses normal child creation, while `children prop` follows React's escaped rendering. Built-in `onClick`-style React events are different from lowercase/custom `on...` element events, where spelling follows the CustomEvent type. [Common components](https://react.dev/reference/react-dom/components/common) [React DOM components](https://react.dev/reference/react-dom/components)

## Examples

```jsx
function LabelledField({ label, id, value, onChange }) {
  return <label htmlFor={id}>
    {label}
    <input id={id} value={value} onChange={onChange} />
  </label>;
}
```

This uses a DOM `id`/React `htmlFor` relationship and a controlled value. In React 19, a callback ref can own cleanup:

```jsx
<div ref={node => {
  if (!node) return;
  const observer = new ResizeObserver(handleResize);
  observer.observe(node);
  return () => observer.disconnect();
}} />
```

For raw HTML, ensure the string is trusted/sanitized and provide `dangerouslySetInnerHTML={{__html: safeMarkup}}` without also specifying children. [Common components](https://react.dev/reference/react-dom/components/common)

## Common mistakes

- Treating `key` as a DOM `id` or expecting it to reach the child component as an ordinary prop.
- Using `dangerouslySetInnerHTML` with user-provided text or together with React children.
- Setting `suppressHydrationWarning` to hide a structural server/client mismatch.
- Passing `on-speak` or `onSpeak` to a custom element when its actual CustomEvent is case-sensitive `say-hi`.
- Passing object-valued custom-element data and assuming it always becomes a JavaScript property rather than a string attribute.
- Using positive `tabIndex` values to force navigation order.
- Treating `inputMode` or `enterKeyHint` as validation or behavior controls.
- Adding ARIA roles where native HTML already provides the intended semantics.

## Knowledge checks with answers

1. **Does React forward `key` to a DOM node?** No; React consumes it as reconciliation metadata.
2. **Can `children` and `dangerouslySetInnerHTML` be provided together?** No.
3. **How does React 19 callback ref cleanup work?** Return a cleanup function; React calls it on detach and before reattaching a changed callback.
4. **What happens to `data-*` and `aria-*` names?** They preserve lowercase and dashes.
5. **How is a custom element's event name preserved?** The `on`-prefixed JSX listener keeps the event's exact casing and dashes.

