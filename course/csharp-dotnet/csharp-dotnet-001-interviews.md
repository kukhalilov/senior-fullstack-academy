<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

C# is a strongly typed, object-oriented programming language developed by Microsoft on the .NET platform. "Strongly typed" means that every variable and constant has a specific type (such as `int`, `string`, or a custom class), and the C# compiler strictly enforces these types to prevent unexpected errors.

Type fundamentals in C# revolve around two primary categories of memory allocation:
1. **Value types** (stored directly where they are declared, typically on the stack or inline within structs and arrays).
2. **Reference types** (stored on the heap, with variables holding a reference—or address—pointing to that memory location).

Understanding how types behave, how they are stored in memory, and how C# manages safety and performance is critical for writing efficient code and passing technical interviews.

---

## How it works

### 1. The Common Type System (CTS)
The .NET runtime uses the Common Type System (CTS) to define how types are declared, used, and managed. Every type in C# ultimately derives from a root base class called `System.Object` (represented by the `object` alias).

### 2. Value Types vs. Reference Types
* **Value Types (`struct`, `enum`, primitive types like `int`, `bool`, `double`):**
  * Contain their value directly.
  * When assigned to another variable, passed to a method, or returned, the value is **copied**.
  * Typically allocated on the stack (when local variables) or inline (when fields inside another object or struct). Lifetimes are scoped to their block or containing object.
* **Reference Types (`class`, `interface`, `delegate`, `string`, arrays):**
  * Contain a reference (memory address) to the data on the heap, rather than the data itself.
  * When assigned to another variable, only the **reference is copied**, meaning both variables point to the exact same object on the managed heap.
  * Managed by the Garbage Collector (GC), which reclaims memory when objects are no longer reachable.

### 3. Boxing and Unboxing
* **Boxing:** The process of converting a value type to an object type (`object`) or to any interface type implemented by the value type. This allocates an object on the heap and copies the value into it.
* **Unboxing:** The explicit extraction of the value type from the boxed object. This requires a runtime type check (cast) and copies the value back out from the heap to the stack or target variable.
* *Performance impact:* Boxing and unboxing cause memory allocations on the heap and CPU overhead, which can degrade performance in high-throughput loops and introduce unnecessary Garbage Collection pressure.

### 4. Nullability and `null`
Historically, reference types could be `null`, while value types could not (unless wrapped in `Nullable<T>`, e.g., `int?`). Modern C# (8.0+) introduces **Nullable Reference Types**, allowing the compiler to track whether a reference type *should* be allowed to be `null` via static analysis, helping to prevent unexpected `NullReferenceException` bugs at runtime. Note that nullable reference types do not change the underlying runtime behavior or memory layout; they are a compile-time safety feature.

---

## Examples

The following C# code demonstrates value vs. reference types, boxing/unboxing, and nullable types:

```csharp
using System;

class Program
{
    // A value type
    struct PointStruct
    {
        public int X;
        public int Y;
    }

    // A reference type
    class PointClass
    {
        public int X;
        public int Y;
    }

    static void Main()
    {
        // 1. Value Type Assignment (Copy behavior)
        PointStruct p1 = new PointStruct { X = 10, Y = 20 };
        PointStruct p2 = p1; // p2 gets a complete copy of p1's data
        p2.X = 99;

        Console.WriteLine($"p1.X: {p1.X}"); // Output: 10 (unaffected)
        Console.WriteLine($"p2.X: {p2.X}"); // Output: 99

        // 2. Reference Type Assignment (Reference copy behavior)
        PointClass c1 = new PointClass { X = 10, Y = 20 };
        PointClass c2 = c1; // c2 points to the same heap object as c1
        c2.X = 99;

        Console.WriteLine($"c1.X: {c1.X}"); // Output: 99 (affected!)
        Console.WriteLine($"c2.X: {c2.X}"); // Output: 99

        // 3. Boxing and Unboxing
        int originalInt = 42;
        object boxed = originalInt; // Boxing: int moved to heap
        int unboxed = (int)boxed;    // Unboxing: cast back to int

        Console.WriteLine($"Unboxed value: {unboxed}");

        // 4. Nullable Value Types
        int? optionalAge = null;
        if (!optionalAge.HasValue)
        {
            Console.WriteLine("Age is not specified.");
        }
    }
}
```

---

## Tradeoffs and comparisons

| Feature / Concept | Value Types (`struct`, `int`, etc.) | Reference Types (`class`, `string`, etc.) |
| :--- | :--- | :--- |
| **Memory Location** | Stack (local variables) or inline inside other types/arrays. | Heap (data) with a reference/pointer variable. |
| **Assignment** | Copies the actual data. | Copies the memory address (reference). |
| **Garbage Collection** | Not tracked by GC; cleaned up when scope ends or when parent object is collected. | Managed and cleaned up by the Garbage Collector. |
| **Inheritance** | Cannot inherit from other classes (though they can implement interfaces). All structs implicitly inherit from `System.ValueType`. | Fully supports inheritance and polymorphism. |
| **Performance** | Faster for small data structures; avoids heap allocation overhead. Can suffer from copy overhead if passed around heavily when large. | Incurs heap allocation and GC pressure if instantiated frequently. |
| **Ideal Use Case** | Small, immutable data aggregates (e.g., coordinates, colors, measurements). | Complex entities with identity, behavior, and large state (e.g., services, controllers, domain models). |

