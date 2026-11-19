# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Speech speak-as properties

## Scope and version

This lesson covers the supplied CSS property `speak-as`. The current CSS Speech Level 1 Editor’s Draft is dated 2026-07-02; the latest published version is a 2023-02-14 Candidate Recommendation Draft. Both define the same grammar and initial value described here. The draft is work in progress. Sources and compatibility data were checked on 2026-11-20.

## How this group fits the mental model

CSS normally describes visual presentation, but CSS Speech defines a model for speech-synthesis rendering of structured documents. Within that model, `speak-as` is a pronunciation hint: it asks a supporting speech-capable user agent to interpret text in a particular way. It does not change the text in the DOM, rewrite what a person sees, or itself start speech playback.

Do not equate the CSS speech model with every screen reader’s behavior. Real assistive technologies may use their own document interpretation and speech pipeline; MDN describes support as limited and inconsistent. Treat this property as an enhancement that must be tested with the actual speech-capable user agents and assistive technologies you target. Do not encode essential meaning only in a pronunciation hint.

## Supplied names explained

This inventory contains the CSS property `speak-as`.

### Exact grammar

The CSS Speech grammar is:

```css
speak-as: normal;
speak-as: spell-out;
speak-as: spell-out digits;
speak-as: digits literal-punctuation;
speak-as: spell-out digits no-punctuation;
```

Formally, the alternatives are:

```text
normal
| spell-out || digits || [ literal-punctuation | no-punctuation ]
```

The double bar means one or more of its components can be combined in any order. The punctuation bracket allows either one of `literal-punctuation` or `no-punctuation`, never both. `normal` stands alone. So `spell-out digits literal-punctuation` is valid, while `normal digits`, `literal-punctuation no-punctuation`, and `auto` are not values in the specification grammar.

### Property descriptors

| Descriptor | CSS Speech Level 1 definition |
| --- | --- |
| Initial | `normal` |
| Applies to | All elements |
| Inherited | Yes |
| Percentages | Not applicable |
| Computed value | Specified value |
| Animation | Discrete |

The grammar and descriptor table are the normative reference. MDN’s current formal-definition panel lists `auto` as the initial value, which conflicts with both the current CSSWG Editor’s Draft and the latest published CSS Speech document, both of which specify `normal`. Follow the spec grammar and initial value, and treat the MDN panel as an inconsistency rather than evidence that `auto` is accepted.

### What each component requests

- **`normal`**: use language-dependent pronunciation rules. Punctuation is handled naturally, often as pauses. This is the initial value.
- **`spell-out`**: spell text one letter at a time. The exact spoken names and treatment of accented characters depend on language and speech implementation.
- **`digits`**: pronounce numbers digit by digit; for example, a speech renderer might say “31” as “three one” instead of “thirty-one.” This affects speech processing, not the text value.
- **`literal-punctuation`**: speak punctuation marks literally (for example, naming a comma or brace) instead of treating them as ordinary pauses.
- **`no-punctuation`**: omit punctuation from the speech rendering rather than speaking it or turning it into pauses.

CSS Speech provides basic pronunciation controls conceptually related to SSML’s `say-as`, but it is not a replacement for the broader SSML vocabulary and does not guarantee a particular voice, accent, timing, or phoneme output.

## Examples

This example applies separate hints to sample text:

```html
<p class="ordinary">Hello, world! I'm 31.</p>
<p class="spelled">API v2</p>
<p class="digits">31</p>
<p class="literal">Hello, world!</p>
<p class="combined">ID 31; ready.</p>
```

```css
.ordinary { speak-as: normal; }
.spelled { speak-as: spell-out; }
.digits { speak-as: digits; }
.literal { speak-as: literal-punctuation; }
.combined { speak-as: spell-out digits literal-punctuation; }
```

The declarations only affect a user agent that implements this speech feature and processes the content through its CSS Speech model. They do not make a visual page speak by themselves. Listen to the actual output: speech may vary by language, engine, platform, user settings, and assistive technology.

