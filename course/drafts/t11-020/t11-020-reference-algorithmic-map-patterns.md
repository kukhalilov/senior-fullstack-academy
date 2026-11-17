<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# hash maps and frequency tables — Reference: Map patterns in algorithm problems

*This is an automatically generated draft.*

# Scope and version
This lesson covers common algorithmic patterns using hash maps, with examples using the current .NET `Dictionary<TKey, TValue>` API documentation checked 2026-11-17. It focuses on how to structure data to solve problems efficiently; expected-time bounds depend on hashing and equality assumptions.

# How this group fits the mental model
A hash map is a data structure that associates keys with values under an equality rule. In algorithm design, maps can transform repeated searches into single-pass expected-time lookups. By storing intermediate results, you trade memory for speed; some problems can drop from quadratic ($O(n^2)$) to expected linear ($O(n)$), subject to hashing and equality cost assumptions.

# Supplied names explained
* `Frequency map`: A dictionary where the key is an item from a collection and the value is the count of its occurrences. It is used to tally data in one pass.
* `Complement lookup`: A pattern where you store "seen" items in a map to check if a required counterpart (the complement) already exists, often used to find pairs that sum to a specific target.
* `Index map`: A dictionary that stores the index of an item's last or first appearance. This allows you to calculate distances or track the most recent occurrence of an element.
* `Grouping by canonical key`: A pattern where you use a transformation function to create a "canonical" (standardized) key, then map that key to a list of all items that share it (e.g., grouping anagrams by their sorted character string).
* `Prefix-sum frequency map`: A technique used to count subarrays that sum to a specific value by storing the frequency of cumulative sums encountered so far.
* `Memoization table`: A map used to store results for selected function inputs so repeated subproblems can reuse a completed result. The cache key must capture all inputs that affect the result, and cache policy/eviction may limit reuse.

# Cross-item comparison
These patterns are variations of the same underlying hash map structure, distinguished by what they store as the value:
* **Frequency map** and **Prefix-sum frequency map** store integers (counts).
* **Index map** stores integers (positions).
* **Grouping by canonical key** stores collections (lists or arrays).
* **Complement lookup** and **Memoization table** store arbitrary data (booleans, indices, or computed results).

# Examples
**Frequency map example:**
To count how many times each word appears in a list:
```csharp
var counts = new Dictionary<string, int>();
foreach (var word in words) {
    if (counts.ContainsKey(word)) counts[word]++;
    else counts[word] = 1;
}
```

**Complement lookup example:**
To find if two numbers in an array sum to `target`:
```csharp
var seen = new HashSet<int>(); // Or Dictionary for index tracking
foreach (var num in nums) {
    int complement = target - num;
    if (seen.Contains(complement)) return true;
    seen.Add(num);
}
```

# Common mistakes
* **Mutable keys:** Changing fields used by equality or hashing while the object is stored can make lookup or removal fail. Keep key identity stable.
* **Ignoring collisions:** Assuming that because a hash map is fast, it is always $O(1)$. Some designs may require work proportional to $n$ under adverse collisions; implementation behavior varies.
* **Over-allocation:** Creating a massive map when the input size is small or when a simpler array would suffice.

# Knowledge checks with answers
1. **Question:** Which pattern would you use to group all words that are anagrams of each other?
   **Answer:** Grouping by canonical key (e.g., sort the letters of each word to use as the key).
2. **Question:** Why does a `Memoization table` improve performance?
   **Answer:** It can avoid recomputing a completed subproblem when the same complete cache key is requested again. A hash-map retrieval is expected constant time only under the usual hashing, equality, and distribution assumptions.
3. **Question:** What happens if you modify a key object after adding it to a `Dictionary`?
   **Answer:** If the mutation changes equality-relevant or hashed state, lookup/removal may fail because the map searches using the changed state. The stored entry is not necessarily permanently unreachable and this is not inherently a memory leak.

*Sources:*
[OpenDSA Hashing](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/HashIntro.html)
[Microsoft Dictionary Reference](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2)
[USACO Guide Map/Set](https://usaco.guide/bronze/intro-sets)
