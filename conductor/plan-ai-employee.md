# Plan: Autonomous AI Employee System

## Objective
Implement an autonomous "AI Employee" system on a Chromebook (Debian 12) using a directory-based Markdown memory, Gemini CLI Hooks, and a Systemd background service.

## Key Files & Context
- `~/myAgent/brain/`: Directory for Markdown memory files.
- `~/myAgent/skills/brain-md/`: Custom skill for memory management.
- `~/.gemini/hooks/employee-loop.js`: Hook for the autonomous loop.
- `~/.config/systemd/user/ai-employee.service`: Systemd service for persistence.

## Implementation Steps

### Phase 1: Memory Layer & Skill
1. Create `~/myAgent/brain/` with initial `tasks.md`, `context.md`, and `logs.md`.
2. Initialize the `brain-md` skill using `init_skill.cjs`.
3. Implement `read_brain` and `update_brain` tools within the skill.

### Phase 2: Autonomous Hook Logic
1. Write a Node.js script for the `AfterAgent` hook.
2. Configure the hook in `~/.gemini/settings.json` to monitor the AI's output for completion keywords.

### Phase 3: Background Service (The "Employee")
1. Create a Systemd user service file.
2. Enable and start the service to run Gemini CLI in headless YOLO mode.

## Verification & Testing
1. Add a test task to `tasks.md`.
2. Start the employee service.
3. Verify that the task is picked up, executed, and logged in `logs.md`.
