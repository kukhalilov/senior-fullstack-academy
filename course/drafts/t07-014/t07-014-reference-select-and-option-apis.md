<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# HTML forms controls validation and form submission — Reference: Select, option, and options collection APIs

# Scope and version

This covers the current HTMLSelectElement, HTMLOptionsCollection, and HTMLOptionElement interfaces, including the Option() factory constructor. Attribute syntax and native constraint-validation rules have separate references. See [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [MDN HTMLSelectElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement), [HTMLOptionsCollection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionsCollection), and [HTMLOptionElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement).

# How this group fits the mental model

The select owns a live list of options. Each option has default selectedness from markup and current selectedness at runtime. A single-select normally has one selected option; a multiple select can have several. The select value is one string (the first selected option value or the empty string), so use selectedOptions when every chosen item matters.

# Supplied names explained

- new HTMLSelectElement() — HTML element constructor; document.createElement("select") is usually clearer in ordinary code.
- autocomplete, disabled, multiple, name, required, and size — IDL properties reflect the corresponding select attributes. form is a read-only reference to the current form owner.
- type — Read-only control type: select-one or select-multiple according to the multiple state.
- options — A same-object, live HTMLOptionsCollection containing the select options, including those nested in groups.
- length — Number of options; setting it changes the collection by removing options or adding empty options to reach that length.
- item(index) and namedItem(name) — Retrieve an option by position or by its id/name; a missing lookup returns null.
- add(element, before?) — Inserts an option or optgroup before a given option/index/reference, or at the end. Invalid insertion references throw; arbitrary non-option elements are not accepted.
- remove(index?) — With an index, removes that option when present; with no argument, the inherited ChildNode.remove() overload removes the select element itself. Use select.remove(index) to remove an option.
- Indexed setter — select[index] = option replaces an option at an index; setting null removes it. This mutates the collection, not selection.
- selectedOptions — Live HTMLCollection of currently selected options. Iterate it or copy it with Array.from() for a stable snapshot.
- selectedIndex — Index of the first selected option, or -1 when none is selected. Setting it changes selection and can deselect others in a single select.
- value — Value of the first selected option, or empty string if none is selected. Setting it selects the first option with that value and clears other selection as needed; duplicate option values make that first match the one selected.
- willValidate, validity, and validationMessage — Expose validation candidacy and current validity; required uses select-specific missing-value rules, including the placeholder-label option case.
- checkValidity(), reportValidity(), and setCustomValidity(message) — Native constraint-validation methods. An empty custom message clears a custom error.
- showPicker() — Requests the select picker UI. It can throw when the control is not mutable, required user activation is missing, or context/security rules prohibit the picker; support and UI vary.
- labels — Read-only collection of labels associated with the select.

# HTMLOptionsCollection API

It extends HTMLCollection, so it supports live indexed lookup and inherited item()/namedItem() access. Its length is settable, and selectedIndex reads or changes the owning select's first selected option index. Collection names/IDs are convenience lookups, not stable unique keys. The select.options collection is the primary instance; select methods provide the same option addition/removal operations.

# HTMLOptionElement API

- new Option(text?, value?, defaultSelected?, selected?) — Creates an option. defaultSelected controls default/reset selectedness; selected controls current selectedness. If value is omitted, the option's text-derived value is used.
- HTMLOptionElement() — The interface constructor is exposed by HTML constructor machinery, but Option() is purpose-built to initialize its text, value, and selection flags.
- disabled reflects the option attribute and disabled optgroup context. Programmatic selection changes remain possible even for disabled options.
- form is a read-only reference to the owning select's form, or null without one.
- label gives the option label: a nonempty label attribute is used; otherwise text content supplies it.
- defaultSelected reflects the selected content attribute; selected is live selectedness. User changes do not necessarily rewrite the attribute.
- value reads the explicit value attribute, or falls back to option text when absent. This is what contributes to select form data.
- text gets/sets option text; index is its current index in the owning select or -1 if it is not in one.

# Examples

    const select = document.querySelector("#topics")
    select.add(new Option("Distributed systems", "distributed", false, true))
    const values = Array.from(select.selectedOptions, option => option.value)
    const firstValue = select.value

For a multi-select, repeated form entries are created for selected options. select.value does not return the full set; use selectedOptions or FormData.getAll(name).

# Common mistakes

- Using select.value as if it returned every selected value.
- Assuming an option selected attribute always equals current selectedness.
- Treating selectedIndex as a stable option identifier after collection mutations.
- Forgetting that options and selectedOptions are live collections.
- Treating disabled options as impossible to alter programmatically.
- Calling showPicker() without handling activation/security errors.

# Cross-item comparison

HTMLSelectElement.value represents only the first chosen option, while selectedOptions represents the full current selection. The live options collection represents all available options, not just selected ones. HTMLOptionElement.selected is current state; defaultSelected is the reset baseline.

# Knowledge checks with answers

1. What does select.value return for a multi-select? **Only the first selected option value, or the empty string.**
2. Which API gives all selected options? **selectedOptions.**
3. What is the difference between defaultSelected and selected? **Default/reset state versus current live state.**
4. How do you read repeated multi-select values from submission data? **FormData.getAll(name).**
5. What does setting select.options.length = 0 do? **Removes all options from the live options collection.**

Inventory names covered: HTMLSelectElement() constructor; HTMLSelectElement.autocomplete; HTMLSelectElement.disabled; HTMLSelectElement.form; HTMLSelectElement.multiple; HTMLSelectElement.name; HTMLSelectElement.required; HTMLSelectElement.size; HTMLSelectElement.type; HTMLSelectElement.options; HTMLSelectElement.length; HTMLSelectElement.item(); HTMLSelectElement.namedItem(); HTMLSelectElement.add(); HTMLSelectElement.remove(); HTMLSelectElement indexed setter; HTMLSelectElement.selectedOptions; HTMLSelectElement.selectedIndex; HTMLSelectElement.value; HTMLSelectElement.willValidate; HTMLSelectElement.validity; HTMLSelectElement.validationMessage; HTMLSelectElement.checkValidity(); HTMLSelectElement.reportValidity(); HTMLSelectElement.setCustomValidity(); HTMLSelectElement.showPicker(); HTMLSelectElement.labels; HTMLOptionsCollection; HTMLOptionsCollection.item(); HTMLOptionsCollection.namedItem(); HTMLOptionsCollection.length setter; HTMLOptionsCollection.selectedIndex setter; HTMLOptionElement() constructor; Option() constructor; HTMLOptionElement.disabled; HTMLOptionElement.form; HTMLOptionElement.label; HTMLOptionElement.defaultSelected; HTMLOptionElement.selected; HTMLOptionElement.value; HTMLOptionElement.text; HTMLOptionElement.index.

Sources: [WHATWG form elements](https://html.spec.whatwg.org/multipage/form-elements.html), [MDN HTMLSelectElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement), [MDN HTMLOptionsCollection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionsCollection), [MDN HTMLOptionElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement).
