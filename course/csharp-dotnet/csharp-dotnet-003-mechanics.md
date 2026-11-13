<!-- Generated with gemini-3.1-flash-lite; automated review only; source and code verification pending. -->

This revised draft improves technical accuracy, clarifies the "Golden Rule," and corrects a slight misconception regarding the relationship between variance and subtyping.

---

## Simple explanation

In C#, **Generics** allow you to write code that works with any data type. **Covariance** and **Contravariance** are rules that define how we can swap types when using these generics.

Imagine a hierarchy: `Animal` is the base class, and `Dog` is a specific type of `Animal`.

*   **Covariance (`out`)**: Allows you to use a more specific type (like `Dog`) where a more general type (like `Animal`) is expected. It is "covariant" because the relationship between the types is preserved (a `List<Dog>` is treated as a `List<Animal>`).
*   **Contravariance (`in`)**: Allows you to use a more general type (like `Animal`) where a more specific type (like `Dog`) is expected. It is "contravariant" because the relationship is reversed.

**The Golden Rule:**
*   Use `out` when the type is only **produced** (returned from a method).
*   Use `in` when the type is only **consumed** (passed as an argument).

---

## How it works

These mechanisms apply only to **interfaces** and **delegates**. They do not apply to classes (like `List<T>`) because classes are mutable. If a class were covariant, you could accidentally insert an incompatible type into a collection, breaking type safety.

### Covariance (`out T`)
When you mark a type parameter with `out`, you promise the compiler that `T` will only appear in "output" positions (return types). Because you can only *get* items out, it is safe to treat `IEnumerable<Dog>` as `IEnumerable<Animal>`.

### Contravariance (`in T`)
When you mark a type parameter with `in`, you promise the compiler that `T` will only appear in "input" positions (method parameters). Because you only *put* items in, it is safe to treat `Action<Animal>` as `Action<Dog>`.

---

## Examples

### Covariance
```csharp
IEnumerable<Dog> dogs = new List<Dog>();
// Covariance allows this:
IEnumerable<Animal> animals = dogs; 
```
*Why?* `IEnumerable<T>` is covariant. Since you can only read from it, the compiler knows that reading an `Animal` from a list of `Dogs` is perfectly safe.

### Contravariance
```csharp
Action<Animal> actAnimal = (a) => Console.WriteLine(a.Name);
// Contravariance allows this:
Action<Dog> actDog = actAnimal;
```
*Why?* `Action<T>` is contravariant. An `Action<Animal>` knows how to handle *any* `Animal`. Therefore, it is perfectly capable of handling a `Dog`.

---

## Tradeoffs and comparisons

| Feature | Covariance (`out`) | Contravariance (`in`) |
| :--- | :--- | :--- |
| **Direction** | Specific to General | General to Specific |
| **Usage** | Return types | Input parameters |
| **Safety** | Prevents input (writing) | Prevents output (reading) |
| **Constraint** | Interface/Delegate only | Interface/Delegate only |

**Tradeoff:** The main cost is **flexibility vs. safety**. By restricting an interface to be covariant or contravariant, you lose the ability to perform the opposite operation (e.g., a covariant interface cannot have methods that accept `T` as a parameter).

---

## Interview questions and answers

**Q1: Why is `List<T>` not covariant?**
*   **Answer:** `List<T>` is mutable. If `List<Dog>` were `List<Animal>`, you could add a `Cat` to the list via an `Animal` reference. This would cause a runtime crash. `List<T>` is "invariant" to ensure type safety.

**Q2: What is the difference between `in`, `out`, and invariance?**
*   **Answer:** `out` allows subtyping (Covariance); `in` allows supertyping (Contravariance); Invariance means the type must match exactly because the interface both consumes and produces `T`.

**Q3: Can you use `in` and `out` on classes?**
*   **Answer:** No. Variance is only supported for interfaces and delegates because classes are concrete implementations that usually require both input and output capabilities.

---

## Exercises and solutions

### Exercise 1: Identify the variance
Given `interface IProcessor<in T>`, is it valid to pass `IProcessor<Animal>` to a method expecting `IProcessor<Dog>`?
*   **Solution:** Yes. This is contravariance. Since `IProcessor` only consumes `T`, an object that can process *any* `Animal` can safely process a `Dog`.

### Exercise 2: Fix the compiler error
```csharp
interface IProducer<T> { T Get(); }
// Error: Cannot assign IProducer<Dog> to IProducer<Animal>
IProducer<Animal> producer = new DogProducer(); 
```
*   **Solution:** Change the interface to `interface IProducer<out T> { T Get(); }`. This informs the compiler that `T` is only used for output, enabling safe covariance.

---

## Review questions

1.  If a method takes `Action<T>`, should `T` be marked `in` or `out`?
2.  Why does the compiler prevent `List<T>` from being covariant?
3.  Can a single interface be both covariant and contravariant? (Hint: Think about `Func<T, TResult>`).

---

## Sources and limitations

*   **Scope:** Variance rules in C# are strictly enforced by the compiler to prevent type-safety violations at runtime.
*   **Limitations:** This guide covers C# generics. Other languages (like Java) handle variance differently (e.g., using "Wildcards" like `? extends T` or `? super T`).
*   **Verification:** This content is based on standard Microsoft C# language specifications.
