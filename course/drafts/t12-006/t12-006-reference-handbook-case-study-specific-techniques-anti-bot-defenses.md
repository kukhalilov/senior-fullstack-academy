# end-to-end system design case studies — Reference: Anti-bot defenses

Sources: [HLD Handbook](https://hld.handbook.academy/), [OWASP Bot Management and Anti-Automation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Bot_Management_and_Anti-Automation_Cheat_Sheet.html), [OWASP Automated Threats handbook](https://wiki.owasp.org/images/3/33/Automated-threat-handbook.pdf), [Cloudflare bot-score concepts](https://developers.cloudflare.com/bots/concepts/bot-score/).

## Scope and version

This is a defensive design lesson for reducing abusive automation while keeping legitimate users able to use the product. It is vendor-neutral; Cloudflare is cited for an example of product-specific bot scoring behavior, not as a universal bot-detection guarantee. Signals, privacy requirements, and laws vary by jurisdiction and product, so collect only justified data and check current applicable requirements.

## How this group fits the mental model

Automation is not inherently malicious: search crawlers, accessibility tools, integrations, and testing clients may be legitimate. The goal is to reduce harmful outcomes such as credential stuffing, inventory hoarding, spam, scraping, fake signups, or costly endpoint abuse while preserving normal workflows. A bot score or a successful CAPTCHA cannot prove intent by itself. A layered, risk-based response lets the system use weak signals to observe and stronger evidence to restrict high-impact actions.

Start with protected assets and abuse cases. “Stop bots” is not a testable goal. Specify which actions create harm, what legitimate automation must continue, acceptable friction and false-positive rates, and how a user can recover from an incorrect block.

## Supplied names explained

- **Edge signals and controls:** coarse network-level signals such as request volume, reputation, protocol characteristics, or known automation; useful early in the request path but often shared by many real users behind a proxy or NAT.
- **Application/session signals:** request sequence, session age, identity, endpoint-specific velocity, and behavior tied to a logged-in account. These offer context but can be evaded and require privacy-aware handling.
- **Business-level controls:** rules around the protected operation, such as per-account purchase limits, signup verification, transaction anomaly review, or a waiting room for scarce inventory. These can directly protect the business invariant.
- **Rate limiting and quotas:** caps on work by dimensions such as IP, account, session, endpoint, tenant, device, or payment instrument. Each key addresses different abuse patterns; a single IP limit can punish shared networks and miss distributed attacks.
- **Challenge / step-up verification:** additional proof such as CAPTCHA or MFA for a suspicious or sensitive action. Challenges create accessibility and conversion costs and can be solved or outsourced by attackers.
- **False positive / false negative:** legitimate activity incorrectly restricted / abusive activity allowed. Measure both because optimizing only for blocks can harm users and only for frictionless access can leave the asset exposed.

## Cross-item comparison

| Control | Best role | Limitations and care |
| --- | --- | --- |
| IP or network rate limit | Cheap first-line burst control | Distributed residential proxies evade it; corporate, school, mobile carrier, or household users may share an address |
| Identity/account limits | Protect login, signup, checkout, and scarce resources across changing IPs | Attackers can create accounts; lockouts can be abused to deny service to a victim; avoid revealing whether an account exists |
| Behavioral or reputation score | Combine signals and choose proportionate action | Scores are probabilistic, can be biased or stale, and can produce false positives; provide review and feedback mechanisms |
| CAPTCHA or step-up check | Add friction for selected high-risk actions | Not proof of humanity; can block users with disabilities or poor connectivity and can be solved/outsourced |
| Business invariant enforcement | Prevent a concrete harmful outcome, such as exceeding a purchase allocation | Must be correct, race-safe, and enforced at the data/service owner; edge decisions alone are insufficient |
| Manual review or queue | Handle uncertain high-impact cases and controlled demand | Adds latency and staffing cost; define priority, appeal, retention, and release policies |

## Examples

### Credential stuffing against login

An attacker tries many password pairs, perhaps one attempt per username from many addresses. Apply separate controls per account/username and per network/source dimensions rather than one bucket keyed only by the exact IP-plus-username pair. Avoid permanent account lockout that lets an attacker deny access to victims. Use generic responses that do not reveal account existence, monitor unusual failure patterns, and step up verification based on risk. Protect reset and MFA recovery flows as carefully as login.

### Scarce-ticket sale

Before adding a CAPTCHA to every page, protect the actual scarce resource: use a controlled waiting room or admission token, enforce purchase limits atomically at the service/database, bind a reservation to the intended identity/session, expire holds, and monitor resale/abuse signals. A challenge can be one signal, but a solved challenge must not bypass inventory limits or transactional correctness.

### Graduated response

For uncertain low-risk traffic, observe and rate-limit gently. Increase friction for suspicious attempts at sensitive endpoints. Restrict the specific high-risk action when confidence is higher, while preserving safe browsing and an appeal path. Confirmed abuse may justify account or transaction review. Record the reason and signals for each decision, minimize sensitive raw-data retention, and audit for legitimate-user impact.

## Common mistakes

- Treating every automated client as hostile or every browser as human.
- Relying on one fingerprint, IP address, CAPTCHA, or machine-learning score as proof.
- Applying only per-IP limits, missing distributed abuse or harming users behind shared networks.
- Using a combined IP-and-account key that lets an attacker distribute attempts across many accounts without tripping either independent limit.
- Locking accounts in a way that enables denial of service or reveals valid usernames.
- Enforcing scarce-resource rules only at the edge, where races or alternate request paths can bypass them.
- Blocking all suspicious activity immediately instead of using proportionate friction and monitoring false positives.
- Storing fingerprints, identifiers, or request bodies indefinitely without a purpose, access controls, and retention policy.
- Offering inaccessible challenges with no alternative or support path.
- Failing to review outcome metrics after a bot-defense policy changes.

## Knowledge checks with answers

1. **A CAPTCHA was solved. Can the request safely buy unlimited tickets?** No. It only adds one signal or challenge; the service still needs identity, purchase-limit, reservation, and inventory invariants.
2. **Why use separate per-account and per-source login limits?** One limits attempts targeting a victim account across many sources; the other constrains one source attacking many accounts. Separate buckets address distinct attack shapes.
3. **A corporate proxy produces a suspicious IP reputation signal. Should all users behind it be blocked?** Not automatically. Combine context, select a proportionate action, measure impact, and provide a recovery path for legitimate users.
4. **Which outcomes should be measured?** Abuse prevented, false-positive and appeal rates, conversion/abandonment, challenge completion/accessibility impact, backend cost, and the distribution of outcomes across user groups where appropriate and lawful.

## Review status

Layering, risk-based responses, and rate-limit dimensions are checked against OWASP guidance. The vendor-specific score caveat is checked against Cloudflare’s documentation. The lesson remains pending complete claim-by-claim audit and inventory omission check.
