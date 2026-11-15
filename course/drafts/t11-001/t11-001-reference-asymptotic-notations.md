<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Asymptotic bound notations

# Scope and version

*Automatically generated draft.*

This reference lesson covers the exact group of asymptotic bound notations used in algorithm analysis: `Big O notation`, `Big Omega notation`, `Big Theta notation`, `Little o notation`, and `Little omega notation`. 

Algorithm analysis evaluates how resource consumption (such as time or memory) grows as the input size ($n$) increases. Before measuring performance, we must choose an input-size measure and a resource measure. Asymptotic notations provide a rigorous mathematical language to describe the rate of growth of functions, ignoring constant factors and low-order terms.

This lesson is grounded in timeless algorithm-analysis concepts, with references checked on 2026-11-14 against OpenDSA and MIT OpenCourseWare curriculum materials ([OpenDSA Asymptotic Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html), [MIT OCW Lecture 2](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)).

# How this group fits the mental model

In the broader study of algorithm cost models, asymptotic bounds represent the classification step. The analysis pipeline follows a logical sequence:
1. **Define metrics:** Select input size $n$ and the resource being measured (time steps or memory units).
2. **Formulate exact cost:** Count operations or express resource usage as an exact function $T(n)$.
3. **Classify growth:** Apply asymptotic notations to describe how $T(n)$ scales as $n$ approaches infinity.
4. **Solve recurrences or amortize:** Combine these bounds with recurrence relations or aggregate sequences of operations.

