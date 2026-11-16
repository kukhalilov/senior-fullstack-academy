# React DOM rendering modes hydration and host integration — Exercises and worked solutions

Sources: React 19.3 [React DOM client APIs](https://react.dev/reference/react-dom/client), [React DOM server APIs](https://react.dev/reference/react-dom/server), [React DOM static APIs](https://react.dev/reference/react-dom/static), and [Suspense](https://react.dev/reference/react/Suspense).

## Goals

Select an appropriate rendering mode, preserve hydration agreement, and account for stream/runtime, caching, privacy, and progressive enhancement constraints.

## Prerequisites

Understand React rendering, Suspense, browser HTML, and the mode reference lessons.

## Worked example

A public article page has stable content and a private “saved” button. Generate the article statically if its content freshness policy allows. Keep the per-user saved state behind an authorized API or user-specific server boundary; do not bake it into a shared static file. Hydrate the button when client code is ready and preserve a meaningful link or fallback behavior.

## Exercises

### Exercise 1: Identify the mismatch

The server renders a date in UTC. The first client render uses the browser’s local timezone and warns that the text differs. Give a robust fix.

#### Worked solution

Make initial output deterministic by using an explicit timezone and locale shared on both sides, or render a stable placeholder and convert to local time after hydration. Pass the same data snapshot to the browser. Do not merely suppress the warning.

### Exercise 2: Choose static or request rendering

A help center changes twice per month, while an account statement page contains private per-user balances. Which output strategies are defensible?

#### Worked solution

The help center can be statically generated if a defined rebuild/revalidation process meets freshness needs. Account statements must be tied to authenticated user data and must not be served from a shared cache; use secure request-time rendering or client fetching from an authorized endpoint with correct cache controls.

### Exercise 3: Evaluate streaming

A page’s main content is ready quickly but a recommendations panel may take two seconds. What boundary and deployment checks matter?

#### Worked solution

Keep ready main content outside the recommendation Suspense boundary and give the panel a meaningful, layout-stable fallback. Confirm the framework and runtime support streaming and that compression, proxy, and CDN behavior do not buffer the whole response. Handle errors and client hydration of the later boundary.

### Exercise 4: Distinguish server HTML from interactive UI

The first response contains a button. Does that prove React has hydrated it?

#### Worked solution

No. The browser can display server HTML before client JavaScript. Native button semantics exist, but React event handlers and state updates are not attached until the boundary hydrates. Test before and after client code loads and provide sensible progressive behavior where required.

### Exercise 5: Debug invalid nesting

Server output nests a paragraph inside another paragraph. The browser repairs the DOM before hydration, causing mismatch. What is the root repair?

#### Worked solution

Render valid HTML structure so the browser’s parsed DOM matches the React tree. Inspect generated markup and component composition; warning suppression cannot undo parser repair.

## Progressive hints

Ask when the content is known, whether it contains user-specific data, what the browser receives first, and whether the first client tree matches. For streaming, verify every runtime layer from React through CDN.

## Complete solutions

Solutions appear under each exercise. Other choices may be valid if they meet freshness, privacy, interactivity, and delivery requirements explicitly.

## Tests and edge cases

Exercise with slow JavaScript, slow data, no JavaScript, reconnects, browser-local timezones, invalid markup, private sessions sharing a CDN, and deployment-level buffering. Verify status codes, cache headers, hydration warnings, and content stability.

## Reflection questions

Which user-visible metric did the mode improve? Which new infrastructure, cache, or consistency obligation did it create? How will you detect hydration or static freshness defects in production?
