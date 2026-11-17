<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Reference: Built-in .NET 10 and .NET 11 AsyncEnumerable operators and asynchronous enumeration

# Scope and version
This reference lesson covers the platform `AsyncEnumerable` operator surface introduced in .NET 10 and included in .NET 11. Use the `System.Linq.AsyncEnumerable` package when targeting earlier frameworks; individual newer APIs such as `FullJoin` may also be package-provided for .NET 10, so check target/package availability [https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/10.0/asyncenumerable](https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/10.0/asyncenumerable).

# How this group fits the mental model
In modern C#, Language Integrated Query (LINQ) provides a uniform vocabulary for filtering, transforming, joining, and aggregating sequences. `Enumerable` operators process synchronous enumeration, while `Queryable` operators pass expression trees to a provider that may translate or execute them. `IAsyncEnumerable<T>` supports asynchronous iteration with `await foreach`; the interface does not guarantee remote I/O or parallel work.

The supplied group of `AsyncEnumerable` operators and enumeration mechanics bridges asynchronous programming with LINQ composition. Instead of blocking a thread while waiting for network packets, file reads, or paginated database responses, async sequence operators compose transformations lazily. They evaluate asynchronously as items flow through the pipeline, supporting cooperative cancellation via `CancellationToken` and asynchronous resource cleanup via `IAsyncDisposable`.

# Supplied names explained
This reference catalog explains every assigned item in the `async-enumerable-operators` inventory group.

