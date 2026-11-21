# architecture patterns multi-region tenancy and reliability — Reference: Homomorphic encryption

Sources: [NIST Privacy-Enhancing Cryptography: FHE](https://csrc.nist.gov/projects/pec/fhe), [HomomorphicEncryption.org security guidelines](https://homomorphicencryption.org/security-guidelines/), [Homomorphic Encryption Standard v1.1](https://homomorphicencryption.org/wp-content/uploads/2024/08/Homomorphic-Encryption-Standard-v1.1.pdf), [ISO/IEC 18033-6:2019](https://www.iso.org/standard/67740.html), [OpenFHE documentation](https://openfhe-development.readthedocs.io/en/latest/), [OpenFHE schemes](https://openfhe.org/).

## Scope and version

This lesson covers homomorphic encryption (HE), including partially and fully homomorphic schemes, using NIST material, HomomorphicEncryption.org’s 2024 security-guidelines update, ISO/IEC 18033-6:2019, and current OpenFHE documentation available on 2026-11-20. The consortium’s “Homomorphic Encryption Standard” is a community security-guidelines document, not one comprehensive formal standard for every FHE implementation. ISO/IEC 18033-6 specifies Exponential ElGamal and Paillier mechanisms; it does not standardize all modern FHE schemes or APIs.

## How this group fits the mental model

Normal encryption protects data at rest and in transit, but a service generally decrypts it before computation. HE lets a server apply selected computations directly to ciphertext. The client with the secret key later decrypts a result that corresponds to the computation on the original plaintext. This can reduce what the compute operator learns, at the cost of specialized algorithms, larger ciphertexts, more computation, and strict parameter/circuit design.

HE does not automatically hide who is asking, which ciphertext is accessed, the program being evaluated, result sizes, or information leaked by the output. It is a cryptographic primitive, not by itself a secure application protocol.

## Supplied names explained

- **Partially homomorphic encryption (PHE):** supports one operation family (for example, additive aggregation) an unbounded number of times. Examples include Paillier additive homomorphism and multiplicative ElGamal variants, each with its own security and encoding assumptions.
- **Somewhat homomorphic encryption (SHE):** supports a bounded number/depth of operations before accumulated noise or parameters prevent correct decryption.
- **Leveled FHE:** supports a chosen maximum computation depth without bootstrapping by selecting parameters for that circuit depth.
- **Fully homomorphic encryption (FHE):** supports arbitrary-depth computation by refreshing ciphertexts through bootstrapping or equivalent scheme mechanisms, subject to practical cost and supported operations.
- **BFV/BGV:** lattice-based schemes commonly used for exact modular/integer arithmetic. Plaintext modulus, batching, noise budget, and circuit affect behavior.
- **CKKS:** approximate arithmetic on real/complex packed values. It has scale, rescaling, precision, and approximation-error considerations; it is not exact decimal arithmetic.
- **TFHE/FHEW-style schemes:** support efficient Boolean/gate-oriented computation and programmable bootstrapping in their design space; library support and trade-offs vary.
- **Bootstrapping:** homomorphic refresh that reduces accumulated noise so more computation can continue. It is expensive and scheme/library-specific.
- **Key switching/relinearization/rotations:** operations and evaluation keys that transform ciphertexts or support packed vector operations. Evaluation keys can be large and must be provisioned carefully.
- **Threshold HE:** distributes secret-key authority across parties so decryption requires a protocol/quorum. It introduces protocol and collusion assumptions; it is not simply “multi-user FHE.”

## Basic computation model

An HE scheme has key generation, encryption, homomorphic evaluation, and decryption. Informally, for supported function `f`, evaluation produces ciphertext `c'` such that decrypting `c'` gives `f(m)` (exactly or approximately, depending on scheme). The evaluator usually receives public/evaluation keys but not the secret decryption key.

Developers compile an intended function into supported arithmetic operations. They must choose a scheme and parameters for the message representation, multiplicative depth, precision, batching, security target, and runtime/memory budget. HE does not run arbitrary ordinary .NET or JavaScript code directly; branch-heavy code, comparisons, sorting, and data-dependent access may require costly circuit transformations or leak information through control flow.

## Choosing a scheme and planning a circuit

1. Define who encrypts, who evaluates, who decrypts, what the evaluator must learn, and how inputs/results are authenticated.
2. Determine whether arithmetic is exact or approximate. Exact sums/counts may suit BFV/BGV; approximate vector math may suit CKKS; a small Boolean circuit may suit TFHE/FHEW-style schemes; a single sum may need only an additive PHE scheme.
3. Write down the computation circuit: number of additions/multiplications, multiplicative depth, rotations, comparisons, and branching.
4. Select parameters using current security guidelines and library tooling. Do not copy stale parameters from a blog or lower the security level to meet latency.
5. Benchmark end-to-end with realistic ciphertext sizes, serialization, network, key generation, bootstrapping/evaluation keys, and decryption.
6. Design key distribution, rotation, revocation, recovery, and access policy separately. The evaluator must not receive a decryption key unless the protocol explicitly permits it.
7. Analyze output leakage: repeated queries or fine-grained results can reveal sensitive information even if each individual computation is performed over ciphertext.

## Example: encrypted statistics service

Several organizations encrypt bounded numeric contributions under a public/evaluation key. The cloud sums or evaluates a fixed statistic without seeing individual plaintext values; an authorized recipient decrypts the aggregate. If the service can request decryption of arbitrary chosen outputs, it may recover inputs through repeated queries. Mitigations include query policy, minimum cohort sizes, rate limits, output rounding, differential privacy where appropriate, and independent key custody.

For machine learning, CKKS can support approximate vector operations but model inference may require many ciphertext operations and rotations. Compare a private inference result’s latency, memory, precision, and output leakage against MPC, trusted execution environments, or a non-cryptographic architecture with stronger organizational controls.

## Security and system limits

- Use well-reviewed libraries and current security parameter guidance; do not design a scheme or parameters yourself.
- Encryption security does not prove the evaluator executed the requested function correctly. Consider verifiable computation, replication, attestation, or a trust assumption when correctness against a malicious server matters.
- Protect secret keys and evaluation keys. An evaluation key may not enable decryption, but it is sensitive protocol material and can reveal structure or enable attacks if misused.
- Account for malleability: ciphertexts are intended to be transformed. HE encryption is not automatically an authenticated encryption interface. Authenticate inputs, bind context, validate encodings, and protect against chosen-ciphertext/decryption-oracle behaviors at protocol boundaries.
- Control noise, overflow/modulus wraparound, scale drift, precision loss, and ciphertext packing errors. The result can be wrong without a cryptographic failure.
- Model side channels, access patterns, timing, metadata, client/server collusion, and output inference. HE alone does not hide them.
- HE is often substantially more resource-intensive than plaintext computation; prototype the actual target workload before choosing it.

## Cross-item comparison

- **HE:** one party can evaluate on encrypted inputs without seeing plaintext; ciphertexts can be large and evaluation expensive.
- **Secure multiparty computation (MPC):** parties jointly compute while distributing trust; communication rounds and interaction can be significant.
- **Secure aggregation:** specialized MPC-like protocols reveal a cohort aggregate, often for federated learning, rather than arbitrary query computation.
- **Trusted execution environment (TEE):** runs plaintext code in a hardware-protected enclave; performance can be closer to ordinary compute but depends on hardware, side-channel, and attestation assumptions.
- **Differential privacy:** limits information revealed by output by adding calibrated randomness; it is complementary to HE because encrypted computation alone does not bound output leakage.
- **Tokenization/de-identification:** changes data representation but is not equivalent to cryptographic computation over ciphertext.

## Common mistakes

- Calling any encrypted computation “fully homomorphic” without specifying supported operations/depth and scheme.
- Treating CKKS approximate values as exact integers or decimals.
- Assuming FHE hides access patterns, metadata, chosen queries, or result leakage.
- Assuming the server cannot lie about its computation merely because it cannot decrypt.
- Using a security parameter from an old benchmark without checking current guidance.
- Ignoring evaluation key size, bootstrapping, ciphertext expansion, and realistic end-to-end latency.
- Confusing a community guideline with a formal universal FHE standard.
- Selecting FHE when an additive scheme, MPC, TEE, secure aggregation, or differential privacy is a simpler fit.

## Knowledge checks with answers

1. **What does homomorphic evaluation guarantee at a high level?** Decryption of the evaluated ciphertext corresponds to applying a supported function to the encrypted message, exactly or approximately according to the scheme.
2. **Is CKKS exact arithmetic?** No. It is designed for approximate real/complex arithmetic with scale and precision management.
3. **Does FHE prove the server computed the requested function honestly?** No. It protects input confidentiality under assumptions; correctness verification is a separate problem.
4. **Why can repeated outputs leak input data?** The requester may combine allowed outputs or choose inputs/queries to infer secrets; control the output interface and query budget.
5. **What should choose parameters?** The circuit, plaintext representation, depth/precision, target security, and measured resource budget, using current scheme guidance and vetted library tooling.

## Examples

A clinic wants a cloud service to sum encrypted counts. A general FHE model may be unnecessary: an additive homomorphic scheme or secure aggregation can be sufficient. If the service later needs comparisons and nonlinear scoring, the team benchmarks a suitable FHE scheme and adds query/output privacy controls rather than assuming the original sum protocol still provides adequate protection.

## Practice exercise

Specify a private risk-score computation: exact/approximate output, input range, circuit depth, evaluator visibility, key holder, collusion assumptions, result-query policy, and acceptable latency. Compare CKKS, BFV/BGV, MPC, TEE, and differential privacy, and state what each design still leaks.
