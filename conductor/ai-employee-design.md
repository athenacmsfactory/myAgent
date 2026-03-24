# Design: Systemic AI Employee

## 📋 Objective
Create a persistent, autonomous "AI Employee" on a Chromebook (Debian 12) using Gemini CLI's native hooks and a specialized skill for Markdown-based memory.

## 🏛️ Architecture

### 1. Memory Layer (`~/myAgent/brain/`)
A directory of context-specific Markdown files:
*   `tasks.md`: Current prioritized work queue.
*   `context.md`: Long-term memory (user preferences, project architectural decisions).
*   `blockers.md`: Explicitly logged issues requiring user intervention.
*   `logs.md`: Historical record of completed tasks.

### 2. Custom Skill (`brain-md`)
A local Gemini CLI skill that provides specialized tools:
*   `read_brain`: Reads the state of the brain.
*   `update_task`: Marks tasks as complete or updates their status.
*   `log_insight`: Adds new long-term context.

### 3. The Autonomous Hook (`AfterAgent`)
A Node.js hook (`.gemini/hooks/after-agent-loop.js`) that:
*   Inspects the model's output for a "WORK_COMPLETE" or "BLOCKER" keyword.
*   If neither is found, returns `{"decision": "deny", "reason": "Task in progress. Continue to next step."}` to force an automatic retry turn.

### 4. Background Persistence (Systemd)
A Systemd User Service (`~/.config/systemd/user/ai-employee.service`) to ensure the employee loop starts on boot and restarts on failure.

## ⚖️ Tradeoffs
*   **Pros:** Robust persistent memory, zero-latency (local files), background autonomy, follows Gemini CLI's native standards.
*   **Cons:** Requires initial setup of hooks and systemd.

## 🚀 Future Scalability
The `brain-md` skill can be easily updated to include RAG (Retrieval-Augmented Generation) if the brain directory grows too large for a single context window.