* `AsyncEnumerable.Where`: Filters an asynchronous sequence based on an asynchronous predicate delegate, returning elements that satisfy the condition.
* `AsyncEnumerable.Select`: Projects each element of an asynchronous sequence into a new form using a transform delegate.
* `AsyncEnumerable.SelectMany`: Projects each element of an asynchronous sequence to an `IAsyncEnumerable<T>` and flattens the resulting sequences into one async stream.
* `AsyncEnumerable.OfType`: Filters the elements of an asynchronous sequence based on a specified type, returning only items that match.
* `AsyncEnumerable.Cast`: Casts each element of a generic asynchronous sequence to the requested result type when that element is read; invalid casts fail during enumeration.
* `AsyncEnumerable.Distinct`: Returns distinct elements from an asynchronous sequence by using default equality comparison.
* `AsyncEnumerable.DistinctBy`: Returns distinct elements from an asynchronous sequence according to a key selection function.
* `AsyncEnumerable.Union`: Produces the set union of two asynchronous sequences using default equality.
* `AsyncEnumerable.UnionBy`: Produces the set union of two asynchronous sequences by applying a key extraction function.
* `AsyncEnumerable.Intersect`: Produces the set intersection of two asynchronous sequences.
* `AsyncEnumerable.IntersectBy`: Produces the set intersection of two asynchronous sequences by using a key extraction function.
* `AsyncEnumerable.Except`: Produces the set difference of two asynchronous sequences.
* `AsyncEnumerable.ExceptBy`: Produces the set difference of two asynchronous sequences by using a key extraction function.
* `AsyncEnumerable.Concat`: Concatenates two asynchronous sequences sequentially.
* `AsyncEnumerable.Append`: Appends a value to the end of an asynchronous sequence.
* `AsyncEnumerable.Prepend`: Adds a value to the beginning of an asynchronous sequence.
* `AsyncEnumerable.Zip`: Merges two asynchronous sequences by combining corresponding elements into tuples or pairs.
* `AsyncEnumerable.Chunk`: Splits the elements of an asynchronous sequence into chunks of a specified size.
* `AsyncEnumerable.Join`: Correlates the elements of two asynchronous sequences based on matching keys (inner join).
* `AsyncEnumerable.GroupJoin`: Correlates the elements of two asynchronous sequences based on matching keys and groups the results for each element.
* `AsyncEnumerable.LeftJoin`: Performs a left outer join across two asynchronous sequences, ensuring every element of the left sequence appears in the output.
* `AsyncEnumerable.RightJoin`: Performs a right outer join across two asynchronous sequences, ensuring every element of the right sequence appears in the output.
* `AsyncEnumerable.FullJoin`: Performs a full outer join across two asynchronous sequences, matching keys and retaining unmatched items from both sides. The API is included in .NET 11 and package-provided for .NET 10 [https://learn.microsoft.com/en-us/dotnet/api/system.linq.asyncenumerable.fulljoin].
* `AsyncEnumerable.Order`: Sorts the elements of an asynchronous sequence in ascending order using default comparers.
* `AsyncEnumerable.OrderDescending`: Sorts the elements of an asynchronous sequence in descending order.
* `AsyncEnumerable.OrderBy`: Sorts elements of an asynchronous sequence in ascending order by a key selector.
* `AsyncEnumerable.OrderByDescending`: Sorts elements of an asynchronous sequence in descending order by a key selector. This requires consuming the input before yielding the ordered output.
* `AsyncEnumerable.GroupBy`: Groups elements of an asynchronous sequence by key; producing groups requires consuming the input to determine their members.
* `AsyncEnumerable.ThenBy`: Performs a secondary ascending sort on an already ordered asynchronous sequence.
* `AsyncEnumerable.ThenByDescending`: Performs a secondary descending sort on an already ordered asynchronous sequence.
* `AsyncEnumerable.Reverse`: Reverses the order of elements in an asynchronous sequence (requires buffering elements).
* `AsyncEnumerable.Skip`: Bypasses a specified number of elements in an asynchronous sequence, then yields the remaining elements.
* `AsyncEnumerable.SkipLast`: Bypasses a specified number of elements from the end of an asynchronous sequence.
* `AsyncEnumerable.SkipWhile`: Bypasses elements in an asynchronous sequence as long as a specified condition is true, then yields the remaining elements.
* `AsyncEnumerable.Take`: Returns a specified number of contiguous elements from the start of an asynchronous sequence.
* `AsyncEnumerable.TakeLast`: Returns a specified number of contiguous elements from the end of an asynchronous sequence.
* `AsyncEnumerable.TakeWhile`: Returns elements from an asynchronous sequence as long as a specified condition is true.
* `AsyncEnumerable.DefaultIfEmpty`: Returns the elements of an asynchronous sequence, or a singleton default value if the sequence is empty.
* `AsyncEnumerable.AggregateAsync`: Applies an accumulator function over an asynchronous sequence asynchronously.
* `AsyncEnumerable.AggregateBy`: Computes aggregate states grouped by keys extracted from an asynchronous sequence.
* `AsyncEnumerable.CountBy`: Counts occurrences of items grouped by key across an asynchronous sequence.
* `AsyncEnumerable.CountAsync`: Asynchronously returns the number of elements in an asynchronous sequence.
* `AsyncEnumerable.LongCountAsync`: Asynchronously returns a 64-bit integer representing the total number of elements in a sequence.
* `AsyncEnumerable.SumAsync`: Computes the sum of numeric values in an asynchronous sequence.
* `AsyncEnumerable.AverageAsync`: Computes the average of numeric values in an asynchronous sequence.
* `AsyncEnumerable.MinAsync`: Finds the minimum value in an asynchronous sequence.
* `AsyncEnumerable.MinByAsync`: Finds the element with the minimum key value in an asynchronous sequence.
* `AsyncEnumerable.MaxAsync`: Finds the maximum value in an asynchronous sequence.
* `AsyncEnumerable.MaxByAsync`: Finds the element with the maximum key value in an asynchronous sequence.
* `AsyncEnumerable.AllAsync`: Determines whether all elements of an asynchronous sequence satisfy a condition.
* `AsyncEnumerable.AnyAsync`: Determines whether any element exists in an asynchronous sequence or satisfies a condition.
* `AsyncEnumerable.ContainsAsync`: Determines whether an asynchronous sequence contains a specified value.
* `AsyncEnumerable.SequenceEqualAsync`: Determines whether two asynchronous sequences are equal by comparing elements asynchronously.
* `AsyncEnumerable.FirstAsync`: Asynchronously returns the first element of a sequence.
* `AsyncEnumerable.FirstOrDefaultAsync`: Asynchronously returns the first element of a sequence, or a default value if no element is found.
* `AsyncEnumerable.LastAsync`: Asynchronously returns the last element of a sequence.
* `AsyncEnumerable.LastOrDefaultAsync`: Asynchronously returns the last element of a sequence, or a default value if empty.
* `AsyncEnumerable.SingleAsync`: Asynchronously returns the single element of a sequence, throwing an exception if the count is not one.
* `AsyncEnumerable.SingleOrDefaultAsync`: Asynchronously returns a single element or a default value, ensuring no more than one element exists.
* `AsyncEnumerable.ElementAtAsync`: Asynchronously returns the element at a specified index.
* `AsyncEnumerable.ElementAtOrDefaultAsync`: Asynchronously returns the element at a specified index or a default value if out of bounds.
* `AsyncEnumerable.Index`: Associates the zero-based index of each element in an asynchronous sequence with a tuple containing the index and item.
* `AsyncEnumerable.Range`: Generates an asynchronous sequence of sequential integers within a specified range.
* `AsyncEnumerable.Repeat`: Generates an asynchronous sequence that contains one repeated value a specified number of times.
* `AsyncEnumerable.Empty`: Returns an empty asynchronous sequence of a specified type.
* `AsyncEnumerable.ToArrayAsync`: Asynchronously creates an array from an asynchronous sequence.
* `AsyncEnumerable.ToListAsync`: Asynchronously creates a `List<T>` from an asynchronous sequence.
* `AsyncEnumerable.ToDictionaryAsync`: Asynchronously creates a dictionary from an asynchronous sequence according to key and element selector functions.
* `AsyncEnumerable.ToHashSetAsync`: Asynchronously creates a hash set from an asynchronous sequence.
* `AsyncEnumerable.ToLookupAsync`: Asynchronously creates a lookup structure (`ILookup<TKey, TElement>`) from an asynchronous sequence.
* `AsyncEnumerable.ForEachAsync`: Asynchronously executes a specified action on each element of an asynchronous sequence.
* `IAsyncEnumerator<T>.MoveNextAsync`: Advances the enumerator to the next element of the async sequence asynchronously, returning a `ValueTask<bool>`.
* `IAsyncEnumerator<T>.Current`: Gets the current element in the asynchronous sequence of type `T`.
* `IAsyncDisposable.DisposeAsync during async enumeration`: Asynchronously releases resources allocated during the iteration of an asynchronous stream, automatically invoked by `await foreach`.
* `TaskAsyncEnumerableExtensions.WithCancellation<T>`: Associates a `CancellationToken` with an `IAsyncEnumerable<T>` so cancellation signals propagate down the iteration pipeline.
* `ConfiguredCancelableAsyncEnumerable<T>`: A configured wrapper struct for an `IAsyncEnumerable<T>` that controls task continuation behavior (`ConfigureAwait`) and cancellation tokens.
* `WithCancellation token propagation`: The mechanism by which cooperative cancellation requests flow into async operators during asynchronous iteration.
* `AsyncEnumerable cancellationToken parameter`: Explicit cancellation parameters accepted by terminal or streaming operator overloads to handle cancellation safely.
* `TaskAsyncEnumerableExtensions.ConfigureAwait`: Configures how awaits are marshaled back to the original synchronization context during async iteration (similar to `Task.ConfigureAwait`).
* `System.Linq.AsyncEnumerable package versus built-in APIs`: .NET 10 introduced the platform `AsyncEnumerable` class. Use the `System.Linq.AsyncEnumerable` package for earlier target frameworks or for package-provided additions; this differs from older third-party `System.Linq.Async` packages, so check namespace, package, and target-framework compatibility when multitargeting [https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/10.0/asyncenumerable].

# Cross-item comparison
Within this assigned group of async operators, operations fall into distinct behavioral categories:
* **Streaming vs. Buffering Operators:** `Where` and `Select` can yield incrementally. Operations that require global ordering, such as `Reverse` and `OrderBy`, must consume the input before yielding results. Confirm buffering details for each operator and implementation.
* **Terminal Materialization vs. Deferred Composition:** Methods returning `IAsyncEnumerable<T>` (such as `AsyncEnumerable.Where` or `AsyncEnumerable.Skip`) use deferred execution and perform no work until iterated. Methods ending in `Async` or `ToList` (such as `AsyncEnumerable.ToListAsync` or `AsyncEnumerable.CountAsync`) are terminal operators that execute immediately when invoked.

# Examples
The following complete C# example demonstrates creating a custom asynchronous sequence, applying built-in `AsyncEnumerable` operators (`Where`, `Select`, and `ToListAsync`), and consuming the stream using `await foreach` with cooperative cancellation.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        using var cts = new CancellationTokenSource();

        // Generate an asynchronous sequence using Range and filtering operators
        IAsyncEnumerable<int> numbers = AsyncEnumerable.Range(1, 10);

        IAsyncEnumerable<string> processedStream = numbers
            .Where(n => n % 2 == 0)
            .Select(n => $"Processed value: {n * 10}");

        // Consume the stream asynchronously
        await foreach (var item in processedStream.WithCancellation(cts.Token))
        {
            Console.WriteLine(item);
        }

        // Materialize the stream into a List asynchronously
        List<string> resultList = await numbers
            .Select(n => n.ToString())
            .ToListAsync();

        Console.WriteLine($"Total materialized items: {resultList.Count}");
    }
}
```

Expected output:
```text
Processed value: 20
Processed value: 40
Processed value: 60
Processed value: 80
Processed value: 100
Total materialized items: 10
```

# Common mistakes
* **Confusing deferred async streams with immediate execution:** Forgetting that calling `AsyncEnumerable.Where` or `AsyncEnumerable.Select` does not execute queries immediately. Work only begins when `await foreach` runs or a terminal operator (like `ToListAsync`) is called.
* **Ignoring cooperative cancellation:** Neglecting to pass or propagate a `CancellationToken` via `.WithCancellation()` or operator parameters, which prevents long-running async streams from responding to cancellation signals.
* **Misunderstanding thread concurrency:** Assuming that `AsyncEnumerable` operators automatically run work in parallel across multiple CPU cores. Async streams manage asynchronous I/O and non-blocking waits, not automatic parallelization.

# Knowledge checks with answers
1. **Question:** What is the primary operational difference between `AsyncEnumerable.Where` and `AsyncEnumerable.ToListAsync`?
   **Answer:** `AsyncEnumerable.Where` returns a deferred `IAsyncEnumerable<T>` stream; `ToListAsync` starts consuming the source and returns `ValueTask<List<T>>`.
2. **Question:** Why do operators like `AsyncEnumerable.OrderBy` break pure streaming execution?
   **Answer:** Sorting requires examining all incoming elements to determine their relative ordering before the first element can be safely emitted, necessitating internal buffering.
3. **Question:** How do you bind a `CancellationToken` to an asynchronous sequence iteration in C#?
   **Answer:** By calling `.WithCancellation(cancellationToken)` on the `IAsyncEnumerable<T>` instance before initiating the `await foreach` loop.
