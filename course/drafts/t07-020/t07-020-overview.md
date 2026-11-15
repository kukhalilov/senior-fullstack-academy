# React DOM components forms resource hints portals and preload APIs — Big-picture orientation and mental model

## Problem and purpose

React DOM connects React's UI description to a browser document. Most JSX tags correspond to browser HTML or SVG elements. React also adds a small number of special props, event handling rules, form-control state behavior, document-resource management, portals, and loading hints. These behaviors sit beside the browser's own DOM and HTML rules, so a React DOM developer must distinguish a React prop from an HTML attribute, a React event prop from a native event, and a resource hint from a promise that the browser must obey. [React DOM Components](https://react.dev/reference/react-dom/components) [React DOM APIs](https://react.dev/reference/react-dom)

## Plain-language mental model

Think of JSX as a typed request to React: “place this browser element here, with these properties and children.” React reconciles that request into DOM nodes, applies special rules for a subset of props, and coordinates updates with the rest of the React tree. The browser still owns native form validation, focus, layout, resource loading, and actual DOM behavior. React does not replace HTML; it provides a consistent rendering and update layer around it.

Five distinct areas appear in this topic:

1. **DOM component props and events:** HTML/SVG elements, JSX property spellings, React refs, safe raw HTML boundaries, React event props, and custom elements.
2. **Form state and submission:** controlled versus uncontrolled elements, Actions, `FormData`, status reporting, and successful reset behavior.
3. **Document resources:** eligible `<link>`, `<meta>`, `<script>`, `<style>`, `<title>`, and image resources may be hoisted, deduplicated, or coordinated by React.
4. **React DOM APIs:** portals alter physical DOM placement while preserving React-tree ownership; `flushSync` and form reset are specialized imperative integration APIs.
5. **Resource hints and migration:** preload calls give the browser hints with different levels of work; old root/render APIs were removed in React 19.

## How the parts fit together

## Concept map

```text
React description
├── DOM elements, props, refs, events
├── forms: controlled state or browser-owned state
├── resources and metadata: React placement + browser loading
├── portal: different DOM location, same React ownership
└── hints and root APIs: browser preparation or integration boundary
```

```text
JSX element description
├── HTML/SVG tag + standard DOM props ── browser element and native semantics
├── React-specific prop ── ref, innerHTML boundary, style, hydration escape hatch
├── React event prop ── event handler in React's event system
├── form control ── controlled state or browser-owned value + FormData submission
├── resource/metadata tag ── browser fetch plus React head/precedence behavior
├── portal ── DOM node moved; React ownership/context/event ancestry retained
└── preload hint ── browser may fetch/prepare resource earlier
```

The same output can be correct only if both models agree: React must reconcile it safely, and the browser must interpret it with the intended native semantics. A JSX `<input value={...}>` is controlled by React; an HTML input's ordinary browser value is not. A portal moves the DOM node but not its React parent. A `<link rel="stylesheet">` has special React precedence behavior while other links do not. [Common DOM components](https://react.dev/reference/react-dom/components/common) [React form](https://react.dev/reference/react-dom/components/form) [React link](https://react.dev/reference/react-dom/components/link) [createPortal](https://react.dev/reference/react-dom/createPortal)

## End-to-end walkthrough

Consider a search page with a query field, a server-backed search action, a pending button, a stylesheet, and a dialog rendered into a top-level overlay node. The query field stores a controlled string in React state and updates it from `onChange`; its `name` makes it part of form data. Submitting `<form action={search}>` passes `FormData` to the Action, marks the submission as a Transition, and resets uncontrolled fields after success. A child button can call `useFormStatus()` to show pending state, but it must be rendered inside the form it observes. The stylesheet may be rendered near the page component; eligible React resource components can be placed in the document head and stylesheets with `precedence` participate in React's ordering. The dialog uses `createPortal` to render outside an overflow-clipped container; context and React event propagation still follow the original React tree. [React form](https://react.dev/reference/react-dom/components/form) [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) [React link](https://react.dev/reference/react-dom/components/link) [createPortal](https://react.dev/reference/react-dom/createPortal)

Each layer has separate responsibility. The browser enforces native constraints; application code still validates on the server. An Action's generated remote reference is not authorization. The browser may ignore a preload hint, and excessive hints waste bandwidth. A portal does not automatically trap focus or make a dialog accessible.

## When to use it and tradeoffs

Use native DOM components for browser behavior and accessibility semantics; use React state for values that must drive rendered output. Prefer controlled form fields when each edit must immediately affect React state, and uncontrolled fields when the browser can own the value until submission. Use Actions for React-integrated submission/pending/reset behavior. Use `createPortal` when DOM placement needs to escape a local stacking/overflow context but the content should remain part of the same React tree. Use resource hints only when early loading is justified and the framework does not already manage the resource.

React DOM APIs such as `flushSync` are escape hatches. They can interfere with scheduling and Suspense, so use them only for a measured integration requirement. Raw HTML (`dangerouslySetInnerHTML`) bypasses React's normal child rendering and creates an XSS risk unless the content is trusted or safely sanitized. A hint such as `preload` communicates intent; it does not guarantee download, cache retention, or successful use. [Common DOM components](https://react.dev/reference/react-dom/components/common) [flushSync](https://react.dev/reference/react-dom/flushSync) [React DOM APIs](https://react.dev/reference/react-dom)

## What later lessons cover

Reference lessons enumerate shared props/custom elements; every supplied event prop and its bubbling/capture distinctions; form controls and submission Actions; resource and metadata components; React DOM APIs; preload APIs; and React 19 removed APIs. Practice assembles a working form/portal/resource design and diagnoses controlled-state bugs. The interview lesson checks whether you can separate React behavior from native browser behavior.

## Version context

React 19 introduced function-valued `action`/`formAction`, reset of uncontrolled fields after successful Actions, broader custom-element support, new resource preloading APIs, and removal of old `render`/`hydrate` entry points. React 19.3 adds Trusted Types support; this is not a substitute for safe HTML handling. Always verify the installed `react` and `react-dom` pair and the framework's rendering integration. [React 19](https://react.dev/blog/2024/12/05/react-19) [React 19.3](https://react.dev/blog/2026/09/09/react-19-3) [React versions](https://react.dev/versions)

## What is covered elsewhere

The native definition, content model, and complete standard tag/attribute inventories are taught in the HTML and forms topics. This topic focuses on how React DOM maps JSX to browser components, the extra React behavior, and the specific APIs supplied in its manifest. Browser-native DOM event APIs and accessibility patterns have their own topics. [React DOM Components](https://react.dev/reference/react-dom/components) [HTML components topic](https://react.dev/reference/react-dom/components)

