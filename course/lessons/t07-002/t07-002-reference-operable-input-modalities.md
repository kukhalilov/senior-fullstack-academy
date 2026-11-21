
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: operable input modalities

# Scope and version

This covers the eight criteria in WCAG 2.2 Guideline 2.5, including the newer dragging and minimum target-size criteria. These complement keyboard criteria; they address touch, pointer, voice, and other input methods. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

People use different devices and movement patterns. Avoid requiring complex paths or precise timing, let users cancel accidental activation, align accessible names with visible labels, and provide alternatives to dragging. Small targets need enough size or separation under the criterion’s detailed exceptions.

# Supplied names explained

- `2.5.1 Pointer Gestures (A)` — Functionality using multipoint or path-based gestures also has a single-pointer alternative unless the gesture is essential.
- `2.5.2 Pointer Cancellation (A)` — For single-pointer functionality, at least one specified safeguard applies: no down-event execution, abort/undo, up-event reversal, or essential completion. This reduces accidental activation.
- `2.5.3 Label in Name (A)` — For UI components with visible text labels, the accessible name contains that visible text; matching the beginning is particularly helpful for speech input.
- `2.5.4 Motion Actuation (A)` — Functionality operated by device motion or user gesture can also be operated through UI components, and users can disable motion response, except where essential.
- `2.5.5 Target Size (Enhanced) (AAA)` — Pointer targets are at least 44 by 44 CSS pixels, subject to its exceptions.
- `2.5.6 Concurrent Input Mechanisms (AAA)` — Do not restrict or interfere with available input modalities unless restriction is essential, required to ensure security, or needed to respect user settings.
- `2.5.7 Dragging Movements (AA)` — Functionality using dragging can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author.
- `2.5.8 Target Size (Minimum) (AA)` — Pointer targets are at least 24 by 24 CSS pixels, or satisfy one of the specified spacing, equivalent-control, inline, user-agent-control, or essential exceptions.

# Cross-item comparison

2.5.1 covers multipoint/path gestures; 2.5.7 specifically requires a non-drag single-pointer method for dragging functionality. 2.5.5 is the 44-pixel AAA threshold; 2.5.8 is the 24-pixel AA minimum with detailed exceptions. These criteria do not replace keyboard operability or adequate contrast.

# Examples

Offer “move earlier” and “move later” buttons alongside drag-and-drop sorting. A map’s pinch zoom can also offer plus/minus controls. A 20-pixel icon target may pass 2.5.8 through the spacing exception when nearby targets are sufficiently separated; verify the exact geometry. Ensure the accessible name begins with the visible “Search” label rather than naming the field “Find records.”

# Common mistakes

- Treating the 24-pixel AA and 44-pixel AAA dimensions as device pixels instead of CSS pixels.
- Assuming a tiny target passes because it has a large invisible hit area without checking target-size definitions and spacing exception.
- Treating keyboard shortcuts as a substitute for a single-pointer non-drag alternative.
- Naming a button differently from its visible label, harming speech control.
- Suppressing touch input because a pointer device is also connected.

# Knowledge checks with answers

1. **Which criterion applies to drag interactions?** 2.5.7, at AA.
2. **What are the headline target dimensions?** 24×24 CSS px at AA (with exceptions) and 44×44 CSS px at AAA.
3. **What does Label in Name protect?** A user can invoke a control by speaking the visible label and the accessible name remains consistent.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
