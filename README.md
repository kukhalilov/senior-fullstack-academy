# Senior Full-Stack Academy

An independently readable .NET, React, and DSA learning library. The course is generated in small units and stored in Git. Open this folder as an Obsidian vault or read Markdown directly on GitHub.

## Production

The GitHub Actions workflow runs every 20 minutes and can also be started manually. Add a repository Actions secret named `GEMINI_API_KEY`, The worker defaults to the two high-quota Flash Lite models and several fallback models; optionally set the Actions repository variable `GEMINI_MODELS` to a comma-separated list of model IDs available in your Google AI Studio project. Check the actual model availability and quotas in AI Studio. Do not enable billing if you require a zero API bill. The worker does not create a billing account.

In GitHub repository Settings > Actions > General, allow workflow read and write permissions. Push the project to the default branch to enable the schedule. Generation may be delayed by GitHub or limited by Gemini. A run processes a bounded batch and saves completed drafts before review. Change `MAX_TASKS` and `RUN_MINUTES` in the workflow after observing quota and quality.

Each completed generation is saved immediately in `course/`. A later run skips existing files. The workflow uploads a checkpoint artifact and then commits and pushes results even after a worker error; an unexpected runner loss can lose files since the previous push. If pushing fails, inspect the run logs; GitHub-hosted workspaces are ephemeral. No unreviewed generated material is represented as verified.

## Read the course

Open `course/` by track, or see `curriculum/queue.json`. Every generated lesson includes its own questions and answers, exercises and solutions. DSA lessons include problems, hints and C# solutions. The course remains accessible without Codex after the files are pushed.

Generated text is automatically checked for required sections and reviewed by a second AI request. This cannot establish factual accuracy; model-produced sources and code must not be treated as independently verified. Do not use generated security guidance as the sole source of truth.

## Local development

Requires Node.js 20+. `npm test` runs offline checks. To generate locally set `GEMINI_API_KEY` and `GEMINI_MODELS` in your shell, then run `npm run generate`. API use is controlled by your Google account and quotas.

