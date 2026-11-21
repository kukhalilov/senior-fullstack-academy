# React function and class components JSX props and events — Reference: Supported class component surface

Sources: React 19.3 [`Component`](https://react.dev/reference/react/Component).

## Scope and version

Class components remain supported in React 19.3, though React recommends function components for new code. This lesson covers construction/props/render basics, not the complete legacy lifecycle or error-boundary API.

## Class structure

A class component extends React's `Component` base class and defines a `render()` method that returns React nodes. `this.props` provides its read-only inputs. A `constructor(props)` is only needed for initialization/custom class behavior; call `super(props)` before using `this`. If no constructor work is needed, omit it and let the base class handle construction.

`static defaultProps` supplies defaults for missing/undefined props in supported class component behavior; function components commonly use parameter destructuring defaults. `static contextType` declares the context object consumed through `this.context`; modern context usage is usually taught with function hooks. These static properties are attached to the class definition, not per-instance state.

Classes are supported for existing code, some legacy integrations, and error boundaries (where class APIs remain relevant). For new general UI components, functions offer simpler composition with Hooks and are recommended. Do not mix class lifecycle assumptions into function components; their state/effect model is different.

## Example

```jsx
import { Component } from 'react';

class Greeting extends Component {
  static defaultProps = { name: 'friend' };

  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

The class receives props from JSX and returns a description from `render`; it should not mutate props or perform side effects there. The same simple presentation can usually be written as a function component.

## Comparison and mistakes

| Class concept | Function component counterpart |
|---|---|
| `this.props` | Function parameter/props destructuring |
| `render()` | Function return value |
| `static defaultProps` | Parameter default values for common cases |
| `static contextType` | Context hook in function components |

Avoid reading `this` before `super(props)`, mutating props, performing side effects in `render`, and introducing classes for new code without a concrete reason.

## Knowledge checks with answers

1. **What method returns class component output?** `render()`.
2. **When call `super(props)`?** In a custom constructor before accessing `this`.
3. **Are class components removed?** No; supported, but not recommended for new general components.
4. **Where do class defaults live?** `static defaultProps` on the class.

## How this group fits the mental model

Class components provide an alternate component type that React can render and reconcile; their `render()` still returns React node descriptions.

## Supplied names explained

The exact list below covers the supported base class, render/props/constructor members, static defaults/context, and recommendation boundary.

## Examples

The `Greeting` class above shows the smallest typical class-based rendering surface.

## Common mistakes

A class `render()` must remain pure; do not use it as a lifecycle callback or mutate input props.

## Exact terms covered

### Exact terms covered

- `Class component`
- `Component`
- `render()`
- `this.props`
- `constructor(props)`
- `super(props)`
- `static defaultProps`
- `static contextType`
- `Class components supported but not recommended for new code`

## Cross-item comparison

Class props are read through `this.props`; function props are parameters. Both return React nodes as render descriptions.
