<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WAI-ARIA 1.3 draft states and properties

# Scope and version

This reference names every supplied state and property from the WAI-ARIA 1.3 Working Draft snapshot dated 2026-06-04, including deprecated legacy vocabulary and draft-only additions. WAI-ARIA 1.2 is the stable Recommendation. For each attribute, follow its allowed values, role support, required context, and host-language conflict rules; do not infer support from its name. [WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/) · [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)

# How this group fits the mental model

States describe current conditions that can change (checked, expanded, selected, busy). Properties provide other characteristics or relationships (label, description, controls, value range). Some values are tokens, booleans, ID references, or numbers. Use native HTML attributes when they provide the semantics; synchronize ARIA values with actual behavior and DOM state.

# Supplied names explained

| Attribute | Meaning and authoring caution |
| --- | --- |
| `aria-activedescendant` | ID of the active descendant while DOM focus stays on a composite container; maintain a valid owned/controlled relationship and update it with navigation. |
| `aria-atomic` | Whether a live-region update should be presented as a whole; usually boolean and meaningful with live-region behavior. |
| `aria-autocomplete` | Describes whether a textbox/combobox offers inline, list, or both kinds of completion; it does not create suggestions. |
| `aria-braillelabel` | WAI-ARIA 1.3 draft braille-specific alternative label; support is implementation-dependent. |
| `aria-brailleroledescription` | WAI-ARIA 1.3 draft braille-specific role description; use sparingly and do not replace a role. |
| `aria-busy` | Indicates that an element is being updated and may not yet be complete. |
| `aria-checked` | Checked state for checkbox/radio/switch families; supports `true`, `false`, and where allowed `mixed`. |
| `aria-colcount` | Total columns in a table/grid when not all are present in the DOM, or `-1` when unknown. |
| `aria-colindex` | One-based position of a column within the full column set, especially for partially rendered grids. |
| `aria-colindextext` | WAI-ARIA 1.3 draft human-readable column position text; check support and relationship to numeric index. |
| `aria-colspan` | Number of columns a cell spans in grid/table semantics. |
| `aria-controls` | IDs of elements whose content/function is controlled by the current element; it communicates relation, not behavior. |
| `aria-current` | Indicates the current item in a set (for example page, step, location, date, or true); only one item in a related set should ordinarily be current. |
| `aria-describedby` | ID references to supplementary descriptive text, not the primary name. |
| `aria-description` | Direct string description in the 1.2+ vocabulary; prefer visible associated text and avoid duplicating the name. |
| `aria-details` | ID reference to a detailed content source that is structurally richer than a short description. |
| `aria-disabled` | Communicates disabled state without necessarily removing focusability; author must prevent activation. Native `disabled` also supplies behavior. |
| `aria-dropeffect` | Deprecated legacy drag/drop property; do not use for modern drag-and-drop communication. |
| `aria-errormessage` | ID reference to error text when the control is invalid; pair with `aria-invalid` and ensure the referenced text exists. |
| `aria-expanded` | Whether a control’s expandable content is currently expanded; synchronize visibility and state. |
| `aria-flowto` | Indicates an alternate reading-navigation target; uncommon and not a substitute for logical DOM order. |
| `aria-grabbed` | Deprecated legacy drag/drop state; do not use for modern interactions. |
| `aria-haspopup` | Indicates popup type (`menu`, `listbox`, `tree`, `grid`, `dialog`, or `true` meaning menu); it does not create the popup. |
| `aria-hidden` | Excludes an element and descendants from the accessibility tree; never hide focusable/operable content. The 1.3 draft forbids true on document root elements. |
| `aria-invalid` | Indicates a value is unacceptable; set it when validation identifies an error, not preemptively without reason. |
| `aria-keyshortcuts` | Identifies implemented keyboard shortcuts; it does not implement them or make them discoverable by itself. |
| `aria-label` | Author-provided accessible name string; use only when visible/native labeling is insufficient and obey role naming rules. |
| `aria-labelledby` | ID reference(s) whose text supplies the accessible name; referenced text is concatenated in order. |
| `aria-level` | Hierarchical level for roles such as heading/treeitem when native structure does not provide it. |
| `aria-live` | Announces dynamic changes with `off`, `polite`, or `assertive`; assertive can interrupt and should be rare. |
| `aria-modal` | Declares a dialog modal; only set true when background interaction is actually prevented and focus is managed accordingly. |
| `aria-multiline` | Indicates whether textbox input accepts multiple lines; native textarea is preferred. |
| `aria-multiselectable` | Indicates that a listbox/tree/grid permits multiple selections. |
| `aria-orientation` | Indicates horizontal or vertical widget orientation when not implicit. |
| `aria-owns` | Reparents elements in the accessibility tree by ID reference; avoid when DOM ownership can represent the structure. |
| `aria-placeholder` | Short hint for expected input; it is not a replacement for a label. |
| `aria-posinset` | One-based position of an item in the full set when not all items are present in the DOM. |
| `aria-pressed` | Toggle-button state (`true`, `false`, or `mixed`); use for a button whose pressed state persists. |
| `aria-readonly` | Indicates value cannot be changed; unlike disabled, the control generally remains operable/selectable. |
| `aria-relevant` | Specifies types of live-region changes relevant for announcement; does not itself make a region live. |
| `aria-required` | Indicates a required value; native `required` supplies validation behavior where applicable. |
| `aria-roledescription` | Human-readable localized description of a role; keep the native role understandable and avoid replacing familiar role names. |
| `aria-rowcount` | Total rows in a table/grid when not all are in the DOM, or `-1` when unknown. |
| `aria-rowindex` | One-based row position in the full row set. |
| `aria-rowindextext` | WAI-ARIA 1.3 draft human-readable row position text; implementation support may vary. |
| `aria-rowspan` | Number of rows a cell spans. |
| `aria-selected` | Selection state of selectable options, tabs, rows, or cells; distinct from focus and current item. |
| `aria-setsize` | Total number of items in a set when not all are present in the DOM, or `-1` when unknown. |
| `aria-sort` | Sort direction/status of a sortable header; update it when sorting changes. |
| `aria-valuemax` | Maximum allowed value for a range-like role. |
| `aria-valuemin` | Minimum allowed value for a range-like role. |
| `aria-valuenow` | Current numeric value for a range-like role; keep synchronized with the actual control. |
| `aria-valuetext` | Human-readable alternative to a numeric value when the number alone is not meaningful. |

