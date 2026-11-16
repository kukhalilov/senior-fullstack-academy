# Fenwick trees, segment trees, and static range queries — Problem: Range Module

## Goals

Maintain covered half-open coordinate ranges with dynamic range assignment, full-coverage queries, and sparse tree allocation.

## Problem statement

Implement `addRange(left,right)`, `removeRange(left,right)`, and `queryRange(left,right)` on tracked half-open intervals `[left,right)`. A query is true only when every point in that interval is tracked. [Official problem statement](https://leetcode.com/problems/range-module/)

## Input constraints

- `1 <= left < right <= 10^9` for each call.
- At most `10^4` calls across add, query, and remove.

## Examples with expected output

1. Add `[10,20)`, remove `[14,16)`, then query `[10,14)` → `true`; `[13,15)` → `false`; `[16,17)` → `true`.
2. Add `[1,5)`, remove `[2,4)`, query `[1,2)` → `true`; `[2,4)` → `false`; `[4,5)` → `true`.

## Clarifying assumptions

Intervals are half-open; adjacent intervals `[a,b)` and `[b,c)` leave no gap. Add/remove are idempotent assignments to covered/uncovered state. The implementation maps the domain to integer coordinates because all endpoints are integers and each query concerns full coverage between endpoints under the problem's operation model.

## Progressive hints

1. Model each coordinate segment as covered, uncovered, or mixed.
2. A full-cover update sets the node state; partial updates descend and recombine.
3. Use a dynamic segment tree over `[1,1_000_000_001)` so only visited paths allocate nodes.

## Complete C# solution

```csharp dsa-solution
using System;
class Program
{
sealed class RangeModule
{
    private sealed class Node { public Node? Left, Right; public int State; public Node(int state = 0) { State = state; } }
    private readonly Node root = new Node();
    private const int Lo = 1, Hi = 1_000_000_001;
    public void AddRange(int left, int right) => Update(root, Lo, Hi, left, right, 1);
    public void RemoveRange(int left, int right) => Update(root, Lo, Hi, left, right, 0);
    public bool QueryRange(int left, int right) => Query(root, Lo, Hi, left, right);
    private static void Push(Node node)
    {
        if (node.State < 0) return;
        node.Left = new Node(node.State); node.Right = new Node(node.State); node.State = -1;
    }
    private static void Update(Node node, int lo, int hi, int ql, int qr, int value)
    {
        if (ql <= lo && hi <= qr) { node.State = value; node.Left = node.Right = null; return; }
        Push(node);
        int mid = lo + (hi - lo) / 2;
        if (ql < mid) { node.Left ??= new Node(); Update(node.Left, lo, mid, ql, qr, value); }
        if (qr > mid) { node.Right ??= new Node(); Update(node.Right, mid, hi, ql, qr, value); }
        int a = node.Left?.State ?? 0, b = node.Right?.State ?? 0;
        node.State = a == b ? a : -1;
        if (node.State >= 0) node.Left = node.Right = null;
    }
    private static bool Query(Node node, int lo, int hi, int ql, int qr)
    {
        if (ql <= lo && hi <= qr) return node.State == 1;
        if (node.State == 0) return false;
        if (node.State == 1) return true;
        int mid = lo + (hi - lo) / 2;
        if (ql < mid && !Query(node.Left ?? new Node(), lo, mid, ql, qr)) return false;
        if (qr > mid && !Query(node.Right ?? new Node(), mid, hi, ql, qr)) return false;
        return true;
    }
}
static void Check(bool actual, bool expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
static void Main()
    {
        var range = new RangeModule();
range.AddRange(10,20); range.RemoveRange(14,16);
Check(range.QueryRange(10,14), true, "example left part");
Check(range.QueryRange(13,15), false, "example crossing hole");
Check(range.QueryRange(16,17), true, "example right part");
var r2 = new RangeModule();
r2.AddRange(1,5); r2.RemoveRange(2,4);
Check(r2.QueryRange(1,2), true, "left boundary half-open");
Check(r2.QueryRange(2,4), false, "removed middle");
Check(r2.QueryRange(4,5), true, "right boundary remains covered");
r2.AddRange(2,4);
Check(r2.QueryRange(1,5), true, "re-add merges complete coverage");
Console.WriteLine("All Range Module checks passed.");
    }
}

```

## Correctness argument

Each node represents a half-open coordinate interval and is either entirely uncovered, entirely covered, or mixed. A fully covered update assigns the requested state to the whole node. A partial update pushes a uniform state to children if necessary, updates exactly intersecting children, and marks the parent uniform only when both children agree. Missing children represent uncovered segments. For queries, a fully covered node returns its uniform state; partial queries succeed only when every intersecting child is covered. Induction on the tree subdivision proves each operation preserves the representation and returns the correct coverage predicate.

## Step-by-step dry run

Add `[10,20)` marks that interval covered. Removing `[14,16)` splits the state: `[10,14)` remains covered, `[14,16)` is uncovered, and `[16,20)` remains covered. Query `[13,15)` intersects both the covered left segment and removed hole, so it returns false. Query `[16,17)` lies entirely in covered space and returns true.

## Time complexity

`O(log C)` per operation for a single interval in a dynamic tree over coordinate width `C=10^9`; range recursion visits `O(log C)` boundary paths plus fully covered nodes.

## Space complexity

At most `O(Q log C)` nodes are created for `Q` updates in this interval-update pattern; queries allocate no persistent nodes.

## Edge-case tests

Assertions cover the official sequence, boundaries around a removed hole, and re-adding the gap. Half-open endpoints ensure `[10,14)` does not include 14 and `[16,17)` does include 16.

## Reflection questions

1. Why is a query on `[13,15)` false after removing `[14,16)`?
2. Why can absent children mean uncovered state?
3. What would change if operations used inclusive integer intervals instead?
