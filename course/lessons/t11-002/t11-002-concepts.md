
# arrays and dynamic arrays for algorithmic problem solving — Core concepts and how they fit together

*Draft: Automatically generated.*

# Learning objectives
* Understand the fundamental structure of arrays and dynamic arrays.
* Distinguish between fixed-size and dynamic memory management.
* Identify the performance implications of array operations.
* Learn to navigate multidimensional array shapes and common algorithmic pitfalls.

# Prerequisites
* Basic familiarity with programming variables and loops.
* Understanding of memory as a sequence of storage locations.

# Core concepts
An array is a data structure that stores an ordered sequence of elements in a **contiguous sequence** (a block of adjacent element slots). Under the usual random-access machine model, **indexed element access** takes O(1) time using **zero-based indexing**.

*   **Fixed-size array**: A structure with a set **Array length** defined at creation. It cannot grow or shrink.
*   **Dynamic array**: A structure that manages a **Logical count** (the number of items currently in use) and an allocated **Capacity** (the total space available). When the count reaches capacity, the structure performs a **Resize and copy** operation to a larger memory block.
*   **Multidimensional shapes**: Arrays can be structured as a **Rectangular multidimensional array** (a grid with fixed dimensions) or a **Jagged array** (an array of arrays, where each row can have a different length).

Source: [https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html)

# Mechanisms and relationships
The primary trade-off in array-based design is between access speed and flexibility.

1.  **Access vs. Mutation**: Reading an element by index is constant time. Inserting or removing at index `i` in an ordered array shifts the suffix after that index, so the work is proportional to the number of elements shifted. An insertion or removal at the end needs no shift; append may still resize when capacity is full.
2.  **Append Performance**: A single **Append** might trigger a resize and copy (linear worst case). With geometric capacity growth, the **Amortized append cost** across a sequence is constant because those resizes happen infrequently.
3.  **Space Management**: You must choose between an **In-place update** (modifying the existing array to save memory) or using an **Auxiliary array** (creating a new array to store results, which is safer but uses more memory).

Source: [https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity)

# Worked examples
Consider a dynamic array starting with a capacity of 2:
1.  **Start**: `[ ]` (Logical count: 0, Capacity: 2).
2.  **Append(10)**: `[10]` (Count: 1, Capacity: 2).
3.  **Append(20)**: `[10, 20]` (Count: 2, Capacity: 2).
4.  **Append(30)**: The array is full. It triggers **Capacity growth** (e.g., doubling to 4), performs a **Resize and copy** of existing elements, and adds 30: `[10, 20, 30, _]` (Count: 3, Capacity: 4).

For **Array traversal**, a **Linear scan** is the standard approach:
```csharp
// Snippet: Standard traversal
for (int i = 0; i < array.Length; i++) {
    // Process array[i]
}
```
*Context: This assumes a standard 1D array.*

Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)

# Misconceptions and edge cases
*   **Off-by-one error**: A common mistake when calculating **Index boundary** conditions. Always remember that the last valid index is `length - 1`.
*   **Empty array**: Always verify if an array is empty before accessing index 0 to avoid runtime errors.
*   **Mutation versus copy**: Modifying an array in-place is efficient but can lead to bugs if the original data is needed later.
*   **Row-major traversal**: When working with multidimensional arrays, ensure your loops match the memory layout (usually row-by-row) to maintain performance.

# Knowledge checks with answers
1.  **Question**: Why is the amortized cost of appending to a dynamic array considered constant?
    *   **Answer**: Although a resize operation is expensive, it happens rarely enough that the cost is spread out over many cheap appends.
2.  **Question**: What is the difference between a rectangular and a jagged array?
    *   **Answer**: A rectangular array has fixed dimensions for all rows, while a jagged array is an array of arrays where each sub-array can have a different length.
3.  **Question**: If you need to insert an element at the beginning of a large array, what is the performance impact?
    *   **Answer**: It is expensive because every existing element must be shifted one position to the right to maintain the order.
