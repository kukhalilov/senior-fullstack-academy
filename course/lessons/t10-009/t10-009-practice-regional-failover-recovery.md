# architecture interviews tradeoffs requirements and constraints — Problem: Design and test regional recovery

Sources: [AWS recovery objectives](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-availability-and-recovery-objectives.html), [AWS disaster recovery guidance](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel13.html), [AWS multi-region data guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/aws-multi-region-fundamentals/fundamental-2.html)

## Goals

Practice RTO and RPO, data replication and ownership, routing and promotion, failback validation under interview constraints.

## Worked example

A regional outage affects a customer-facing service. Define the failover decision, data-loss boundary, customer communication, and safe return to the primary region.

Define the failure declaration authority and thresholds, then compare observed replication lag with RPO before promotion. Route traffic only after the standby is ready and data ownership is fenced. Communicate impact, verify critical flows, and track reconciliation. Failback is a separate migration: synchronize data, test the target, and switch deliberately.

## Exercises

1. Define RTO and RPO from business impact, then identify the evidence needed to measure both in a recovery exercise.
2. Replication lag is older than the accepted RPO. Who decides whether to promote, and what data-loss choice must be communicated?
3. Explain how you prevent both regions from accepting conflicting writes during promotion.
4. List dependencies beyond application compute that must work in the recovery region.

## Progressive hints

1. Replication is not itself a tested recovery plan.
2. Promotion may knowingly lose writes that have not replicated; make that tradeoff explicit.
3. Fence the old writer before enabling a new writer, or use a database/platform mechanism that provides this guarantee.
4. Include identity, secrets, certificates, quotas, networking, observability, backups, and routing.

## Complete solutions

1. RTO is the target maximum time to restore service; RPO is the target maximum time window of data loss. Measure elapsed recovery time and the age/sequence of the last recoverable committed data during exercises.
2. Follow the documented incident authority and business policy; compare observed lag with the RPO and communicate the resulting recovery point. Do not claim a target was met when evidence says otherwise.
3. Fence or isolate the former primary and verify ownership before promoting the standby. DNS/routing changes alone do not prevent split brain.
4. Verify capacity, data promotion, identity and access, keys/secrets, certificates, network paths, service quotas, queues, monitoring, and customer communications. Test failback as a separate data synchronization and traffic transition.

## Tests and edge cases

Exercise regional isolation with replication lag, stale health checks, failed routing updates, missing secrets or quota, unavailable control plane, partial promotion, accidental writes to the old primary, corrupted replicated data, and failback after new writes have accumulated.

## Reflection questions

Which recovery step is manual, and what evidence makes it safe to automate?


Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