## Cross-item comparison

`speak-as` is a property that influences speech rendering for elements. The `speak-as` descriptor inside `@counter-style` instead configures a counter system’s marker output; its marker-specific precedence is described below. The Web Speech API is script-driven speech functionality and is separate from CSS styling.

## Inheritance, markers, and neighboring features

Because `speak-as` inherits, a rule on a parent can affect descendants unless they override it. Use a narrow selector when a pronunciation mode should apply only to a specific abbreviation, number, or code sample; a broad inherited rule can make unrelated content harder to understand.

For list markers, CSS Counter Styles also has an `@counter-style` descriptor named `speak-as`. It defines how a custom counter style is spoken. MDN notes that a `::marker` built with a counter style that specifies this descriptor uses the descriptor in preference to an inherited `speak-as` property. This is a counter-style descriptor interaction, not an extra value in the property’s grammar.

Keep these mechanisms distinct:

- `speak-as` is a CSS presentation hint for speech rendering.
- `@counter-style` `speak-as` describes spoken output for a counter style’s marker.
- The Web Speech API is a scripting API for speech synthesis and recognition; it is not a CSS value and does not imply CSS Speech support.
- HTML text and semantics remain the source content. Do not replace proper content, language metadata, or accessible labels with a pronunciation-only style.

## Support and production guidance

MDN marks the property Experimental and Limited availability. Its compatibility data reports no support in Chrome, Edge, and Firefox, and support beginning with Safari 11.1; mobile entries mirror their related engines. Support data for a property does not guarantee that every keyword or every screen reader/speech engine combination behaves alike.

Treat `speak-as` as progressive enhancement. Do not rely on it for critical instructions, pronunciation-dependent identity, or information that must be spoken consistently. Keep the underlying text understandable in the default reading mode, then test browser/OS/assistive-technology combinations and language-specific cases before depending on the result.

## Common mistakes

- Assuming this CSS declaration causes speech playback in a visual browser.
- Assuming every screen reader honors it in the same way.
- Using `auto` because it appears in MDN’s current initial-value panel; the CSS Speech spec says the initial value is `normal`, and `auto` is not in the grammar.
- Combining both `literal-punctuation` and `no-punctuation`.
- Combining `normal` with other components.
- Expecting `spell-out` or `digits` to select a specific language, voice, or pronunciation.
- Using speech styling as a replacement for correct visible text or semantic markup.
- Treating the `@counter-style` descriptor as a property value or assuming it has the same cascade role.

## Knowledge checks with answers

1. **What is the initial value in CSS Speech Level 1?** `normal`.
2. **Can `spell-out` and `digits` be combined?** Yes; the `||` grammar allows either or both.
3. **Can `literal-punctuation` and `no-punctuation` appear together?** No; the bracketed choice allows exactly one.
4. **Does `speak-as` itself start audio playback?** No; it is a rendering hint used by a supporting speech-capable user agent.
5. **Why should a developer test assistive technologies instead of assuming support?** Support is limited and inconsistent; the property does not ensure that each screen reader uses the CSS speech rendering model.
6. **What is the status of MDN’s `auto` initial-value entry?** It conflicts with current and published CSS Speech specifications, both of which say `normal`; `auto` is also absent from the property grammar.

## Sources

- [CSS Speech Module Level 1 Editor’s Draft, §7.2](https://drafts.csswg.org/css-speech-1/#speaking-props-speak-as) (grammar, descriptors, and value behavior)
- [CSS Speech Module Level 1 published Candidate Recommendation Draft](https://www.w3.org/TR/css-speech-1/) (published status and property definition)
- [MDN: `speak-as` CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/speak-as) (examples, support caveats, and the conflicting initial-value panel)
- [MDN Browser Compatibility Data: `speak-as`](https://github.com/mdn/browser-compat-data/blob/main/css/properties/speak-as.json) (engine support data)
- [CSS Counter Styles Level 3](https://www.w3.org/TR/css-counter-styles-3/) (counter-style descriptors and marker context)
