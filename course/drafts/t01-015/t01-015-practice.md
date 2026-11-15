<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Exercises and worked solutions

# Goals

*   Understand the distinction between `IEnumerable<T>`, `IQueryable<T>`, and `IAsyncEnumerable<T>`.
*   Master the difference between **deferred execution** (lazy evaluation) and **immediate execution** (terminal operators).
*   Learn how to choose the correct LINQ provider (`Enumerable`, `Queryable`, or `AsyncEnumerable`) based on your data source.
*   Apply modern .NET 11 features like `FullJoin` and tuple-returning joins.
*   Distinguish between `Func<T,TResult>` delegates invoked by `Enumerable` operators and `Expression<Func<T,TResult>>` trees passed to a provider by `Queryable` operators.

# Worked example

LINQ (Language Integrated Query) provides a unified syntax to filter, project, and aggregate data. The execution behavior depends on the underlying interface.

### The Three Pillars of LINQ
1.  `Enumerable`: Works with `IEnumerable<T>` synchronous sequences. Uses `Func<T,TResult>` delegates; the source need not be an in-memory collection.
2.  `Queryable`: Works with `IQueryable<T>`. Uses `Expression<Func<T,TResult>>` trees that a provider may translate or otherwise execute. A database is common, but not guaranteed.
3.  `AsyncEnumerable`: Works with `IAsyncEnumerable<T>` for asynchronous iteration; async iteration alone does not imply I/O or parallel processing.

**Example: Filtering a list**
```csharp
var numbers = new List<int> { 1, 2, 3, 4, 5 };

// Deferred: Nothing happens here
var query = numbers.Where(n => n > 2);

// Immediate: Enumeration triggers execution
foreach (var n in query) { Console.WriteLine(n); }
```

**Key Distinction:** `Func<T,TResult>` is executable delegate code. `Expression<Func<T,TResult>>` is a code representation a provider may inspect and translate; whether it is remote and which expressions it supports depend on the provider.

# Exercises

1.  **Deferred vs. Immediate:** Given a list of integers, write a query that filters them, then call `ToList()` to force immediate execution.
2.  **Async Consumption:** Use `await foreach` to consume an `IAsyncEnumerable<int>`.
3.  **Modern Joins:** Use `FullJoin` to combine two sequences of tuples (available in .NET 11).

# Progressive hints

1.  **Hint 1:** Remember that `Where` is an intermediate operator (deferred). `ToList` or `First` are terminal operators (immediate).
2.  **Hint 2:** `IQueryable` requires `Expression<Func<T,TResult>>`. If you pass a standard `Func`, you might accidentally switch to client-side evaluation, which is often inefficient for databases.
3.  **Hint 3:** To consume `IAsyncEnumerable<T>`, use the `await foreach` statement. This is the standard C# language feature for asynchronous iteration.

# Complete solutions

**Exercise 1:**
```csharp
var data = new List<int> { 1, 2, 3 };
var deferred = data.Where(x => x > 1);
var materialized = deferred.ToList(); // Execution happens here
```

**Exercise 2:**
```csharp
// Assuming 'asyncStream' is IAsyncEnumerable<int>
await foreach (var item in asyncStream)
{
    Console.WriteLine(item);
}
```

**Exercise 3:**
```csharp
// .NET 11 FullJoin example
var left = new[] { (1, "A"), (2, "B") };
var right = new[] { (2, "B"), (3, "C") };
var joined = left.FullJoin(right, l => l.Item1, r => r.Item1, (l, r) => (l, r));
```

# Tests and edge cases

*   **Multiple Enumeration:** If you iterate a deferred sequence twice, it is evaluated twice according to its source. A provider-backed database query commonly issues another request, but behavior depends on the provider. Use `ToList()` to cache results if needed.
*   **Provider Translation Failure:** `Queryable` operators may fail if the provider cannot translate a specific C# construct (e.g., a complex custom method) into SQL.
*   **Cancellation:** Always propagate `CancellationToken` when using `AsyncEnumerable` operators to ensure cooperative cancellation.
*   **LINQ to Objects:** `OrderBy` and `GroupBy` consume the input before yielding the first result. Do not assume the same execution strategy for every `IQueryable` provider.

# Reflection questions

1.  Why is it dangerous to perform `ToList()` on a massive database table before filtering?
2.  How does `Expression<Func<T,TResult>>` enable ORMs like EF Core to generate SQL?
3.  When should you prefer `AsyncEnumerable` over `IEnumerable`? (Consider I/O-bound vs. CPU-bound work).

*Draft: Automatically generated.*

*Sources:*
* [Microsoft C# LINQ guide](https://learn.microsoft.com/en-us/dotnet/csharp/linq/)
* [Standard query operators](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/)
* [Deferred execution](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/deferred-execution-lazy-evaluation)
* [.NET 11 Libraries](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)
* [AsyncEnumerable compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/10.0/asyncenumerable)
