# architecture patterns multi-region tenancy and reliability — Reference: SPIFFE

Sources: [SPIFFE overview](https://spiffe.io/docs/), [SPIFFE ID and SVID specification](https://spiffe.io/docs/latest/spiffe-specs/spiffe-id/), [Workload API specification](https://spiffe.io/docs/latest/spiffe-specs/spiffe_workload_api/), [X.509-SVID specification](https://spiffe.io/docs/latest/spiffe-specs/x509-svid/), [JWT-SVID specification](https://spiffe.io/docs/latest/spiffe-specs/jwt-svid/), [federation specification](https://spiffe.io/docs/latest/spiffe-specs/spiffe_federation/), [working with SVIDs](https://spiffe.io/docs/latest/deploying/svids/).

## Scope and version

This lesson explains the SPIFFE (Secure Production Identity Framework for Everyone) open standard as documented on 2026-11-20. SPIFFE defines workload identities and interoperable ways to present and retrieve them; SPIRE is one implementation. Check the current specification and implementation profile before deployment because profiles and operational integration can evolve.

## How this group fits the mental model

Workloads need identities just as people do, but service IP addresses, hostnames, and shared passwords are unstable or over-broad identity signals. SPIFFE gives a workload a portable identity and credentials it can present to another service. The receiver validates that identity against a trust domain and then applies authorization. Authentication answers “who is this workload?”; it does not decide what that workload is allowed to do.

## Supplied names explained

- **SPIFFE ID:** a URI-form identity, conventionally `spiffe://<trust-domain>/<path>`. The trust domain defines the namespace and trust root; path segments are operator-defined identifiers. A SPIFFE ID is not itself a secret or proof—the SVID presents it cryptographically.
- **SVID (SPIFFE Verifiable Identity Document):** signed credential through which a workload presents its SPIFFE ID. An SVID is valid when signed by an authority in the ID’s trust domain and accepted under the verifier’s trust policy.
- **X.509-SVID:** X.509 certificate with SPIFFE ID in the URI Subject Alternative Name, used with TLS/mTLS and certificate validation.
- **JWT-SVID:** signed JWT carrying a SPIFFE subject identity, typically for a bounded audience and token exchange/use. It is bearer-token-like: theft can enable replay until expiration unless bound by additional mechanisms.
- **Trust bundle:** trust material used to validate SVIDs issued by a trust domain. Federation can distribute foreign trust bundles; trust must be explicitly established.
- **SPIFFE Workload API:** gRPC API exposed by a workload endpoint through which a workload obtains SVIDs and bundles and receives updates. X.509-SVID and JWT-SVID profiles are mandatory in the current Workload API specification, though an operator may disable a profile; WIT-SVID is optional.
- **Workload endpoint:** local API endpoint that serves eligible workloads. The SPIFFE standard intentionally leaves caller authentication to out-of-band implementation mechanisms; a local socket is not automatically safe if its filesystem permissions or process identity checks are weak.

### X.509 and JWT identity trade-offs

X.509-SVIDs work naturally with TLS client/server authentication and certificate-chain validation; private keys should remain protected and credentials rotated. JWT-SVIDs fit HTTP/API flows and can convey an audience restriction, but are bearer credentials and must be validated for signature, issuer/trust domain, audience, time bounds, and replay risk. A JWT-SVID is not an ID token or a general user login token. Choose the profile for the protocol and verifier, and constrain audience and lifetime.

## Workload API lifecycle

1. A process connects to its local workload endpoint using the platform’s caller-identification mechanism.
2. The endpoint determines which identity/identities that process is entitled to receive.
3. The workload receives one or more SVIDs and related trust bundles. The API can stream full responses when credentials/bundles change; clients should process replacement and removal correctly.
4. The workload authenticates to a peer using the credential. The peer validates the chain/signature, SPIFFE ID, trust domain/bundle, validity period, and relevant audience or TLS properties.
5. Application authorization maps the authenticated SPIFFE ID to permissions and tenant scope. Never equate “valid SVID” with “allowed every action.”
6. The workload refreshes credentials before expiry and handles rotation without dropping traffic. On identity removal or trust-bundle change, it should stop trusting redacted identities/bundles according to the API contract.

## Federation and trust boundaries

Two trust domains do not trust each other merely because they exchange network traffic or use similarly named identities. Federation publishes or distributes foreign bundles and requires each side to establish which foreign domain and identities it accepts. Restrict trust to necessary domains and paths, monitor bundle changes, and plan CA key rotation. Avoid wildcard authorization based only on a trust-domain prefix.

## Example: .NET services in a cluster

A .NET billing API obtains an X.509-SVID from the local Workload API and presents it in mutual TLS to the payments service. The payments service validates the certificate against the expected trust bundle and checks the exact SPIFFE ID, such as `spiffe://prod.example/payments/api`, before applying its own `charge` policy. The billing API never stores a shared static client certificate in its image. A React browser is not a trusted workload and should not receive a workload private key; browser-to-API user authentication remains a separate concern.

The deployment team tests rotation by replacing an SVID during live traffic, verifies trust-bundle updates, and confirms that an unauthorized pod cannot connect to the Workload API socket or claim the same SPIFFE ID.

## Cross-item comparison

- **SPIFFE** standardizes identities and credential delivery; **SPIRE** performs attestation and issues them in one implementation.
- **mTLS with SPIFFE IDs** authenticates workloads at a transport connection. JWT-SVIDs carry workload identity in a token protocol. Neither replaces authorization.
- **Cloud IAM workload identity** is provider-specific federation/roles; SPIFFE offers a portable identity model across environments. Integrations can bridge them but do not make policies automatically equivalent.
- **Kubernetes service account tokens** identify a workload to Kubernetes or configured relying parties; SPIFFE SVIDs use a distinct identity/trust model. Do not assume they are interchangeable.

## Common mistakes

- Treating a SPIFFE ID string as proof without validating an SVID.
- Treating successful mTLS as permission to perform every business operation.
- Using one shared workload identity for unrelated services, erasing least-privilege boundaries.
- Assuming the local Workload API authenticates callers automatically; endpoint deployment must enforce workload identification.
- Accepting any certificate from a trust domain without checking the expected SPIFFE ID and authorization policy.
- Treating JWT-SVIDs as non-replayable or suitable for browser exposure.
- Trusting a foreign bundle without a controlled federation decision and update process.
- Failing to test SVID expiry, rotation, revocation/removal, clock skew, and bundle changes.

## Knowledge checks with answers

1. **What does a valid SVID establish?** A cryptographically verifiable workload identity under a trust domain and verifier policy; authorization remains separate.
2. **When is X.509-SVID a natural choice?** For TLS/mTLS workload authentication with certificate validation and rotation.
3. **What makes JWT-SVID sensitive?** It is a signed bearer-style token; constrain audience/time and protect against theft/replay.
4. **Does sharing a trust bundle automatically authorize a foreign workload?** No. The verifier still checks the identity and applies authorization.
5. **Who authenticates callers to Workload API?** The deployment implementation uses an out-of-band mechanism; configure and secure it explicitly.

## Examples

During a rollout, the payments service accepts the current and next CA bundle while workloads rotate short-lived SVIDs. After observing new credentials in all clients, operators remove the old trust material. A canary test confirms an old identity is rejected after the planned cutoff while unrelated services continue to authenticate.

## Practice exercise

Define SPIFFE IDs for a .NET API, a worker, and a database proxy. Specify which may call each other, which SVID profile each connection uses, the trust bundle and federation rules, and how the system behaves if the endpoint is unavailable or a credential is removed.
