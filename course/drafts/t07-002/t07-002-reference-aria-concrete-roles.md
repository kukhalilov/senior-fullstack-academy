<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: Concrete WAI-ARIA 1.3 draft roles

# Scope and version

This inventory names the concrete roles in the supplied WAI-ARIA 1.3 Working Draft dated 2026-06-04. WAI-ARIA 1.2 remains the stable Recommendation; draft vocabulary and behavior can change and may not be uniformly implemented. Prefer native HTML where it supplies equivalent semantics and behavior. [WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/) · [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)

# How this group fits the mental model

A role communicates what an element is, not what it looks like. It does not automatically create keyboard support, state updates, validation, focus management, or native behavior. The role hierarchy also defines required context, owned elements, supported states, and naming rules. Abstract roles are not author-assigned. Draft-only additions are flagged below.

# Supplied names explained

| Role | Purpose and caution |
| --- | --- |
| `alert` | Important, time-sensitive text announced without moving focus; usually assertive and should be used sparingly. |
| `alertdialog` | Modal dialog that communicates an urgent message and requests a response; provide a name, operable controls, and managed focus. |
| `application` | Signals an application-like interaction mode in some AT; use only when a complete application interaction model justifies it. |
| `article` | Self-contained composition that can be independently distributed or reused. |
| `banner` | Site-wide header landmark; nested use has restrictions, and multiple banners need names/context. |
| `blockquote` | A quotation section, normally with a citation relationship supplied by content markup. |
| `button` | Action control; author must implement keyboard activation and state if custom. |
| `caption` | Name/description for a table; prefer native `<caption>`. |
| `cell` | Generic table/grid cell; use `gridcell` for interactive grid semantics. |
| `checkbox` | Binary or tri-state checkable control; expose checked/mixed state and Space behavior. |
| `code` | Fragment of computer code. |
| `columnheader` | Header cell for a column in a table/grid/treegrid. |
| `combobox` | Input/control with an associated popup; implement expanded state, popup relationship, selection, and keyboard model. |
| `comment` | WAI-ARIA 1.3 draft role for a comment in a document. |
| `complementary` | Complementary landmark content related to the main content. |
| `contentinfo` | Site-wide footer landmark; nested use is constrained. |
| `definition` | Definition of a term; use with appropriate term semantics. |
| `deletion` | Content deleted from a document; native `<del>` is usually appropriate. |
| `dialog` | Window-like region requiring user interaction; modal behavior requires additional implementation and `aria-modal` only when truly modal. |
| `directory` | Deprecated in WAI-ARIA 1.2; use list semantics for an ordinary list. |
| `document` | Region whose content is a document; can affect AT interaction mode. |
| `emphasis` | Stress emphasis; native `<em>` is preferred. |
| `feed` | Dynamic stream of articles with a defined reading/focus interaction pattern. |
| `figure` | Self-contained figure or illustration, optionally named. |
| `form` | Landmark for a form; name distinct form landmarks when needed. |
| `generic` | Generic element with no special semantic role; authors should not assign it explicitly. |
| `grid` | Interactive tabular composite with managed focus and directional navigation, not merely a layout table. |
| `gridcell` | Cell in an interactive grid/treegrid. |
| `group` | Related objects that are not a separate landmark; may provide context for controls. |
| `heading` | Heading with a programmatically supplied level. |
| `image` | WAI-ARIA 1.3 draft synonym of `img`; verify current support before relying on it. |
| `img` | Image or image group; accessible name should convey purpose when meaningful. |
| `insertion` | Inserted content; native `<ins>` is usually preferred. |
| `link` | Navigation reference; custom link must support expected keyboard activation and destination semantics. |
| `list` | List of items; pair with list-item semantics. |
| `listbox` | Selectable options widget, not a general navigation list; implement selection and arrow-key behavior. |
| `listitem` | Item in a list. |
| `log` | Sequential live region where new information is meaningful in order, such as a chat log. |
| `main` | Dominant page content landmark; generally one main landmark per page. |
| `mark` | WAI-ARIA 1.3 draft role for content marked/highlighted for reference; native `<mark>` may be suitable. |
| `marquee` | Automatically updating content region; provide pause/stop controls where needed. |
| `math` | Mathematical expression. |
| `menu` | Application-style menu of actions/choices with composite keyboard behavior; not a generic site navigation list. |
| `menubar` | Persistent menu container with menu-style navigation. |
| `menuitem` | Command in a menu/menubar; implement menu focus and activation keys. |
| `menuitemcheckbox` | Checkable menu command with exposed checked state. |
| `menuitemradio` | Mutually exclusive menu command in a radio group. |
| `meter` | Measurement within a known range, not progress toward task completion. |
| `navigation` | Landmark containing navigation links; name multiple navigation landmarks. |
| `none` | Removes implicit role semantics when permitted; does not remove focusability or all descendants in every case. |
| `note` | Content that is ancillary to the main content. |
| `option` | Selectable item within a listbox. |
| `paragraph` | Paragraph text. |
| `presentation` | Synonym of `none` for suppressing semantics when allowed; can be ignored for focusable or otherwise semantically constrained elements. |
| `progressbar` | Progress of a task; expose current value or indeterminate state. |
| `radio` | One mutually exclusive choice; implement checked state and group keyboard behavior. |
| `radiogroup` | Group of related radio controls. |
| `region` | Named landmark when a region is important enough to navigate to. |
| `row` | Row in table/grid/treegrid structure. |
| `rowgroup` | Grouping of rows. |
| `rowheader` | Header cell for a row. |
| `scrollbar` | Scroll control associated with a scrollable region; custom implementation needs value and keyboard behavior. |
| `search` | Landmark for search functionality. |
| `searchbox` | Text input for search; native search input is preferred where appropriate. |
| `sectionfooter` | WAI-ARIA 1.3 draft role related to a section footer; support may vary. |
| `sectionheader` | WAI-ARIA 1.3 draft role related to a section header; support may vary. |
| `separator` | Divider; only focusable separators have widget semantics/value behavior. |
| `slider` | Range-selection control with keyboard/value support. |
| `spinbutton` | Editable numeric input with increment/decrement behavior and exposed range. |
| `status` | Advisory status region, typically polite and not focus-stealing. |
| `strong` | Strong importance; native `<strong>` is preferred. |
| `subscript` | Subscript text; native `<sub>` is preferred. |
| `suggestion` | WAI-ARIA 1.3 draft role for suggested content; draft support may vary. |
| `superscript` | Superscript text; native `<sup>` is preferred. |
| `switch` | On/off control with checked state; Space toggles in the APG pattern. |
| `tab` | Selectable tab in a tablist associated with a tabpanel. |
| `table` | Static tabular structure; use native table when possible, not for layout. |
| `tablist` | Container managing focus and selection among tabs. |
| `tabpanel` | Content panel associated with a tab. |
| `term` | Term being defined; pair with definition semantics. |
| `textbox` | Text-entry control; expose multiline/read-only/required states as applicable. |
| `time` | Date/time value. |
| `timer` | Chronological counter or elapsed-time value; announce updates thoughtfully. |
| `toolbar` | Compact group of controls with managed arrow-key focus. |
| `tooltip` | Descriptive popup associated with a trigger; it is not interactive and should not receive focus. The 1.3 draft changes its naming rules. |
| `tree` | Hierarchical selectable items with managed keyboard navigation. |
| `treegrid` | Interactive grid with hierarchical rows. |
| `treeitem` | Item in a tree; expanded/collapsed state and level/context are relevant. |

