# frontend tests accessibility browser automation and Playwright — Core concepts and how they fit together

# Learning objectives

After this lesson, you should be able to choose between component and browser tests, use semantic queries to express user-visible behavior, wait for asynchronous state without fixed delays, control network and timer behavior, distinguish browser-context isolation from backend-data isolation, and explain what automated accessibility and visual checks do not prove.

# Prerequisites

You should understand React components, DOM elements, events, asynchronous requests, HTTP, browser storage, and basic test setup/expectation concepts. An accessible name is the name exposed for an element in the accessibility tree, often derived from visible text or a label. A locator is a reusable description of how to find an element in a page. A test fixture is setup provided to a test, such as a browser page or context.

# Core concepts

## Choose the smallest credible test layer

Component tests render a component in a simulated DOM and assert its visible behavior. They are good for many state and interaction cases. The simulated DOM does not perform real layout, browser rendering, or the full accessibility behavior of a browser and assistive technology.

Browser tests exercise a real browser and can cover routing, browser APIs, layout, storage, permissions, and application integration. They cost more to run and can be affected by backend data, browser/runtime differences, network timing, and resource contention. Use them for flows where those boundaries are part of the claim.

These layers complement one another. Do not duplicate every component state in a browser test. Select a small number of critical user flows in the browser and cover a broader state space in component tests.

## Query as a user would identify the control

