# Frontend component testing unit integration end-to-end and accessibility — Big-picture orientation and mental model

## Problem and purpose

Testing helps catch regressions at different boundaries. A small unit test checks a function; a component test checks rendered behavior in a DOM; an end-to-end test checks a real browser journey. The useful test is the smallest one that gives confidence about the behavior that matters. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) [Playwright](https://playwright.dev/docs/intro)

## Plain-language mental model

Treat a test as a simulated user story with a checkpoint. Set up the starting state, perform an action, and check something a user can observe. For component tests, query the DOM by role/name or label. For browser tests, locate a visible control and use auto-waiting assertions. Mock only the boundary that needs isolation, such as a network response; avoid mocking React internals or asserting private implementation details.

Accessibility testing is layered: semantic queries encourage accessible markup; automated rules catch some known issues; keyboard and screen-reader/manual checks reveal interaction problems that automation cannot prove absent. [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)

## How the parts fit together

```text
Pure function ── unit test
React component ── Testing Library + DOM + user-event
Router/network/browser journey ── Playwright end-to-end
Accessibility ── semantic queries + axe rules + keyboard/manual AT evaluation
CI ── repeatable fixtures, isolated data, reports, traces, coverage signals
```

## Concept map

- **Test level:** choose the smallest realistic boundary that covers the risk.
- **Queries:** use the same role/name/label users and assistive technologies rely on.
- **Interactions:** use user-event for complete user actions; use fireEvent for a deliberate low-level event.
- **Async:** await actions and observable appearance/disappearance, not arbitrary time.
- **Mocks:** isolate a dependency boundary and assert rendered consequences.
- **Browser E2E:** validate navigation and integration with resilient locators, fixtures, and traces.
- **Accessibility:** combine automated and human evaluation; no scan guarantees conformance.

## End-to-end walkthrough

For a sign-in form, a component test renders the form, finds inputs by label and the button by role/name, types with `user-event`, submits, and waits for a success message or validation error. An E2E test visits the application, submits with realistic credentials/test data, follows navigation, and confirms the browser shows the account page. The component test catches interaction states quickly; E2E checks routing, deployment, and integration. A keyboard-only pass checks focus and activation; axe can identify some rule violations but cannot replace manual screen-reader and visual checks.

## When to use it and tradeoffs

Use unit/component tests for fast focused feedback, integration tests for connected boundaries, and E2E tests for critical user journeys. E2E tests are slower and need stable data/environment. Avoid building a suite that duplicates every internal calculation through a browser. Coverage reports can reveal untested code, but a high percentage does not prove meaningful assertions.

## What later lessons cover

The references cover test levels, React Testing Library queries/render, user interactions, Vitest and mocks, Playwright browser tests, and accessibility/coverage/CI checks.

## Version context

The current Testing Library docs describe `@testing-library/user-event` v14 and recommend it over legacy v13. The current runner snapshots checked here are Vitest 5.1 and Playwright 1.65 (2026-11-20); API details and runtime requirements must still be checked against the versions installed in a project. Vitest 5 introduced faster execution, stable file-system module caching, nested project/config inheritance, and a `vitest doctor` command; 5.1 stabilized Browser Mode trace view with failure-only capture by default and added interactive snapshot review. Playwright 1.65 added Bun-runner support and changed TypeScript class-field, inert-element actionability, and cookie matching behavior; it no longer tests Node 20. [user-event introduction](https://testing-library.com/docs/user-event/intro/) [Vitest 5](https://vitest.dev/blog/vitest-5.html) [Vitest 5.1](https://vitest.dev/blog/vitest-5-1) [Playwright release notes](https://playwright.dev/docs/release-notes)

## What is covered elsewhere

Formal WCAG conformance and assistive technology evaluation are covered in the accessibility topic; this lesson covers testing workflow and named tools.
