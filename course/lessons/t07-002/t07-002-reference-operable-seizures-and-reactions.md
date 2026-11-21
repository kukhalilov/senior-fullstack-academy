
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: operable seizures and reactions

# Scope and version

These are the three supplied criteria in WCAG 2.2 Guideline 2.3, covering flashing and motion-triggered animation. Apply the exact area, frequency, duration, and exception rules in the normative text; “avoid animation” is not an accurate substitute for those tests. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Rapid flashing can trigger seizures; motion animation can cause physical reactions or distraction. Evaluate actual rendered content, including ads and third-party embeds, and offer controls when a criterion requires them. Respect user preferences such as reduced motion as a useful design aid, but do not treat a preference setting as a replacement for WCAG conformance.

# Supplied names explained

- `2.3.1 Three Flashes or Below Threshold (A)` — Web pages do not contain anything that flashes more than three times in any one-second period, or the flash is below the general-flash and red-flash thresholds. The rule includes limits based on area; evaluate luminance transitions and saturated red carefully.
- `2.3.2 Three Flashes (AAA)` — Web pages contain no content that flashes more than three times in any one-second period. This removes the below-threshold exception allowed at Level A.
- `2.3.3 Animation from Interactions (AAA)` — Motion animation triggered by interaction can be disabled unless the animation is essential to functionality or information conveyed.

# Cross-item comparison

2.3.1 and 2.3.2 concern flashing; the former allows content below defined thresholds, while the AAA criterion is stricter. 2.3.3 concerns motion animation from interaction, not only flashes. A non-flashing zoom transition can still fall within the animation criterion.

# Examples

Review a flashing banner at actual size and duration rather than assuming a small ad is harmless. A user-triggered parallax or zoom transition can provide a control to reduce or disable the motion while retaining the action’s result. Prefer honoring `prefers-reduced-motion` while retaining a usable state transition.

# Common mistakes

- Treating “three flashes” as an average over a long animation; the threshold is per one-second period.
- Checking only authored application code and overlooking third-party or injected content.
- Confusing the flashing success criteria with all motion animation.
- Assuming reduced-motion CSS automatically satisfies 2.3.3 without an operable mechanism where required.

# Knowledge checks with answers

1. **Which criterion allows a below-threshold flash exception?** 2.3.1.
2. **Does 2.3.3 address only seizure-triggering flashes?** No; it addresses motion animation triggered by interaction.
3. **Is reduced-motion preference still useful?** Yes, but it complements rather than replaces the applicable success criterion.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
