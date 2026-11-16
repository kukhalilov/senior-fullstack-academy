# React effects refs imperative handles and external systems — Reference: Effect purpose, cleanup, and development checks

Sources: React 19.3 [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect),.

## Scope and version

This chapter is a decision framework for Effect usage, teardown, async staleness, and Strict Mode. Specific APIs and dependencies are in the previous references.

## Decide whether an Effect is needed

An Effect is for synchronizing with an external system React does not own: a connection, subscription, browser API, timer, or imperative widget. If the value can be calculated from current props/state during render, derive it there rather than setting derived state in an Effect. If work is caused by a known click/submit, put it in that event handler rather than inferring it later from state changes. Effects are not general “run after render” callbacks.

## Setup/cleanup symmetry

Setup establishes a relationship; cleanup should undo/stop that same relationship. Connect/disconnect, subscribe/unsubscribe, add/remove listener, start/clear timer. Each setup should be independently safe; Strict Mode performs an extra development setup-cleanup cycle to detect missing cleanup. The correct fix is to make cleanup mirror setup, not to add a “run once” ref guard. Dependencies identify when a new synchronization is required.

## Async work and races

When an Effect starts asynchronous work for a dependency, a later dependency can make an earlier result stale. Use `AbortController` where supported or an ignore/generation guard in cleanup. Cleanup prevents stale results from updating current UI but cannot undo server-side effects already accepted. User-initiated mutations belong in handlers/Actions; avoid accidental duplicate POSTs from mount Effects. Use idempotency or server-side deduplication for retryable operations.

Custom Hooks can package a reusable synchronization policy, including setup/cleanup and dependency inputs. A custom Hook should express one coherent external relationship, expose simple data/actions, and follow Rules of Hooks. Provider APIs or framework data loaders may be more appropriate for shared/cacheable fetching.

## Example and alternatives

For a WebSocket keyed by `roomId`, setup creates/connects it, cleanup disconnects; dependency change cleanly swaps rooms. For `fullName = first + last`, calculate during render. For a purchase, call the mutation from the purchase handler. This separates synchronization, derivation, and event intent.

## Cross-item comparison

| Concern | Mechanism |
|---|---|
| Ongoing external relationship | Effect with cleanup |
| One interaction's work | Event handler or Action |
| Pure transformation | Render-time calculation |
| Mutable nonvisual handle | Ref |

## Common mistakes

Using Effect to copy props to state; omitting dependencies; fetching without stale-result handling; making mount Effects perform non-idempotent actions; suppressing Strict Mode checks; and writing cleanup that does not stop the system setup started.

## Knowledge checks with answers

1. **What should an Effect synchronize?** A committed component with an external system.
2. **Where should a user-triggered purchase go?** The interaction handler/Action.
3. **What should cleanup do?** Undo/stop the setup's external relationship.
4. **What is Strict Mode's extra cycle for?** Stress-testing setup/cleanup symmetry in development.

## How this group fits the mental model

Effect design decides whether React should own the behavior as render/event logic or synchronize with an external system after commit.

## Supplied names explained

The exact index below covers synchronization, alternatives, teardown symmetry, connection lifecycle, stale async work, Strict Mode, and custom Hook reuse.

## Examples

Connection, derived-value, and purchase examples illustrate the right mechanism for each kind of work.

## Exact terms covered

### Exact terms covered

- `External-system synchronization`
- `Effect versus event handler`
- `Effect versus derived value`
- `Effect cleanup mirrors setup`
- `Connection setup and teardown`
- `Abort or ignore stale asynchronous result`
- `Strict Mode extra setup-cleanup cycle`
- `Avoiding unnecessary Effects`
- `Custom Hook for reusable synchronization`

