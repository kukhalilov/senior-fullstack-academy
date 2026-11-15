<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# threads thread pool synchronization primitives races and parallelism — Exercises and worked solutions

## Goals

Practice identifying the invariant before selecting a primitive, replacing shared updates with local aggregation, and bounding asynchronous concurrency without assuming that “more parallel” is always better. Try each exercise before opening its solution.

## Worked example

### Safely count completed items

**Goal:** Process an array concurrently and return how many items passed a predicate. Each input is independent; only the final count is shared.

An unsafe version would use `count++` from all iterations. Instead, use a local count per partition and combine it atomically:

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

static int CountEven(int[] values)
{
    int count = 0;
    Parallel.ForEach<int, int>(
        values,
        () => 0,
        (value, _, local) => local + (value % 2 == 0 ? 1 : 0),
        local => Interlocked.Add(ref count, local));
    return count;
}

int actual = CountEven(new[] { 1, 2, 4, 7, 8 });
if (actual != 3)
    throw new InvalidOperationException($"Expected 3, got {actual}.");
```

The per-iteration state is local to a partition, and only partition results update the shared total. The combine uses `Interlocked.Add`, so updates from different partition finalizers are atomic. For a small array, a serial loop may still be faster. The pattern uses the TPL's [data parallelism APIs](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/data-parallelism-task-parallel-library) and [`Interlocked`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.interlocked).

## Exercises

### Exercise 1: Repair a check-then-act race

Two request handlers both execute `if (accounts.ContainsKey(id)) accounts[id].Balance -= amount;`. Explain the race and propose a design that guarantees a withdrawal cannot make the balance negative. State the invariant and explain why protecting only the `Balance -= amount` expression might still be insufficient.

### Exercise 2: Choose an atomic operation or a lock

A worker updates a `long completed` counter. Another requirement says that each increment must also append the same sequence number to a list, and readers must never observe a list entry without its count update. Choose a design and explain why a single atomic increment is not sufficient.

### Exercise 3: Bound asynchronous requests

You need to fetch each URL asynchronously but must allow no more than six simultaneous requests because of a service limit. Explain why an unbounded `Task.WhenAll(urls.Select(FetchAsync))` may violate the limit. Sketch a `Parallel.ForEachAsync` call configured with maximum concurrency six and cancellation.

### Exercise 4: Detect lock-order inversion

Thread A acquires `customerLock` then `ledgerLock`. Thread B acquires `ledgerLock` then `customerLock`. Explain a possible deadlock interleaving and give two design remedies.

### Exercise 5: Choose serial or parallel

A method transforms 30 integers with a few arithmetic operations each. Another method processes millions of records where each item performs substantial independent CPU work. Which should you benchmark for parallel execution, and what measurements should decide?

## Progressive hints

1. Write down the withdrawal invariant. Which operation must be indivisible from checking the balance through applying the debit?
2. The counter and list form one invariant. What protects both as one transaction? Who else must use the same mechanism when reading?
3. `Parallel.ForEachAsync` accepts `ParallelOptions`; `MaxDegreeOfParallelism` is a cap. The body receives a cancellation token.
4. Draw each thread's held lock and awaited lock. A global order prevents the cycle.
5. Parallel overhead is proportionally larger for tiny workloads. Compare against the serial baseline under representative inputs.

## Complete solutions

### Solution 1

The check and debit are separate actions. Two handlers may both read a sufficient balance, then both subtract, yielding a negative balance. State the invariant as “balance is never negative, and each accepted withdrawal is applied exactly once.” Protect the balance check and update together under a per-account lock, or make the account a single-owner actor/message processor that serializes commands. If an operation also updates a ledger, protect both balance and ledger as one transaction or use a transactional storage mechanism. Locking only the subtraction is insufficient because the earlier check can become stale, and locking only in one code path does not protect readers/writers that bypass the protocol.

### Solution 2

Use a private lock around both increment and append, and require every reader that depends on their correspondence to use the same lock (or read an immutable snapshot made under that lock). The shared invariant spans two data structures; `Interlocked.Increment` can update the number atomically but cannot make the list append part of the same atomic operation. In high-throughput designs, a single consumer can own both values and process messages, avoiding multi-writer shared mutation.

```csharp
private readonly object gate = new();
private long completed;
private readonly List<long> sequenceNumbers = new();

void RecordCompletion()
{
    lock (gate)
    {
        long next = completed + 1;
        sequenceNumbers.Add(next);
        completed = next;
    }
}
```

The example uses one consistent lock protocol. Production code should decide behavior if list growth throws, because the order of mutations and recovery policy matter to the stated invariant.

### Solution 3

Create bounded asynchronous work rather than starting one task per URL:

```csharp
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

static Task FetchAllAsync(IEnumerable<Uri> urls, CancellationToken cancellationToken) =>
    Parallel.ForEachAsync(
        urls,
        new ParallelOptions
        {
            MaxDegreeOfParallelism = 6,
            CancellationToken = cancellationToken
        },
        async (url, token) => await FetchAsync(url, token));

static Task FetchAsync(Uri url, CancellationToken cancellationToken) => Task.CompletedTask;
```

`FetchAsync` is a stand-in for the real asynchronous request. The API bounds concurrent bodies; cancellation remains cooperative and the fetch operation must observe its token. A service's rate limit may also require request pacing over time, since a concurrency cap alone does not enforce requests per second. The method and option semantics are documented in [`Parallel.ForEachAsync`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel.foreachasync) and [`ParallelOptions.MaxDegreeOfParallelism`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.paralleloptions.maxdegreeofparallelism).

### Solution 4

One possible interleaving is: A acquires `customerLock`; B acquires `ledgerLock`; A waits for `ledgerLock`; B waits for `customerLock`. Each holds what the other needs, so neither can proceed. Remedies include enforcing one global order in every code path (for example, always customer then ledger) or redesigning to avoid holding both locks at once, such as a single owner or a transaction boundary. Timeouts can help detect and report a stuck acquisition but are not a substitute for consistent state handling.

### Solution 5

Keep the 30-element transformation serial unless measurement suggests otherwise; task scheduling and partitioning can exceed the work. Benchmark the millions-of-records case because expensive independent CPU work has a plausible opportunity for parallel speedup. Measure serial and parallel wall-clock time, throughput, CPU use, allocation, contention, and tail latency over representative data and repeated runs. Include cold-start/setup costs if they affect real use. Keep the simpler serial form if the gains are not material.

## Tests and edge cases

For Exercise 1, test simultaneous withdrawals whose sum exceeds the starting balance; exactly one should be accepted if that is the business rule. For Exercise 2, verify count/list correspondence under concurrent callers and define behavior for exceptions during list growth. For Exercise 3, instrument current in-flight requests and assert it never exceeds six; test cancellation before start and during active requests, plus an empty URL set. For Exercise 4, test all lock acquisition paths against the same global order and use timeouts in stress diagnostics. For Exercise 5, test empty and tiny inputs as well as production-scale distributions; avoid concluding from one run.

## Reflection questions

1. Which shared state could be replaced by ownership or immutable snapshots?
2. Which invariant does each synchronization primitive protect?
3. Are your waits bounded or cancellable, and what is the recovery policy?
4. What workload evidence would justify the added concurrency complexity?
5. Does any async operation occur while holding a thread-affine lock? If so, can the design be changed to avoid holding it across an await?
