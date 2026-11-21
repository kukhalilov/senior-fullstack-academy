
# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Core concepts and how they fit together

# Learning objectives
* Define and apply cost models to evaluate algorithm efficiency.
* Distinguish between different analysis cases (best, worst, average, amortized).
* Use asymptotic notation to describe the growth of resource requirements.
* Translate recursive algorithms into recurrence relations and solve them using standard methods.

# Prerequisites
* Basic familiarity with algebraic functions (logarithms, exponents, polynomials).
* Understanding of basic programming control structures (loops, recursion).
* Ability to interpret mathematical inequalities.

# Core concepts
Algorithm analysis provides a way to predict how an algorithm will behave as the input size grows. Instead of measuring exact time in seconds, we use a **cost model** to count operations or memory usage.

1.  **Cost measures and analysis cases**: We define `Input size` (e.g., number of elements) and a resource measure like `Running time` or `Auxiliary space`. We analyze these based on `Best-case cost`, `Average-case cost`, or `Worst-case cost`. Sometimes, a single operation is expensive, but the average over a sequence is low; this is `Amortized cost`.
2.  **Asymptotic growth rate**: We focus on how the cost changes as input size approaches infinity, ignoring constant factors.
3.  **Asymptotic bound notations**: These provide a formal language to describe growth: `Big O notation` (upper bound), `Big Omega notation` (lower bound), `Big Theta notation` (tight bound), `Little o notation` (strict upper bound), and `Little omega notation` (strict lower bound).
4.  **Recurrences and standard solution methods**: Recursive algorithms are defined by a `Recurrence relation` and a `Base case`. We solve these using the `Substitution method`, `Iteration method`, `Recursion tree method`, or the `Master method` (based on the `Master theorem`).
5.  **Amortized analysis methods**: To analyze sequences of operations, we use the `Aggregate method`, `Accounting method`, or `Potential method`.

# Mechanisms and relationships
The analysis process follows a map:
1.  **Model**: Choose your `Input size` and resource (e.g., `Running time`).
2.  **Bound**: Use `Asymptotic bound notations` to simplify the expression, focusing on the `Asymptotic growth rate` (e.g., `Linear growth` vs `Exponential growth`).
3.  **Solve**: If the algorithm is recursive, write a `Recurrence relation`. Use the `Recursion tree method` to visualize the work, then verify with the `Master theorem` or `Substitution method`.
4.  **Aggregate**: If the algorithm has varying costs per operation, use `Amortized analysis methods` to find the average cost per operation over a sequence.

Source: [OpenDSA Asymptotic Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)

# Worked examples
**Example: Analyzing a simple recursive function**
Consider a function that splits an array in half and processes both sides: $T(n) = 2T(n/2) + n$.

1.  **Identify the recurrence**: $T(n) = 2T(n/2) + n$ with `Base case` $T(1) = c$.
2.  **Use the Recursion tree method**:
    *   Level 0: $n$
    *   Level 1: $n/2 + n/2 = n$
    *   Level 2: $n/4 + n/4 + n/4 + n/4 = n$
    *   Total depth is $\log n$.
3.  **Sum the work**: Since there are $\log n$ levels and each level does $n$ work, the total time is $n \log n$.
4.  **Conclusion**: The `Asymptotic growth rate` is `Linearithmic growth`.

# Misconceptions and edge cases
*   **Misconception**: `Big O notation` is always the worst-case. 
    *   *Correction*: Big O is just an upper bound. It can describe the worst-case, but it is often used to describe the best-case or average-case as well.
*   **Misconception**: Constants don't matter.
    *   *Correction*: Constants matter in practice, but in asymptotic analysis, we ignore them to focus on how the algorithm scales with large inputs.
*   **Edge Case**: `Amortized cost` is not the same as `Average-case cost`. Average-case assumes a distribution of inputs; amortized cost is a guarantee over a sequence of operations regardless of input distribution.

# Knowledge checks with answers
1.  **Question**: If an algorithm has a `Worst-case cost` of $O(n^2)$, can it also have a `Best-case cost` of $\Omega(n)$?
    *   **Answer**: Yes. Big O describes the upper bound, and Big Omega describes the lower bound. They can describe different scenarios.
2.  **Question**: Which method is best for solving $T(n) = 2T(n/2) + n$?
    *   **Answer**: The `Master theorem` is specifically designed for recurrences of the form $T(n) = aT(n/b) + f(n)$.
3.  **Question**: Why do we use `Amortized analysis methods`?
    *   **Answer**: To show that even if one operation is expensive, the total cost of a sequence of operations is low, providing a more accurate picture of performance than looking at a single operation in isolation.