Testing Library recommends semantic queries that reflect how visual and assistive-technology users identify content. A role with an accessible name is usually a strong first choice; a label is especially useful for form controls. Visible text is appropriate for content. A test ID is a fallback when a stable user-visible query does not fit; it is invisible to users and does not establish accessible semantics. [Query priority and behavior](https://testing-library.com/docs/queries/about/)

The query families also express timing and absence:

- A `getBy...` query is synchronous and expects one matching element; it throws if there are zero or multiple matches.
- A `queryBy...` query is useful to assert absence because zero matches returns `null`; it still throws for multiple matches.
- A `findBy...` query retries asynchronously until one match appears or the timeout is reached.
- A multiple-element query communicates that multiple matches are expected.

Use the query whose contract matches the assertion. Do not use a `findBy...` query when the element is already expected synchronously, and do not use `queryBy...` for an element expected to appear later.

## Simulate interaction at the right level

User-level interaction tools model a sequence a person initiates, such as typing or tabbing. Lower-level event dispatch is useful for targeted cases but may skip browser behavior and intermediary events. Prefer the higher-level interaction for ordinary user flows; use a lower-level event when the precise event itself is the subject.

An interaction should assert the resulting observable state, not just that a callback was invoked. A callback assertion can be useful for a component contract, but a user usually cares that the menu opened, the form error appeared, or navigation occurred.

## Synchronize on a condition

Async UI can depend on a request, timer, transition, or state update. A fixed sleep assumes a duration and becomes flaky when machines are faster or slower. Wait for the state that defines success: an element appears, disappears, becomes enabled, or shows expected content.

Be careful with retry callbacks. A `waitFor` callback may execute multiple times; put an assertion inside, not a click or mutation. Otherwise the interaction can be repeated each time the callback retries. When the condition is an element appearing, a `findBy...` query often states the intent more directly. When it disappears, wait for disappearance.

## Control nondeterministic boundaries

Mock external requests with a boundary that matches the test. In a component test, MSW can intercept requests within the Node process and reuse handler definitions with browser-side mocking. It is not a real listening network server in Node. In a browser test, page route interception can control what the page receives. Both approaches make responses deterministic; neither proves the real API is correct.

Use fake timers for code whose timer behavior is being tested, such as debounce or delayed feedback. They can also alter clock-related behavior. Restore real timers and clear/reset mock state between tests. Avoid mixing fake timers with unrelated asynchronous browser/DOM waiting unless you understand which clock the waiting utility advances.

Mocks, stubs, and environment overrides have state too. Reset or restore them between cases. A test that passes alone but fails after another test may be leaking mock implementation, a global, timer state, or environment variable.

## Isolate browser state and backend state separately

Playwright Test creates a new browser context for each test by default. Context isolation gives separate cookies, local storage, and session storage. It does not create a new user account or database row on your backend; parallel tests can still overwrite the same server-side record. Use unique backend test data, separate accounts, or a server-side reset strategy as well.

Use fixtures for reusable setup and teardown, but keep test data ownership obvious. A shared browser or account can reintroduce ordering dependencies. A trace, screenshot, or output path can aid diagnosis; protect artifacts if they contain personal or authentication data.

## Accessibility and visuals provide different signals

Accessible names, descriptions, semantic roles, and label-control associations enable the interface to be understood through assistive technology. Keyboard-only navigation checks whether all functionality can be reached and operated without a pointer. Visible focus and sensible focus order are practical observable requirements. A focus trap is appropriate only for a modal-like interaction that intentionally contains focus and returns it correctly afterward.

An automated axe-core scan checks rules it can evaluate from the rendered page. It does not test every WCAG criterion or replace keyboard, screen-reader, or expert review. WCAG conformance is a broader evaluation against success criteria, not a badge produced by one tool.

Visual regression compares rendered pixels or regions against a baseline. It can catch spacing, clipping, or color changes, but rendering varies with viewport, device scale, browser, fonts, animation, dynamic content, and color scheme. A visual match cannot prove that controls have accessible names or work from the keyboard.

# Mechanisms and relationships

Use this sequence when you design a frontend test:

1. State the user-visible behavior and the failure it should catch.
2. Choose a simulated DOM or real browser based on the behavior’s required environment.
3. Locate elements by role/name or label when possible; use text for content and test IDs only where semantic lookup is unsuitable.
4. Perform a user-level interaction and assert the resulting state.
5. If state is async, wait for the visible condition and control the response/timer boundary.
6. Isolate browser storage and backend data independently.
7. Add automated accessibility checks, keyboard checks, and visual comparisons as separate evidence types.
8. On failure, capture a trace or relevant output, then make sure it does not expose secrets.

# Worked examples

### Component search state

A search component has a textbox labeled “Search products” and a button named “Search.” A component test should locate these by accessible label/role and name, enter a query using a user-level interaction, and submit it. For a loading state, assert that loading content is visible; then await the result text. Do not sleep for one second and hope the request finished. Use a controlled response for success and empty/error cases.

### Browser navigation

A Playwright browser test should begin in its own context, navigate to the search page, interact through semantic locators, and assert the visible result and URL. If one test signs in, use a state setup appropriate to the suite and ensure backend data is unique. The new browser context does not isolate the same shared server-side account from other workers.

### Accessibility signal

Run an automated rule scan on the rendered page and assert that known violations are absent. Then tab through the same flow and confirm visible focus and operability. If the workflow depends on a screen-reader announcement, test with an appropriate assistive technology as part of targeted human verification. The scan is an early warning net, not proof of full conformance.

# Misconceptions and edge cases

- **“A test ID is always stable and therefore best.”** It may survive text changes but says nothing about whether users can perceive the control. Prefer semantic queries unless the UI lacks a suitable user-facing locator.
- **“`findBy...` is just a slower `getBy...`.”** It retries asynchronously and has different failure behavior; use it when waiting for appearance.
- **“`waitFor` runs once.”** Its callback may be retried. Keep it free of side effects.
- **“MSW `setupServer` opens localhost.”** In Node it intercepts requests within the process; it does not create a TCP server.
- **“Playwright isolated contexts isolate my database.”** They isolate browser storage; backend records/accounts remain shared unless separately isolated.
- **“A clean axe scan means WCAG AA.”** The scan covers only detectable rules; keyboard and assistive-technology review remain important.
- **“A screenshot snapshot tests accessibility.”** A pixel image does not encode semantics, keyboard operation, or announcement behavior.
- **“Accepting the new screenshot is cleanup.”** A baseline change changes expected behavior and must be reviewed intentionally.

# Knowledge checks with answers

1. **Which query family is appropriate to wait for an async element to appear?** `findBy...`, because it retries until a matching element appears or times out.
2. **When is a test ID a reasonable choice?** When a semantic/user-visible query does not fit the element or content, not as the default for every control.
3. **Why should a `waitFor` callback avoid clicking?** It may run repeatedly, causing the click to repeat.
4. **What does a fresh Playwright browser context isolate?** Browser storage such as cookies and local/session storage; not backend accounts or data.
5. **What is missing after an axe scan passes?** Coverage of issues the automation cannot detect, including many keyboard, assistive-technology, usability, and contextual WCAG concerns.

# Sources

- [Testing Library query behavior and priority](https://testing-library.com/docs/queries/about/)
- [Testing Library disappearance and async behavior](https://testing-library.com/docs/guide-disappearance/)
- [Playwright isolation](https://playwright.dev/docs/browser-contexts)
- [Playwright actionability and auto-waiting](https://playwright.dev/docs/actionability)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