# Cross-item comparison

`aria-label` and `aria-labelledby` provide a name; `aria-description` and `aria-describedby` provide a description. `aria-controls` states a control relationship; it does not cause an action. `aria-disabled` communicates state but does not suppress events, while native `disabled` does. `aria-selected` is not focus; `aria-current` identifies the current item. Deprecated `aria-dropeffect` and `aria-grabbed` are not current drag APIs. Draft `aria-braille*`, `aria-colindextext`, and `aria-rowindextext` must not be treated as universally supported.

# Examples

For a disclosure, expose `aria-expanded="false"` while its panel is hidden, then update both state and visibility on activation. Label an icon-only button with `aria-label="Close dialog"` only when no visible label exists. For a virtualized grid, provide coherent row/column counts and one-based indexes; incorrect totals mislead users. For a live result count, prefer `aria-live="polite"` and update concise status text.

# Common mistakes

- Treating ARIA as an event handler or keyboard implementation.
- Setting a state without changing the actual UI, or changing the UI without updating the state.
- Using placeholder as the only label or `aria-label` to conceal missing visible text unnecessarily.
- Pointing ID-reference properties at missing, duplicate, or unrelated IDs.
- Using deprecated drag/drop properties or experimental draft properties without support testing.

# Knowledge checks with answers

1. **Name versus description?** `aria-label`/`aria-labelledby` name a component; `aria-description`/`aria-describedby` describe it.
2. **Does `aria-controls` open a popup?** No; it exposes a relationship only.
3. **What is the difference between `aria-disabled` and native `disabled`?** ARIA announces a state but does not disable interaction; native disabled state also affects browser interaction.
4. **Which supplied drag properties are deprecated?** `aria-dropeffect` and `aria-grabbed`.

# Sources

- [WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
