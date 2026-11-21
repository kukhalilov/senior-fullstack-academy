
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: understandable input assistance

# Scope and version

This covers all nine success criteria in WCAG 2.2 Guideline 3.3, including three criteria added in WCAG 2.2. Forms should help people avoid, detect, understand, and correct errors, with stricter safeguards for consequential legal, financial, or data submissions. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Input assistance is a lifecycle: make expected input clear, identify errors, explain correction, preserve valid entries, provide help, and add review/reversal safeguards where consequences are serious. Client-side validation can improve feedback, but server-side validation and accessible error communication remain necessary.

# Supplied names explained

- `3.3.1 Error Identification (A)` — When an input error is detected automatically, identify the item in error and describe the error in text.
- `3.3.2 Labels or Instructions (A)` — Provide labels or instructions when content requires user input.
- `3.3.3 Error Suggestion (AA)` — When an input error is detected and a known correction suggestion exists, provide it unless doing so would jeopardize security or purpose.
- `3.3.4 Error Prevention (Legal, Financial, Data) (AA)` — For specified consequential submissions, at least one safeguard supports reversibility, checking/correction, or confirmation before finalization.
- `3.3.5 Help (AAA)` — Context-sensitive help is available.
- `3.3.6 Error Prevention (All) (AAA)` — For submissions, provide at least one of reversibility, checking/correction, or confirmation before finalization.
- `3.3.7 Redundant Entry (A)` — Information previously entered by or provided to the user that is required again in the same process is either auto-populated or available for selection, unless re-entry is essential, required for security, or previously invalid. New in WCAG 2.2.
- `3.3.8 Accessible Authentication (Minimum) (AA)` — Authentication does not require a cognitive function test (such as remembering, transcribing, or solving a puzzle) unless one of the criterion’s exceptions applies, such as an alternative method, assistive mechanism, or object recognition. New in WCAG 2.2.
- `3.3.9 Accessible Authentication (Enhanced) (AAA)` — Stronger than 3.3.8: object recognition is not an allowed exception; other specified exceptions remain. New in WCAG 2.2.

# Cross-item comparison

3.3.1 identifies the error; 3.3.3 adds a correction suggestion when known. 3.3.4 applies to defined high-impact submissions at AA; 3.3.6 applies more broadly at AAA. 3.3.8 and 3.3.9 limit cognitive-function tests during authentication but are not a blanket ban on authentication or security; read their exceptions carefully. WCAG 2.2’s 3.3.7 is about repeated entry within the same process, not every request to confirm data.

# Examples

For a payment form, place an error summary near the start, link each message to its field, describe errors in text, and preserve valid values. Before finalizing a regulated transfer, show the amount and recipient with a correction or confirmation step. If a shipping address was entered earlier in a checkout flow, offer it for reuse rather than forcing retyping. Provide a password manager-compatible sign-in path rather than a memory-only puzzle.

# Common mistakes

- Indicating errors only by red borders or moving focus without a textual explanation.
- Removing all form values after one validation error.
- Assuming “security” itself automatically qualifies for every authentication exception.
- Confusing object recognition with a cognitive-function test; 3.3.9 removes that exception while 3.3.8 includes it.
- Treating 3.3.7 as requiring autocomplete across unrelated sessions or processes.

# Knowledge checks with answers

1. **Which criterion asks for a correction suggestion when known?** 3.3.3.
2. **Which new WCAG 2.2 criterion addresses re-entering information in one process?** 3.3.7.
3. **What exception does 3.3.9 remove from 3.3.8?** Object recognition.
4. **Name one 3.3.4 safeguard.** Reversibility, checking/correction, or confirmation before finalization.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
