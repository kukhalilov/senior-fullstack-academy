
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: perceivable adaptable

# Scope and version

This reference covers Guideline 1.3 in the WCAG 2.2 Recommendation. The criteria address how meaning survives changes in presentation and how common user needs are identified. A semantic DOM is a reliable starting point, but the normative test is whether the information, relationships, sequence, and purpose remain programmatically available. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Adaptability separates information from one visual arrangement. Headings, labels, table headers, lists, and form relationships should be represented in markup so browser and assistive technology can expose them; reading order should still make sense when styling is removed; instructions should not depend only on shape, location, color, sound, or other sensory cues. WCAG 2.2 adds no new criteria to this guideline.

# Supplied names explained

- `1.3.1 Info and Relationships (A)` — Structure, relationships, and grouping conveyed visually must be determinable in text or programmatically. Use actual headings, lists, table headers, labels and fieldsets where they express the relationship; ARIA may express relationships for custom interfaces, but a role alone does not create the required behavior.
- `1.3.2 Meaningful Sequence (A)` — When sequence affects meaning, a correct reading sequence must be programmatically determinable. DOM order is usually the robust source; CSS visual reordering must not make keyboard and assistive-technology order confusing.
- `1.3.3 Sensory Characteristics (A)` — Instructions must not rely solely on shape, size, visual location, orientation, or sound. “Choose the round button at the right” needs an identifying name or text cue as well.
- `1.3.4 Orientation (AA)` — Do not restrict display and operation to a single screen orientation unless that orientation is essential. Respect device rotation and avoid lock-orientation designs for ordinary content.
- `1.3.5 Identify Input Purpose (AA)` — For fields collecting information about the user, expose the purpose using the specified programmatic mechanism (commonly appropriate `autocomplete` tokens), where the purpose is in the defined input-purpose taxonomy. This supports personalized presentation; it is not a requirement to add autocomplete indiscriminately to every field.
- `1.3.6 Identify Purpose (AAA)` — Identify the purpose of user-interface components, icons, and regions in a machine-readable way where they match the defined purpose taxonomy. This criterion is broader than the personal-data input-purpose criterion above.

# Cross-item comparison

| Criterion | Main question | Common implementation evidence |
| --- | --- | --- |
| 1.3.1 | Are relationships exposed? | Native semantic elements, labels, header associations, or valid ARIA relationships |
| 1.3.2 | Does sequence preserve meaning? | Logical DOM order and coherent focus sequence |
| 1.3.3 | Are instructions independent of senses? | Text identifiers in addition to visual or audio cues |
| 1.3.4 | Can users use either orientation? | No unnecessary orientation lock |
| 1.3.5 | Is a user's data-entry purpose exposed? | Correct autocomplete token on applicable fields |
| 1.3.6 | Is component purpose exposed? | Machine-readable purpose for applicable components and regions |

# Examples

Prefer `<label for="email">Email</label><input id="email" autocomplete="email">` to a visual caption positioned near an unlabeled field. A required marker should be accompanied by text or programmatic state, not color alone. If a card is visually moved ahead of another using CSS, preserve a reading and focus order that still tells the same story.

# Common mistakes

- Using ARIA to restate native semantics while leaving the underlying relationship broken.
- Assuming visual order created with grid or flex automatically changes DOM reading order.
- Treating 1.3.5 as a requirement that every field autofill or as equivalent to 1.3.6.
- Relying on “above,” “left,” color, or shape as the sole instruction.
- Locking a page to portrait or landscape for convenience rather than essential content.

# Knowledge checks with answers

1. **What is the core of 1.3.1?** Expose relationships and structure that visual presentation communicates.
2. **Does CSS order guarantee a meaningful assistive-technology sequence?** No; validate DOM and focus order as well.
3. **What makes 1.3.5 narrower than 1.3.6?** It concerns purposes of fields collecting information about the user; 1.3.6 covers additional component and region purposes.
4. **Can a map require landscape?** Only where that orientation is essential; ordinary content must not be needlessly restricted.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
