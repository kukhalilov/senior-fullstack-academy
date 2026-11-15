<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# strings and character sequences — Big-picture orientation and mental model

*Automatically generated draft.*

# Problem and purpose
Strings are the primary way we represent text in software, but they are deceptively complex. A string is not just a "word"; it is an ordered sequence of data. The core problem in string algorithms is defining what an "element" of that sequence actually is. If you treat a string as a simple list of characters, you may break text that uses complex symbols (like emojis or non-Latin scripts). String algorithms exist to efficiently search, compare, and transform these sequences while respecting the rules of character encoding and human language.

# Plain-language mental model
Imagine a string as a train. 
*   **The cars (UTF-16 code units):** In C#, the train is built of fixed-size cars. Every car is a `char`.
*   **The passengers (Unicode scalar values):** Sometimes, one passenger fits in one car. Sometimes, a passenger is too large and needs two cars (a "surrogate pair").
*   **The groups (Grapheme clusters):** A "user-perceived character" might be a single passenger, or it might be a group of passengers holding hands (like a base letter plus an accent mark).

When you write an algorithm, choose the unit it needs: code units for UTF-16-level work, scalar values for Unicode-scalar processing, or grapheme text elements for user-perceived characters. These units answer different questions; none is universally correct for every text task.

# How the parts fit together
String algorithms rely on three layers of logic:
1.  **Encoding Layer:** Understanding how data is stored (UTF-16) versus how it is perceived (Grapheme clusters).
2.  **Relationship Layer:** Defining how parts of a string relate to the whole (e.g., is "cat" a *substring* of "caterpillar"? Yes. Is "cpr" a *subsequence*? Yes, because the letters appear in order, even if not adjacent).
3.  **Matching Layer:** The logic used to find patterns. This ranges from simple *naive matching* (checking every position) to advanced techniques like the *Knuth-Morris-Pratt* algorithm, which uses a *prefix function* to skip unnecessary checks.

# Concept map
*   **Data Representation:** `char` (UTF-16) vs. `System.Text.Rune` (Unicode scalar value).
*   **Structural Relationships:** Prefix, Suffix, Substring, Subsequence, Palindrome, Anagram.
*   **Comparison Logic:** Ordinal (binary value) vs. Culture-sensitive (language rules).
*   **Search Algorithms:** Naive, KMP (Prefix function), Z-function, Rabin-Karp (Rolling hash).
*   **Performance Constraints:** Immutability (strings cannot be changed, only copied) and allocation costs.

# End-to-end walkthrough
Consider searching for the pattern "ABA" in the text "ABABA".

1.  **Naive approach:** Check index 0 ("ABA" matches). Move to index 1 ("BAB" no). Move to index 2 ("ABA" matches). This is simple but slow for long texts.
2.  **Optimization:** We notice that the end of the first "ABA" overlaps with the start of the next. 
3.  **Advanced approach:** Using a **Prefix function**, we pre-calculate the "overlap" information. When the algorithm finds a mismatch, it uses this pre-calculated table to "jump" ahead instead of restarting from the next character.
4.  **Result:** We find all occurrences in linear time, avoiding redundant work.

# When to use it and tradeoffs
*   **Use Ordinal comparison** for internal identifiers or protocol data where language rules don't apply; path comparison should follow the target platform's path rules.
*   **Use Culture-sensitive comparison** for user-facing text (e.g., sorting names in a list).
*   **Tradeoff:** String immutability in C# means every modification (like `+` concatenation) creates a new string in memory. For heavy manipulation, use `StringBuilder` or span-based techniques to avoid excessive allocations.
*   **Risk:** When using *Polynomial rolling hash* for matching, account for *hash collisions*—where different strings produce the same hash—and verify candidate matches when correctness requires exact equality.

# What later lessons cover
*   Deep dives into `System.Text.Rune` for Unicode-aware iteration.
*   Implementation details of the *Knuth-Morris-Pratt* and *Z-function* algorithms.
*   Strategies for minimizing *substring allocation* in high-performance scenarios.
*   Applying *normalization* when the application's equality policy requires canonically equivalent sequences to compare alike; string comparison does not normalize automatically.

*Source: [Microsoft Learn .NET character encoding](https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction), [C# Strings](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/strings/), [CP-Algorithms](https://cp-algorithms.com/string/prefix-function.html).*
