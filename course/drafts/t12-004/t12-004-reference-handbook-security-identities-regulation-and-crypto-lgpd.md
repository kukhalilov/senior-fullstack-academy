# architecture patterns multi-region tenancy and reliability — Reference: LGPD

Sources: [Consolidated Brazilian LGPD text, Law No. 13,709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), [ANPD current LGPD and institutional information](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-versoes-traduzidas-para-outros-idiomas-dos-decretos-no-12-975-e-no-12-976-e-da-lgpd-atualizada), [ANPD breach-notification guidance](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis), [ANPD Resolution CD/ANPD No. 15/2024, incident rules](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca), [ANPD Resolution CD/ANPD No. 19/2024, international transfer rules](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024), [ANPD international-transfer guidance](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados), [ANPD LGPD legislation index](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/legislacao).

## Scope and version

This is an engineering-oriented overview of Brazil’s Lei Geral de Proteção de Dados Pessoais (LGPD), Law No. 13,709/2018, with amendments and ANPD regulations checked 20 November 2026. The English translation is helpful but the Portuguese official text and current ANPD regulations control. Applicability, exceptions, sectoral rules, and interpretations depend on facts; use this lesson to plan technical controls and questions for qualified Brazilian counsel.

## How this group fits the mental model

The LGPD asks organizations to identify personal-data processing, justify its purpose and legal basis, respect data-subject rights, apply safeguards, govern processors, control international transfers, and demonstrate accountable treatment. The engineering challenge is to make those choices visible across collection points, vendors, derived copies, logs, backups, and model pipelines. A privacy notice cannot compensate for a system that uses data for an undisclosed purpose.

## Supplied names explained

- **LGPD** — Brazil’s General Personal Data Protection Law. It applies to processing carried out in Brazil; processing aimed at offering or supplying goods/services to, or processing data of, individuals located in Brazil; and personal data collected in Brazil, subject to statutory exclusions. Nationality or database location alone does not decide scope.

## Roles and principles

Personal data relates to an identified or identifiable natural person. **Sensitive personal data** includes racial/ethnic origin, religious belief, political opinion, union or religious/philosophical/political affiliation, health or sex-life data, genetic data, and biometric data when linked to a natural person. An **anonymized** dataset is outside the definition only when the person cannot be identified using reasonable technical means available at processing time; pseudonymization by itself does not anonymize.

The **controller** makes decisions about processing purposes and means; the **operator** processes on the controller’s behalf; the **data protection officer/encarregado** is the communication channel among controller, data subjects, and ANPD, subject to current supplementary rules and exemptions. Roles follow actual activity, not contract headings.

Article 6 principles include purpose, adequacy, necessity, free access, data quality, transparency, security, prevention, non-discrimination, and accountability. Translate them into collection minimization, purpose tags, correction workflows, retention, access logging, secure defaults, and evidence of controls.

## Legal bases and special data

For ordinary personal data, the LGPD has ten bases: consent; compliance with a legal or regulatory obligation; public-administration processing and sharing needed to execute public policies; research by a research body with safeguards; performance of a contract or preliminary procedures requested by the data subject; exercise of rights in judicial, administrative, or arbitral proceedings; protection of life or physical safety; health protection in specified health-professional/service contexts; legitimate interests; and credit protection. Select a basis per purpose; do not use “legitimate interest” as a universal fallback. Legitimate interest requires a concrete legitimate purpose and respect for the data subject’s fundamental rights and freedoms.

Sensitive-data processing uses a separate, narrower set of bases. These include specific and highlighted consent for specific purposes or defined non-consent cases, such as legal obligations, public administration, research with safeguards, exercise of rights, life/safety, health protection, and fraud/security measures under statutory limits. A general ordinary-data basis cannot simply be reused for sensitive data.

When relying on consent, make it demonstrable, informed, specific, and distinguishable from unrelated terms. Revocation must be facilitated and free. If purpose changes incompatibly, communicate it and obtain new consent where consent is the basis. A legal basis, notice, purpose, and actual product behavior must agree.

## Rights, automated decisions, and incident response

Data subjects have rights to confirmation of processing; access; correction of incomplete, inaccurate, or outdated data; anonymization, blocking, or deletion of unnecessary/excessive or noncompliant data; portability subject to ANPD regulation and trade/industrial secrets; deletion of data processed on consent subject to legal-retention exceptions; information about public/private entities with which data was shared; information about the possibility of denying consent and its consequences; and revocation of consent. A request process must authenticate proportionately, locate data, apply exceptions, coordinate processors, and communicate clearly.

Article 20 provides for review of decisions made solely on automated processing that affect a person’s interests, including decisions defining personal, professional, consumer, or credit profile. The controller must provide clear and adequate information on criteria and procedures, subject to trade and industrial secrets. Review does not necessarily require a human reviewer in every case; implement the exact statutory and current ANPD interpretation.

