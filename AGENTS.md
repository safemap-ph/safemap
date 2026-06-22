# Agent Instructions

## General

- Follow repository instructions in this file before making changes.
- Prefer minimal, targeted edits and keep explanations concise.

## Package Manager

- Use pnpm for frontend tasks.
- Use `pnpm -C frontend lint` for linting.
- Use `pnpm -C frontend build` for production builds.

## Memory

- When the user shares stable preferences or repeated workflow choices, store them in /memories/ using the memory tool.
- Keep memory entries short and avoid storing secrets or credentials.

## Changes and Verification

- If you change frontend code, run the lint and build scripts when possible and report any failures.
- If you cannot run commands, explain what should be run and why.
