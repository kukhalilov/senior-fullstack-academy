
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: perceivable distinguishable

# Scope and version

This covers all thirteen supplied success criteria in WCAG 2.2 Guideline 1.4, including the AA reflow, non-text contrast, text spacing, and hover/focus requirements. Check the normative text for each exception; thresholds are not universal pass/fail rules for every pixel. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Users need to perceive content through different sensory conditions and presentation settings. Distinguishability includes contrast and non-color cues, user resizing and spacing overrides, alternatives to text rendered as images, and predictable supplemental content revealed on hover or focus.

# Supplied names explained

- `1.4.1 Use of Color (A)` — Color cannot be the only visual means of conveying information, indicating an action, prompting a response, or distinguishing an element. Add labels, patterns, icons, or other cues.
- `1.4.2 Audio Control (A)` — Automatically playing audio longer than three seconds needs a mechanism to pause/stop it or independently control its volume, separate from overall system volume.
- `1.4.3 Contrast (Minimum) (AA)` — Text and images of text need 4.5:1 contrast, or 3:1 for large-scale text. WCAG defines large-scale as at least 18 point regular or 14 point bold (about 24 CSS px or 18.67 CSS px respectively); listed exceptions include incidental, logotype, and certain inactive text.
- `1.4.4 Resize Text (AA)` — Text must resize to 200% without assistive technology and without loss of content or functionality, subject to the criterion’s exceptions.
- `1.4.5 Images of Text (AA)` — Use text rather than images of text when the technology can achieve the presentation, except where the image is customizable or essential.
- `1.4.6 Contrast (Enhanced) (AAA)` — Enhanced text contrast is 7:1, or 4.5:1 for large-scale text using the same 18-point regular / 14-point bold definition, with criterion exceptions.
- `1.4.7 Low or No Background Audio (AAA)` — For prerecorded audio-only content primarily speech, the criterion limits background sound or provides a way to suppress it, with exceptions.
- `1.4.8 Visual Presentation (AAA)` — Provides mechanisms for specified text presentation controls (foreground/background selection, width, alignment, line spacing, and resizing) and prevents loss of content/function when those settings are applied.
- `1.4.9 Images of Text (No Exception) (AAA)` — Images of text are used only for decoration or where the specific presentation is essential; unlike 1.4.5, there is no general customizable-image exception.
- `1.4.10 Reflow (AA)` — At 320 CSS-pixel viewport width for vertically scrolling content, and 256 CSS-pixel height for horizontally scrolling content, content must not require two-dimensional scrolling except for parts that require it to be used or understood.
- `1.4.11 Non-text Contrast (AA)` — Visual information needed to identify UI components/states and meaningful graphical objects needs 3:1 contrast against adjacent colors, subject to exceptions.
- `1.4.12 Text Spacing (AA)` — Content must remain usable when users override line height to at least 1.5 times font size, paragraph spacing to 2 times font size, letter spacing to 0.12 times font size, and word spacing to 0.16 times font size.
- `1.4.13 Content on Hover or Focus (AA)` — Additional content shown on hover/focus must be dismissible (when it obscures/replaces content), hoverable, and persistent until dismissed, invalid, or focus/hover is removed, with stated exceptions.

# Cross-item comparison

| Area | Threshold or behavior | Do not confuse with |
| --- | --- | --- |
| Text contrast | 4.5:1 AA; 3:1 large text; 7:1 AAA; 4.5:1 large AAA | Non-text contrast, which generally uses 3:1 |
| Target reflow | 320 CSS px width or 256 CSS px height, depending on scroll direction | A requirement to remove all two-dimensional data or maps |
| Spacing override | Four specified user-adjusted values must not cause loss | Requiring those values as the default design |
| Hover/focus content | Dismissible, hoverable, persistent | A tooltip being merely visible on mouse hover |

# Examples

For an error state, combine a textual “Required” message or icon with color. Test text at 200% zoom, then apply the 1.4.12 spacing values; no buttons or text should overlap or become clipped. A chart may need two-dimensional scrolling if that is essential to understand it, but surrounding page content should reflow. A hover card must remain available while the pointer moves onto it and should be dismissible by the user when it obscures other content.

# Common mistakes

- Applying 4.5:1 to large text as if it were the only AA threshold, or applying text thresholds to every graphical object.
- Assuming 1.4.12 requires authors to use the override values by default.
- Treating 320 CSS pixels as a device-pixel measurement.
- Hiding content behind a hover-only interaction that keyboard users cannot reach.
- Forgetting exceptions are criterion-specific; logotypes and essential two-dimensional layouts are not blanket exemptions from other criteria.

# Knowledge checks with answers

1. **What are AA text contrast ratios?** 4.5:1 for ordinary text and 3:1 for large-scale text.
2. **What does 1.4.12 test?** That applying its specified spacing overrides does not lose content or function.
3. **What three behaviors must supplemental hover/focus content support?** Dismissible, hoverable, and persistent, subject to the criterion’s exceptions.
4. **Does 1.4.10 prohibit every horizontal scroll?** No; two-dimensional content may require it, while ordinary content should reflow.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
