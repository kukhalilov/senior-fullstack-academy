<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Big-picture orientation and mental model

*Draft: Automatically generated.*

# Problem and purpose
LINQ (Language Integrated Query) provides a family of query patterns and operators for filtering, projection, ordering, and aggregation. The same vocabulary can be used with in-memory sequences, provider-backed queries, and asynchronous streams, but those sources can have different execution and translation semantics.

# Plain-language mental model
Think of LINQ as a "query pipeline." You start with a source of data, attach a series of "operators" (like filters or sorters) to describe the transformation, and finally "materialize" the result.

Many sequence-returning LINQ operators use **deferred execution**: they build a query that runs when enumerated. Some operators return scalar results immediately, while materializers such as `ToList` enumerate and store results. Exact behavior depends on the operator and source/provider.

# How the parts fit together
These three interfaces describe different query or iteration contracts; they do not by themselves guarantee where data is stored or how work is executed:

1.  **`IEnumerable<T>`**: Represents synchronous enumeration. `Enumerable` operators invoke delegates as the sequence is enumerated; a custom source may obtain data from elsewhere.
2.  **`IQueryable<T>`**: Carries an expression tree and an `IQueryProvider`. A provider may translate that tree to another query language or execute it in another way; remote databases are common, but not guaranteed. `AsQueryable` over an ordinary enumerable does not create a remote provider.
3.  **`IAsyncEnumerable<T>`**: Represents asynchronous iteration. Its source controls how values are produced; asynchronous iteration does not itself imply I/O or parallel execution.

# Concept map
*   **Query Syntax**: Uses keywords like `from`, `where`, and `select` to define queries.
*   **Method Syntax**: Uses extension methods like `Where` and `Select` to chain operations.
*   **Materialization**: The point where a deferred query is forced to execute (e.g., `ToList`, `ToArray`, `First`).
*   **Translation Boundary**: The point where provider-backed query composition ends and enumeration or scalar execution invokes the provider. The provider determines translation, execution, and any client-side behavior.

# End-to-end walkthrough
Consider a list of products. We want to find the names of expensive products.

1.  **Definition**: We define a query using `Enumerable.Where` and `Enumerable.Select`. Because these are deferred, no filtering happens yet.
2.  **Execution**: We call `Enumerable.ToList`. This triggers the "materialization boundary," causing the code to iterate through the source, apply the filter, and store the results in a new list.
3.  **Async Variation**: If the source were an `IAsyncEnumerable<T>`, we would use `AsyncEnumerable.ToListAsync` to await the results asynchronously.

# When to use it and tradeoffs
*   **Use it for**: Readability, maintainability, and consistent data manipulation across different types of collections.
*   **Tradeoffs**:
    *   **Performance**: Repeatedly enumerating a deferred query can cause redundant work.
    *   **Complexity**: Provider translation support differs. Unsupported expressions may fail or be evaluated locally only where that provider explicitly supports client evaluation.
    *   **Side Effects**: Avoid modifying the source data while a query is deferred, as this can lead to unpredictable results.

# What later lessons cover
This topic covers the standard query operator surface, including:
*   **Enumerable**: `Enumerable.Where`, `Enumerable.Select`, `Enumerable.AggregateBy`, `Enumerable.CountBy`, `Enumerable.LeftJoin`, `Enumerable.RightJoin`, `Enumerable.FullJoin`.
*   **Queryable**: `Queryable.Where`, `Queryable.Select`, `Queryable.LeftJoin`, `Queryable.RightJoin`, `Queryable.FullJoin`.
*   **AsyncEnumerable**: `AsyncEnumerable.Where`, `AsyncEnumerable.Select`, `AsyncEnumerable.LeftJoin`, `AsyncEnumerable.RightJoin`, `AsyncEnumerable.FullJoin`.

For further details on specific implementations, refer to the official documentation:
*   [LINQ Overview](https://learn.microsoft.com/en-us/dotnet/csharp/linq/)
*   [Standard Query Operators](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/)
*   [Deferred Execution](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/deferred-execution-lazy-evaluation)
*   [API References](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable)
