<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Reference: Constructor forms, initializer order, required state, and object creation

*This lesson is an automatically generated draft based on C# 15 / .NET 11 specifications.*

# Scope and version
This lesson covers the mechanisms for object creation, initialization, and lifetime management in C# 15. It focuses on how constructors, initializers, and required members ensure that objects reach a valid state.

*   **Version:** C# 15 / .NET 11 (Stable, checked 2026-11-17).
*   **Source:** [Microsoft Learn C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/constructor).

# How this group fits the mental model
In C#, constructors and initializers provide ways to establish an instance's initial state, but they don't automatically guarantee domain validity. Their code and any required runtime checks determine whether the invariants actually hold.

Think of this as a two-phase process:
1.  **Creation:** A class instance or value is created according to its type and context; `new` doesn't imply a separate heap allocation for every value.
2.  **Initialization:** Applicable field/property initializers, constructor chaining, and constructor bodies run according to C# ordering rules. `default(S)` differs from `new S()` when a struct declares a parameterless constructor.

# Supplied names explained

### Construction and Chaining
*   `Instance constructor`: A special method that runs when an object is created to initialize instance state.
*   `Static constructor`: A runtime type initializer that runs at most once per closed constructed type. With an explicit static constructor, initialization is triggered before the first instance or static member declared on the type is used; types marked `beforefieldinit` have looser timing.
*   `Parameterless constructor`: A constructor that takes no arguments.
*   `Explicit parameterless struct constructor`: A user-defined constructor in a struct that takes no parameters.
*   `Implicit parameterless struct constructor`: The implicit zero-initializing parameterless construction behavior when no user-defined parameterless struct constructor is declared. `default(S)` always produces the default value and doesn't run a user-defined parameterless constructor.
*   `Primary constructor on class`: A concise syntax to declare constructor parameters directly in the class header.
*   `Primary constructor on struct`: Similar to class, but applies to struct initialization logic.
*   `Constructor overload`: Defining multiple constructors with different parameter signatures.
*   `Constructor initializer`: Syntax (`: this()` or `: base()`) to call another constructor before the current body runs.
*   `this constructor initializer`: Calls another constructor within the same class.
*   `base constructor initializer`: Calls a constructor in the parent class.
*   `Constructor chaining`: The process of calling one constructor from another to reduce code duplication.
*   `Constructor overload resolution`: The compiler's process of choosing the best constructor based on provided arguments.
*   `Static constructor execution`: Explicit type initializer timing differs from `beforefieldinit` timing. An explicit static constructor prevents the compiler from marking the type `beforefieldinit`; absent that explicit constructor, static initialization can occur at an implementation-chosen time before static fields are first accessed.
*   `Static constructor exception`: If a type initializer throws, it isn't retried and the type remains uninitialized for the lifetime of its load context; later attempts typically surface `TypeInitializationException`.
*   `Constructor body`: The block of code `{ ... }` that executes after initializers.
*   `Constructor accessibility`: Modifiers (public, private, etc.) that control who can instantiate the type.
*   `Private constructor`: Restricts ordinary constructor calls to permitted code in the containing type; it can support controlled creation patterns. Static classes cannot declare instance constructors.
*   `Protected constructor`: Allows instantiation only by derived classes.
*   `Copy constructor pattern`: A manual constructor that creates a new object based on an existing one.
*   `Record copy constructor`: A compiler-generated constructor used by records to facilitate cloning.
*   `Constructor definite assignment`: Definite-assignment rules apply to variables and certain struct construction paths, but fields receive default values; constructors need not explicitly assign every field.
*   `Constructor exception safety`: If a constructor throws, the caller doesn't receive a successfully constructed instance. A finalizer may nevertheless run later for an allocated finalizable object, so finalizers must tolerate partially initialized state.

