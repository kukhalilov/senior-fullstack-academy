# stacks, queues, deques, and priority-agnostic worklists — Reference: Double-ended queues and structure simulations

## Scope and version

This reference explains the nine supplied deque and simulation terms. Costs depend on the chosen representation; a deque contract alone does not guarantee efficient indexed access.

## How this group fits the mental model

A deque permits operations at both ends. Restricting which ends an algorithm uses gives stack or queue behavior. Simulations implement one ADT's ordering using another ADT's operations and shift the cost onto chosen operations.

## Supplied names explained

- `Deque` — Double-ended queue supporting insertion and removal at front and back. A circular array or doubly linked structure can implement it; middle access is not implied to be efficient.
- `Push front` — Add an item before the current front. In a ring buffer, move head backward modulo capacity; in a linked deque, connect a new node before head and update head.
- `Push back` — Add an item after the current back and update tail. A ring buffer writes at the logical end; a linked deque attaches after tail.
- `Pop front` — Remove and return the first item, advancing head or unlinking the first node. Define behavior if empty.
- `Pop back` — Remove and return the last item, retreating tail or unlinking the last node. A singly linked list may need O(n) search for the predecessor; a doubly linked deque can do it in O(1).
- `Stack implemented with queues` — One design keeps newest at the front by rotating older items after each push; push is O(n), pop/peek O(1). Another uses two queues and may shift cost to pop. State the chosen tradeoff.
- `Queue implemented with stacks` — Push into incoming; when outgoing is empty, transfer incoming items to outgoing, reversing order. Enqueue is O(1); dequeue is amortized O(1), with an occasional O(n) transfer.
- `Lazy transfer between stacks` — Delay reversal until a dequeue needs an item and outgoing is empty. Do not transfer on every dequeue; each item crosses stacks at most once.
- `Amortized analysis of queue-from-stacks` — Over many operations, every item is pushed into incoming, transferred once, and popped once. Total stack operations are O(number of items), so sequence cost is linear and amortized operation cost is O(1).

## Cross-item comparison

`Deque` can expose stack or queue ends directly. `Push front`, `Push back`, `Pop front`, and `Pop back` are its end operations. `Queue implemented with stacks` uses `Lazy transfer between stacks`; `Amortized analysis of queue-from-stacks` explains its total cost. `Stack implemented with queues` can choose the opposite expensive operation and has different per-operation costs.

## Examples

For queue-from-stacks, enqueue A,B,C to incoming. On dequeue, transfer C,B,A to outgoing and pop A. A second dequeue pops B without another transfer. New D enters incoming while outgoing still contains C; do not move it ahead of C.

## Common mistakes

- Transferring incoming to outgoing on every dequeue, reversing order incorrectly or wasting work.
- Claiming each dequeue is worst-case O(1) when it may transfer all items.
- Failing to state which operation is expensive in a stack-from-queues design.
- Assuming pop-back is O(1) in a singly linked deque implementation.
- Forgetting empty/full behavior in bounded deques.

## Knowledge checks with answers

1. **What makes a deque different from a FIFO queue?** Both ends support insertion and removal.
2. **When should queue-from-stacks transfer?** Only when outgoing is empty and a front item is needed.
3. **Why is the transfer cost amortized O(1) per item?** Each item transfers at most once.
4. **Does deque imply efficient middle access?** No.

Source: [OpenDSA: Queues](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/odsa-all/fall-2019/Public_Instance/html/Queue.html).
