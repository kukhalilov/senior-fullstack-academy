# React DOM components forms resource hints portals and preload APIs — Interview questions and reasoning

## Core questions

1. Explain `value` versus `defaultValue` and how React handles an input reset.
2. How do a function-valued form `action` and a URL-valued `action` differ?
3. Where must a component using `useFormStatus` appear, and what does the hook expose?
4. Explain `formAction` and the related submit-control overrides.
5. How do React event capture and bubble callbacks work? Name important exceptions.
6. What is the difference between `preventDefault` and `stopPropagation`?
7. What changes when content is rendered with `createPortal`?
8. Compare `prefetchDNS`, `preconnect`, `preload`, and `preinit`.
9. What does a stylesheet `precedence` value do?
10. Which APIs replace `render` and `hydrate` in React 19?
11. Why is `flushSync` an escape hatch?
12. How do custom elements differ from standard React DOM props/events?

## Concise interview answers

1. `value` is controlled by React and needs synchronous `onChange`; `defaultValue` initializes DOM-owned state. Successful Actions/reset affect uncontrolled values, while controlled state must be updated by the app.
2. A URL action performs native navigation/submission; a function Action receives FormData and participates in React Action pending/error/status behavior. A function Action uses POST semantics and React resets uncontrolled fields after success.
3. It must be a descendant in the React tree of the form. It exposes `pending`, submitted `data`, `method`, and active `action`; it does not observe a form returned by the same component.
4. A submit control can override the parent form destination/action, method, encoding, validation, and target using `formAction`, `formMethod`, `formEnctype`, `formNoValidate`, and `formTarget`.
5. Capture traverses ancestors to target; bubble traverses back outward. React `onFocus`/`onBlur` bubble; `onScroll` does not; enter/leave events have no capture variants.
6. Default cancellation is separate from stopping event traversal.
7. DOM placement changes, but React context and React event ancestry stay with the original React tree. Target-node changes recreate portal content.
8. DNS lookup; connection establishment; fetch for later use with an `as` destination; fetch plus initialization (including possible script execution). These are advisory browser hints.
9. It establishes ordering among React-managed stylesheet resources; it is not CSS specificity or network priority.
10. `createRoot` for client rendering and `hydrateRoot` for server-rendered markup.
11. It forces synchronous DOM work and can flush unrelated updates/effects, reveal Suspense fallbacks, and harm performance.
12. Custom elements have case-sensitive/dashed event names and may receive properties on class instances; standard built-ins use React's normalized prop mapping and supported event props. React 19 improved custom-element support.

## Deep follow-up answers

- Ask the candidate to debug a controlled field that appears frozen.
- Ask why `FormData.getAll()` matters for repeated names and multiple selects.
- Ask what must match for a preload to be reused.
- Ask how a portal modal should handle focus and keyboard interaction beyond rendering.

## Scenario questions

1. A search field stops accepting keystrokes after the first character. Diagnose likely controlled-state causes.
2. A file drop zone opens the file in the browser instead of handling it. Identify the event and default to cancel.
3. A pending button never shows pending. Explain the likely placement issue with `useFormStatus`.
4. A portal's click reaches an ancestor that is not a DOM parent. Explain why.

## Tradeoffs and alternatives

- Use uncontrolled fields when native form submission and reset are sufficient; choose controlled state for immediate application synchronization.
- Prefer semantic elements and pointer events over custom mouse-only widgets.
- Use a URL form action for native navigation; use a function Action for React-managed async submission.
- Use the least resource hint that meets the need; preinit only when early initialization is intended.
- Use portals for DOM placement constraints, while separately implementing focus and modal semantics.

## Common weak answers

- “React owns every input value.” Uncontrolled fields are browser-owned after their initial value.
- “A portal moves the component to a different React tree.” It changes physical DOM placement only.
- “Preload forces a download.” It is advisory.
- “flushSync makes state updates better.” It is an expensive integration escape hatch.
- “render and hydrate are still supported.” React 19 removed them; use root APIs.

## Self-check rubric

Score each from 0 to 2: (a) distinguishes React and browser responsibilities; (b) accurately explains controlled/uncontrolled forms and Actions; (c) reasons about event phases and exceptions; (d) describes portal ancestry; (e) compares resource hints without overstating guarantees; (f) selects correct migration APIs. A strong answer scores 10–12 and can give a concrete example for each.

## Sources

- [React DOM components](https://react.dev/reference/react-dom/components)
- [React DOM hooks](https://react.dev/reference/react-dom/hooks)
- [React DOM API reference](https://react.dev/reference/react-dom)
- [React 19 release](https://react.dev/blog/2024/12/05/react-19)
