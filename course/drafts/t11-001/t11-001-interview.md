<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Interview questions and reasoning

# Core questions
- What is the difference between a worst-case cost and an amortized cost when analyzing algorithm performance?
- How do you distinguish Big O notation from Big Theta notation mathematically, and why does this distinction matter in an interview?
- What steps are involved in translating a recursive algorithm into a recurrence relation and solving it using the Master method or recursion trees?

Sources:
- [OpenDSA Algorithm Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)
- [MIT OCW Lecture 2: Asymptotic Notation and Recurrences](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)

# Concise interview answers
- **Worst-case vs. Amortized Cost**: Worst-case cost is the maximum resource consumed over inputs in the stated size class (for an operation, over its allowed states/inputs). Amortized cost bounds the average resource consumption per operation over a *sequence* of operations, even if individual operations vary wildly in cost.
- **Big O vs. Big Theta**: Big O notation ($\mathcal{O}$) provides an *upper bound* on growth rate (within a constant factor for large inputs). Big Theta notation ($\Theta$) provides a *tight bound*, meaning it is both an upper and a lower bound. In interviews, stating $\Theta$ shows a more precise understanding than $\mathcal{O}$ if the lower bound matches.
- **Solving Recurrences**: To analyze recursive code, first define input size and express the work as a recurrence relation with a base case. Then, apply a solving technique such as the substitution method, iteration method, recursion tree method, or Master method to find a closed-form solution.

Sources:
- [OpenDSA Algorithm Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)
- [MIT OCW Lecture 2: Asymptotic Notation and Recurrences](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)

# Deep follow-up answers
- **Why do we drop constants and lower-order terms?** Asymptotic analysis focuses on how resource consumption scales as the input size grows toward infinity. Constant multipliers (like hardware differences or minor implementation details) and lower-order terms become insignificant compared to the dominant growth term.
- **How do recursion depth and auxiliary space relate?** When analyzing auxiliary space for recursive algorithms, recursion depth determines the maximum height of the call stack active at any single moment. Multiplying the maximum stack depth by the memory allocated per stack frame yields the auxiliary space contributed by recursion.
- **What are the three main approaches to amortized analysis?** The aggregate method computes total cost over $n$ operations and divides by $n$. The accounting method assigns prepayment credits to cheap operations to pay for expensive ones later. The potential method defines a potential function that maps data structure states to stored energy, balancing accumulated savings against actual costs.

Sources:
- [OpenDSA Algorithm Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)
- [MIT OCW Design and Analysis of Algorithms Lecture 11](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/83b82d45beb3776da72b7f3e1b3f42df_MIT6_046JS12_lec11.pdf)

# Scenario questions
- **Scenario 1**: You are interviewing for a data-streaming system where an internal array-backed list occasionally resizes by doubling its capacity, taking linear time, while regular appends take constant time. How would you explain the cost of appends to a skeptical engineering lead?
  - *Answer*: Explain that while a single resize operation takes worst-case linear time ($\mathcal{O}(n)$), the amortized cost per append is $\mathcal{O}(1)$ because expensive resizes happen infrequently enough that their cost is distributed across many cheap appends.
- **Scenario 2**: An engineer claims their recursive divide-and-conquer function is fast because it divides the input in half, but they cannot prove its complexity. How do you guide them to analyze it?
  - *Answer*: Ask them to first identify the input-size measure and resource measure. Guide them to write a recurrence relation capturing the work done at the current level plus the recursive calls, ensure a base case is defined, and select an appropriate solver like the Master method or recursion tree method.

Sources:
- [OpenDSA Algorithm Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)
- [MIT OCW Lecture 2: Asymptotic Notation and Recurrences](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)

# Tradeoffs and alternatives
- **Best-case cost vs. Worst-case cost**: Best-case cost describes the minimum resources used for favorable inputs, which can be misleading because real-world inputs are rarely optimal. Worst-case cost guarantees an upper limit, protecting systems against malicious or pathological inputs, but can lead to overly pessimistic design if the worst case is exceptionally rare.
- **Average-case cost vs. Amortized cost**: Average-case cost assumes a probability distribution over all possible inputs of size $n$. Amortized cost evaluates a worst-case *sequence* of operations without requiring probability distributions, ensuring that total cost over time is bounded.
- **Big O notation vs. Big Theta notation**: Big O specifies an upper bound (growth rate is less than or equal to a function), whereas Big Theta specifies a tight bound (growth rate matches a function within constant factors both above and below). Using Big O is safer when the lower bound is unknown or messy, but Big Theta provides maximum precision.
- **Recurrence relation vs. Closed-form solution**: A recurrence relation expresses runtime recursively using smaller subproblems and base cases, which is easy to write by inspection of code. A closed-form solution expresses the cost directly as a function of input size without recursion, making it much easier to evaluate quickly for large inputs.
- **Substitution method vs. Recursion tree method vs. Master method**: The substitution method requires guessing a bound and proving it via mathematical induction (powerful, but requires a good guess). The recursion tree method visualizes work level-by-level to sum total cost (intuitive for divide-and-conquer). The Master method provides a cookbook formula for recurrences of a specific standard form, but fails if the recurrence does not match its exact structural requirements.

Sources:
- [OpenDSA Algorithm Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)
- [MIT OCW Lecture 2: Asymptotic Notation and Recurrences](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)

# Common weak answers
- *Weak answer*: "Amortized cost means the average running time of an algorithm over many runs."
  - *Correction*: Amortized cost refers to the average cost *per operation over a sequence of operations* on a data structure, not separate runs of an algorithm.
- *Weak answer*: "Big O is the worst-case running time."
  - *Correction*: Big O is an asymptotic upper bound. It can describe best, average, or worst-case bounds depending on what function is being bounded.
- *Weak answer*: "I don't need a base case for my recurrence relation because the input size is always large enough."
  - *Correction*: Without a base case, a recurrence is mathematically undefined and infinite, failing to anchor the bottom of the recursive work.

Sources:
- [OpenDSA Algorithm Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)
- [MIT OCW Lecture 2: Asymptotic Notation and Recurrences](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)

# Self-check rubric
- Can you clearly differentiate between an upper bound ($\mathcal{O}$), lower bound ($\Omega$), and tight bound ($\Theta$)?
- Do you understand the distinction between per-operation worst-case cost and amortized cost across a sequence of operations?
- Can you set up a recurrence relation with a base case and explain at least one solving method (such as recursion trees or the Master method)?
- Are you able to explain auxiliary space by accounting for recursion depth and stack frames?

Sources:
- [OpenDSA Algorithm Analysis](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html)
- [MIT OCW Lecture 2: Asymptotic Notation and Recurrences](https://ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/resources/lecture-2-asymptotic-notation-recurrences-substitution-master-method/index.html)
