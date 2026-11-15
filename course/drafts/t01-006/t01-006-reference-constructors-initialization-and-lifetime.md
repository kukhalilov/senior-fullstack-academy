<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Reference: Constructor forms, initializer order, required state, and object creation

*This lesson is an automatically generated draft based on C# 15 / .NET 11 specifications.*

# Scope and version
This lesson covers the mechanisms for object creation, initialization, and lifetime management in C# 15. It focuses on how constructors, initializers, and required members ensure that objects reach a valid state.

*   **Version:** C# 15 / .NET 11 (Stable, checked 2026-11-14).
*   **Source:** [Microsoft Learn C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/constructor).

# How this group fits the mental model
In C#, a type declaration defines a contract. To use that contract, you must instantiate it. The "Constructor/Initialization" group ensures that when an object is created, it is not left in an invalid or "garbage" state. 

Think of this as a two-phase process:
1.  **Allocation:** Memory is reserved for the object.
2.  **Initialization:** Constructors and initializers run to set the object's fields and properties to their intended starting values.

# Supplied names explained

### Construction and Chaining
*   `Instance constructor`: A special method that runs when an object is created to initialize instance state.
*   `Static constructor`: A method that runs once per type, before any instance is created or static members are accessed.
*   `Parameterless constructor`: A constructor that takes no arguments.
*   `Explicit parameterless struct constructor`: A user-defined constructor in a struct that takes no parameters.
*   `Implicit parameterless struct constructor`: The default constructor provided by the compiler for structs if none is defined.
*   `Primary constructor on class`: A concise syntax to declare constructor parameters directly in the class header.
*   `Primary constructor on struct`: Similar to class, but applies to struct initialization logic.
*   `Constructor overload`: Defining multiple constructors with different parameter signatures.
*   `Constructor initializer`: Syntax (`: this()` or `: base()`) to call another constructor before the current body runs.
*   `this constructor initializer`: Calls another constructor within the same class.
*   `base constructor initializer`: Calls a constructor in the parent class.
*   `Constructor chaining`: The process of calling one constructor from another to reduce code duplication.
*   `Constructor overload resolution`: The compiler's process of choosing the best constructor based on provided arguments.
*   `Static constructor execution`: The runtime guarantee that static constructors run before any instance or static member access.
*   `Static constructor exception`: If a static constructor fails, the type becomes unusable for the life of the application domain.
*   `Constructor body`: The block of code `{ ... }` that executes after initializers.
*   `Constructor accessibility`: Modifiers (public, private, etc.) that control who can instantiate the type.
*   `Private constructor`: Restricts instantiation to within the class itself (often used for static utility classes).
*   `Protected constructor`: Allows instantiation only by derived classes.
*   `Copy constructor pattern`: A manual constructor that creates a new object based on an existing one.
*   `Record copy constructor`: A compiler-generated constructor used by records to facilitate cloning.
*   `Constructor definite assignment`: The compiler requirement that all fields must be assigned a value before the constructor finishes.
*   `Constructor exception safety`: The principle that if a constructor throws, the object is not considered "created," and the finalizer will not run.

### Initialization and Creation
*   `Instance field initializer`: Assigning a value to a field at its declaration.
*   `Static field initializer`: Assigning a value to a static field at its declaration.
*   `Instance property initializer`: Assigning a value to a property at its declaration.
*   `Static property initializer`: Assigning a value to a static property at its declaration.
*   `Object initializer`: Syntax `{ Prop = val }` to set properties immediately after construction.
*   `Collection initializer`: Syntax `{ val1, val2 }` to populate collections during creation.
*   `With initializer`: Used within a `with` expression to modify specific properties during a copy.
*   `Target-typed new`: Using `new()` without a type name when the type is inferred from the context.
*   `new expression`: The primary keyword used to allocate memory and invoke a constructor.
*   `new() target-typed object creation`: A shorthand for `new Type()` when the type is known.
*   `default expression`: Returns the default value for a type (null for classes, zeroed memory for structs).
*   `default literal`: The `default` keyword used as a value.
*   `Default class instance state`: A reference type initialized to `null`.
*   `Default struct value`: All fields set to their bitwise zero representation.
*   `Struct value initialization`: The process of zeroing memory for a struct before the constructor runs.
*   `Struct default constructor invocation`: The process of running the parameterless constructor on a struct.
*   `Object construction failure`: Occurs when a constructor throws an exception.

### Required Members and Lifetime
*   `Required member initialization`: The enforcement that specific properties must be set by the caller.
*   `required modifier`: A keyword applied to properties/fields that forces them to be initialized.
*   `SetsRequiredMembersAttribute`: An attribute applied to a constructor to tell the compiler that this constructor handles all required members.
*   `SetsRequiredMembers constructor contract`: The promise that a constructor satisfies all `required` members.
*   `Required-member compiler diagnostic`: The error generated if a `required` member is not set.
*   `MemberNotNull attribute on constructor`: Tells the compiler that a constructor ensures specific members are not null.
*   `with expression`: Creates a copy of a record with modified values.
*   `Record shallow copy behavior`: Only the top-level references are copied, not the deep contents of referenced objects.
*   `Finalizer declaration`: Syntax `~ClassName()` to define cleanup logic.
*   `Destructor syntax`: The C# syntax for finalizers.
*   `IDisposable lifetime pattern`: The standard interface-based approach for deterministic cleanup.
*   `Static constructor before first instance`: The timing rule for static initialization.
*   `BeforeFieldInit metadata behavior`: A performance optimization where static constructors run lazily.

# Cross-item comparison
*   **`Instance constructor` vs `Primary constructor`**: Traditional constructors are explicit blocks; primary constructors are declarative and integrate with the class/struct header.
*   **`Object initializer` vs `Required member`**: Object initializers are optional; `required` members are mandatory for the code to compile.
*   **`Class` vs `Struct` initialization**: Classes are initialized via `new` (heap allocation); structs are initialized by zeroing memory, then optionally running a constructor.

# Examples
```csharp
// Primary constructor and required member
public class User(string name) {
    public string Name { get; } = name;
    public required int Age { get; set; }
}

// Usage
var user = new User("Alice") { Age = 30 }; // Object initializer
```

# Common mistakes
1.  **Assuming structs always run constructors:** Structs are initialized to their default (zeroed) state even if you don't call a constructor.
2.  **Ignoring shallow copy:** Using `with` on a record does not clone objects inside the record; it only copies the references.
3.  **Static constructor timing:** Relying on the exact order of static constructors across different types is dangerous; use `BeforeFieldInit` behavior to your advantage.

# Knowledge checks with answers
1.  **Question:** What happens if a constructor throws an exception?
    *   **Answer:** The object is not successfully created, and the finalizer will not be called.
2.  **Question:** How do you force a caller to provide a value for a property?
    *   **Answer:** Use the `required` modifier on the property.
3.  **Question:** What is the difference between `new()` and `default`?
    *   **Answer:** `new()` invokes a constructor; `default` returns the zeroed-out state of the type without calling a constructor.
