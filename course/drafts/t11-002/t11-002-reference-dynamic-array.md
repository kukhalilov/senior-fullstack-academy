<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# arrays and dynamic arrays for algorithmic problem solving — Reference: Dynamic-array structure and resizing

*This is an automatically generated draft.*

# Scope and version
This lesson covers the fundamental structure and mechanics of dynamic arrays as used in algorithmic problem solving. It focuses on the internal management of memory and performance characteristics. The content is based on timeless array algorithms and current C#/.NET collection references as of 2026-11-14.

# How this group fits the mental model
In algorithmic problem solving, an array is a contiguous block of memory. A **fixed-size array** has a rigid limit, making it fast for reading but difficult to grow. A **dynamic array** solves this by maintaining a "logical" view of the data that is smaller than the "physical" memory reserved. When the logical data fills the physical space, the structure automatically requests a larger block of memory and moves the data. This allows you to treat the collection as if it can grow indefinitely, while still benefiting from the speed of direct indexed access.

# Supplied names explained
* `Dynamic array`: A data structure that provides a resizable, contiguous sequence of elements. It manages both the data currently in use and the extra "buffer" space reserved for future growth.
* `Logical count`: The number of elements currently stored in the dynamic array that are considered "active" or "in use" by the user.
* `Capacity`: The total number of elements the dynamic array can hold before it is forced to request more memory from the system.
* `Capacity growth`: The strategy used to increase the size of the underlying memory buffer, typically by doubling the current capacity to ensure that resizing happens infrequently.
* `Resize and copy`: The internal process triggered when the `Logical count` reaches the `Capacity`. The structure allocates a new, larger memory block and copies all existing elements from the old block to the new one.
* `Append`: The operation of adding an element to the end of the dynamic array. If space exists, it is a simple assignment; if not, it triggers a resize.
* `Amortized append cost`: The average time complexity of an `Append` operation over a long sequence of additions. While a single `Append` might be slow due to a resize, the cost is spread out, resulting in constant-time performance on average.
* `Insertion at index`: The operation of placing an element at a specific position. This requires shifting all subsequent elements to the right to maintain the contiguous order, which is an expensive operation.
* `Removal at index`: The operation of deleting an element at a specific position. This requires shifting all subsequent elements to the left to fill the gap, which is also an expensive operation.

# Cross-item comparison
Within the dynamic array structure, there is a critical distinction between the `Logical count` and the `Capacity`. The `Logical count` represents the user's data, while the `Capacity` represents the system's reserved memory. 

Regarding performance, `Append` is generally efficient because of its `Amortized append cost`. In contrast, `Insertion at index` and `Removal at index` do not share this efficiency; they are inherently slower because they require shifting elements, regardless of the available `Capacity`.

# Examples
The following conceptual example demonstrates how a dynamic array handles growth:

1. **Start**: `Logical count` = 2, `Capacity` = 2. Array: `[A, B]`
2. **Append 'C'**: The array is full.
3. **Resize and copy**: A new buffer of `Capacity` 4 is created. `[A, B]` are copied over.
4. **Final state**: `Logical count` = 3, `Capacity` = 4. Array: `[A, B, C, _]` (where `_` is empty space).

# Common mistakes
* **Confusing Count and Capacity**: Attempting to access an index based on the `Capacity` rather than the `Logical count` will lead to reading uninitialized or "garbage" data.
* **Ignoring Shift Costs**: Beginners often assume that because `Append` is fast, all modifications (like inserting at index 0) are also fast. Always remember that inserting or removing from the middle of a dynamic array requires shifting elements, which is an $O(n)$ operation.
* **Frequent Resizing**: Manually setting a very small initial capacity when you know you will have thousands of elements causes unnecessary `Resize and copy` operations, which degrades performance.

# Knowledge checks with answers
1. **Question**: If a dynamic array has a `Logical count` of 5 and a `Capacity` of 10, what happens when you `Append` an element?
   * **Answer**: The element is added to the 6th position (index 5), and the `Logical count` becomes 6. No `Resize and copy` is triggered because the `Capacity` is sufficient.

2. **Question**: Why is the `Amortized append cost` considered constant time?
   * **Answer**: Because the expensive `Resize and copy` operation happens so infrequently (due to exponential `Capacity growth`) that when the total cost is averaged over many operations, the cost per operation remains constant.

3. **Question**: Is `Insertion at index` affected by the `Capacity`?
   * **Answer**: No. While `Insertion at index` might trigger a resize if the array is full, the primary cost of the operation is the shifting of elements, which must occur regardless of whether the array has extra `Capacity`.

*Source: [OpenDSA ListArray](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html), [Microsoft List<T>.Capacity](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity)*
