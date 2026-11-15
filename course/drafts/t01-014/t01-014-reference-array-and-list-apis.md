<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# collections arrays list dictionary set stack queue concurrent and immutable collections — Reference: Fixed arrays, resizable List<T>, their current core methods, and performance

*Automatically generated draft.*

# Scope and version
This lesson covers the core API surface for `Array` and `List<T>` in .NET 11. These types represent the fundamental building blocks for indexed, sequential storage. This content is based on the .NET 11 stable collection API surface as of 2026-11-14.

# How this group fits the mental model
In .NET, collections are chosen based on access patterns and memory requirements. 
*   **`Array`** provides fixed-length, contiguous indexed storage. It can be compact when size is fixed, though the best memory choice depends on element types, layout, and usage.
*   **`List<T>`** is a wrapper around an array that manages resizing automatically. It provides a dynamic, indexed sequence, making it the default choice for general-purpose, ordered data storage.

# Supplied names explained

### Array
*   `Array`: The base class for all arrays in .NET. It provides static methods for manipulating, searching, and sorting arrays.
*   `Array.Length`: Gets the total number of elements in all dimensions of the array.
*   `Array.Rank`: Gets the number of dimensions in the array.
*   `Array.GetLength`: Gets the number of elements in the specified dimension.
*   `Array.GetLowerBound`: Gets the index of the first element in the specified dimension.
*   `Array.GetUpperBound`: Gets the index of the last element in the specified dimension.
*   `Array.CreateInstance`: Creates a new array of a specified type and length dynamically.
*   `Array.Copy`: Copies a range of elements from one array to another.
*   `Array.ConstrainedCopy`: Copies a range of elements with a guarantee that the operation either succeeds completely or leaves the destination unchanged.
*   `Array.Clear`: Sets a range of elements in the array to their default values.
*   `Array.Fill`: Fills a range of elements with a specified value.
*   `Array.IndexOf`: Searches for the first occurrence of a value and returns its index.
*   `Array.LastIndexOf`: Searches for the last occurrence of a value and returns its index.
*   `Array.Find`: Searches for an element that matches the conditions defined by a predicate.
*   `Array.FindAll`: Retrieves all elements that match the conditions defined by a predicate.
*   `Array.FindIndex`: Searches for the index of the first element that matches a predicate.
*   `Array.FindLast`: Searches for the last element that matches a predicate.
*   `Array.FindLastIndex`: Searches for the index of the last element that matches a predicate.
*   `Array.Exists`: Determines whether the array contains elements that match a predicate.
*   `Array.TrueForAll`: Determines whether every element in the array matches a predicate.
*   `Array.Sort`: Sorts the elements in the array.
*   `Array.BinarySearch`: Searches for a specific element using a binary search algorithm.
*   `Array.Reverse`: Reverses the order of elements in the array.
*   `Array.Resize`: Changes the number of elements in a one-dimensional array.
*   `Array.Clone`: Creates a shallow copy of the array.

### List<T>
*   `List<T>`: A resizable, generic collection of objects that can be accessed by index.
*   `List<T>.Capacity`: Gets or sets the number of elements the list can hold before resizing.
*   `List<T>.Count`: Gets the number of elements actually contained in the list.
*   `List<T>.Add`: Adds an object to the end of the list.
*   `List<T>.AddRange`: Adds the elements of a collection to the end of the list.
*   `List<T>.Insert`: Inserts an element at a specified index.
*   `List<T>.InsertRange`: Inserts a collection of elements at a specified index.
*   `List<T>.Remove`: Removes the first occurrence of a specific object.
*   `List<T>.RemoveAt`: Removes the element at the specified index.
*   `List<T>.RemoveRange`: Removes a range of elements.
*   `List<T>.RemoveAll`: Removes all elements that match a predicate.
*   `List<T>.Clear`: Removes all elements from the list.
*   `List<T>.Contains`: Determines whether an element is in the list.
*   `List<T>.IndexOf`: Returns the index of the first occurrence of a value.
*   `List<T>.LastIndexOf`: Returns the index of the last occurrence of a value.
*   `List<T>.Find`: Searches for the first element matching a predicate.
*   `List<T>.FindAll`: Returns all elements matching a predicate.
*   `List<T>.FindIndex`: Returns the index of the first element matching a predicate.
*   `List<T>.FindLast`: Returns the last element matching a predicate.
*   `List<T>.FindLastIndex`: Returns the index of the last element matching a predicate.
*   `List<T>.Exists`: Checks if any element matches a predicate.
*   `List<T>.TrueForAll`: Checks if all elements match a predicate.
*   `List<T>.ForEach`: Performs an action on each element of the list.
*   `List<T>.GetRange`: Returns a shallow copy of a range of elements.
*   `List<T>.CopyTo`: Copies the entire list to a compatible one-dimensional array.
*   `List<T>.ToArray`: Copies the list elements to a new array.
*   `List<T>.AsReadOnly`: Returns a read-only wrapper for the current list.
*   `List<T>.BinarySearch`: Searches for an element using binary search.
*   `List<T>.Sort`: Sorts the elements in the list.
*   `List<T>.Reverse`: Reverses the order of elements in the list.
*   `List<T>.EnsureCapacity`: Sets the capacity to at least the specified number of elements.
*   `List<T>.TrimExcess`: Sets the capacity to the actual number of elements in the list.
*   `List<T>.GetEnumerator`: Returns an enumerator that iterates through the list.
*   `List<T>.Capacity growth`: The internal mechanism where the list doubles its capacity when the current capacity is exceeded.

### Comparison
*   `Array versus List<T>`: A conceptual comparison highlighting that `Array` is fixed-size and `List<T>` is dynamic.

# Cross-item comparison
The primary distinction is between `Array` and `List<T>`. `Array` is a low-level, fixed-size structure. `List<T>` is a high-level, resizable structure that manages an internal `Array`. Use `Array` when the size is fixed to minimize memory overhead; use `List<T>` when you need to add or remove items frequently.

# Examples
```csharp
// Array example
int[] numbers = new int[3] { 1, 2, 3 };
Array.Resize(ref numbers, 4); // Array.Resize creates a new array internally

// List<T> example
List<string> names = new List<string> { "Alice", "Bob" };
names.Add("Charlie"); // List<T>.Add
int index = names.FindIndex(n => n == "Bob"); // List<T>.FindIndex
```

# Common mistakes
1.  **Resizing Arrays:** Calling `Array.Resize` frequently is expensive because it creates a new array and copies all elements. Use `List<T>` if you need to resize often.
2.  **Ignoring Capacity:** For `List<T>`, if you know the number of items in advance, use the constructor that accepts an initial capacity to avoid multiple internal reallocations.
3.  **Confusing Count and Capacity:** `List<T>.Count` is the number of items currently in the list; `List<T>.Capacity` is the number of items the list *can* hold before it must resize.

# Knowledge checks with answers
1.  **Question:** Which collection type should you use if you need to frequently add and remove items?
    *   **Answer:** `List<T>`, because it manages dynamic resizing automatically.
2.  **Question:** What happens to an `Array` when you call `Array.Resize`?
    *   **Answer:** A new array is created with the new size, and the elements from the old array are copied into it.
3.  **Question:** How can you prevent `List<T>` from reallocating memory multiple times when adding a large number of items?
    *   **Answer:** Use `List<T>.EnsureCapacity` or set the initial capacity in the constructor.

*Source: [https://learn.microsoft.com/en-us/dotnet/standard/collections/](https://learn.microsoft.com/en-us/dotnet/standard/collections/)*
