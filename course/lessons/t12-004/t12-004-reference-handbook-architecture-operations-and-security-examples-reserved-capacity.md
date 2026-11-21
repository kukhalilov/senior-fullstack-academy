# architecture patterns multi-region tenancy and reliability — Reference: Reserved capacity

Sources: [HLD Handbook](https://hld.handbook.academy/), [AWS Reserved Instances overview](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html), [AWS Savings Plans versus Reserved Instances](https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-ris.html), [AWS Capacity Reservations pricing](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/capacity-reservations-pricing-billing.html), [Google Cloud reservations and commitments](https://docs.cloud.google.com/compute/docs/instances/reservations-with-commitments), [FinOps rate optimization](https://www.finops.org/framework/capabilities/rate-optimization/).

## Scope and version

“Reserved capacity” is overloaded across cloud vendors and services. It can mean a contractual commitment that earns a price discount, a reservation that holds capacity in a particular location/configuration, or a product that combines both. This lesson compares those concepts with AWS EC2 and Google Compute Engine examples. Product terms and billing rules change; read the current service contract before purchasing.

## How this group fits the mental model

Cloud cost often has two separable risks: **price risk** (paying a high rate for stable use) and **availability risk** (not having the required capacity in the required zone when you need it). A commitment can lower the effective rate while leaving capacity availability unchanged. A capacity reservation can hold a placement-specific resource while leaving some or all usage billed at a rate that still needs discount treatment.

Before committing, measure a stable baseline and preserve flexibility for uncertain or changing demand. Consider migration plans, architecture changes, seasonality, region/zone constraints, GPU or instance-family requirements, sharing rules, and contract cancellation or exchange terms. The discount is only valuable when eligible usage consumes it; unused commitments are a real cost.

## Supplied names explained

- **Reserved capacity** — A planned or contractually held portion of compute/service capacity intended to improve availability and/or reduce price. The exact guarantee and discount depend on the provider product; confirm whether a purchase reserves actual zonal capacity, commits to spend/usage, or does both.

### Separate the mechanisms

- **Usage commitment/discount:** a minimum spend or resource/instance-family commitment for a term in exchange for a reduced price on eligible usage. AWS Savings Plans, AWS Reserved Instances, and Google Cloud committed use discounts have different scopes and flexibility. They do not all reserve capacity.
- **Capacity reservation:** a reservation for specific capacity constraints such as region/zone, shape, and count. It targets availability for matching workloads; billing while unused and eligibility for discounts are product-specific.
- **Combined discount plus capacity:** some configurations allow an eligible commitment discount to apply to capacity consumed from a separate reservation or allow matching reservations to attach to a commitment. The matching requirements can be strict.
- **“Reserved Instance” name:** do not infer from the product name that capacity is physically held. For AWS EC2, a Savings Plan does not provide capacity reservations; a zonal EC2 RI can provide a capacity reservation, while regional RIs focus on billing flexibility. Always inspect the chosen scope and current terms.

### Purchase and operate with evidence

1. Build an hourly/daily usage baseline by service, region, shape, and owner; separate steady baseline from seasonal peaks and experimental workloads.
2. Simulate historical utilization and future changes. Compare commitment coverage, utilization, effective discount, vacancy, and expiry concentration.
3. Decide whether the risk is cost, capacity, or both. Purchase a reservation for a concrete placement need; buy a discount commitment for stable usage only when the term and eligibility are understood.
4. Confirm sharing/assignment, exact resource family/region constraints, billing account behavior, and whether commitments can be exchanged, modified, or canceled.
5. Track actual consumption, unused capacity/commitment, uncovered usage, demand shifts, and expiration dates. Alert owners before vacancy becomes persistent.
6. Revisit after migrations and product changes. Do not keep optimizing a price rate that is attached to obsolete architecture or creates a reliability constraint.

## Cross-item comparison

| Mechanism | Primary benefit | Does it necessarily hold actual capacity? |
|---|---|---|
| On-demand | No long-term usage commitment | No guarantee beyond product-specific quota/capacity rules |
| Savings Plan or spend commitment | Discount against eligible usage in exchange for term commitment | No; AWS explicitly separates Savings Plans from capacity reservations |
| Regional Reserved Instance / comparable discount | Discount with defined flexibility/eligibility | Not necessarily; check provider and scope |
| Zonal capacity reservation | Holds a defined placement/capacity pool | It may not by itself provide the desired discount |
| Combined reservation and commitment | Can address both rate and availability | Only when resources and terms match; still check actual consumption and restrictions |
| Spot | Lower price for reclaimable capacity | No; capacity can be interrupted or unavailable |

## Examples

**Predictable API baseline.** Usage history shows a minimum of 80 general compute units every hour, with seasonal demand reaching 120. The team evaluates a commitment sized for a conservative portion of the stable baseline, while keeping flexible on-demand capacity for bursts. A regional failure plan uses a separate capacity strategy in the recovery region; a pricing commitment by itself does not prove failover capacity exists.

**GPU launch requirement.** A service must launch 24 matching GPUs in one zone for a scheduled workload. A spend-based discount alone may lower eligible cost but does not ensure those GPUs are available. The team validates the provider’s reservation product and matching rules, tests quota and launch constraints, and separately evaluates commitment coverage. If 24 reserved GPUs sit idle outside the workload window, the availability benefit must justify that vacancy cost.

## Common mistakes

- Assuming every “reserved” purchase reserves actual compute capacity.
- Assuming a capacity reservation automatically discounts usage or that a discount commitment guarantees zone-level capacity.
- Buying a long term based on peak usage instead of stable eligible consumption.
- Ignoring resource/region/zone matching, account sharing, eligible usage rules, term, exchangeability, and expiry.
- Looking only at discount percentage while ignoring vacancy, workload migration, and operational flexibility.
- Treating reserved capacity as disaster recovery without proving matching capacity and data/network dependencies in the alternate region.
- Comparing providers by a generic “reserved” label instead of modelling their distinct price and availability guarantees.

## Knowledge checks with answers

1. **What two independent goals may be hidden inside “reserved capacity”?** Lowering the rate through a usage commitment and ensuring capacity availability through a reservation.
2. **Does an AWS Savings Plan hold EC2 capacity in a zone?** No. AWS documentation says Savings Plans do not provide capacity reservations; a separate On-Demand Capacity Reservation can be used.
3. **What is commitment vacancy?** The portion of purchased commitment that eligible usage does not consume, leaving a financial commitment without the expected benefit.
4. **How can a design cover both discount and availability?** Combine the correct discount commitment and capacity reservation where provider terms allow, verify matching constraints, and measure actual consumption.
