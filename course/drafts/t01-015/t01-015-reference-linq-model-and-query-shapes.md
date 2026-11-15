<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Reference: LINQ abstractions, syntax forms, provider pipeline, and query execution categories

*This is an automatically generated draft.*

# Scope and version
This lesson covers the core abstractions, syntax forms, and execution models of LINQ (Language Integrated Query) as of .NET 11. It focuses on the structural components that define how queries are built, translated, and executed across local, remote, and asynchronous data sources.

# How this group fits the mental model
LINQ is a unified way to process data. The mental model relies on three pillars:
1. **The Source:** Data is represented as a sequence (`IEnumerable<T>`), a queryable tree (`IQueryable<T>`), or an asynchronous stream (`IAsyncEnumerable<T>`).
2. **The Syntax:** You describe *what* you want using either Method or Query syntax.
3. **The Execution:** The system decides *how* to run it based on the provider. Some operators are "deferred" (they wait until you ask for data), while others are "immediate" (they force the work to happen now).

# Supplied names explained

* `LINQ`: A family of query patterns providing a consistent vocabulary for data manipulation.
* `Standard query operators`: The set of extension methods (e.g., `Where`, `Select`) that define the LINQ API surface.
* `Method query syntax`: A style of writing queries using standard C# method calls.
* `Query expression syntax`: A declarative, SQL-like style of writing queries that the compiler translates into method calls.
* `Query expression translation`: The process where the C# compiler converts query expression syntax into method calls.
* `IEnumerable<T>`: The interface for local, synchronous collections that can be iterated.
* `IEnumerator<T>`: The object that maintains the current position during synchronous iteration.
* `IQueryable<T>`: The interface for data sources that support translation into expression trees (e.g., database providers).
* `IQueryProvider`: The engine that translates an `IQueryable` expression tree into a specific format (like SQL).
* `IAsyncEnumerable<T>`: The interface for asynchronous streams of data.
* `IAsyncEnumerator<T>`: The object that maintains the current position during asynchronous iteration.
* `Enumerable`: The static class containing extension methods for `IEnumerable<T>`.
* `Queryable`: The static class containing extension methods for `IQueryable<T>`.
* `AsyncEnumerable`: The static class containing extension methods for `IAsyncEnumerable<T>`.
* `Func<T,TResult> query delegate`: A standard C# delegate used by `Enumerable` operators to process data locally.
* `Expression<TDelegate> query expression`: A data structure representing code as an object tree, used by `Queryable` to translate logic to remote systems.
* `IQueryable.Expression`: The property holding the expression tree representing the query.
* `IQueryable.Provider`: The property holding the `IQueryProvider` responsible for executing the query.
* `IQueryProvider.CreateQuery`: A method used to build a new `IQueryable` from an expression.
* `IQueryProvider.Execute`: A method used to trigger the execution of a query.
* `Query operator extension method binding`: The mechanism by which the compiler selects the correct LINQ implementation based on the source type.
* `Query syntax into continuation`: A feature in query syntax that allows chaining results into a new range variable.
* `Query syntax let clause`: A clause that introduces a new variable to store intermediate results.
* `Query syntax join clause`: A clause used to correlate two data sources.
* `Query syntax group clause`: A clause that organizes results into groups based on a key.
* `Query syntax orderby clause`: A clause that specifies the sorting order of the results.
* `Query syntax select clause`: A clause that defines the shape of the output.
* `Query syntax where clause`: A clause that filters the data source.
* `Query syntax from clause`: The starting clause that identifies the data source.
* `Query syntax group join into`: A specific syntax for performing a left-outer join.
* `Deferred execution`: A behavior where the query is not executed until the data is requested (e.g., via `foreach`).
* `Immediate execution`: A behavior where the query runs as soon as the method is called (e.g., `ToList()`).
* `Streaming operator`: An operator that yields items one by one without buffering the entire set.
* `Buffering operator`: An operator that must process the entire input before yielding any output (e.g., `OrderBy`).
* `Terminal operator`: An operator that returns a single value or collection, forcing execution (e.g., `Count`, `First`).
* `Intermediate operator`: An operator that returns a new queryable sequence, maintaining deferred execution.
* `Materialization boundary`: The point in a query chain where deferred execution is forced into a concrete collection.
* `Repeated enumeration`: The act of iterating over a deferred query multiple times, which may re-run the logic.
* `Single-use sequence`: A sequence (often async) that can only be consumed once.
* `Side effect during enumeration`: Unintended changes to state that occur when a query is executed.
* `Provider translation boundary`: The point where the query is handed off to an `IQueryProvider`.
* `Client-side evaluation boundary`: The point where the query stops being translated and starts running locally.
* `AsEnumerable`: A method that casts a source to `IEnumerable<T>`, forcing subsequent operators to run locally.
* `AsQueryable`: A method that wraps a source as `IQueryable<T>`, enabling expression tree translation.
* `Local query versus remote query`: The distinction between processing data in memory versus translating it for a database.

# Cross-item comparison
* **`IEnumerable<T>` vs `IQueryable<T>` vs `IAsyncEnumerable<T>`**: `IEnumerable` is for local, synchronous data. `IQueryable` is for remote, translatable data (like databases). `IAsyncEnumerable` is for asynchronous, non-blocking streams.
* **`Enumerable` vs `Queryable` vs `AsyncEnumerable`**: These static classes provide the extension methods for their respective interfaces. Using the wrong one (e.g., `Enumerable` on a database query) may force the entire database table into memory.
* **`Deferred execution` vs `Immediate execution`**: Deferred operators (like `Where`) build a plan; immediate operators (like `ToList`) execute the plan and store the results.

# Examples
```csharp
// Deferred execution example
var numbers = new List<int> { 1, 2, 3 };
var query = numbers.Where(n => n > 1); // No work done yet

// Materialization boundary
var result = query.ToList(); // Execution happens here
```

# Common mistakes
1. **Over-fetching:** Using `IEnumerable` methods on an `IQueryable` source, which pulls all data into memory before filtering.
2. **Multiple Enumeration:** Re-running a complex database query multiple times because the result was not materialized into a list.
3. **Async Misconception:** Assuming `IAsyncEnumerable` makes CPU-bound work parallel; it only enables asynchronous, non-blocking I/O.

# Knowledge checks with answers
1. **Question:** Does `Where` execute immediately?
   **Answer:** No, it uses deferred execution.
2. **Question:** Which interface should you use for a database query that needs to be translated to SQL?
   **Answer:** `IQueryable<T>`.
3. **Question:** What is the purpose of `ToList()` in a LINQ chain?
   **Answer:** It acts as a materialization boundary, forcing immediate execution and storing the results in memory.

*Source: [Microsoft C# LINQ guide](https://learn.microsoft.com/en-us/dotnet/csharp/linq/)*
