# Scheduled draft generation

GitHub Actions runs the worker every six hours and can also be started manually. It uses the stable `gemini-3.5-flash-lite` API model and reads `GEMINI_API_KEY` from repository secrets. The worker can process at most 100 units in one run; four scheduled runs cap planned usage at 400 requests per day before retries. This leaves headroom under the 500 requests/day shown for the current Free-tier project, while the exact active quota remains controlled by Google AI Studio and can change. Model RPM and input-token limits also apply.

The worker processes only manifests with `inventoryComplete: true` and `generationAllowed: true`. It writes Markdown to `course/drafts/`, where generated output is labelled as a draft. A lesson must include exact required section headings, every supplied name in reference lessons, and at least one allowed source URL. GitHub commits those files automatically. A generated draft is not a claim of independent factual verification.

No paid model fallback is configured. If the free-tier model returns an error or exhausts quota after retries, the run fails without enabling billing. The next scheduled run retries the pending lesson. Free-tier model requests may be used by Google to improve its products; check current provider terms before adding private or personal data to prompts.

Google's current documentation identifies `gemini-3.5-flash-lite` as a stable model and notes that rate limits vary by project and are visible in AI Studio: [model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [pricing and free-tier data use](https://ai.google.dev/gemini-api/docs/pricing).
