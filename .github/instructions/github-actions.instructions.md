---
description: "Use when creating, updating, or reviewing GitHub Actions workflows. Covers Node.js 24 action runtimes, action version audits, and workflow validation."
applyTo: ".github/workflows/**/*.yml, .github/workflows/**/*.yaml"
---
# GitHub Actions Workflow Guidelines

- Use Node.js 24 for project commands: `actions/setup-node@v5` with `node-version: 24`.
- Use action versions that run on Node.js 24 by default. `node-version` controls project commands; it does not change an action's own JavaScript runtime.
- For official Actions, use `actions/checkout@v5`, `actions/setup-node@v5`, and `actions/upload-artifact@v6` or later. Do not add or retain versions that default to Node.js 20.
- When changing any workflow, audit every `.github/workflows/*.{yml,yaml}` file for stale action versions, not only the workflow being edited. Check each action's release notes or `action.yml` before upgrading third-party actions.
- Prefer current stable action majors compatible with GitHub-hosted runners. Confirm required runner versions before adopting an action major that changes runtime requirements.
- Do not suppress Node.js runtime deprecation warnings with environment variables. Upgrade the affected action instead.
- Validate workflow YAML after editing. For this repository, run `ruby -e 'require "yaml"; YAML.load_file(ARGV[0])' .github/workflows/<workflow>.yml` and `git diff --check`.