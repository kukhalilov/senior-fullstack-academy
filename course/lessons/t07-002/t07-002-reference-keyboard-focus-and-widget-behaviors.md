
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: Keyboard and focus design concepts

# Scope and version

This reference consolidates supplied focus, keyboard, naming, and role-model concepts. It uses the APG as implementation guidance and WAI-ARIA as the semantics model; widget-specific keys vary by pattern and must be documented and tested. [APG Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) · [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)

# How this group fits the mental model

Keyboard behavior is a contract among the DOM, focus system, widget state, and assistive technology. Most pages need a simple Tab sequence across interactive controls; a composite widget may use one Tab stop and arrows within it. Choose either roving DOM focus or `aria-activedescendant` when appropriate, and keep visual focus, DOM focus, and selected state coherent.

# Supplied names explained

- `Roving tabindex` — Keep one item in a composite at `tabindex="0"` and peers at `-1`; arrow movement updates the tab stop and focuses the new item.
- `aria-activedescendant focus management` — DOM focus stays on a container while `aria-activedescendant` identifies the active owned/controlled child; ensure the active item is visible and its ID relationship valid.
- `Tab sequence` — Sequential focus navigation among page-level interactive controls; avoid positive tabindex values that create a separate, fragile order.
- `Arrow-key navigation` — Pattern-specific movement among related items; wrap, orientation, and disabled-item behavior vary by widget.
- `Home and End navigation` — Optional efficient movement to first/last item in patterns that specify it; do not assume every widget uses these keys.
- `Escape dismissal` — Common way to dismiss menus, popups, or dialogs; return focus according to the interaction context.
- `Enter and Space activation` — Common activation keys, with native HTML controls preferred because browsers supply expected behavior.
- `Focus entry and return` — Decide where focus begins on entering a widget or dialog and where it goes after dismissal.
- `Modal dialog focus containment` — While modal, prevent keyboard users from interacting with the background and keep focus in the dialog until it closes.
- `Focus restoration` — Return focus to the invoking control or a logical next location when the original target no longer exists.
- `Disabled versus unavailable controls` — Native disabled controls generally leave sequential focus; `aria-disabled` can remain focusable but requires blocked activation and clear styling.
- `Pointer cancellation and drag alternatives` — Avoid executing an action irreversibly on pointer-down and offer a non-drag single-pointer alternative where required.
- `Live-region announcement timing` — Keep updates concise and appropriately polite/assertive; announce after the region exists and avoid flooding.
- `Accessible name and description computation` — Name identifies a control; description adds supporting information. Use native labeling and valid references before ARIA overrides.
- `Role-state-property support` — A role defines supported semantics; only use states/properties valid for that role and keep them synchronized.
- `Required states and properties` — Some roles require states or properties for meaningful interpretation; consult role definitions and provide them.
- `Allowed accessibility child roles` — Some roles constrain which semantic children they can own; preserve valid structure.
- `Required accessibility parent roles` — Some roles need a specific semantic context, such as an option within a listbox.
- `Presentational children` — Some roles flatten child semantics in the accessibility tree; do not place meaningful independently navigable content inside such roles without checking the role definition.
- `Name From author` — The accessible name may be supplied by author text or a labeling relationship, subject to role naming rules.
- `Name From content` — Some roles derive a name from descendant content; this depends on role and computation rules.
- `Name prohibited` — Some roles must not be given an accessible name; adding a label can create noise or invalid semantics.

# Cross-item comparison

Roving tabindex moves actual DOM focus; active-descendant keeps DOM focus on a container and reports an active child. `aria-selected` denotes selection, not focus; `aria-current` denotes current item in a related set. `aria-disabled` is an announced state but authors must prevent activation. A live-region update should not normally steal focus; dialogs and composite widgets deliberately manage it.

# Examples

In a tablist using roving tabindex, Tab enters the selected tab, arrows move focus/selection according to the pattern, and Tab leaves for panel content. For a modal dialog, move focus to a meaningful initial control, keep background controls out of the tab sequence while modal, support dismissal, then restore focus. If the triggering item was deleted, restore to the next logical workflow location instead.

# Common mistakes

- Giving every item in a composite `tabindex="0"`, making users tab through a long widget.
- Updating active-descendant without ensuring that element exists and is owned/controlled.
- Conflating focused, selected, checked, and current states.
- Using positive `tabindex` values to force visual order.
- Applying the same arrow-key rules to every widget instead of following its specific pattern.

# Knowledge checks with answers

1. **How do roving tabindex and active descendant differ?** The first moves DOM focus; the second keeps DOM focus on the container and identifies an active child.
2. **Should selecting a tab always move focus out of the tablist?** No; pattern defines focus movement, and selection is not the same as leaving the widget.
3. **What happens to focus after a modal closes?** Usually it returns to its invoker or another logical successor if that control no longer exists.

# Sources

- [ARIA Authoring Practices Guide: Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [ARIA Authoring Practices Guide patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
