# Frontend component testing unit integration end-to-end and accessibility — Reference: Test runner, assertions, and dependency mocks

## Scope and version

This lesson covers the supplied Vitest runner API subset, checked against Vitest 5.1 (2026-11-20), plus test-double patterns. Vitest 5 added performance improvements, stable file-system module caching, nested project/config inheritance, and `vitest doctor`; 5.1 stabilized Browser Mode trace view with failure-only capture by default and added interactive snapshot review. The CLI's `--since-last-run` remains experimental and selects tests using recorded dependency file modification times, so it is distinct from Git-based `--changed`. Check the installed Vitest/Vite/Node versions and migration guide for exact compatibility; this is not the full configuration/matcher catalog. [Vitest guide](https://vitest.dev/guide/) [Vitest API](https://vitest.dev/api/) [Vitest 5](https://vitest.dev/blog/vitest-5.html) [Vitest 5.1](https://vitest.dev/blog/vitest-5-1) [Migration guide](https://vitest.dev/guide/migration.html)

## How this group fits the mental model

The runner discovers/executes tests, assertions check outcomes, lifecycle hooks manage fixtures, and mocks replace selected dependencies. Restore global state so each test remains isolated.

## Supplied names explained

- `Vitest` is a Vite-native unit test runner with Jest-compatible APIs and support for Node/jsdom/browser environments according to configuration. Choose the environment deliberately; jsdom is not a real browser.
- `describe(name, fn)` groups related test cases and provides a scope for hooks/configuration.
- `test(name, fn)` defines one test case and supports async bodies by returning/awaiting a Promise.
- `it(name, fn)` is an alias-style test declaration with the same core behavior as `test`.
- `expect(actual)` starts an assertion chain with matchers; use assertions on public behavior and outcomes.
- `beforeEach(fn)` runs setup before each test in its scope; use it for fresh fixtures, not hidden shared state.
- `afterEach(fn)` runs teardown after each test, including restoration/cleanup.
- `vi.fn(implementation?)` creates a mock function that can record calls and optionally implement behavior.
- `vi.spyOn(object, methodName)` wraps/spies on an existing method; it calls through by default unless behavior is changed. Restore it to avoid leakage.
- `vi.mock(path, factory?)` mocks a module dependency. Module mocks are hoisted/loaded according to Vitest transformation rules; avoid mocking internal implementation when a network boundary is more stable.
- `vi.stubGlobal(name, value)` replaces a global such as a browser API in the test environment. Restore globals after the test.
- `vi.useFakeTimers()` replaces timer APIs with controllable fake time. Use only when timer behavior is under test and advance/restore deliberately.
- `vi.advanceTimersByTime(milliseconds)` advances fake timers by the requested duration so due callbacks run; it has asynchronous variants for promise-driven timers.
- `vi.restoreAllMocks()` restores spies/mocks to original behavior; distinguish restoring spy implementations from clearing call history or resetting implementations.
- `Testing Library async queries` (`findBy`, `waitFor`, removal waits) return Promises and should be awaited; they wait for UI conditions instead of arbitrary delay.
- `Mock network boundary` means intercept or stub the HTTP/API boundary while keeping the component/RTK Query/fetch integration real enough to verify rendered consequences.

## Cross-item comparison

`vi.fn` creates a mock, `vi.spyOn` observes/replaces an existing method, and `vi.mock` replaces a module import. Use the narrowest stable boundary. Fake timers control time; async DOM queries wait for observed UI state.

## Examples

```ts
describe('format label', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('updates after a delay', () => {
    const callback = vi.fn();
    setTimeout(callback, 100);
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledOnce();
  });
});
```

Use real timers unless time itself is part of the behavior under test.

## Common mistakes

- Leaving fake timers or stubbed globals active for the next test.
- Assuming `restoreAllMocks()` also resets all module mocks/state in every context.
- Over-mocking a component's child implementation.
- Using fake timers with async user-event without coordinating timer advancement.
- Mocking a function that should instead be tested through a controlled network response.
- Assuming a jsdom runner verifies actual browser layout/focus rendering.

## Knowledge checks with answers

1. Which API groups tests? `describe`.
2. Which mock wraps an existing method? `vi.spyOn`.
3. What should be restored after fake timers? Real timer APIs and affected mocks/globals.
4. Should all API calls be mocked at the hook layer? No; mock a stable network boundary when practical.

## Sources

- [Vitest guide](https://vitest.dev/guide/)
- [Vitest API](https://vitest.dev/api/)
- [Vitest mocking](https://vitest.dev/guide/mocking.html)
- [Testing Library async methods](https://testing-library.com/docs/dom-testing-library/api-async/)
