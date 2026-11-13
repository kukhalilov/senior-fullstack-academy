<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you are packing boxes. 
*   A **box of fruit** is a generic container.
*   An **Apple** is a specific type of **Fruit** (`Apple : Fruit`).

In C#, **variance** decides if a box of `Apple` objects can be used where a box of `Fruit` objects is expected, or vice versa. 

*   **Covariance** (`out`): Lets you use a more specific type where a broader type is expected. For example, treating an `IEnumerable<Apple>` as a collection of `Fruit` (read-only). *Mnemonic: **Out** is for output (reading data).*
*   **Contravariance** (`in`): Lets you use a broader type where a more specific type is expected. For example, using an `Action<Fruit>` (something that handles any fruit) where an `Action<Apple>` is required. *Mnemonic: **In** is for input (writing data).*
*   **Invariance**: The default in C#. A `List<Apple>` is **not** a `List<Fruit>`, and a `List<Fruit>` is **not** a `List<Apple>`.

**Glossary:**
*   **Generic type parameter (`T`)**: A placeholder for a data type in a class, interface, or method (e.g., `List<T>`).
*   **Subtype**: A derived class (e.g., `Apple` is a subtype of `Fruit`).
*   **Supertype**: A base class (e.g., `Fruit` is a supertype of `Apple`).

---

## How it works

C# allows variance **only** on interfaces and delegates, not on classes or structs. This is enforced by the compiler to guarantee type safety at runtime.

### Covariance (`out` keyword)
When you mark a generic parameter with `out`, you promise the compiler that **this type will only be returned (output)** from the interface, never consumed as an input method parameter.

```csharp
public interface IReadOnlyRepository<out T>
{
    T GetById(int id); // Allowed: T is output
}
```
Because you only *read* items from `IReadOnlyRepository<T>`, if you have an `IReadOnlyRepository<Apple>`, safely treating it as an `IReadOnlyRepository<Fruit>` makes sense because every `Apple` retrieved is guaranteed to be a `Fruit`.

### Contravariance (`in` keyword)
When you mark a generic parameter with `in`, you promise the compiler that **this type will only be consumed (input)**, never returned.

```csharp
public interface IConsumer<in T>
{
    void Consume(T item); // Allowed: T is input
}
```
If a method expects something that can consume an `Apple` (`IConsumer<Apple>`), passing an `IConsumer<Fruit>` is safe because a consumer designed to handle *any* `Fruit` can certainly handle an `Apple`.

---

## Examples

Below is a complete, runnable C# console application demonstrating covariance, contravariance, and invariance.

```csharp
using System;
using System.Collections.Generic;

namespace VarianceDemo
{
    public class Fruit { public virtual string Name => "Fruit"; }
    public class Apple : Fruit { public override string Name => "Apple"; }

    // 1. Covariant Interface (out)
    public interface IProducer<out T>
    {
        T Produce();
    }

    public class AppleProducer : IProducer<Apple>
    {
        public Apple Produce() => new Apple();
    }

    // 2. Contravariant Interface (in)
    public interface IProcessor<in T>
    {
        void Process(T item);
    }

    public class FruitProcessor : IProcessor<Fruit>
    {
        public void Process(Fruit item) => Console.WriteLine($"Processed: {item.Name}");
    }

    class Program
    {
        static void Main(string[] args)
        {
            // --- COVARIANCE ---
            // AppleProducer produces Apple, but we can assign it to IProducer<Fruit>
            IProducer<Fruit> fruitProducer = new AppleProducer();
            Fruit item = fruitProducer.Produce();
            Console.WriteLine($"Produced: {item.Name}"); // Output: Apple

            // --- CONTRAVARIANCE ---
            // FruitProcessor processes Fruit, but we can assign it to IProcessor<Apple>
            IProcessor<Apple> appleProcessor = new FruitProcessor();
            appleProcessor.Process(new Apple()); // Output: Processed: Apple

            // --- INVARIANCE COMPARISON ---
            // List<T> is invariant. The line below causes a compile-time error:
            // List<Fruit> fruitList = new List<Apple>(); // Error CS0029
        }
    }
}
```

---

## Tradeoffs and comparisons

| Feature | Covariance (`out`) | Contravariance (`in`) | Invariance (Default) |
| :--- | :--- | :--- | :--- |
| **Direction** | Subtype $\to$ Supertype (`Apple` $\to$ `Fruit`) | Supertype $\to$ Subtype (`Fruit` $\to$ `Apple`) | No conversion allowed |
| **Where used** | Return types, property getters | Method parameters, property setters | Both input and output |
| **Safety** | Prevents adding invalid objects | Prevents reading unexpected types | Full safety, strict matching |
| **Performance**| Zero runtime overhead (compiler check)| Zero runtime overhead (compiler check)| Zero runtime overhead |
| **Tradeoff** | Cannot accept `T` as a parameter | Cannot return `T` from a method | Less flexible for polymorphism |

---

## Interview questions and answers

