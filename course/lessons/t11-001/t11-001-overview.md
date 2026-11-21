
# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Big-picture orientation and mental model

# Problem and purpose
When you write an algorithm, you need to know how it will perform as the input grows. Will it finish in a second, or will it take years? Algorithm analysis provides a mathematical framework to predict performance without needing to run the code on every possible computer. Its purpose is to help you compare different approaches and choose the most efficient one for your specific needs.

# Plain-language mental model
Think of algorithm analysis as asking how much work a recipe requires as the amount of material grows. **Input size** describes the problem (for a list, perhaps its number of elements); **cost** is the resource consumed (such as comparisons, machine operations under a stated model, or extra memory). These are distinct quantities: input size is not running time, and running time is not memory. **Asymptotic growth** describes how a cost function changes as the input grows, while suppressing fixed multiplicative factors and lower-order terms.

Instead of measuring exact seconds (which depend on your CPU), we look at how the number of operations scales. If you double the input size, does the work double, or does it quadruple? This allows us to ignore minor hardware differences and focus on the efficiency of the logic itself.

# How the parts fit together
To analyze an algorithm, you follow a standard pipeline:
1.  **Define the metrics:** Decide what "input size" means (e.g., number of items in a list) and what resource you are measuring (time or space).
2.  **Determine the case:** Are you looking for the best possible scenario, the worst-case, or the average?
3.  **Express the growth:** Use mathematical notation to describe how the resource usage changes as the input size approaches infinity.
4.  **Solve for complexity:** If the algorithm is recursive, translate every recursive call and nonrecursive step into a recurrence with base cases, then solve it using a method whose assumptions fit.

# Concept map
*   **Cost Models:** Choosing what to measure (Time vs. Space).
*   **Analysis Cases:** Best, Average, Worst, and Amortized (cost over a sequence).
*   **Asymptotic Bounds:** Big O (upper), Big Omega (lower), and Big Theta (tight).
*   **Recurrences:** Breaking down recursive steps into a mathematical equation.
*   **Amortized Analysis:** Accounting for occasional expensive operations that are rare in a long sequence.

# End-to-end walkthrough
Consider a simple function that finds the maximum value in a list of $n$ items.

1.  **Input Size:** $n$ (the number of elements).
2.  **Resource:** Running time (number of comparisons).
3.  **Analysis:** A straightforward scan makes $n-1$ comparisons for $n\ge1$ and uses constant extra storage if it keeps only the current maximum. The comparison count is independent of the arrangement. (For $n=0$, the API must define an empty-input result or error separately.)
4.  **Asymptotic Bound:** The comparison count is $\Theta(n)$, so it is also $O(n)$; `Theta` communicates both a matching upper and lower asymptotic bound. This is a bound for the stated operation count, not a claim about exact wall-clock seconds.
5. **Recursive alternative:** If we split into two halves, recursively find each half's maximum, and compare the two results, the recurrence is $T(n)=2T(n/2)+\Theta(1)$, with constant base cost. The Master theorem gives $\Theta(n)$ comparisons. The recursion adds stack space of $\Theta(\log n)$ for balanced splitting, whereas an iterative scan uses $\Theta(1)$ auxiliary space. Divide and conquer does not improve the asymptotic comparison count for this task.

# When to use it and tradeoffs
*   **Use it when:** You need to justify your choice of algorithm for large-scale systems or performance-critical applications.
*   **Tradeoffs:** Asymptotic analysis ignores constants. An algorithm that is $O(n)$ might be slower than an $O(n^2)$ algorithm for very small inputs because the constant factors (the "hidden" work) are smaller in the $O(n^2)$ version.
*   **Common Mistakes:** Confusing "worst-case" with "average-case," or assuming that a lower asymptotic bound always means faster performance on small datasets.

# What later lessons cover
Future lessons will dive into:
*   Specific data structures and their associated costs.
*   Advanced techniques for solving complex recurrences.
*   Practical implementation of amortized analysis (e.g., dynamic arrays).
*   Detailed comparisons of sorting and searching algorithms using these models.

*Sources: [OpenDSA](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html), [MIT OCW Lecture 2](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html), [MIT OCW Lecture 11](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/83b82d45beb3776da72b7f3e1b3f42df_MIT6_046JS12_lec11.pdf)*
