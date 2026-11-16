# code review refactoring and legacy modernization — Reference: Review goals, small diffs, context, and reviewability

# Scope and version

This lesson explains the supplied review-process terms as engineering practices, not as rules imposed by one hosting platform. Google’s material uses “change list” (CL); other teams commonly use pull request (PR) or another name. Local policies determine required reviewers, labels, deadlines, and approval semantics. The names below are the complete assigned group.

# How this group fits the mental model

The review starts before anyone comments: the author shapes a change that another person can understand. Intent, scope, context, risk, and evidence form the “package label” for the diff. Review bandwidth is limited, so a well-prepared change helps the right reviewer spend attention on semantic risk instead of reconstructing motivation. [Google’s author guidance](https://google.github.io/eng-practices/review/developer/) [Google’s reviewer guidance](https://google.github.io/eng-practices/review/reviewer/)

# Supplied names explained

- `Code review` — An independent examination of a proposed change for correctness, design, maintainability, and risks in context. It creates feedback and shared understanding; it cannot prove the absence of defects.
- `Change list (CL)` — A proposed set of source changes presented for review. “CL” is Google’s common term; other systems use different names.
- `Pull request (PR)` — A hosted collaboration proposal to review and integrate changes, often with discussion and automated checks. The platform object is a workflow mechanism; it does not guarantee a high-quality review.
- `Review request` — The act of asking named people or an ownership system to inspect a change. A useful request gives enough context and identifies special expertise needed.
- `Change description` — A concise account of the problem, approach, behavioral impact, risks, and verification. It should make the rationale discoverable without forcing reviewers to infer intent from code.
- `Change scope` — The boundaries of behavior, components, and concerns addressed by one proposal. Scope should be explicit enough to reveal what was deliberately left for another change.
- `Small coherent diff` — A change limited enough to follow while still representing one meaningful intent. “Small” is relative to risk and comprehension; line count alone is not a safety metric.
- `Change decomposition` — Breaking a larger goal into reviewable, independently understandable steps. Steps may depend on one another, but their sequence and temporary states must be clear.
- `Review context` — Requirements, architecture, constraints, prior decisions, runtime assumptions, or operational information needed to judge the diff. Link durable sources rather than embedding a long undifferentiated history.
- `Reviewer assignment` — Selecting reviewers with relevant ownership and expertise. Specialized security, privacy, concurrency, accessibility, or data knowledge may need explicit routing.
- `Review latency` — Time spent waiting for or completing review. Long latency can delay delivery and allow branches to drift; short latency is not evidence that a review was thorough.
- `Review bandwidth` — The team’s available attention for review work. Too little capacity creates queues; too much simultaneous review work encourages superficial inspection.
- `Author responsibility` — The author’s duty to make the change understandable, run appropriate checks, disclose risks, respond to feedback, and not treat approval as transfer of correctness ownership.
- `Review readiness` — The state where scope and description are clear, accidental changes removed, relevant checks run, and the author can explain important decisions and known gaps.
- `Change risk` — The probability and consequence of adverse effects, considered with blast radius, reversibility, data sensitivity, failure detection, and recovery options. A small diff can still be high risk.
- `Behavioral change` — A change in an observable outcome, contract, timing, compatibility, or failure behavior. State it explicitly and test the new expectation.
- `Nonfunctional change` — A change primarily affecting qualities such as latency, throughput, reliability, security, operability, or accessibility rather than the requested user-visible feature. Such changes can still alter observable behavior.
- `Breaking change disclosure` — Explicitly identifying a change that may require callers, users, operators, stored data, or deployments to adapt. Include compatibility window and migration implications where known.
- `Verification evidence` — Results and reasoning that support confidence: tests run, environments, manual workflow checks, measurements, or analysis. Report what was actually performed and any important limitation.
- `Review summary` — A short synthesis of purpose, decisions, risks, verification, and remaining work. It helps later readers understand why the change was accepted and what remains open.

# Cross-item comparison

| Distinction | Useful interpretation |
| --- | --- |
| CL and PR | Different ecosystem labels for a proposed change-review unit; neither label dictates quality. |
| Small coherent diff and arbitrary tiny diff | Coherence is about one understandable intent. Splitting every file can obscure a change or make intermediate commits unsafe. |
| Behavioral and nonfunctional change | Both can affect users and operations. Nonfunctional does not mean invisible or low risk. |
| Review latency and review bandwidth | Latency is an observed delay; bandwidth is available capacity. Reducing latency may require better capacity or change shaping, not merely faster individual reviewers. |
| Verification evidence and approval | Evidence informs a decision; approval is a workflow state with local semantics, not a proof certificate. |

# Examples

### Effective description

“Goal: stop duplicate invoice creation after a client retry. Approach: persist the idempotency key with the invoice transaction. Behavior: repeated identical keys return the existing invoice; conflicting payloads receive a validation error. Risk: unique-index deployment must precede the application rollout. Verification: added duplicate/concurrent-request integration cases and ran the invoice test suite. Rollback: revert application behavior while retaining the additive index.”

This gives reviewers the expected behavior, migration order, failure case, evidence, and recovery option before they inspect implementation details. The reviewer still checks whether those claims match the code.

### Decomposition boundary

A migration may be split into an additive schema change, compatible application deployment, data backfill, read switch, and cleanup. The steps need sequencing and compatibility notes; the author should not claim the early step is independently reversible if later writes make that untrue.

# Common mistakes

- Writing a description that only repeats the issue title, leaving behavior and risk unstated.
- Optimizing line count while combining unrelated formatting, refactoring, and feature changes.
- Calling a change “nonfunctional” and assuming it cannot affect user-visible outcomes.
- Assigning reviewers by availability alone when the change needs domain or security expertise.
- Treating a passing check as evidence for a different revision or environment.
- Claiming “tests passed” without naming relevant tests or acknowledging an untested critical path.
- Using a review deadline to pressure approval rather than to fix a blocked queue.
- Making intermediate commits unsafe without warning, which impedes review, bisection, or rollback.

# Knowledge checks with answers

1. **Is a 20-line authorization change necessarily low risk?** No. Risk depends on consequence, affected population, reversibility, and detection, not diff size.
2. **What belongs in a useful change description?** Problem, approach, behavioral impact, relevant risks, verification evidence, and migration/recovery notes as needed.
3. **Why can tiny diffs still be hard to review?** They may lack context, hide a broad semantic impact, or depend on earlier/later changes that are not explained.
4. **Does a review request ensure the correct reviewers were selected?** No. The author or ownership process must identify relevant expertise and scope.
5. **What is the distinction between latency and bandwidth?** Latency is how long review takes; bandwidth is the review capacity available to the team.

# Sources

- [Google CL author guide](https://google.github.io/eng-practices/review/developer/)
- [Google reviewer guide](https://google.github.io/eng-practices/review/reviewer/)
- [Microsoft Learn: get feedback with pull requests](https://learn.microsoft.com/en-us/devops/develop/git/git-pull-requests)