**Q1: Why are generic classes in C# invariant?**
**Answer:** Generic classes (like `List<T>`) are invariant because they allow both reading and writing of type `T`. If `List<Apple>` could be implicitly cast to `List<Fruit>`, you could write code that inserts an `Orange` into a list that actually holds `Apple` objects, breaking type safety and causing a runtime `ArrayTypeMismatchException` or equivalent collection corruption.

**Q2: Can you apply variance modifiers (`in`/`out`) to classes or structs?**
**Answer:** No. C# restricts variance annotations strictly to interfaces and delegates. Classes and structs cannot be covariant or contravariant.

**Q3: Explain the Liskov Substitution Principle (LSP) in the context of generic variance.**
**Answer:** LSP states that objects of a superclass should be replaceable with objects of its subclasses without altering program correctness. Covariance aligns with LSP by allowing a producer of a subclass to replace a producer of a superclass. Contravariance aligns with LSP by allowing a consumer of a superclass (which can handle anything in the hierarchy) to replace a consumer of a subclass.

---

## Exercises and solutions

### Exercise 1: Custom Covariant Logger
Create a covariant interface `IReadOnlyRepository<out T>` that has a method `T GetLatest()`. Implement it with a class `InMemoryRepository<T>` holding a collection of items, and write a test in `Main` that treats an `IReadOnlyRepository<Dog>` as an `IReadOnlyRepository<Animal>`.

**Hints:**
1. Remember to use the `out` keyword on your interface definition.
2. The implementation class can still use a regular generic type parameter `T` without `out`.

**Solution:**
```csharp
using System;
using System.Collections.Generic;

public class Animal { public virtual string Sound => "Generic Sound"; }
public class Dog : Animal { public override string Sound => "Bark"; }

public interface IReadOnlyRepository<out T>
{
    T GetLatest();
}

public class InMemoryRepository<T> : IReadOnlyRepository<T>
{
    private readonly T _item;
    public InMemoryRepository(T item) => _item = item;
    public T GetLatest() => _item;
}

class Program
{
    static void Main()
    {
        IReadOnlyRepository<Dog> dogRepo = new InMemoryRepository<Dog>(new Dog());
        // Covariance assignment:
        IReadOnlyRepository<Animal> animalRepo = dogRepo; 

        Console.WriteLine(animalRepo.GetLatest().Sound); // Output: Bark
    }
}
```

### Exercise 2: DSA Problem — Contravariant Comparer Sorting
*Problem Statement:* Write a generic interface `IGenericComparator<in T>` with a method `int Compare(T x, T y)`. Implement a base `ObjectLengthComparator` that implements `IGenericComparator<object>` by comparing the string lengths of their `.ToString()` values. Use contravariance to pass this comparator into a method designed to sort a list of `string` items.

**Hints:**
1. `IGenericComparator` must use `in T`.
2. A comparator for `object` can evaluate *any* object, meaning it can safely evaluate `string` objects.

**Solution:**
```csharp
using System;
using System.Collections.Generic;

public interface IGenericComparator<in T>
{
    int Compare(T x, T y);
}

public class ObjectLengthComparator : IGenericComparator<object>
{
    public int Compare(object x, object y)
    {
        int lenX = x?.ToString().Length ?? 0;
        int lenY = y?.ToString().Length ?? 0;
        return lenX.CompareTo(lenY);
    }
}

class Program
{
    static void PrintSorted(List<string> items, IGenericComparator<string> comparator)
    {
        // Simple bubble sort for demonstration
        for (int i = 0; i < items.Count - 1; i++)
        {
            for (int j = 0; j < items.Count - i - 1; j++)
            {
                if (comparator.Compare(items[j], items[j + 1]) > 0)
                {
                    string temp = items[j];
                    items[j] = items[j + 1];
                    items[j + 1] = temp;
                }
            }
        }
        Console.WriteLine(string.Join(", ", items));
    }

    static void Main()
    {
        List<string> words = new List<string> { "elephant", "cat", "dog" };

        // Contravariant assignment: IGenericComparator<object> assigned to IGenericComparator<string>
        IGenericComparator<string> stringComparator = new ObjectLengthComparator();

        PrintSorted(words, stringComparator); // Output: cat, dog, elephant
    }
}
```
* **Complexity:** Time complexity for the sorting routine is $O(N^2)$ where $N$ is the number of items. Space complexity is $O(1)$ auxiliary storage.
* **Edge Cases:** Null values handled via null-coalescing operators (`??`). Empty lists handled gracefully by loop conditions.

---

## Review questions

1. What specific keyword designates a covariant generic parameter in C# interfaces?
2. Why does C# prohibit marking method input parameters with the `out` variance modifier?
3. True or False: Arrays in C# are covariant, which can cause runtime exceptions if type safety is violated.
4. If interface `IProcessor<in T>` is contravariant, can an instance of `IProcessor<BaseClass>` be assigned to a variable of type `IProcessor<DerivedClass>`?

---

## Sources and limitations

* **Sources:** Based on official Microsoft C# language specifications and documentation regarding generic variance (`in`/`out`).
* **Limitations:** This lesson focuses entirely on C# (.NET). Variance rules differ across programming languages (e.g., Java uses wildcards like `? extends T`, whereas C# uses site-variance declarations). No external web verifications or dynamic source links were accessed.
