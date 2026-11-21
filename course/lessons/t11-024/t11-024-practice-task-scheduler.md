# binary heaps and priority queues — Problem: Task Scheduler

## Goals
- Choose among currently available task types by remaining frequency.
- Model cooldown readiness with a FIFO queue.
- Prove why selecting the most frequent available task is optimal.

## Problem statement
Given a list of uppercase task labels and a nonnegative cooldown `n`, execute one task per interval or leave an interval idle. Two executions of the same label must have at least `n` intervals between them. Return the smallest total number of intervals needed.

## Input constraints
- `1 <= tasks.Length <= 10,000`.
- Each label is an uppercase English letter `A` through `Z`.
- `0 <= n <= 100`.

## Examples with expected output
- `tasks=[A,A,A,B,B,B], n=2 -> 8`.
- `tasks=[A,C,A,B,D,B], n=1 -> 6`.
- `tasks=[A,A,A,B,B,B], n=3 -> 10`.
- `tasks=[A,A,A], n=0 -> 3`.

## Clarifying assumptions
- An interval at time `t` running a task makes that same task available again at `t+n+1`.
- Idle intervals count toward the answer, but can be skipped in the simulation by jumping to the next ready time when no task is available.
- A max-heap is used for remaining counts. Since there are only 26 possible task types, a simple scan is also efficient and arguably simpler; the heap demonstrates dynamic priority selection.

## Progressive hints
1. Count remaining occurrences by label.
2. At each time, schedule the available label with the largest remaining count.
3. Keep cooling labels in a FIFO queue ordered by their ready times.
4. If no label is available, jump directly to the next ready time rather than simulate each idle interval.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int LeastInterval(char[] tasks, int cooldown)
    {
        var remaining = new int[26];
        foreach (char task in tasks) remaining[task - 'A']++;

        var available = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
        for (int letter = 0; letter < 26; letter++)
            if (remaining[letter] > 0) available.Enqueue(letter, remaining[letter]);

        var cooling = new Queue<(int ReadyAt, int Letter)>();
        int time = 0;
        while (available.Count > 0 || cooling.Count > 0)
        {
            if (available.Count == 0 && cooling.Count > 0)
                time = Math.Max(time, cooling.Peek().ReadyAt);

            while (cooling.Count > 0 && cooling.Peek().ReadyAt <= time)
            {
                var ready = cooling.Dequeue();
                available.Enqueue(ready.Letter, remaining[ready.Letter]);
            }

            if (available.Count == 0) continue;

            int letterToRun = available.Dequeue();
            remaining[letterToRun]--;
            time++;
            if (remaining[letterToRun] > 0)
                cooling.Enqueue((time + cooldown, letterToRun));
        }
        return time;
    }

    static void Check(int expected, string tasks, int cooldown)
    {
        int actual = LeastInterval(tasks.ToCharArray(), cooldown);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(8, "AAABBB", 2);
        Check(6, "ACABDB", 1);
        Check(10, "AAABBB", 3);
        Check(3, "AAA", 0);
        Check(13, "AAAA", 3);
        Check(6, "AABBCC", 2);
        Console.WriteLine("Task Scheduler checks passed.");
    }
}
```

## Correctness argument
At every time, the available heap contains exactly tasks that may legally run now, prioritized by remaining count; the cooldown queue contains tasks with remaining work ordered by their next legal time. Running the available task with greatest remaining count is the greedy exchange choice: postponing a more frequent available task in favor of a less frequent one cannot reduce the future idle demand, since the more frequent task still needs at least as many future slots and may impose the same cooldown. If no task is available, every legal schedule must wait until the earliest cooldown expires, so jumping to that time loses no feasible work. Together these choices produce a minimum schedule.

## Step-by-step dry run
For `AAABBB` with cooldown 2: run A at time 0, B at 1, idle at 2, A at 3, B at 4, idle at 5, A at 6, B at 7. Each repeated label has two full intervals between executions, for eight intervals total.

## Time complexity
O(T log 26) heap operations for T tasks, plus at most O(T+n) time advancement if idle times were simulated. This implementation jumps over idle gaps, so its loop runs O(T) task executions and at most O(T) jumps; the queue operations are O(log 26), effectively constant for this fixed alphabet.

## Space complexity
O(26) counts, heap entries, and cooldown records.

## Alternatives and tradeoffs
- The closed form is `max(T, (fmax-1)*(n+1)+countMax)`, where `fmax` is the largest label count and `countMax` is the number of labels tied at that count. It is compact but needs a separate derivation.
- Scanning 26 counters each step avoids heap setup and remains O(26T), also effectively O(T).
- A general event simulation is appropriate when task types are numerous or cooldown durations differ.

## Common mistakes and gotchas

- Using `time+n` instead of `time+n+1` as the next legal time; that leaves only n-1 intervening intervals.
- Returning only task count and forgetting necessary idle intervals.
- Idling even though an eligible task exists.
- Releasing cooling tasks before the end of a just-scheduled interval without consistent time semantics.
- Claiming a heap is asymptotically important with only 26 task types; here it is mainly a pattern demonstration.
- Multiplying in a narrow integer type in the formula variant; use a type that safely holds the product for the actual constraints.

## Edge-case tests

- Cooldown zero.
- One label only with long cooldown.
- Many labels tied for maximum count.
- More distinct labels than the cooldown window can block.

## Reflection questions

1. Why is a task ready at `t+n+1` after running at time t?
2. Why can an idle gap be skipped to the earliest ready time?
3. Why is a fixed 26-entry scan a reasonable alternative to a heap?

## Source
- [Task Scheduler](https://leetcode.com/problems/task-scheduler/)
