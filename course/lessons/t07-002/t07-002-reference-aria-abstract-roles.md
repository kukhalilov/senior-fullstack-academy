
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: Abstract WAI-ARIA role model (not author-assigned)

# Scope and version

These twelve abstract roles are role-hierarchy concepts in the supplied WAI-ARIA 1.3 Working Draft; they are not roles authors should put in markup. The hierarchy expresses inheritance and classification for concrete roles. [WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)

# How this group fits the mental model

Concrete roles inherit characteristics from superclass roles. Abstract roles organize those relationships: they can define common states, properties, required context, or supported characteristics, but they are not intended to describe an element directly. Browsers and accessibility tools use the model to interpret concrete roles.

# Supplied names explained

- `command` — Abstract family for actionable commands such as buttons and links.
- `composite` — Abstract family of widgets whose descendants or owned elements participate in a managed focus/navigation model.
- `input` — Abstract family of user-input controls.
- `landmark` — Abstract family for major navigational regions.
- `range` — Abstract family for values selected within a range.
- `roletype` — Root abstract role from which the role hierarchy derives.
- `section` — Abstract family for structural regions of a document.
- `sectionhead` — Abstract family for headings that label sections.
- `select` — Abstract family for controls that allow a user to make a selection.
- `structure` — Abstract family of document-structure roles.
- `widget` — Abstract family of interactive user-interface objects.
- `window` — Abstract family of windows or window-like containers.

# Cross-item comparison

The hierarchy can overlap in useful ways: a concrete widget can also be a composite and input. A landmark is a navigable section; a generic structure may communicate organization without becoming a landmark. A range role describes a bounded value pattern, while select describes choosing among values. These are taxonomy relationships, not author-facing component choices.

# Examples

Use the concrete `button` role or preferably a native `<button>`; never write `role="command"`. Use a concrete `slider` for a range control and a concrete `listbox` or `combobox` for selection semantics, with the full expected behavior.

# Common mistakes

- Assigning an abstract role in `role="..."` because it sounds semantically broad.
- Assuming superclass membership supplies behavior to a custom widget.
- Treating role hierarchy labels as a complete component design guide; consult the concrete role requirements and APG pattern.

# Knowledge checks with answers

1. **Can authors assign `composite` directly?** No; it is abstract.
2. **Why does the hierarchy matter?** It defines shared characteristics inherited by concrete roles and helps interpret role requirements.
3. **What should be used for an actual slider?** The concrete `slider` role with its required value semantics and behavior, or a suitable native control.

# Sources

- [WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
