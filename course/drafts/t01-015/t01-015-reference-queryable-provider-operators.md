<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# LINQ operators deferred execution IEnumerable IQueryable and async sequences — Reference: Queryable operator families, expression trees, provider translation, and execution

# Scope and version

This reference lesson covers the `Queryable` provider operator group under the `.NET 11 GA standard query operator and async-sequence surface checked 2026-11-14` edition [https://learn.microsoft.com/en-us/dotnet/csharp/linq/](https://learn.microsoft.com/en-us/dotnet/csharp/linq/). The focus is on queryable operators, expression trees, provider translation, and execution boundaries. Out of scope for this reference are in-memory `IEnumerable<T>` enumeration, parallel PLINQ execution, database-specific SQL generation details, and asynchronous stream operators.

# How this group fits the mental model

LINQ queries can target different sources with different execution semantics [https://learn.microsoft.com/en-us/dotnet/csharp/linq/]. `Enumerable` methods accept delegates (`Func<T, TResult>`) and invoke them during synchronous enumeration. `Queryable` methods accept expression trees (`Expression<Func<T, TResult>>`) and pass them to an `IQueryProvider`; the provider may be remote or in-memory.

An expression tree wraps C# code as data structures rather than compiled executable instructions. A query provider may inspect these structures and translate them into a target system such as a relational database, or may execute them in another way [https://learn.microsoft.com/en-us/dotnet/api/system.linq.iqueryprovider]. Understanding this difference prevents accidental performance traps, such as loading entire remote tables into local memory because an operator or method call forced premature materialization.

# Supplied names explained

* `Queryable.Where` - Filters a sequence based on a predicate represented as an expression tree.
* `Queryable.Select` - Projects each element of a sequence into a new form using an expression tree.
* `Queryable.SelectMany` - Projects each element of a sequence to an `IQueryable<T>` and flattens the resulting sequences into one queryable.
* `Queryable.OfType` - Filters the elements of a sequence based on a specified type.
* `Queryable.Cast` - Casts the elements of a sequence to a specified type.
* `Queryable.Distinct` - Returns distinct elements from a sequence by using the default equality comparer.
* `Queryable.DistinctBy` - Returns distinct elements from a sequence according to a specified key selector function.
* `Queryable.Union` - Produces the set union of two sequences by using the default equality comparer.
* `Queryable.UnionBy` - Produces the set union of two sequences according to a specified key selector function.
* `Queryable.Intersect` - Produces the set intersection of two sequences by using the default equality comparer.
* `Queryable.IntersectBy` - Produces the set intersection of two sequences according to a specified key selector function by using a specified comparer.
* `Queryable.Except` - Produces the set difference of two sequences by using the default equality comparer.
* `Queryable.ExceptBy` - Produces the set difference of two sequences according to a specified key selector function.
* `Queryable.Concat` - Concatenates two sequences.
* `Queryable.Append` - Appends a value to the end of the sequence.
* `Queryable.Prepend` - Adds a value to the beginning of the sequence.
* `Queryable.Zip` - Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
* `Queryable.Join` - Correlates the elements of two sequences based on matching keys.
* `Queryable.GroupJoin` - Correlates the elements of two sequences based on key equality and groups the results.
* `Queryable.LeftJoin` - Performs a left outer join between two queryable sequences [.NET 11 addition, https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries].
* `Queryable.RightJoin` - Performs a right outer join between two queryable sequences [.NET 11 addition, https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries].
* `Queryable.FullJoin` - Performs a full outer join between two queryable sequences [.NET 11 addition, https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries].
* `Queryable.GroupBy` - Groups the elements of a sequence according to a specified key selector function.
* `Queryable.Order` - Sorts the elements of a sequence in ascending order [.NET 9 addition, https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-9].
* `Queryable.OrderDescending` - Sorts the elements of a sequence in descending order [.NET 9 addition, https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-9].
* `Queryable.OrderBy` - Sorts the elements of a sequence in ascending order by using a key selector.
* `Queryable.OrderByDescending` - Sorts the elements of a sequence in descending order by using a key selector.
* `Queryable.ThenBy` - Performs a subsequent ordering of elements in a sequence in ascending order.
* `Queryable.ThenByDescending` - Performs a subsequent ordering of elements in a sequence in descending order.
* `Queryable.Skip` - Bypasses a specified number of elements in a sequence and then returns the remaining elements.
* `Queryable.Take` - Returns a specified number of contiguous elements from the start of a sequence.
* `Queryable.DefaultIfEmpty` - Returns the elements of the specified sequence, or a default value singleton if the sequence is empty.
* `Queryable.Aggregate` - Applies an accumulator function over a queryable sequence.
* `Queryable.AggregateBy` - Computes aggregate values grouped by a generated key [.NET 9 addition, https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-9].
* `Queryable.CountBy` - Computes counts of elements grouped by a generated key [.NET 9 addition, https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-9].
* `Queryable.Count` - Returns the number of elements in a sequence.
* `Queryable.LongCount` - Returns a 64-bit integer that represents the total number of elements in a sequence.
* `Queryable.Sum` - Computes the sum of a sequence of numeric values.
* `Queryable.Average` - Computes the average of a sequence of numeric values.
* `Queryable.Min` - Returns the minimum value in a sequence.
* `Queryable.Max` - Returns the maximum value in a sequence.
* `Queryable.All` - Determines whether all elements of a sequence satisfy a condition.
* `Queryable.Any` - Determines whether any element of a sequence satisfies a condition.
* `Queryable.Contains` - Determines whether a sequence contains a specified element.
* `Queryable.SequenceEqual` - Determines whether two sequences are equal by comparing their elements.
* `Queryable.First` - Returns the first element of a sequence.
* `Queryable.FirstOrDefault` - Returns the first element of a sequence, or a default value if the sequence contains no elements.
* `Queryable.FirstOrDefault explicit-default overloads` - .NET 6 and later provide overloads that return a caller-supplied fallback when the source or predicate match is empty; provider support for translating or executing the expression still varies.
* `Queryable.Last` - Returns the last element of a sequence.
* `Queryable.LastOrDefault` - Returns the last element of a sequence, or a default value if the sequence contains no elements.
* `Queryable.LastOrDefault explicit-default overloads` - .NET 6 and later provide caller-supplied fallback overloads, including predicate forms; providers may differ in support.
* `Queryable.Single` - Returns the only element of a sequence, and throws an exception if there is not exactly one element.
* `Queryable.SingleOrDefault` - Returns the only element of a sequence, or a default value if the sequence is empty.
* `Queryable.SingleOrDefault explicit-default overloads` - .NET 6 and later provide caller-supplied fallback overloads. They still throw when more than one element satisfies the single-result contract; provider support varies.
* `Queryable.ElementAt` - Returns the element at a specified index in a sequence.
* `Queryable.ElementAt Index overload` - Accepts `System.Index` positions such as `^1`; provider translation support varies.
* `Queryable.ElementAtOrDefault` - Returns the element at a specified index, or a default value if the index is out of range.
* `Queryable.ElementAtOrDefault Index overload` - Accepts a `System.Index`, including from-end positions, and returns the type default when the position is out of range; provider support varies.
* `Queryable.AsQueryable` - Returns an `IQueryable`; for an ordinary enumerable, this uses an in-memory queryable wrapper and does not create a remote provider.
* `Queryable expression-tree overload signatures` - The internal mechanisms defining how query operators accept `Expression<TDelegate>` instead of standard delegates.
* `Queryable provider translation failure` - Errors thrown or fallback behaviors triggered when a query provider encounters unsupported expression tree nodes.
* `Queryable versus Enumerable overload selection` - The compiler resolution rule favoring `Queryable` methods when the receiver implements `IQueryable<T>`.
* `Expression tree parameter substitution` - The structural rewriting process a query provider uses when composing and nesting query operations.
* `Expression tree closure capture in provider query` - Local variables captured inside expression trees, which providers must evaluate as constants or parameters.
* `Query provider parameterization behavior` - How query providers convert closure values into safe query parameters to prevent injection issues.
* `Provider-specific function translation` - The mapping of C# methods (like `string.Contains`) to underlying database functions (like SQL `LIKE`).
* `Client evaluation versus server evaluation` - The execution split where parts of a query run on a remote data store versus local client memory.
* `Explicit materialization using ToList` - Triggering immediate query execution and caching results into a local `List<T>` collection.
* `AsEnumerable changes subsequent operator binding` - Exposes the sequence as `IEnumerable<T>`, so subsequent extension calls bind to `Enumerable`; it is deferred and does not itself execute/materialize the upstream source.

# Cross-item comparison

Within this group of queryable and expression-tree execution members, several items contrast directly:
* `Queryable versus Enumerable overload selection` dictates whether a query compiles to deferred expression trees or immediate delegate execution based on whether the source variable type is `IQueryable<T>` or `IEnumerable<T>` [https://learn.microsoft.com/en-us/dotnet/api/system.linq.queryable].
* `Enumerable.ToList` and `AsEnumerable` have different effects: `ToList` enumerates and stores results immediately, while `AsEnumerable` remains deferred and changes downstream operator binding. `Queryable` does not define a `ToList` operator; the `Enumerable.ToList` extension can consume an `IQueryable<T>` through its `IEnumerable<T>` interface. Upstream provider execution still occurs when enumeration begins. `Enumerable.ToLookup` likewise materializes through `IEnumerable<T>`.
* `Client evaluation versus server evaluation` determines where query logic executes, contrasting with `Queryable provider translation failure` which occurs when a provider cannot execute a given expression tree and refuses to translate it.

# Examples

The following snippet demonstrates expression-tree composition and materialization using an in-memory query provider; it does not demonstrate database translation [https://learn.microsoft.com/en-us/dotnet/csharp/linq/]:

```csharp
using System;
using System.Linq;

class Program
{
    static void Main()
    {
        // Assume context.Products returns an IQueryable<Product>
        // This creates an in-memory IQueryable wrapper, not a remote provider.
        var localProducts = new[]
        {
            new Product { Category = "Electronics", Price = 120.0m },
            new Product { Category = "Books", Price = 15.0m }
        };

        IQueryable<Product> queryableSource = localProducts.AsQueryable();

        decimal threshold = 50.0m; // Closure capture in provider query

        // Queryable.Where and Queryable.Select build an expression tree for this in-memory provider
        IQueryable<string> filteredQuery = queryableSource
            .Where(p => p.Price > threshold)
            .Select(p => p.Category);

        // ToList enumerates and materializes results from this in-memory provider
        var resultList = filteredQuery.ToList();

        foreach (var category in resultList)
        {
            Console.WriteLine(category);
        }
    }
}

class Product
{
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
```

Expected output:
```text
Electronics
```

# Common mistakes

* **Mixing up delegate and expression parameters**: Passing code that relies on side effects or unsupported runtime calls inside queryable predicates, leading to translation failures.
* **Accidental client-side evaluation**: Calling methods that the query provider cannot translate without realizing it, which can accidentally pull entire tables into client memory before filtering [https://learn.microsoft.com/en-us/dotnet/api/system.linq.queryable].
* **Forgetting when execution happens**: Assuming queries execute when written rather than when enumerated or when terminal methods like `ToList` are called [https://learn.microsoft.com/en-us/dotnet/csharp/linq/].

# Knowledge checks with answers

1. **Question**: What is the primary structural difference between operators in `System.Linq.Enumerable` and `System.Linq.Queryable`?
   - **Answer**: `Enumerable` operators accept standard delegates (`Func<T>`), whereas `Queryable` operators accept expression trees (`Expression<Func<T>>`) designed for remote provider translation [https://learn.microsoft.com/en-us/dotnet/api/system.linq.queryable].

2. **Question**: What happens when you invoke `AsQueryable` followed by `AsEnumerable` in a query chain?
   - **Answer**: On this ordinary array, `AsQueryable` supplies an in-memory queryable wrapper. `AsEnumerable` changes subsequent overload binding to `Enumerable` but remains deferred; enumeration later runs the upstream in-memory query and the downstream operators.

3. **Question**: Why might a query throw a provider translation failure exception?
   - **Answer**: It occurs when a query provider encounters expression tree nodes or C# constructs that it does not know how to translate into the target query language (such as SQL) [https://learn.microsoft.com/en-us/dotnet/api/system.linq.iqueryprovider].
