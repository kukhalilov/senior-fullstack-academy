# React DOM components forms resource hints portals and preload APIs — Core concepts and how they fit together

## Learning objectives

Explain how React props map to DOM properties/attributes; choose controlled or uncontrolled form state; describe React event propagation and special non-bubbling exceptions; predict React resource and portal behavior; choose among resource hint levels; and migrate code that used removed root APIs.

## Prerequisites

Know JSX, browser HTML forms, DOM nodes/events, state and Effects, promises, HTTP requests, and basic server rendering. React DOM's public API is web-specific; React's core Hooks and components can be used by other renderers, while `react-dom` requires a browser DOM environment for client-only behavior. [React reference overview](https://react.dev/reference/react) [React DOM APIs](https://react.dev/reference/react-dom)

## Core concepts

### JSX props, attributes, and properties

An HTML attribute is markup syntax; a DOM property is a JavaScript value on a browser node. React accepts JSX props and maps supported props to browser behavior. Many names follow DOM property camelCase (`tabIndex`, `autoFocus`, `htmlFor`); `className` maps to the class attribute. `data-*` and `aria-*` retain their lowercase, dashed names. Unknown custom attributes have documented constraints. For custom elements, an attribute is serialized text in markup, while a property can carry arbitrary JavaScript data. React 19 improved property/event handling for custom elements, but constructor timing and property naming affect whether a value is passed as a property. [Common components](https://react.dev/reference/react-dom/components/common) [React DOM components](https://react.dev/reference/react-dom/components)

Some props are React-specific: `children` defines nested React output, `ref` exposes a DOM node/handle, `dangerouslySetInnerHTML` overrides child rendering, and `style` takes a JavaScript object. `suppressHydrationWarning` and `suppressContentEditableWarning` are narrow escapes, not general fixes. A `key` helps React identify a sibling element during reconciliation but is not forwarded as a DOM attribute. Never place untrusted content into raw HTML; React's normal text rendering escapes text, whereas raw HTML bypasses that protection. [Common components](https://react.dev/reference/react-dom/components/common) [React 19](https://react.dev/blog/2024/12/05/react-19)

### Events are React props with DOM-informed semantics

Most event props have a bubbling form such as `onClick` and a capture-phase form such as `onClickCapture`. The capture handler runs on the path toward the target; bubbling handlers run back up the React event path. This naming pattern does not apply universally: `onMouseEnter`/`onMouseLeave` and `onPointerEnter`/`onPointerLeave` do not have capture variants in the current common-event inventory. React makes some events bubble even when the corresponding native event does not, including focus, resource load/error, dialog close/cancel, and details toggle. Scroll is specifically documented as non-bubbling, with a capture prop. Custom-element `on...` names preserve event casing/dashes and listen to custom events. [Common components](https://react.dev/reference/react-dom/components/common) [React DOM components](https://react.dev/reference/react-dom/components)

React passes a React event object with normalized common fields and the native event on `nativeEvent`. Use the event properties appropriate to its event family. `onBeforeInput` currently uses React's event handling/polyfill behavior rather than simply being a direct alias for the browser `beforeinput` event. For drag-and-drop, the drop target usually calls `preventDefault()` during `onDragOver` to accept a drop. Do not infer native bubbling solely from the React prop's name. [Common components](https://react.dev/reference/react-dom/components/common)

### Forms have two value ownership modes

A controlled input has its displayed value driven by a React prop (`value` or `checked`) and normally updates that prop through `onChange`. The state must be updated synchronously from the event's new value; otherwise React renders the previous value back, which can make typing appear broken or move the caret. An uncontrolled input starts from `defaultValue`/`defaultChecked` and then the browser owns edits. Do not switch a mounted control between controlled and uncontrolled modes. A `<select>` is controlled at the parent `<select>` using its `value`; individual `<option selected>` is not the React selection API. A `<textarea>` uses `value`/`defaultValue`, not a child string as the modern controlled interface. [React input](https://react.dev/reference/react-dom/components/input) [React select](https://react.dev/reference/react-dom/components/select) [React textarea](https://react.dev/reference/react-dom/components/textarea) [React option](https://react.dev/reference/react-dom/components/option)

Native browser constraints (`required`, `min`, `pattern`, type validation) improve interaction but do not validate hostile requests at the server. A form's successful controls produce `FormData`; disabled controls and nameless fields have different serialization behavior from successful named controls. React's function-valued `action` receives the submitted `FormData` in a Transition. `formAction` on submit controls can select a different Action. On successful Action completion React resets uncontrolled fields; controlled values must be updated by application state. When manually handling `onSubmit`, `preventDefault()` stops the browser's default navigation; if the event is prevented, the form Action is not run. [React form](https://react.dev/reference/react-dom/components/form) [React 19](https://react.dev/blog/2024/12/05/react-19)

### Resources and document placement

React can hoist eligible metadata/resource components such as `<title>`, `<meta>`, links, styles, and scripts into the document head even when rendered from a page-level component. Resource-specific rules determine whether React deduplicates, waits for a stylesheet, or treats an element specially. `<link rel="stylesheet">` and `<style>` use `precedence` to order styles; it is not the browser's CSS specificity and not a guarantee that every framework leaves ordering to the application. Frameworks often own resource loading, so direct preloads should not duplicate their strategy. [React DOM components](https://react.dev/reference/react-dom/components) [React link](https://react.dev/reference/react-dom/components/link) [React style](https://react.dev/reference/react-dom/components/style)

### Portals separate DOM placement from React ownership

`createPortal(children, domNode, key?)` changes where the browser DOM nodes are physically placed. The portal remains a child in the React tree: it keeps context and React event propagation through its React ancestors. The target DOM node must already exist, and changing the target recreates portal content. Portals do not provide focus trapping, keyboard management, modal semantics, or cleanup of a target node owned by another system; those remain application responsibilities. [createPortal](https://react.dev/reference/react-dom/createPortal)

### Resource hints are requests, not guarantees

The `react-dom` resource functions range from cheap domain preparation to actively executing code: `prefetchDNS` resolves a host; `preconnect` opens a likely connection; `preload` fetches a specific resource; `preloadModule` fetches an ESM module without evaluating it; `preinit` fetches/evaluates a script or inserts a stylesheet; and `preinitModule` fetches/evaluates an ESM module. Browsers may ignore hints and resources may still fail. Each has options with security/CORS/cache implications. In server rendering, hints are effective only when called during rendering or a render-originated async context. Use them sparingly and coordinate with the framework. [React DOM APIs](https://react.dev/reference/react-dom) [React preload](https://react.dev/reference/react-dom/preload) [React preinit](https://react.dev/reference/react-dom/preinit)

### Imperative APIs and removed roots

`flushSync` forces pending React updates to commit to the DOM before returning; it can flush unrelated work, effects, or Suspense fallbacks and hurt performance. `requestFormReset` requests reset of uncontrolled React-managed form fields after an Action/Transition. Prefer declarative state and native event handling unless an integration truly needs the timing guarantee. React 19 removed `render`, `hydrate`, `unmountComponentAtNode`, `findDOMNode`, and legacy streaming server renderers; client roots now use the `react-dom/client` root APIs, while server rendering uses the current server/static entry points. [flushSync](https://react.dev/reference/react-dom/flushSync) [requestFormReset](https://react.dev/reference/react-dom/requestFormReset) [React DOM APIs](https://react.dev/reference/react-dom)

## Mechanisms and relationships

| Requirement | Mechanism | Important boundary |
|---|---|---|
| Keep UI value synchronized with React state | Controlled form props + `onChange` | Update from the input event; do not switch modes |
| Read a form submission with native navigation | URL-valued `action` + method | Browser performs normal submission |
| Run React submission logic | Function `action`/`formAction` | Action gets `FormData`, runs in a Transition, requires server security if remote |
| Show parent form pending state | `useFormStatus` inside a descendant | Calling it in the component that returns the form does not observe that form |
| Put overlay DOM outside clipping ancestor | `createPortal` | React context/events still follow logical tree |
| Ensure DOM is updated before a legacy imperative API runs | `flushSync` | Last resort; can flush pending work/fallbacks |
| Prepare a future cross-origin fetch | Resource hint function | Browser hint can be ignored; framework may already handle it |

## Worked examples

### Controlled field with stable React value

```jsx
function SearchField() {
  const [query, setQuery] = useState('');
  return <label>
    Search
    <input name="query" value={query} onChange={event => setQuery(event.target.value)} />
  </label>;
}
```

The `value` is always a string and state is updated from the input's current value. The label supplies the accessible name. A `defaultValue` field would instead let the browser own subsequent edits. [React input](https://react.dev/reference/react-dom/components/input)

### Portal preserves React ancestry

```jsx
function DialogLayer({ children, overlayRoot }) {
  return createPortal(children, overlayRoot);
}
```

`overlayRoot` must be an existing DOM node. The portal's physical ancestor is different, but context and React event propagation remain tied to the component that calls `createPortal`. The snippet does not implement focus management or modal accessibility. [createPortal](https://react.dev/reference/react-dom/createPortal)

## Misconceptions and edge cases

- A JSX prop is not always copied literally to an HTML attribute; React has special mapping and validation rules.
- React `onFocus` and `onBlur` bubble even though native `focus`/`blur` do not; event-specific exceptions matter.
- `dangerouslySetInnerHTML` can introduce XSS; it is not a sanitizer.
- A controlled input needs an update path; otherwise React restores the rendered prop value.
- `useFormStatus` reads the nearest parent form's status and cannot observe a form rendered by the same component that calls the Hook.
- A portal changes physical DOM placement, not React tree ancestry or event ownership.
- Resource hints do not force the browser to fetch and can waste bandwidth.
- `flushSync` can make a Suspense fallback reappear and can run pending Effects before returning.
- Native constraint validation is not server-side validation.

## Knowledge checks with answers

1. **Which forms control whether React or the browser owns the input after initialization?** Controlled `value`/`checked` versus uncontrolled `defaultValue`/`defaultChecked`.
2. **Does a portal preserve context?** Yes, because it remains in the same React tree.
3. **Does a function-valued form Action honor `method="get"`?** No. Function Actions submit using POST.
4. **What does `useFormStatus` return when no parent form submission is active?** `pending` is false; `data` and `action` are null, and `method` is the documented default method value.
5. **Does React guarantee that `preload()` downloads the resource?** No. It provides a hint to the browser.

