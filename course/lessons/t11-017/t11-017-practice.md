# solve, explain, test, and analyze algorithm problems — Exercises and worked solutions

## Goals

- Turn a short statement into a precise contract.
- Compare an understandable brute-force baseline with an optimized method.
- State and prove invariants before relying on code.
- Use edge tests and deterministic differential checks.
- Explain time and auxiliary space accurately.

## Worked example

### Exercise A: detect any repeated value

Contract: given an integer array, return true if two distinct positions hold the same value. Empty input returns false; input order must remain unchanged.

Baseline: compare every pair. If n=4, the candidate pairs are (0,1), (0,2), (0,3), (1,2), (1,3), and (2,3), so worst-case work is n(n-1)/2 = O(n²).

Improved method: maintain values seen so far. Before processing each x, if x is already present, return true; otherwise add it. The invariant is that the set equals the distinct values in the processed prefix. This takes expected O(n) time and O(n) auxiliary space under the usual hash-set model.

### Exercise B: maximum nonempty subarray sum

Contract: given a nonempty integer array, return the largest sum of any contiguous nonempty range.

For [−2,1,−3,4,−1,2,1,−5,4], an optimum is [4,−1,2,1] with sum 6. The quadratic baseline enumerates every start and extends every possible end. Kadane's recurrence keeps the best range ending at the current position: either start at the current value or extend the previous ending range. Its invariant is that this state is exact for the current endpoint; a second value tracks the best over all processed endpoints.

## Exercises

1. Implement both pairwise and hash-set duplicate detection. State behavior for empty input, preserve the input, and compare costs.
2. Implement both quadratic and linear maximum-subarray algorithms. The subarray must be nonempty; explain how initialization handles all-negative values.
3. Add a deterministic differential test that compares each optimized method with its brute-force baseline over many small generated inputs.
4. For each method, name one test that targets a likely bug and state the invariant or property it checks.

## Progressive hints

1. Write the exact return behavior for empty and one-element inputs before coding.
2. Use a simple baseline as a small-input oracle.
3. For duplicate detection, define the set's contents at the start of each loop iteration.
4. For maximum subarray, distinguish “best ending here” from “best anywhere so far.”
5. Use fixed-seed random generation so any failure can be reproduced.

## Complete solutions

```csharp
using System;
using System.Collections.Generic;

static class Program
{
    static bool ContainsDuplicateBrute(int[] values)
    {
        for (int i = 0; i < values.Length; i++)
            for (int j = i + 1; j < values.Length; j++)
                if (values[i] == values[j]) return true;
        return false;
    }

    static bool ContainsDuplicateFast(int[] values)
    {
        var seen = new HashSet<int>();
        foreach (int value in values)
            if (!seen.Add(value)) return true;
        return false;
    }

    static long MaxSubarrayBrute(int[] values)
    {
        if (values.Length == 0) throw new ArgumentException("A nonempty array is required.", nameof(values));
        long best = long.MinValue;
        for (int start = 0; start < values.Length; start++)
        {
            long sum = 0;
            for (int end = start; end < values.Length; end++)
            {
                sum += values[end];
                best = Math.Max(best, sum);
            }
        }
        return best;
    }

    static long MaxSubarrayLinear(int[] values)
    {
        if (values.Length == 0) throw new ArgumentException("A nonempty array is required.", nameof(values));
        long endingHere = values[0];
        long best = values[0];
        for (int i = 1; i < values.Length; i++)
        {
            endingHere = Math.Max(values[i], endingHere + values[i]);
            best = Math.Max(best, endingHere);
        }
        return best;
    }

    static void Check(bool condition, string message)
    {
        if (!condition) throw new Exception(message);
    }

    static void Check(long expected, long actual, string message)
    {
        if (expected != actual) throw new Exception(message + $" Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(!ContainsDuplicateFast(Array.Empty<int>()), "Empty input has no duplicate.");
        Check(!ContainsDuplicateFast(new[] { 7 }), "One item has no duplicate.");
        Check(ContainsDuplicateFast(new[] { 4, 4 }), "Repeated values must be detected.");
        Check(!ContainsDuplicateFast(new[] { -2, 0, 3 }), "Distinct values must remain distinct.");

        Check(6, MaxSubarrayLinear(new[] { -2, 1, -3, 4, -1, 2, 1, -5, 4 }), "Sample maximum sum mismatch.");
        Check(-2, MaxSubarrayLinear(new[] { -8, -2, -5 }), "All-negative maximum mismatch.");
        Check(5, MaxSubarrayLinear(new[] { 5 }), "Single-element maximum mismatch.");
        Check(0, MaxSubarrayLinear(new[] { -1, 0, -2 }), "Zero-valued maximum mismatch.");

        var random = new Random(1729);
        for (int trial = 0; trial < 500; trial++)
        {
            int length = random.Next(0, 9);
            var sample = new int[length];
            for (int i = 0; i < length; i++) sample[i] = random.Next(-4, 5);

            Check(
                ContainsDuplicateBrute(sample) == ContainsDuplicateFast(sample),
                "Duplicate methods disagree.");
            Check(
                ContainsDuplicateFast(sample) == (new HashSet<int>(sample).Count < sample.Length),
                "Duplicate property failed.");

            if (length > 0)
                Check(
                    MaxSubarrayBrute(sample) == MaxSubarrayLinear(sample),
                    "Maximum-subarray methods disagree.");
        }
        Console.WriteLine("Problem-solving workflow exercises passed.");
    }
}
```

The maximum-subarray method uses long accumulators so sums are not limited to Int32 when the input length is larger. The duplicate method does not mutate its input. The fixed random seed makes differential failures reproducible.

## Tests and edge cases

- Duplicate detection: empty, one element, two equal values, all equal, sorted distinct, duplicate only at the final position.
- Maximum subarray: one value, all negative, all zero, best range at the start/end, best range strictly inside, alternating large positive/negative values.
- Differential tests: test only nonempty samples for maximum subarray because its contract rejects empty input; allow empty samples for duplicate detection.
- Property check: duplicate detection is true exactly when the number of distinct values is less than array length.
- Assertion behavior: every mismatch throws so the process exits unsuccessfully instead of merely logging.

## Reflection questions

1. What exact prefix does the seen set represent before each duplicate check?
2. Why must the maximum subarray be nonempty, and how does the initialization enforce it?
3. What is the dominant operation in each brute-force method?
4. What assumptions support expected O(n) for HashSet-based duplicate detection?
5. How would the contract and algorithm change if the maximum subarray could wrap from the end to the beginning?

Sources: [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp), [Testing in .NET](https://learn.microsoft.com/en-us/dotnet/core/testing/).
