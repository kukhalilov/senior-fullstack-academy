# Frontend component testing unit integration end-to-end and accessibility — Interview questions and reasoning

Use the [Testing Library query guide](https://testing-library.com/docs/queries/about/), [Playwright assertions](https://playwright.dev/docs/test-assertions), and [accessibility testing guide](https://playwright.dev/docs/accessibility-testing) for the official behavior details.

## Core questions

1. How do you choose unit, component, integration, or E2E testing?
2. Why prefer role/name queries in React Testing Library?
3. Compare `getBy`, `queryBy`, and `findBy`.
4. Compare user-event and fireEvent.
5. How do you avoid flaky async tests?
6. What can Playwright auto-waiting and Trace Viewer provide?
7. Can axe-core prove an application is accessible?

## Concise interview answers

1. Match the smallest practical test boundary to the failure risk and confidence needed.
2. They reflect accessible semantics and how users/assistive technology identify controls.
3. Immediate required match; immediate nullable absence query; retrying asynchronous match.
4. Complete interaction simulation versus direct low-level DOM event dispatch.
5. Await interactions and observed conditions, isolate fixtures, and avoid fixed sleeps/shared state.
6. Auto-waiting waits for actionability/expected UI state; traces capture actions, snapshots, and network details.
7. No; it detects a subset of machine-checkable issues and must be combined with manual evaluation.

## Deep follow-up answers

1. Use unit tests for deterministic logic, component tests for DOM behavior, integration for connected modules, and E2E for critical browser journeys. Keep E2E focused because it is slower and environment-dependent.
2. Semantic queries catch missing/wrong role or names and are less coupled to DOM structure than selectors/test IDs. Test IDs are fine when user-facing semantics do not identify a target.
3. `getBy` throws if absent, `queryBy` returns null and suits absence assertions, and `findBy` retries and returns a Promise for async appearance.
4. user-event sequences events and checks interactability; fireEvent dispatches a specified event. The latter is useful for low-level event contracts, not normal user flows.
5. Await user actions, use find/wait conditions, reset data, isolate parallel tests, control network dependencies, and inspect trace artifacts instead of adding sleeps/retries.
6. Locator actionability waits for the element to be usable; web-first assertions retry expected state. Trace Viewer helps reconstruct failures with snapshots/logs/network.
7. Axe cannot evaluate all context, usability, visual presentation, focus, or screen-reader experience. Keyboard-only and real assistive technology checks remain needed.

## Scenario questions

1. A menu query passes locally but intermittently fails in CI. What timing/isolation/selector issues would you inspect?
2. A component test mocks every child and hook. What confidence has been lost?
3. A Playwright screenshot differs across runs because data changes. How would you stabilize it?
4. A page has zero automated accessibility violations but the modal cannot be closed with a keyboard. Why did the scan miss it?

## Tradeoffs and alternatives

- Component tests are fast and semantic; E2E tests exercise more integration but cost more.
- Role/label locators validate semantics; test IDs can be stable but do not prove accessibility.
- Network mocks make tests deterministic; a smaller set of integration tests should still verify real wiring.
- Coverage identifies execution gaps; risk-based assertions identify behavioral gaps.
- Automated scans scale; manual testing evaluates context and assistive-technology behavior.

## Common weak answers

- “Test every function with E2E.” This is slow and obscures failures.
- “A test ID is always more stable.” It avoids semantics and can let inaccessible markup pass.
- “Wait two seconds.” Fixed sleeps are slow and still race conditions.
- “95% coverage means quality.” Coverage does not grade assertions.
- “Axe passed, so the UI is accessible.” Automated checks cover only detectable rules.
- “Mock every child so the component is isolated.” Over-mocking can hide integration defects.

## Self-check rubric

Score 0–2 for: (a) choosing test boundaries by risk; (b) semantic query reasoning; (c) async interaction/wait handling; (d) controlled mock boundaries and isolation; (e) Playwright resilient browser testing; (f) realistic accessibility evaluation. Strong answers score 10–12 and explain one limitation of each testing layer.
