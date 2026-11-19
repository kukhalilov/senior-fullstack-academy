<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: HTMLTextAreaElement properties, validation, and selection APIs

# Scope and version

This reference covers the current HTMLTextAreaElement interface and its text-selection APIs. The content attributes, submission behavior, and shared validation rules are covered in companion references. See [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [MDN HTMLTextAreaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement), and [MDN text selection APIs](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement/setRangeText).

# How this group fits the mental model

A textarea has a default value from its text content and a live value that users/scripts can change. It is always a multiline plain-text control. Its selection offsets are measured in UTF-16 code units, like JavaScript string indices. The form owner and validation state connect it to submission, while its selection methods support editor-style interactions.

# Supplied names explained

- new HTMLTextAreaElement() — Constructs an HTML textarea; document.createElement("textarea") is commonly used for dynamic UI.
- autocomplete, cols, dirName, disabled, maxLength, minLength, name, placeholder, readOnly, required, rows, and wrap — Reflect or expose the corresponding attributes. cols/rows are presentation dimensions, not limits on content length.
- form — Read-only current form owner, or null when there is none.
- type — Read-only string whose value is textarea.
- defaultValue — Text content/default value used when the form resets. It is distinct from the live value.
- value — Current raw value. Setting it changes current text but does not change the defaultValue or fire input/change events.
- textLength — Current value length in UTF-16 code units.
- willValidate, validity, and validationMessage — Current validation candidacy and ValidityState/message.
- checkValidity(), reportValidity(), and setCustomValidity(message) — Check native constraints, request browser feedback, and set/clear a custom error. Readonly or disabled textarea controls are barred from constraint validation.
- labels — Read-only NodeList of associated label elements.

# Selection APIs

- select() — Selects all text in the control. It does not submit or copy the text.
- selectionStart and selectionEnd — Get/set the start and end offsets in UTF-16 code units. They are supported for textarea. Setting a start past the end moves the end to the same value; a start greater than the end collapses the selection at the new start.
- selectionDirection — Direction of the current selection, commonly forward, backward, or none. The exact user gesture and platform behavior can affect it.
- setSelectionRange(start, end, direction?) — Updates the selection endpoints and optional direction. The visible highlight is apparent when the textarea is focused.
- setRangeText(replacement, start?, end?, selectionMode?) — Replaces the selected or specified range. The mode determines the post-replacement selection: select highlights replacement text, start/end collapse before/after it, and preserve adjusts the previous selection relative to the edit. The one-argument form replaces the current selection.

# Examples

    const note = document.querySelector("#note")
    const start = note.selectionStart
    const end = note.selectionEnd
    note.setRangeText("important", start, end, "select")

This replaces the selected text and selects the replacement. Programmatic value/selection changes should not be mistaken for user input events; dispatching synthetic events is a separate application decision.

# Common mistakes

- The textarea's initial value is text content, not a value attribute.
- The live value and defaultValue serve different purposes, especially on reset.
- Length constraints are measured in UTF-16 code units and browser validation does not replace server checks.
- Selection offsets are not grapheme-cluster counts; an emoji can occupy multiple UTF-16 code units.
- Setting value does not automatically fire input or change.
- Selection is meaningful for user editing; selection methods do not provide an accessible editing interface by themselves.

# Cross-item comparison

defaultValue is the markup/reset baseline; value and textLength describe current text. cols and rows affect display dimensions, while maxLength/minLength constrain editable value length. Selection methods address portions of the current value and do not set the form submission name or replace validation.

# Knowledge checks with answers

1. Where does a textarea's default value come from? **Its text content, exposed as defaultValue.**
2. Does assigning value change defaultValue? **No.**
3. What unit do selectionStart and textLength use? **UTF-16 code units.**
4. What does setRangeText(text) replace? **The current selection.**
5. Which setRangeText mode selects the inserted text? **select.**

Inventory names covered: HTMLTextAreaElement() constructor; HTMLTextAreaElement.autocomplete; HTMLTextAreaElement.cols; HTMLTextAreaElement.dirName; HTMLTextAreaElement.disabled; HTMLTextAreaElement.form; HTMLTextAreaElement.maxLength; HTMLTextAreaElement.minLength; HTMLTextAreaElement.name; HTMLTextAreaElement.placeholder; HTMLTextAreaElement.readOnly; HTMLTextAreaElement.required; HTMLTextAreaElement.rows; HTMLTextAreaElement.wrap; HTMLTextAreaElement.type; HTMLTextAreaElement.defaultValue; HTMLTextAreaElement.value; HTMLTextAreaElement.textLength; HTMLTextAreaElement.willValidate; HTMLTextAreaElement.validity; HTMLTextAreaElement.validationMessage; HTMLTextAreaElement.checkValidity(); HTMLTextAreaElement.reportValidity(); HTMLTextAreaElement.setCustomValidity(); HTMLTextAreaElement.labels; HTMLTextAreaElement.select(); HTMLTextAreaElement.selectionStart; HTMLTextAreaElement.selectionEnd; HTMLTextAreaElement.selectionDirection; HTMLTextAreaElement.setRangeText(); HTMLTextAreaElement.setSelectionRange(); SelectionMode=select; SelectionMode=start; SelectionMode=end; SelectionMode=preserve.

Sources: [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [MDN HTMLTextAreaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement), [MDN setRangeText](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement/setRangeText), [MDN setSelectionRange](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement/setSelectionRange).
