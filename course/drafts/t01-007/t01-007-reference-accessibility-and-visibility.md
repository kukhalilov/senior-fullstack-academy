<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Type/member access domains and effective accessibility

*This is an automatically generated draft.*

# Scope and version
This lesson covers the C# 15 / .NET 11 language surface regarding type and member access control. It focuses on the rules governing visibility and accessibility domains. Memory-safety language previews are excluded. Source: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/accessibility-levels).

# How this group fits the mental model
In C#, access modifiers act as a "gatekeeper" system. They define the **Accessibility domain**—the program text area where a member or type is visible. 

The mental model relies on two pillars:
1. **Encapsulation:** Hiding internal implementation details to prevent external code from relying on unstable parts of your system.
2. **Consistency:** The compiler enforces that a member cannot be "more visible" than the type that contains it. If a `public` class exposes a `private` method, the method is effectively hidden by the class's scope.

# Supplied names explained

* `public accessibility`: The most permissive level. There are no restrictions on accessing the member.
* `private accessibility`: The most restrictive level. Access is limited to the body of the class or struct in which the member is declared.
* `protected accessibility`: Access is limited to the containing class and any classes derived from it.
* `internal accessibility`: Access is limited to the current assembly (the compiled project file).
* `protected internal accessibility`: Access is limited to the current assembly OR types derived from the containing class in any assembly.
* `private protected accessibility`: Access is limited to the current assembly AND types derived from the containing class.
* `file accessibility modifier`: Limits the scope of a type to the specific source file in which it is declared.
* `Top-level type accessibility`: The visibility of a type declared at the namespace level (only `public` or `internal` are allowed).
* `Nested type accessibility`: The visibility of a type declared inside another type; it can use any of the six access modifiers.
* `Member accessibility`: The visibility of methods, fields, properties, etc., within a type.
* `Effective accessibility`: The actual visibility of a member, calculated as the minimum of the member's declared accessibility and the accessibility of its containing type.
* `Containing type accessibility`: The visibility of the class or struct that holds the member; this acts as a ceiling for the member's visibility.
* `Signature accessibility consistency`: The rule that a member's return type or parameter types must be at least as accessible as the member itself.
* `Friend assembly`: An assembly that is granted access to the `internal` members of another assembly.
* `InternalsVisibleToAttribute`: The attribute used to designate a specific assembly as a "friend" to allow cross-assembly `internal` access.
* `Assembly boundary`: The logical limit defined by the compiled project; `internal` members cannot cross this unless explicitly permitted.
* `Derived-type access`: The ability of a subclass to access members of its base class based on the `protected` or `private protected` modifiers.
* `Same-assembly access`: The ability for code within the same project to access `internal` members.
* `Same-assembly derived-type access`: The intersection of `internal` and `protected` rules, allowing access if the code is either in the same assembly OR is a derived type.
* `Protected access through derived receiver`: A rule stating that `protected` members can only be accessed through an instance of the derived class, not the base class.
* `Accessibility domain`: The conceptual "scope" or region of code where a specific identifier is reachable.

# Cross-item comparison

| Comparison | Context |
| :--- | :--- |
| `public` vs `internal` | `public` is visible everywhere; `internal` is restricted to the assembly. |
| `protected internal` vs `private protected` | `protected internal` is an "OR" relationship (Assembly OR Derived); `private protected` is an "AND" relationship (Assembly AND Derived). |

# Examples

```csharp
public class Base {
    private int _secret = 1;      // Only accessible in Base
    protected int _shared = 2;    // Accessible in Base and Derived
    internal int _internal = 3;   // Accessible in the same assembly
}

public class Derived : Base {
    public void Show() {
        // Console.WriteLine(_secret); // Error: private
        Console.WriteLine(_shared);    // OK: protected
        Console.WriteLine(_internal);  // OK: internal (same assembly)
    }
}
```

# Common mistakes
1. **Signature Mismatch:** Declaring a `public` method that returns a `private` class. The compiler will throw an error because the return type is less accessible than the method.
2. **Over-exposure:** Making everything `public` by default. This breaks encapsulation, making it impossible to change internal logic without breaking external code.
3. **Confusing `protected internal` and `private protected`:** Remember that `protected internal` is broader (more accessible), while `private protected` is narrower (more restrictive).

# Knowledge checks with answers

1. **Question:** Can a `private` member be accessed by a derived class?
   **Answer:** No. `private` members are only accessible within the class they are declared in.

2. **Question:** What is the "Effective accessibility" of a `public` method inside an `internal` class?
   **Answer:** `internal`. The class acts as a ceiling; even though the method is `public`, it cannot be accessed outside the assembly because the class itself is restricted.

3. **Question:** Which attribute allows another assembly to access `internal` members?
   **Answer:** `InternalsVisibleToAttribute`.
