# React DOM components forms resource hints portals and preload APIs — Exercises and worked solutions

## Goals

Practice controlled form state, Action-based submission, event cancellation, portals, and resource hint selection.

## Worked example

### Controlled search field

Work through each task before reading the solution sketch. Use a React 19 application and verify browser behavior rather than assuming a hint guarantees a fetch or that a controlled field resets itself.

## Exercises

### Task 1: Controlled search field

Build a search field whose value is controlled, submits on Enter, and has a clear button. Preserve keyboard semantics and label the field.

### Solution sketch

Use a `<label>` associated with `<input type="search" value={query} onChange={e => setQuery(e.target.value)} name="q">`; update state synchronously. Use a `<button type="button">` for clear and a submit button inside `<form>`. Do not use `defaultValue` if React state is the source of truth.

### Task 2: Multiple select payload

Create an uncontrolled multiple select named `skills`, initialized to two values, and read all submitted values.

### Solution sketch

Use `<select name="skills" multiple defaultValue={["js", "css"]}>` with options. Read `new FormData(form).getAll("skills")`; `get()` returns only one value. If controlled, use an array state value and update it from the select event.

### Task 3: Function Action and pending button

Create a form that submits to an async function Action and disables its nested submit button while pending. On success, the uncontrolled fields should clear.

### Solution sketch

Pass an async function to the form's `action`. Put the submit button in a child component that calls `useFormStatus()` from `react-dom`; render its `pending` state. The consumer must be inside the parent form in the React tree. The successful Action resets uncontrolled controls. If controlled, reset the state yourself.

### Task 4: Accessible drop target

Implement a drop target that accepts files, does not navigate to an opened file, and reports filenames. Include a non-drag alternative.

### Solution sketch

Cancel `onDragOver` with `preventDefault()` to accept the drop and cancel `onDrop` to prevent default navigation. Read files from `event.dataTransfer.files` during `onDrop`. Provide a labeled file input and keyboard-accessible controls; drag events alone are insufficient.

### Task 5: Portal dialog

Render dialog content into a stable overlay node outside the application root. Explain where context and click events travel.

### Solution sketch

Use `createPortal(dialog, overlayElement)`. Context remains from the React tree, and React events propagate through React ancestors even though DOM placement differs. Manage focus, escape handling, and cleanup deliberately; a portal by itself does not implement dialog accessibility.

### Task 6: Choose resource hints

For a likely image on the current route, an upcoming third-party origin, and a script that must execute immediately, select appropriate APIs and state their risks.

### Solution sketch

Use `preload` for a high-confidence near-term image and match `as` plus responsive candidates; `preconnect` for a likely external origin; `preinit` only when early script initialization/execution is intended. Hints are advisory and may consume bandwidth or execute code earlier than expected.

## Progressive hints

1. Controlled values are props derived from state; update state in the corresponding callback.
2. Multiple fields and repeated names require collecting all values.
3. Pending status is visible only from a component below the submitting form.
4. A drop target must cancel the drag-over default and still offer a non-drag path.
5. Portals preserve React ancestry; resource hints remain browser-advisory.

## Complete solutions

The solution sketches under each exercise are complete at the API-selection level. In an application, add styling, actual server validation, error states, and focus management appropriate to the feature.

## Tests and edge cases

- Type into the controlled search input and confirm state updates on every keystroke.
- Submit with no named field and with repeated names; compare `FormData.get()` and `getAll()`.
- Confirm uncontrolled fields reset on successful Action and controlled fields reset only after state changes.
- Try a rejected/canceled drag, a drop on a nested child, and file picker selection.
- Change a portal target and observe that its subtree is recreated.
- Inspect browser network behavior; do not assume a resource hint was honored.

## Reflection questions

- Which fields in your application should be controlled, and why?
- What behavior remains native browser behavior after adding a React event handler?
- How would you avoid duplicate resource hints when using a framework?
- What focus and keyboard behavior must a portal dialog add?

## Sources

- [React DOM form](https://react.dev/reference/react-dom/components/form)
- [React DOM components](https://react.dev/reference/react-dom/components)
- [React DOM preload](https://react.dev/reference/react-dom/preload)

## Review checklist

- Is every controlled input paired with state-updating `onChange`?
- Do successful form fields have `name` and valid submission semantics?
- Does the drop target cancel the right defaults and offer another input method?
- Is the portal destination stable, and are focus/keyboard needs addressed?
- Do resource hints match the eventual URL, type, CORS mode, and likely use?
