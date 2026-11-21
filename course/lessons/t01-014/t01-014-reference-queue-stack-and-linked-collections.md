
# collections arrays list dictionary set stack queue concurrent and immutable collections — Reference: FIFO, LIFO, linked lists, bit arrays, and specialized sequence structures

# Scope and version
This lesson covers specialized sequence and bit-level collections in .NET 11. It focuses on `Queue<T>`, `Stack<T>`, `LinkedList<T>`, and `BitArray`. These collections are part of the `System.Collections.Generic` or `System.Collections` namespaces. For version-specific details, consult the [.NET API reference](https://learn.microsoft.com/en-us/dotnet/standard/collections/).

# How this group fits the mental model
Collections are tools for managing data based on how you need to access it. While `List<T>` provides indexed access, this group provides specialized access patterns:
* **FIFO (First-In-First-Out):** `Queue<T>` processes items in the order they arrived.
* **LIFO (Last-In-First-Out):** `Stack<T>` processes the most recently added item first.
* **Linked Nodes:** `LinkedList<T>` allows efficient insertion and removal at any point if you have a reference to a node.
* **Bit-level:** `BitArray` manages compact boolean flags.

# Supplied names explained

### Queue<T> and Stack<T>
* `Queue<T>`: A collection that stores objects in a FIFO order.
* `Queue<T>.Enqueue`: Adds an object to the end of the `Queue<T>`.
* `Queue<T>.Dequeue`: Removes and returns the object at the beginning; throws when empty.
* `Queue<T>.Count`: Gets the number of queued elements.
* `Queue<T>.Clear`: Removes all elements while retaining capacity.
* `Queue<T>.ToArray`: Copies queue elements to a new array in dequeue order.
* `Queue<T>.TryDequeue`: Attempts to remove and return the object at the beginning; returns false if empty.
* `Queue<T>.Peek`: Returns the object at the beginning without removing it.
* `Queue<T>.TryPeek`: Attempts to return the object at the beginning without removing it; returns false if empty.
* `Queue<T>.EnsureCapacity`: Sets the capacity to the specified number of elements to avoid reallocations.
* `Queue<T>.TrimExcess`: Reduces capacity to `Count` when below its trimming threshold; it may do nothing when nearly full.
* `Stack<T>`: A collection that stores objects in a LIFO order.
* `Stack<T>.Push`: Inserts an object at the top of the `Stack<T>`.
* `Stack<T>.Pop`: Removes and returns the object at the top; throws when empty.
* `Stack<T>.Count`: Gets the number of stacked elements.
* `Stack<T>.Clear`: Removes all elements while retaining capacity.
* `Stack<T>.ToArray`: Copies elements into a new array in LIFO enumeration order (top first).
* `Stack<T>.TryPop`: Attempts to remove and return the object at the top; returns false if empty.
* `Stack<T>.Peek`: Returns the object at the top without removing it.
* `Stack<T>.TryPeek`: Attempts to return the object at the top without removing it; returns false if empty.
* `Stack<T>.EnsureCapacity`: Sets the capacity to the specified number of elements.
* `Stack<T>.TrimExcess`: Reduces capacity to `Count` when below its trimming threshold; it may do nothing when nearly full.

### LinkedList<T>
* `LinkedList<T>`: A doubly linked list where each node points to the next and previous nodes.
* `LinkedListNode<T>`: A node within a `LinkedList<T>`.
* `LinkedList<T>.AddFirst`: Adds a new node at the start of the list.
* `LinkedList<T>.AddLast`: Adds a new node at the end of the list.
* `LinkedList<T>.AddBefore`: Adds a new node before an existing node.
* `LinkedList<T>.AddAfter`: Adds a new node after an existing node.
* `LinkedList<T>.Find`: Searches for the first node containing a specific value.
* `LinkedList<T>.FindLast`: Searches for the last node containing a specific value.
* `LinkedList<T>.Remove`: Removes the first occurrence of a specific value.
* `LinkedList<T>.RemoveFirst`: Removes the node at the start.
* `LinkedList<T>.RemoveLast`: Removes the node at the end.
* `LinkedList<T>.Clear`: Removes all nodes.
* `LinkedList<T>.Count`: Gets the number of nodes.
* `LinkedList<T>.First`: Gets the first node, or `null` when empty.
* `LinkedList<T>.Last`: Gets the last node, or `null` when empty.
* `LinkedList<T>.Contains`: Checks for an equal value by traversal.
* `LinkedList<T>.Remove(LinkedListNode<T>)`: Removes a particular node in O(1) when it belongs to this list.
* `LinkedList<T>.CopyTo`: Copies values to a one-dimensional array.

### BitArray
* `BitArray`: A compact array of boolean values.
* `BitArray.Get`: Gets the value of the bit at a specific index.
* `BitArray.Set`: Sets the value of the bit at a specific index.
* `BitArray.SetAll`: Sets all bits to a specific value.
* `BitArray.And`: Performs a bitwise AND operation.
* `BitArray.Or`: Performs a bitwise OR operation.
* `BitArray.Xor`: Performs a bitwise XOR operation.
* `BitArray.Not`: Inverts all bit values.
* `BitArray.Length`: Gets or sets the number of bits.

### Comparisons
* `Queue<T> versus ConcurrentQueue<T>`: `Queue<T>` is not thread-safe; `ConcurrentQueue<T>` is designed for multi-threaded access.
* `Stack<T> versus ConcurrentStack<T>`: `Stack<T>` is not thread-safe; `ConcurrentStack<T>` is designed for multi-threaded access.
* `LinkedList<T> versus List<T>`: `List<T>` provides fast indexed access; `LinkedList<T>` provides fast insertion/removal if you already have a node reference.

# Cross-item comparison
* **Queue vs Stack:** Use `Queue<T>` when order of arrival matters (e.g., print jobs). Use `Stack<T>` for backtracking or undo operations.
* **LinkedList vs List:** `List<T>` is usually faster due to memory locality. Use `LinkedList<T>` only if you frequently insert/remove items in the middle of the sequence.
* **Concurrent variants:** Use `ConcurrentQueue<T>` or `ConcurrentStack<T>` when their thread-safe per-operation contract fits shared access. External locking is another option, especially when an invariant spans multiple operations.

# Examples
```csharp
// Queue example
Queue<string> tasks = new Queue<string>();
tasks.Enqueue("Task 1");
tasks.Enqueue("Task 2");
string next = tasks.Dequeue(); // Returns "Task 1"

// LinkedList example
LinkedList<int> list = new LinkedList<int>();
var node = list.AddFirst(10);
list.AddAfter(node, 20); // List is now 10 -> 20
```

# Common mistakes
* **Thread Safety:** Using `Queue<T>` or `Stack<T>` in a multi-threaded environment without external locking. Use the `Concurrent` namespace equivalents instead.
* **Performance:** Using `LinkedList<T>` when you actually need indexed access. `List<T>` is almost always the better choice for general-purpose storage.
* **Empty Access:** Calling `Pop()` or `Dequeue()` on an empty collection throws an exception. Always check `Count` or use the `Try...` methods (e.g., `TryDequeue`).

# Knowledge checks with answers
1. **Question:** Which collection should you use for a "First-In-First-Out" requirement?
   **Answer:** `Queue<T>`.
2. **Question:** How do you safely remove an item from a `Stack<T>` if you are unsure if it is empty?
   **Answer:** Use `Stack<T>.TryPop`.
3. **Question:** Is `LinkedList<T>` faster than `List<T>` for random access by index?
   **Answer:** No, `List<T>` is faster for indexed access; `LinkedList<T>` is optimized for insertion/removal at known node positions.
