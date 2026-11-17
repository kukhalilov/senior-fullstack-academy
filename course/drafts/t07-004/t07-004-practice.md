# React function and class components JSX props and events — Exercises and worked solutions

Sources: React 19.3 [Your First Component](https://react.dev/learn/your-first-component), [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [Passing Props](https://react.dev/learn/passing-props-to-a-component), [Conditional Rendering](https://react.dev/learn/conditional-rendering), [Rendering Lists](https://react.dev/learn/rendering-lists), [Responding to Events](https://react.dev/learn/responding-to-events), [Common React DOM components](https://react.dev/reference/react-dom/components/common), and [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide).

## Goals

Write components/JSX, design prop and child contracts, choose conditional/list output, and reason about event handlers and propagation.

## Worked example

```jsx
function Results({ items, onSelect, children }) {
  if (items.length === 0) return <p>No results</p>;
  return <section>{children}<ul>{items.map(item =>
    <li key={item.id}><button onClick={() => onSelect(item.id)}>{item.name}</button></li>
  )}</ul></section>;
}
```

The parent supplies data, callback, and optional content. The component returns an empty state or mapped output. The key is stable identity; callback is passed and called after interaction.

## Exercises

### 1. Fix JSX syntax

```jsx
return <div class="box"><h2>Hi<h2><img src={url}></div><span>Done</span>;
```

**Solution:** Use one root, React attribute names, and closed tags: `return <><div className="box"><h2>Hi</h2><img src={url} /></div><span>Done</span></>;`. A Fragment groups the two siblings without a wrapper.

### 2. Choose a component boundary

A page repeats a user avatar and label in a profile header and comment list. Should each be extracted?

**Solution:** Extract a focused `UserBadge` if its interface/presentation is reused or clarifies ownership. Pass user data as props. Avoid extracting every one-line expression if it makes the component tree harder to follow.

### 3. Understand defaults

`function Panel({ title = 'Untitled' })` receives `title={null}`. What renders?

**Solution:** The default does not apply to null; it applies to undefined/missing. Handle null explicitly if it is a supported input state.

### 4. Fix zero conditional

`{cartCount && <CartBadge count={cartCount} />}` displays `0` when empty.

**Solution:** Use `cartCount > 0 && <CartBadge count={cartCount} />` or a ternary returning `null`. The issue is JavaScript's operand-returning `&&`, not JSX syntax.

### 5. Fix accidental handler call

`<button onClick={saveOrder(orderId)}>Save</button>` submits during render.

**Solution:** Pass a function: `<button onClick={() => saveOrder(orderId)}>Save</button>`. Or define `handleSave` and pass its reference. Use correct form semantics if it is a submit button.

### 6. Stop navigation but keep propagation

A form submit should not reload the page, but parent analytics should still receive the event.

**Solution:** Call `event.preventDefault()` in `onSubmit`. Do not call `stopPropagation()` unless parent handlers should also be suppressed.

### 7. Identify the correct target

A click handler is attached to a card containing an icon. It needs the card element for measurement, not the icon that initiated the click.

**Solution:** Read `event.currentTarget`; `event.target` may be the nested icon. Copy needed values during the handler rather than retaining the event/DOM node.

### 8. Use named content props

A reusable card needs a title, body, and optional actions slot. Design its inputs.

**Solution:** `function Card({ title, children, actions = null })` gives `children` the main body and `actions` a named slot. Document default/null semantics and render each slot in the intended position.

### 9. Fix React-specific markup and style rules

Convert `<label for="email" style="margin-top: 8px" data-id="x">Email</label>` to valid React JSX.

**Solution:** `<label htmlFor="email" style={{ marginTop: 8 }} data-id="x">Email</label>`. React uses `htmlFor`; `data-*` remains hyphenated; `style` is an object, with `marginTop: 8` converted to `8px` by React DOM.

### 10. Diagnose missing ancestor scroll handling

A parent `<div onScroll={handleScroll}>` does not run when a nested scroll container scrolls. Is this propagation broken?

**Solution:** No. React `onScroll` does not bubble; attach it to the element whose scroll you need to observe or use an appropriate native listener/observer for the desired behavior.

## Progressive hints

For JSX errors, check one markup root, balanced tags, React attribute spelling and style object rules. For props, identify who owns each value. For events, ask whether the function is passed or executed now, then distinguish browser default from propagation and remember `onScroll`'s exception.

## Complete solutions

Each exercise contains a complete correction and reasoning. Exercise inputs intentionally omit broader state/API concerns handled in other modules.

## Tests and edge cases

Test missing versus null props; false/zero conditional values; empty and reordered lists; button/form type; nested bubbling and capture; default prevention; and callback argument flow.

## Reflection questions

Does the component API communicate ownership? Is a child asking for a behavior through a callback? Would a named slot or `children` make composition clearer? Which DOM/native behavior does the handler change?
