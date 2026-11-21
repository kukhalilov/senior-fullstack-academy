
# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Common growth families

# Scope and version

This reference lesson covers the standard asymptotic growth families used to classify algorithm time and space resource usage as input size scales toward infinity.

* **Snapshot date:** Analysis concepts referenced against materials verified on 2026-11-14 ([OpenDSA Asymptotic Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)).
* **Audience:** Self-study learners looking for a clear definition of common growth rates.
* **Key technical terms introduced:**
  * **Input size ($n$):** A quantitative count of items or problem dimensions processed by an algorithm (such as the number of elements in an array).
  * **Resource measure:** The physical or operational resource consumed during execution, usually execution time (operation counts) or auxiliary space (additional RAM required beyond input storage).
  * **Asymptotic growth rate:** The rate at which resource consumption increases as input size $n$ becomes arbitrarily large, ignoring constant multipliers and smaller additive terms.

# How this group fits the mental model

When assessing how an algorithm behaves, measuring raw runtimes in seconds is unreliable because hardware speeds and compiler optimizations vary. Instead, algorithm analysis defines a mental model based on scaling: how does resource demand change when the input size $n$ doubles or grows tenfold?

The inventory of growth families provides standard rate categories (also known as complexity classes). These families group mathematical functions $f(n)$ according to their growth behavior as $n \to \infty$ ([MIT OCW Lecture 2](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)):

1. **Sub-linear growth:** Resource consumption grows more slowly than input size (`Constant growth`, `Logarithmic growth`). Such bounds generally rely on exploitable structure or assumptions that allow avoiding work on some items.
2. **Linear growth:** Resource consumption grows in direct proportion to input size (`Linear growth`).
3. **Linearithmic growth:** A near-linear superlinear family, typically expressed as $n \log n$.
4. **Polynomial growth:** A fixed power of the input size, such as quadratic, cubic, or a higher-degree polynomial. `n log n` is not a polynomial, though it is eventually smaller than `n^(1+epsilon)` for every fixed `epsilon>0`.
5. **Exponential and factorial growth:** These grow multiplicatively with input size and eventually outgrow every fixed-degree polynomial.

Understanding these families allows you to predict whether an algorithm will scale effectively to large datasets or quickly become unusable.

# Supplied names explained

The items below represent the pre-enumerated growth families used in standard asymptotic analysis.

* `Constant growth`: A tight constant bound is written $\Theta(1)$; $O(1)$ alone means an upper bound. Indexed array access and linked-node stack push are constant time in the usual model. Dynamic-array append is amortized constant time but can be linear during resizing. State the data structure and cost model.
* `Logarithmic growth`: A tight logarithmic bound is $\Theta(\log n)$; changing between fixed bases greater than one changes only a constant factor. It often occurs when active problem size shrinks by a fixed ratio at each step, as in binary search on a sorted array. Doubling `n` adds a constant number of iterations; binary search relies on sorted input.
* `Linear growth`: A tight linear bound is $\Theta(n)$. A scan examining all `n` array elements performs linearly many operations; maximum finding takes `n-1` comparisons for `n>=1`. Doubling `n` approximately doubles the leading term, not necessarily measured elapsed time.
* `Linearithmic growth`: A common tight bound is $\Theta(n \log n)$. Merge sort has this comparison/time bound in the usual model; comparison sorting requires `Omega(n log n)` comparisons in the worst case, so merge sort is asymptotically optimal among comparison sorts. `n log n` is eventually smaller than `n^(1+epsilon)` for each fixed `epsilon>0`.
* `Quadratic growth`: Denoted asymptotically as $O(n^2)$. Execution cost increases proportionally to the square of input size $n$. This growth commonly arises from nested loops processing all pairs of input elements, such as naive Bubble Sort or checking every pair in a collection for duplicates. Doubling $n$ increases operations by approximately four times.
* `Cubic growth`: Denoted asymptotically as $O(n^3)$. Execution cost increases proportionally to the cube of input size $n$. This pattern frequently appears in algorithms that process all triples of input elements, such as standard three-loop matrix multiplication or the Floyd-Warshall all-pairs shortest path algorithm. Doubling $n$ increases operations by approximately eight times.
* `Polynomial growth`: A fixed power $n^k$ for constant $k>=0$; a polynomial function is a finite sum of such terms, with its highest nonzero degree dominating. Polynomial time is the standard theoretical tractability criterion in complexity theory, but high-degree polynomials can be impractical; asymptotic class alone does not determine engineering feasibility.
* `Exponential growth`: A tight exponential family has form $\Theta(c^n)$ for fixed base `c>1`; $O(c^n)$ alone is only an upper bound. Increasing `n` by one multiplies the representative function by `c`. Enumerating all subsets has `2^n` outputs. Feasibility thresholds depend on hardware, constants, implementation, and time limits; there is no universal cutoff.
* `Factorial growth`: `n!` counts orderings of `n` distinct items. Enumerating all permutations entails at least `Omega(n!)` outputs and often `Theta(n*n!)` time when each is materialized. For every fixed `c>1`, `n!` eventually outgrows `c^n`; crossover points and practical cutoffs are workload-dependent.

