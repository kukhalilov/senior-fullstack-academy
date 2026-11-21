# architecture patterns multi-region tenancy and reliability — Reference: California Consumer Privacy Act (CCPA/CPRA)

Sources: [CCPA regulations effective 1 January 2026](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf), [CPPA current monetary thresholds](https://cppa.ca.gov/regulations/cpi_adjustment.html), [CPPA completed CCPA updates, cybersecurity, risk, and ADMT regulations](https://cppa.ca.gov/regulations/ccpa_updates.html), [CPPA compliance deadlines for the 2025 regulations](https://cppa.ca.gov/announcements/2025/20250923.html), [CPPA consumer FAQ](https://cppa.ca.gov/faq.html), [California Civil Code, CCPA](https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&chapter=1.&part=4.&lawCode=CIV&title=1.81.5).

## Scope and version

This lesson covers California’s CCPA as amended by the California Privacy Rights Act (CPRA), with regulations effective 1 January 2026 and the CPPA’s current threshold page checked on 20 November 2026. The Act and regulations change, and applicability depends on facts and current thresholds. This is a software-engineering guide, not a legal determination for a particular organization.

## How this group fits the mental model

The CCPA/CPRA makes businesses disclose personal-information practices and honor defined consumer controls. An implementation must connect a consumer’s identity and request to the records, uses, disclosures, vendors, and derived copies affected by that request. A “Do not sell” link that stops only one web tag while backend sharing continues is not an end-to-end control.

## Supplied names explained

- **California Consumer Privacy Act (CCPA/CPRA)** — California’s consumer-privacy statute, originally enacted in 2018 and substantially amended by the CPRA approved by voters in 2020. CPRA amended the CCPA and created the California Privacy Protection Agency (CPPA); the law is commonly referred to as CCPA.

## Applicability and actors

The law generally applies to a for-profit business that does business in California, determines purposes and means of processing consumers’ personal information, and meets a statutory threshold, including annual gross revenue above the CPI-adjusted amount, buying/selling/sharing personal information of at least 100,000 California consumers or households, or deriving at least half of annual revenue from selling or sharing consumers’ personal information. Common-control/branding and statutory exclusions also matter. As of 20 November 2026, CPPA’s posted CPI-adjusted revenue threshold is **$26,625,000**, effective 1 January 2025. Recheck the CPPA page for the threshold applicable to the processing year; it is adjusted every odd-numbered year.

The statute distinguishes a **business**, **service provider**, **contractor**, and **third party**. These labels have contractual and behavioral requirements. A vendor does not become a service provider just because a contract says so if it uses the information outside the permitted service purpose. A covered business may have duties even when a data-processing vendor performs the technical work.

“Consumer” means a natural person who is a California resident, including in employment and business-to-business contexts; the former temporary employee and B2B exemptions expired. Personal information is broadly defined and includes identifiers, inferences, and information reasonably linked to a consumer or household. Deidentified or aggregate data receives different treatment only if statutory conditions and safeguards are satisfied.

## Rights and notices

Subject to scope and exceptions, California consumers can request to know/access specified personal information and its sources/uses/disclosures; delete information collected from them; correct inaccurate information; opt out of sale or sharing; limit certain uses/disclosures of sensitive personal information; and avoid unlawful discrimination for exercising rights. “Sale” is not limited to cash consideration, and “sharing” includes specified disclosures for cross-context behavioral advertising. The definitions and exceptions must be analyzed against the actual data flow.

The 2026 regulations also implement rights and notices for certain **automated decisionmaking technology (ADMT)** used for significant decisions, with access and opt-out rights subject to the detailed definitions, exceptions, and deadlines. The regulated definition is not simply “any algorithm”: it concerns technology processing personal information to replace or substantially replace human decision-making, and significant-decision categories and exceptions are defined in the regulations.

Businesses provide privacy policies and notices at or before collection, explain purposes and retention criteria, describe relevant sale/sharing and rights, and make request methods usable and non-discriminatory. A consumer request often requires verification; authorized-agent workflows and opt-out preference signals have specific treatment. The request process generally must be easy to use, and an opt-out path cannot be intentionally more burdensome than an opt-in path. Applicable response deadlines and extension rules are in the current statute and regulations; implement a tracked service-level deadline instead of hard-coding an old summary from a blog.

Sensitive personal information receives specific rights and use limits. The right to limit is not a blanket ban on all processing: the law and regulations identify permitted purposes and exceptions. Check the categories and permitted use before suppressing or retaining a data flow.

## Vendor contracts, security, and enforcement

Contracts with service providers and contractors must restrict use to specified business purposes and include required protections; contracts with third parties also carry defined terms. Map data transfers and enforce the contract in systems—for example, do not let a vendor use an opt-out consumer’s data for a disallowed purpose. A contract cannot repair a data architecture that continues prohibited sharing.

The CCPA requires reasonable security procedures and practices appropriate to the nature of personal information. The private right of action is limited, principally to certain security breaches involving specified personal information where statutory conditions are met; it is not a general private lawsuit for every CCPA violation. CPPA and the California Attorney General have enforcement roles, and the CPPA has rulemaking and administrative enforcement authority. Exact remedies and exceptions are in current law.

## New rules in force and phased dates

The CPPA’s 2025 rulemaking package became effective on 1 January 2026. It updates existing regulations and establishes duties for certain businesses involving cybersecurity audits, privacy risk assessments, and ADMT. “Effective” does not mean every related compliance deadline arrived at once:

- Required risk assessments begin for covered processing on 1 January 2026; related submission/attestation milestones are phased, including an initial 1 April 2028 date described by the CPPA.
- Certain cybersecurity-audit certifications are phased by revenue cohort, with first deadlines on 1 April 2028, 1 April 2029, or 1 April 2030 under the CPPA announcement and regulation text.
- ADMT requirements for covered significant decisions begin 1 January 2027. A system already in use before that date must be compliant no later than then.

Use the final regulation text for the exact business cohort, processing activity, contents, retention, and submission requirement. The CPPA’s page distinguishes final regulations from proposed rulemaking; do not implement proposed rules as if already effective.

## Engineering implementation

1. **Build a data inventory.** Record collection point, purpose, category, source, recipient, retention, sale/sharing classification, sensitive category, and vendor role. Include SDKs, pixels, ad-tech, support exports, data lakes, backups, and model-training pipelines.
2. **Implement rights centrally.** Accept authenticated requests through approved channels; verify proportionately; route them to systems of record and vendors; record exceptions and completion; and avoid exposing another consumer’s data.
3. **Propagate choices.** Model sale/sharing opt-out and sensitive-information limits as durable policy signals. Send them to downstream processors and apply them to new events, audience exports, cached segments, and model/analytics uses where required.
4. **Honor global opt-out signals.** Detect and process recognized opt-out preference signals under the regulations. Keep the resulting preference scoped and durable according to current requirements.
5. **Design deletion/correction with exceptions.** Preserve data only when an applicable exception or other legal duty supports retention; separate a legal hold from ordinary business use. Prevent deleted or opted-out records from re-entering through batch imports.
6. **Govern vendors.** Track contract role, permitted purposes, onward sharing, deletion/return, and audit assistance. Reassess the role when a vendor’s product or data use changes.
7. **Assess ADMT and risk activities.** Identify decisions affecting employment, housing, finance, education, healthcare, or other significant areas; inventory inputs and outputs; determine whether the final rule’s definitions apply; and retain the required risk-assessment and audit evidence.
8. **Test request journeys.** Test account and non-account holders, authorized agents, opt-out signal behavior, identity verification, extension notice, vendor confirmation, partial failures, and backup/reingestion cases.

## Examples

### Worked example

A retailer uses a website analytics SDK, a customer data platform, and an ad network. The team classifies data and each vendor’s statutory role, updates the notice at collection, and determines whether transfers meet “sale” or “sharing” definitions. When a consumer opts out, the preference is recorded against the verified subject or browser signal, forwarded to the platform and ad network, excluded from future audience exports, and preserved through cache refreshes. The business still processes information needed for a purchase or legal record where the law permits it, but does not repurpose that exception to continue behavioral advertising. Logs show the request’s propagation without copying unnecessary sensitive data into audit trails.

## Cross-item comparison

Unlike GDPR, CCPA/CPRA does not use the same six lawful-basis structure. Its sale/sharing opt-outs and sensitive-information limitations are central engineering controls; GDPR instead has a general lawful-basis model and rights such as objection and portability under defined conditions. DPDP uses Indian statutory consent and “certain legitimate uses” and phased commencement. LGPD has Brazil-specific lawful bases and ANPD rules. Build jurisdiction-specific decision policies over a common inventory and request engine rather than a single global “consent” boolean.

## Common mistakes

- Assuming CPRA replaced rather than amended the CCPA.
- Using the old $25 million figure without checking the current CPI-adjusted threshold; the posted amount is $26.625 million effective 2025.
- Treating “sale” as only selling for cash or ignoring “sharing” for cross-context behavioral advertising.
- Assuming employment or B2B information remains under the expired temporary exemptions.
- Making opt-out effective in the browser UI while backend exports or vendors continue the same use.
- Treating deletion, correction, or sensitive-information limits as absolute without checking statutory exceptions and permitted purposes.
- Treating every automated decision or model as regulated ADMT without checking the current definition and significant-decision scope.
- Confusing the regulation’s January 2026 effective date with phased 2027–2030 compliance deadlines.
- Treating a private right of action as available for every CCPA violation.

## Knowledge checks with answers

1. **What is the current posted revenue threshold?** $26,625,000 effective 1 January 2025; the CPPA adjusts it every odd-numbered year, so check again for later periods.
2. **Can “sharing” occur without a cash sale?** Yes. The statutory concept includes specified disclosures for cross-context behavioral advertising.
3. **Does a consumer’s opt-out mean all processing must stop?** No. It applies to defined sale/sharing, while other processing may continue if lawful and consistent with disclosures and exceptions.
4. **Are all 2025 regulation duties due on 1 January 2026?** No. The package became effective then, but audit, risk-assessment reporting, and ADMT deadlines are phased.
5. **Is every algorithm a covered ADMT?** No. Apply the regulation’s decision-replacement and significant-decision definitions, plus exceptions.
