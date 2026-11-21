
# strings and character sequences — Reference: Text elements and Unicode units

# Scope and version
This lesson covers the fundamental units of text representation in C# and current .NET. It focuses on how strings are structured at the memory level versus how they are perceived as human-readable text. Timeless algorithmic claims and current documentation were checked on November 17, 2026.

# How this group fits the mental model
In C#, a `string` is an immutable sequence of 16-bit values. When solving string algorithms, you must distinguish between the "machine" view (how the computer stores the data) and the "human" view (what a user sees as a character). 

The mental model for string processing is:
1. **The Machine Layer:** The `char` type and `UTF-16 code unit` are the building blocks.
2. **The Unicode Layer:** `Unicode scalar values` and `code points` represent abstract characters.
3. **The User Layer:** `Grapheme clusters` represent what a user perceives as a single character (e.g., an emoji or a letter with an accent).

# Supplied names explained

* `UTF-16 code unit`: A 16-bit value used by .NET to represent text. Most common characters fit into one unit, but some require two.
* `Unicode code point`: An integer in Unicode's code space, from U+0000 through U+10FFFF. Some code points are unassigned; code points in the surrogate range aren't Unicode scalar values.
* `Unicode scalar value`: Any Unicode code point except for those reserved for surrogate pairs (the range U+D800 through U+DFFF).
* `Surrogate pair`: A sequence of two `UTF-16 code units` used to represent a single character that falls outside the Basic Multilingual Plane (such as many emojis).
* `Grapheme cluster`: A sequence of one or more Unicode scalar values that should be treated as a single user-perceived character.
* `char`: The C# primitive type representing a single `UTF-16 code unit`. A `char` can hold a surrogate half and therefore doesn't always represent a complete Unicode scalar value.
* `System.Text.Rune`: A .NET type that represents a single `Unicode scalar value`, ensuring you do not accidentally split a surrogate pair.
* `StringInfo text element`: A unit returned by `System.Globalization.StringInfo`; in .NET 5 and later, text-element enumeration follows Unicode extended-grapheme-cluster boundaries. The exact Unicode segmentation data follows the runtime's supported Unicode version.

# Cross-item comparison

When working with these units, the primary distinction is the level of abstraction:

* **`char` vs `System.Text.Rune`**: A `char` is a fixed-size 16-bit container. A `System.Text.Rune` represents one valid Unicode scalar value. Use `Rune` to iterate by scalar without splitting a valid surrogate pair; use `StringInfo` text elements when an operation must follow grapheme-cluster boundaries.
* **`UTF-16 code unit` vs `Unicode scalar value`**: A scalar value may be represented by one or two code units.
* **`Grapheme cluster` vs `Unicode scalar value`**: A single grapheme cluster may consist of multiple scalar values (e.g., a base letter plus a combining accent mark).

# Examples

```csharp
// Example: The difference between char and Rune
string emoji = "😀"; // This is a surrogate pair
Console.WriteLine(emoji.Length); // Output: 2 (two UTF-16 code units)

// Using Rune to safely iterate
foreach (var rune in emoji.EnumerateRunes())
{
    Console.WriteLine(rune.Value); // Output: 128512 (the Unicode code point)
}
```

# Common mistakes

1. **Assuming `string.Length` equals character count:** `string.Length` returns the number of `char` (UTF-16 code units). If your string contains emojis or complex scripts, the length will be higher than the number of visible characters.
2. **Indexing strings directly:** Using `str[i]` accesses one UTF-16 code unit. If that unit is part of a surrogate pair, it is only half of the pair and can't be treated as a complete scalar value; it can still be processed as a code unit when the algorithm explicitly works at that level.
3. **Ignoring normalization:** Different sequences of scalar values can represent the same visual character. Always consider if your algorithm needs to normalize text before comparison.

# Knowledge checks with answers

1. **Question:** If a string contains one emoji that is represented as a surrogate pair, what is the value of `string.Length`?
   **Answer:** 2. `string.Length` counts `UTF-16 code units`, and a surrogate pair consists of two units.

2. **Question:** Why should you use `System.Text.Rune` instead of `char` when processing text?
   **Answer:** `System.Text.Rune` represents a full `Unicode scalar value`, preventing you from accidentally splitting a `surrogate pair` into two invalid pieces.

3. **Question:** Is a `grapheme cluster` always the same as a `Unicode scalar value`?
   **Answer:** No. A `grapheme cluster` can consist of multiple scalar values (e.g., a base character plus a combining mark).

*Source: [Microsoft Learn .NET character encoding](https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction)*