# Cross-item comparison

For individual representative functions, a standard asymptotic ordering is:

$$1 < \log n < n < n\log n < n^2 < n^3 < c^n < n!$$

`Polynomial growth` is an umbrella family containing $n^2$, $n^3$, and higher fixed powers; it is not a single growth rate to place in this chain. For any fixed $k$ and constant $c>1$, $n^k$ eventually grows more slowly than $c^n$.

### Key distinctions within the group:

1. **Sub-linear (`Constant growth`, `Logarithmic growth`) vs. Linear (`Linear growth`):** Sublinear algorithms process fewer than linearly many units in their stated model, typically by exploiting structure, preprocessing, or an indexed query interface. A general scan that must inspect every item has linear cost; a sublinear claim needs assumptions that permit skipping items.
2. **Linear (`Linear growth`) vs. Linearithmic (`Linearithmic growth`):** Adding a logarithmic factor (such as dividing work into subproblems during recursion) increases growth slightly above linear, but `Linearithmic growth` remains scalable for millions of items.
3. **Polynomial sub-families (`Quadratic growth`, `Cubic growth`, general `Polynomial growth`):** Fixed-exponent functions scale by raising input growth ratio to exponent $k$. If input size increases by factor $m$, work increases by factor $m^k$.
4. **Polynomial vs. exponential/factorial:** For fixed `k` and `c>1`, `n^k` is eventually dominated by `c^n`; `n!` eventually dominates every fixed-base exponential. This is an asymptotic ordering, not a claim about which concrete implementation runs faster at a finite size.

# Examples

The following Python snippet contains isolated reference functions demonstrating code structure signatures corresponding to five distinct growth families.

```python
# Context: Isolated snippets illustrating loop patterns for different growth rates.

def demo_constant(items: list[int]) -> int:
    # Constant growth: fixed number of steps regardless of len(items)
    return items[0] if items else 0

def demo_linear(items: list[int]) -> int:
    # Linear growth: single pass over n items
    total = 0
    for x in items:
        total += x
    return total

def demo_quadratic(items: list[int]) -> int:
    # Quadratic growth: nested loops over n items
    pairs = 0
    n = len(items)
    for i in range(n):
        for j in range(n):
            pairs += 1
    return pairs

def demo_logarithmic(n: int) -> int:
    # Logarithmic growth: halving problem size each step
    steps = 0
    while n > 1:
        n = n // 2
        steps += 1
    return steps

def demo_exponential(n: int) -> int:
    # Exponential growth: two recursive calls per decrement
    if n <= 1:
        return 1
    return demo_exponential(n - 1) + demo_exponential(n - 1)
```

### Operation count scaling comparison table

