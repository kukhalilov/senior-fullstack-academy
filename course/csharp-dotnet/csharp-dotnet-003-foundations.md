<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you have a box that holds fruit. If someone gives you a box of *apples*, can you safely use it when someone asks for a *fruit* box? 

* **Covariance** means "going with" the natural hierarchy. If `Apple` is a type of `Fruit`, then a box of `Apple` acts like a box of `Fruit`. You can **read** items out safely because every apple is a fruit.
* **Contravariance** means "going against" the natural hierarchy. If a method requires an `Apple` processor, can you pass it a `Fruit` processor? Yes, because a processor that can handle *any* `Fruit` can certainly handle an `Apple`. You can **write** (or pass) items in safely.
* **Invariance** means the types must match *exactly*. A box of `Apple` is strictly a box of `Apple`, nothing else.

In C#, covariance and contravariance apply to generic interfaces and delegates, marked by the keywords `out` and `in`. 

* **Prerequisites**: Before learning variance, you should understand inheritance (base classes and derived classes), interfaces, and basic generics (`List<T>`, `IEnumerable<T>`).
* **Mental Model**: Think of the direction of data. 
  * `out` (Covariance): Data flows **out** of the structure. You are *producing* values. Producers can be more specific (return `Apple` when `Fruit` is expected).
  * `in` (Contravariance): Data flows **into** the structure. You are *consuming* values. Consumers can be more general (accept `Fruit` when an `Apple` is expected).

---

## How it works

In C#, generic types are **invariant** by default. This means that if `Dog` inherits from `Animal`, `List<Dog>` is **not** the same as, nor assignable to, `List<Animal>`, even though a `Dog` *is* an `Animal`. 

Why? Because if C# allowed `List<Dog>` to be treated as `List<Animal>`, you could add a `Cat` into the `List<Animal>` reference, which would corrupt the underlying `List<Dog>`.

To allow safe polymorphism with generics, C# introduced variance modifiers for generic interfaces and delegates:

1. **Covariance (`out` keyword)**:
   * **Rule**: A type parameter can be marked `out` only if it is used only in variance-safe positions, normally output positions (e.g., method return types, get-only properties).
   * **Notation**: `IReadOnlyList<out T>`
   * **Effect**: Allows you to assign an interface of a derived type to a variable of a base type. (`IReadOnlyList<Dog>` can be assigned to `IReadOnlyList<Animal>`).

2. **Contravariance (`in` keyword)**:
   * **Rule**: A type parameter can be marked `in` only if it is used only in variance-safe positions, normally input positions (e.g., method parameter types).
   * **Notation**: `Action<in T>` (a delegate, not an interface)
   * **Effect**: Allows a contravariant interface or delegate with a base type argument to be assigned where the derived type argument is expected. For example, `Action<Animal>` can be assigned to `Action<Dog>`.

3. **Invariance (No keyword)**:
   * **Rule**: The type parameter is used in both input and output positions.
   * **Notation**: `IList<T>`
   * **Effect**: No implicit casting between different generic type arguments.

---

## Examples

### Example 1: Covariance (`out`) in C#

Covariance lets you treat an interface with a derived type argument as if it used a base type argument.

```csharp
using System;
using System.Collections.Generic;

class Animal 
{ 
    public virtual string Name => "Animal"; 
}

class Dog : Animal 
{ 
    public override string Name => "Dog"; 
}

class Program
{
    static void Main()
    {
        // IEnumerable<out T> is covariant in .NET
        IEnumerable<Dog> dogs = new List<Dog> { new Dog(), new Dog() };
        
        // Covariance allows assigning IEnumerable<Dog> to IEnumerable<Animal>
        IEnumerable<Animal> animals = dogs; 

        foreach (var animal in animals)
        {
            Console.WriteLine(animal.Name); // Safe: we are only reading OUT data
        }
    }
}
```

### Example 2: Contravariance (`in`) in C#

Contravariance lets you use a handler designed for a base type where a handler for a derived type is expected.

```csharp
using System;

class Animal {}
class Dog : Animal {}

// Custom contravariant interface using 'in'
public interface IProcessor<in T>
{
    void Process(T item);
}

class AnimalProcessor : IProcessor<Animal>
{
    public void Process(Animal item)
    {
        Console.WriteLine("Processing generic animal.");
    }
}

class Program
{
    static void Main()
    {
        IProcessor<Animal> animalProcessor = new AnimalProcessor();

        // Contravariance allows assigning IProcessor<Animal> to IProcessor<Dog>
        // Why? Because something that processes ANY Animal can definitely process a Dog.
        IProcessor<Dog> dogProcessor = animalProcessor;

        dogProcessor.Process(new Dog()); // Safe: passing a Dog into an Animal processor
    }
}
```

---

## Tradeoffs and comparisons

| Concept | Keyword | Direction | Safety Mechanism | Common Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Covariance** | `out` | Base $\leftarrow$ Derived (assignment) | Compiler blocks `T` in input parameters. | Read-only collections, factories, providers (`IEnumerable<T>`). |
| **Contravariance** | `in` | Derived $\leftarrow$ Base (assignment) | Compiler blocks `T` in return positions. | Event handlers, comparers, consumers (`Action<T>`, `IComparer<T>`). |
| **Invariance** | None | Exact match required | None (full read/write access allowed). | Mutable collections (`List<T>`, `Dictionary<TKey, TValue>`). |

