
# arrays and dynamic arrays for algorithmic problem solving — Problem: Best Time to Buy and Sell Stock

# Goals
- Learn how to solve the "Best Time to Buy and Sell Stock" problem using a single pass and a running minimum tracking pattern.
- Understand how contiguous memory storage, index tracking, and linear scans allow efficient $O(N)$ time and $O(1)$ space problem-solving.
- Practice writing a self-contained, executable C# solution that validates sample cases and edge cases, throwing an `InvalidOperationException` on failure.

# Problem statement
Given an integer array `prices` where `prices[i]` is the stock price on day `i`, choose one day to buy and a different later day to sell. Return the maximum profit; return `0` if no profitable transaction is possible.

# Input constraints
- `1 <= prices.Length <= 10^5`
- `0 <= prices[i] <= 10^4`
- The buy day must be strictly earlier than the sell day.

# Examples with expected output
- Example 1:
  - Input: `prices = [7, 1, 5, 3, 6, 4]`
  - Expected Output: `5` (Buy on day 2 at price 1, sell on day 5 at price 6, profit = $6 - 1 = 5$)
- Example 2:
  - Input: `prices = [7, 6, 4, 3, 1]`
  - Expected Output: `0` (Prices strictly decrease, so no profitable transaction can be made)

# Clarifying assumptions
- If the array has length 1, no second day exists to sell, so the profit is `0`.
- We can only complete at most one transaction (one buy and one sell).
- Prices are non-negative integers.

# Progressive hints
1. **Hint 1:** Instead of checking every possible pair of days (which takes $O(N^2)$ time), ask yourself: as you move through the array from left to right, what is the lowest price you have seen so far?
2. **Hint 2:** If you know the minimum price up to the current day, what is the maximum profit you could earn if you sold on the current day?
3. **Hint 3:** Keep track of two variables as you loop through the array: `minPriceSoFar` (initialized to a very high value or the first element) and `maxProfitSoFar` (initialized to `0`). Update them on every single step.

# Complete C# solution
```csharp dsa-solution
using System;

public class Program
{
    public static int MaxProfit(int[] prices)
    {
        if (prices == null || prices.Length == 0)
        {
            return 0;
        }

        int minPriceSoFar = prices[0];
        int maxProfitSoFar = 0;

        for (int i = 1; i < prices.Length; i++)
        {
            if (prices[i] < minPriceSoFar)
            {
                minPriceSoFar = prices[i];
            }
            else
            {
                int currentProfit = prices[i] - minPriceSoFar;
                if (currentProfit > maxProfitSoFar)
                {
                    maxProfitSoFar = currentProfit;
                }
            }
        }

        return maxProfitSoFar;
    }

    public static void Main()
    {
        // Sample 1
        int[] prices1 = { 7, 1, 5, 3, 6, 4 };
        int result1 = MaxProfit(prices1);
        if (result1 != 5)
        {
            throw new InvalidOperationException($"Sample 1 failed: expected 5, got {result1}");
        }

        // Sample 2
        int[] prices2 = { 7, 6, 4, 3, 1 };
        int result2 = MaxProfit(prices2);
        if (result2 != 0)
        {
            throw new InvalidOperationException($"Sample 2 failed: expected 0, got {result2}");
        }

        // Edge case: Single element array
        int[] prices3 = { 5 };
        int result3 = MaxProfit(prices3);
        if (result3 != 0)
        {
            throw new InvalidOperationException($"Edge case single element failed: expected 0, got {result3}");
        }

        // Edge case: Two elements profitable
        int[] prices4 = { 1, 5 };
        int result4 = MaxProfit(prices4);
        if (result4 != 4)
        {
            throw new InvalidOperationException($"Edge case two elements failed: expected 4, got {result4}");
        }

        Console.WriteLine("All tests passed successfully.");
    }
}
```

# Correctness argument
The algorithm uses a linear scan from left to right. By maintaining the minimum price encountered so far (`minPriceSoFar`), we guarantee that any potential sell price on day `i` is paired with the absolute lowest buying price available prior to day `i`. Because we examine every day exactly once and update our best profit dynamically, we explore all valid chronologically ordered pairs without needing nested loops.

# Step-by-step dry run
Let's trace `prices = [7, 1, 5, 3, 6, 4]`:
- Initial state: `minPriceSoFar = 7`, `maxProfitSoFar = 0`.
- Loop `i = 1`, `prices[1] = 1`:
  - `1 < 7`, so `minPriceSoFar` becomes `1`.
- Loop `i = 2`, `prices[2] = 5`:
  - `5 < 1` is false. `currentProfit = 5 - 1 = 4`.
  - `4 > 0`, so `maxProfitSoFar` becomes `4`.
- Loop `i = 3`, `prices[3] = 3`:
  - `3 < 1` is false. `currentProfit = 3 - 1 = 2`.
  - `2 > 4` is false. `maxProfitSoFar` remains `4`.
- Loop `i = 4`, `prices[4] = 6`:
  - `6 < 1` is false. `currentProfit = 6 - 1 = 5`.
  - `5 > 4`, so `maxProfitSoFar` becomes `5`.
- Loop `i = 5`, `prices[5] = 4`:
  - `4 < 1` is false. `currentProfit = 4 - 1 = 3`.
  - `3 > 5` is false. `maxProfitSoFar` remains `5`.
- Loop ends. Returns `5`.

# Time complexity
The algorithm visits each element in the array exactly once in a single linear scan. Therefore, the time complexity is $O(N)$, where $N$ is the number of elements in `prices`.

# Space complexity
The algorithm uses a fixed number of scalar variables (`minPriceSoFar`, `maxProfitSoFar`, loop index `i`), requiring no auxiliary data structures or dynamic allocation. Therefore, the space complexity is $O(1)$.

# Edge-case tests
- **Single element (`[5]`):** The loop is bypassed, and the initial `maxProfitSoFar` of `0` is returned correctly.
- **Strictly decreasing array (`[7, 6, 4, 3, 1]`):** `minPriceSoFar` continuously drops, and no profit calculation exceeds `0`. Returns `0`.
- **Two elements (`[1, 5]`):** Correctly computes `5 - 1 = 4`.

# Reflection questions
1. Why does tracking the running minimum eliminate the need to check every possible pair of buy and sell days?
2. How would the solution change if you were allowed to complete multiple transactions instead of just one?
3. What happens if the input array reference is `null` or empty, and how does the guard clause protect against it?

Sources: [Topic reference](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html); [Assigned problem](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/description/)
