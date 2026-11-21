# cloud computing foundations and architecture — Big-picture orientation and mental model

Sources: [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), [AWS Well-Architected Framework definitions](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html), and [AWS VPC basics](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html).

## Problem and purpose

Cloud architecture is the design of workload behavior and its operating boundaries on infrastructure operated partly or wholly by a provider. It is not a synonym for “renting servers.” A well-designed workload fits business needs, assigns responsibilities clearly, survives expected failures, protects identities/data, can be observed and recovered, and stays within a deliberate cost envelope.

## Plain-language mental model

Think of a workload as a business outcome delivered by connected components. Each component runs in an account/project/subscription boundary, in a geographic region and one or more failure zones, using identities and network paths to access compute, data, and messaging services. The provider operates physical facilities and some service layers; the customer configures and operates other layers. The service model changes the split, but does not eliminate customer responsibility for identity, data, configuration, and application behavior.

Cloud resource creation is programmable. Infrastructure as code describes desired resources and dependencies; the provider control plane accepts management operations and the data plane handles workload traffic. These planes can fail independently. Consumption pricing means each architectural choice—capacity, storage, requests, redundancy, and data transfer—can affect recurring cost.

## How the parts fit together

| Concern | Core question |
|---|---|
| Service model | Which layers does the provider operate, and which does the team own? |
| Account hierarchy | Where do identity, policy, billing, quotas, and resource boundaries live? |
| Geography | What failure domains and data-residency requirements apply? |
| Identity/security | Which principal can perform which action on which scope? |
| Workload building blocks | Which compute, network, data, messaging, and integration choices fit? |
| Reliability | What outage is tolerated, and how will recovery be tested? |
| Operations | What signals reveal behavior and how does the team respond? |
| Cost | Which cost drivers scale with traffic, capacity, redundancy, and time? |

## Concept map

```text
organization -> account/subscription/project -> policy + identity + billing
                                            -> region -> zone/failure domain
workload -> compute -> network -> data + messaging -> users/other systems
              |            |          |
           telemetry     security    backup/replication
              \________ IaC + operations + cost controls ________/
```

The cloud control plane provisions/configures resources; the data plane carries workload requests. A control-plane outage may prevent scaling or deployment while existing data-plane traffic continues, but this is service-specific and must be verified.

## End-to-end walkthrough

For a customer-facing API, first specify availability, latency, data residency, recovery, and budget targets. Choose a service model and region/failure domains that satisfy those constraints. Create separate account/project boundaries for production and nonproduction; federate human/workload identity with least privilege. Provision network, compute, database, secrets, monitoring and alerts declaratively. Design backup and recovery across the failure domain required by RPO/RTO. Load test capacity and failover; observe traces/logs/metrics. Tag resources and review actual bills, egress, idle capacity and redundancy. Practice restores and incident response instead of treating the architecture diagram as proof.

## When to use it and tradeoffs

Cloud services can provide elastic capacity, managed control planes and globally distributed options. They introduce provider-specific APIs, quotas, failure modes, data-transfer cost, identity complexity, and dependency on provider operations. Managed services reduce some maintenance while constraining configuration/portability. Hybrid and multicloud can meet residency/latency or resilience needs but increase network, identity, observability and operational complexity; use them for a stated requirement rather than as an automatic resilience feature.

## What later lessons cover

References define cloud/service models, customer/provider boundaries, accounts and IaC; geography, zones, replication and recovery objectives; identity and network security; workload building blocks; and observability, cost and architecture reviews. Azure and AWS service names and APIs are covered separately. Current provider prices and per-service regional availability must be rechecked when designing a real deployment.

