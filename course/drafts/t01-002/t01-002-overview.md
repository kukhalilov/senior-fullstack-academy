<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Big-picture orientation and mental model

*Draft: Automatically generated.*

# Problem and purpose
In C#, code is not just a single block of text; it is a collection of files that must be organized to remain readable and maintainable. As a project grows, you need a way to group related code (namespaces), bring in external functionality (using directives), and define exactly where the computer should start executing your program (entry points). This topic provides the structural rules for how C# source files are organized and how they transition from raw text into a running application.

# Plain-language mental model
Think of a C# project like a large library:
*   **Compilation units (Source files):** These are the individual books on the shelves.
*   **Namespaces:** These are the sections of the library (e.g., "History," "Science"). They prevent name collisions—you can have a book titled "Introduction" in both sections without confusion.
*   **Using directives:** These are "shortcuts" or "bookmarks." Instead of walking to the "Science" section every time you need a specific book, you place a bookmark on your desk so you can refer to it by its short title.
*   **Entry point:** This is the "front door" of the library. It is the specific location where the program begins its work when you run it.

# How the parts fit together
C# organizes code hierarchically. A **project** contains multiple **compilation units** (source files). Inside these files, you declare **namespaces** to group your **type declarations** (like classes or structs). To use types from other namespaces, you use **using directives**. Finally, the compiler looks for a specific **entry point**—either a traditional `Main` method or modern **top-level statements**—to determine how to launch the application.

# Concept map
1.  **Source Units:** The physical file structure.
2.  **Organization:** Namespaces (block-scoped vs. file-scoped) that contain types.
3.  **Visibility:** Using directives (standard, static, alias, and global) that manage how you reference types.
4.  **Execution:** Application forms (file-based vs. project-based) and the entry point (Main method signatures or top-level statements).
5.  **Interaction:** How the process receives command-line arguments and returns an exit code.

# End-to-end walkthrough
Imagine a simple "Hello World" program:

1.  **The File:** You create a file. In a modern **file-based app**, you use **top-level statements**. You simply write `Console.WriteLine("Hello!");`.
2.  **The Namespace:** If you add a class, you wrap it in a **file-scoped namespace declaration** to keep it organized.
3.  **The Import:** You add a `using System;` directive at the top so you can type `Console` instead of `System.Console`.
4.  **The Execution:** When you run the program, the compiler treats your top-level code as the **Main method**. If you need to accept input, you can access the `args` array (representing **command-line arguments**) directly.
5.  **The Exit:** If your program finishes successfully, it returns an implicit exit code of `0`. You can explicitly return an integer to signal success or failure to the operating system.

Source: [Microsoft Learn C# Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)

# When to use it and tradeoffs
*   **Top-level statements vs. Main method:** Use top-level statements for small utilities or simple scripts to reduce "boilerplate" (repetitive code). Use a formal `Main` method when you need explicit control over the entry point signature or are working in a legacy project-based app.
*   **File-scoped vs. Block-scoped namespaces:** Use file-scoped namespaces to reduce indentation levels and keep your code cleaner. Use block-scoped namespaces if you need to define multiple namespaces within a single file (rare).
*   **Global using directives:** Use these to avoid repeating common imports across every file in your project, but be careful: too many global imports can make it difficult to track where a type originated.

# What later lessons cover
*   **Type declarations:** How to define the classes, structs, and interfaces that live inside your namespaces.
*   **Statements and control flow:** The logic that goes inside your `Main` method or top-level statements.
*   **Build configuration:** How the project file (`.csproj`) manages the compilation process and dependencies.

*Source references:*
*   [C# Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)
*   [Namespaces](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/namespaces)
*   [Main and Command-Line Arguments](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/main-command-line)
*   [Top-Level Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements)
