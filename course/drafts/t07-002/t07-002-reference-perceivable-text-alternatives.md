<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: perceivable text alternatives

# Scope and version

This reference covers the single supplied criterion in WCAG 2.2 Guideline 1.1, based on the [W3C Recommendation](https://www.w3.org/TR/WCAG22/) and [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/). Success criterion 1.1.1 is Level A. The description below is a learning summary; conformance judgments require the normative text, scope, exceptions, and relevant user context.

# How this group fits the mental model

Text alternatives make non-text information available through a form that can be adapted to the user's needs. A useful alternative communicates the purpose or meaning in context, rather than merely naming the image file or describing irrelevant visual details.

# Supplied names explained

- `1.1.1 Non-text Content (A)` — Provide a text alternative serving an equivalent purpose for non-text content, subject to criterion-defined exceptions. Controls and inputs need names that describe their purpose. Time-based media and tests/sensory experiences have specific alternative requirements. Content that is pure decoration, used only for visual formatting, or invisible to users should be implemented so assistive technology can ignore it. CAPTCHA content needs alternatives in different sensory modes that account for differing disabilities. The correct alternative depends on the content's function and context.

# Cross-item comparison

| Image/content type | Alternative approach | Common failure |
| --- | --- | --- |
| Informative image | Concise text conveying relevant information | Generic “image” or filename |
| Functional image/link/button | Name the action or destination | Describing appearance without the function |
| Decorative image | Empty alternative or equivalent hiding pattern when appropriate | Redundant spoken file/description |
| Complex chart/diagram | Short identification plus detailed nearby explanation/data | Trying to encode all details into one long label |
| CAPTCHA | Alternatives in different sensory modes | Only one inaccessible mode |

# Examples

```html
<a href="/reports">
  <img src="reports.svg" alt="">
  <span>Reports</span>
</a>
```

The visible link text already names the destination, so the decorative icon does not need a duplicate announcement. By contrast, a linked image without visible text needs an alternative that communicates where activating it goes.

For a chart, a concise text alternative might identify it as quarterly revenue, while an adjacent table or explanation communicates the relevant values and trend. The exact content depends on what the chart contributes to the page.

# Common mistakes

- Writing `alt="image"` or repeating the file name.
- Using an image's visual description when its real function is a link or control.
- Omitting meaningful information from charts, diagrams, or data visualizations.
- Repeating adjacent text with redundant image alternatives.
- Assuming the same alternative works in every context.
- Treating an empty `alt` as universally correct; it is appropriate for content that should be ignored, not meaningful images.

# Knowledge checks with answers

1. **What should a functional image's alternative communicate?** The purpose/action or destination in context.
2. **Why may a decorative icon have an empty alternative?** Adjacent text already communicates the function, and the icon contributes no additional information.
3. **Is one short `alt` always sufficient for a complex chart?** No; the needed equivalent information may require an adjacent data table or detailed description.
4. **Does 1.1.1 apply only to `<img>`?** No; it covers non-text content more broadly, including controls and other non-text content.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI: Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