The five asymptotic notations form a complete vocabulary for comparing two growth functions: $f(n)$ (the algorithm's cost) and $g(n)$ (a reference function like $n^2$ or $\log n$). They categorize bounds into upper limits, lower limits, tight bounds, and strict (non-tight) inequalities.

# Supplied names explained

Below is the complete inventory of assigned items for this reference lesson, reproduced exactly as specified and explained in the context of algorithm growth analysis.

* `Big O notation`
  * **Purpose and behavior:** Describes an **asymptotic upper bound**. Formally, $f(n) = O(g(n))$ if there exist positive constants $c$ and $n_0$ such that $0 \le f(n) \le c \cdot g(n)$ for all $n \ge n_0$. It guarantees that the function grows no faster than $g(n)$ beyond a certain input size, making it essential for establishing worst-case guarantees.

* `Big Omega notation`
  * **Purpose and behavior:** Describes an **asymptotic lower bound**. Formally, $f(n) = \Omega(g(n))$ if there exist positive constants $c$ and $n_0$ such that $0 \le c \cdot g(n) \le f(n)$ for all $n \ge n_0$. It guarantees that the function grows at least as fast as $g(n)$ for large inputs, which is frequently used to prove lower bounds on what an algorithm or problem must cost.

* `Big Theta notation`
  * **Purpose and behavior:** Describes an **asymptotic tight bound**. Formally, $f(n) = \Theta(g(n))$ if there exist positive constants $c_1$, $c_2$, and $n_0$ such that $0 \le c_1 \cdot g(n) \le f(n) \le c_2 \cdot g(n)$ for all $n \ge n_0$. A Theta bound means $f(n)$ is bounded both above and below by $g(n)$ up to constant factors, representing a precise characterization of growth.

* `Little o notation`
  * **Purpose and behavior:** Describes an **upper bound that is not asymptotically tight** (a strict upper bound). Formally, $f(n) = o(g(n))$ if for *any* positive constant $c > 0$, there exists an $n_0 > 0$ such that $0 \le f(n) < c \cdot g(n)$ for all $n \ge n_0$. Equivalently, the limit of the ratio $f(n) / g(n)$ approaches $0$ as $n$ goes to infinity. It indicates that $f(n)$ becomes strictly smaller than $g(n)$ relatively.

* `Little omega notation`
  * **Purpose and behavior:** Describes a **lower bound that is not asymptotically tight** (a strict lower bound). Formally, $f(n) = \omega(g(n))$ if for *any* positive constant $c > 0$, there exists an $n_0 > 0$ such that $0 \le c \cdot g(n) < f(n)$ for all $n \ge n_0$. Equivalently, the limit of the ratio $f(n) / g(n)$ approaches infinity as $n$ goes to infinity. It indicates that $f(n)$ strictly outgrows $g(n)$ asymptotically.

# Cross-item comparison

Within this assigned group of asymptotic notations, the items pair into loose versus tight relationships, mirroring real numbers comparisons ($O$ is like $\le$, $\Omega$ is like $\ge$, $\Theta$ is like $=$):

* **`Big O notation` vs `Big Omega notation` vs `Big Theta notation`:** `Big O` provides an upper ceiling, `Big Omega` provides a lower floor, and `Big Theta` provides both simultaneously (an exact asymptotic match). If an algorithm's worst-case time is $O(n^2)$ and its best-case time is $\Omega(n^2)$, its tight bound is $\Theta(n^2)$.
* **`Big O notation` vs `Little o notation`:** `Big O` allows the function to grow at the exact same rate as the reference function (up to a constant factor, like $2n^2 = O(n^2)$). `Little o` requires the function to grow *strictly slower* than the reference function ($n = o(n^2)$, but $n^2 \neq o(n^2)$).
* **`Big Omega notation` vs `Little omega notation`:** Analogously, `Big Omega` allows equal asymptotic growth, whereas `Little omega` requires strict outgrowth ($n^2 = \omega(n)$, but $n^2 \neq \omega(n^2)$).

# Examples

To see how asymptotic notations apply, consider a concrete function representing an algorithm's operation count: $T(n) = 3n^2 + 5n + 2$.

1. **Upper Bound Check (`Big O notation`):**
   * We claim $T(n) = O(n^2)$.
   * Choose $c = 4$ and $n_0 = 5$. For all $n \ge 5$, $3n^2 + 5n + 2 \le 4n^2$ holds true because $5n + 2 \le n^2$ when $n \ge 6$. Thus, the upper bound is verified.

2. **Tight Bound Check (`Big Theta notation`):**
   * We claim $T(n) = \Theta(n^2)$.
   * We already have an upper bound $c_2 = 4$. For a lower bound, choose $c_1 = 3$. For all $n \ge 1$, $3n^2 \le 3n^2 + 5n + 2$. Because both inequalities hold, $T(n) = \Theta(n^2)$.

3. **Strict Inequality Check (`Little o notation`):**
   * Does $T(n) = o(n^3)$?
   * Taking the limit: $\lim_{n \to \infty} \frac{3n^2 + 5n + 2}{n^3} = 0$. Because the limit is zero, $3n^2 + 5n + 2 = o(n^3)$ is correct.
   * Does $T(n) = o(n^2)$? The limit $\lim_{n \to \infty} \frac{3n^2 + 5n + 2}{n^2} = 3 \neq 0$, so it is *not* $o(n^2)$.

# Common mistakes

* **Confusing Big O with worst-case cost:** `Big O notation` is a mathematical bound descriptor, not a synonym for "worst-case." You can describe a best-case running time using Big O notation (e.g., "the best-case time is $O(n)$").
* **Dropping constants incorrectly in informal speech:** While asymptotic analysis drops constant factors, statements like "$3n^2 = n^2$" are mathematically false. The correct statement is "$3n^2 \in O(n^2)$" or "$3n^2$ is of order $n^2$."
* **Treating Little o as interchangeable with Big O:** Assuming $f(n) = O(g(n))$ implies $f(n) = o(g(n))$ is incorrect. For instance, $n^2 = O(n^2)$, but $n^2 \neq o(n^2)$.

# Knowledge checks with answers

1. **Question:** If an algorithm takes exactly $7n \log n - 4n$ steps, how would you classify its growth using `Big Theta notation`?
   * **Answer:** $\Theta(n \log n)$. The dominant term is $n \log n$, and constant multipliers or lower-order subtraction do not affect the tight asymptotic bound.

2. **Question:** Does the statement $5n^2 = O(n)$ hold true? Why or why not?
   * **Answer:** No. `Big O notation` specifies an upper bound. Because $5n^2$ grows faster than $n$ as $n \to \infty$, no positive constant $c$ can satisfy $5n^2 \le c \cdot n$ for all sufficiently large $n$.

3. **Question:** What is the fundamental distinction between `Big O notation` and `Little o notation` regarding constant-factor growth?
   * **Answer:** `Big O notation` allows the function to grow at the same rate as the reference function up to a constant factor ($f(n) \le c \cdot g(n)$). `Little o notation` requires the function to become strictly smaller than the reference function relative to any positive constant multiplier as $n$ grows ($f(n) < c \cdot g(n)$ for all $c > 0$).