Controllers must notify ANPD and affected data subjects of a security incident that may result in relevant risk or damage. Under ANPD Resolution 15/2024, the usual deadline is three business days from the controller’s knowledge, unless a specific law supplies another deadline; ANPD guidance permits staged communications when all information is not yet available under the regulation’s conditions. Classify whether personal data was affected and the risk threshold, record when the controller became aware, and preserve the basis for the notification decision.

## Transfers, vendors, and impact assessment

International transfers require a statutory mechanism, such as transfer to a country or organization recognized as providing an adequate level of protection, appropriate safeguards (including ANPD standard contractual clauses, approved specific clauses, or global corporate rules), or a specified statutory circumstance. Resolution 19/2024 establishes procedures and standard clauses. A cloud region or vendor DPA alone does not establish a valid transfer mechanism. Check the actual exporter/importer roles, support access, subprocessors, and data flow.

Controllers and operators maintain processing records as required. ANPD may require a data-protection impact report; the report describes processing, data types, methodology/security, safeguards, and risk mitigation. Controllers must appoint and disclose a DPO/encarregado under Article 41, subject to ANPD rules that may waive appointment for certain agents. A report or officer does not replace the underlying controls.

ANPD has regulatory and supervisory powers and can impose statutory sanctions. The law includes warnings, fines and other measures; maximum fine amounts are not automatic outcomes and depend on statutory factors and procedure. The ANPD became an autonomous regulatory agency through later legislation; check the current institutional and procedural rules rather than relying on old descriptions of its administrative status.

## Engineering implementation

1. Maintain a data map linking fields and derived records to purpose, legal basis, sensitivity, controller/operator, location, retention, recipients, and rights workflow.
2. Keep consent evidence per purpose and notice version, and make revocation propagate to collection, downstream jobs, and future exports.
3. Implement confirmation/access/correction/deletion/portability requests with status tracking, reasonable verification, statutory exceptions, processor coordination, and audit evidence.
4. Separate ordinary and sensitive-data permissions and legal bases. Enforce purpose at service boundaries, not only in UI text.
5. Apply retention schedules to operational databases, logs, data lakes, search indexes, backups, and processors; design recovery so a restored copy does not silently resurrect erased data.
6. Keep a transfer register for exporters/importers, destinations, mechanism, onward transfers, and contracts. Reassess when a cloud or vendor changes subprocessors or support regions.
7. Make incident-response playbooks capture detection time, affected data, risk assessment, communications, evidence, and any staged follow-up required by Resolution 15/2024.
8. Provide a human-readable route to the encarregado and avoid exposing personal data through support/admin tooling.

## Examples

### Worked example

A Brazilian health platform collects patient information, sends security logs to a cloud provider, and produces aggregate service analytics. The team separates health data from ordinary identifiers, records an Article 11 basis for health information and an Article 7 basis for each other use, and avoids treating “consent” as a blanket basis for everything. Processor instructions, access boundaries, retention, transfer mechanism, and security controls are documented. A correction request updates the clinical source and downstream systems where required, while immutable audit records retain only what the legal and safety purpose permits. If an incident exposes health data and may create relevant risk or damage, the controller uses the three-business-day ANPD rule and staged communication process where conditions apply.

## Cross-item comparison

LGPD has ten ordinary-data bases and a distinct sensitive-data list; GDPR has six Article 6 bases and a separate Article 9 condition; CCPA/CPRA emphasizes notice, access/deletion/correction, sale/sharing opt-out, and limits on sensitive-information use; DPDP uses consent and specified legitimate uses with phased commencement. Terms such as “controller,” “processor,” “consent,” and “sensitive” overlap but do not have identical effects. Use separate jurisdictional policy rules over shared technical capabilities.

## Common mistakes

- Applying the ordinary-data legal bases to sensitive data without checking Article 11.
- Assuming consent is always required or that consent covers every later purpose.
- Treating anonymization and pseudonymization as the same.
- Ignoring correction, portability, sharing disclosure, and automated-decision review rights.
- Treating a vendor contract or data center location as a complete transfer assessment.
- Reporting every security event as a personal-data breach or missing the three-business-day period for a reportable incident.
- Assuming the English translation alone captures later amendments and ANPD regulations.
- Reading the statutory maximum fine as the amount automatically imposed for an incident.

## Knowledge checks with answers

1. **Does the LGPD have only a consent basis?** No. It has ten ordinary-data bases and a distinct list for sensitive data.
2. **Is a hashed customer ID anonymous?** Not automatically. If it can reasonably be linked back to a person, it remains personal data.
3. **What is the usual ANPD incident-notification period under Resolution 15/2024?** Three business days from controller awareness for an incident that may create relevant risk or damage, subject to specific-law deadlines and the regulation’s conditions.
4. **Can any EU-style SCC be used for an LGPD transfer?** Do not assume so; use the ANPD-approved mechanism or another valid mechanism under the current Regulation 19/2024 and verify approval requirements.
5. **Does an operator contract make the controller’s compliance duties disappear?** No. The controller remains responsible for the processing it determines and must govern its operators.
