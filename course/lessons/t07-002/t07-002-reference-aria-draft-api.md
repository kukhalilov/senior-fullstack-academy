
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WAI-ARIA 1.3 draft notification API and document constraints

# Scope and version

This narrowly covers draft additions from the dated WAI-ARIA 1.3 Working Draft (2026-06-04). They are not stable baseline requirements or universally implemented APIs. Feature-detect and test supported browser/assistive-technology combinations; retain semantic DOM and conventional live-region fallbacks where appropriate. [WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)

# How this group fits the mental model

ARIA 1.3 adds a notification mechanism and clarifies a document-root constraint. These are additions to the evolving accessibility model, not substitutes for semantic HTML, WCAG status-message requirements, or well-designed live regions. A Working Draft may change before Recommendation.

# Supplied names explained

- `Element.ariaNotify() (WAI-ARIA 1.3 draft)` — Proposed instance API to request an assistive-technology notification associated with an element. It is not a replacement for a visible status message or an automatic guarantee that every AT will announce it.
- `Document.ariaNotify() (WAI-ARIA 1.3 draft)` — Proposed document-level notification API for a message not naturally associated with a particular element.
- `AriaNotificationOptions (WAI-ARIA 1.3 draft)` — Options dictionary supplied to the notification APIs; use only fields and semantics defined by the cited snapshot, and do not assume future editions preserve its shape.
- `AriaNotifyPriority normal and high (WAI-ARIA 1.3 draft)` — Proposed priority choices: normal is lower interruption priority; high is more interruptive and should be reserved for genuinely urgent information.
- `aria-notify Permissions Policy feature (WAI-ARIA 1.3 draft)` — Draft policy-controlled feature named `aria-notify`; the cited draft gives it a default allowlist of `*`. A document that is not allowed to use the feature does not send notifications, so an embedding policy can matter. This is draft behavior, not an established support guarantee.
- `aria-hidden document-root restriction (WAI-ARIA 1.3 draft)` — The dated draft prohibits `aria-hidden="true"` on document root elements. This is draft-specific wording; do not misstate it as a new WAI-ARIA 1.2 Recommendation rule.

# Cross-item comparison

`Element.ariaNotify()` associates an announcement with an element; `Document.ariaNotify()` is document-level. Priority concerns interruption, not importance to the document’s semantic structure. The permissions policy is a separate availability gate; the draft's default `*` allowlist does not mean every browser implements the API. The root `aria-hidden` restriction concerns hiding the document tree, not ordinary use of `aria-hidden` on a non-focusable decorative subtree.

# Examples

For an experimental prototype, check whether the method exists before calling it, keep the notification concise, and provide the same essential information in visible UI. If unavailable or blocked by policy, the page should still expose an appropriately designed status message. Never mark the root document hidden to silence announcements; correct the relevant subtree or interaction instead.

# Common mistakes

- Using a draft API without feature detection or compatibility testing.
- Treating `high` priority as a generic “important message” setting and interrupting users repeatedly.
- Assuming a successful call guarantees a particular spoken string or timing across AT.
- Treating policy denial as a reason to remove the visible status.
- Assuming the draft's `*` default allowlist means the notification API is implemented in the browser.
- Describing the root restriction as stable 1.2 conformance text.

# Knowledge checks with answers

1. **Is `ariaNotify()` stable WAI-ARIA 1.2?** No; it is listed here from the 1.3 Working Draft.
2. **When should high priority be used?** Only for genuinely urgent notifications where interruption is justified.
3. **What should the UI do if the API is unavailable?** Preserve the information in visible UI and use an appropriate supported accessibility pattern.

# Sources

- [Dated WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
