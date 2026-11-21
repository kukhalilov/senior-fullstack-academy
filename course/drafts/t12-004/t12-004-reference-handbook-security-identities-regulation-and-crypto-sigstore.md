# architecture patterns multi-region tenancy and reliability — Reference: Sigstore

Sources: [Sigstore documentation](https://docs.sigstore.dev/), [Cosign quickstart](https://docs.sigstore.dev/quickstart/quickstart-cosign/), [bundle format](https://docs.sigstore.dev/about/bundle/), [Fulcio](https://docs.sigstore.dev/certificate_authority/overview/), [Rekor](https://docs.sigstore.dev/logging/overview/), [verification](https://docs.sigstore.dev/verifying/verify/), [trust root and TUF](https://docs.sigstore.dev/cosign/system_config/overview/), [in-toto attestations](https://github.com/in-toto/attestation).

## Scope and version

This lesson covers the Sigstore ecosystem as documented on 2026-11-20: Cosign signing and verification, Fulcio short-lived certificates, Rekor transparency logging, bundles, and verifier policy. Sigstore is an ecosystem, not one signing command or a universal identity policy. Public-good and private deployments can differ in services and trust roots; pin the versions and configuration your organization uses.

## How this group fits the mental model

A consumer asks three questions: are these the bytes the publisher signed; which identity signed them; and is that identity authorized to sign this type of artifact for this release? Cryptography answers integrity and supports identity. The relying party’s policy decides authorization.

Sigstore reduces the burden of distributing long-lived keys to CI workflows. It does not remove the need to secure CI identities, verify exact artifact digests, constrain acceptable identities, or decide how to respond when evidence is unavailable or a publisher is compromised.

## Supplied names explained

- **Sigstore** is a set of open-source components and formats for signing, verifying, and recording artifact signatures and attestations.
- **Cosign** provides CLI and library workflows for containers, blobs, and attestations.
- **Fulcio** can issue a short-lived certificate after an OIDC identity flow. It binds an ephemeral public key to identity information.
- **Rekor** is a transparency log for signing-related entries, supporting auditable inclusion and consistency.
- **TUF-based trusted-root distribution** bootstraps and updates trusted public keys and service metadata through a root-of-trust process.
- **A Sigstore bundle** packages signature content and verification material such as a certificate or key hint, log entry, and timestamp evidence, according to its format.

In the public-good keyless workflow, a CI job authenticates to an OIDC provider; Cosign obtains a short-lived Fulcio certificate for an ephemeral key; Cosign signs the artifact or digest; and the event is recorded in Rekor. A verifier checks the signature against the artifact, certificate against trusted roots, expected certificate identity and issuer, and transparency/timestamp evidence required by policy.

## What verification proves

- **Signature:** the signed content matches under the verified public key. For a container, bind acceptance to an immutable digest, not a mutable tag.
- **Certificate identity:** identity claims were issued through the certificate flow. They do not prove the workflow was safe, the source was reviewed, or the identity owner was honest.
- **Transparency inclusion:** the event is auditable and can help expose equivocation or silent signing. It is not malware analysis or approval of the signer.
- **Short-lived key/certificate:** reduces key-lifetime and distribution burden. An attacker controlling an authorized CI identity can still request signing material while that identity is usable.
- **Bundle:** makes evidence portable. It is not self-authorizing; the verifier needs trusted roots and rules for identity, issuer, artifact, and predicate.

Sigstore does not guarantee trustworthy source, reproducible builds, safe dependencies, or benign artifacts. An authorized malicious workflow can create a valid signature and transparency record.

## Production verification procedure

1. Verify the actual artifact at an immutable digest. Resolve any tag to a stable digest before the deployment decision.
2. Verify signature bytes and certificate chain using a trusted, current Sigstore root. Do not trust an arbitrary key supplied with an artifact.
3. Require the expected certificate identity (for example, exact repository and release workflow) and OIDC issuer. Broad regular expressions can admit unintended signers.
4. Verify log inclusion and signing-time evidence when required by the selected certificate and deployment policy.
5. For attestations, validate the type, predicate, subject digest, and policy fields. A signature does not guarantee the statement is complete or true.
6. Fail closed on invalid signatures, unexpected identity, untrusted root, mismatched digest, or missing required evidence. Use a documented, audited emergency exception rather than silently skipping checks.
7. Monitor root updates, log/CA availability, identity changes, and verification failures.

Official examples use `cosign sign-blob` with a bundle and `cosign verify-blob` with expected certificate identity and issuer. Container signatures are associated with the image digest in the registry and verified against identity constraints. CLI flags and bundle versions evolve; check the documentation for the installed Cosign release.

## Example: .NET API image and React bundle

A release workflow builds and pushes a .NET image, resolves its digest, and signs that digest using its OIDC identity. Admission verifies the digest and requires the expected repository/workflow identity and issuer. It separately checks provenance for builder and source revision. A React bundle gets its own signature and evidence; signing the API does not cover the frontend. Keep release signing out of untrusted pull-request jobs, minimize workflow permissions, and protect reusable workflows and release refs.

## Failure and incident handling

- **Fulcio/OIDC unavailable:** signing may fail. Pause or use a preapproved alternate signing path with an audit trail; do not silently bypass verification.
- **Rekor unavailable:** whether signing or verification can proceed depends on configuration and required evidence. Preserve bundles and follow policy.
- **Wrong identity accepted:** tighten exact identity/issuer constraints and review admitted artifacts and deployment logs.
- **Signing workflow compromised:** revoke credentials and permissions, disable the affected workflow/ref, find artifacts signed during the window, rebuild from a known-good revision, and assess consumers. Short-lived certificates do not eliminate incident response.
- **Root or log trust issue:** use the Sigstore trust-root/service incident process and record the root and verification state used for deployment.

## Cross-item comparison

- **Sigstore** provides signing, certificates, transparency, and verification; **SLSA provenance** describes build claims. Use both when policy needs artifact integrity and build origin.
- **Traditional key signing** requires long-lived key custody and rotation; **keyless signing** ties short-lived credentials to a federated identity, moving trust to identity provider, workflow, CA, and log.
- **SBOM** lists components; it is not a signature or provenance record. Bind and sign it if integrity/origin evidence is required.
- **Transparency log** records evidence; it does not decide whether an identity should be trusted.

## Common mistakes

- Verifying a signature but accepting any signer.
- Using a broad identity regex without testing what other workflows it admits.
- Treating a Rekor entry as endorsement of safety.
- Verifying a mutable tag rather than the artifact digest.
- Assuming a signature proves source review, provenance, or absence of vulnerabilities.
- Assuming keyless signing removes the need to protect CI permissions and OIDC conditions.
- Trusting a bundle without validating certificate, timestamp/log proof, root, and policy.
- Disabling verification during outages without a time-bounded, auditable exception.

## Knowledge checks with answers

1. **What does a Fulcio certificate tell you?** It binds an ephemeral public key to identity claims from an identity flow; the verifier must authorize those claims under its own policy.
2. **Does Rekor inclusion prove an artifact is safe?** No. It makes a signing event auditable.
3. **Why verify a container by digest?** Tags can move; a digest identifies exact bytes.
4. **Can signed provenance replace signature verification?** No. Verify artifact integrity and validate the attestation and its digest binding.
5. **What if an authorized CI workflow is compromised?** An attacker may act as that workflow and obtain valid short-lived signing material; constrain identity, permissions, inputs, and release paths.

## Examples

A deployment policy accepts an image only when its digest matches, its certificate identity is the exact release workflow in the production repository, the OIDC issuer is approved, and the required transparency proof verifies. A valid signature from a developer’s fork is rejected even if the source code appears identical.

## Practice exercise

Write a container admission policy requiring digest, expected OIDC issuer, exact repository/workflow identity, and transparency evidence. Test rejection for another workflow in the same repository and for a valid signature over a different digest.
