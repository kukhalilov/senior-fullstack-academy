<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# arrays and dynamic arrays for algorithmic problem solving — Reference: Multidimensional array shapes

*This is an automatically generated draft.*

# Scope and version
This lesson covers the structural shapes of multidimensional arrays used in algorithmic problem solving. It focuses on how data is organized in grids or nested structures and how to navigate those structures efficiently. 

**Version Information:**
- **Standards:** Timeless array algorithms and C#/.NET collection behaviors.
- **Reference Date:** Checked 2026-11-17.
- **Sources:** [Microsoft Learn: C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays), [OpenDSA: Array-Based Lists](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html).

# How this group fits the mental model
A standard array is a linear sequence of items. However, many real-world problems require data to be organized in multiple **dimensions** (levels of organization). 

Think of a **Rectangular multidimensional array** as a single, solid block of graph paper. Every row is exactly the same length, forming a perfect grid. In contrast, think of a **Jagged array** as a stack of drawers where each drawer can hold a different number of items. 

To use these structures, you must understand their **bounds** (the limits of where data starts and ends) and how to perform a **traversal** (the process of visiting every item in the structure).

# Supplied names explained
*   `Rectangular multidimensional array`: A C# multidimensional array has a fixed length for each declared dimension, such as `int[,]`. It is one array object with a uniform rectangular shape; elements are addressed with a comma-separated index such as `grid[row, column]`. C# enumerates its rightmost dimension fastest. Do not assume all languages share identical storage details.
*   `Jagged array`: A jagged array is an array whose elements are themselves arrays, such as C# `int[][]`. Each row array can have a different length and is a separate reference; a row can also be null until initialized. It represents irregular nested sequences as well as grid-like data.
*   `Row-major traversal`: For a two-dimensional array, row-major traversal visits columns within a row before moving to the next row. C# multidimensional-array enumeration increments the rightmost index first. This order matches row-first loops; locality can help performance in row-major implementations, but benchmark when performance matters.
*   `Row and column bounds`: These are the valid index limits for each dimension. In a zero-indexed C# array with dimension size `N>0`, valid indices run from `0` through `N-1`; a zero-length dimension has no valid index. Use `GetLength(dimension)` for runtime bounds. An out-of-range access throws an index-range exception.

# Cross-item comparison
| Feature | Rectangular multidimensional array | Jagged array |
| :--- | :--- | :--- |
| **Shape** | Fixed grid; all rows are equal length. | Flexible; rows can have different lengths. |
| **Structure** | One rectangular array object with fixed dimension lengths. | An outer array of references to separately allocated row arrays. |
| **Access Syntax** | Typically `array[row, col]`. | Typically `array[row][col]`. |
| **Performance** | Can suit dense uniform grids; actual speed depends on runtime and access pattern. | Supports variable row lengths but adds row references and per-row object overhead. Benchmark concrete workloads. |

# Examples
The following C# snippets demonstrate how these shapes are defined and traversed.

### Rectangular Array Example
This creates a grid with 2 rows and 3 columns.
```csharp
// Declaration: 2 rows, 3 columns
int[,] grid = new int[2, 3] {
    { 1, 2, 3 },
    { 4, 5, 6 }
};

// Row-major traversal
for (int i = 0; i < grid.GetLength(0); i++) { // Row bounds
    for (int j = 0; j < grid.GetLength(1); j++) { // Column bounds
        Console.Write(grid[i, j] + " ");
    }
}
```

### Jagged Array Example
This creates an array where the first row has 2 items and the second row has 4 items.
```csharp
// Declaration: An array of 2 arrays
int[][] jagged = new int[2][];
jagged[0] = new int[] { 10, 20 };
jagged[1] = new int[] { 30, 40, 50, 60 };

// Accessing a specific element
int value = jagged[1][2]; // Result: 50
```

# Common mistakes
*   **Confusing Syntax:** Using `array[x][y]` when the array was defined as `array[x, y]`. These are different types in languages like C#.
*   **Hard-coding Bounds:** Using a fixed number like `5` in a loop instead of checking the actual length of the array. This leads to errors if the array size changes.
*   **Memory Inefficiency:** Using a `Rectangular multidimensional array` for data that is mostly empty (sparse data). If most rows only have 1 item but one row has 100, a rectangular array wastes space by making every row 100 items long. A `Jagged array` would be better here.
*   **Incorrect Traversal Order:** Performing "Column-major" traversal (visiting all rows for column 0, then all rows for column 1) on a row-major system. In a row-major implementation, row-first traversal usually has better locality. The size of any performance difference depends on runtime and workload, so measure performance-sensitive code.

# Knowledge checks with answers
1. **Question:** If you are building a game board where every row must always be the same width, which array shape is most appropriate?
2. **Question:** In a 0-indexed array with 10 columns, what is the upper **column bound**?
3. **Question:** Why is **Row-major traversal** generally preferred over column-major traversal?
4. **Question:** True or False: A **Jagged array** is stored in a single, unbroken block of memory.

**Answers:**
1. Rectangular multidimensional array.
2. 9 (Indices are 0 through 9).
3. It matches how the data is physically stored in memory, making it faster for the CPU to read.
4. False. In C#, the outer array stores references to separate row-array objects.
