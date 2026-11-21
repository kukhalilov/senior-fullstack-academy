# solve, explain, test, and analyze algorithm problems — Big-picture orientation and mental model

## Problem and purpose

Solving an algorithm problem is a sequence of linked decisions: understand the contract, select an approach that fits the constraints, prove it, implement it, test the boundaries, and explain its cost. A correct-looking snippet without this chain can silently solve a different task or fail beyond the example.

## Plain-language mental model

Treat the prompt as a specification to verify. Before coding, say what enters, what must come out, and which details can change the answer. Then choose the simplest correct baseline, use constraints to judge whether it is fast enough, and improve it while preserving a clear invariant.

Examples help you see behavior; tests try to break your assumptions; proof explains why all valid inputs work. Complexity explains whether the method fits the input size. None of these replaces the others.

## How the parts fit together

1. Restate the input, output, and objective.
2. Clarify ambiguity around empty input, duplicates, ordering, mutation, numeric limits, and output size.
3. Work a small example by hand and identify the state that changes.
4. Build a brute-force baseline or exact oracle where feasible.
5. Select a data structure and pattern based on operations and constraints.
6. State and prove an invariant, including initialization, preservation, and termination.
7. Test boundaries, adversarial cases, and small random cases against the oracle.
8. Analyze worst-case time and auxiliary space, then communicate the tradeoffs.

## Concept map

| Stage | Evidence to produce |
| --- | --- |
| Understand | Precise contract and constraints |
| Derive | State, choices, and baseline |
| Prove | Invariant or induction argument |
| Implement | Code that maintains the proved state |
| Test | Examples, boundaries, adversarial and differential checks |
| Analyze | Dominant operation count and memory |
| Explain | Contract, algorithm, proof, complexity, and limitations |

## End-to-end walkthrough

Suppose the task is to decide whether an integer array contains a duplicate. Clarify that an empty or one-element array returns false and that input order should be preserved. A brute-force baseline compares every pair in O(n²). If n can be large, maintain a set of values already seen: before adding x, if x is already present, return true. The invariant is that the set contains exactly the distinct values in the processed prefix. It starts empty, each new nonduplicate value is added, and termination after processing all elements proves no duplicate exists. Test empty, one value, all equal, duplicate at first and last positions, and a large all-distinct input. The hash-based expected time is O(n), with O(n) auxiliary space; worst-case claims depend on the collection's hashing guarantees.

## When to use it and tradeoffs

This process applies to coding interviews, contest problems, and code reviews. A brute-force baseline can make correctness obvious and serve as a test oracle, but may not fit the input bounds. Optimization should target the dominant cost without obscuring the contract or invariant.

## What later lessons cover

References give checklists for contract clarification, derivation and proof, implementation and tests, and complexity and communication. The practice lesson applies the process to duplicate detection and maximum subarray sum; the interview lesson turns the same evidence into a concise explanation.

Sources: [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp), [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf), [Testing in .NET](https://learn.microsoft.com/en-us/dotnet/core/testing/).
