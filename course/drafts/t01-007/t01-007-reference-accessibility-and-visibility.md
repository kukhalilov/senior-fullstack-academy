<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Type/member access domains and effective accessibility

*Note: This is an automatically generated draft.*

## Scope and version

**Scope:** This reference lesson covers type and member access domains, access modifiers, and effective accessibility rules within C#, based on the official Microsoft C# language reference and version history.
**Edition:** C# 15 / .NET 11 GA language surface checked 2026-11-14; memory-safety language preview is excluded.
**Source References:** [Microsoft C# Language Reference - Accessibility Levels](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/accessibility-levels) and [Microsoft C# Inheritance Overview](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance).

---

## How this group fits the mental model

In C#, object-oriented design and component boundaries rely heavily on controlling *who* can see and use your code. Access modifiers define the visibility of types and members, forming clear contracts between code inside an assembly, code in other assemblies, and code in derived classes. 

Effective accessibility acts as a system of guardrails: a member's visibility can never exceed the visibility of its containing type or the types used in its signature. Understanding these rules prevents accidental exposure of internal implementation details and enforces strong encapsulation across assembly boundaries.

---

## Supplied names explained

* **public accessibility**: The highest level of accessibility. There are no restrictions on accessing a public type or member.
* **private accessibility**: The most restrictive level. Access is limited to the containing type itself.
* **protected accessibility**: Access is limited to the containing type or types derived from the containing type.
* **internal accessibility**: Access is limited exclusively to files within the same assembly.
* **protected internal accessibility**: Access is permitted anywhere within the current assembly (like `internal`) *plus* derived types located in other assemblies (like `protected`).
* **private protected accessibility**: Access is limited to types derived from the containing class *only* when those derived types reside within the same assembly.
* **file accessibility modifier**: Restricts the visibility of a top-level type to the single source file in which it is declared.
* **Top-level type accessibility**: The baseline visibility rules that apply to types declared directly inside a namespace (typically restricted to `public` or `internal`).
* **Nested type accessibility**: The visibility rules applied to a type declared inside another type, which can use any access modifier including private.
* **Member accessibility**: The visibility rules applied to fields, properties, methods, and events within a type.
* **Effective accessibility**: The actual restricted visibility of a type or member, calculated as the most restrictive limit imposed by its own modifier, its containing type, and its signature types.
* **Containing type accessibility**: The outer type's access level that bounds how visible an inner type or member can effectively be.
* **Signature accessibility consistency**: The language rule requiring that a member's return type or parameter types must be at least as accessible as the member itself.
* **Friend assembly**: An assembly that is granted access to another assembly's internal types and members.
* **InternalsVisibleToAttribute**: The attribute used to specify friend assemblies, allowing designated external assemblies to access `internal` members.
* **Assembly boundary**: The physical compilation unit (such as a .dll or .exe) that defines the limits of internal visibility.
* **Derived-type access**: The ability of a subclass to access base class members marked as protected.
* **Same-assembly access**: Visibility shared across any code compiled into the exact same assembly.
* **Same-assembly derived-type access**: Visibility granted specifically to subclasses that exist within the same assembly.
* **Protected access through derived receiver**: The rule governing how `protected` members can be accessed via instances of derived types.
* **Accessibility domain**: The physical or logical program region in which a declared type or member can be referenced.

---

## Cross-item comparison

* **`public` vs `internal`**: `public` allows access from any referencing assembly, whereas `internal` restricts access strictly to code within the same assembly.
* **`protected` vs `private protected`**: `protected` permits access from derived types regardless of where they are located, while `private protected` restricts that derived-type access strictly to the same assembly.
* **`internal` vs `protected internal`**: `internal` allows access from any code in the same assembly; `protected internal` expands that by also allowing derived types in *other* assemblies to access the member.

---

## Examples

*Unverified pseudocode example demonstrating access modifiers:*

```csharp
namespace LibraryDemo
{
    // Top-level type accessibility (internal to this assembly)
    internal class BaseService
    {
        // public accessibility
        public void PublicOperation() { }

        // protected accessibility
        protected void ProtectedOperation() { }

        // private accessibility
        private void PrivateOperation() { }
    }

    // Derived-type access within the same assembly
    class DerivedService : BaseService
    {
        void TestAccess()
        {
            PublicOperation();     // Allowed
            ProtectedOperation();  // Allowed (Same-assembly derived-type access)
            // PrivateOperation();  // Error: inaccessible due to private accessibility
        }
    }
}
```

* **Expected Results:** `PublicOperation` and `ProtectedOperation` compile successfully within `DerivedService`, while attempting to call `PrivateOperation` fails because private members are restricted to their exact containing type.

---

## Common mistakes

* **Exceeding Containing Type Visibility:** Making a method `public` inside a class that is marked `internal`. The effective accessibility remains `internal`.
* **Signature Inconsistency:** Using a `private` class as the return type of a `public` method, which violates signature accessibility consistency rules.
* **Misunderstanding Protected Internal:** Assuming `protected internal` means "protected AND internal" (intersection); it actually means "protected OR internal" (union).
* **Cross-Assembly Protected Confusion:** Attempting to access a `protected` member on a base class instance without a valid derived receiver context.

---

## Knowledge checks with answers

1. **Question:** What is effective accessibility when a `public` method exposes a parameter type that is marked `internal`?
   **Answer:** The effective accessibility of the method is limited to `internal` because a member's visibility cannot exceed the accessibility of the types in its signature.

2. **Question:** Can a type declared directly inside a namespace use the `private` access modifier?
   **Answer:** No. Top-level types can only have `public` or `internal` (or `file`) accessibility. `private` is reserved for nested types and members.

3. **Question:** How does `InternalsVisibleToAttribute` alter the standard assembly boundary?
   **Answer:** It designates a specified external assembly as a "friend assembly," allowing that external assembly to access members and types marked with `internal` accessibility.

4. **Question:** What is the difference between `protected` and `private protected` regarding assembly boundaries?
   **Answer:** `protected` allows derived types to access the member regardless of which assembly they are in, whereas `private protected` requires the derived type to be in the *same* assembly.
