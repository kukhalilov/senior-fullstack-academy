<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Reference: Rolling arrays, reconstruction, and validation

# Scope and version
* Automatically generated draft.
* **Scope:** This reference lesson covers the exact items in the `complexity-and-reconstruction` inventory group for sequence and string dynamic programming (DP). It details rolling arrays, optimization strategies, reconstruction techniques, and validation approaches.
* **Version/Edition:** Timeless sequence DP principles based on canonical problem pages checked on 2026-11-16 (sources include USACO Guide and Competitive Programmer's Handbook).

# How this group fits the mental model
When solving sequence and string problems using dynamic programming, finding the optimal numerical value (such as length or cost) is only the first step. Often, algorithms must also optimize memory or recover the actual elements that formed the solution. 

The mental model for sequence DP maps string or array indices to matrix states or rolling vectors. Once the values fill these spaces, memory can be compressed if we only need adjacent rows, but reconstruction requires either storing decision paths or recomputing predecessor states. The items in this group represent the operational tools used to manage time complexity, space complexity, traceback, and validation when working with sequences.

# Supplied names explained

* `O(nm) two-sequence DP`
  * **Purpose and behavior:** Represents the standard time and space complexity for dynamic programming algorithms that compare two sequences of lengths $n$ and $m$ (such as in Longest Common Subsequence or Edit Distance). It evaluates a two-dimensional grid of states where each cell depends on adjacent prefix states, requiring $O(nm)$ operations and $O(nm)$ memory in its unoptimized form.

* `Rolling two-row optimization`
  * **Purpose and behavior:** A space-compression technique for two-sequence DP where the transition for the current row depends only on the current row and the immediately preceding row. By keeping just two rows (or vectors of size $\min(n, m)$) in memory instead of the full $n \times m$ matrix, space complexity drops from $O(nm)$ to $O(\min(n, m))$, though full reconstruction becomes harder without extra information.

* `LIS O(n log n) tails method`
  * **Purpose and behavior:** An optimized approach for the Longest Increasing Subsequence problem that improves upon the naive $O(n^2)$ endpoint DP. It maintains an array where the element at index $i$ stores the smallest ending tail of all increasing subsequences of length $i+1$. By using binary search (such as `std::lower_bound`) to place each incoming element, it achieves an optimal $O(n \log n)$ time complexity.

* `Reconstruct one optimal alignment`
  * **Purpose and behavior:** The process of tracing back through a completed DP table or decision structure to generate a single concrete sequence of operations or matching characters (such as alignment in sequence alignment problems) that achieves the optimal score.

* `Backtrack choice table`
  * **Purpose and behavior:** An auxiliary data structure or recorded matrix of directional pointers (e.g., up, left, diagonal) filled during the forward DP pass. It explicitly records which state transition led to the optimal value at each cell, making reconstruction straightforward without requiring numeric recomputation.

* `Prefix-index conversion`
  * **Purpose and behavior:** The meticulous translation between 0-indexed string characters and 1-indexed DP prefix sizes (where index $i$ represents a prefix of length $i$). Proper conversion prevents off-by-one errors during base-case initialization and boundary transitions.

* `Substring versus subsequence counterexample`
  * **Purpose and behavior:** A targeted test case or validation check used to prove whether an algorithm correctly distinguishes between contiguous segments (substrings/subarrays) and non-contiguous selections (subsequences), preventing faulty recurrence implementations.

* `Brute-force comparison for short strings`
  * **Purpose and behavior:** A validation technique that evaluates small inputs using exponential exhaustive search to verify that the optimized dynamic programming implementation produces identical results, serving as a sanity check against subtle boundary bugs.

# Cross-item comparison
* `O(nm) two-sequence DP` vs `Rolling two-row optimization`: The former retains the complete history of all prefix states, which enables straightforward backtracking and reconstruction of the optimal solution. The latter compresses the space requirement by discarding older rows, saving memory at the cost of losing direct access to historical path choices unless alternate tracking strategies are employed.
* `Reconstruct one optimal alignment` vs `Backtrack choice table`: Reconstruction is the high-level goal (retrieving the final sequence), whereas the backtrack choice table is the mechanism used to achieve it efficiently by storing directional decisions during the DP evaluation.
* No other within-group comparisons are necessary for the remaining items as they serve distinct roles in validation and complexity scaling.

# Examples
The following Python snippet demonstrates how prefix-index conversion, space management, and choice tracking integrate into a standard two-sequence DP framework (such as finding the Longest Common Subsequence length and reconstructing it).

```python
def lcs_with_reconstruction(text1: str, text2: str):
    n, m = len(text1), len(text2)
    # DP table with dimensions (n + 1) x (m + 1) for prefix-index conversion
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    
    # Fill the DP table
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                
    # Reconstruct one optimal alignment / subsequence from the table
    i, j = n, m
    lcs_chars = []
    while i > 0 and j > 0:
        if text1[i - 1] == text2[j - 1]:
            lcs_chars.append(text1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
            
    return dp[n][m], "".join(reversed(lcs_chars))

# Example usage:
# length, sequence = lcs_print("abcde", "ace")
# Expected length: 3, Expected sequence: "ace"
```

*Note: The code above is a complete snippet that illustrates prefix-index conversion and traceback logic using standard sequence DP constructs.*

# Common mistakes
* **Off-by-one prefix indexing:** Forgetting that a DP table of size $(n+1) \times (m+1)$ is required to represent prefixes from length $0$ to $n$, leading to index out-of-bounds errors or missed base cases.
* **Discarding rows prematurely during space optimization:** Using `Rolling two-row optimization` while attempting to perform full traceback reconstruction without storing an explicit choice table or recomputing predecessor states.
* **Confusing substrings with subsequences:** Applying contiguous substring logic (where a mismatch resets the streak to zero) to problems that require non-contiguous subsequence choices (where a mismatch carries forward the best previous prefix state).
* **Omitting empty-prefix base cases:** Failing to properly initialize row $0$ and column $0$ in two-sequence DP, which leaves uninitialized memory or incorrect default values for comparisons against empty strings.

# Knowledge checks with answers
1. **Question:** Why does space compression using rolling rows complicate the reconstruction of an optimal sequence?
   * **Answer:** Rolling rows discard older state rows to save memory (reducing space from $O(nm)$ to $O(m)$), which destroys the historical path data needed to trace backward from the final cell unless a separate choice table or checkpoint strategy is maintained.
2. **Question:** What is the primary difference in state definition and complexity between standard quadratic LIS and the tails method?
   * **Answer:** Standard LIS uses an $O(n^2)$ endpoint DP checking all previous ending positions, whereas the tails method maintains minimum tail values for increasing subsequences of each length and uses binary search to achieve $O(n \log n)$ time.
3. **Question:** How do prefix-indices relate string lengths to table dimensions in a two-sequence DP?
   * **Answer:** A string of length $n$ requires $n + 1$ table indices (from $0$ to $n$) to explicitly represent every valid prefix length, including the empty prefix of length $0$.

Sources: [Topic reference](https://usaco.guide/gold/intro-dp)
