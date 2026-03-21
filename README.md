# 🤖 Autonomous AI Employee System

This project implements a persistent, autonomous "AI Employee" on a Chromebook (Debian 12) using Gemini CLI's native hooks and a specialized skill for Markdown-based memory.

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
*   `update_brain`: Appends content to a specific brain file.

### 3. The Autonomous Hook (`AfterAgent`)
A Node.js hook (`~/myAgent/hooks/employee-loop.js`) that:
*   Inspects the model's output for a "WORK_COMPLETE" or "BLOCKER" keyword.
*   If neither is found, returns `{"decision": "deny", "reason": "Task in progress. Continue to next step."}` to force an automatic retry turn.

### 4. Background Persistence (Systemd)
A Systemd User Service (`~/.config/systemd/user/ai-employee.service`) to ensure the employee loop starts on boot and restarts on failure.

---

## 🚀 How to Use It

### ⚙️ Starting/Stopping the Employee
*   **Start the employee:**
    ```bash
    systemctl --user start ai-employee.service
    ```
*   **Stop the employee:**
    ```bash
    systemctl --user stop ai-employee.service
    ```
*   **Check service status:**
    ```bash
    systemctl --user status ai-employee.service
    ```

### 🔍 Monitoring Progress
*   **Real-time logs (Journalctl):**
    ```bash
    journalctl --user -u ai-employee.service -f
    ```
*   **Inspect the Brain:**
    ```bash
    cat ~/myAgent/brain/tasks.md
    cat ~/myAgent/brain/logs.md
    ```

### ✍️ Managing Tasks
To give the AI Employee a new task, simply append it to `~/myAgent/brain/tasks.md`:
```bash
echo "- [ ] TASK-5: Refactor the CSS in project X." >> ~/myAgent/brain/tasks.md
```

## ⚖️ Tradeoffs
*   **Pros:** Robust persistent memory, zero-latency (local files), background autonomy, follows Gemini CLI's native standards.
*   **Cons:** Requires initial setup of hooks and systemd.
