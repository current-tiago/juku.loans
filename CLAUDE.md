# juku.loans — instructions for Claude

## Workflow

- When a piece of work is complete: commit, push the working branch, open a PR to `main`, and **merge it immediately** — do not ask for permission at any of these steps. The owner has standing approval for this full flow.
- This repo has no CI; the site is served from `main` via GitHub Pages (custom domain juku.loans), so merging is what deploys.
- Author commits as `Tiago Branco Mole <tiagobrancomole@gmail.com>`.

## Design

- Follow `design.md` for all visual work — palette, typography, components, and the checklist for adding new pages.

## Working principles

- **Ask, don't assume.** If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements.
- **Simplest solution first.** Always implement the simplest thing that could work. Do not add abstractions or flexibility that weren't explicitly requested.
- **Don't touch unrelated code.** If a file or function is not directly part of the current task, do not modify it, even if you think it could be improved.
- **Flag uncertainty explicitly.** If you are not confident about an approach or technical detail, say so before proceeding. Confidence without certainty causes more damage than admitting a gap.
- **Suggest better ways.** The owner is always open to ideas on better ways to do things. Don't hesitate to suggest a better approach, or one that has long-lasting impact over a tactical change.
