# architecture patterns multi-region tenancy and reliability — Reference: Secure aggregation

Sources: [Bonawitz et al., Practical Secure Aggregation for Federated Learning on User-Held Data](https://research.google/pubs/practical-secure-aggregation-for-federated-learning-on-user-held-data/), [Bonawitz et al., Practical Secure Aggregation for Privacy-Preserving Machine Learning](https://acmccs.github.io/papers/p1175-bonawitzA.pdf), [Google research on communication-efficient secure aggregation](https://research.google/pubs/federated-learning-with-autotuned-communication-efficient-secure-aggregation/), [NIST Privacy-Enhancing Cryptography](https://csrc.nist.gov/projects/pec), [NIST FHE and PET overview](https://csrc.nist.gov/projects/pec/fhe), [OpenMined PySyft documentation](https://docs.openmined.org/).

## Scope and version

Secure aggregation is a family of cryptographic protocols, not one universal standard or one library API. This lesson focuses on the federated-learning pattern in which a server learns an aggregate—commonly a sum—of client inputs without seeing each input individually. Protocol guarantees depend on threat model, client dropout, collusion threshold, authentication, input validation, and the number of repeated rounds. Use the exact protocol’s security paper/specification and implementation review for deployment.

## How this group fits the mental model

Federated systems keep raw records on user devices or organizational servers, but sending each model update to a central coordinator can still expose sensitive information. Secure aggregation lets clients cryptographically mask contributions so the coordinator can recover only an aggregate if enough participants complete the protocol. This protects individual values under stated assumptions; it does not prove that inputs are honest, hide every fact inferable from aggregates, or prevent the service from returning revealing outputs over many rounds.

## Supplied names explained

- **Secure aggregation:** secure multiparty computation (MPC) functionality that lets a group compute an aggregate of private inputs while limiting what each party learns beyond that aggregate.
- **Client contribution:** private vector/value (for example, a model gradient/update) submitted by one participant.
- **Cohort:** the participants included in one aggregation round. Minimum cohort size and dropout threshold are security-relevant.
- **Masking shares:** protocol values used to cancel masks for participating clients and remove masks for clients that drop out, without revealing an individual input.
- **Threshold/dropout tolerance:** the number or fraction of participants the protocol can tolerate failing or colluding while maintaining its stated confidentiality/correctness properties. Exact bounds are protocol-specific; do not generalize the “up to one-third” property of a particular paper to every design.
- **Input validation:** checks that contributions meet constraints, such as range or norm bounds. Secure aggregation alone may hide invalid/malicious values from the coordinator, so validation needs protocol support or trusted mechanisms.
- **Differential privacy (DP):** a separate mathematical bound on information leaked by outputs about one individual. Secure aggregation may protect raw updates in transit/aggregation; DP limits what the aggregate model/statistics reveal.

## A typical protocol flow

1. The server selects and authenticates a cohort and announces a round/model version, input format, and threshold.
2. Clients authenticate, validate the round, and establish pairwise or threshold masking material according to the selected protocol.
3. Each client masks its update and submits the masked value with required commitments/proofs.
4. If clients drop out, surviving clients provide only protocol-authorized recovery material needed to cancel masks; the protocol enforces the threshold and does not expose an individual update.
5. The server reconstructs the permitted aggregate, checks round/metadata, and applies the aggregation/training step.
6. The system discards ephemeral protocol material, records a privacy-preserving audit trail, and monitors cohort sizes, failures, retries, and repeated-query behavior.

Real protocols differ in setup, message rounds, pairwise communication, server assumptions, malicious-client handling, modular arithmetic/quantization, and recovery. Follow the chosen protocol’s specification rather than treating this generic flow as deployable cryptographic code.

## Threat model and residual leakage

Secure aggregation can prevent a coordinator from directly observing one client’s unaggregated vector under its protocol assumptions. It does not automatically protect against:

- **Small or chosen cohorts:** if one participant is isolated or the server can create overlapping cohorts, differences between aggregates may reveal an individual contribution.
- **Repeated rounds:** model updates and changing cohorts can leak information across rounds; aggregate privacy is not a guarantee for an unbounded sequence.
- **Malicious participants:** clients may submit poisoned, malformed, extreme, or strategically chosen inputs. Confidentiality does not establish correctness or benign intent.
- **Server equivocation/rollback:** a malicious server may show different models or cohort definitions to different clients unless the protocol binds rounds and state consistently.
- **Metadata:** participant identity, availability, timing, network addresses, and update sizes may remain visible.
- **Output inference:** the final model or statistics can reveal sensitive attributes. Apply DP, query controls, cohort thresholds, or other policy where needed.
- **Implementation failure:** side channels, random-number failures, replay, downgrade, key reuse, serialization bugs, and unauthenticated transport can invalidate protocol claims.

## Example: federated keyboard model updates

Devices compute local updates and submit protocol-masked vectors for a cohort. The coordinator obtains their sum but not each raw vector. A minimum cohort size and per-round contribution limits reduce simple differencing attacks; differential privacy noise at an appropriate point limits what the resulting model reveals. Robust aggregation/input clipping addresses a different problem—malicious or outlier updates—and must be compatible with the protocol. The coordinator still sees who participated and when unless separate protections hide that metadata.

## Design and operations

- Define the adversary: honest-but-curious server, malicious server, colluding clients, network attacker, or combinations. State exactly which are covered.
- Choose protocol based on vector dimension, cohort size, communication rounds, dropout rate, and client battery/network constraints.
- Authenticate clients and bind every message to a unique round, model version, cohort, and nonce to prevent replay or cross-round mixing.
- Set minimum cohort thresholds and prevent adaptive cohort differencing. Audit who can create rounds and choose participants.
- Use proven implementations and current cryptographic libraries. Do not implement masking, secret sharing, or finite-field operations from a lesson.
- Add input bounds, clipping, anomaly detection, and robust aggregation separately; if validation is privacy-sensitive, use protocol-compatible proofs or trusted checks.
- Combine with differential privacy when release confidentiality requires a formal bound. Track privacy budget across rounds and repeated releases.
- Monitor protocol dropout, retry, threshold, latency, and error rates without logging raw client inputs or secret masks.
- Plan what happens when too many clients drop out: abort/restart with a fresh round identifier; never weaken the threshold silently.

## Cross-item comparison

- **Secure aggregation vs HE:** secure aggregation computes a constrained aggregate using interactive/client masking; HE lets an evaluator compute supported functions on ciphertexts, often with different communication and compute trade-offs.
- **Secure aggregation vs generic MPC:** secure aggregation is specialized to sum/vector aggregation and often optimized for client dropout; general MPC supports broader computations but may be more interactive or costly.
- **Secure aggregation vs differential privacy:** aggregation protects individual inputs during computation under protocol assumptions; DP bounds information revealed by outputs. They are complementary.
- **Federated learning vs secure aggregation:** federated learning keeps training data distributed; it does not automatically hide model updates. Secure aggregation is one additional privacy mechanism.
- **Input clipping vs confidentiality:** clipping limits contribution magnitude but does not hide the update; secure aggregation hides individual values but does not guarantee they are within bounds.

## Common mistakes

- Assuming raw data staying on-device means model updates cannot leak information.
- Assuming the coordinator learns nothing; the aggregate and participation metadata remain visible.
- Generalizing one protocol’s dropout/collusion bound to all secure aggregation schemes.
- Running tiny cohorts or allowing the server to choose overlapping groups that reveal differences.
- Treating secure aggregation as differential privacy or as a defense against model poisoning.
- Ignoring malicious server behavior, replay, round binding, and repeated-round leakage.
- Logging unmasked updates or protocol secrets for debugging.
- Weakening the threshold when clients drop out instead of aborting safely.

## Knowledge checks with answers

1. **What does the server normally learn?** The permitted aggregate and protocol metadata, not each individual unaggregated input, assuming the protocol and threshold hold.
2. **Does secure aggregation prevent inference from the final aggregate/model?** No. Output leakage needs controls such as DP, cohort thresholds, and query policy.
3. **Does masking stop malicious clients from poisoning training?** No. Input validation and robust aggregation address integrity/quality separately.
4. **Why is a minimum cohort important?** Very small or adaptively chosen groups can make aggregate differences reveal an individual contribution.
5. **What should happen if the protocol threshold is not met?** Abort or restart safely with fresh round state; do not silently lower the security threshold.

## Examples

If the service publishes the aggregate of cohort `{A,B,C}` and then `{B,C}`, subtraction reveals A’s update. Secure aggregation alone does not stop this differencing attack; cohort-selection policy, release limits, and DP are needed in addition to cryptographic masking.

## Practice exercise

Design a federated update protocol for intermittently connected phones. Write the threat model, cohort threshold, dropout policy, round binding, input bounds, repeated-release policy, DP plan, metadata exposure, and performance measurements. Identify which guarantees come from secure aggregation and which require separate controls.
