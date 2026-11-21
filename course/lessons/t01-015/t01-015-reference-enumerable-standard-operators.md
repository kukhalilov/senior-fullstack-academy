
# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Reference: Current Enumerable operators for filtering projection ordering joining grouping and aggregates

# Scope and version
This lesson covers the standard query operators available in the `System.Linq.Enumerable` class for .NET 11. These operators synchronously enumerate `IEnumerable<T>` sources; the source is often in memory but can also stream or retrieve data from elsewhere. This reference is based on the .NET 11 GA standard query operator surface as of 2026-11-17.

# How this group fits the mental model
LINQ (Language Integrated Query) is a family of query patterns. The `Enumerable` operators represent the **local execution** side of this family. When you use these methods, you are processing data already loaded into the application's memory. 

Most of these operators use **deferred execution**: they do not perform the work when you call the method; instead, they build a "recipe" (an iterator) that executes only when you iterate over the result (e.g., using `foreach` or a materialization method like `ToList`). Terminal operators, such as `Count` or `First`, trigger immediate execution because they require a result to be calculated right away.

# Supplied names explained

*   `Enumerable.Where`: Filters a sequence based on a predicate.
*   `Enumerable.Select`: Projects each element into a new form.
*   `Enumerable.SelectMany`: Projects each element to an `IEnumerable<T>` and flattens the resulting sequences.
*   `Enumerable.OfType`: Filters elements based on a specified type.
*   `Enumerable.Cast`: Casts elements to a specified type.
*   `Enumerable.Distinct`: Returns distinct elements from a sequence.
*   `Enumerable.DistinctBy`: Returns distinct elements based on a key selector.
*   `Enumerable.Union`: Produces the set union of two sequences.
*   `Enumerable.UnionBy`: Produces the set union based on a key selector.
*   `Enumerable.Intersect`: Produces the set intersection of two sequences.
*   `Enumerable.IntersectBy`: Produces the set intersection based on a key selector.
*   `Enumerable.Except`: Produces the set difference of two sequences.
*   `Enumerable.ExceptBy`: Produces the set difference based on a key selector.
*   `Enumerable.Concat`: Concatenates two sequences.
*   `Enumerable.Append`: Appends a value to the end of a sequence.
*   `Enumerable.Prepend`: Adds a value to the beginning of a sequence.
*   `Enumerable.Zip`: Merges two sequences into one using a selector function.
*   `Enumerable.Chunk`: Splits a sequence into chunks of a specified size.
*   `Enumerable.Join`: Correlates elements of two sequences based on matching keys.
*   `Enumerable.GroupJoin`: Correlates elements and groups matches.
*   `Enumerable.LeftJoin`: Performs a left outer join between two sequences.
*   `Enumerable.RightJoin`: Performs a right outer join between two sequences.
*   `Enumerable.FullJoin`: Performs a full outer join between two sequences.
*   `Enumerable.GroupBy`: Groups elements by a key.
*   `Enumerable.ToLookup`: Creates a `Lookup<TKey, TElement>` from a sequence.
*   `Enumerable.Order`: Sorts elements in ascending order.
*   `Enumerable.OrderDescending`: Sorts elements in descending order.
*   `Enumerable.OrderBy`: Sorts elements in ascending order using a key.
*   `Enumerable.OrderByDescending`: Sorts elements in descending order using a key.
*   `Enumerable.ThenBy`: Performs a subsequent sort in ascending order.
*   `Enumerable.ThenByDescending`: Performs a subsequent sort in descending order.
*   `Enumerable.Reverse`: Inverts the order of elements.
*   `Enumerable.Skip`: Bypasses a specified number of elements.
*   `Enumerable.SkipLast`: Bypasses a specified number of elements from the end.
*   `Enumerable.SkipWhile`: Bypasses elements as long as a condition is true.
*   `Enumerable.Take`: Returns a specified number of elements.
*   `Enumerable.TakeLast`: Returns a specified number of elements from the end.
*   `Enumerable.TakeWhile`: Returns elements as long as a condition is true.
*   `Enumerable.DefaultIfEmpty`: Returns the sequence or a default value if empty.
*   `Enumerable.Select index overload`: Projects elements including their index.
*   `Enumerable.SelectMany result selector overload`: Projects and flattens with a result selector.
*   `Enumerable.Where index overload`: Filters elements including their index.
*   `Enumerable.TakeWhile index overload`: Takes elements while a condition (with index) is true.
*   `Enumerable.SkipWhile index overload`: Skips elements while a condition (with index) is true.
*   `Enumerable.Aggregate`: Performs a custom accumulation.
*   `Enumerable.AggregateBy`: Aggregates elements by key.
*   `Enumerable.CountBy`: Counts occurrences of each key.
*   `Enumerable.Count`: Returns the number of elements.
*   `Enumerable.LongCount`: Returns the number of elements as a `long`.
*   `Enumerable.TryGetNonEnumeratedCount`: Attempts to get the count without enumerating.
*   `Enumerable.Sum`: Calculates the sum of a sequence.
*   `Enumerable.Average`: Calculates the average of a sequence.
*   `Enumerable.Min`: Finds the minimum value.
*   `Enumerable.MinBy`: Finds the element with the minimum key.
*   `Enumerable.Max`: Finds the maximum value.
*   `Enumerable.MaxBy`: Finds the element with the maximum key.
*   `Enumerable.All`: Determines if all elements satisfy a condition.
*   `Enumerable.Any`: Determines if any element satisfies a condition.
*   `Enumerable.Contains`: Determines if a sequence contains a value.
*   `Enumerable.SequenceEqual`: Determines if two sequences are equal.
*   `Enumerable.First`: Returns the first element.
*   `Enumerable.FirstOrDefault`: Returns the first element or `default(TSource)` when no element matches; overloads can accept a predicate.
*   `Enumerable.Last`: Returns the last element.
*   `Enumerable.LastOrDefault`: Returns the last element or a default.
*   `Enumerable.Single`: Returns the only element.
*   `Enumerable.SingleOrDefault`: Returns the only element or a default.
*   `Enumerable.ElementAt`: Returns the element at a specific index.
*   `Enumerable.ElementAtOrDefault`: Returns the element at an index or a default.
*   `Enumerable.Index`: Associates each element with its index.
*   `Enumerable.Range`: Generates a sequence of integers.
*   `Enumerable.Repeat`: Generates a sequence of repeated values.
*   `Enumerable.Empty`: Returns an empty sequence.
*   `Enumerable.ToArray`: Materializes to an array.
*   `Enumerable.ToList`: Materializes to a `List<T>`.
*   `Enumerable.ToDictionary`: Materializes to a `Dictionary<TKey, TValue>`.
*   `Enumerable.ToHashSet`: Materializes to a `HashSet<T>`.
*   `Enumerable.ToLookup materialization overloads`: Overloads for `ToLookup` with custom comparers.
*   `Enumerable.ToDictionary comparer overloads`: Overloads for `ToDictionary` with custom comparers.
*   `Enumerable.ToDictionary element selector overloads`: Overloads for `ToDictionary` with element transformation.
*   `Enumerable.FirstOrDefault default-value overload`: .NET 6 and later overloads return the supplied fallback when the sequence or predicate match is empty. Equivalent explicit-fallback overload families exist for `LastOrDefault` and `SingleOrDefault`; `SingleOrDefault` still throws if multiple elements match.
*   `Enumerable.LastOrDefault default-value overload`: Returns a specific default if not found.
*   `Enumerable.SingleOrDefault default-value overload`: Returns a specific default if not found.
*   `Enumerable.ElementAtOrDefault default-value overload`: The `System.Index` overload supports from-start and from-end positions and returns `default(TSource)` when out of range; this is distinct from a caller-supplied fallback overload.
*   `Enumerable.Order comparer overload`: Sorts with a custom `IComparer<T>`.
*   `Enumerable.OrderDescending comparer overload`: Sorts descending with a custom `IComparer<T>`.

