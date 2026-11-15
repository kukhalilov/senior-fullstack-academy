# React client hydration server streaming and static rendering APIs — Reference: Legacy-compatible non-streaming server APIs

## Scope and version

This group covers the React 19.3 non-streaming APIs from `react-dom/server`. They remain useful for constrained integrations, but React documents limited functionality compared with streaming APIs. [Server APIs](https://react.dev/reference/react-dom/server)

## How this group fits the mental model

String renderers return a string synchronously rather than controlling a stream. One produces markup intended for later hydration; the other produces static non-interactive markup.

## Supplied names explained

- `renderToString` renders a React tree to an HTML string. It can be used for server-generated markup that will be hydrated, but it does not stream and has limited behavior when rendering suspending components. Prefer streaming APIs for SSR that needs robust Suspense handling or progressive delivery.
- `renderToStaticMarkup` renders a React tree to a non-interactive HTML string. It is appropriate for output that will not be hydrated; it omits React behavior needed for hydration. It is not a faster spelling of `renderToString` when interactivity is required.

## Cross-item comparison

`renderToString` produces hydration-oriented markup but has no streaming and limited Suspense support. `renderToStaticMarkup` produces non-interactive output and is not for hydration. If the application needs awaited Suspense content, streaming or static prerender APIs provide better fit than either string method.

## Examples

```jsx
import { renderToString, renderToStaticMarkup } from 'react-dom/server';

const interactiveShell = renderToString(<App />);
const emailFragment = renderToStaticMarkup(<EmailSummary />);
```

`interactiveShell` may be used as server markup for the matching client tree; `emailFragment` is static output and should not be hydrated.

## Common mistakes

- Hydrating output from `renderToStaticMarkup`.
- Assuming `renderToString` streams or fully waits for suspended content.
- Choosing a string API solely because it is easy to concatenate.
- Treating either function as a complete HTML document builder with security/response handling included.

## Knowledge checks with answers

1. Which string renderer is intended for non-interactive markup? `renderToStaticMarkup`.
2. Which can produce markup for later hydration? `renderToString`, with a matching client tree.
3. Do either of these APIs stream? No.
4. What should be considered for Suspense-heavy SSR? The streaming or prerender APIs.

## Sources

- [Server React DOM APIs](https://react.dev/reference/react-dom/server)
