# end-to-end system design case studies — Reference: Fractional-share aggregation

Sources: [SEC Investor.gov: Fractional Share Investing](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/fractional-share-investing-buying-slice-instead-whole-share), [FINRA: Investing in Fractional Shares](https://syndication.finra.org/content/investing-fractional-shares), [SEC/NSCC rule filing on fractional-share programs](https://www.sec.gov/files/rules/sro/nscc/2024/34-100897.pdf), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

Fractional-share aggregation is a brokerage system design pattern where customer entitlements can be recorded in fractional units while external execution, clearing, or custody processes may operate on whole-share quantities or have provider-specific fractional support. The SEC/FINRA materials describe U.S. examples and rules; this is not legal or investment advice. Actual execution, custody, voting, transfer, order types, and eligibility vary by broker, security, and jurisdiction.

## How this group fits the mental model

Keep three concerns distinct: customer order intent, execution in the market, and customer account entitlement. A customer asks to buy a dollar amount or fraction; the broker validates the security and order type, calculates the permitted quantity/estimated amount, and routes or internally handles the order according to its model. If the broker aggregates several customer fractional orders, it may submit one or more whole-share orders and allocate executions back to customer accounts. The allocation policy must account for partial fills, price, fees, rounding, cancellation, rejection, and corrections.

The account ledger is a financial record, so use fixed-point/decimal quantities and money rather than binary floating-point. Store exact values at an explicitly supported precision, preserve original order/ execution references, and use balanced journal entries or equivalent immutable accounting events. Do not use a mutable “share balance” as the only audit history. Reconcile the aggregate position, customer sub-ledgers, cash, and clearing/custody statements after each processing cycle.

## Supplied names explained

- **Fractional entitlement:** a customer account quantity below one share; rights and transferability depend on broker/security terms.
- **Aggregation window:** period in which compatible customer orders are collected before a larger order is submitted; batching can affect execution timing and price.
- **Parent order / child allocation:** market-level execution and the customer-level quantities allocated from it; retain an auditable mapping between them.
- **Partial fill:** only part of an aggregate order executes; allocate the executed amount consistently and keep the remainder in a defined state.
- **Rounding residual:** difference caused by precision, share increments, cash calculations, or allocation rounding; book it under explicit rules and reconcile it rather than discarding it.
- **Corporate action:** split, dividend, merger, or similar event that changes position/cash entitlements; apply the broker’s documented treatment with reproducible precision.
- **Reconciliation:** compare internal ledgers with execution, clearing, custody, and cash records; mismatches should enter an exception workflow, not be silently overwritten.

## Cross-item comparison

| Execution model | Operational characteristic | Design responsibility |
| --- | --- | --- |
| Real-time fractional execution | Each order is handled individually or through a broker capability for fractional quantities | Per-order execution state, price/fee disclosure, and provider support |
| Aggregated execution | Compatible customer orders are combined into larger market orders | Allocation fairness, execution timing, price methodology, partial fills, and audit trail |
| Whole-share customer trading | Customer order quantity is integral | Simpler quantity handling, but does not support dollar-based/fractional customer intent |
| Internalized/principal handling | Broker may act as counterparty under its model and obligations | Conflict, pricing, disclosure, routing, and reporting controls must follow applicable rules |

## Examples

Three customers submit eligible buy orders for 0.25, 0.40, and 0.35 shares of the same security during an aggregation window. The broker records each order and its accepted terms, then may route an aggregate one-share parent order if its policy and market conditions allow. If only 0.80 shares fill, the system allocates no more than each customer’s valid unfilled quantity under a documented allocation rule, records exact execution prices/costs and fees, and leaves the remaining quantity open, canceled, or rejected according to the order’s terms. It must not invent a fill for the missing 0.20 shares.

If an acknowledgment from an execution venue is lost, the order’s state is unknown until queried or reconciled. Retrying a new parent order could create duplicate exposure. Use stable order IDs, idempotent command handling where available, venue status reconciliation, and explicit cancel/replace states. A later stock split should transform the recorded fractional entitlements according to the broker’s corporate-action policy, with any cash-in-lieu or rounding handled as a separate traceable entry.

## Common mistakes

- Assuming all brokers, securities, order types, and trading sessions support fractional execution.
- Treating the customer ledger balance as proof that aggregate custody/execution balances reconcile.
- Using floating-point arithmetic for money or security quantities.
- Losing the mapping between customer instructions, aggregate parent orders, executions, and allocations.
- Silently rounding small customer positions or assigning residuals without documented policy.
- Retrying a parent order after an ambiguous timeout without checking venue state.
- Assuming customer voting, transferability, liquidity, or corporate-action rights are identical to whole shares.
- Claiming an aggregation policy is universally fair or legally compliant without reviewing current jurisdiction and broker obligations.

## Knowledge checks with answers

1. **Why separate customer intent from parent execution?** One market order can represent multiple customer orders, and each customer needs an accurate allocation tied to the execution.
2. **What happens if only part of an aggregate order fills?** Allocate only executed quantity under the stated rule and preserve the remaining order state; never fabricate a fill.
3. **Why use decimal/fixed-point arithmetic and an audit ledger?** Exact quantity and money precision plus traceable events are needed to explain balances and reconcile them.
4. **Are fractional-share features standardized across brokers?** No. Availability, order handling, rights, transfer, and pricing can differ; disclose and implement the specific broker policy.
