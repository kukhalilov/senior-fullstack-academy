<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Exercises and worked solutions

# Goals
- Understand the mental model of C# nullability, distinguishing between nullable value types (`Nullable<T>` / `T?`) and nullable reference types (compile-time annotation and static-flow-analysis system).
- Practice problem-solving using nullable value types, lifted operations, null-coalescing (`??`), null-conditional (`?.`) operators, and runtime validation guards like `ArgumentNullException.ThrowIfNull(Object?, String?)` [https://learn.microsoft.com/en-us/dotnet/api/system.argumentnullexception.throwifnull].
- Learn how to solve compiler warnings and use flow-analysis attributes (`NotNullWhen`, `NotNullIfNotNull`, etc.) to communicate contracts accurately.

# Worked example
Consider a practical data retrieval helper method that accepts a user repository, fetches a user record by identifier, and formats the user's display name safely. This example demonstrates how nullable value types, nullable reference types, and guard clauses fit together.

```csharp
#nullable enable

using System;

public record UserProfile(int Id, string Username, string? Email);

public interface IUserRepository
{
    UserProfile? FindById(int id);
}

public static class UserFormatter
{
    public static string FormatDisplayName(UserProfile? user)
    {
        // Runtime validation for an API that requires a non-null profile
        ArgumentNullException.ThrowIfNull(user);

        // Coalescing supplies a domain-appropriate fallback for the optional email
        string emailPart = user.Email ?? "no-email@example.com";
        return $"{user.Username} ({emailPart})";
    }
}
```

*Proof idea*: `UserProfile?` indicates that the input may be null. `ArgumentNullException.ThrowIfNull(user)` throws at runtime for null. Its annotated contract lets flow analysis treat `user` as not-null after the call on the continuing path; this is a static state based on the guard contract.

*Dry run*:
1. If `user` is passed as `null`, `ArgumentNullException.ThrowIfNull(user)` throws an `ArgumentNullException`.
2. If `user` is passed as `new UserProfile(1, "Alice", null)`, the method proceeds. `user.Email` evaluates to `null`, so the null-coalescing operator (`??`) falls back to `"no-email@example.com"`. The formatted string returned is `"Alice (no-email@example.com)"`.

# Exercises
1. **Value Type Null-Coalescing & Defaulting**: Write a method `int GetActiveTimeout(int? configuredTimeout)` that returns `configuredTimeout` if it has a value, or `30` as a default fallback using the null-coalescing operator (`??`).
2. **Runtime Guard Integration**: Write a method `void ProcessText(string? input)` that uses `ArgumentException.ThrowIfNullOrWhiteSpace(input)` to validate the parameter before converting it to uppercase and printing it.
3. **Try-Pattern with Nullable Output**: Implement a method `bool TryParseCoordinate(string? text, out double? result)` that returns `false` if `text` is null or whitespace or cannot be parsed via `double.TryParse`, and returns `true` with the parsed value stored in the `out` parameter.

# Progressive hints
- **Hint for Exercise 1**: Think about how `??` evaluates the left-hand side if it is a `Nullable<T>`. It evaluates to the underlying `T` value when `HasValue` is true, or the right-hand operand when false.
- **Hint for Exercise 2**: Check the available string guard methods in the supplied API inventory, specifically `ArgumentException.ThrowIfNullOrWhiteSpace(String, String?)` [https://learn.microsoft.com/en-us/dotnet/api/system.argumentexception.throwifnullorwhitespace].
- **Hint for Exercise 3**: Combine standard `double.TryParse` logic with a null check on the input string. Ensure the `out` parameter correctly uses `double?` to support failure states.

# Complete solutions
```csharp
#nullable enable

using System;

public static class ExerciseSolutions
{
    // Solution 1: Null-coalescing with nullable value types
    public static int GetActiveTimeout(int? configuredTimeout)
    {
        return configuredTimeout ?? 30;
    }

    // Solution 2: Runtime validation guard
    public static void ProcessText(string? input)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(input);
        Console.WriteLine(input.ToUpperInvariant());
    }

    // Solution 3: Try-pattern with nullable output
    public static bool TryParseCoordinate(string? text, out double? result)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            result = null;
            return false;
        }

        if (double.TryParse(text, out double parsedValue))
        {
            result = parsedValue;
            return true;
        }

        result = null;
        return false;
    }
}
```

# Tests and edge cases
- **Value Type Edge Case**: Passing `new Nullable<int>()` (i.e., `null` for `int?`) to `GetActiveTimeout` correctly returns `30`.
- **Reference Type Edge Case**: Passing an empty string or whitespace string to `ProcessText` triggers `ArgumentException` via `ArgumentException.ThrowIfNullOrWhiteSpace(String, String?)` [https://learn.microsoft.com/en-us/dotnet/api/system.argumentexception.throwifnullorwhitespace].
- **Analysis Caveat**: Remember that nullable reference type annotations are a compile-time static-flow-analysis system; they do not perform runtime checks by themselves unless paired with explicit guard clauses like `ArgumentNullException.ThrowIfNull(Object?, String?)` [https://learn.microsoft.com/en-us/dotnet/api/system.argumentnullexception.throwifnull].

# Reflection questions
1. How does `Nullable<T>` differ conceptually between value types (`T?` where `T : struct`) and reference types (`T?` where `T : class`) at runtime?
2. Why is the null-forgiving operator (`!`) considered an assertion by the programmer rather than a runtime null check?
3. When should you use flow-analysis attributes like `NotNullWhen` versus relying on standard compiler type flow?

*Source references*:
- [Microsoft Learn: Nullable value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types)
- [Microsoft Learn: Nullable reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types)
- [Microsoft Learn: ArgumentNullException.ThrowIfNull API](https://learn.microsoft.com/en-us/dotnet/api/system.argumentnullexception.throwifnull)
- [Microsoft Learn: ArgumentException.ThrowIfNullOrWhiteSpace API](https://learn.microsoft.com/en-us/dotnet/api/system.argumentexception.throwifnullorwhitespace)
