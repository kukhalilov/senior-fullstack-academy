<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Common growth families

*This is an automatically generated draft.*

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

1. **Sub-linear growth:** Resource consumption grows far slower than input size (`Constant growth`, `Logarithmic growth`).
2. **Linear growth:** Resource consumption grows in direct proportion to input size (`Linear growth`).
3. **Super-linear / Polynomial growth:** Resource consumption grows by a fixed power of the input size (`Linearithmic growth`, `Quadratic growth`, `Cubic growth`, `Polynomial growth`).
4. **Intractable / Exponential growth:** Resource consumption grows multiplicatively with each addition to input size (`Exponential growth`, `Factorial growth`).

Understanding these families allows you to predict whether an algorithm will scale effectively to large datasets or quickly become unusable.

# Supplied names explained

The items below represent the pre-enumerated growth families used in standard asymptotic analysis.

* `Constant growth`: Denoted asymptotically as $O(1)$. Execution cost does not depend on the input size $n$. Performing a single array lookup by index or pushing an item onto a stack runs in constant cost regardless of whether the structure holds 10 elements or 1,000,000 elements ([OpenDSA Asymptotic Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)).
* `Logarithmic growth`: Denoted asymptotically as $O(\log n)$. Execution cost grows proportionally to the logarithm of the input size $n$. This pattern occurs when an algorithm repeatedly cuts the remaining input scope by a fixed fraction (typically halved) at each step, such as binary search on a sorted array. Doubling the input size adds only a constant number of operations.
* `Linear growth`: Denoted asymptotically as $O(n)$. Execution cost increases in direct linear proportion to input size $n$. Scanning an unsorted array to find a maximum value or iterating over a list once are classic examples. If the input size doubles, the operations performed double as well.
* `Linearithmic growth`: Denoted asymptotically as $O(n \log n)$. Execution cost grows as the product of linear and logarithmic terms. This is the optimal worst-case time bound for comparison-based sorting algorithms such as Merge Sort. It grows slightly faster than linear rate, remaining highly scalable for massive datasets.
* `Quadratic growth`: Denoted asymptotically as $O(n^2)$. Execution cost increases proportionally to the square of input size $n$. This growth commonly arises from nested loops processing all pairs of input elements, such as naive Bubble Sort or checking every pair in a collection for duplicates. Doubling $n$ increases operations by approximately four times.
* `Cubic growth`: Denoted asymptotically as $O(n^3)$. Execution cost increases proportionally to the cube of input size $n$. This pattern frequently appears in algorithms that process all triples of input elements, such as standard three-loop matrix multiplication or the Floyd-Warshall all-pairs shortest path algorithm. Doubling $n$ increases operations by approximately eight times.
* `Polynomial growth`: Denoted asymptotically as $O(n^k)$ for a fixed constant power $k \ge 0$. This general family encompasses constant ($k=0$), linear ($k=1$), quadratic ($k=2$), cubic ($k=3$), and higher fixed-power rates. Polynomial algorithms are generally considered "feasible" or "tractable" in theoretical Computer Science compared to non-polynomial alternatives ([MIT OCW Lecture 2](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)).
* `Exponential growth`: Denoted asymptotically as $O(c^n)$ for a constant base $c > 1$ (such as $O(2^n)$). Execution cost doubles (or increases by factor $c$) every time input size $n$ increases by 1. This rate occurs in brute-force evaluation of subset-sum problems or generating all subsets of a set. It becomes computationally infeasible even for moderate values of $n$ (such as $n \ge 50$).
* `Factorial growth`: Denoted asymptotically as $O(n!)$. Execution cost grows proportionally to the product of all positive integers up to $n$. This rate appears in naive algorithms generating all permutations of a set, such as solving the Traveling Salesperson Problem by trying every tour order. It grows even faster than simple exponential functions like $2^n$ and becomes unusable beyond tiny values of $n$ (such as $n \ge 13$).

# Cross-item comparison

Within this assigned inventory group, we can rank all nine growth families in strictly increasing order of growth rate as $n \to \infty$:

$$\text{Constant} < \text{Logarithmic} < \text{Linear} < \text{Linearithmic} < \text{Quadratic} < \text{Cubic} \subseteq \text{Polynomial} < \text{Exponential} < \text{Factorial}$$

### Key distinctions within the group:

1. **Sub-linear (`Constant growth`, `Logarithmic growth`) vs. Linear (`Linear growth`):** Sub-linear operations avoid inspecting every element in the input. Linear operations must visit every element at least once.
2. **Linear (`Linear growth`) vs. Linearithmic (`Linearithmic growth`):** Adding a logarithmic factor (such as dividing work into subproblems during recursion) increases growth slightly above linear, but `Linearithmic growth` remains scalable for millions of items.
3. **Polynomial sub-families (`Quadratic growth`, `Cubic growth`, general `Polynomial growth`):** Fixed-exponent functions scale by raising input growth ratio to exponent $k$. If input size increases by factor $m$, work increases by factor $m^k$.
4. **Polynomial (`Polynomial growth`) vs. Non-polynomial (`Exponential growth`, `Factorial growth`):** In polynomial growth, the variable $n$ is in the base ($n^k$). In exponential and factorial growth, $n$ appears in the exponent or controls the factorial term sequence ($c^n$, $n!$). Non-polynomial growth explodes rapidly, rendering algorithms impractical for large input sizes regardless of hardware speed ([MIT OCW Lecture 11](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/83b82d45beb3776da72b7f3e1b3f42df_MIT6_046JS12_lec11.pdf)).

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
| `Logarithmic growth` | $O(\log_2 n)$ | $\approx 3.3$ steps | $\approx 6.6$ steps | $\approx 10$ steps |
| `Linear growth` | $O(n)$ | $10$ steps | $100$ steps | $1,000$ steps |
| `Linearithmic growth` | $O(n \log_2 n)$ | $\approx 33$ steps | $\approx 664$ steps | $\approx 9,966$ steps |
| `Quadratic growth` | $O(n^2)$ | $100$ steps | $10,000$ steps | $1,000,000$ steps |
| `Cubic growth` | $O(n^3)$ | $1,000$ steps | $1,000,000$ steps | $1,000,000,000$ steps |
| `Exponential growth` | $O(2^n)$ | $1,024$ steps | $\approx 1.27 \times 10^{30}$ steps | Intractable |
| `Factorial growth` | $O(n!)$ | $3,628,800$ steps | Intractable | Intractable |

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

1. **Answer:** `Logarithmic growth` ($O(\log n)$). Repeatedly halving the problem space generates a logarithmic tree depth.
2. **Answer:** `Exponential growth` ($O(2^n)$). Adding a constant $1$ to input size multiplies work by a fixed base factor (in this case, 2).
3. **Answer:** Both are specific instances of `Polynomial growth` where the fixed power $k$ is $2$ (`Quadratic growth`) and $3$ (`Cubic growth`).
4. **Answer:** True. For any $n > 1$, $n < n \log n < n^2$.
5. **Answer:** Because $n! = n \times (n-1) \times \dots \times 1$. As $n$ grows, every added term multiplies by a factor equal to $n$, which exceeds any constant base exponent $c^n$ as $n \to \infty$.
