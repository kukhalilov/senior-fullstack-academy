<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Exercises and worked solutions

*Automatically generated draft.*

# Goals
*   Understand how to define `Input size` and `Running time` for an algorithm.
*   Distinguish between `Best-case cost`, `Worst-case cost`, and `Amortized cost`.
*   Apply `Big O notation` and `Big Theta notation` to describe `Asymptotic growth rate`.
*   Solve a `Recurrence relation` using the `Master theorem`.

# Worked example
Consider a function that processes an array of size $n$ by splitting it into two halves, processing each recursively, and performing a linear scan ($O(n)$) to merge them.

**Recurrence Relation:** $T(n) = 2T(n/2) + \Theta(n)$ for powers of two, with constant base cost $T(1)=\Theta(1)$. The nonrecursive term represents merging work; it is not itself the total runtime.

To solve this using the `Master method`:
1. Identify $a=2, b=2, f(n)=n$.
2. Compare $f(n)$ to $n^{\log_b a} = n^{\log_2 2} = n^1 = n$.
3. Since $f(n) = \Theta(n^{\log_b a})$, this is the balanced case of the `Master theorem` (`k=0`).
4. The solution is $T(n) = \Theta(n \log n)$, which is `Linearithmic growth`.

# Exercises
1. Determine the `Asymptotic growth rate` of an algorithm that has a `Worst-case cost` defined by $T(n) = T(n-1) + n$ for $n>1$, with $T(1)=\Theta(1)$.
2. If an operation takes $O(1)$ most of the time but $O(n)$ every $n$ operations, what is the `Amortized cost` per operation?
3. Classify the following functions by their `Common growth families`:
    *   $f(n) = 3n^2 + 5n$
    *   $g(n) = 2^n + n^{10}$
    *   $h(n) = \log(n) + 100$

# Progressive hints
*   **Exercise 1:** Use the `Iteration method`. Expand $T(n) = (T(n-2) + (n-1)) + n$. Continue until you reach the `Base case`.
*   **Exercise 2:** Use the `Aggregate method`. Total cost for $n$ operations is $(n-1) \times 1 + n$. Divide by $n$.
*   **Exercise 3:** Focus on the term that dominates as $n \to \infty$. Constants and lower-order terms do not affect the `Asymptotic growth rate`.

# Complete solutions
1. $T(n) = n + (n-1) + (n-2) + \dots + 1 = \frac{n(n+1)}{2} = \Theta(n^2)$ (`Quadratic growth`).
2. Total cost = $(n-1) + n = 2n - 1$. Amortized cost = $(2n-1)/n \approx 2$, which is $O(1)$ (`Constant growth`).
3. 
    *   $3n^2 + 5n \to \Theta(n^2)$ (`Quadratic growth`).
    *   $2^n + n^{10} \to \Theta(2^n)$ (`Exponential growth`).
    *   $\log(n) + 100 \to \Theta(\log n)$ (`Logarithmic growth`).

# Tests and edge cases
*   **Input size = 0 or 1:** Always verify your `Recurrence relation` against the `Base case`.
*   **Dominant terms:** Ensure you are not misled by small constants (e.g., $1000n$ is still `Linear growth`).
*   **Amortized vs. Worst-case:** Remember that `Amortized cost` is an average over a sequence, not a guarantee for a single execution. A single operation might still hit the `Worst-case cost`.

# Reflection questions
1. Why do we prefer `Big Theta notation` over `Big O notation` when describing the performance of an algorithm?
2. In what scenario would the `Substitution method` be more useful than the `Master theorem`?
3. How does choosing a different `Input size` measure (e.g., number of bits vs. number of elements) change your analysis?

*Sources: [OpenDSA](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html), [MIT OCW Lecture 2](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html), [MIT OCW Lecture 11](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/83b82d45beb3776da72b7f3e1b3f42df_MIT6_046JS12_lec11.pdf)*
