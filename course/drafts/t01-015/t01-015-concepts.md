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

*   **`IEnumerable<T>` (Local):** Represents data in memory. Operators in the `Enumerable` class use standard C# delegates to process items.
*   **`IQueryable<T>` (Remote):** Represents a query that can be translated into another language (like SQL). Instead of delegates, it uses `Expression<TDelegate>` (expression trees) to describe *what* to do, allowing a provider to translate the logic into a remote query.
*   **`IAsyncEnumerable<T>` (Asynchronous):** Represents a stream of data that arrives asynchronously. It allows you to process items as they arrive without blocking the thread.

# Mechanisms and relationships
The behavior of a LINQ query depends on the type of the source and the operator used:

1.  **Deferred Execution:** Most LINQ operators (like `Where` or `Select`) do not run when called. They simply build a "recipe" for the query. The query only executes when you iterate over it (e.g., in a `foreach` loop) or call a **terminal operator** (e.g., `ToList`, `First`, `Count`).
2.  **Streaming vs. Buffering:**
    *   **Streaming operators** (e.g., `Where`, `Select`) process items one by one. They are memory-efficient.
    *   **Buffering operators** (e.g., `OrderBy`, `GroupBy`, `Distinct`) must see all items before they can produce the first result. These consume more memory and are "blocking" in nature.
3.  **The Execution Boundary:** You should keep queries in their "remote" state (`IQueryable`) as long as possible to allow the provider to optimize the query (e.g., filtering on the database server). Using `ToList` or `AsEnumerable` forces the query to execute, moving the remaining work to your local machine.

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
*   **Multiple Enumeration:** If you iterate over a deferred `IEnumerable` query twice, the query logic runs twice. If the source is a database, this results in two separate database round-trips. Always use `ToList` or `ToArray` if you need to reuse the results.
*   **Async is not Parallel:** Using `AsyncEnumerable` does not make your code run in parallel. It simply allows your thread to do other work while waiting for I/O (like a network response).
*   **Provider Limitations:** Not every C# method can be translated into SQL. If you use a complex custom method inside a `Where` clause on an `IQueryable`, the provider may throw an exception or be forced to pull all data into memory to evaluate it locally.

# Knowledge checks with answers
1. **Question:** Does calling `.Where()` on a list immediately filter the list?
   * **Answer:** No. `Where` uses deferred execution; it only filters when the sequence is iterated.

2. **Question:** Why is `OrderBy` considered a buffering operator?
   * **Answer:** Because it cannot know which item comes first until it has inspected every single item in the collection.

3. **Question:** What is the primary difference between `Func<T, TResult>` and `Expression<Func<T, TResult>>`?
   * **Answer:** `Func` is a compiled delegate used for local execution. `Expression` is an object tree that describes the code, allowing `IQueryable` providers to translate it into other languages like SQL.

4. **Question:** How do you prevent a query from executing multiple times?
   * **Answer:** Materialize the query using a terminal operator like `ToList()`, `ToArray()`, or `ToDictionary()`.

*Source: [Microsoft C# LINQ guide](https://learn.microsoft.com/en-us/dotnet/csharp/linq/)*
