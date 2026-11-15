<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# collections arrays list dictionary set stack queue concurrent and immutable collections — Reference: HashSet, SortedSet, PriorityQueue, and order/uniqueness operations

# Scope and version
This reference lesson covers the exact API inventory for **set-and-priority-collections** within the .NET 11 stable collection API surface checked on 2026-11-14. This group focuses on uniqueness-enforcing structures (`HashSet<T>`, `SortedSet<T>`) and priority-based scheduling (`PriorityQueue<TElement,TPriority>`), along with set operations, alternate-key lookups, views, and structural comparisons. 
Sources supporting this release scope and API surface include the official Microsoft .NET API reference and collection design guides (see [Microsoft .NET Collections Documentation](https://learn.microsoft.com/en-us/dotnet/standard/collections/) and [System.Collections.Generic API](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic)).

# How this group fits the mental model
Collections package a storage shape and a set of operations. You choose a collection based on access and update patterns, ordering rules, key semantics, concurrency requirements, and data lifetime. 

Within that model:
- **Sets (`HashSet<T>`, `SortedSet<T>`)** solve the problem of enforcing uniqueness while offering fast lookup or sorted iteration. They represent mathematical sets, letting you perform union, intersection, subset, and difference calculations without writing manual loops.
- **Priority queues (`PriorityQueue<TElement,TPriority>`)** solve the problem of processing elements by priority rather than insertion order (FIFO) or reversal (LIFO). They are essential for schedulers, pathfinding algorithms, and greedy work queues where the most important item must surface instantly.

# Supplied names explained
This reference catalog explains every item assigned to the set-and-priority-collections inventory group. Each entry corresponds directly to a provided API member or comparison topic.

* `HashSet<T>`
  - Purpose and behavior: A hash-based, unordered collection that contains unique elements of type `T`. It provides fast O(1) average time complexity for lookups, additions, and removals.

* `HashSet<T>.Add`
  - Purpose and behavior: Attempts to insert a specified element into the hash set. Returns `true` if the element was added successfully, or `false` if it was already present.

* `HashSet<T>.TryGetValue`
  - Purpose and behavior: Searches the set for a specified value and returns the equal value stored in the set if found, allowing reference preservation or structural canonicalization.

* `HashSet<T>.GetAlternateLookup<TAlternate>`
  - Purpose and behavior: Retrieves an alternate lookup structure using a compatible alternate type `TAlternate` (such as `ReadOnlySpan<char>` for `string`), avoiding temporary allocations during lookups.

* `HashSet<T>.TryGetAlternateLookup<TAlternate>`
  - Purpose and behavior: Attempts to retrieve an alternate lookup instance for a compatible type `TAlternate`, returning a success boolean instead of throwing if the alternate type is unsupported.

* `HashSet<T>.AlternateLookup<TAlternate>`
  - Purpose and behavior: Represents an alternate lookup view over a `HashSet<T>` that accepts type `TAlternate` for zero-allocation or specialized hashing operations.

* `HashSet<T>.AlternateLookup<TAlternate>.Add`
  - Purpose and behavior: Adds an element using the alternate type `TAlternate` directly into the underlying hash set through the alternate lookup view.

* `HashSet<T>.AlternateLookup<TAlternate>.Contains`
  - Purpose and behavior: Determines whether the alternate lookup view contains a specified value expressed via type `TAlternate`.

* `HashSet<T>.AlternateLookup<TAlternate>.Remove`
  - Purpose and behavior: Removes an element matching the specified `TAlternate` value from the underlying hash set.

* `HashSet<T>.AlternateLookup<TAlternate>.TryGetValue`
  - Purpose and behavior: Finds an element matching the specified `TAlternate` value and retrieves the stored value from the underlying set.

* `HashSet<T>.Contains`
  - Purpose and behavior: Returns a boolean indicating whether a specified item exists within the hash set in O(1) average time.

* `HashSet<T>.Remove`
  - Purpose and behavior: Removes a specified item from the hash set, returning `true` if the item was found and deleted.

* `HashSet<T>.RemoveWhere`
  - Purpose and behavior: Removes all elements that match the conditions defined by a specified predicate function from the set.

* `HashSet<T>.Clear`
  - Purpose and behavior: Removes all elements from the hash set, resetting its count to zero while retaining allocated internal storage capacity.

* `HashSet<T>.CopyTo`
  - Purpose and behavior: Copies the elements of the hash set to a compatible one-dimensional array, starting at a specified array index.

* `HashSet<T>.EnsureCapacity`
  - Purpose and behavior: Increases the internal capacity of the hash set to accommodate at least a specified number of elements without automatic resizing overhead.

* `HashSet<T>.TrimExcess`
  - Purpose and behavior: Sets the capacity of the hash set to the actual number of elements it contains, freeing unused memory if the set is sparse.

* `HashSet<T>.UnionWith`
  - Purpose and behavior: Modifies the current hash set to contain all elements that are present in itself, the specified collection, or both (set union).

* `HashSet<T>.IntersectWith`
  - Purpose and behavior: Modifies the current hash set to contain only elements that are present in both itself and a specified collection (set intersection).

* `HashSet<T>.ExceptWith`
  - Purpose and behavior: Removes all elements in a specified collection from the current hash set (set difference).

* `HashSet<T>.SymmetricExceptWith`
  - Purpose and behavior: Modifies the current hash set to contain only elements that are present either in the set or in a specified collection, but not in both (symmetric difference).

* `HashSet<T>.IsSubsetOf`
  - Purpose and behavior: Determines whether the hash set is a subset of a specified collection (whether all elements of the set exist in the collection).

* `HashSet<T>.IsProperSubsetOf`
  - Purpose and behavior: Determines whether the hash set is a proper subset of a specified collection (is a subset, but is not equal to it).

* `HashSet<T>.IsSupersetOf`
  - Purpose and behavior: Determines whether the hash set is a superset of a specified collection (whether the set contains all elements of the collection).

* `HashSet<T>.IsProperSupersetOf`
  - Purpose and behavior: Determines whether the hash set is a proper superset of a specified collection (is a superset, and contains additional elements).

* `HashSet<T>.Overlaps`
  - Purpose and behavior: Determines whether the hash set and a specified collection share any common elements.

* `HashSet<T>.SetEquals`
  - Purpose and behavior: Determines whether the hash set and a specified collection contain the exact same elements, regardless of order.

* `SortedSet<T>`
  - Purpose and behavior: A self-balancing binary search tree collection that maintains unique elements in sorted order, providing O(log n) performance for searches, insertions, and removals.

* `SortedSet<T>.Min`
  - Purpose and behavior: Gets the minimum value stored in the sorted set according to its comparer.

* `SortedSet<T>.Max`
  - Purpose and behavior: Gets the maximum value stored in the sorted set according to its comparer.

* `SortedSet<T>.GetViewBetween`
  - Purpose and behavior: Returns a subset view of the sorted set containing only elements that fall within a specified lower and upper bound.

* `SortedSet<T>.Reverse`
  - Purpose and behavior: Returns an enumerator that iterates through the sorted set in reverse order.

* `SortedSet<T>.TryGetValue`
  - Purpose and behavior: Searches the sorted set for a specified value and returns the matching stored element if found.

* `SortedSet<T>.Comparer`
  - Purpose and behavior: Gets the `IComparer<T>` object that is used to order values in the sorted set.

* `PriorityQueue<TElement,TPriority>`
  - Purpose and behavior: A binary heap structure that stores elements with associated priorities, allowing efficient retrieval and removal of the element with the lowest priority value (min-heap behavior by default).

* `PriorityQueue<TElement,TPriority>.Enqueue`
  - Purpose and behavior: Adds an element with a specified priority into the priority queue.

* `PriorityQueue<TElement,TPriority>.Dequeue`
  - Purpose and behavior: Removes and returns the minimal-priority element from the priority queue.

* `PriorityQueue<TElement,TPriority>.TryDequeue`
  - Purpose and behavior: Attempts to remove and return the minimal-priority element, returning `false` if the queue is empty.

* `PriorityQueue<TElement,TPriority>.Peek`
  - Purpose and behavior: Returns the minimal-priority element from the queue without removing it.

* `PriorityQueue<TElement,TPriority>.TryPeek`
  - Purpose and behavior: Attempts to return the minimal-priority element without removing it, returning `false` if the queue is empty.

* `PriorityQueue<TElement,TPriority>.EnqueueDequeue`
  - Purpose and behavior: Efficiently inserts a new element into the priority queue and immediately removes and returns the minimal-priority element in a single operation.

* `PriorityQueue<TElement,TPriority>.DequeueEnqueue`
  - Purpose and behavior: Removes and returns the current minimal-priority element, then inserts a new element into the priority queue in an optimized operation.

* `PriorityQueue<TElement,TPriority>.EnsureCapacity`
  - Purpose and behavior: Increases the capacity of the priority queue to a specified minimum without reallocation overhead.

* `PriorityQueue<TElement,TPriority>.TrimExcess`
  - Purpose and behavior: Sets the capacity of the priority queue to the actual number of elements currently stored.

* `PriorityQueue<TElement,TPriority>.UnorderedItems`
  - Purpose and behavior: Gets an enumerable collection of items and priorities in their internal un-ordered heap layout.

* `PriorityQueue<TElement,TPriority>.Comparer`
  - Purpose and behavior: Gets the priority comparer used by the priority queue.

* `HashSet<T> versus SortedSet<T>`
  - Purpose and behavior: Compares two unique collection types: `HashSet<T>` offers O(1) hash-based lookups with no ordering guarantees, whereas `SortedSet<T>` maintains elements in sorted order via a balanced tree at O(log n) cost.

* `Priority queue versus FIFO queue`
  - Purpose and behavior: Compares scheduling models: a standard FIFO `Queue<T>` processes items strictly in insertion order, while `PriorityQueue<TElement,TPriority>` processes items ordered by their assigned priority weights.

# Cross-item comparison
- **`HashSet<T>` vs. `SortedSet<T>`**: `HashSet<T>` uses hash codes for O(1) average lookups and insertions without maintaining item order. `SortedSet<T>` uses a comparison function to maintain sorted order, yielding O(log n) operations and enabling range operations like `GetViewBetween`, `Min`, and `Max`.
- **`PriorityQueue<TElement,TPriority>` vs. FIFO `Queue<T>`**: A standard FIFO queue orders items by arrival time. A priority queue orders items by a separate priority value, surfacing the highest-priority (lowest priority value) element regardless of when it was enqueued.
- **Alternate Lookups (`HashSet<T>.GetAlternateLookup<TAlternate>`)**: Unlike standard `HashSet<T>.Contains` which requires the exact generic type `T`, alternate lookups permit searching with compatible representations (such as querying a string set using a `ReadOnlySpan<char>`) to eliminate allocations.

# Examples
The following snippet demonstrates setting up a `HashSet<T>`, performing set operations, and using a `PriorityQueue<TElement,TPriority>` for priority-based task scheduling.

```csharp
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        // 1. HashSet operations for uniqueness and set theory
        HashSet<string> allowedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Admin", "Editor"
        };

        allowedRoles.Add("Viewer");
        bool addedAgain = allowedRoles.Add("admin"); // Returns false because of OrdinalIgnoreCase
        
        Console.WriteLine($"Added 'admin' successfully? {addedAgain}");
        Console.WriteLine($"Total roles: {allowedRoles.Count}");

        // 2. PriorityQueue for scheduling tasks
        // Task name (string) and priority integer (lower number = higher priority)
        PriorityQueue<string, int> taskQueue = new PriorityQueue<string, int>();

        taskQueue.Enqueue("Generate report", 10);
        taskQueue.Enqueue("Emergency bugfix", 1);
        taskQueue.Enqueue("Send weekly newsletter", 5);

        Console.WriteLine("\nProcessing priority queue:");
        while (taskQueue.TryDequeue(out string? task, out int priority))
        {
            Console.WriteLine($"Priority {priority}: {task}");
        }
    }
}
```

Expected output:
```text
Added 'admin' successfully? false
Total roles: 3

Processing priority queue:
Priority 1: Emergency bugfix
Priority 5: Send weekly newsletter
Priority 10: Generate report
```

# Common mistakes
- **Assuming sorted order in `HashSet<T>`**: `HashSet<T>` makes no guarantees about item ordering. Enumerating a hash set yields items in an implementation-dependent hashing order. Use `SortedSet<T>` when sorted iteration is required.
- **Mutating elements used in hash codes or sorting**: If you modify a field of an object stored inside a `HashSet<T>` or `SortedSet<T>` that affects its hash code or comparison result, the collection becomes corrupt and fails to find or remove the item.
- **Confusing priority queue ordering semantics**: By default, `PriorityQueue<TElement,TPriority>` treats lower priority numbers as higher priority (min-heap). Developers accustomed to max-heap assumptions sometimes mistakenly assign high integer values expecting them to be dequeued first.

# Knowledge checks with answers
1. **Question**: What is the primary performance difference between `HashSet<T>` and `SortedSet<T>` for membership checks and insertions?
   - **Answer**: `HashSet<T>` provides O(1) average time complexity for lookups, additions, and removals using hash tables, but keeps no order. `SortedSet<T>` provides O(log n) time complexity using a self-balancing binary search tree while keeping elements strictly sorted.

2. **Question**: Why would you use `HashSet<T>.GetAlternateLookup<TAlternate>`?
   - **Answer**: It allows you to query or check containment in a `HashSet<T>` using a compatible alternate type (such as `ReadOnlySpan<char>`) without allocating temporary wrapper objects like strings.

3. **Question**: Does a standard `PriorityQueue<TElement,TPriority>` dequeue higher integer priorities first by default?
   - **Answer**: No. By default, `PriorityQueue<TElement,TPriority>` acts as a min-heap, meaning smaller priority values are dequeued first.
