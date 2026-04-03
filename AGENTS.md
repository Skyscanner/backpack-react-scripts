## Pull request descriptions

When creating a pull request:
- Always use the PR template from `.github/pull_request_template.md`.
- Include relevant context from the `docs/plans/` plan file (not `*-implementation.md`) in the PR description body. This preserves the reasoning and design decisions in git history via merge commit descriptions.
- Do NOT include the plan file itself in the commit — plan files are gitignored as temporary artifacts.

## Superpowers label

When creating PRs, if the 'superpowers' skills were used, add a PR label `ai: sdd-superpowers` (creating the label if it doesn't exist).
