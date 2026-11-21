
# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Cost measures and analysis cases

# Scope and version
This lesson covers fundamental algorithm analysis terminology as defined in timeless computer science curricula (OpenDSA and MIT OpenCourseWare, checked 2026-11-14). It focuses on the metrics used to evaluate algorithm efficiency and the scenarios under which those metrics are applied.

# How this group fits the mental model
Before analyzing an algorithm, you must define what you are measuring (the resource) and what you are measuring it against (the input). These terms provide the vocabulary to describe how an algorithm behaves as the input grows. While "Running time" and "Auxiliary space" define *what* we measure, the "cases" (Best, Average, Worst, Amortized) define *when* we measure it, allowing us to characterize performance across different data distributions.

# Supplied names explained

* `Input size`: The parameter (or parameters) describing the problem instance, commonly denoted by $n$. For an array, it may be the number of elements; for graph algorithms, useful analysis often needs both vertex count $V$ and edge count $E$. For numeric inputs, bit length can matter more than numeric value. State the measure so the bound is interpretable.
* `Running time`: A cost measure for computational steps under a stated model, typically expressed as a function of input parameters. Asymptotic operation counts abstract away hardware-dependent elapsed seconds; measured wall-clock time is a different empirical quantity.
* `Auxiliary space`: Extra working memory used by the algorithm beyond the input representation, under a clearly stated convention. Some sources include output storage in space complexity and others report it separately, so say which convention is used. Recursion stack is auxiliary space.
* `Best-case cost`: For a fixed input size and cost model, the minimum cost over all inputs of that size. It describes the most favorable case; it is not a lower bound for every input.
* `Average-case cost`: Expected resource use over inputs of a fixed size under an explicitly stated probability distribution. Without that distribution the expected cost is underspecified.
* `Worst-case cost`: The maximum cost over inputs of the given size. It is a bound across those inputs, when expressed as an upper bound; unlike a best case, it covers even the most costly input instance.
* `Amortized cost`: A per-operation bound derived from total actual cost over every legal sequence (often a worst-case sequence bound divided by sequence length). It needs no probability distribution. An individual operation can be expensive; state restrictions on initial state or operation mix when they are part of the proof.
* `Asymptotic growth rate`: The mathematical behavior of the cost function as the input size approaches infinity. It ignores constant factors and lower-order terms to focus on how the algorithm scales.

# Cross-item comparison

| Comparison Pair | Distinction |
| :--- | :--- |
| `Best-case cost` vs `Worst-case cost` | They are respectively the minimum and maximum cost among inputs of the same size under the same model. |
| `Average-case cost` vs `Amortized cost` | Average-case depends on input probability; Amortized depends on the sequence of operations regardless of input distribution. |

# Examples
Consider a dynamic array that doubles its size when full:
1. **Worst-case cost**: A single "insert" operation might trigger a resize, requiring $O(n)$ time to copy elements.
2. **Amortized cost**: Over a sequence of $n$ insertions, the total time is $O(n)$, meaning the amortized cost per insertion is $O(1)$.
3. **Input size**: If we insert $n$ items, $n$ is our input size.
4. **Asymptotic growth rate**: For the specified append-only sequence and copying model, total work is $O(n)$ and amortized append cost is $O(1)$. A resizing append remains $\Theta(n)$ worst-case. `O(1)` per operation is an upper bound, not an exact cost.

# Common mistakes
* **Confusing Average-case with Amortized**: Average-case assumes random input; Amortized assumes a worst-case sequence of operations.
* **Ignoring Constants**: While asymptotic growth ignores constants, they can be significant in practice for small input sizes.
* **Misidentifying Input Size**: The relevant measure depends on the problem and algorithm. Numeric algorithms often need bit length; graph algorithms may need both $V$ and $E$. There is no universal input-size parameter.

# Knowledge checks with answers
1. **Question**: If an algorithm performs $O(1)$ most of the time but $O(n)$ once every $n$ operations, what is the amortized cost?
   **Answer**: $O(1)$. The expensive operation is spread across the sequence.
2. **Question**: Which cost measure provides a performance guarantee for any input?
   **Answer**: Worst-case cost.
3. **Question**: Why do we use asymptotic growth rate instead of exact instruction counts?
   **Answer**: Because exact counts depend on hardware and compiler details, whereas asymptotic growth captures the fundamental scaling behavior of the algorithm.

*Sources: [OpenDSA](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html), [MIT OCW Lecture 2](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html), [MIT OCW Lecture 11](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/83b82d45beb3776da72b7f3e1b3f42df_MIT6_046JS12_lec11.pdf)*
