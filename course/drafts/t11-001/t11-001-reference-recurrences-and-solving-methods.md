<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Recurrences and standard solution methods

*This is an automatically generated draft.*

# Scope and version

This lesson covers the mathematical tools used to analyze the cost of recursive algorithms. It focuses on how to express the running time of a function that calls itself and the standard techniques used to solve those expressions. These concepts are timeless foundations of computer science (references checked 2026-11-14).

# How this group fits the mental model

When you analyze a simple loop, you can count the operations directly. However, recursive algorithms—those that solve a problem by breaking it into smaller versions of itself—require a different approach. 

Think of a **recurrence** as a "cost recipe." It describes the total work as the sum of the work done at the current level plus the work required to solve the smaller sub-problems. To understand the overall efficiency (the **asymptotic bound**), you must "solve" this recipe to find a standard notation like Big O. The names in this group represent the components of that recipe and the different strategies you can use to find the final answer.

# Supplied names explained

*   `Recurrence relation`: An equation or inequality that defines a function over non-negative integers (usually representing input size $n$) in terms of itself. In algorithm analysis, it expresses the total time $T(n)$ by breaking it down into the time spent on sub-problems and the time spent on "extra" work like dividing the input or combining results.
*   `Base case`: The part of a recurrence relation that defines the cost for the smallest possible input (often $n=1$ or $n=0$). Without a base case, the recurrence would subtract from the input size forever, and the mathematical model would never reach a conclusion.
*   `Substitution method`: A two-step technique for solving recurrences. First, you guess the form of the solution (e.g., "I think this is $O(n^2)$"). Second, you use mathematical induction to prove that your guess is correct. This is powerful but requires a good initial guess.
*   `Iteration method`: A technique where you repeatedly expand (unfold) the recurrence by replacing the recursive term with its own definition. You continue this until you see a pattern, usually resulting in a summation (a series of numbers added together) that you can solve using standard algebra.
*   `Recursion tree method`: A visual way to solve recurrences. You draw a tree where each node represents the cost of a single sub-problem at a specific level of recursion. By summing the costs of all nodes at each level and then summing the totals of all levels, you can determine the total asymptotic cost.
*   `Master method`: A "cookbook" approach for solving recurrences that follow a specific standard form, typically $T(n) = aT(n/b) + f(n)$. It provides a set of pre-determined rules to quickly find the Big O bound without drawing trees or performing induction.
*   `Master theorem`: The underlying mathematical theorem that proves the validity of the Master method. It provides the formal bounds for the three cases used to compare the cost of dividing/combining ($f(n)$) against the cost of the recursive sub-problems.

# Cross-item comparison

*   **`Substitution method` vs. `Recursion tree method`**: The recursion tree is often used to generate a good "guess" for the cost, while the substitution method is used to formally prove that the guess is correct.
*   **`Iteration method` vs. `Master method`**: The iteration method is a manual process of unfolding the math, which works for almost any recurrence. The Master method is a shortcut that only works for specific "divide and conquer" patterns.
*   **`Master method` vs. `Master theorem`**: In practice, you use the *method* (the steps) to solve a problem, while the *theorem* is the mathematical proof that those steps are correct.

# Examples

### Defining a Recurrence
For an algorithm like Merge Sort, which splits an array in half and then merges the results, the cost is described by this `Recurrence relation`:
$T(n) = 2T(n/2) + n$
The `Base case` is $T(1) = 1$ (sorting one item takes constant time).

### Using the Master Method
To solve $T(n) = 2T(n/2) + n$ using the `Master method`, we identify the parts:
*   $a = 2$ (number of sub-problems)
*   $b = 2$ (factor by which input size shrinks)
*   $f(n) = n$ (cost of merging)

According to the `Master theorem`, since the work is balanced between the sub-problems and the merging step, the solution is $T(n) = \Theta(n \log n)$.

### Using a Recursion Tree
If we used the `Recursion tree method` for the same problem:
1.  The top node is $n$.
2.  The next level has two nodes of $n/2$ (total $n$).
3.  The next level has four nodes of $n/4$ (total $n$).
4.  The tree has $\log n$ levels.
5.  Total cost = (Work per level) $\times$ (Number of levels) = $n \log n$.

# Common mistakes

*   **Ignoring the Base Case**: Forgetting the `Base case` in a `Substitution method` proof often leads to a "proof" that seems to work but is logically invalid.
*   **Misapplying the Master Method**: The `Master method` cannot be used if $a < 1$ (you can't have fewer than one sub-problem) or if the sub-problems are not of equal size (e.g., $T(n) = T(n/3) + T(2n/3) + n$). In these cases, you must use a `Recursion tree method` or `Iteration method`.
*   **Confusing "n" with "T(n)"**: When expanding a recurrence, learners sometimes confuse the input size ($n$) with the cost function ($T$). Always remember that $T(n)$ is the "price" you pay for an input of size $n$.

# Knowledge checks with answers

1.  **Question**: Which method is best described as "unfolding" the recurrence into a long sum?
    *   **Answer**: `Iteration method`.
2.  **Question**: If you have a recurrence $T(n) = 3T(n/2) + n^2$, and you want to solve it quickly using a set of three standard cases, which tool are you using?
    *   **Answer**: `Master method`.
3.  **Question**: Why is a `Base case` necessary in a `Recurrence relation`?
    *   **Answer**: It provides a stopping point for the recursion, representing the smallest problem size that can be solved directly without further calls.
4.  **Question**: True or False: The `Substitution method` is the easiest way to find a solution if you have no idea what the Big O bound might be.
    *   **Answer**: False. The substitution method requires you to guess the answer first. The `Recursion tree method` is usually better for finding the initial guess.

**Sources:**
*   [OpenDSA: Asymptotic Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)
*   [MIT OCW: Asymptotic Notation and Recurrences](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)
