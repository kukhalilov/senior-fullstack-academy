# solve, explain, test, and analyze algorithm problems — Interview questions and reasoning

## Core questions

1. How do you restate a problem before coding?
2. Which clarifying questions are worth asking?
3. Why write a brute-force solution if it is too slow?
4. What makes a loop invariant useful?
5. How do you choose edge and adversarial tests?
6. What is the difference between expected and amortized complexity?
7. How do you explain an optimization without overclaiming?

## Concise interview answers

- Restate the inputs, required output, objective, constraints, and side effects in precise terms.
- Ask about unspecified behavior that changes correctness: empty inputs, duplicates, ordering, mutation, numeric range, or ties.
- A baseline clarifies the search space, proves feasibility of the approach, and can serve as a small-instance oracle.
- An invariant precisely describes the processed state and must imply the answer when the algorithm terminates.
- Use minimal boundaries, adversarial arrangements, and small differential cases against a simpler exact method.
- Expected complexity relies on a probability/hash model; amortized complexity bounds the total over an operation sequence.
- State the key data structure, invariant, proof idea, bounds, assumptions, and tradeoffs.

## Deep follow-up answers

### How do you move from a prompt to an algorithm?

Identify the contract and bounds first. Work a small example, write a direct baseline, and estimate its dominant operation count. If it is too slow, identify repeated work or a useful ordering/state summary and choose a data structure that supports the necessary operations. Prove the new invariant before treating the code as correct.

### What makes an invariant strong enough?

It must be precise, checkable from code state, true initially, preserved by every update, and useful at termination. For duplicate detection, the seen set contains exactly distinct values from the processed prefix. For maximum subarray, one state means best range ending at the current index while another means best over the full processed prefix. Vague statements such as “the answer is up to date” do not explain either.

### How do you use a brute-force oracle?

Keep the reference implementation simple and independent from the optimized structure. Generate small valid inputs, compare outputs under the same contract, record the random seed, and retain any mismatch as a regression test. The oracle is only trusted if its logic is itself clear; differential agreement does not prove either implementation for all inputs.

### How do you handle complexity precisely?

Count the dominant operations as functions of every relevant input dimension. Include sorting, heap operations, map operations, table transitions, and required output construction. Qualify hash-table bounds as expected when the guarantee depends on hashing. Use amortized bounds only when describing a sequence and naming the amortization argument.

### How do tests relate to proof?

Tests can expose bugs and refute incorrect assumptions. A proof explains why the algorithm works for every valid input. State both honestly: “I tested these cases and can prove the invariant,” rather than treating test coverage as a proof.

## Scenario questions

### The sample passes, but empty input fails.

Check whether empty input is allowed and what its contract says. If allowed, add an explicit base case and test it. If excluded, document that the implementation relies on the stated nonempty precondition rather than silently broadening or narrowing the contract.

### A solution sorts the array, but the output requires original order.

The sort violates a side-effect/order requirement unless it sorts a copy and still reconstructs the required result. Reconsider a set, map, or index-based approach and state its space tradeoff.

### The optimized solution disagrees with brute force on a random input.

Record the seed and input, minimize the case, compare both implementations to the contract, then identify which invariant or baseline assumption failed. Add the minimized input as a regression test before changing the algorithm.

### A hash-set solution is described as worst-case linear.

Qualify the operation model. Typical hash-table operations give expected constant time, hence expected linear total time; a deterministic worst-case claim needs stronger implementation guarantees or a different data structure.

## Tradeoffs and alternatives

- Brute force is often easiest to reason about and is valuable as a small oracle; it may not meet production bounds.
- Sorting can enable a linear scan but costs O(n log n) and may affect input order or require a copy.
- Hashing gives expected fast membership with extra memory and hash assumptions.
- Dynamic programming retains alternatives and reuses states; greedy discards alternatives but requires a safe-choice proof.
- Property and differential tests broaden coverage; formal reasoning covers cases tests cannot exhaust.

## Common weak answers

- Repeating the prompt without stating the objective or edge behavior.
- Coding immediately and assuming unspecified input behavior.
- “It is O(n)” without naming the repeated operation or expected hashing.
- Giving a sample trace instead of a correctness argument.
- Saying “I tested thoroughly” without naming adversarial cases or an oracle.
- Ignoring input mutation, output size, or intermediate numeric overflow.

## Self-check rubric

Score each item 0 (missing), 1 (partial), or 2 (clear and correct):

- Restates input/output and important constraints.
- Identifies ambiguity that could affect correctness.
- Presents a baseline and explains why the chosen method fits the bounds.
- States and proves an invariant, recurrence, or other correctness argument.
- Names boundary, adversarial, and differential tests.
- Distinguishes worst-case, expected, amortized, auxiliary, input, and output costs.
- States alternatives, tradeoffs, and evidence limits accurately.

Sources: [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp), [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf), [Testing in .NET](https://learn.microsoft.com/en-us/dotnet/core/testing/).
