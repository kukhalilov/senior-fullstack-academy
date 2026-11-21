# architecture interviews tradeoffs requirements and constraints — Problem: Diagnose a recommendation system feedback loop

Sources: [Google ML re-ranking](https://developers.google.com/machine-learning/recommendation/dnn/re-ranking), [Google production ML systems](https://developers.google.com/machine-learning/crash-course/production-ml-systems/questions), [Princeton research on algorithmic confounding](https://oar.princeton.edu/bitstream/88435/pr1zc2c/1/RecSystemsUtility.pdf)

## Goals

Practice candidate generation and ranking, exposure bias, offline and online evaluation, safety and user controls under interview constraints.

## Worked example

A recommendation system increasingly shows only already popular items. Explain data, model, evaluation, product, and monitoring changes that address the feedback loop.

Log exposure as well as clicks so non-clicks have context; evaluate candidate coverage, ranking quality, diversity, and safety separately. Use randomized or controlled exploration when appropriate, segment results, and compare offline metrics with online user outcomes. Add user controls and monitor concentration, not only click-through rate.

## Exercises

1. What exposure, position, context, and outcome events are needed to interpret a click or non-click?
2. Explain why a logged click is not a direct, unbiased measure of preference.
3. Propose offline and online measures beyond click-through rate, including a user or safety guardrail.
4. How would you introduce exploration while limiting risk and preserving an experiment control?

## Progressive hints

1. An item that was never shown cannot be treated like a shown item that was ignored.
2. Ranking position and candidate selection affect what users can observe and click.
3. Separate relevance, coverage/diversity, satisfaction, and safety measures; choose metrics for the product.
4. Use controlled exposure only when ethical, legal, and product constraints permit; define rollback and monitor segments.

## Complete solutions

1. Log which candidates were eligible and shown, their positions and relevant context, and the outcome event with a privacy-conscious schema. Record consent and retention constraints where applicable.
2. A click depends on exposure, position, interface, and user context; observed interaction data is selected by the prior ranking policy. Treat it as a signal with known limitations.
3. Evaluate ranking quality and candidate coverage alongside satisfaction/retention or task completion and appropriate safety/fairness guardrails. Offline metrics do not alone prove online benefit; use a controlled online evaluation when suitable.
4. Reserve a bounded, reviewable exploration strategy and control group, state success/stop criteria, and monitor segment-level outcomes. Avoid randomization where it creates unacceptable user or safety risk.

## Tests and edge cases

Test missing exposure logs, position changes, feedback delay, cold-start users/items, popularity concentration, segment regressions, abuse/manipulation, privacy deletion, and experiment rollback. Verify offline evaluation uses only information available at the decision time.

## Reflection questions

What evidence would distinguish a real preference from an artifact of prior exposure?


Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
