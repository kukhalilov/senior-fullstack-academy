<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: operable enough time

# Scope and version

This reference covers six criteria in WCAG 2.2 Guideline 2.2. They address author-imposed time limits, moving/blinking content, and interruptions. The AAA criteria are additional conformance requirements only when the claimed target includes AAA. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Time pressure can prevent reading, decision-making, and task completion. Distinguish a content deadline from a security timeout, and an author-controlled interruption from user-requested updates. Give users control before an avoidable limit expires, preserve data when possible, and make motion and interruptions manageable.

# Supplied names explained

- `2.2.1 Timing Adjustable (A)` — For each time limit set by content, users can turn it off, adjust it over a wide range, or extend it with the specified warning/confirmation process, unless an exception applies (such as a real-time event, essential limit, or limit longer than 20 hours). The extension option must allow repeated extension.
- `2.2.2 Pause, Stop, Hide (A)` — Moving, blinking, scrolling, or auto-updating information that starts automatically, lasts more than five seconds, and is presented alongside other content needs a way to pause, stop, or hide it, unless essential. Automatically started audio has separate control requirements. Auto-updates may also need a way to pause, stop, hide, or control update frequency.
- `2.2.3 No Timing (AAA)` — Timing is not an essential part of the event or activity, except for non-interactive synchronized media and real-time events.
- `2.2.4 Interruptions (AAA)` — Users can postpone or suppress interruptions, except emergencies.
- `2.2.5 Re-authenticating (AAA)` — When an authenticated session expires, users can continue the activity without data loss after re-authenticating, unless the data would be lost for security reasons.
- `2.2.6 Timeouts (AAA)` — Users are warned about the duration of inactivity that could cause data loss, unless data is preserved for more than 20 hours after inactivity.

# Cross-item comparison

2.2.1 is a flexible adjustment mechanism, not a universal ban on timers. 2.2.2 applies only under its automatic-start, duration, and parallel-content conditions. 2.2.5 protects work across authentication expiry; 2.2.6 warns about inactivity-based data-loss timeouts. Emergency, essential, and real-time exceptions are narrow and criterion-specific.

# Examples

Before a form session expires, warn users and offer a keyboard-operable extension several times while preserving entered values. A rotating carousel that starts by itself and remains visible alongside article text needs pause/stop/hide control. A banking re-authentication flow can return users to the transaction with their unsaved details intact.

# Common mistakes

- Treating any timer as essential because the backend currently uses one.
- Providing a single extension that cannot be repeated where 2.2.1 requires repeated extension.
- Forgetting auto-refreshing status content when evaluating 2.2.2.
- Confusing a warning with a mechanism to extend or control the limit.
- Assuming AAA criteria are implied by an AA conformance target.

# Knowledge checks with answers

1. **What are the common options under 2.2.1?** Turn off, adjust, or extend with the required warning and confirmation, subject to exceptions.
2. **Does 2.2.2 cover every animation?** No; its specific conditions and essential-content exception matter.
3. **Which criterion addresses work after session re-authentication?** 2.2.5.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
