
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: Current ARIA Authoring Practices Guide patterns

# Scope and version

This reference inventories the supplied APG patterns and explains their purpose. APG examples are design guidance, not normative WCAG criteria and not a requirement to use ARIA when native HTML fits. Patterns and examples can evolve; consult the linked pattern before implementation. [APG Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) · [APG](https://www.w3.org/WAI/ARIA/apg/)

# How this group fits the mental model

An interaction pattern specifies coordinated roles, states, keyboard behavior, and focus management. Copying role markup without the expected behavior creates a misleading control. First consider whether native HTML supplies the needed interaction. If building a custom widget, implement its whole pattern and test actual browser/AT combinations.

# Supplied names explained

| Pattern | Core design concern |
| --- | --- |
| `Accordion` | Expand/collapse section headings; expose expanded state and control relationship. |
| `Alert` | Non-interrupting or urgent important message; alert is not a substitute for every status update. |
| `Alert and Message Dialogs` | Modal response-needed message versus non-modal alert; manage focus and dismissal. |
| `Breadcrumb` | Hierarchical navigation trail with current-page indication. |
| `Button` | Action control with expected activation and optional pressed state. |
| `Carousel` | Slide navigation, rotation controls, and accessible announcement; user control of auto-rotation matters. |
| `Checkbox` | Binary or tri-state selection; Space toggles. |
| `Combobox` | Input plus popup options; define autocomplete, active option, selection, and dismissal behavior. |
| `Dialog (Modal)` | Modal window with accessible name, initial focus, contained interaction, Escape behavior as appropriate, and focus restoration. |
| `Disclosure (Show/Hide)` | Single control reveals or hides content. |
| `Feed` | Article stream with keyboard support for dynamically loaded content. |
| `Grid` | Composite two-dimensional interaction with managed focus; avoid for static tabular data. |
| `Landmarks` | Navigation by page regions; name duplicate landmark instances. |
| `Link` | Navigation to a resource; use a native anchor for ordinary links. |
| `Listbox` | Selection from options; distinct from a menu of commands. |
| `Menu and Menubar` | Application command navigation with arrow-key behavior; not general website navigation. |
| `Menu Button` | Button opens a menu and communicates expanded state. |
| `Meter` | Scalar value within known range, not task progress. |
| `Radio Group` | One choice among alternatives with roving focus or equivalent pattern. |
| `Slider` | Select value in range; support keyboard, pointer, and accessible value. |
| `Slider (Multi-Thumb)` | Multiple coordinated range values; give each thumb a distinct name and constraints. |
| `Spinbutton` | Editable numeric value with increment/decrement and range semantics. |
| `Switch` | On/off setting with stable label and checked state. |
| `Table` | Static data relationships; native HTML table is usually preferable. |
| `Tabs` | Mutually exclusive panels controlled by tablist; align focus and selection behavior. |
| `Toolbar` | Group of controls with one tab stop and arrow-key movement where appropriate. |
| `Tooltip` | Supplemental non-interactive description; must be available on hover and focus and not contain focusable actions. |
| `Tree View` | Hierarchical items with expansion, selection, and managed focus. |
| `Treegrid` | Interactive tabular hierarchy; combines grid and tree navigation complexity. |
| `Window Splitter` | Resizable panes; expose orientation, value, keyboard operation, and affected region. |

# Cross-item comparison

Use a list of links for site navigation; use a menu only for application-style commands. A listbox selects options; a menu invokes actions. A table presents static relations; a grid makes cells part of an interactive composite. A meter reports a measurement; a progressbar reports task progress. A tooltip describes a trigger but should not contain interactive content—use a dialog or popover pattern if the popup needs focus.

# Examples

For tabs, a user generally Tabs to the active tab and arrow keys among tabs; activation may be automatic or manual depending on panel loading and the chosen pattern. For a modal dialog, move focus inside, keep keyboard interaction in the modal while it is open, close it through an operable control, and restore focus to the invoker or a logical successor.

# Common mistakes

- Applying a complex ARIA pattern to native controls that already meet the need.
- Using a `menu` role for a row of ordinary navigation links.
- Implementing roles but omitting keyboard behavior, state, or focus return.
- Auto-rotating a carousel without a discoverable pause/stop mechanism.
- Treating the APG as a conformance standard or assuming its example code is production-ready without testing.

# Knowledge checks with answers

1. **Which pattern is for choosing options rather than invoking commands?** Listbox (or a native select where suitable).
2. **Should a tooltip contain a link or button?** No; interactive popup content needs a different pattern.
3. **When is grid appropriate?** When cells form a keyboard-managed interactive composite, not merely because content is tabular.

# Sources

- [ARIA Authoring Practices Guide patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