---

## Interview questions and answers

### Question 1: What is the difference between a `struct` and a `class` in C#?
* **Answer:** A `class` is a reference type allocated on the heap, supporting inheritance, polymorphism, and reference semantics. A `struct` is a value type typically allocated on the stack or inline, does not support traditional class inheritance (though it can implement interfaces), and uses value semantics (assignment copies data).
* **Follow-up:** *When should you choose a `struct` over a `class`?*
* **Follow-up Answer:** Use a `struct` only for small, immutable data structures (typically under 16–24 bytes) that do not require reference identity or inheritance, as this minimizes heap allocations and GC overhead. Large structs passed by value into methods can cause performance degradation due to copying overhead.

### Question 2: What is boxing and unboxing, and why should you avoid it?
* **Answer:** Boxing is converting a value type to `object` or an interface type, wrapping it in a heap-allocated object. Unboxing extracts the value type back out. You should avoid it because both actions incur CPU overhead and cause memory allocations on the heap, which increases Garbage Collection pressure and can severely degrade performance in hot code paths.
* **Follow-up:** *How does C# generics (`List<T>` vs old `ArrayList`) solve this?*
* **Follow-up Answer:** Generics allow you to specify the exact type (`T`). `List<int>` stores integers directly in a contiguous array without boxing, whereas the legacy `ArrayList` stored elements as `object`, causing boxing on every insertion of a value type and unboxing on retrieval.

### Question 3: Explain immutable types. Why is `System.String` immutable?
* **Answer:** An immutable type cannot have its state modified after it is created. `System.String` is immutable for security, thread safety, and performance reasons. Because strings are immutable, multiple variables can safely share the same string instance in memory (string interning) without fear that one part of the program will mutate the text underneath another.
* **Follow-up:** *If strings are immutable, how does string concatenation perform efficiently?*
* **Follow-up Answer:** Heavy string manipulation should use `System.Text.StringBuilder`, which maintains a mutable character buffer internally, avoiding the creation of numerous intermediate string objects on the heap.

---

## Exercises and solutions

### DSA Problem: Two-Sum Array Search
**Problem Statement:** Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.

#### Progressive Hints
1. *Hint 1:* The brute-force approach checks every pair using nested loops, resulting in $O(n^2)$ time complexity. Can you do better?
2. *Hint 2:* Think about using a hash-based lookup collection in C#, such as `Dictionary<TKey, TValue>`, to remember numbers you have already visited.
3. *Hint 3:* As you iterate through the array, calculate the `complement` (`target - currentElement`). Check if that complement already exists in your dictionary. If it does, you have found your pair!

#### Working C# Solution
```csharp
using System;
using System.Collections.Generic;

public class Solution
{
    public static int[] TwoSum(int[] nums, int target)
    {
        // Dictionary to store: key = number, value = its index
        Dictionary<int, int> map = new Dictionary<int, int>();

        for (int i = 0; i < nums.Length; i++)
        {
            int complement = target - nums[i];

            // Check if the complement exists in our dictionary
            if (map.ContainsKey(complement))
            {
                return new int[] { map[complement], i };
            }

            // Otherwise, store the current number and its index if not already present
            if (!map.ContainsKey(nums[i]))
            {
                map.Add(nums[i], i);
            }
        }

        throw new ArgumentException("No two sum solution found");
    }

    public static void Main()
    {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;
        int[] result = TwoSum(nums, target);

        Console.WriteLine($"Indices: [{result[0]}, {result[1]}]"); 
        // Output: Indices: [0, 1]
    }
}
```

#### Examples & Edge Cases
* **Example:** `nums = [3, 2, 4]`, `target = 6` $\rightarrow$ Returns `[1, 2]` because `2 + 4 = 6`.
* **Edge Case (Negative numbers):** `nums = [-1, -2, -3, -4, -5]`, `target = -8` $\rightarrow$ Correctly handles negative values through standard arithmetic.
* **Edge Case (Duplicate values):** Managed safely if inputs are distinct or handled per index constraints, though standard problems assume unique valid indexes.

#### Complexity Analysis
* **Time Complexity:** $O(n)$, because we traverse the list containing $n$ elements only once, and dictionary lookups operate in $O(1)$ average time.
* **Space Complexity:** $O(n)$, because in the worst-case scenario, we store up to $n$ elements inside the dictionary.

---

## Review questions

1. What is the root base class of all types in C# (.NET)?
2. Where are reference type instances stored in memory, and how does the Garbage Collector interact with them?
3. What is the key performance drawback of boxing a value type?
4. How do nullable reference types differ from nullable value types (`int?`) in modern C#?
5. Why are structs generally recommended to be immutable?

---

## Sources and limitations

* *Uncertainty Notice:* Specific performance benchmarks, internal JIT optimizations, and memory layouts can vary across different versions of the .NET runtime (.NET Framework vs. .NET Core / .NET 6/7/8/9). Developers should profile their specific workloads using tools like BenchmarkDotNet when micro-optimizing memory allocations. External web link validation cannot be performed in this offline environment.
