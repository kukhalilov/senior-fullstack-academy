# architecture patterns multi-region tenancy and reliability — Reference: SolarWinds Orion compromise

Sources: [CISA Alert AA20-352A](https://www.cisa.gov/news-events/cybersecurity-advisories/aa20-352a), [CISA remediation guidance AR21-134A](https://www.cisa.gov/sites/default/files/publications/AR21-134A_Remediating_Networks_Affected_by_the_SolarWinds_and_Active_Directory_M365_Compromise.pdf), [CISA/NSA/FBI advisory AA21-008A](https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-008a), [CISA and partner detection guidance](https://www.cisa.gov/sites/default/files/publications/Supply_Chain_Compromise_Detecting_APT_Activity_from_known_TTPs.pdf), [SolarWinds SEC filing](https://www.sec.gov/Archives/edgar/data/1739942/000162828020017451/swi-20201214.htm), [SLSA v1.2](https://slsa.dev/spec/v1.2/), [NIST SP 800-161 Rev. 1](https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final).

## Scope and version

This case study covers the SolarWinds Orion software supply-chain compromise disclosed in December 2020: SUNBURST inserted into certain Orion updates and follow-on activity in some affected networks. The initial software compromise and later cloud/identity compromise are distinct stages. Receiving an affected update established potential exposure, not necessarily follow-on exploitation. For a live response, follow current CISA/vendor guidance and local incident procedures.

## How this group fits the mental model

A signed update can be malicious when an attacker compromises the producer’s build or release path before signing. A trusted vendor, valid certificate, and normal update mechanism do not prove the code was benign. Supply-chain security needs evidence about source, build environment, release identity, artifact digest, deployment scope, and runtime behavior.

An initial software foothold can also become an identity/control-plane incident. Investigate trust relationships downstream, including privileged credentials, federation, cloud tenants, and monitoring systems.

## Supplied names explained

- **SolarWinds Orion compromise** refers here to the 2020 SUNBURST supply-chain incident and selected follow-on operations described in the cited official guidance.

## Incident at a high level

Attackers compromised systems involved in SolarWinds’ development/build environment and introduced SUNBURST into certain Orion updates. The updates were digitally signed and delivered through normal channels. Installed malware used delayed and selective activation to contact attacker infrastructure. In some environments, operators then pursued credentials, lateral movement, and federated identity/SAML signing material to access cloud services.

The U.S. government publicly attributed the activity to Russia’s Foreign Intelligence Service in April 2021. That attribution is a government assessment; distinguish it from the technical findings. Impact varied by victim. Installation of an affected update does not establish compromise of every connected cloud service.

## Attack chain and trust boundaries

1. **Producer compromise:** systems involved in development, build, or release were accessed. A producer control-plane compromise can affect many customers.
2. **Malicious build output:** SUNBURST entered Orion updates. A code-signing certificate authenticated the package under SolarWinds’ key but did not reveal the compromised build process.
3. **Trusted distribution:** customers installed through their normal update mechanism; their trust decision was abused.
4. **Selective execution and command-and-control:** affected installations could communicate with attacker infrastructure after delay and filtering. Version presence or one network event alone does not prove identical activity on every host.
5. **Follow-on operations:** in some victims, the actor moved into identity systems, credentials, and cloud environments. Forged SAML tokens could look like valid assertions and bypass controls that trusted the compromised signing material.

The chain crosses vendor CI/signing, customer inventory, endpoints, identity provider, cloud control plane, and incident communications.

## Investigation and response

CISA’s response guidance for organizations with evidence of follow-on activity called for an organized and potentially disruptive eviction process and out-of-band communications. A general response sequence is:

1. **Establish scope:** inventory Orion versions/update history, identify networks sharing trust or credentials, and check applicable vendor/CISA guidance. Do not infer no exposure from one missing indicator.
2. **Preserve evidence:** collect endpoint, network, identity, cloud, and update/build logs. If communications or identity may be compromised, coordinate through an independent channel.
3. **Investigate beyond the first host:** examine lateral movement, service accounts, AD FS/federation, SAML signing keys, cloud apps, OAuth consent, mail rules, and privileged sessions as indicated by authoritative guidance.
4. **Contain carefully:** isolate affected systems and restrict compromised trust paths while preserving evidence and recovery dependencies.
5. **Evict and rebuild:** where compromise is established, rebuild from known-good media as needed. Removing an update cannot remove persistence or repair stolen identity material.
6. **Rotate secrets in sequence:** from clean administrative systems, rotate credentials, certificates, and tokens in an order that prevents still-valid trust from enabling re-entry. Password resets alone are inadequate if federation keys or privileged sessions remain active.
7. **Validate recovery:** monitor for renewed activity, verify federation and cloud audit trails, restore least privilege, and record the evidence supporting closure.

Historical CISA documents were written for specific agencies and threats. Do not mechanically treat legacy operational steps as universal current directions; check current advisories and local dependencies.

## Design and prevention lessons

- **Isolate build infrastructure:** separate source control, workers, signing service, and release approval; use ephemeral workers, least privilege, strong authentication, and control-plane monitoring.
- **Bind evidence to artifacts:** provenance should identify output digests, source revisions, build definition, dependencies, and builder. Consumers must check these claims under policy.
- **Use independent review/reproducibility where feasible:** these can reveal anomalies but require controlled inputs and do not prove benign intent.
- **Constrain update trust:** stage high-impact updates, canary, observe behavior, retain rollback/recovery paths, and inventory supplier components. A signature supports integrity but is insufficient for safety.
- **Protect federation and signing keys:** harden identity systems, monitor key use, plan controlled revocation/rollover, and correlate sign-in with cloud API events.
- **Segment management planes:** monitoring, patching, backup, identity, and production should not share unrestricted credentials/network access.
- **Plan for supplier compromise:** contracts and questionnaires help but do not replace technical evidence, incident notification paths, and rehearsed customer response.

## Cross-item comparison

SolarWinds and XZ both show that trusted software distribution can carry harmful code. SolarWinds involved a vendor development/build/release compromise and signed product update; XZ involved maintainer compromise and concealed release/build mechanisms in an open-source dependency. Their mechanisms and impact conditions differ.

SLSA provenance can make asserted source, process, and builder inspectable and policy-checkable. It cannot stop an intentionally malicious producer, guarantee every input is captured, or replace independent monitoring and source review. Consumers must decide which builders and producers to trust.

## Common mistakes

- Treating a valid vendor signature as proof that the update was benign.
- Assuming every recipient of an affected update was fully compromised.
- Treating absence of one indicator as proof of no exposure despite selective activity or log gaps.
- Removing Orion and declaring the identity/cloud environment clean without investigating follow-on access.
- Treating MFA as a complete defense against forged assertions or stolen signing material.
- Rotating passwords but leaving federation keys, service principals, or sessions active.
- Using a potentially compromised management plane as the only communications/evidence path.
- Applying historical response plans without checking current advice and recovery dependencies.

## Knowledge checks with answers

1. **What did the signed update prove?** It was signed under a trusted vendor certificate; this did not prove the producer build environment was uncompromised.
2. **Does installation equal exploitation?** No. It establishes potential exposure; follow-on activity needs system, network, identity, and cloud evidence.
3. **Why investigate SAML/federation after endpoint infection?** A compromised signing system can let attackers mint or misuse trusted assertions and extend access to cloud services.
4. **Why may uninstalling Orion be insufficient?** Persistence, stolen credentials, or connected identity/control-plane compromise can survive removal.
5. **What evidence improves future release trust?** Provenance bound to exact digests, protected build/signing systems, independent build checks where feasible, and deployment/runtime monitoring.

## Examples

An organization confirms an affected update was installed but has no evidence yet of follow-on access. It records “potentially exposed,” scopes the systems and shared identity trust, gathers independent endpoint/network/cloud evidence, and only then distinguishes a package exposure from execution or identity compromise.

## Practice exercise

Draw the trust path for an auto-updated agent: source, builder, signer, distribution, customer deployment, and identity/control plane. For each boundary name one evidence source and containment action. Distinguish “package present,” “malware executed,” and “identity compromise” as separate findings.
