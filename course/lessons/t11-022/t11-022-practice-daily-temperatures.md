# monotonic stacks and monotonic queues — Problem: Daily Temperatures

## Goals
- Interpret a next-greater query as an unresolved index waiting for a future answer.
- Use a decreasing stack of indices and retain equal temperatures.
- Explain why each index is pushed and popped at most once.

## Problem statement
For each day, return the number of days until a strictly warmer temperature. If no later day is warmer, return 0 for that day.

## Input constraints
- `1 <= temperatures.Length <= 100,000`.
- `30 <= temperatures[i] <= 100`.

## Examples with expected output
- `[73,74,75,71,69,72,76,73] -> [1,1,4,2,1,1,0,0]`.
- `[30,40,50,60] -> [1,1,1,0]`.
- `[30,60,90] -> [1,1,0]`.

## Clarifying assumptions
- “Warmer” means strictly greater; equal values do not answer a query.
- The result stores a distance in days, not the warmer temperature.
- Unresolved indices keep default answer 0.

## Progressive hints
1. Brute force checks all later days for each i, O(n²).
2. Keep indices whose warmer day has not been found.
3. When the current temperature is greater than a stack-top temperature, it is the first warmer day for that top index.
4. Pop while the comparison is strict `>`; equal temperatures remain unresolved.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static int[] DailyTemperatures(int[] temperatures)
    {
        int[] answer = new int[temperatures.Length];
        var unresolved = new Stack<int>();
        for (int day = 0; day < temperatures.Length; day++)
        {
            while (unresolved.Count > 0 && temperatures[day] > temperatures[unresolved.Peek()])
            {
                int earlierDay = unresolved.Pop();
                answer[earlierDay] = day - earlierDay;
            }
            unresolved.Push(day);
        }
        return answer;
    }

    static void Check(int[] expected, int[] input)
    {
        if (!expected.SequenceEqual(DailyTemperatures(input)))
            throw new InvalidOperationException("Daily Temperatures check failed.");
    }

    static void Main()
    {
        Check(new[] { 1,1,4,2,1,1,0,0 }, new[] { 73,74,75,71,69,72,76,73 });
        Check(new[] { 1,1,1,0 }, new[] { 30,40,50,60 });
        Check(new[] { 1,1,0 }, new[] { 30,60,90 });
        Check(new[] { 0,0,0 }, new[] { 70,70,70 });
        Check(new[] { 1,0 }, new[] { 90,100 });
        Console.WriteLine("Daily Temperatures checks passed.");
    }
}
```

## Correctness argument
Before processing day d, the stack contains exactly earlier indices that have not yet encountered a strictly warmer day, in decreasing temperature order from bottom to top. When the current temperature exceeds the top, it is the first warmer day for that index because all intervening days have already been processed and failed to be warmer. The current day is therefore the correct nearest answer. Pop all such indices, then push d as unresolved. Any index left after the scan has no warmer future day and correctly keeps zero.

## Step-by-step dry run
For `[73,74,75]`, push index 0. At 74, pop 0 and set answer 1, then push 1. At 75, pop 1 and set answer 1, then push 2. Index 2 remains unresolved and its answer is 0.

## Time complexity
O(n): every day is pushed once and popped at most once.

## Space complexity
O(n) for the answer and unresolved-index stack; auxiliary stack space is O(n).

## Alternatives and tradeoffs
- Brute-force scanning is O(n²), but direct and useful as a small-input oracle.
- A right-to-left monotonic stack can also find the next warmer position by discarding candidates that are not warmer than the current value.
- A bounded temperature range can support specialized next-position scans, but the index stack generalizes to arbitrary values.

## Common mistakes and gotchas
- Popping equal temperatures even though the condition is strictly warmer.
- Storing values but losing the original day needed for the distance.
- Assuming the remaining stack is a list of answers; those positions must remain zero.
- Claiming worst-case O(1) for each day; one day may pop many indices.

## Edge-case tests
- Monotonically increasing and decreasing sequences.
- Equal temperatures only.
- One element.
- A warmer day exactly at the final position.

## Reflection questions
1. Why is the current day the nearest warmer day for each popped index?
2. What does stack order say about unresolved temperatures?
3. How would a right-to-left version differ?

## Source
- [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
