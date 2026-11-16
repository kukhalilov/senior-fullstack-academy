# React function and class components JSX props and events — Big-picture orientation and mental model

Sources: React 19.3 [Your First Component](https://react.dev/learn/your-first-component), [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [Passing Props](https://react.dev/learn/passing-props-to-a-component), [Conditional Rendering](https://react.dev/learn/conditional-rendering), [Rendering Lists](https://react.dev/learn/rendering-lists), [Responding to Events](https://react.dev/learn/responding-to-events), and [`Component`](https://react.dev/reference/react/Component).

## Problem and purpose

Components divide an interface into reusable pieces. JSX describes the element tree; props carry parent-provided inputs; ordinary JavaScript determines which nodes appear; event handler functions connect interactions to behavior. These pieces form the basic vocabulary for building React interfaces.

## Plain-language mental model

A component is a function (usually) that receives one props object and returns React nodes. JSX is JavaScript syntax that creates element descriptions. A parent passes values to a child through props, including functions or JSX content. An event handler is a function reference React invokes later in response to interaction; passing it is different from calling it during render.

## How the parts fit together

```text
parent component → props/children → child component → JSX element descriptions
ordinary JS branches/maps choose output
user interaction → React calls passed handler → callback behavior
```

## Concept map

Use capitalized identifiers for custom components and lowercase identifiers for host tags. Compose components by nesting JSX. JSX resembles HTML but has JavaScript expression braces, JSX attribute conventions such as `className`/`htmlFor`, object style values, and a single-root syntax rule (use a Fragment if no wrapper is desired). Props are read-only; defaults and explicit forwarding define a component contract. Conditional returns, `&&`, ternaries, and `map` use normal JavaScript semantics. Keys for mapped elements are required for sibling identity and are covered in t07-003.

## End-to-end walkthrough

`<SearchForm onSearch={handleSearch} initialQuery="React">` passes string and function values to a child. The child renders an input and button with JSX and attaches `onSubmit={handleSubmit}`. When the user submits, React invokes the handler with a synthetic event; the handler can call `preventDefault()` to stop native form navigation, then call the callback prop. Event bubbling proceeds through ancestors unless stopped; capture handlers use the `Capture` suffix.

## When to use it and tradeoffs

Prefer function components for new work. Class components remain supported and use `Component`, `render()`, `this.props`, constructor/defaultProps/context conventions, and lifecycle methods covered separately. Keep components focused and compose rather than building giant conditional trees. Use callback props for child-to-parent notifications while keeping presentation reusable.

## What later lessons cover

The references cover function/class components, JSX, props/children, conditional/list rendering, and event handlers. Later topics cover state hooks, DOM-specific attribute/event APIs, form Actions, refs/effects, render identity, and class error boundaries.
