# React DOM components forms resource hints portals and preload APIs — Reference: React form component APIs

## Scope and version

This lesson covers React 19.3 DOM form components and React-specific controlled value, Action, and reset behavior. HTML still defines native form semantics. [Form](https://react.dev/reference/react-dom/components/form)

## How this group fits the mental model

React renders familiar browser elements with explicit rules for values, submission, and reset. Native HTML still defines constraints, successful controls, focus, and browser validation. Use a controlled field when React state must be the source of truth; use an uncontrolled field when the DOM should own its current value and the form submission/reset lifecycle is sufficient. [Form](https://react.dev/reference/react-dom/components/form) [Input](https://react.dev/reference/react-dom/components/input) [Select](https://react.dev/reference/react-dom/components/select) [Textarea](https://react.dev/reference/react-dom/components/textarea)

## Supplied names explained

### Form and submit controls

`<form>` accepts ordinary form attributes and can receive `action` as a URL or a function Action. A function Action receives `FormData`; React runs it as an Action/Transition and resets uncontrolled fields after successful completion. `method prop` and `encType prop` apply to native URL submission; function Actions use POST semantics. `noValidate prop` disables native constraint validation at the form level, while `required prop` contributes a browser constraint on applicable controls.

`<button>` and submit-capable `<input>` controls may override the parent form with `formAction`, `formMethod prop`, `formEnctype prop`, `formNoValidate prop`, and `formTarget prop`. A function-valued `formAction` chooses the Action for that submit control. The `form attribute` associates a control with a form by ID even when it is outside the form's DOM subtree. Button `type` matters: an omitted type inside a form defaults to submit in HTML, so specify `type="button"` for non-submit actions.

When an Action receives `FormData`, fields need a `name prop` to appear. Repeated names can yield multiple values; use `getAll()` where appropriate. `multiple prop` on a select produces multiple values. `FormData submission payload` includes successful controls, not every rendered field: disabled controls and unnamed controls are excluded, and unchecked checkboxes/radios do not contribute values. `formAction on submit controls` is the override mechanism just described, not a separate event.

## Controlled and uncontrolled values

For `<input>`, use `value prop` with `onChange` for controlled text-like values, or `checked prop` with `onChange` for controlled checkbox/radio state. Use `defaultValue prop` or `defaultChecked prop` to set only the initial uncontrolled value. `input type-specific props` such as `type`, `min`, `max`, `step`, `pattern`, `accept`, and `multiple` retain browser-defined meanings. Do not switch a field between controlled and uncontrolled during its lifetime. A controlled input must synchronously update its state from `onChange`; otherwise React restores the rendered value and typing appears blocked.

For `<textarea>`, `value`/`defaultValue` set its text; JSX children are not the value API. For `<select>`, put `value` or `defaultValue` on the parent `<select>`, not `selected` on an individual `<option>`. `select value array for multiple`: with `multiple`, the controlled `value` is an array of strings. `option selected state through parent select`: `<option>` text/value provide choices; selection is owned by the parent select. `<progress>` represents measurable progress and `<output>` presents a result; neither is a general replacement for form state.

`onChange` is React's familiar input-change callback and is the standard controlled-field synchronization point. It is not simply a one-to-one alias for the browser's native `change` event in timing. Native validation and reset still operate at the browser layer; controlled state must be updated if it should reflect a reset.

## Actions, reset, and status

`action prop` accepts a URL or function; `formAction prop` on submit controls overrides it. A function Action can be async and receive `FormData`. Calling `preventDefault()` in `onSubmit` prevents the normal submission/Action. `uncontrolled field reset after successful Action`: React resets uncontrolled fields after a successful Action; this does not reset controlled React state. `requestFormReset` requests a reset of a React-rendered form and is intended for Action workflows; controlled fields still need their state reset. `useFormStatus` reads the nearest parent form's submission status and must be called by a descendant component, not by the component that returns the form.

## Cross-item comparison

| Pair | Use |
|---|---|
| `value` / `defaultValue` | Live React-controlled value / initial DOM-owned value |
| `checked` / `defaultChecked` | Live controlled boolean / initial uncontrolled boolean |
| URL action / function action | Browser navigation submission / React Action with FormData and pending state |
| `<option selected>` / parent select value | React selection belongs to `<select value>` or `<select defaultValue>` |

## Common mistakes

- Omitting `name` and expecting a field in `FormData`.
- Forgetting `onChange` for controlled `value` or `checked`.
- Using `selected` on `<option>` instead of controlling the `<select>`.
- Forgetting the multiple-select value is an array.
- Expecting a successful Action to reset controlled React state.
- Assuming `required` or `noValidate` replaces server-side validation.
- Treating the `form` attribute as React component ownership rather than native form association.

## Examples

```jsx
function Signup() {
  return <form action={async formData => {
    await saveUser(formData.get('email'));
  }}>
    <input type="email" name="email" required defaultValue="" />
    <button>Join</button>
  </form>;
}
```

The example uses an uncontrolled field; a real server Action must validate untrusted data.

## Knowledge checks with answers

1. Which fields are omitted from normal `FormData` submission?
2. How does a multiple controlled select encode its value?
3. What must happen for a controlled input to accept typing?
4. Does a successful function Action reset controlled state?

## Answers

1. Among others, disabled or unnamed controls and unchecked checkboxes/radios.
2. As an array of selected string values.
3. Its `onChange` must synchronously update the state supplying `value` or `checked`.
4. No. React resets uncontrolled fields; application state controls controlled fields.

## Sources

- [React form](https://react.dev/reference/react-dom/components/form)
- [React input](https://react.dev/reference/react-dom/components/input)
- [React select](https://react.dev/reference/react-dom/components/select)
- [React textarea](https://react.dev/reference/react-dom/components/textarea)
- [React option](https://react.dev/reference/react-dom/components/option)
- [React DOM useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [React DOM requestFormReset](https://react.dev/reference/react-dom/requestFormReset)
