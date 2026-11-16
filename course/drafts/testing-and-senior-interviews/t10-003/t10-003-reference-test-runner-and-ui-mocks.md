# frontend tests accessibility browser automation and Playwright — Reference: Vitest/Jest test lifecycle, async control, fake timers, and network mocking

# Scope and version

This lesson covers the exact runner and network-mocking names in this inventory. Vitest and Jest share familiar concepts but are distinct tools with different configuration, module behavior, environments, and APIs. Follow the current documentation for the installed version; the source snapshot was checked 2026-11-17. MSW’s Node `setupServer` intercepts requests in-process and does not listen on a network socket. [Vitest API](https://vitest.dev/api/) [Vitest mocking](https://vitest.dev/guide/mocking.html) [MSW setupServer](https://mswjs.io/docs/api/setup-server/)

# How this group fits the mental model

A runner discovers tests, executes lifecycle hooks, provides assertions, and coordinates cleanup. Mocks control a function/module/global boundary; fake timers control scheduled work; MSW controls HTTP responses at the request boundary. These are different seams, so select the narrowest one that makes the tested behavior deterministic without replacing behavior that the test intends to verify.

# Supplied names explained

- `Vitest` — A JavaScript/TypeScript test runner designed to work with Vite-oriented projects. It provides discovery, lifecycle, assertions, mocking and timer controls. Its API resembles Jest in many areas, but configuration and edge behavior should not be assumed identical.
- `test` — Declares one test case with a name and callback. Make each case explain one behavior and await asynchronous work so the runner knows when it has completed.
- `it` — An alias-style test declaration commonly used to read as “it should …”. Choose `test` or `it` consistently; they express the same test-case role in this context.
- `describe` — Groups related tests and can provide scoped lifecycle hooks. Avoid deeply nested grouping that hides setup or makes failures hard to locate.
- `expect` — Starts an assertion about a value or result. Assertions should express the behavior requirement; avoid checking incidental implementation details unless they are the behavior under test.
- `beforeEach` — Runs setup before each test in its scope. Use it for fresh state or resetting shared state; do not let hidden setup obscure the tested conditions.
- `afterEach` — Runs cleanup after each test. Restore mocks, environment overrides, timers and request handlers here when their state is test-scoped.
- `beforeAll` — Runs setup once before the tests in its scope. Use it for expensive shared infrastructure that is safe to share, such as starting a test-only MSW interception layer.
- `afterAll` — Runs teardown once after the scoped tests complete. Use it to release shared resources initialized in `beforeAll`.
- `vi.fn` — Creates a mock function whose calls and configured behavior can be inspected. Use it to control a collaborator or assert a meaningful side effect; avoid asserting every call when the public result is enough.
- `vi.spyOn` — Wraps/observes an existing object method or property while allowing controlled behavior. Restore it after the test so the original implementation is not replaced for later cases.
- `vi.mock` — Mocks a module import. Vitest hoists this declaration ahead of imports in relevant module setups, so its factory and module-resolution behavior matter. Prefer request-level mocking when testing data fetching rather than replacing internal implementation modules by default.
- `vi.stubGlobal` — Replaces a global value for a test. It may remain changed after a test unless explicitly restored or automatic cleanup is configured; do not allow it to leak to other cases.
- `vi.useFakeTimers` — Replaces timer behavior with a controllable fake clock. Depending on configuration/version, related time APIs such as `Date` or `performance` can also be affected. Restore real timers and understand how async waiting interacts with the fake clock.
- `vi.advanceTimersByTime` — Moves the fake clock forward by a specified duration and runs timers due in that interval. Use it to test debounce/throttle/delay behavior deterministically, not as a general replacement for waiting on UI state.
- `vi.runAllTimers` — Runs all currently scheduled fake timers, including timers scheduled by callbacks as it advances. It can be unsafe when recurring timers never settle; use bounded advancement for repeating behavior.
- `vi.useRealTimers` — Restores real timer implementations. Call it during cleanup after fake-timer tests so later tests do not inherit a fake clock.
- `vi.waitFor` — Repeats a callback until it stops throwing or a timeout occurs, with Vitest timer-aware behavior when fake timers are enabled. Keep callback actions free of side effects because it may retry.
- `vi.stubEnv` — Temporarily overrides an environment variable for tests. Restore environment state afterward or configure automatic unstubbing; environment values can influence module initialization and should be set at the right time.
- `Jest` — A separate JavaScript test runner and mocking ecosystem. It offers familiar test declarations, assertions, mock functions and timer APIs; do not assume that a Vitest setup file or configuration works unchanged under Jest.
- `jest.fn` — Jest’s mock-function constructor. It records calls and can be configured to return values or implementations; clear/reset/restore policies determine how its state carries across tests.
- `jest.spyOn` — Jest’s spy for an existing method/property. Restore it after use when the original implementation must be available to later tests.
- `jest.mock` — Jest’s module-mocking mechanism. Its evaluation and hoisting rules can affect import behavior; configure mocks with awareness of the module system and test environment.
- `jest.useFakeTimers` — Switches Jest’s timer APIs to a controllable fake clock. Use it only when timer behavior is part of the test and restore real time in cleanup.
- `jest.advanceTimersByTime` — Advances Jest’s fake clock by the requested duration and runs due callbacks. It controls scheduled time; it does not by itself prove that a UI transition or request completed.
- `jest.useRealTimers` — Restores real timers after a fake-timer test to prevent suite-wide clock leakage.
- `MSW (Mock Service Worker)` — A request-mocking tool that defines HTTP handlers at the network boundary. In browser usage it relies on service-worker behavior; in Node it uses a different interception mechanism. Shared handler intent does not erase environment differences.
- `setupServer` — Creates the Node-side MSW request interception setup. Despite “server” in its name, it does not open a listening HTTP server; it intercepts outgoing requests in the Node process.
- `http.get` — Defines an MSW handler for an HTTP GET request. Match the intended URL and return only the response needed by the scenario; unexpected requests should be visible rather than silently contacting the real service.
- `http.post` — Defines an MSW handler for an HTTP POST request. Test relevant request semantics and response cases without duplicating the entire remote service implementation.
- `HttpResponse` — MSW’s response-construction helper for mocked handlers. Use it to describe controlled status, headers, and body; a synthetic response is evidence about the client’s handling, not the real API.
- `server.listen` — Starts Node-side request interception for the configured handlers. It does not bind a port; start it once before the suite’s tests and stop it during suite teardown.
- `server.use` — Adds or overrides handlers for a test or scenario. Reset runtime overrides so one test’s failure response does not change the next test.
- `server.resetHandlers` — Restores the initial handler set by removing runtime handler overrides. Use it between tests when handlers are changed dynamically.
- `server.close` — Stops the Node request interception and releases its associated setup. Pair it with suite-level setup that started the interception.

# Cross-item comparison

**Test declaration and scope:** `test` and `it` declare a case; `describe` groups cases; `beforeEach`/`afterEach` run per case; `beforeAll`/`afterAll` run once per scope. Shared setup should be immutable or cleaned carefully.

**Mock boundary:** A function spy/mock replaces or observes an in-process function. A module mock replaces an import and can couple the test to module internals. MSW intercepts HTTP at the request boundary, leaving the consumer’s request construction and response parsing more intact. In Node, `setupServer` still is not a real network server.

**Timer controls:** `advanceTimersByTime` advances a defined interval; `runAllTimers` drains all scheduled timers and can loop indefinitely with recurring work; `useRealTimers` restores normal time. No within-group comparison applies to a single item.

# Examples

For a debounce test, install fake timers, cause the code under test to schedule its work, advance to just before the expected delay and assert that it has not happened, then advance the remaining time and assert the observable result. Restore real timers in cleanup. In UI tests, first decide whether fake timers and the UI library’s async waits share compatible clock behavior. A controlled request response is often simpler than faking time for network completion.

An MSW Node test setup follows this lifecycle: create the interception setup using `setupServer`; start it once with `server.listen` before the suite; add scenario-specific request handlers with `server.use`; restore the initial handlers after each test with `server.resetHandlers`; and stop interception with `server.close` at suite teardown. In Node this is process interception, not a localhost listener. [MSW Node setup](https://mswjs.io/docs/api/setup-server/)

# Common mistakes

- Mixing Jest-specific setup with Vitest or assuming similar names imply identical semantics.
- Forgetting that `vi.mock` evaluation is hoisted in relevant configurations, producing confusing import behavior.
- Leaving spies, stubbed globals, environment values, or fake timers active after the test.
- Advancing all timers when a repeating timer is present, causing the test to never finish.
- Using fake timers for a network request whose completion should instead be controlled at the request boundary.
- Putting an interaction in a retried `vi.waitFor` callback.
- Treating MSW `setupServer` as a real listening server or as proof that the external service works.
- Leaving runtime handlers from `server.use` installed across tests.
- Mocking an internal module when a request-level boundary would preserve more real application behavior.

# Knowledge checks with answers

1. **What does `setupServer` do in Node?** Intercepts outgoing requests in the process; it does not open a TCP/HTTP listener.
2. **Why restore real timers after a fake-timer case?** To prevent later tests from inheriting a fake clock and altered time behavior.
3. **When can `vi.runAllTimers` be dangerous?** When recurring timers continually schedule more timers.
4. **Where should a test override one request response?** At the request handler boundary, and then reset the override after the test.
5. **What is one important difference between Jest and Vitest?** They are separate runners with distinct configuration, module mocking/evaluation, and version-specific behavior despite similar API concepts.

# Sources

- [Vitest API](https://vitest.dev/api/)
- [Vitest mocking guide](https://vitest.dev/guide/mocking.html)
- [Vitest timer guide](https://vitest.dev/guide/mocking/timers)
- [MSW documentation](https://mswjs.io/docs/)
- [MSW setupServer API](https://mswjs.io/docs/api/setup-server/)
