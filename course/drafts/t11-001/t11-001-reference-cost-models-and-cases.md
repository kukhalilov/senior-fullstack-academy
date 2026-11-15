<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Cost measures and analysis cases

*Note: This is an automatically generated draft.*

# Scope and version
This lesson covers fundamental algorithm analysis terminology as defined in timeless computer science curricula (OpenDSA and MIT OpenCourseWare, checked 2026-11-14). It focuses on the metrics used to evaluate algorithm efficiency and the scenarios under which those metrics are applied.

# How this group fits the mental model
Before analyzing an algorithm, you must define what you are measuring (the resource) and what you are measuring it against (the input). These terms provide the vocabulary to describe how an algorithm behaves as the input grows. While "Running time" and "Auxiliary space" define *what* we measure, the "cases" (Best, Average, Worst, Amortized) define *when* we measure it, allowing us to characterize performance across different data distributions.

# Supplied names explained

* `Input size`: The primary variable (often denoted as $n$) representing the amount of data the algorithm processes. Choosing the correct measure is critical; for sorting, it is the number of elements, while for graph algorithms, it may be the number of vertices and edges.
* `Running time`: The measure of computational steps or operations performed by an algorithm. It is typically expressed as a function of the input size.
* `Auxiliary space`: The extra memory used by an algorithm, excluding the space taken by the input itself. This is essential for understanding memory constraints.
* `Best-case cost`: The minimum amount of resources required by an algorithm for any input of a given size. This is rarely used for performance guarantees but helps identify the lower bound of an algorithm's behavior.
* `Average-case cost`: The expected resource usage over all possible inputs of a given size, assuming a specific probability distribution.
* `Worst-case cost`: The maximum amount of resources required for any input of a given size. This provides a reliable upper bound, ensuring the algorithm will never perform worse than this limit.
* `Amortized cost`: The average cost of an operation over a worst-case sequence of operations. This is useful when an occasional expensive operation is offset by many inexpensive ones.
* `Asymptotic growth rate`: The mathematical behavior of the cost function as the input size approaches infinity. It ignores constant factors and lower-order terms to focus on how the algorithm scales.

# Cross-item comparison

| Comparison Pair | Distinction |
| :--- | :--- |
| `Best-case cost` vs `Worst-case cost` | Best-case represents the "lucky" scenario; Worst-case represents the "guaranteed" upper limit. |
| `Average-case cost` vs `Amortized cost` | Average-case depends on input probability; Amortized depends on the sequence of operations regardless of input distribution. |

# Examples
Consider a dynamic array that doubles its size when full:
1. **Worst-case cost**: A single "insert" operation might trigger a resize, requiring $O(n)$ time to copy elements.
2. **Amortized cost**: Over a sequence of $n$ insertions, the total time is $O(n)$, meaning the amortized cost per insertion is $O(1)$.
3. **Input size**: If we insert $n$ items, $n$ is our input size.
4. **Asymptotic growth rate**: We describe the amortized performance as $O(1)$, ignoring the constant factors involved in the resize.

# Common mistakes
* **Confusing Average-case with Amortized**: Average-case assumes random input; Amortized assumes a worst-case sequence of operations.
* **Ignoring Constants**: While asymptotic growth ignores constants, they can be significant in practice for small input sizes.
* **Misidentifying Input Size**: Measuring input size by the number of bits in a number rather than the number of elements can lead to incorrect complexity analysis.

# Knowledge checks with answers
1. **Question**: If an algorithm performs $O(1)$ most of the time but $O(n)$ once every $n$ operations, what is the amortized cost?
   **Answer**: $O(1)$. The expensive operation is spread across the sequence.
2. **Question**: Which cost measure provides a performance guarantee for any input?
   **Answer**: Worst-case cost.
3. **Question**: Why do we use asymptotic growth rate instead of exact instruction counts?
   **Answer**: Because exact counts depend on hardware and compiler details, whereas asymptotic growth captures the fundamental scaling behavior of the algorithm.

*Sources: [OpenDSA](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html), [MIT OCW Lecture 2](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html), [MIT OCW Lecture 11](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/83b82d45beb3776da72b7f3e1b3f42df_MIT6_046JS12_lec11.pdf)*
