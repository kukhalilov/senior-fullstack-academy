# end-to-end system design case studies — Reference: Tax-lot accounting

Sources: [HLD Handbook](https://hld.handbook.academy/), [IRS Publication 550 (2025)](https://www.irs.gov/publications/p550), [IRS Instructions for Form 8949 (2025)](https://www.irs.gov/instructions/i8949), [IRS Publication 551: Basis of Assets](https://www.irs.gov/publications/p551), [IRS stock and cost-basis FAQs](https://www.irs.gov/faqs/capital-gains-losses-and-sale-of-home/stocks-options-splits-traders), [FINRA: Cost Basis](https://syndication.finra.org/content/tax-time-topics-cost-basis-what-you-need-know).

## Scope and version

This lesson designs a system that tracks investment tax lots and supports disposition and reporting. It uses U.S. securities tax rules as examples, with IRS 2025 publications/instructions checked on 2026-11-21. Tax rules vary by jurisdiction, asset, account, and taxpayer circumstances; a production ledger must use the applicable current law and qualified tax review. The examples are software/data-design explanations, not personal tax advice.

## How this group fits the mental model

A position is not enough to determine tax basis. The system must preserve each acquisition lot, its quantity, acquisition date, original basis and later adjustments. When an investor sells part of a position, the chosen lots determine allocated basis, realized gain/loss, and holding period. The selected lots and rules must be reproducible later from records and confirmations.

Think of tax-lot accounting as an append-only economic history plus a derived current position. Trade fills create lots; corporate actions and adjustments affect their basis/quantity; a sale consumes quantities from specified lots; wash-sale or other rules can defer or adjust loss treatment. The broker's displayed basis and the taxpayer's ultimate filing responsibility are related but not identical; covered/noncovered status and corrections matter.

## Supplied names explained

- **Lot:** quantity acquired in one event, with security identifier, account, acquisition date/time, quantity, per-unit and total basis, currency, fees, source, and covered status where applicable.
- **Cost basis:** amount used to calculate gain/loss, generally purchase cost plus allocable acquisition costs under U.S. examples, adjusted by applicable events. Keep exact monetary precision and store original and adjusted values separately.
- **Disposition:** sale or transfer out that consumes lot quantities and records proceeds, fees, selected lot IDs, and realized gain/loss. A sale may consume multiple partial lots.
- **FIFO (first-in, first-out):** absent adequate specific identification under relevant U.S. stock rules, older acquired shares are generally treated as sold first. Do not assume FIFO is universally required or the only election for every instrument.
- **Specific share identification:** investor specifies the particular shares/lots at sale time and obtains required broker confirmation under applicable rules. Capture the instruction, timestamp, quantity, confirmation, and immutable audit evidence before settlement/reporting.
- **Average basis:** an option for certain eligible identical shares (for example, qualifying mutual-fund shares and some DRIP shares) under IRS rules. Do not apply a portfolio-wide average to ordinary stock lots by default.
- **Holding period:** period used to classify gain/loss (for U.S. capital assets, short- vs long-term rules depend on acquisition/disposition timing and exceptions). Preserve dates and inherited holding-period adjustments where applicable.
- **Corporate action:** split, merger, spin-off, return of capital, dividend reinvestment, or other event that can change quantity or basis allocation. Record the event and calculation rather than overwriting trade history.
- **Wash sale:** U.S. rule that can disallow a loss when substantially identical securities are acquired in the 30-day period before or after a loss sale, subject to statutory and factual conditions. Certain replacement purchases, including spouse- or IRA-related cases described by IRS guidance, make cross-account visibility important.
- **Covered / noncovered security:** tax-reporting classification affecting broker basis reporting obligations. A missing broker-reported basis is not proof that basis is zero; reconcile source records and report correct basis under current instructions.
- **Tax report reconciliation:** compare internal lots/dispositions with broker statements (such as Form 1099-B) and prepare corrections/adjustments for tax reporting; retain the source statement and reason for every change.

## Architecture and event flow

1. **Ingest acquisition and transfer events.** Normalize executions, transfers, dividend reinvestments, fees, corrections, and corporate actions into versioned events. Deduplicate source events by stable IDs, preserve raw statements, and reconcile quantity to custodian records.
2. **Create lots.** Assign immutable lot IDs. Store security/account/tax jurisdiction, acquisition date, settled quantity, basis amount and currency, allocation source, covered status, and evidence. Use decimal/fixed-point representation with explicit currency precision; never use binary floating point for money.
3. **Maintain adjustments.** Represent splits, basis reallocations, return-of-capital adjustments, wash-sale deferrals, and corrections as linked adjustment events. Preserve before/after values and the rule/version used so an auditor can reconstruct each lot.
4. **Accept a disposition instruction.** Validate available quantity, account ownership, security identity, sale execution, timing, and any jurisdiction-specific identification deadline. If specific identification is supported, persist selected lot quantities and confirmation before finalizing tax basis allocation.
5. **Allocate quantities and calculate proceeds.** Consume exact decimal quantities from one or more lots. Allocate proceeds and eligible fees under the selected method, calculate basis and gain/loss per lot, and retain rounding residuals deterministically. Enforce that sold quantity never exceeds available quantity.
6. **Evaluate tax adjustments.** Match potential wash sales over required pre/post windows and across known related accounts, record disallowed losses and replacement-lot basis/holding-period effects where rules prescribe. Mark the result provisional if external account data or later events can change the conclusion.
7. **Generate reports and reconcile.** Produce transaction-level records that tie to source executions and broker forms. Distinguish covered and noncovered reporting, short/long-term categories, adjustments, and corrected statements. Never silently replace reported basis; record the adjustment code and evidence needed by Form 8949 instructions.
8. **Support corrections and audit.** Correct by reversal/superseding events, not destructive edits. Version tax rules by jurisdiction/effective date, rerun affected calculations, retain report snapshots, and explain differences to prior statements.

## Cross-item comparison

| Method/design | Benefit | Trade-off or condition |
| --- | --- | --- |
| FIFO | Deterministic fallback and simple audit trail | May select a different tax outcome than intended; applicable default rules must be verified |
| Specific identification | Selects particular eligible lots and can match investor's instruction | Requires timely instruction, broker confirmation, immutable evidence, and exact lot allocation |
| Average basis | Simplifies eligible identical-share calculations | Only available in specified cases; cannot be generalized to all shares/assets |
| Mutable position balance only | Compact current display | Cannot reconstruct which acquisition was sold, basis adjustments, or holding period |
| Append-only events plus derived lots | Reproducible and auditable history | Requires replay/versioning, correction workflows, and reconciliation to custodian records |
| Per-account wash-sale check | Efficient and easy to implement | Can miss purchases in other accounts or by related persons; expose scope limitations and support broader matching data where available |

## Examples

### Partial sale with specific identification

An account holds 10 shares from Lot A at $20/share and 10 from Lot B at $35/share. The investor sells 6 shares. If the investor makes and confirms a valid instruction to sell 6 shares from Lot B, allocate $210 basis to that disposition, then preserve 4 shares in Lot B. If no adequate identification is made, use the method required by the applicable rule and account setup; for the cited U.S. stock example, FIFO generally treats the oldest shares as sold first. Store the selection and confirmation rather than inferring it later from price.

### Split adjustment

A 2-for-1 split changes a 10-share lot into 20 shares while preserving aggregate basis, so per-share basis is halved before other adjustments, subject to the issuer/custodian's confirmed corporate-action terms. Record one split event linked to the lot, keep the original acquisition record, and reconcile the total position. Do not create new taxable acquisition lots just because share count changed.

### Wash-sale adjustment

An investor sells 100 shares at a loss and acquires 40 substantially identical shares within the statutory window. The IRS example rules may disallow a loss portion and add the deferred loss to replacement basis (with exceptions, including an IRA-related case). The system must preserve which replacement shares were matched and why, identify account-data limitations, and avoid treating a same-account broker report as a complete global determination.

## Common mistakes

- Treating a position's average purchase price as sufficient tax-lot history.
- Claiming FIFO is always mandatory or that average basis is available for every stock.
- Applying specific-lot instructions after the fact without evidence that required identification and broker confirmation occurred.
- Losing fractional quantities, transaction fees, currency conversions, or deterministic rounding residuals.
- Mutating acquisition records when processing splits, wash sales, transfers, or corrected statements.
- Assuming broker-reported basis is always complete/correct or that noncovered basis is zero.
- Matching wash sales only inside one account while presenting the result as a complete taxpayer-level conclusion.
- Ignoring replacement basis/holding-period effects or cross-account/IRA conditions in U.S. rule examples.
- Overwriting past tax reports after new data arrives; issue versioned corrections with traceable causes.
- Failing to reconcile lot quantity and basis against custodial statements and executed trade confirmations.

## Knowledge checks with answers

1. **Why retain each acquisition lot?** A disposition's basis and holding period depend on which units were sold and on later adjustments.
2. **Can a user always select the highest-basis lots after seeing the sale result?** No. Specific identification has timing and confirmation requirements; follow the applicable rule and retain evidence.
3. **Does every stock support average basis?** No. IRS rules permit it only for specified categories/conditions; other securities may require a different method.
4. **Does a broker's Form 1099-B settle the taxpayer's basis in every case?** No. Coverage and source-data limitations exist; reconcile and correct basis when required under current reporting instructions.
5. **What data should a wash-sale engine expose?** Matched replacement quantities, window, securities/accounts searched, adjustment basis, rule version, exceptions, and known coverage limitations.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder content with a U.S.-scoped tax-lot ledger lesson. IRS Publication 550 and Form 8949 instructions confirm specific identification, FIFO fallback context, limited average-basis eligibility, basis adjustments, covered/noncovered reporting, and wash-sale handling. The lesson explicitly bounds jurisdiction and year, distinguishes broker reporting from taxpayer records, and covers event history, corporate actions, reconciliation, and auditability. No material omissions remain in the supplied topic scope.
