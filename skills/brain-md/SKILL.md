---
name: brain-md
description: Persistent memory layer using Markdown files in ~/myAgent/brain/. Use this skill to read the brain state, update tasks, and log project insights.
---

# Brain-MD Skill

This skill provides a persistent "second brain" for the AI Employee by managing a directory of Markdown files.

## Tools

### `read_brain`
Reads the contents of `tasks.md`, `context.md`, `logs.md`, and `blockers.md`.
**Usage:** `node scripts/read_brain.js`

### `update_brain`
Appends content to a specific brain file.
**Usage:** `node scripts/update_brain.js <file_name> <content>`
**Example:** `node scripts/update_brain.js tasks.md "- [ ] TASK-10: New feature implementation"`

## Memory Management

### When to use:
*   At the **start of every shift**, use `read_brain` to understand the current state.
*   After **completing a task**, use `update_brain` to log the result in `logs.md` and mark it as done in `tasks.md`.
*   If a **blocker** is encountered, use `update_brain` to log it in `blockers.md` and then STOP.

### Task Status Keywords:
*   **WORK_COMPLETE**: Use this keyword when the current task queue is empty or the assigned task is fully finished.
*   **BLOCKER**: Use this keyword when manual user intervention is required.
