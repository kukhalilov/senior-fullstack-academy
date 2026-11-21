# React function and class components JSX props and events — Reference: Component props and children

Sources: React 19.3 [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) and [Your First Component](https://react.dev/learn/your-first-component).

## Scope and version

Props are parent-provided component inputs. This lesson covers their shape and composition role, not component-local state or every DOM attribute.

## Props as a component contract

Every function component receives one props object. Destructure what it needs in the parameter (`function Avatar({ person, size = 100 })`). Props are read-only; a child may derive values but should not mutate an object supplied by its parent. Props can carry any JavaScript value: strings, numbers, booleans, objects, arrays, functions, elements, and other nodes. TypeScript can document/check the contract, but runtime values still require suitable validation at trust boundaries.

Default values in parameter destructuring apply when a prop is missing or `undefined`; an explicit `null` remains null. Defaults should be simple and stable. A `children` prop is the conventional slot populated by nested JSX between component tags. A component can also define named content props such as `header` or `footer` when several slots make the API clearer. JSX as children supports composition: parent controls the content while the child controls placement/presentation.

Prop forwarding passes some or all received props to a child/host element. `{...props}` is concise but can leak internal props, override local invariants, or send invalid attributes to the DOM. Prefer explicit forwarding or remove consumed props. React's special `key`/`ref` handling is not equivalent to ordinary props; pass an identifier explicitly if needed.

Props and component-local state have different owners: props flow from a parent; local state is owned by a component identity. If the child needs to request a change, a callback prop can communicate intent upward; the state/data ownership pattern is developed in t07-007.

## Example

```jsx
function Dialog({ title, children, footer = null }) {
  return <section role="dialog">
    <h2>{title}</h2>
    <div>{children}</div>
    {footer !== null && <footer>{footer}</footer>}
  </section>;
}

<Dialog title="Confirm" footer={<button>Save</button>}>
  Are you sure?
</Dialog>
```

The `children` and named `footer` prop are both JSX values. The component chooses where to render them. The default applies only if `footer` is undefined/missing; a caller may explicitly pass `null` to hide it.

## Comparison and mistakes

| Input | Owner | Typical direction |
|---|---|---|
| Props | Parent | Parent → child |
| Local state | Component identity | Updated by that component's event logic |
| `children` | Parent supplies; child positions | Composition slot |
| Named content prop | Parent supplies; child positions | Multiple explicit slots |

Avoid mutating props; using `children` for unrelated scalar metadata; blindly spreading unknown values onto DOM; assuming `null` triggers a destructuring default; and confusing a callback prop with a child's own state.

## Knowledge checks with answers

1. **What default applies for `size = 100`?** Missing/undefined, not explicit null.
2. **Can props contain functions or JSX?** Yes; any JavaScript value can be passed.
3. **Who decides where children render?** The child component.
4. **Why avoid blind spread?** It can leak/internalize props or create invalid host attributes.

## How this group fits the mental model

Props carry inputs through the component tree and children/content slots let parents compose UI while children control presentation.

## Supplied names explained

The exact inventory below covers props object/destructuring, mutability, supported value types, defaulting, children, named content, and forwarding.

## Cross-item comparison

`children` is a conventional unnamed slot; named content props define multiple labeled slots; prop forwarding is a transport convenience, not a public contract by itself.

## Examples

The `Dialog` example demonstrates both composition styles and default semantics.

## Exact terms covered

### Exact terms covered

- `Props object`
- `Props destructuring`
- `Props are read-only`
- `JavaScript values as props`
- `Default prop value in parameter destructuring`
- `children prop`
- `JSX as children`
- `Named content props`
- `Prop forwarding`

## Common mistakes

Mutating props, assuming null triggers a default, blindly forwarding all props, and using several unnamed content slots instead of clear named props.
