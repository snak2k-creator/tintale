# Repository workflow

- Keep the GitHub repository synchronized after each requested change. Before publishing, run the relevant checks; for application changes run `npm test` and `npm run build` (and `npm run test:e2e` when UI interaction changes).
- Commit verified changes and push them to `origin/main`. If GitHub branch protection requires a pull request, create one and merge it after its required checks pass.
- Keep the repository private unless the user explicitly asks to make it public.
- Never include credentials, local environment files, or unrelated workspace changes in a commit.
- Report which checks ran and whether the change reached `origin/main`; do not describe a local commit as a GitHub merge.
