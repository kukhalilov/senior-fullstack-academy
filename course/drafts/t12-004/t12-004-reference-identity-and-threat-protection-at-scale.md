# architecture patterns multi-region tenancy and reliability — Reference: Service identity, perimeter threats, and cryptographic lifecycle

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 6](https://owasp.org/www-project-api-security/), [reference 7](https://opentelemetry.io/docs/concepts/), [reference 8](https://hld.handbook.academy/curriculum/architecture-patterns/), [reference 9](https://hld.handbook.academy/curriculum/reliability-and-operations/), [reference 10](https://hld.handbook.academy/curriculum/security-at-scale/), [reference 11](https://hld.handbook.academy/curriculum/emerging-patterns/), [reference 12](https://csrc.nist.gov/pubs/fips/203/final), [reference 13](https://csrc.nist.gov/pubs/fips/204/final).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `OAuth 2.0` — An authorization framework for delegated access; the chosen grant and client type determine the threat model and token handling.
- `OpenID Connect (OIDC)` — An identity layer on OAuth 2.0 that provides authentication claims and ID-token semantics.
- `JSON Web Token (JWT)` — A compact claims representation that may be signed or encrypted; validate issuer, audience, expiry, algorithm policy, and key rotation.
- `SPIFFE/SPIRE` — A workload-identity approach that issues verifiable identities to running workloads and supports short-lived credentials.
- `Distributed denial-of-service (DDoS) mitigation` — Layered capacity, filtering, rate control, and traffic absorption to reduce availability impact from volumetric or application-level attacks.
- `Web application firewall (WAF)` — An HTTP-aware rule layer that blocks or challenges selected traffic patterns; it cannot repair authorization or input-validation flaws.
- `Key management service (KMS)` — A managed cryptographic-key lifecycle and access control service; envelope encryption and key rotation policies remain application concerns.
- `Supply-chain provenance` — Evidence of source, build process, and artifact lineage that supports integrity verification and incident response.
- `Post-quantum cryptography migration` — A staged transition to quantum-resistant algorithms where long-lived confidentiality or signature validity requires it; interoperability and crypto agility must be planned.

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.