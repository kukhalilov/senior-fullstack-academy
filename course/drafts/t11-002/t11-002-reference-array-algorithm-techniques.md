<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# arrays and dynamic arrays for algorithmic problem solving — Reference: Array algorithm techniques and pitfalls

*This is an automatically generated draft.*

# Scope and version
This lesson covers fundamental techniques and common pitfalls when using arrays and dynamic arrays for algorithmic problem solving. The content is based on timeless algorithmic principles and current C#/.NET collection references as of 2026-11-14. Source: [OpenDSA ListArray](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html) and [Microsoft Learn C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays).

# How this group fits the mental model
Arrays are the building blocks of efficient algorithms because they provide contiguous memory storage. In algorithmic problem solving, you must balance the speed of direct indexed access against the cost of modifying the sequence. These techniques help you manage how you traverse, transform, and protect the integrity of your data structures while respecting memory constraints.

# Supplied names explained

* `Linear scan`: The process of visiting every element in an array exactly once, usually from index `0` to `n-1`. This is the foundational technique for searching or aggregating data in an unsorted array.
* `In-place update`: A technique where you modify the original array to store results rather than creating a new one. This is highly memory-efficient (O(1) auxiliary space) but requires careful management to avoid overwriting data you still need.
* `Auxiliary array`: A secondary array created to hold intermediate results or to simplify logic. While it consumes extra memory (O(n) space), it often makes algorithms easier to implement and less prone to logic errors compared to in-place updates.
* `Index boundary`: The valid range of indices for an array, typically `0` to `length - 1`. Algorithms must explicitly check these boundaries to prevent "out of bounds" exceptions.
* `Off-by-one error`: A common logic mistake where an algorithm iterates one position too far or stops one position too early. This frequently occurs when calculating loop termination conditions or index offsets.
* `Stable relative order`: A property where the relative positions of elements with equal values remain unchanged after an operation. Maintaining stability is critical in many sorting and filtering algorithms.
* `Mutation versus copy`: The fundamental design choice between changing an existing array (mutation) or producing a new one (copy). Mutation is faster and uses less memory, while copying preserves the original state for debugging or backtracking.

# Cross-item comparison

* **Mutation versus copy** vs. **In-place update** vs. **Auxiliary array**: These three concepts define your memory strategy. An *in-place update* is a specific form of *mutation* that avoids an *auxiliary array*. Choosing between them depends on whether you have strict memory limits or need to preserve the original input.
* **Linear scan** vs. **Index boundary**: A *linear scan* is the action, while the *index boundary* is the constraint that defines the scan's limits. Failing to respect the boundary during a scan is the primary cause of an *off-by-one error*.

# Examples

### In-place update vs. Auxiliary array
To reverse an array:
* **In-place**: Swap elements at `i` and `n-1-i`. Uses O(1) extra space.
* **Auxiliary**: Create a new array of size `n` and fill it backwards. Uses O(n) extra space.

### Avoiding an off-by-one error
When performing a **linear scan** to find the maximum value:
```csharp
// Correct: loop runs from 0 up to (but not including) length
for (int i = 0; i < array.Length; i++) { 
    // Process array[i]
}
```
If you used `i <= array.Length`, you would trigger an index out of bounds error because the last valid index is `array.Length - 1`.

# Common mistakes

1. **Boundary Neglect**: Assuming an array is 1-indexed or forgetting that the last index is `length - 1`.
2. **Overwriting during In-place updates**: Modifying an element before its original value has been used for a subsequent calculation in the same loop iteration.
3. **Ignoring Stability**: Using an algorithm that reorders equal elements when the problem requirements (or downstream logic) expect the original relative order to be preserved.

# Knowledge checks with answers

1. **Question**: If you need to perform a transformation on an array but must keep the original data intact for later use, should you use an *in-place update* or an *auxiliary array*?
   * **Answer**: You should use an *auxiliary array*. An in-place update modifies the original data, which would violate the requirement to keep the original data intact.

2. **Question**: You are writing a loop to scan an array of size 10. Your loop condition is `i < 10`. Does this loop correctly cover all elements?
   * **Answer**: Yes. The indices will be 0 through 9, which are the valid indices for an array of size 10.

3. **Question**: Why is an *off-by-one error* particularly dangerous in array algorithms?
   * **Answer**: It often leads to runtime exceptions (accessing memory outside the array) or silent logic errors where the last element is ignored or an invalid value is processed.