# Cross-item comparison
The operators in this group are categorized by their role in the query pipeline:
*   **Deferred vs. Immediate:** Most operators (like `Where`, `Select`, `OrderBy`) are deferred. Materialization operators (like `ToList`, `ToArray`, `Count`, `First`) are immediate.
*   **Set Operations:** `Distinct`, `Union`, `Intersect`, and `Except` have `By` variants (e.g., `DistinctBy`) that allow key-based comparison rather than comparing the entire object.
*   **Joins:** `Join` and `GroupJoin` are standard, while `LeftJoin`, `RightJoin`, and `FullJoin` provide explicit outer join capabilities.
*   **Ordering:** `Order` and `OrderDescending` are simpler versions of `OrderBy` and `OrderByDescending` that sort by the element itself.

# Examples
```csharp
// Deferred execution example
var numbers = new List<int> { 1, 2, 3, 4, 5 };
var query = numbers.Where(n => n > 2); // No work done yet

// Immediate execution triggered by ToList
var result = query.ToList(); 
// result is { 3, 4, 5 }

// CountBy (introduced in .NET 9)
var counts = numbers.CountBy(n => n % 2 == 0);
// counts contains { (false, 3), (true, 2) }
```

# Common mistakes
1.  **Multiple Enumeration:** Re-running a deferred query multiple times (e.g., in a loop) can cause performance issues if the underlying source is expensive to process. Use `ToList()` or `ToArray()` to cache results if needed.
2.  **Ignoring Deferred Execution:** Expecting a query to have finished before it is actually enumerated.
3.  **Mixing Providers:** Attempting to use `Enumerable` methods on `IQueryable` sources without realizing that the query might be pulled into memory (client-side evaluation) instead of being executed on the database.

# Knowledge checks with answers
1.  **Question:** Does `Enumerable.Where` execute immediately?
    *   **Answer:** No, it uses deferred execution.
2.  **Question:** Which method would you use to force immediate execution of a query into a list?
    *   **Answer:** `Enumerable.ToList()`.
3.  **Question:** What is the difference between `First()` and `FirstOrDefault()`?
    *   **Answer:** `First()` throws an exception if the sequence is empty, while `FirstOrDefault()` returns the default value for the type (e.g., `null` for reference types).

*Source: [Microsoft C# LINQ guide](https://learn.microsoft.com/en-us/dotnet/csharp/linq/)*
