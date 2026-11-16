# React function and class components JSX props and events — Interview questions and reasoning

Sources: React 19.3 [Your First Component](https://react.dev/learn/your-first-component), [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [Passing Props](https://react.dev/learn/passing-props-to-a-component), [Conditional Rendering](https://react.dev/learn/conditional-rendering), [Rendering Lists](https://react.dev/learn/rendering-lists), [Responding to Events](https://react.dev/learn/responding-to-events), and [`Component`](https://react.dev/reference/react/Component).

## Core questions

1. What is a React component and how do you compose components?
2. Compare function and class components.
3. Why do custom JSX identifiers start uppercase?
4. How is JSX different from HTML?
5. How do JavaScript expressions enter JSX?
6. What are props and are they mutable?
7. How do defaults and `children` work?
8. Compare conditional rendering techniques.
9. Why map data to JSX with stable keys?
10. How do you pass an event handler correctly?
11. Compare `preventDefault` and `stopPropagation`.
12. What is a synthetic event's `currentTarget`?
13. How can a child communicate an action to its parent?

## Concise interview answers

1. A component is a reusable UI unit returning React nodes; composition nests components through JSX.
2. Functions are recommended for new code and work with Hooks; class components remain supported and use `render`, `this.props`, and class APIs.
3. JSX treats capitalized names as component values and lowercase names as host tags.
4. JSX is JavaScript syntax with expression braces, React attribute names, balanced/self-closing syntax, and a single expression root.
5. Put an expression inside `{}`; statements like `if` belong outside the expression.
6. Props are parent-to-child read-only inputs and may contain any JS value.
7. Destructuring defaults apply to missing/undefined; nested JSX populates `children`, while named content props create explicit slots.
8. Use `if`/early return, `&&`, or `?:` according to readability; remember JavaScript operand behavior.
9. `map` renders each item; stable keys preserve sibling identity across insertion/reorder.
10. Pass a function reference or arrow adapter; do not call it during render.
11. `preventDefault` cancels browser behavior; `stopPropagation` stops ancestor event handlers.
12. `currentTarget` is the element whose handler is executing; `target` may be a nested origin.
13. Pass a callback prop from parent to child; child invokes it in response to the user event.

## Deep follow-up answers

### When is a component extraction useful?

When a piece has a meaningful responsibility, reusable interface, or complexity boundary. Extraction should improve ownership and communication, not merely shrink a file. Avoid defining component functions inside a parent render because it creates a new component type.

### What is the risk of spread props?

It forwards every enumerable property, including values the host element may not support or internal props not intended for DOM. Filter/consume values and place overrides deliberately; `key` and `ref` are special React fields.

### Why can `&&` show a number?

JavaScript's `&&` returns one operand. With a left value of zero, the expression is zero, and React renders it as text. Compare explicitly (`count > 0`) or use a ternary.

## Scenario questions

1. **Click handler fires on every render.** It was called instead of passed; wrap it in a function or pass its reference.
2. **Parent click runs after child click.** Events bubble; stop propagation only if parent behavior should not occur.
3. **Form reloads after submit.** Prevent the native default in submit handler or use appropriate form Action patterns in the dedicated topic.
4. **Prop default fails for null.** Defaults apply to undefined/missing; handle null explicitly.
5. **Reusable child must trigger parent search.** Accept a callback prop, invoke it at the interaction boundary, and keep state ownership deliberate.

## Tradeoffs and alternatives

Choose function components for new work, class only for supported legacy patterns/error boundaries; use children for a primary content slot and named props for multiple slots; use named handlers for clarity and inline closures for short argument adaptation.

## Common weak answers

Avoid saying JSX is HTML, props are mutable state, `onClick={fn()}` registers a handler, default props replace null, or stopping propagation prevents the browser default.

## Self-check rubric

A strong answer explains ownership, JavaScript semantics, React-specific JSX rules, and event timing. Give one point for each; revisit answers that use imprecise “HTML attribute” language without noting JSX conversion.
