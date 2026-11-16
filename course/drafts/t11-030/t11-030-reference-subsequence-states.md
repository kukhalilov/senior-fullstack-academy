<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Reference: Subsequence and alignment states

# Scope and version

* Automatically generated draft.
* **Scope:** This reference lesson covers the exact inventory group `subsequence-states` ("Subsequence and alignment states") for sequence and string dynamic programming. It details prefix states, alignment transitions, and optimization structures for longest increasing subsequences, longest common subsequences, and edit distances.
* **Version/Edition:** Timeless sequence DP; canonical problem pages checked 2026-11-16 (source: [USACO Guide DP introduction and Competitive Programmer's Handbook](https://usaco.guide/gold/intro-dp)).

# How this group fits the mental model

Sequence and string dynamic programming solves problems where inputs consist of ordered elements (characters in strings or numbers in arrays) and decisions involve matching, skipping, inserting, deleting, or extending elements. 

To build a reliable mental model, imagine walking through one or two sequences using index pointers:
1. **Prefix and Endpoint States:** Instead of trying every possible sequence combination directly, we define sub-problems over prefixes (e.g., considering only the first $i$ characters of string $A$ and the first $j$ of string $B$) or endpoints (e.g., the longest increasing subsequence ending strictly at index $i$).
2. **Transitions:** At each state, we evaluate allowed operations—such as matching characters if they are identical, or skipping an element in one sequence to find a better alignment elsewhere.
3. **Optimizations:** When full tables require too much memory or time, specialized structures (like tail-tracking arrays for increasing subsequences or rolling-row buffers for two-string grids) compress the representation without losing correctness.

The items in the `subsequence-states` inventory represent the exact components used to build these recurrence relations and state machines.

# Supplied names explained

* `Longest increasing subsequence endpoint state`
  * **Purpose and behavior:** Represents the sub-problem of finding the length (or properties) of the longest strictly increasing subsequence that *must end at* a specific index $i$ in the input array. It assumes all elements prior to $i$ have already been evaluated, allowing transitions from any valid previous index $j < i$ where the element at $j$ is smaller than the element at $i$.

* `LIS O(n²) recurrence`
  * **Purpose and behavior:** The foundational quadratic-time transition rule for the longest increasing subsequence. For every index $i$ from $0$ to $n-1$, it inspects all previous indices $j$ ($0 \le j < i$) and updates the state: $\text{dp}[i] = \max(1, \max_{j: \text{arr}[j] < \text{arr}[i]} (\text{dp}[j] + 1))$. It is simple and supports path reconstruction easily, but becomes slow for large $n$.

* `LIS tails array optimization`
  * **Purpose and behavior:** An advanced $O(n \log n)$ approach that maintains an auxiliary array (often called `tails`). The element $\text{tails}[k]$ stores the smallest tail value among all increasing subsequences of length $k+1$ found so far. Using binary search (`std::lower_bound` or equivalent), each new array element updates the tails array in logarithmic time, dramatically improving performance for large inputs.

* `Longest common subsequence two-prefix state`
  * **Purpose and behavior:** A two-dimensional state $\text{dp}[i][j]$ representing the length of the longest common subsequence between prefix $A[0 \dots i-1]$ and prefix $B[0 \dots j-1]$. It serves as the core alignment state for comparing two sequences where relative order matters, but gaps are permitted.

* `Match-character transition`
  * **Purpose and behavior:** A recurrence branch used when the current characters or elements in both sequences match ($A[i-1] == B[j-1]$). It extends the optimal subsequence from the diagonally previous state: $\text{dp}[i][j] = \text{dp}[i-1][j-1] + 1$.

* `Skip-left transition`
  * **Purpose and behavior:** A recurrence branch used when evaluating two-sequence alignment where we ignore or skip the current element of the first sequence. It transitions from the state directly above: $\text{dp}[i][j] = \text{dp}[i-1][j]$.

* `Skip-right transition`
  * **Purpose and behavior:** A recurrence branch used in two-sequence alignment where we ignore or skip the current element of the second sequence. It transitions from the state directly to the left: $\text{dp}[i][j] = \text{dp}[i][j-1]$.

* `Subsequence reconstruction`
  * **Purpose and behavior:** The process of backtracking through computed DP table values or decision markers after the table is filled. By inspecting which transition (match, skip-left, or skip-right) produced the value at $\text{dp}[i][j]$, an algorithm can reconstruct and output the actual sequence of characters belonging to the optimal subsequence.

* `Edit distance prefix-pair state`
  * **Purpose and behavior:** A state $\text{dp}[i][j]$ representing the minimum number of operations (insertions, deletions, substitutions) required to transform prefix $A[0 \dots i-1]$ into prefix $B[0 \dots j-1]$. Base cases initialize conversions from or to an empty string (e.g., transforming a prefix of length $i$ to an empty string takes $i$ deletions).

* `Insert/delete/replace transitions`
  * **Purpose and behavior:** The three core operation choices in edit distance and string alignment recurrences. An insertion adds a character from string $B$, a deletion removes a character from string $A$, and a replacement substitutes one character for another. The transition takes the minimum cost among these choices plus the appropriate operation cost, linking $\text{dp}[i][j]$ to $\text{dp}[i][j-1]$, $\text{dp}[i-1][j]$, and $\text{dp}[i-1][j-1]$.

# Cross-item comparison

* `Longest increasing subsequence endpoint state` vs `LIS tails array optimization`: The endpoint state approach computes full subsequence lengths for every index in $O(n^2)$ time, making it easy to store predecessor pointers for reconstruction. The tails array optimization discards full history to maintain only the minimal tail values for each subsequence length, reducing time complexity to $O(n \log n)$ at the cost of requiring auxiliary tracking to recover the actual subsequence elements.
* `Match-character transition` vs `Skip-left transition` vs `Skip-right transition`: Match-character consumes an identical element from both sequences and increments the common length. Skip-left and skip-right advance through only one sequence at a time, exploring paths where elements do not align in order to find a globally optimal subsequence or alignment.
* `Subsequence reconstruction` vs standard forward DP evaluation: Forward DP evaluation computes numerical values (lengths or costs) bottom-up or top-down, whereas subsequence reconstruction works backward from the final state to trace out the exact sequence of elements or operations that achieved the optimal score.

# Examples

Here is a small, end-to-end Python snippet demonstrating how a two-prefix state and match/skip transitions evaluate the longest common subsequence length for two strings.

```python
def longest_common_subsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    # dp[i][j] represents LCS of text1[0..i-1] and text2[0..j-1]
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                # Match-character transition
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                # Skip-left or skip-right transition (taking the maximum)
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]

# Example execution check:
# text1 = "abcde", text2 = "ace"
# Expected output: 3
print(longest_common_subsequence("abcde", "ace"))
```

Expected output:
```text
3
```

# Common mistakes

* **Off-by-one prefix indexing:** Forgetting to allocate grid sizes of `(m + 1) x (n + 1)` when working with prefix states, which leads to index out-of-range errors or incorrect base-case handling.
* **Confusing subsequences with substrings:** Attempting to use subsequence transition logic (which allows skipping elements) when a problem strictly requires contiguous substrings.
* **Omitting empty-prefix base cases:** Failing to properly initialize row $0$ and column $0$ in edit distance or LCS tables, causing incorrect calculations for transformations involving empty strings.
* **Losing track of reconstruction data:** Attempting to reconstruct a subsequence from a space-optimized 1D rolling array without storing previous decision choices.

# Knowledge checks with answers

1. **Question:** What is the primary difference in time complexity between the `LIS O(n²) recurrence` and the `LIS tails array optimization`?
   * **Answer:** The endpoint recurrence evaluates all pairs of indices, resulting in $O(n^2)$ time. The tails array optimization maintains minimum tail values using binary search, reducing the time complexity to $O(n \log n)$.
2. **Question:** In longest common subsequence, what action does the `Match-character transition` perform on the prefix indices and the DP table value?
   * **Answer:** When characters match, it decreases both prefix indices by $1$ (moving diagonally to `dp[i-1][j-1]`) and adds $1$ to that previous sub-problem value.
3. **Question:** Why might `Subsequence reconstruction` fail or require extra bookkeeping if space compression is applied?
   * **Answer:** Space compression often discards older rows or states to save memory. Without storing explicit parent pointers or choice matrices during the forward pass, historical choices needed to trace back the exact sequence are lost.
