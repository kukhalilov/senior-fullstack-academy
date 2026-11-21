# React effects refs imperative handles and external systems — Reference: Effect setup lifecycle and dependencies

Sources: React 19.3 [`useEffect`](https://react.dev/reference/react/useEffect), [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), and [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Scope and version

This reference explains `useEffect` setup/cleanup and dependency behavior. Timing variants are in the next lesson; this is not an exhaustive browser API or data-fetching framework guide.

## Setup and synchronization cycle

`useEffect(setup, dependencies?)` declares an Effect at the top level. On a commit React invokes the setup function. Setup can return an Effect cleanup function; it must be synchronous as a return value (an `async` setup would return a Promise, not cleanup). When dependencies differ from the prior commit, React calls cleanup with the old closure values before setup with new ones. On unmount/removal, cleanup runs. An Effect with no dependency argument reruns after every commit of that component; an empty array runs for the initial synchronization and cleanup at removal, with Strict Mode development stress behavior; a dependency list reruns when any listed reactive value changes.

Dependencies are all reactive values read by setup: props, state, and variables/functions declared in the component. The list must be inline, fixed length, and ordered. React compares each entry with `Object.is`. If an object/function is recreated every render, it changes identity and can cause resynchronization. Prefer constructing values inside setup or extracting stable logic rather than suppressing exhaustive-deps checks. Dependencies are determined by code; they are not a manual scheduling switch.

## Purpose: external synchronization only

Use an Effect to connect/disconnect, subscribe/unsubscribe, synchronize a third-party widget, or interact with browser APIs that must track committed React values. An event handler is better when work is caused by one particular interaction. A derived display value belongs in render. Copying props into state via Effect adds an extra render and synchronization hazards. Framework data-loading APIs may offer better caching/navigation behavior than fetching in Effects.

Async work needs cleanup: abort with `AbortController` when supported, or set an `ignore`/generation guard so stale results cannot commit after dependencies change. Cleanup does not undo a request already processed by a server; side effects should be idempotent where possible. Handle errors and loading state deliberately.

## Example

```js
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
    .then(response => response.json())
    .then(setResults)
    .catch(error => {
      if (error.name !== 'AbortError') setError(error);
    });
  return () => controller.abort();
}, [query]);
```

This illustrates aborting stale work; production code should check HTTP status, validate response shape, handle races where cancellation is unsupported, and consider framework/router data APIs.

## Cross-item comparison

| Dependency form | Synchronization behavior |
|---|---|
| Omitted | After every commit |
| `[]` | Initial setup and cleanup on removal (plus dev stress check) |
| `[a, b]` | Initial setup and when `Object.is` detects a changed dependency |

`Effect setup function` establishes an external relationship; `Effect cleanup function` stops/reverses it. “Effect synchronization cycle” means setup/cleanup follows current committed inputs, not a one-time mount callback.

## Common mistakes

Omitting a reactive dependency; using an empty list to suppress a real dependency; returning a Promise from async setup; setting derived state in an Effect; not aborting/ignoring stale results; and cleanup that closes over new rather than old values.

## Knowledge checks with answers

1. **What follows setup?** Optional cleanup function.
2. **What happens before changed dependency setup?** Cleanup with old values.
3. **Can dependencies be computed dynamically?** No; inline fixed-length list.
4. **What belongs in an Effect?** Synchronization with an external system.

## How this group fits the mental model

The Effect hook maintains a relationship between a committed component and an external system as reactive inputs change.

## Supplied names explained

The exact inventory below includes signature, setup/cleanup, dependencies, equality, trigger timing, cleanup cases, and omitted/empty list behavior.

## Examples

The search request demonstrates a dependency-driven synchronization and stale-request cancellation.

## Exact terms covered

### Exact terms covered

- `useEffect(setup, dependencies?)`
- `Effect setup function`
- `Effect cleanup function`
- `Reactive Effect dependency`
- `Dependency list`
- `Object.is dependency comparison`
- `Effect after commit`
- `Effect rerun after changed dependencies`
- `Cleanup before changed-dependency setup`
- `Cleanup after unmount`
- `Effect with empty dependency list`
- `Effect with omitted dependency list`
- `Effect synchronization cycle`
