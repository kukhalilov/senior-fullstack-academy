
# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Recurrences and standard solution methods

# Scope and version

# How this group fits the mental model

A recurrence defines a cost function using costs for smaller inputs, together with base values. It is a model derived from the algorithm and the chosen cost measure. A recurrence does not solve itself: first count recursive calls and nonrecursive work, then choose a solution technique whose assumptions fit. The result may be a bound rather than an exact closed form.

# Supplied names explained

`Recurrence relation` is the equation or inequality; `Base case` provides its boundary values. `Substitution method`, `Iteration method`, `Recursion tree method`, `Master method`, and `Master theorem` are standard ways to reason about solutions.

## Build the recurrence carefully

For a recursive procedure, write `T(n) = (sum of recursive-call costs) + (nonrecursive work)` and state base cases. Include all recursive calls, including calls on unequal subproblem sizes; do not count work already included in a recursive call twice. Clarify rounding and what happens for small `n`. A base case must terminate the recurrence and have a cost consistent with the model.

**Example: merge sort.** With two halves and linear merging, `T(n)=T(floor(n/2))+T(ceil(n/2))+Theta(n)` for `n>1`, and `T(1)=Theta(1)`. On powers of two this simplifies to `2T(n/2)+Theta(n)`. The simplification preserves the asymptotic solution; the exact recurrence includes floors and ceilings.

# Examples

## Solution methods

## Iteration / expansion

Repeatedly substitute the recurrence into itself until reaching base cases, then evaluate the resulting sum. This is useful for revealing a geometric or arithmetic pattern and works beyond the Master theorem's form, provided the expansion can be bounded.

For `T(n)=T(n-1)+n`, `T(1)=Theta(1)`, expansion gives `T(n)=T(1)+2+3+...+n = Theta(n^2)`. For `T(n)=T(n/2)+1`, `T(1)=Theta(1)`, expansion has `Theta(log n)` constant-cost levels, so `T(n)=Theta(log n)`.

## Recursion tree

Draw one node per subproblem, label it with the nonrecursive work at that node, sum costs by level, and include leaves/base-case costs. For `T(n)=2T(n/2)+n`, each level has total nonrecursive work `n`; there are `log2(n)` internal levels and `n` constant-cost leaves, so total cost is `Theta(n log n)`. For irregular trees, level costs may not be equal; sum the actual series and check leaves rather than assuming “work per level times depth.”

## Substitution / induction

Guess a bound, substitute it into the recurrence, and prove it by induction, including base cases. The guess can come from expansion, a tree, or another argument. For an upper bound, inductive constants and lower-order terms matter. If a direct guess fails, strengthen it (for example, prove `T(n) <= c n log n - d n` rather than only `c n log n`). A recursion tree can suggest a result, but the induction establishes the claimed inequality.

## Master theorem for a restricted divide-and-conquer form

For the standard recurrence `T(n)=aT(n/b)+f(n)`, where `a>=1`, `b>1` are constants, subproblems have equal size (with conventional rounding), base costs are bounded, and `f` is asymptotically nonnegative, compare `f(n)` with `n^p`, where `p=log_b(a)`. A common Master theorem version states:

1. If `f(n)=O(n^(p-epsilon))` for some constant `epsilon>0`, then `T(n)=Theta(n^p)`.
2. If `f(n)=Theta(n^p log^k n)` for a constant `k>=0`, then `T(n)=Theta(n^p log^(k+1) n)`.
3. If `f(n)=Omega(n^(p+epsilon))` for some constant `epsilon>0` and the regularity condition `a f(n/b) <= c f(n)` holds eventually for some constant `c<1`, then `T(n)=Theta(f(n))`.

This formulation covers the usual cases but is not a universal recurrence solver. Variants state slightly different hypotheses. In particular, Case 3 needs its regularity condition; merely observing that `f` grows polynomially faster is insufficient. The equal-size, fixed-branching recurrence is essential. The theorem does not directly solve unequal splits such as `T(n)=T(n/3)+T(2n/3)+n`, decrement-by-one recurrences, recurrences with nonconstant branching, or arbitrary recurrences. Use expansion, a tree, induction, or a more general theorem when the form does not match.

**Example.** `T(n)=2T(n/2)+n` has `a=2`, `b=2`, `p=log2(2)=1`, and `f(n)=Theta(n)=Theta(n^p)`. Case 2 with `k=0` yields `Theta(n log n)`. By contrast, `T(n)=2T(n/2)+1` has `f(n)=O(n^(1-epsilon))` for a suitable positive epsilon, so Case 1 yields `Theta(n)`.

# Cross-item comparison

* Expansion is direct when repeated substitution yields a tractable sum.
* A recursion tree is useful for seeing per-level costs and generating a conjecture.
* Induction is useful to verify a proposed bound and handles many recurrences outside a theorem's scope.
* The Master theorem is quick only after verifying its form and hypotheses. A failed match is a reason to use another method, not to force a case.

# Common mistakes

* Omitting a base case or recursive branch.
* Treating `T(n)=2T(n/2)+n` as `2T(n)+n`, or counting recursive work again as nonrecursive work.
* Assuming every recursion tree has equal cost at each level.
* Applying the Master theorem to unequal-sized subproblems or ignoring Case 3 regularity.
* Stopping an expansion before the base cases and losing leaf cost or recursion depth.
* Reporting `O` when the argument supports a tight `Theta` bound, or claiming `Theta` from an upper-bound argument alone.

# Knowledge checks with answers

1. **Solve `T(n)=T(n-1)+n`, with constant base cost.** Expansion gives a sum from 1 through n, hence `Theta(n^2)`.
2. **Why is `T(n)=T(n/3)+T(2n/3)+n` outside the basic Master theorem above?** It has two unequal subproblem sizes rather than `a` identical subproblems each of size `n/b`.
3. **What extra hypothesis does the common third Master case require?** A regularity condition such as `a f(n/b) <= c f(n)` eventually for some `c<1`, in addition to polynomial separation.
4. **What does a recursion tree contribute to a proof?** A way to organize and sum node costs; the asymptotic sum still needs justification, and induction may be used to establish a bound.

**Sources**

* [MIT OCW, 6.046J Lecture 2: Asymptotic Notation and Recurrences](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html) — substitution, recursion trees, Master theorem.
* [MIT OCW, 6.006 Recitation 3: Recurrences](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/1869dbf640ded6b31f1bd369d2001ef5_MIT6_006S20_r03.pdf) — theorem hypotheses and method overview.
* [MIT OCW, Mathematics for Computer Science, §21.4.4](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf) — one statement of the Master theorem including regularity.
