# stacks, queues, deques, and priority-agnostic worklists — Interview questions and reasoning

## Goals

- Explain structure choice from the ordering requirement.
- Analyze implementation costs beyond a single operation.
- Identify invariants and boundary-state risks in common designs.

## Core questions

In an interview, start by identifying the required order. Then name the invariant, implementation, and complexity guarantee. A stack, queue, and deque differ by which ends are exposed; these are contracts rather than storage choices.

## Concise interview answers

- **Stack:** A LIFO structure; push and pop use the same end.
- **Queue:** A FIFO structure; enqueue at the back and dequeue at the front.
- **Deque:** A double-ended queue that supports insertion and removal at both ends.
- **Amortized O(1):** Total work over a sequence is linear in the operation count, though one operation may be linear.

## Deep follow-up answers

### 1. When would you choose a stack, queue, or deque?

Ask what item must be processed next. A stack returns the newest unresolved item (LIFO), a queue returns the earliest waiting item (FIFO), and a deque permits either end to be used. State the workload and required ordering before selecting a representation. If items must be chosen by priority, a priority queue is a different abstraction.

### 2. How can two stacks implement a FIFO queue with amortized O(1) operations?

Use an incoming stack for pushes and an outgoing stack for front access. Transfer all incoming items only when outgoing is empty. Each item is pushed onto incoming once, transferred once, then removed once. The total work over m operations is O(m), although the single operation that transfers n items costs O(n).

### 3. What does amortized O(1) mean, and what does it not mean?

It bounds the average cost over a sequence using an aggregate or potential argument; it does not promise every operation is O(1) worst case, a probabilistic average, or a wall-clock latency guarantee. A system needing strict per-operation latency may need a different design.

### 4. How would you design a fixed-capacity ring queue?

Track a head index and count; derive the next insertion index as `(head + count) % capacity`. Count distinguishes empty (0) from full (capacity). Dequeue advances head and decrements count. Validate positive capacity and avoid changing state on a rejected operation.

### 5. How does a minimum stack support O(1) minimum queries?

Store the minimum at each depth alongside the value, or use a second stack of minima with duplicate-aware push/pop rules. Per-depth snapshots naturally restore the previous minimum after a pop and avoid arithmetic overflow tricks.

### 6. What is the key invariant for a delimiter-matching stack?

After a processed prefix, the stack contains exactly unmatched openers in encounter order. Every closer must match and remove the top opener; equal counts alone cannot detect crossing delimiters.

### 7. How do you evaluate postfix arithmetic safely?

Push operands. For an operator, pop right operand first and then left; evaluate `left op right`. Preserve language-specific integer division semantics and respect overflow assumptions. A valid complete expression leaves one value.

### 8. How can a queue implement a stack, and where is the cost paid?

One queue can enqueue the new item then rotate the previous count to the back, keeping the newest at the front. Push is O(n); top and pop are O(1). A two-queue variant can choose the opposite cost. State the chosen tradeoff explicitly.

### 9. Array-backed versus linked representation: what changes?

Arrays offer locality and low per-element overhead but can require growth copies; linked nodes avoid contiguous growth but allocate per node and have pointer overhead. Both can provide constant-time end operations when correctly maintained. A linked queue must reset both head and tail when its final item is removed.

### 10. Why is shifting an array queue after every dequeue often a poor choice?

Removing the front then shifting n-1 elements makes dequeue O(n), yielding O(n²) total movement across n removals. A circular buffer advances an index instead, while a linked queue changes a small number of references.

## Scenario questions

1. **A parser must reject misnested brackets quickly.** Use a stack of openers; reject a closer if it does not match the top, then require an empty stack at the end.
2. **A breadth-first traversal must visit nodes by distance layer.** Use a FIFO queue and process each node's neighbors after earlier discoveries.
3. **A fixed-size telemetry buffer should overwrite or reject when full.** Clarify the policy; a ring buffer can implement either policy, but the behavior must be explicit.
4. **A task system always selects highest urgency.** Use a priority queue; FIFO is only appropriate when arrival order determines service.

## Tradeoffs and alternatives

- A ring buffer offers locality and bounded allocation but needs a defined capacity/full policy. A linked queue grows node-by-node but has allocation and pointer overhead.
- Two stacks can provide amortized O(1) queue operations; a stack implemented by rotating one queue instead pays O(n) per push.
- A second minima stack may store less metadata than per-depth pairs, but duplicate minima require `<=` handling on push and equality-aware removal.
- A deque is more flexible, but flexibility does not mean middle indexing is efficient.

## Common weak answers

- **“The two-stack queue is worst-case O(1).”** The transfer operation is O(n); only the amortized bound is O(1).
- **“A ring buffer is full when head equals tail.”** That condition can also mean empty unless count, a reserved slot, or a full flag disambiguates it.
- **“A stack can validate brackets by comparing counts.”** Counts miss crossing nesting such as `([)]`.
- **“C# division rounds down.”** Integer division truncates toward zero; the distinction matters for negative quotients.
- **“A queue is always the right worklist.”** Priority scheduling has a different ordering contract.

## Self-check rubric

- State the LIFO/FIFO/deque contract before discussing storage.
- Define empty and full behavior.
- Name the invariant that makes each operation correct.
- Separate worst-case from amortized complexity.
- Account for duplicate values, index wraparound, and reuse after draining.
- Explain why the chosen alternative fits the workload.

Check that you can explain the LIFO/FIFO/deque contracts; prove lazy transfer's amortized cost by counting item movements; derive ring-buffer front and rear indices; explain duplicate minima; preserve operand order in postfix evaluation; and give one workload where a priority queue is required instead of FIFO.

Sources: [OpenDSA: Lists](https://opendsa-server.cs.vt.edu/ODSA/Books/Catalog/html/ListIntro.html), [OpenDSA: Queue](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/odsa-all/fall-2019/Public_Instance/html/Queue.html).
