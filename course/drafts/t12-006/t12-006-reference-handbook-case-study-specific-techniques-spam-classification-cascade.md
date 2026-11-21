# end-to-end system design case studies — Reference: Spam classification cascade

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google Research: The War Against Spam](https://research.google.com/pubs/archive/36954.pdf), [OWASP Bot Management and Anti-Automation](https://cheatsheetseries.owasp.org/cheatsheets/Bot_Management_and_Anti-Automation_Cheat_Sheet.html), [NIST AI Risk Management Framework characteristics](https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/), [NIST AI RMF 1.0](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=936225), [Google Postmaster compliance signals](https://developers.google.com/workspace/gmail/postmaster/reference/rest/v2/domains/getComplianceStatus).

## Scope and version

This case study designs an inbound user-generated message/email abuse classifier that decides whether to deliver, label, quarantine, rate-limit, or reject content. It covers a cascade of increasingly expensive checks rather than one universal model. Spam is a product and policy category; phishing, malware, bulk mail, abuse, and unwanted but legitimate messages can require different outcomes. Google Research and OWASP/NIST materials were checked on 2026-11-21. Google Postmaster tools concern outbound sender reputation and are not a substitute for an inbound classifier.

## How this group fits the mental model

The goal is to prevent harmful or unwanted content from reaching users while keeping wanted content available. A false negative lets abuse through; a false positive hides a legitimate message and can be costly or unsafe. Therefore the system should not reduce classification to a single accuracy score or a hard spam/not-spam bit. Define categories, confidence, action severity, reversibility, user appeal, and feedback.

A cascade evaluates cheap and reliable signals first, then calls more expensive analysis only for ambiguous cases. It can combine protocol/authentication checks, sender and URL reputation, deterministic policy rules, lightweight text features, machine-learning classification, content/attachment scanning, and human review. The order is workload-dependent: a cheap hard reject can save model cost, but a stale denylist should not overrule stronger trusted context without policy justification.

## Supplied names explained

- **Message normalization:** parse headers and MIME parts safely, canonicalize URLs/domains, extract text and attachment metadata, and preserve original bytes for later review. Parsing must be bounded against malformed or oversized input.
- **Authentication/provenance signals:** SPF, DKIM, DMARC alignment, sender history, domain age/reputation, and transport metadata can contribute evidence. Authentication can show control of a domain/key, not that the content is benign.
- **Reputation and rules:** known malicious hashes/domains, allowlists, blocklists, rate signals, and business policy. Lists need provenance, expiry, tenant scope, and override/audit controls; attackers adapt and legitimate senders can share infrastructure.
- **Cheap deterministic filters:** size/format limits, known malware hash matches, invalid policy conditions, duplicate bursts, or obvious abuse patterns. These should be high precision when they cause irreversible rejection.
- **Content classifier:** rules, Bayesian/logistic models, gradient-boosted models, neural text models, or multimodal models can score message text, URLs, sender features, and history. Scores are estimates that depend on training data, labels, feature quality, and distribution drift.
- **Cascade/early exit:** a sequence of stages that can produce a high-confidence action early or send ambiguous cases to a more expensive stage. Every stage needs a timeout, failure policy, telemetry, and calibrated thresholds.
- **Confidence bands and action policy:** map model scores to deliver, warn, spam folder, quarantine, throttle, reject, or human review. The thresholds should reflect action costs and reversibility, not simply maximize aggregate accuracy.
- **Feedback labels:** user “not spam,” “report spam,” moderator disposition, and confirmed abuse. Labels are delayed and biased by exposure and user behavior; avoid treating every unreported message as negative or blindly training on adversarial submissions.
- **Human review and appeal:** reserve for uncertain or high-impact cases, with reviewer context, audit trails, safe access to attachments, service-level objectives, and a path for users to recover wrongly held messages.
- **Model monitoring:** track precision/recall by category and cohort, false-positive rate, appeal overturns, drift, calibration, latency, cost, and abuse success. Google Postmaster's user-reported spam-rate status is an example of sender feedback, not a universal quality threshold for all classification systems.

## Architecture and decision flow

1. **Ingest and protect.** Authenticate the submitting principal where applicable, enforce message size/part limits, assign an immutable message ID, and store the original in quarantine/object storage with malware-safe access controls. Apply abuse rate limits before expensive processing.
2. **Parse and normalize.** Safely parse MIME, decode bodies, extract URLs and attachment hashes, and record parser errors. Keep extracted features versioned and provenance-linked; don't silently discard data needed to explain a later decision.
3. **Apply high-confidence checks.** Reject malformed protocol/policy violations or confirmed malicious payloads according to a published policy. Apply reputation and authentication evidence as features, not as proof of message intent. Respect trusted sender/account context without granting broad allowlist bypasses.
4. **Score uncertain messages.** Run low-cost rules or a compact classifier first. For the remaining ambiguous set, run richer text, URL, image/OCR, or attachment analysis as relevant. Stop when the confidence/action rule is met; set strict deadlines so a slow model does not hold all mail indefinitely.
5. **Choose a proportionate action.** Deliver ordinary low-risk mail, label or divert likely spam, quarantine uncertain/higher-risk messages, and hard-reject only when policy and evidence justify an irreversible action. For high-impact account or financial actions, use separate step-up controls rather than trusting a content score alone.
6. **Record explanation and provenance.** Store the policy/model version, key signal categories, score band, action, and relevant thresholds. Restrict access to message content and keep retention proportional to appeal, safety, and legal needs.
7. **Collect feedback safely.** Record user appeals, moderator labels, and confirmed outcomes as separate label sources. Deduplicate, prevent feedback poisoning, account for exposure/selection bias, and retrain with temporal holdouts and adversarial evaluation.
8. **Monitor and roll back.** Evaluate offline precision/recall and high-cost false positives, then shadow or canary a new model. Monitor live action rates, cohort disparities, quarantine release, user appeals, latency and cost. Keep a tested rule/model rollback and an operational fallback if an upstream classifier is unavailable.

## Cross-item comparison

| Stage | Strength | Failure or limitation |
| --- | --- | --- |
| Protocol and deterministic policy checks | Fast, explainable, effective for known violations | Brittle against novel or obfuscated abuse; rules can overblock shared infrastructure |
| Reputation and history | Uses accumulated sender/content evidence | Cold start, poisoning, shared IP/domain collateral damage, stale reputation |
| Lightweight statistical classifier | Low latency/cost; can process broad traffic | May miss context, drift, and adversarial changes; score needs calibration |
| Deep or multimodal model | Handles richer semantic, image, or attachment patterns | Higher cost/latency, opaque errors, privacy and prompt/adversarial risks |
| Quarantine and human review | Reversible path for uncertain/high-impact cases | Delays delivery, staffing cost, reviewer privacy/security burden |
| User feedback | Provides real-world correction and preference signals | Noisy, delayed, selection-biased, and vulnerable to manipulation |

## Examples

### Phishing-like message

The sender passes DKIM, but the body contains an unusual login URL and an attachment with a suspicious hash. Authentication contributes provenance; it does not clear the message. A confirmed malware hash can trigger a high-confidence quarantine/reject action, while a novel URL plus suspicious content may go to a richer classifier and then quarantine with a safe preview. The user can report false positives, and a reviewer can release the message without disabling the sender's broader protection.

### False positive on a shared service

A marketing sender uses a shared sending provider whose IP reputation degrades. Blocking every message from that IP would harm unrelated legitimate senders. Combine domain alignment, account history, content and recipient feedback, then use a graduated action. Monitor legitimate-message appeal and delivery metrics by sender cohort; do not hardcode broad reputation allow/deny decisions without expiry and review.

### Model outage

If the richer classifier times out, do not silently treat unknown as safe or as confirmed spam. Use existing high-confidence signals, deliver or quarantine according to message category and risk policy, mark the degraded decision path, and enqueue eligible content for re-evaluation if safe. Bound reprocessing to avoid duplicate delivery and keep a stable decision/event ID.

## Common mistakes

- Treating SPF/DKIM/DMARC pass as proof that the content is safe or wanted.
- Optimizing accuracy while ignoring false-positive cost, category-specific recall, appeal, and user impact.
- Using one threshold and action for spam, phishing, malware, scams, and benign bulk mail.
- Applying a sender/IP allowlist that bypasses malware or account-safety checks.
- Treating missing feedback as a negative label or user reports as automatically correct ground truth.
- Training on labels without temporal separation, poisoning defenses, or drift checks.
- Letting slow model calls block ingestion without a timeout and explicit degraded-mode policy.
- Deleting held content before an appeal window ends or retaining sensitive content indefinitely without need.
- Failing to record classifier/policy version and signal provenance, making decisions impossible to reproduce.
- Sending a high-impact action solely from an opaque classifier score without review or a reversible path.

## Knowledge checks with answers

1. **A message passes DKIM. Should it be delivered automatically?** No. DKIM authenticates a signing domain under defined conditions; content and other risk signals still need evaluation.
2. **Why use a cascade instead of one large model for every message?** Cheap high-confidence checks can reduce cost and latency; richer analysis can be reserved for ambiguous cases, with explicit deadlines and fallbacks.
3. **What metric matters most for quarantine?** There is no single metric; measure category-specific precision/recall and false-positive cost, appeals, delivery delay, abuse prevented, latency, and cost.
4. **What is the safe action when the final classifier is unavailable?** Follow a defined degraded-mode policy using available evidence, mark the decision uncertain, and choose a reversible outcome where risk warrants; never confuse outage with a confident class.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder content with a content-specific cascade architecture. Google Research supplies an operational spam-filtering context; OWASP supports layered abuse signals; NIST AI RMF grounds performance, false-positive, generalization, monitoring, and human-intervention concerns. Google Postmaster is explicitly scoped to outbound sender compliance/feedback rather than presented as an inbound filter. No material omissions remain in the supplied topic scope.