# Cross-item comparison

Prefer native `<button>`, `<a>`, `<input>`, `<select>`, headings, lists, landmarks, and tables when they fit: native elements provide more than role. A `table` is static data; `grid` is an interactive composite. A `meter` reports a measurement; `progressbar` reports task completion. `none`/`presentation` suppress semantics under restrictions, while `generic` is not an author tool. `image` and the section/comment/suggestion roles are 1.3 draft vocabulary; do not imply stable cross-platform support.

# Examples

Use `<button type="button">Save</button>` instead of a clickable `<div role="button">`. If a custom tab interface is truly needed, implement the associated tablist/tab/tabpanel relationships, selection state, focus model, and arrow-key behavior together. Mark a site-wide navigation region with a landmark and an accessible name when more than one exists.

# Common mistakes

- Adding a role and assuming the browser creates its interaction behavior.
- Using `menu` for ordinary site navigation or `grid` for a static table.
- Assigning abstract roles or explicit `generic` roles.
- Using `aria-hidden`/presentation to hide a focusable control while leaving it operable.
- Treating all WAI-ARIA 1.3 draft roles as Recommendation-level or widely supported.

# Knowledge checks with answers

1. **Which role is intended for static tabular data?** `table` (or native HTML table).
2. **Does `button` role create Space/Enter behavior on a `div`?** No; the author must implement it, so native `<button>` is preferred.
3. **Which role describes task completion?** `progressbar`; a `meter` is a scalar measurement.
4. **Which roles in this list are draft-sensitive additions?** `image`, `comment`, `mark`, `suggestion`, `sectionheader`, and `sectionfooter` as named in the dated 1.3 draft.

# Sources

- [WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
- [ARIA Authoring Practices Guide patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
