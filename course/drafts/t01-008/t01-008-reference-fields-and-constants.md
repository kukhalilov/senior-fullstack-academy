<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Stored members, initialization, mutability, and fixed storage

## Scope and version

* Automatically generated draft.
* **Topic:** Stored members, initialization, mutability, and fixed storage (Inventory Group from `t01-008`).
* **Environment/Edition:** C# 15 / .NET 11 stable member declarations with C# 13 and C# 14 release changes checked 2026-11-14.
* **Source Authority:** [Microsoft C# language reference, programming guide, compiler reference and current C# release notes](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/fields).

---

## How this group fits the mental model

In C#, types model both state and behavior. The inventory group covered in this lesson deals specifically with **stored members**—how a type allocates memory, holds data directly, controls mutability, and manages thread isolation or compiler-synthesized storage. 

Within the broader mental model of type members:
- **Fields store type state directly**, whereas properties expose controlled read/write behavior and methods represent actions.
- Fields form the underlying data foundation. Even when you write auto-properties, the compiler generates hidden storage for them.
- Mutability rules (`readonly`, `const`, `volatile`) and execution ordering determine *when* and *how safely* that stored state can be read or modified across time and threads.

---

## Supplied names explained

1. **Instance field**  
   *Definition:* A variable declared directly within a class or struct whose storage is bound to a specific object instance. Each time you instantiate the class with `new`, a fresh copy of every instance field is allocated in memory.

2. **Static field**  
   *Definition:* A variable declared with the `static` modifier, meaning exactly one storage location exists for the entire lifetime of the application domain, regardless of how many instances of the type are created (or if zero instances are created).

3. **const field**  
   *Definition:* A field declared with the `const` modifier whose value is computed entirely at compile time. It is implicitly static and cannot be modified after compilation; the compiler replaces every usage of the constant directly with its literal value.

4. **readonly field**  
   *Definition:* An instance field modified with `readonly`, meaning its value can only be assigned during the declaration or inside a constructor of the enclosing type. Once construction completes, its value cannot be changed.

5. **static readonly field**  
   *Definition:* A static field modified with `readonly`. It can be assigned at declaration or within a static constructor of the type, allowing runtime initialization of a static value that remains immutable thereafter.

6. **volatile field**  
   *Definition:* A field marked with the `volatile` modifier, instructing the compiler and CPU that the field can be modified by multiple threads simultaneously. It prevents compiler optimizations that might cache the field's value in a register, ensuring reads and writes access memory directly.

7. **fixed-size buffer**  
   *Definition:* A construct used in unsafe contexts to create an inline array of a fixed size within a struct. This is typically employed for interoperability with native unmanaged APIs and memory layouts.

8. **Field initializer**  
   *Definition:* An expression provided inline during a field's declaration (e.g., `private int count = 10;`) that specifies its starting value.

9. **Field default value**  
   *Definition:* The fallback value assigned automatically by the runtime when no explicit initializer or constructor assignment is provided (e.g., `0` for numeric types, `false` for booleans, and `null` for reference types).

10. **Field declaration**  
    *Definition:* The syntactic statement that defines a field's access modifier, type, and name within a type body.

11. **Field-like event**  
    *Definition:* An event declared using simplified syntax where the C# compiler automatically supplies the underlying private delegate backing field and the `add`/`remove` methods. *(Note: Full event semantics are covered in t01-011; this entry refers strictly to the field-like synthesis mechanism).*

12. **Field keyword in property accessor**  
    *Definition:* A contextual feature introduced in C# 14 that allows property accessors to reference the compiler-synthesized backing field directly using the `field` keyword (e.g., `public int Age { get => field; set => field = value; }`), eliminating the need to write an explicit separate private field when custom accessor logic is required.

13. **Backing field**  
    *Definition:* The actual hidden storage variable that holds the data for a property when the property does not compute its value dynamically on every call.

14. **Compiler-generated backing field**  
    *Definition:* A backing field automatically created by the C# compiler behind the scenes, most notably when you declare an auto-implemented property (e.g., `public int Id { get; set; }`).

15. **Thread-static field**  
    *Definition:* A static field marked to indicate that its value is unique to each executing thread.

16. **ThreadStaticAttribute**  
    *Definition:* The attribute (`[ThreadStatic]`) applied to a static field to make it a thread-static field, causing the runtime to maintain a separate copy of the static field for every distinct thread that accesses it.

17. **Field-targeted attribute**  
    *Definition:* An attribute explicitly prefixed with the `field:` target specifier (e.g., `[field: NonSerialized]`) so that the compiler applies the attribute to the generated backing field of an auto-property rather than to the property itself.

18. **Field initializer execution order**  
    *Definition:* The deterministic rule stating that instance field initializers are executed in textual order immediately before the enclosing constructor runs (and before base class constructors finish).

19. **Static field initialization**  
    *Definition:* The process where static fields and static field initializers are executed prior to the first use of a type or when explicitly triggered by the runtime, running in textual order within static constructors.

20. **Constant value**  
    *Definition:* An immutable primitive or string value known entirely at compile time, matching the value supplied to a `const` field.

21. **Readonly assignment location**  
    *Definition:* The precise syntactic boundaries (variable declarations and constructor bodies) where assignment to a `readonly` field is legally permitted by the language compiler.

---

## Cross-item comparison

* **`const` vs. `readonly` vs. `static readonly`:**
  - `const`: Computed at compile-time, implicitly static, embedded directly into consuming assemblies. Cannot use reference types (except `string`).
  - `readonly`: Computed at runtime per instance. Can be assigned only in initializers or instance constructors.
  - `static readonly`: Computed at runtime once per type. Can be assigned in static initializers or static constructors.

* **Explicit Backing Field vs. Field keyword in property accessor (C# 14):**
  - Traditionally, writing custom logic in a property required declaring an explicit private backing field alongside the property.
  - The C# 14 `field` keyword removes the need to declare that separate variable name by exposing the compiler-generated backing field directly inside the accessor body.

---

## Examples

### Example 1: Basic Field Initialization and Readonly Safety (Unverified)
```csharp
public class BankAccount
{
    // Instance field with a field initializer and field default value rules
    private decimal _balance = 0.0m;

    // readonly field: can only be assigned in declaration or constructor
    private readonly string _accountNumber;

    public BankAccount(string accountNumber, decimal initialDeposit)
    {
        _accountNumber = accountNumber; // Valid readonly assignment location
        _balance = initialDeposit;
    }

    public decimal Balance => _balance;
}
```
*Expected Result:* The `_accountNumber` cannot be modified after the constructor executes, protecting identity state while `_balance` can be updated via internal logic.

### Example 2: C# 14 Field Keyword in Property Accessors (Unverified / Pseudocode)
```csharp
public class TemperatureSensor
{
    // C# 14 contextual 'field' keyword targets the compiler-generated backing field
    public double Celsius
    {
        get => field;
        set
        {
            if (value < -273.15)
                throw new ArgumentOutOfRangeException(nameof(value));
            field = value;
        }
    }
}
```
*Expected Result:* Validation occurs during assignment without requiring a separate manually declared `private double _celsius;` field in the class body.

---

## Common mistakes

1. **Treating `readonly` fields as thread-safe mutables:**  
   A `readonly` modifier prevents reassignment of the field reference itself after construction; it does *not* make the object pointed to by the reference immutable. If the field holds a mutable reference type, its internal state can still change.
2. **Assuming `const` fields update across assembly rebuilds:**  
   Because `const` values are baked directly into calling code at compile time, changing a constant in a library assembly requires recompiling all consumer assemblies to see the updated value. Use `static readonly` if values need to change independently across deployment updates.
3. **Forgetting initialization execution order:**  
   Instance field initializers run *before* the constructor body executes. If an initializer calls an instance method that depends on constructor arguments, those arguments will not yet be assigned.

---

## Knowledge checks with answers

1. **Question:** When is a `const` field evaluated and assigned?  
   **Answer:** At compile time. The value is embedded directly into the calling IL code.

2. **Question:** What are the legal syntactic locations where a `readonly` instance field can be assigned?  
   **Answer:** At its inline field declaration and within the body of instance constructors of the declaring type.

3. **Question:** What problem does the C# 14 `field` keyword solve in property accessors?  
   **Answer:** It provides direct access to the compiler-synthesized backing field inside a property's `get` or `set` accessor, removing the requirement to write a separate explicit private field declaration.

4. **Question:** What is the difference between an instance field and a static field regarding memory allocation?  
   **Answer:** An instance field allocates a new storage location for every object instance created via `new`, whereas a static field allocates exactly one storage location for the entire application domain, shared across all instances.
