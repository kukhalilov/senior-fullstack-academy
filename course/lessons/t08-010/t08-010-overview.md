# transactions distributed consistency saga outbox and inbox — Big-picture orientation and mental model

Sources: [Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), [Compensating Transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction), [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), and [Minimize coordination](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/minimize-coordination).

## Problem and purpose

Applications often need to change data and notify another component. A transaction can make changes atomic within one database boundary, but a database commit and a broker publish are separate resource operations. A crash between them can leave committed business state without an event, or an event without the intended state. Cross-service workflows add more such failure windows. This topic teaches how to preserve local invariants, communicate durable changes, coordinate long-running work, and recover without claiming one magical global transaction.

## Plain-language mental model

Think of a local transaction as one sealed envelope: either its included database writes commit together or none do. When work crosses a service boundary, there is no single envelope by default. The outbox puts the message intention inside the database envelope; a relay carries it later. An inbox records which incoming message has already been applied in the same envelope as the local effect. A saga is a durable checklist of local envelopes; if later steps fail, business-specific compensating actions attempt to reach an acceptable outcome.

## How the parts fit together

- Keep an invariant inside one service-owned transactional store whenever possible.
- If a committed change must emit a message, atomically save the business update and outbox record, then relay it.
- Expect duplicate delivery and use stable message identity plus idempotent consumer handling or inbox deduplication.
- For a multi-service workflow, persist step state and correlation, then choose choreography or orchestration.
- Define retries, timeouts, compensation, irreversible steps, user-visible intermediate states, and operator recovery before production.

## Concept map

```text
One database invariant ── local ACID transaction
                                  │
                  durable message intention (outbox)
                                  │ relay; duplicates possible
                                  ▼
           consumer inbox/dedup + local effect in one transaction

Multi-service business process ── saga state machine
                      ├── choreography: participants react to events
                      └── orchestration: coordinator persists and directs steps
                               failure ── business compensation/recovery
```

## End-to-end walkthrough

A customer places an order. The order service creates `PendingPayment` and an `OrderCreated` outbox record in one local commit. A relay eventually publishes the event; it may publish it more than once if it crashes after broker acceptance but before progress is saved. The payment consumer inserts a message identity into its inbox and creates a payment request in its local transaction; a unique constraint makes duplicate handling safe. The order workflow then reserves inventory and confirms the order. If reservation fails after payment authorization, the saga records the failure and requests void/refund according to provider semantics. Each service owns its own data and local transaction. The order can expose `Pending` or `Compensating` while the workflow is incomplete rather than pretending the whole distributed process was instantaneously atomic.

## When to use it and tradeoffs

Use a local ACID transaction when all invariant-bearing writes fit one resource. Use an outbox for reliable intent-to-publish alongside local state, and inbox/idempotent consumption where duplicate delivery could repeat effects. Use a saga when a business workflow spans independently committed services and eventual consistency is acceptable. 2PC may fit only where all participants support the required coordination and its blocking/availability/operational costs are acceptable. Outbox and saga add durable state, cleanup, retries, monitoring, and recovery paths; choose them to handle a real boundary, not as default ceremony.

## What later lessons cover

The concepts lesson builds transaction boundaries and consistency first. Reference lessons cover local isolation and 2PC, dual-write failure windows, outbox relays, inbox deduplication, saga coordination/compensation, and consistency design. Practice and interview units then work through concrete failures and tradeoffs.