### Initialization and Creation
*   `Instance field initializer`: Assigning a value to a field at its declaration.
*   `Static field initializer`: Assigning a value to a static field at its declaration.
*   `Instance property initializer`: Assigning a value to a property at its declaration.
*   `Static property initializer`: Assigning a value to a static property at its declaration.
*   `Object initializer`: Syntax `{ Prop = val }` to set properties immediately after construction.
*   `Collection initializer`: Syntax `{ val1, val2 }` to populate collections during creation.
*   `With initializer`: Used within a `with` expression to modify specific properties during a copy.
*   `Target-typed new`: Using `new()` without a type name when the type is inferred from the context.
*   `new expression`: Creates a class instance or constructs a value according to the target type; it doesn't imply every value type is separately heap allocated.
*   `new() target-typed object creation`: A shorthand for `new Type()` when the type is known.
*   `default expression`: Returns the language-defined default value for a type (null for reference types; default field values for value types), without invoking a user-defined struct parameterless constructor.
*   `default literal`: The `default` keyword used as a value.
*   `Default class instance state`: A reference type initialized to `null`.
*   `Default struct value`: All fields set to their bitwise zero representation.
*   `Struct value initialization`: A struct's fields begin with their default values; constructor and field-initializer rules then apply according to the construction form.
*   `Struct default constructor invocation`: `new S()` invokes a user-defined parameterless struct constructor when present; `default(S)` and `default` do not.
*   `Object construction failure`: Occurs when a constructor throws an exception.

### Required Members and Lifetime
*   `Required member initialization`: A compile-time requirement that creation expressions initialize required fields/properties unless a constructor asserts `SetsRequiredMembers`; it doesn't ensure non-null or valid domain data at runtime.
*   `required modifier`: A keyword applied to fields/properties that requires assignment during initialization. Null can still be assigned (with a nullable warning for a non-nullable reference), and a constructor annotated `SetsRequiredMembers` opts out of caller checks.
*   `SetsRequiredMembersAttribute`: An attribute applied to a constructor to tell the compiler that this constructor handles all required members.
*   `SetsRequiredMembers constructor contract`: An assertion to the compiler that the constructor sets all required members; the compiler doesn't verify the implementation actually does so.
*   `Required-member compiler diagnostic`: The error generated if a `required` member is not set.
*   `MemberNotNull attribute on constructor`: Tells the compiler that a constructor ensures specific members are not null.
*   `with expression`: Creates a copy of a record with modified values.
*   `Record shallow copy behavior`: Only the top-level references are copied, not the deep contents of referenced objects.
*   `Finalizer declaration`: Syntax `~ClassName()` to define cleanup logic.
*   `Destructor syntax`: The C# syntax for finalizers.
*   `IDisposable lifetime pattern`: The standard interface-based approach for deterministic cleanup.
*   `Static constructor before first instance`: Explicit type initializers run before instance construction, subject to the special case where a static field initializer itself creates an instance. `beforefieldinit` permits earlier or later timing within its specified bounds.
*   `BeforeFieldInit metadata behavior`: A CLI type flag that allows type initialization at an implementation-chosen time before first access to a static field; it does not simply mean "lazy" initialization.

# Cross-item comparison
*   **`Instance constructor` vs `Primary constructor`**: Traditional constructors are explicit blocks; primary constructors are declarative and integrate with the class/struct header.
*   **`Object initializer` vs `Required member`**: Object initializers are optional; `required` members are mandatory for the code to compile.
*   **`Class` vs `Struct` initialization**: `new` creates a class instance with reference semantics; struct construction produces a value and runs applicable constructor logic. `default(S)` produces the default value without running a user-defined parameterless constructor.

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
    *   **Answer:** The caller doesn't receive a successfully constructed instance. If storage for a finalizable object was allocated, its finalizer can still run later; write it to tolerate partially initialized state.
2.  **Question:** How do you force a caller to provide a value for a property?
    *   **Answer:** Use the `required` modifier on the property.
3.  **Question:** What is the difference between `new()` and `default`?
    *   **Answer:** `new S()` invokes the applicable constructor (including a user-defined parameterless struct constructor); `default(S)` yields the default value without running that constructor. For classes, `new C()` invokes a constructor and creates an instance.
