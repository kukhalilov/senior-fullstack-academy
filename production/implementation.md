# Production design and open work

The queue contains separate foundations, mechanisms, practice, and interview units. File presence alone currently serves as completion; this must be replaced with durable per-stage checkpoints and acceptance checks before unattended production. Titles are a preliminary coverage map and need expansion into detailed learning objectives.

Before enabling a schedule, implement: per-model rate accounting, configurable quotas, error-specific retry and cooldown, saved draft and review stages, source verification with evidence, code and DSA test execution, deterministic navigation, semantic overlap checks, and regular remote checkpoints. Distinguish provider availability from quality. Validate GitHub permissions and test the live pipeline with the configured secret. Preserve failed runs and avoid implying AI review guarantees correctness.

Model IDs shown by Google include gemini-3.5-flash-lite and gemini-3.1-flash-lite. Quotas shown in AI Studio are project-specific and may change. Record failures without leaking keys or response bodies. Do not make paid-tier assumptions.
