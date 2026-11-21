# architecture patterns multi-region tenancy and reliability — Reference: SPIRE

Sources: [SPIRE concepts](https://spiffe.io/docs/latest/spire-about/spire-concepts/), [SPIRE architecture](https://spiffe.io/docs/latest/spire-about/spire-concepts/#spire-architecture-and-components), [SPIRE server configuration](https://spiffe.io/docs/latest/deploying/spire_server/), [SPIRE agent configuration](https://spiffe.io/docs/latest/deploying/spire_agent/), [SPIRE registration entries](https://spiffe.io/docs/latest/deploying/spire_server/), [SPIFFE Workload API](https://spiffe.io/docs/latest/spiffe-specs/spiffe_workload_api/), [working with SVIDs](https://spiffe.io/docs/latest/deploying/svids/), [SPIRE security guidance](https://spiffe.io/docs/latest/spire-about/spire-concepts/).

## Scope and version

This lesson covers SPIRE (the SPIFFE Runtime Environment) as documented on 2026-11-20. SPIRE is one production-ready implementation of SPIFFE, not the SPIFFE standard itself. Version-specific plugins, attestors, datastore options, deployment modes, and enterprise capabilities change; verify the official docs for the installed release.

## How this group fits the mental model

SPIFFE defines the identity format and workload API. SPIRE supplies a control plane that attests nodes and workloads against operator-defined conditions, then issues the corresponding short-lived identity credentials. The important security decision is not merely “install SPIRE”; it is whether the attestation evidence reliably distinguishes the intended workload from another process that could claim the same identity.

## Supplied names explained

- **SPIRE Server:** control-plane component that manages registration/identity configuration, trust domain signing, and issuance to agents.
- **SPIRE Agent:** node-local component that attests the node, serves the Workload API to local workloads, and obtains/rotates SVIDs and trust bundles.
- **Node attestation:** establishes that an agent/node meets a configured enrollment rule before it joins the trust domain.
- **Workload attestation:** evaluates workload selectors and runtime/platform evidence to decide which SPIFFE ID the process may receive.
- **Registration entry:** operator-managed mapping of SPIFFE ID to parent/selector conditions and optional profile/TTL settings. It is sensitive identity policy and should be reviewed like code.
- **Attestor/plugin:** integration that gathers evidence from infrastructure or runtime systems; examples include cloud, Kubernetes, Unix, and container-related selectors, depending on supported release/plugins.
- **Workload API:** SPIFFE gRPC API through which a process obtains SVIDs and bundles. The endpoint’s caller-identification mechanism is part of the trust boundary.

## Identity issuance flow

1. A SPIRE Agent starts and proves node eligibility using a configured node attestor. The Server accepts it and issues the agent identity/SVID.
2. A workload connects to its local Agent Workload API endpoint.
3. The Agent identifies the caller using platform metadata or configured workload attestation. It evaluates that evidence against registration entries and selectors.
4. If policy matches, the Agent obtains or serves an SVID for the permitted SPIFFE ID and its trust bundle. The workload can receive updates/rotations from the streaming API.
5. A peer validates the SVID and then applies its own authorization rules.

Node selectors are not automatically equivalent to workload selectors. A node being trusted does not mean every process on it should share the same identity. Prefer per-workload identities and selectors with enough specificity to prevent a neighboring or compromised process from impersonating the workload.

## Registration and selector design

Selectors can depend on platform attributes such as Kubernetes namespace/service account/pod properties or cloud instance metadata, according to the chosen attestor and plugin. Treat selector quality as a security property:

- Avoid identity rules based only on a mutable label that untrusted workload authors can set.
- Bind identity to platform-verified attributes and restrict who may create/change registration entries.
- Ensure identity paths do not collide; avoid broad wildcards that let one service obtain another service’s SVID.
- Test a matching workload, a near-match, a workload on an unauthorized node, and a spoofed selector.
- Review how container restart, pod replacement, namespace movement, and service-account changes affect selectors and cached credentials.

## Operations, rotation, and failure modes

- **Server/Agent availability:** workload identity issuance and updates depend on control-plane and local-agent availability. Define cached credential behavior and outage bounds; existing SVIDs may remain valid until expiry while new issuance fails.
- **Short-lived credentials:** reduce exposure time but require reliable rotation, client reload, time synchronization, and CA/bundle lifecycle management.
- **Trust bundle rotation:** stage trust updates so workloads can validate old/new chains during transition, then remove old trust only after clients have refreshed.
- **Datastore and signing keys:** protect backups, access, and recovery procedures. Loss or compromise of signing authority can affect the whole trust domain.
- **Agent socket:** permissions and local process attestation matter. A world-readable endpoint or weak caller identification can hand credentials to an attacker on the node.
- **HA and disaster recovery:** test Server replication/storage recovery and re-enrollment; a recovery plan must retain required trust-domain and sealing/signing material without placing it in ordinary workload images.
- **Monitoring:** alert on unexpected registration changes, failed attestation, duplicate identity issuance, issuance spikes, expired credentials, unavailable agents, and trust-bundle changes.

## Example: Kubernetes and a .NET API

SPIRE Agents run at nodes and expose local Workload API endpoints. A .NET billing pod receives `spiffe://prod.example/billing/api` only when the Kubernetes attestor evidence and registration selectors match the protected namespace and expected service account/workload properties. The payments API accepts that identity over mTLS but separately checks its business permission for the requested operation. A React frontend does not receive the pod’s SVID; it uses user authentication to the API.

During deployment, first register and test the new workload identity, then deploy a canary, verify peer authorization and credential rotation, and remove the old identity rule after no process depends on it. A label change alone should not silently grant a privileged identity.

## Cross-item comparison

- **SPIFFE** is the identity standard; **SPIRE** is an implementation that performs attestation and issuance.
- **Cloud-native workload identity** can bind cloud service accounts to roles; SPIRE can provide a portable identity across environments. Integration does not make IAM and SPIFFE permissions equivalent.
- **Kubernetes service account** is a platform identity; SPIRE may use verified Kubernetes metadata to issue a distinct workload identity.
- **Static certificates/secrets** are simpler but require distribution, rotation, and revocation. SPIRE automates issuance but adds a control plane and attestation policy that must be protected.

## Common mistakes

- Assuming SPIRE is required by the SPIFFE standard or is the only implementation.
- Treating node attestation as proof that every process on the node is trusted.
- Using broad, user-controlled labels as the only workload selector.
- Allowing every local process to call the Agent Workload API.
- Assuming a valid SVID grants business permissions without application authorization.
- Rotating the CA without trust-bundle overlap and client reload testing.
- Failing to plan for expired credentials during Server/Agent outage.
- Treating registration-entry administration as routine metadata rather than security policy.

## Knowledge checks with answers

1. **What is the difference between SPIFFE and SPIRE?** SPIFFE defines interoperable identities/API; SPIRE is an attestation and credential-issuance implementation.
2. **Does a node SVID prove the workload is authorized?** No. Workload attestation and application authorization are distinct steps.
3. **Why protect registration entries?** They map attested evidence to issued identity; a malicious edit can let an unintended workload obtain a trusted SVID.
4. **What happens if the Agent socket is accessible to the wrong local process?** That process may obtain credentials for an identity it should not receive; caller identification and socket access controls must be tested.
5. **Why does rotation require coordination?** Workloads and peers must receive new credentials and trust bundles before old credentials/roots are removed.

## Examples

An unexpected pod receives a privileged SVID after a namespace label is changed. The incident response disables the affected registration entry, audits who changed the selector, enumerates certificates issued under that identity, and reviews peer access logs. The repair binds the rule to platform-verified namespace/service-account attributes and adds negative selector tests.

## Practice exercise

Create a threat model for a .NET service on Kubernetes using SPIRE. List node and workload attestation evidence, registration selectors, who may edit them, Workload API socket controls, SVID TTL/rotation, trust-bundle rollout, and what the application does when identity issuance or authorization is unavailable.
