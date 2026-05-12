# WF Kit

This kit is the consumer-facing checklist for running Workflow Fidelity (`WF`) evidence against a review-game flow.

## What Counts

- Repo browser harnesses are regression evidence. They prove known paths still behave as implemented.
- WF evidence is a low-context browser-agent pass against the real product. It proves a capable uninformed learner can discover and complete the workflow.
- Logic tests, browser harnesses, and WF evidence are complementary gates; none replaces the others.

## Default Checklist

Use the machine/workspace WF default and include the applicable review-game items:

- launcher or entry flow
- routing to the intended review path
- staged-answer progression
- recovery or support behavior
- visible state and progress interpretation
- persistence and restore
- calculator shell behavior
- completion clarity

## Evidence Contract

Each WF report should include:

- entry URL and persona, when relevant
- checklist item
- outcome: `pass`, `partial`, or `fail`
- visible path taken
- confusion, hesitation, dead ends, and recovery path
- exact user-facing text or state that caused success or failure
- screenshots or video when useful
- issue class: UX/discoverability, workflow logic, state/persistence, or backend/runtime bug

## Reusing Prior WF Evidence

Prior WF evidence may be reused only when no later change altered:

- discoverability
- naming
- route order
- staged progression
- recovery semantics
- persistence semantics
- completion semantics

If any of those changed, run a new low-context WF pass for the affected workflow.

## Prompt Templates

Use the shared templates when creating WF specs and reports:

- `/Users/brandon/.codex/templates/wf-spec.template.yaml`
- `/Users/brandon/.codex/templates/wf-report.template.md`
- `/Users/brandon/.codex/templates/wf-agent-prompt.template.md`
