# Frontend component testing unit integration end-to-end and accessibility — Reference: Test levels and behavior-focused test design

## Scope and version

This reference defines the supplied test-design concepts. The boundaries overlap in real projects; choose a layer based on the risk and feedback cost. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) [Playwright](https://playwright.dev/docs/intro)

## How this group fits the mental model

A good test checks an important contract at the lowest layer that represents the relevant failure. Arrange controlled inputs, act through the intended interface, and assert an observable outcome.

## Supplied names explained

- `Unit test` checks a small isolated function/module with direct inputs and outputs; it is fast but cannot prove browser integration.
- `Component test` renders a UI component in a DOM and checks rendered interaction/semantics. It can include child components and controlled dependencies without a full production browser.
- `Integration test` verifies connected boundaries such as a component with router/store/network adapter or multiple modules together.
- `End-to-end test` drives a real browser through a critical user journey against the running app and its configured services/test doubles.
- `Behavioral assertion` checks what a user or caller can observe (visible text, navigation, returned value) rather than private state, call counts, or implementation shape without a reason.
- `Arrange Act Assert` structures a test: establish fixture/preconditions, perform the behavior, and assert the result.
- `Test fixture` is reusable setup/data/environment such as a seeded record or authenticated browser state. Keep it minimal and resettable.
- `Test isolation` ensures tests do not depend on ordering or share mutable state; reset network/database/browser state and restore mocks.
- `Flaky test` has nondeterministic outcomes due to timing, shared state, unstable selectors, or environment; diagnose root cause instead of increasing retries alone.
- `Test pyramid tradeoff` balances many fast unit/component tests with fewer slower integration/E2E tests; it is a heuristic, not a required shape.
- `Avoid implementation-detail assertions` means avoid asserting internal state, exact hook calls, or child implementation when a user-visible contract is the requirement. Internal details may be tested when they are themselves a public module contract.

## Cross-item comparison

Unit tests are isolated and fast; E2E tests cover browser integration and user journeys but cost more to run/debug. Component/integration tests bridge this gap. The correct balance depends on failure impact, project architecture, and confidence needs.

## Examples

For a date formatter, a unit test can check locale-independent formatting inputs. For a validation message, a component test should type and inspect the visible error. For checkout navigation/payment confirmation, an E2E test should verify the complete browser route and confirmation screen with a deterministic test payment boundary.

## Common mistakes

- Testing implementation details that change during harmless refactors.
- Repeating every assertion in unit, component, and E2E layers.
- Sharing mutable fixtures across parallel tests.
- Treating retry count as a fix for a flaky test.
- Using one global test setup that hides required production dependencies.

## Knowledge checks with answers

1. Which test level verifies a browser journey? E2E.
2. What is the aim of Arrange Act Assert? Separate setup, action, and expected outcome.
3. Does the test pyramid require exact ratios? No; it is a planning heuristic.
4. What is the first response to flakiness? Identify timing, isolation, selector, or environment causes.

## Sources

- [React Testing Library introduction](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright introduction](https://playwright.dev/docs/intro)
