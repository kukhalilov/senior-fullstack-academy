<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

C# is a strongly-typed, object-oriented programming language designed for the .NET platform. A **type** is a blueprint or template that defines what kind of data an object can hold and what actions it can perform. **Type fundamentals** refer to the core rules C# uses to store, process, and protect data in memory.

Imagine a warehouse where every item must be placed in a specific container:
- A **Value Type** box holds the actual data directly (like a box containing a physical number). When you copy it, you duplicate the actual contents.
- A **Reference Type** box holds a key (a reference or memory address) that points to where the actual data lives elsewhere in the warehouse. When you copy it, you only copy the key, meaning both keys point to the exact same box of data.

C# manages these types through a runtime environment called the Common Language Runtime (CLR). The CLR handles memory allocation, type safety (preventing you from treating a text string as a mathematical number), and memory cleanup via the Garbage Collector.

## How it works

C# types are divided into two primary categories based on how they are stored in memory:

1. **Value Types (`struct`, numeric types, `bool`, `char`)**:
   - Stored directly inline where they are declared. If declared as a local variable inside a method, they reside on the **stack**. However, if a value type is declared as a field inside a reference type (`class`), its memory is allocated on the **heap** as part of that parent object.
   - The stack is a fast, last-in, first-out memory structure managed automatically as methods enter and exit.
   - Assignment copies the value. Modifying one copy does not affect the other.

2. **Reference Types (`class`, `interface`, `delegate`, `string`, arrays)**:
   - The variable stores a reference (memory address) pointing to data allocated on the **heap**.
   - The heap is a larger, pooled memory area managed by the Garbage Collector.
   - Assignment copies the reference, *not* the underlying object. Two variables can point to the same heap instance.

### Boxing and Unboxing
- **Boxing**: Converting a value type to a reference type (specifically to the `object` type, `ValueType`, or an interface it implements). This allocates a new object on the heap, copies the value into it, and returns a reference to that heap object.
- **Unboxing**: Extracting the value type from the boxed object. This requires an explicit cast, which first checks that the boxed object is actually the exact value type being requested (throwing an `InvalidCastException` if it is not), and then copies the value out of the heap object back onto the stack or target variable.
- *Performance cost*: Both operations involve heap allocation, memory copying, and runtime type checks, which degrade execution speed and create garbage collection pressure if done excessively.

### Nullability
Historically, reference types could be `null` (pointing to nothing), while standard value types could not. Modern C# introduces **Nullable Value Types** (using `?`, e.g., `int?`, which is syntactic sugar for `Nullable<T>`) and **Nullable Reference Types** (compiler-enforced annotations and warnings to prevent `NullReferenceException` at design time).

## Examples

### Value Types vs. Reference Types Behavior

```csharp
using System;

class Program
{
    static void Main()
    {
        // Value Type Example
        int originalNumber = 10;
        int copiedNumber = originalNumber; // Copies the value
        copiedNumber = 20;

        Console.WriteLine(originalNumber); // Output: 10 (unchanged)
        Console.WriteLine(copiedNumber);   // Output: 20

        // Reference Type Example
        Person person1 = new Person { Name = "Alice" };
        Person person2 = person1; // Copies the reference (memory address)
        person2.Name = "Bob";

        Console.WriteLine(person1.Name); // Output: Bob (affected!)
        Console.WriteLine(person2.Name); // Output: Bob
    }
}

class Person
{
    public string Name { get; set; }
}
```

### Boxing and Unboxing Example

```csharp
int number = 42;          // Value type (stored on stack/inline)
object boxed = number;    // Boxing: allocated on heap, value copied
int unboxed = (int)boxed; // Unboxing: type-checked and copied back
```

## Tradeoffs and comparisons

| Feature | Value Types (`struct`, `int`, `bool`) | Reference Types (`class`, `string`, `list`) |
| :--- | :--- | :--- |
| **Memory Location** | Stack (for local variables) or inline inside parent objects | Heap |
| **Lifespan** | Tied to the current scope/stack frame or parent object lifespan | Managed by Garbage Collector |
| **Assignment** | Copies the actual value | Copies the memory address |
| **Performance** | Fast allocation, no GC pressure (unless boxed) | Heap allocation overhead, GC cleanup cost |
| **Polymorphism** | Limited (can implement interfaces, but causes boxing if cast to the interface type) | Full support (inheritance, virtual methods) |

**Tradeoff analysis**:
- *Use Value Types* for small, immutable data structures (e.g., coordinates, vectors, measurements) where copying is cheap and heap overhead is undesirable.
- *Use Reference Types* for complex entities with identity, shared state, or inheritance hierarchies.

