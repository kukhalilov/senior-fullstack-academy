<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Read/write contracts, auto-properties, init-only, required, and partial properties

## Scope and version

* **Topic ID:** t01-008 (Properties and Accessors)
* **Target Audience:** Self-study learners of C# requiring clear definitions of technical terms.
* **Edition/Version Scope:** C# 15 / .NET 11 stable member declarations, incorporating C# 13 and C# 14 release behaviors checked on 2026-11-14.
* **Source Reference:** [Microsoft C# Properties Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties)

---

## How this group fits the mental model

Within the broader C# type system, fields store raw state directly, while properties act as a controlled bridge to that state. A **Property** does not just hold data; it exposes read/write behaviors through accessors. This allows your code to run validation, compute values on the fly, trigger notifications, or restrict modification to initialization time without exposing the raw underlying storage to external callers.

---

## Supplied names explained

* **Property**: A member that provides a flexible mechanism to read, write, or compute the value of a private field, using special methods called accessors.
* **Instance property**: A property that belongs to a specific instance of a class or struct rather than to the type itself.
* **Static property**: A property that belongs to the type itself rather than to any specific object instance.
* **Read-only property**: A property that provides a `get` accessor but no `set` or `init` accessor, meaning its value cannot be modified after creation.
* **Write-only property**: A property that provides a `set` accessor without a `get` accessor, allowing data to be fed into an object without exposing its internal state.
* **Auto-implemented property**: A property where the compiler automatically generates a private, anonymous backing field when no custom logic is required in the accessors.
* **Expression-bodied property**: A property whose body consists of a single expression preceded by the arrow operator (`=>`), commonly used for read-only or computed values.
* **Computed property**: A property that calculates its value dynamically on every read rather than storing it in a persistent field.
* **Property initializer**: An initial value assigned directly to an auto-property at the point of its declaration (e.g., `public int Count { get; set; } = 0;`).
* **get accessor**: The block of code executed when a property's value is read.
* **set accessor**: The block of code executed when a property's value is assigned, exposing the new value via the implicit `value` parameter.
* **init accessor**: An accessor that allows a property to be assigned only during object construction (such as via object initializers), making it immutable thereafter.
* **Accessor accessibility modifier**: A restrictive visibility modifier applied to an individual `get`, `set`, or `init` accessor (such as `private set`), making it less accessible than the property itself.
* **get-only auto-property**: An auto-implemented property that defines only a `get` accessor, which can be assigned during declaration or inside the containing type's constructor.
* **init-only property**: A property that uses an `init` accessor instead of a `set` accessor, enforcing immutability after initialization.
* **Required member**: A property or field that must be initialized when an object is created via an object initializer expression.
* **required modifier**: The keyword used to enforce that a member must be supplied by the caller at creation time.
* **SetsRequiredMembersAttribute**: An attribute applied to a custom constructor to inform the compiler that the constructor initializes all `required` members, suppressing compilation errors.
* **Field-backed property**: A traditional property that explicitly references a separate private field to store its data.
* **field keyword**: A contextual keyword added in C# 14 that provides access to the compiler-synthesized backing field inside property accessors.
* **Property validation**: Logic placed inside a `set` or `init` accessor to reject invalid values before they affect object state.
* **Property notification**: The practice of raising an event (such as `INotifyPropertyChanged.PropertyChanged`) inside a property setter to alert external listeners of a value change.
* **Partial property**: A property split into a definition declaration and an implementation declaration, heavily used in source-generator scenarios (introduced in C# 13).
* **Property-targeted attribute**: An attribute explicitly applied to the backing field or property methods using target specifiers (e.g., `[field: NonSerialized]`).
* **Ref-returning property**: A property that returns a variable by reference (`ref`), allowing callers to modify the referenced storage location directly.
* **Ref-readonly property**: A property that returns a read-only reference (`ref readonly`), allowing efficient zero-copy reads of large structs without permitting mutation.

---

## Cross-item comparison

* **Auto-implemented property vs. Field-backed property vs. Computed property**: An auto-property relies on a compiler-generated backing field; a field-backed property explicitly names and manages its own storage field; a computed property maintains no backing storage and derives its value on demand.
* **`get`/`set` vs. `init` vs. `required`**: `get` and `set` allow continuous read and write access over an object's lifetime. `init` allows writing only during object construction. `required` mandates that a property *must* be provided by the caller during object creation.

---

## Examples

The following code block is an unverified conceptual example demonstrating auto-properties, init accessors, validation, and field-backed syntax (using unexecuted pseudocode syntax to illustrate structure).

```csharp
// Unverified / Pseudocode example
public class UserAccount
{
    // Required member with init-only access
    public required string Username { get; init; }

    // Auto-implemented property with property initializer
    public int AccessCount { get; private set; } = 0;

    // Field-backed property with property validation
    private string _email = string.Empty;
    public string Email
    {
        get => _email;
        set
        {
            if (!value.Contains("@"))
                throw new ArgumentException("Invalid email format.");
            _email = value;
        }
    }
}
```

* **Expected Result:** Calling code must supply `Username` via an object initializer because of the `required` modifier. Setting `Email` to an invalid string throws an exception during assignment.

---

## Common mistakes

* **Confusing `init` with constant immutability:** An `init` property can be modified *once* during object creation. It is mutable during construction, but read-only afterward.
* **Forgetting `required` constructor rules:** If a class has a custom constructor, leaving out the `SetsRequiredMembersAttribute` on that constructor will cause compiler errors when callers try to use it without object initializers.
* **Infinite recursion in property setters:** Assigning a value to the property name inside its own `set` accessor (e.g., `Value = value;`) causes infinite recursion and a stack overflow. Field-backed properties or the C# 14 `field` keyword must be used instead.

---

## Knowledge checks with answers

1. **Question:** What is the primary difference between a `set` accessor and an `init` accessor?
   * **Answer:** A `set` accessor allows a property value to be modified at any time throughout the object's lifecycle. An `init` accessor permits modification *only* during object initialization (such as inside an object initializer), rendering the property immutable thereafter.

2. **Question:** Why would you use a computed property instead of an auto-implemented property?
   * **Answer:** You use a computed property when the value should not be stored in a persistent field, but rather calculated dynamically on read from other state variables.

3. **Question:** What does the `required` modifier enforce on a property?
   * **Answer:** It forces callers to initialize the property whenever an instance of the type is created using an object initializer expression.
