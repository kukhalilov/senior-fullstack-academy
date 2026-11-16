<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: operable keyboard accessible

# Scope and version

This covers WCAG 2.2 Guideline 2.1. Keyboard access includes equivalent operation and freedom to leave controls, plus safe treatment of character-key shortcuts. WCAG 2.2 retained these four criteria without additions to this guideline. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Keyboard accessibility makes interaction independent of pointer precision. The browser’s Tab sequence normally reaches controls; widget-specific keys may support efficient operation. Every keyboard interaction needs an obvious focus location and a reliable exit path. Supporting keyboard also benefits switch, voice, and other emulated input devices.

# Supplied names explained

- `2.1.1 Keyboard (A)` — All functionality must be operable through a keyboard interface without requiring specific timings for individual keystrokes, except where the underlying function depends on the path of movement rather than endpoints. A canvas drawing path can be inherently path-dependent; a custom date picker ordinarily is not.
- `2.1.2 No Keyboard Trap (A)` — If keyboard focus can move into a component, it can move away using the keyboard; if a non-standard exit method is needed, users are advised. A modal dialog may contain focus while open only if its controls and close/return behavior give a documented keyboard route out.
- `2.1.3 Keyboard (No Exception) (AAA)` — Keyboard operation is required without the path-dependent exception in 2.1.1.
- `2.1.4 Character Key Shortcuts (A)` — A shortcut made only from printable characters must be disableable, remappable to include a non-printable modifier, or active only when the relevant component has focus. This avoids accidental activation for speech-input and keyboard users.

# Cross-item comparison

2.1.1 allows an exception for functions whose operation inherently depends on a movement path; 2.1.3 removes it. 2.1.2 concerns entering and leaving a focused area, not whether every control follows Tab alone. 2.1.4 concerns single-character shortcuts even when the rest of the interface is keyboard operable.

# Examples

A custom slider can use Tab to enter, arrow keys to change value, Home/End where supported by its interaction design, and Tab to leave. A chess move may be path-dependent, but surrounding controls (choose piece, choose square, cancel) can provide an alternate keyboard interaction. An editor’s `s` shortcut should be disableable, remappable to a modifier chord, or work only while the editor is focused.

# Common mistakes

- Testing only whether Tab reaches a control; also test activation, adjustment, menu/dialog behavior, and exit.
- Using `tabindex="0"` as a substitute for correct widget keyboard behavior.
- Applying a timing-sensitive key sequence when the criterion disallows specific keystroke timing.
- Assuming a modal dialog is automatically a trap; the user needs a functional exit and return path.
- Forgetting single-letter shortcuts can conflict with voice control that speaks visible words.

# Knowledge checks with answers

1. **Does WCAG require every interaction to use Tab?** No. A widget can use documented keyboard conventions after focus enters it.
2. **When can a path-dependent exception apply?** When the function depends on the path of movement rather than only start/end points.
3. **Name the three allowed treatments for character-only shortcuts.** Disable, remap to include a non-printable modifier, or scope activation to focus within the component.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices Guide: Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
