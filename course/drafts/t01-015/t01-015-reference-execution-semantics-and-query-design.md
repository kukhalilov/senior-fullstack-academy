<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Reference: Evaluation timing, ordering, joins, grouping, equality, and query efficiency

*This is an automatically generated draft.*

# Scope and version
This lesson covers the execution semantics, query design patterns, and performance characteristics of LINQ operators in .NET 11. It focuses on how queries are constructed, when they execute, and how to manage data flow efficiently across `IEnumerable<T>`, `IQueryable<T>`, and `IAsyncEnumerable<T>`.

# How this group fits the mental model
LINQ is a declarative way to process data. The mental model relies on three phases:
1. **Construction:** You define *what* you want (the query) without running it.
2. **Execution:** The query runs when you iterate over it or call a terminal operator.
3. **Materialization:** The results are stored in memory (e.g., a `List`).

Understanding these items helps you avoid "N+1" query problems, excessive memory usage, and unintended side effects.

# Supplied names explained

* `Deferred query construction`: The process of building a query object that does not execute until requested.
* `Enumeration triggers deferred query execution`: The act of iterating (e.g., `foreach`) or calling a terminal operator that forces the query to run.
* `Immediate scalar query execution`: Operators like `Count()` or `First()` that run the query immediately to return a single value.
* `Deferred versus immediate operator classification`: The distinction between operators that return a query (deferred) and those that return a result (immediate).
* `Streaming versus buffering operator behavior`: Streaming operators (e.g., `Where`) process items one by one; buffering operators (e.g., `OrderBy`) must see all items before yielding the first result.
* `OrderBy buffering behavior`: Because sorting requires knowing the entire set, `OrderBy` must buffer all input elements before it can return the first sorted item.
* `GroupBy buffering behavior`: `GroupBy` must process the entire input to build the internal dictionary of keys before it can yield the first group.
* `Distinct set memory behavior`: `Distinct` maintains an internal set of seen elements to filter duplicates, which consumes memory proportional to the number of unique items.
* `ToList and ToArray materialization cost`: These operators force immediate execution and allocate memory for the entire result set, which can be expensive for large sequences.
* `Multiple enumeration and repeated database query risk`: Re-iterating a deferred query against a database can trigger a new SQL query for every iteration.
* `Single-pass aggregation with Aggregate`: A flexible operator used to reduce a sequence to a single value using a custom accumulator function.
* `Count versus LongCount`: `Count` returns an `int` (max ~2 billion), while `LongCount` returns a `long` for sequences exceeding that limit.
* `TryGetNonEnumeratedCount use`: A performance optimization that attempts to get the count of a sequence without iterating it, if the underlying collection supports it.
* `Index-based Where overload`: A version of `Where` that provides the current element's index, useful for filtering based on position.
* `Stable ordering and ThenBy`: `ThenBy` allows for secondary sorting criteria; the primary sort remains stable.
* `OrderBy resets primary ordering`: Calling `OrderBy` again on an already sorted sequence replaces the previous ordering rather than appending to it.
* `GroupJoin and DefaultIfEmpty left-outer-join pattern`: The traditional way to perform a left outer join in LINQ by joining and then handling empty matches.
* `LeftJoin direct outer join`: A direct operator for performing a left outer join.
* `RightJoin direct outer join`: A direct operator for performing a right outer join.
* `FullJoin direct outer join`: A direct operator for performing a full outer join.
* `Join multiplicity and duplicate keys`: How `Join` handles cases where multiple elements in the source sequences share the same key.
* `GroupBy key comparer`: The ability to provide an `IEqualityComparer<T>` to define how keys are grouped.
* `Distinct equality comparer`: The ability to provide an `IEqualityComparer<T>` to define how uniqueness is determined.
* `DefaultIfEmpty empty sequence behavior`: Returns a sequence containing a default value if the source is empty.
* `First versus Single cardinality contracts`: `First` returns the first element; `Single` throws an exception if there is not exactly one element.
* `FirstOrDefault default-value semantics`: Returns the default value of the type if the sequence is empty, rather than throwing an exception.
* `ElementAt index-from-end support`: Allows accessing elements from the end of a sequence using index-from-end syntax (e.g., `^1`).
* `Async enumeration backpressure boundary`: The point where an async stream is consumed, allowing the producer to pause if the consumer is slow.
* `Cancellation during async enumeration`: The ability to pass a `CancellationToken` to stop an async query mid-stream.
* `Do not run CPU-bound work concurrently by adding async LINQ`: Async LINQ is for I/O-bound operations, not for parallelizing CPU-heavy tasks.
* `Avoid query side effects`: Queries should be pure; changing state inside a query delegate can lead to unpredictable behavior.
* `Reduce data before materialization`: Filter and project data as early as possible to minimize memory and network traffic.
* `Project only required columns before materialization`: Use `Select` to fetch only the data you need to reduce payload size.
* `Provider translation support is provider-specific`: Not all LINQ operators can be translated to SQL or other remote query languages.
* `Expression tree cannot represent every C# construct`: Some C# code cannot be converted into an expression tree for remote execution.
* `Composability versus premature materialization`: Balancing the ability to chain queries with the need to execute them at the right time.

# Cross-item comparison
* **`First` vs `Single`**: `First` is satisfied by the presence of at least one element. `Single` requires exactly one element and will throw an exception if the sequence contains zero or more than one element.
* **`LeftJoin`, `RightJoin`, `FullJoin`**: These are direct operators for outer joins, whereas `GroupJoin` combined with `DefaultIfEmpty` is the legacy pattern for achieving a left outer join.
* **`ToList` vs `AsEnumerable`**: `ToList` is a materialization operator that creates a new collection in memory. `AsEnumerable` is a cast that changes the compile-time type to `IEnumerable<T>` without executing the query or allocating new storage.

# Examples
```csharp
// Deferred execution example
var query = myData.Where(x => x.Value > 10); // Nothing happens here

// Execution triggered by materialization
var list = query.ToList(); // The query runs now

// Index-based filtering
var everySecondItem = myData.Where((item, index) => index % 2 == 0);
```

# Common mistakes
* **Multiple Enumeration:** Iterating over a database-backed `IQueryable` multiple times, causing the database to be queried repeatedly.
* **Premature Materialization:** Calling `.ToList()` too early, which forces the entire dataset into memory instead of streaming it.
* **Ignoring Provider Limits:** Assuming that all LINQ methods will work against a database; if a method cannot be translated to the provider's language, it may throw an exception or force the entire table to be pulled into memory.

# Knowledge checks with answers
1. **Question:** Does `Where` execute immediately?
   **Answer:** No, `Where` is a deferred operator. It only constructs the query.
2. **Question:** What is the difference between `First` and `FirstOrDefault`?
   **Answer:** `First` throws an exception if the sequence is empty; `FirstOrDefault` returns the default value (usually `null` or `0`).
3. **Question:** Why should you avoid `ToList()` on large datasets?
   **Answer:** It forces the entire dataset into memory, which can lead to `OutOfMemoryException` or high latency.
4. **Question:** Can you use `AsyncEnumerable` to speed up CPU-bound calculations?
   **Answer:** No, `AsyncEnumerable` is designed for I/O-bound streams, not for parallelizing CPU-bound work.

*Source: [Microsoft C# LINQ guide](https://learn.microsoft.com/en-us/dotnet/csharp/linq/), [.NET 11 Library Updates](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)*
