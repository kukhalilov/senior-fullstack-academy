<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Reference: Contiguous substring and interval recurrences

# Scope and version
* **Scope:** This reference lesson covers the exact inventory group `substring-and-interval-states` under the broader topic of sequence and string dynamic programming. It focuses on contiguous string segments, intervals, and palindromic recurrences as documented in canonical algorithmic references (such as the USACO Guide and Competitive Programmer's Handbook; checked 2026-11-16).
* **Version/Edition:** Timeless sequence DP framework; canonical problem pages checked 2026-11-16.
* **Citation:** [USACO Guide Intro to DP](https://usaco.guide/gold/intro-dp) and [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
* **Automatic Draft Notice:** This document is an automatically generated draft.

# How this group fits the mental model
In dynamic programming (DP), sequence problems generally fall into two broad structural categories: prefix/subsequence models and contiguous/interval models. 

While subsequences allow elements to be skipped while preserving relative order, many problems require **contiguity**—meaning selected characters must form an unbroken chunk of the original text (a *substring* or *subarray*) or satisfy symmetrical boundary conditions (*intervals*). 

The mental model for contiguous and interval states relies on:
1. **Local extension:** Building longer contiguous matches directly from adjacent shorter matches (e.g., if two characters match, extending a common substring length by 1).
2. **Range boundaries:** Defining states by a closed interval `[left, right]` rather than a single index or prefix length, allowing recurrences to evaluate smaller inner sub-intervals before outer ones.

# Supplied names explained
* `Substring contiguity condition`
  * **Purpose and Behavior:** The strict requirement that elements in a sequence must appear consecutively without any gaps to form a valid state transition. In DP recurrences, failing a contiguity check usually forces the state value to reset immediately to zero (or an invalid base case), whereas subsequences allow state values to carry forward from previous skipped elements.
* `Longest common substring`
  * **Purpose and Behavior:** A two-string DP state where `dp[i][j]` represents the length of the longest contiguous common block of characters ending exactly at string indices `i` and `j`. Unlike Longest Common Subsequence (which carries forward maximum values when characters do not match), a mismatch in Longest Common Substring immediately breaks the contiguous run, setting `dp[i][j] = 0`.
* `Longest palindromic substring`
  * **Purpose and Behavior:** A contiguous segment of a string that reads the same forwards and backwards. The DP state or expansion check verifies whether inner substring `dp[i+1][j-1]` is a palindrome *and* outer characters `s[i] == s[j]`. Because it requires contiguity, invalid interior characters invalidate the entire outer range.
* `Longest palindromic subsequence`
  * **Purpose and Behavior:** An interval DP state over range `[left, right]` that finds the longest subsequence which is a palindrome, allowing non-contiguous characters inside the interval to be skipped. If `s[left] == s[j]`, the length is `2 + dp[left+1][right-1]`; otherwise, it takes the maximum of omitting one endpoint (`max(dp[left+1][right], dp[left][right-1])`).
* `Interval DP state [left,right]`
  * **Purpose and Behavior:** A state representation defined by two indices, `left` and `right`, denoting a contiguous slice of an array or string. Evaluation typically proceeds by increasing interval lengths (from length 1 up to `n`), ensuring that all sub-intervals of smaller size are fully computed before they are needed by larger enclosing intervals.
* `Expand around center comparison`
  * **Purpose and Behavior:** An algorithmic technique often used for palindromic substring problems as an alternative to a full 2D DP table. It treats each index (and space between indices) as a potential palindrome center and expands outward while characters at `left` and `right` match, achieving $O(n^2)$ time complexity and $O(1)$ auxiliary space.
* `Palindrome endpoint match`
  * **Purpose and Behavior:** The core logical check in interval-based palindrome algorithms verifying whether the boundary characters at the current interval edges match (`s[left] == s[right]`). This boolean check determines whether interior palindrome properties can be extended outward to include the current endpoints.
* `Empty and single-character intervals`
  * **Purpose and Behavior:** The fundamental base cases for interval DP. Empty intervals (where `left > right`) typically evaluate to length 0 or logical truth, while single-character intervals (`left == right`) always form valid palindromes of length 1, providing the foundational seed values from which larger intervals grow.

# Cross-item comparison
* `Longest common substring` vs `Longest common subsequence`: Longest common substring enforces strict contiguity, resetting the DP value to zero upon any mismatch. Longest common subsequence permits gaps, carrying forward the maximum prefix score from adjacent cells when characters do not match.
* `Longest palindromic substring` vs `Longest palindromic subsequence`: The substring variant requires all intermediate characters to belong to an unbroken contiguous block that forms a palindrome. The subsequence variant allows characters inside the interval to be skipped, making its recurrence depend on adjacent sub-intervals rather than strict interior validity.
* `Interval DP state [left,right]` vs `Expand around center comparison`: Interval DP builds table states bottom-up across all possible lengths and boundaries, handling complex cost or transition rules. Expand around center is a specialized, space-efficient linear scan optimized specifically for palindromic symmetry around local pivot points.
* No other distinct cross-item comparisons apply within this specific inventory group.

# Examples
The following Python snippet demonstrates how single-character base cases and endpoint matching govern interval expansion for finding palindromic structures.

```python
def count_palindromic_substrings(s: str) -> int:
    """
    Snippet context: Computes the total number of palindromic substrings
    using an expand-around-center approach based on interval endpoints.
    """
    n = len(s)
    count = 0
    
    for center in range(2 * n - 1):
        # Left and right bounds for odd or even length centers
        left = center // 2
        right = left + center % 2
        
        # Expand around center comparison while palindrome endpoint match holds
        while left >= 0 and right < n and s[left] == s[right]:
            count += 1
            left -= 1
            right += 1
            
    return count

# Example execution check
# s = "abc" -> expected output: 3 ("a", "b", "c")
# s = "aaa" -> expected output: 6 ("a", "a", "a", "aa", "aa", "aaa")
```

# Common mistakes
* **Confusing Substring with Subsequence:** Treating contiguous segment rules interchangeably with gapped subsequence rules, which leads to incorrect state transition resets.
* **Incorrect Interval Loop Order:** Evaluating interval DP states `[left, right]` by increasing `left` and `right` independently rather than looping over increasing *interval lengths*, which causes dependent sub-problems to be uncomputed.
* **Omitting Base Cases:** Failing to properly initialize empty or single-character intervals, causing out-of-bounds errors or incorrect base evaluations.
* **Off-by-One Range Indices:** Mismanaging boundary indices when transitioning between 0-indexed strings and inclusive interval bounds `[left, right]`.

# Knowledge checks with answers
1. **Question:** Why does `Longest common substring` reset its DP value to zero upon a character mismatch, whereas `Longest common subsequence` does not?
   * **Answer:** `Longest common substring` requires strict contiguity; a mismatch breaks the unbroken sequence, invalidating the current contiguous block. A subsequence allows gaps, so a mismatch simply prompts the algorithm to carry forward the best score from previous overlapping prefixes.
2. **Question:** What is the role of single-character intervals in interval DP?
   * **Answer:** They act as the foundational base cases (length 1) from which larger intervals of length 2, 3, up to $n$ are recursively built.
3. **Question:** When should you use `Expand around center comparison` instead of a full 2D table?
   * **Answer:** It is ideal for palindromic substring checks because it operates in $O(n^2)$ time with $O(1)$ auxiliary space, avoiding the overhead of maintaining an explicit 2D table when only local symmetry checks are required.
