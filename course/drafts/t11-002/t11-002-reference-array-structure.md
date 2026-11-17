<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# arrays and dynamic arrays for algorithmic problem solving — Reference: Array structure and access

*This is an automatically generated draft.*

# Scope and version

This lesson covers the fundamental structural properties of arrays used in algorithmic problem solving. It focuses on how data is organized in memory and how we interact with that data using indices. The concepts apply to timeless computer science principles and specific implementations in C# and .NET as of the 2026-11-17 update.

# How this group fits the mental model

Think of an array as a **contiguous sequence** (a row of items with no gaps) of lockers in a hallway. 
*   The **Fixed-size array** is the hallway itself; once built, you cannot easily add more lockers to that specific row.
*   **Zero-based indexing** is the numbering system on the locker doors. In computing, we start counting at 0.
*   **Array length** tells you how many lockers are in the row.
*   **Indexed element access** is like having a specific locker number and walking directly to it to grab what is inside.
*   **Array traversal** is like a janitor walking down the hallway, opening every locker one by one from start to finish.

This model helps you understand why looking up a specific item is very fast (you know exactly where it is), but finding a specific value without knowing its index is slower (you have to check every locker).

# Supplied names explained

Each of the following terms describes a specific rule or behavior of how arrays function in memory and code.

*   `Fixed-size array`: This refers to an array that has a set number of slots determined at the moment it is created. In many languages, including C#, once you allocate (set aside memory for) a fixed-size array, you cannot grow or shrink it. If you need more space, you must create a new, larger array and copy the data over.
*   `Zero-based indexing`: This is the convention where the first element of an array is accessed using the number `0`. The second element is at index `1`, and the last element is at index `length - 1`. This is a standard in C# and most modern programming languages.
*   `Array length`: This represents the total number of elements an array can hold. It is a fixed property of the array. For example, an array with a length of 5 has indices 0, 1, 2, 3, and 4.
*   `Contiguous sequence`: The array's element slots are laid out consecutively in managed memory, which lets indexed access calculate a slot from the array and index. For an array of object references, the references occupy those slots; the referenced objects themselves can be elsewhere in memory.
*   `Indexed element access`: This is the ability to retrieve or change a value at a specific position using its index (e.g., `myArray[3]`). Under the usual random-access machine model, indexed element access takes O(1) time because the address is computed from the base and index. Real elapsed time and bounds checks still depend on the runtime and hardware.
*   `Array traversal`: This is the process of visiting every element in the array, usually starting from index 0 and moving to the end. This is typically done using a loop (like a `for` or `foreach` loop) to perform an action on every item, such as searching for a value or calculating a sum.
*   `Empty array`: An array that has an `Array length` of zero. It contains no elements but is still a valid array object with runtime overhead. It is often returned to represent no results while avoiding a null reference.

# Cross-item comparison

*   **Indexed element access vs. Array traversal**: `Indexed element access` is a "constant time" operation because you go directly to one spot. `Array traversal` is a "linear time" operation because the time it takes grows as the `Array length` grows.
*   **Fixed-size array vs. Empty array**: A `Fixed-size array` can have any length defined at creation, whereas an `Empty array` is a specific case where that length is exactly zero.
*   **Zero-based indexing and Array length**: These are mathematically linked. The highest valid index for `Indexed element access` is always `Array length - 1`.

# Examples

The following C# snippet demonstrates how these structural components work together in a standard algorithmic context.

```csharp
// 1. Creating a Fixed-size array of length 3
// This is a Contiguous sequence in memory.
int[] scores = new int[3]; 

// 2. Indexed element access (Zero-based indexing)
scores[0] = 90; // First element
scores[1] = 85; // Second element
scores[2] = 100; // Third element (Length - 1)

// 3. Array length
int totalElements = scores.Length; // Returns 3

// 4. Array traversal
// We visit every element to calculate a total.
int sum = 0;
for (int i = 0; i < scores.Length; i++) 
{
    sum += scores[i]; 
}

// 5. Empty array
// Useful when you have no data but want to avoid returning 'null'.
int[] noScores = new int[0]; 
```

# Common mistakes

*   **Off-by-one errors**: Attempting to access `array[array.Length]`. Because of `Zero-based indexing`, the last valid index is always one less than the length. Accessing the length itself will cause an "Index Out of Range" error.
*   **Confusing Length with Index**: New learners often try to use the count of items (1, 2, 3) to access elements instead of the indices (0, 1, 2).
*   **Assuming Fixed-size arrays can grow**: A common mistake is trying to add a 6th item to an array of length 5. To "add" items, you must use a dynamic array (like `List<T>` in C#) or manually create a new, larger `Fixed-size array`.
*   **Null vs. Empty**: Treating a `null` array the same as an `Empty array`. An `Empty array` is a valid object with a length of 0; a `null` array is a missing reference that will crash your program if you try to check its length.

# Knowledge checks with answers

**Questions:**
1. If an array has an `Array length` of 10, what is the index of the very last element?
2. Why is `Indexed element access` faster than `Array traversal` for finding a specific value at a known position?
3. What term describes the fact that array elements are stored side-by-side in memory?
4. True or False: You can change the size of a `Fixed-size array` after it has been created.

**Answers:**
1. **9** (Because of `Zero-based indexing`, the last index is `Length - 1`).
2. Because the index determines one slot in O(1) time under the usual model; traversal is needed when the value is unknown and may require examining O(n) elements.
3. **Contiguous sequence**.
4. **False**. You must create a new array of a different size and move the data.

***

**Sources:**
* [Microsoft Learn: C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)
* [OpenDSA: Array-based Lists](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html)
