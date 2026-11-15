<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Core concepts and how they fit together

*This is an automatically generated draft.*

# Learning objectives
* Understand the distinction between `IEnumerable<T>`, `IQueryable<T>`, and `IAsyncEnumerable<T>`.
* Master the concept of deferred execution and its impact on performance and side effects.
* Learn to distinguish between streaming and buffering operators.
* Identify the correct execution boundary for local, remote, and asynchronous data sources.

# Prerequisites
* Basic familiarity with C# syntax, including delegates (`Func<T, TResult>`) and lambda expressions.
* Understanding of basic collection iteration using `foreach`.
* Awareness of asynchronous programming basics (`Task`, `async`/`await`).

# Core concepts
LINQ (Language Integrated Query) provides a unified vocabulary for data manipulation. The core of LINQ is the separation between **query definition** and **query execution**.

*   **`IEnumerable<T>`:** Represents synchronous enumeration. `Enumerable` operators use delegates when enumerated; the interface does not guarantee the source is in memory.
*   **`IQueryable<T>`:** Represents a query expression plus a provider. Operators use expression trees that the provider may translate, for example to SQL. The provider may be remote or in-memory; translation and execution are provider-specific.
*   **`IAsyncEnumerable<T>`:** Represents asynchronous iteration. The source controls how values arrive; this contract does not promise I/O or parallelism.

# Mechanisms and relationships
The behavior of a LINQ query depends on the type of the source and the operator used:

1.  **Deferred Execution:** Most LINQ operators (like `Where` or `Select`) do not run when called. They simply build a "recipe" for the query. The query only executes when you iterate over it (e.g., in a `foreach` loop) or call a **terminal operator** (e.g., `ToList`, `First`, `Count`).
2.  **Streaming vs. Buffering:**
    *   **Streaming operators** (e.g., `Where`, `Select`) process items one by one. They are memory-efficient.
    *   **Buffering operators** in LINQ to Objects (e.g., `OrderBy`, `GroupBy`) consume the input before yielding the first result. `Distinct` is deferred and streaming: it retains a set of previously seen keys and can yield each new unique item as it goes. Provider-backed behavior may differ.
3.  **The Execution Boundary:** You should keep queries in their "remote" state (`IQueryable`) as long as possible to allow the provider to optimize the query (e.g., filtering on the database server). Calling `ToList` enumerates and materializes the query. `AsEnumerable` itself does not execute or materialize; it changes the compile-time type so subsequent operators bind to `Enumerable`. For a provider-backed query, enumeration still invokes that provider for the upstream portion.

# Worked examples
Consider a scenario where you have a list of users and want to find the names of active users.

**Local (IEnumerable):**
```csharp
var activeNames = users.Where(u => u.IsActive).Select(u => u.Name);
// Nothing has happened yet.
foreach (var name in activeNames) { Console.WriteLine(name); }
// Execution happens here, one item at a time.
```

**Remote (IQueryable):**
```csharp
IQueryable<User> query = dbContext.Users;
var activeNames = query.Where(u => u.IsActive).Select(u => u.Name);
// The query is translated to SQL (e.g., SELECT Name FROM Users WHERE IsActive = 1)
// and executed only when we call ToList() or iterate.
var result = activeNames.ToList();
```

**Async (IAsyncEnumerable):**
```csharp
IAsyncEnumerable<User> stream = GetUsersAsync();
await foreach (var user in stream.Where(u => u.IsActive)) {
    Console.WriteLine(user.Name);
}
```

# Misconceptions and edge cases
*   **Multiple Enumeration:** Re-enumerating re-runs the sequence according to its source. A provider-backed query may issue another database request; this is provider-specific. Materialize only when you need a stable reusable snapshot and can afford storing it.
*   **Async is not Parallel:** Async iteration does not automatically run operations concurrently or imply I/O. The source and any awaited operations determine what work is asynchronous.
*   **Provider Limitations:** Not every C# method can be translated into SQL. If you use a complex custom method inside a `Where` clause on an `IQueryable`, the provider may throw an exception or be forced to pull all data into memory to evaluate it locally.

# Knowledge checks with answers
1. **Question:** Does calling `.Where()` on a list immediately filter the list?
   * **Answer:** No. `Where` uses deferred execution; it only filters when the sequence is iterated.

2. **Question:** Why is `OrderBy` considered a buffering operator?
   * **Answer:** For LINQ to Objects, sorting must inspect the full input before it can yield the first sorted item; provider-backed implementations may differ.

3. **Question:** What is the primary difference between `Func<T, TResult>` and `Expression<Func<T, TResult>>`?
   * **Answer:** `Func` is a compiled delegate used for local execution. `Expression` is an object tree that describes the code, allowing `IQueryable` providers to translate it into other languages like SQL.

4. **Question:** How do you prevent a query from executing multiple times?
   * **Answer:** Materialize the query using a terminal operator like `ToList()`, `ToArray()`, or `ToDictionary()`.

*Source: [Microsoft C# LINQ guide](https://learn.microsoft.com/en-us/dotnet/csharp/linq/)*