## Interview questions and answers

**Q1: What is the difference between the stack and the heap in C#?**  
**A:** The stack is a LIFO (Last-In, First-Out) memory structure used for executing threads and storing local value types and method parameters. It is extremely fast and self-cleaning when methods return. The heap is a larger, dynamic pool of memory used to store reference type objects (and value types embedded within them). The heap requires managed allocation and is cleaned up asynchronously by the Garbage Collector.

**Q2: Why does modifying a copied reference type change the original object, but copying a value type does not?**  
**A:** A reference type variable holds only the memory address (reference) of the data. When you copy it, you duplicate the address, meaning both variables point to the exact same object on the heap. A value type variable holds the actual data itself; copying it duplicates the entire data payload into a new memory location.

**Q3: What is boxing, and why should you avoid it in performance-critical code?**  
**A:** Boxing is the process of converting a value type into a reference type (`object`, `ValueType`, or an interface). It forces the runtime to allocate memory on the heap, copy the value from its current location to the heap, and create an object header. This creates garbage collection pressure and CPU overhead.

**Q4: Can a struct inherit from a class in C#?**  
**A:** No. Structs in C# cannot inherit from classes or other structs (they are implicitly sealed, inheriting only from `System.ValueType`), though they can implement interfaces.

## Exercises and solutions

### Exercise 1: Mutable Struct Pitfall
**Problem**: Write a program that defines a `Point` struct with `X` and `Y` properties. Create a method that attempts to modify a point passed as an argument. Observe and explain why the original point outside the method remains unchanged.

**Solution**:
```csharp
using System;

public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
}

class Program
{
    static void ModifyPoint(Point p)
    {
        p.X = 100;
        p.Y = 200;
    }

    static void Main()
    {
        Point myPoint = new Point { X = 5, Y = 10 };
        ModifyPoint(myPoint);
        
        // Output will be 5 and 10 because structs are passed by value (copied)
        Console.WriteLine($"X: {myPoint.X}, Y: {myPoint.Y}");
    }
}
```

---

### DSA Problem: Two Sum (Value Types and Lookup Optimization)
**Problem**: Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Use a C# `Dictionary` (reference type storing value types) to achieve $O(n)$ time complexity.

**Progressive Hints**:
1. *Hint 1*: A brute-force nested loop takes $O(n^2)$ time. Can you do it faster using extra memory?
2. *Hint 2*: As you iterate through the array, calculate the complement needed to reach the target (`target - currentNumber`).
3. *Hint 3*: Use a `Dictionary<int, int>` to store numbers you've already seen as keys, and their indices as values.

**Working C# Solution**:
```csharp
using System;
using System.Collections.Generic;

public class Solution 
{
    public static int[] TwoSum(int[] nums, int target) 
    {
        Dictionary<int, int> seen = new Dictionary<int, int>();
        
        for (int i = 0; i < nums.Length; i++) 
        {
            int complement = target - nums[i];
            
            if (seen.ContainsKey(complement)) 
            {
                return new[]{ seen[complement], i };
            }
            
            if (!seen.ContainsKey(nums[i]))
            {
                seen.Add(nums[i], i);
            }
        }
        
        throw new ArgumentException("No two sum solution");
    }

    public static void Main()
    {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;
        int[] result = TwoSum(nums, target);
        Console.WriteLine($"Indices: [{result[0]}, {result[1]}]"); // Output: [0, 1]
    }
}
```

**Edge Cases**:
- Negative numbers in the array.
- Duplicate values that sum to the target (handled by checking uniqueness before adding or ensuring correct dictionary lookups).
- Array with exactly two elements.

**Complexity**:
- **Time Complexity**: $O(n)$ because dictionary lookups and insertions operate in average $O(1)$ time, and we traverse the array once.
- **Space Complexity**: $O(n)$ to store up to $n$ elements in the dictionary.

## Review questions

1. What is the memory location for a local variable declared as a `struct` versus a `struct` declared as a field inside a `class`?
2. Explain the role of the Garbage Collector in relation to reference types.
3. What happens when you cast an `int` to an `object` and back to an `int`? Name the technical terms.
4. Why are strings considered reference types even though they represent textual values (which feel like data values)?

## Sources and limitations

*Limitations*: This lesson provides a conceptual and practical overview based on standard C# and .NET runtime specifications. Implementation details can vary slightly depending on the specific .NET runtime version (.NET Framework vs. .NET Core / .NET 6/7/8+) and JIT (Just-In-Time) compiler optimizations (such as scalar replacement or stack allocation via `ref struct`). External verification of specific runtime internal memory layouts should be cross-referenced with official Microsoft .NET documentation.
