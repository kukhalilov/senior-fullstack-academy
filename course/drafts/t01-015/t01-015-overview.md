<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Big-picture orientation and mental model

*Draft: Automatically generated.*

# Problem and purpose
LINQ (Language Integrated Query) solves the problem of querying disparate data sources—such as in-memory collections, databases, or asynchronous streams—using a unified, readable syntax. Without LINQ, developers must write unique, imperative code for every data source type. LINQ provides a consistent vocabulary for filtering, projection, ordering, and aggregation, allowing you to focus on *what* data you need rather than *how* to retrieve it.

# Plain-language mental model
Think of LINQ as a "query pipeline." You start with a source of data, attach a series of "operators" (like filters or sorters) to describe the transformation, and finally "materialize" the result. 

Crucially, most LINQ operators use **deferred execution**. This means that when you define a query, it does not run immediately. Instead, it builds a "recipe" for the query. The actual work only happens when you iterate over the result (e.g., in a `foreach` loop) or call a terminal operator like `ToList`.

# How the parts fit together
LINQ is organized into three primary execution models based on the data source:

1.  **`IEnumerable<T>`**: Used for local, in-memory data. Operators in the `Enumerable` class execute locally on the CPU.
2.  **`IQueryable<T>`**: Used for remote data sources (like databases). It uses `IQueryable.Expression` and `IQueryable.Provider` to translate your C# code into a query language (like SQL). The `IQueryProvider.CreateQuery` and `IQueryProvider.Execute` methods handle this translation and execution.
3.  **`IAsyncEnumerable<T>`**: Used for asynchronous streams. Operators in the `AsyncEnumerable` class allow you to process data as it arrives without blocking the thread.

# Concept map
*   **Query Syntax**: Uses keywords like `from`, `where`, and `select` to define queries.
*   **Method Syntax**: Uses extension methods like `Where` and `Select` to chain operations.
*   **Materialization**: The point where a deferred query is forced to execute (e.g., `ToList`, `ToArray`, `First`).
*   **Translation Boundary**: The point where `IQueryable` stops building an expression tree and sends the request to the provider.

# End-to-end walkthrough
Consider a list of products. We want to find the names of expensive products.

1.  **Definition**: We define a query using `Enumerable.Where` and `Enumerable.Select`. Because these are deferred, no filtering happens yet.
2.  **Execution**: We call `Enumerable.ToList`. This triggers the "materialization boundary," causing the code to iterate through the source, apply the filter, and store the results in a new list.
3.  **Async Variation**: If the source were an `IAsyncEnumerable<T>`, we would use `AsyncEnumerable.ToListAsync` to await the results asynchronously.

# When to use it and tradeoffs
*   **Use it for**: Readability, maintainability, and consistent data manipulation across different types of collections.
*   **Tradeoffs**: 
    *   **Performance**: Repeatedly enumerating a deferred query can cause redundant work.
    *   **Complexity**: `IQueryable` can sometimes fail to translate complex C# expressions into SQL, leading to runtime errors or unexpected client-side evaluation.
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
