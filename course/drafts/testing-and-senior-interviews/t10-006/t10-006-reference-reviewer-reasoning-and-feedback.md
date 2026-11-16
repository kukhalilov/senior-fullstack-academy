# code review refactoring and legacy modernization — Reference: Correctness, design, safety, feedback, and resolution

# Scope and version

This reference covers the supplied review dimensions and comment/resolution terms. The lesson does not establish a universal approval policy: severity labels, required approvers, and merge rules are local. The names below are the complete assigned group.

# How this group fits the mental model

Review questions should follow the change’s risk. A data migration invites different scrutiny from a text-only documentation fix. Start by understanding the intended contract; then inspect correctness and failure behavior, design and compatibility, and supporting evidence. Feedback communicates a decision so the author can act. Google’s reviewer guidance recommends focusing on functionality, complexity, tests, naming, comments, style, documentation, and context while keeping the review useful and timely. [Google’s reviewer guide](https://google.github.io/eng-practices/review/reviewer/)

# Supplied names explained

- `Correctness review` — Checks whether the implementation satisfies its stated requirements across expected inputs and state transitions. Compare code, tests, and the claimed behavior rather than relying on the description alone.
- `Design review` — Evaluates boundaries, responsibilities, coupling, abstractions, and whether the solution fits the problem and surrounding system. It is not an invitation to redesign unrelated code.
- `Readability review` — Checks whether a future maintainer can follow intent and control flow. Prefer meaningful naming and simple structure over cleverness; readability is not identical to personal style preference.
- `Test review` — Examines whether tests exercise meaningful behavior, boundaries, failure cases, and regressions. Check assertions and setup quality, not merely test count.
- `Security review` — Examines trust boundaries, identity, authorization, input handling, secrets, data exposure, dependencies, and abuse paths relevant to the change. Seek specialist review when the risk exceeds the reviewer’s expertise.
- `Performance review` — Assesses whether the change may affect latency, throughput, memory, database work, or resource contention under realistic use. Avoid unsupported claims based on intuition alone; measure when impact matters.
- `API compatibility review` — Checks changes to public or consumed contracts, including schemas, defaults, errors, serialization, and rollout coexistence. A source-compatible signature can still change behavior or wire compatibility.
- `Edge-case review` — Looks for boundary inputs, empty or malformed values, concurrency, time, locale, retries, partial state, and unusual but valid sequences relevant to the code.
- `Failure-mode review` — Traces what happens when dependencies time out, operations partially succeed, retries repeat effects, or cleanup fails. It asks whether the system fails safely and recovers observably.
- `Maintainability review` — Considers whether future changes can be made safely without excessive cognitive or coordination cost. It weighs abstractions against indirection and duplication against coupling.
- `Must-fix comment` — A comment identifying an issue that should be resolved before integration because of correctness, safety, contractual, or agreed quality requirements. Explain its impact and what evidence would close it.
- `Blocking review comment` — A workflow designation that prevents approval/merge under local convention until a concern is resolved. Teams define its semantics; it should not be used to elevate taste into policy.
- `Nonblocking suggestion` — An optional improvement that can be accepted now or deferred without making the change unsafe or incorrect. Label it so the author can distinguish it from a required fix.
- `Clarifying question` — A focused request for context or a rationale needed to evaluate the change. If the answer reveals a defect, turn the concern into a concrete action.
- `Nit comment` — A minor issue with little consequence, often wording or formatting. Keep nits nonblocking unless a published convention or tooling rule says otherwise.
- `Actionable feedback` — Feedback that identifies a specific code path or claim, explains the consequence, and proposes a next step or asks a precise question.
- `Impact explanation` — The reason the concern matters to users, data, maintainers, performance, security, or operations. It helps authors assess alternatives rather than obey unexplained preference.
- `Alternative proposal` — A possible way to address the concern. Explain its tradeoff and remain open to another solution that satisfies the same requirement.
- `Reviewer disagreement` — A difference in interpretation or preferred design. Resolve with requirements, observed behavior, evidence, team conventions, or an appropriate decision owner; do not make it personal or count votes as proof.
- `Comment resolution` — The explicit disposition of a review concern: change made, evidence supplied, accepted risk, or tracked follow-up, according to local workflow. Closing a thread without a clear disposition loses context.
- `Approval` — A reviewer’s positive workflow decision under repository policy. It indicates the reviewer’s assessment within scope and time; it is not a guarantee of correctness or a substitute for required automation.
- `Request changes` — A review outcome signaling that identified concerns need resolution before proceeding under the chosen workflow. It should be paired with specific findings.
- `Author response` — The author’s reasoned reply describing a change, evidence, alternative, or disagreement. A response should address the concern, not merely defend the original choice.
- `Review checklist` — A short set of recurring prompts for common risks such as authorization, migrations, observability, or error handling. Checklists support memory but cannot replace contextual judgment.
- `Automated check result` — Output from configured CI or analysis for a specific revision and environment. A passing result is only as strong as the check’s scope, configuration, and input data.

# Cross-item comparison

| Distinction | How to decide |
| --- | --- |
| Correctness and readability | Correctness asks whether behavior is right; readability asks whether intent and behavior are understandable. A clear bug remains a bug. |
| Must-fix and nonblocking suggestion | Must-fix concerns need resolution or explicit risk acceptance; suggestions are optional improvements. State the consequence that makes the distinction. |
| Clarifying question and blocking comment | A question requests missing information; a blocking comment states a concern that prevents proceeding. A question may become blocking after the answer. |
| Approval and automated check result | Approval is a human workflow decision; a check result is machine-produced evidence. Neither substitutes for the other. |
| Alternative proposal and requirement | A proposal is one possible solution; the requirement is the constraint to satisfy. Avoid insisting on a preferred implementation when another safe option works. |

# Examples

### Specific authorization finding

Weak: “This looks insecure.” Strong: “This query filters by invoice ID but not tenant ID. If IDs are guessable or leaked, a user may read another tenant’s invoice. Please add the tenant constraint and a test using a valid ID owned by a different tenant.” The stronger note identifies behavior, impact, and evidence.

### Performance concern with measured context

“This adds a per-row database request to a list endpoint. At the expected 500 rows it could make request count scale linearly; can we batch the lookup or show a measurement? The current test fixture only has three rows.” This is a testable concern, not an ungrounded assertion that the change is “slow.”

### Resolving disagreement

The reviewer prefers an abstraction; the author explains only one implementation exists and the interface would add another mapping layer. They inspect the likely second use case and agree to keep the direct call, while recording the extension point as a follow-up only if a second provider is approved. The reviewer’s preference did not outrank the maintenance evidence.

# Common mistakes

- Commenting on a style preference as though it were a correctness defect.
- Saying “add tests” without naming the behavior the tests should distinguish.
- Rewriting the code in a comment instead of explaining the concern and allowing the author to choose a fitting solution.
- Approving because CI is green while ignoring an obvious gap in the requirement or test scope.
- Rejecting a change over an unresolved minor suggestion that should be nonblocking.
- Treating author pushback as hostility or reviewer authority as infallibility.
- Assuming a test proves API compatibility when it only exercises one internal caller.
- Closing a comment thread without recording how the concern was addressed or accepted.

# Knowledge checks with answers

1. **What makes feedback actionable?** A specific location or behavior, its impact, and a clear question or possible next step.
2. **Can an approval certify security?** No. It is scoped, fallible judgment; security risk may need automation and specialist review.
3. **When should an issue be blocking?** When unresolved it creates an unacceptable correctness, safety, compatibility, or policy risk under the team’s stated rules.
4. **What should a reviewer do when lacking expertise?** State the limit and route the change to someone qualified for that risk.
5. **Does a nonblocking comment have to be ignored?** No. It can be addressed now or recorded for later; its label clarifies that it should not prevent safe progress.

# Sources

- [Google reviewer guide](https://google.github.io/eng-practices/review/reviewer/)
- [Google: what reviewers should look for](https://google.github.io/eng-practices/review/reviewer/looking-for.html)
- [Google: how to write code review comments](https://google.github.io/eng-practices/review/reviewer/comments.html)
- [Microsoft Learn: pull request feedback](https://learn.microsoft.com/en-us/devops/develop/git/git-pull-requests)