| Growth Family | Formal Notation | $n = 10$ | $n = 100$ | $n = 1,000$ |
| :--- | :--- | :--- | :--- | :--- |
| `Constant growth` | $O(1)$ | $1$ step | $1$ step | $1$ step |
| `Logarithmic growth` | $O(\log_2 n)$ | $\approx 3.3$ scale units | $\approx 6.6$ scale units | $\approx 10$ scale units |
| `Linear growth` | $O(n)$ | $10$ steps | $100$ steps | $1,000$ steps |
| `Linearithmic growth` | $O(n \log_2 n)$ | $\approx 33$ steps | $\approx 664$ steps | $\approx 9,966$ steps |
| `Quadratic growth` | $O(n^2)$ | $100$ steps | $10,000$ steps | $1,000,000$ steps |
| `Cubic growth` | $O(n^3)$ | $1,000$ steps | $1,000,000$ steps | $1,000,000,000$ steps |
| `Exponential growth` | $2^n$ representative function | $1,024$ units | $\approx 1.27 \times 10^{30}$ units | Larger still |
| `Factorial growth` | $n!$ representative function | $3,628,800$ units | $9.33 \times 10^{157}$ units | $\approx 4.02 \times 10^{2567}$ units |

These are values of representative functions, not measured runtimes or operation counts for every algorithm in the class. Big-O classes hide constants and lower-order terms.

# Common mistakes

1. **Confusing small-input benchmarks with asymptotic growth rate:**
   * *Mistake:* Assuming an $O(n^2)$ algorithm is faster than an $O(n \log n)$ algorithm because it runs faster on $n = 5$.
   * *Correction:* Asymptotic growth describes behavior as $n \to \infty$. Constant factors can make high-complexity algorithms faster for tiny inputs, but higher growth rates always dominate as $n$ scales ([OpenDSA Asymptotic Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)).

2. **Confusing base polynomial growth with exponential growth:**
   * *Mistake:* Referring to $O(n^2)$ or $O(n^3)$ as "exponential growth".
   * *Correction:* $O(n^2)$ and $O(n^3)$ belong to `Polynomial growth` (variable in the base, fixed exponent). `Exponential growth` has the input variable in the exponent ($O(2^n)$).

3. **Ignoring the impact of logarithmic growth factors:**
   * *Mistake:* Treating `Linear growth` $O(n)$ and `Linearithmic growth` $O(n \log n)$ as equivalent because $\log n$ grows slowly.
   * *Correction:* While $\log n$ grows slowly, $n \log n$ involves non-trivial extra operations over millions of elements. However, `Linearithmic growth` remains significantly more efficient than `Quadratic growth` $O(n^2)$.

# Knowledge checks with answers

### Questions

1. Which growth family describes an algorithm that halves its remaining input size at every step?
2. If an input of size $n$ increases by $1$, and the required operation count doubles, which growth family represents this behavior?
3. How do `Quadratic growth` and `Cubic growth` fit within the generic `Polynomial growth` classification?
4. True or False: `Linearithmic growth` ($O(n \log n)$) grows faster than `Linear growth` ($O(n)$) but slower than `Quadratic growth` ($O(n^2)$).
5. Why is `Factorial growth` considered less scalable than `Exponential growth` ($O(2^n)$)?

### Answers

1. **Answer:** `Logarithmic growth` ($\Theta(\log n)$) when the algorithm reduces active size by a fixed ratio per step; repeated halving takes logarithmically many steps.
2. **Answer:** `Exponential growth` ($O(2^n)$). Adding a constant $1$ to input size multiplies work by a fixed base factor (in this case, 2).
3. **Answer:** Both are specific instances of `Polynomial growth` where the fixed power $k$ is $2$ (`Quadratic growth`) and $3$ (`Cubic growth`).
4. **Answer:** True for $n>2$ when the logarithm is base 2: $n < n\log_2 n < n^2$. As an asymptotic comparison, linearithmic growth is strictly between linear and quadratic growth.
5. **Answer:** For each fixed `c>1`, the ratio `n!/c^n` eventually grows without bound, so factorial eventually exceeds that exponential. The crossover point depends on `c`.
