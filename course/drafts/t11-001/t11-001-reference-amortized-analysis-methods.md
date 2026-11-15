<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# algorithm cost models, asymptotic bounds, recurrences, and amortized analysis — Reference: Amortized analysis methods

*This is an automatically generated draft.*

# Scope and version
This lesson covers the three primary techniques used for amortized analysis: the Aggregate method, the Accounting method, and the Potential method. These concepts are timeless foundations of algorithm analysis, with references verified as of 2026-11-14 based on OpenDSA and MIT OpenCourseWare materials.

# How this group fits the mental model
When analyzing algorithms, we often look at the "worst-case" cost of a single operation. However, some operations are expensive only occasionally. Amortized analysis allows us to spread the cost of these infrequent, expensive operations over a sequence of many operations. This provides a more accurate picture of the total performance of a data structure over time. The three methods listed below are different mathematical approaches to calculating this "average cost per operation" over a worst-case sequence.

# Supplied names explained

* `Aggregate method`: This method calculates the total cost of a sequence of $n$ operations and divides that total by $n$. It treats the sequence as a whole rather than looking at individual operations, providing an average cost per operation across the entire sequence.
* `Accounting method`: Also known as the "banker's method," this approach assigns a fixed "amortized cost" to each operation. If an operation's actual cost is less than its amortized cost, the surplus is saved as "credit" in a bank account. When an expensive operation occurs, the accumulated credit is used to pay for the excess cost, ensuring the account balance never drops below zero.
* `Potential method`: This is a more formal, physics-inspired approach. We define a "potential function" that represents the "stored energy" of the data structure. The amortized cost of an operation is defined as the actual cost plus the change in potential. If the potential function is chosen correctly, it accounts for the expensive operations by releasing stored potential.

# Cross-item comparison

* **Aggregate vs. Accounting**: The Aggregate method is a "top-down" approach that looks at the total cost of the entire sequence. The Accounting method is a "bottom-up" approach that assigns specific costs to individual operations to ensure the total cost remains bounded.
* **Accounting vs. Potential**: Both methods allow for individual operation analysis. The Accounting method uses the intuitive metaphor of a bank account (credits), while the Potential method uses a formal mathematical function (potential) to track the state of the data structure.
* **General**: All three methods aim to prove that the total cost of $n$ operations is $O(n \cdot f(n))$, where $f(n)$ is the amortized cost per operation.

# Examples

Imagine a dynamic array that doubles its size when full.
* **Aggregate**: If we perform $n$ insertions, the total cost is $O(n)$ because the expensive "doubling" operations happen rarely enough that the total work is linear. Thus, the amortized cost is $O(1)$.
* **Accounting**: We charge each insertion a cost of 3. One unit pays for the immediate insertion, and two units are stored as credit. When the array is full, the stored credits pay for the expensive copying of elements.
* **Potential**: We define a potential function $\Phi$ based on the number of elements currently in the array. As the array fills, $\Phi$ increases. When the array doubles, the sudden drop in $\Phi$ covers the cost of copying the elements.

# Common mistakes

* **Confusing Amortized with Average**: Amortized analysis is not the same as average-case analysis. Amortized analysis guarantees the average performance of a sequence of operations in the *worst case*, whereas average-case analysis depends on the probability distribution of the inputs.
* **Negative Potential**: In the Potential method, a common error is choosing a function that can become negative. The potential function must be defined such that it is always greater than or equal to the initial potential (usually starting at zero).
* **Ignoring the Sequence**: Trying to apply these methods to a single, isolated operation is incorrect; they are specifically designed for sequences of operations.

# Knowledge checks with answers

1. **Question**: Which method uses the metaphor of a bank account to pay for future expensive operations?
   * **Answer**: The Accounting method.
2. **Question**: If you want to calculate the total cost of a sequence of $n$ operations and divide by $n$, which method are you using?
   * **Answer**: The Aggregate method.
3. **Question**: True or False: Amortized analysis relies on the probability of input distribution.
   * **Answer**: False. Amortized analysis provides a worst-case guarantee for a sequence of operations, regardless of input distribution.

*Sources: [OpenDSA](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/AnalAsymptotic.html), [MIT OCW Lecture 11](https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2012/83b82d45beb3776da72b7f3e1b3f42df_MIT6_046JS12_lec11.pdf)*