### Tradeoffs
* **Covariance (`out`)**: 
  * *Pros*: Maximum flexibility when consuming data; promotes code reuse.
  * *Cons*: You cannot accept data of type `T` into methods on that interface. The covariant view prevents unsafe inputs of `T`; the underlying object can still be mutable.
* **Contravariance (`in`)**:
  * *Pros*: Allows writing general-purpose utility methods or processors for specific derived types.
  * *Cons*: You cannot return data of type `T` from methods on that interface.
* **Performance Impact**: At the runtime level, generic variance relies on reference types. Value types (like `int`, `struct`) do not support variance in the same way due to memory layout rules (though arrays have historical, type-unsafe covariance built into the CLR for reference types).

---

## Interview questions and answers

1. **What is the difference between covariance and contravariance?**
   * *Answer*: Covariance preserves the assignment compatibility of a hierarchy (going from derived to base, e.g., `IEnumerable<Dog>` to `IEnumerable<Animal>`), used for outputs (`out`). Contravariance reverses it (going from base to derived, e.g., `IComparer<Animal>` to `IComparer<Dog>`), used for inputs (`in`).

2. **Why are standard generic collections like `List<T>` invariant?**
   * *Answer*: `List<T>` allows both reading and writing (`Add(T item)` and `T GetItem(int index)`). If `List<Dog>` could be cast to `List<Animal>`, you could insert a `Cat` into the `List<Animal>`, breaking type safety for the underlying `List<Dog>`.

3. **Can you apply `out` or `in` keywords to classes and structs in C#?**
   * *Answer*: No. Variance modifiers (`out` and `in`) can only be applied to generic **interfaces** and **delegates**, not to classes or structs.

4. **What happens if you try to use a covariant type parameter (`out T`) as a method parameter?**
   * *Answer*: The C# compiler will generate a compilation error (e.g., *"Invalid variance: The type parameter 'T' must be contravariantly valid on..."*). The precise rule concerns variance safety, including nested delegate types; an `out` parameter can occur in some method-parameter types when the nested variance makes it safe.

5. **Is array covariance safe in C#?**
   * *Answer*: Arrays in C# are historically covariant for reference types (e.g., `String[]` can be assigned to `Object[]`). However, this is *not* entirely type-safe at compile time; trying to put an invalid type into the array throws an `ArrayTypeMismatchException` at runtime. Generic covariance fixes this by enforcing safety strictly at compile time.

---

## Exercises and solutions

### Exercise 1: Implement a Covariant Logger Provider
**Problem**: Create a covariant interface `IReadOnlyProvider<out T>` that has a method `T GetItem()`. Implement it with a class `StringProvider` that returns strings, and write code demonstrating covariance by assigning it to a variable expecting an `IReadOnlyProvider<object>`.

**Solution**:
```csharp
using System;

public interface IReadOnlyProvider<out T>
{
    T GetItem();
}

public class StringProvider : IReadOnlyProvider<string>
{
    private readonly string _value;
    public StringProvider(string value) => _value = value;
    public string GetItem() => _value;
}

class Program
{
    static void Main()
    {
        IReadOnlyProvider<string> stringProvider = new StringProvider("Hello, Variance!");
        
        // Covariance in action
        IReadOnlyProvider<object> objectProvider = stringProvider;

        Console.WriteLine(objectProvider.GetItem());
    }
}
```

### Exercise 2: Implement a Contravariant Event Consumer
**Problem**: Create a contravariant interface `IConsumer<in T>` with a method `void Consume(T item)`. Implement it for base type `Message` and demonstrate assigning it where a derived type `DetailedMessage` consumer is required.

**Solution**:
```csharp
using System;

public class Message { public string Text { get; set; } }
public class DetailedMessage : Message { public int ErrorCode { get; set; } }

public interface IConsumer<in T>
{
    void Consume(T item);
}

public class GeneralMessageConsumer : IConsumer<Message>
{
    public void Consume(Message item)
    {
        Console.WriteLine($"Consuming message: {item.Text}");
    }
}

class Program
{
    static void Main()
    {
        IConsumer<Message> baseConsumer = new GeneralMessageConsumer();

        // Contravariance in action: IConsumer<Message> is assigned to IConsumer<DetailedMessage>
        IConsumer<DetailedMessage> detailedConsumer = baseConsumer;

        detailedConsumer.Consume(new DetailedMessage { Text = "System failure", ErrorCode = 500 });
    }
}
```

---

## Review questions

1. Which keyword designates covariance in a C# generic interface?
2. Why does the compiler throw an error if a contravariant type parameter (`in T`) is used as a return type?
3. True or False: You can make a custom generic class covariant using the `out` keyword.
4. If `B` inherits from `A`, and an interface `IConsumer<T>` is contravariant (`in T`), can an instance of `IConsumer<A>` be assigned to a variable of type `IConsumer<B>`?

---

## Sources and limitations

* **Uncertainty statement**: Language specifications and compiler behaviors described herein reflect standard Microsoft .NET C# specifications up to recent versions (.NET 6/7/8/9). No external link verification or multi-platform guarantees beyond standard C# CLI specifications are claimed. 
* **Limitations**: Advanced topics like IL-level variance representation or generic constraints (`where T : class`) interacting with variance are omitted for foundational clarity.

Source checked: [Microsoft: covariance and contravariance in generics](https://learn.microsoft.com/dotnet/standard/generics/covariance-and-contravariance).
