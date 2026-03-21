# 🤖 Autonomous AI Employee System (v2.0)

This project implements a persistent, autonomous "AI Employee" on a Chromebook (Debian 12) using Gemini CLI's native hooks and a specialized skill for Markdown-based memory. It is currently integrated with the **Athena CMS Factory** to manage a large portfolio of websites autonomously.

## 🏛️ Project Structure

### 🧠 The Brain (`~/myAgent/brain/`)
The central nervous system of the AI Employee:
*   `tasks.md`: Current prioritized work queue.
*   `logs.md`: Historical record of all autonomous actions.
*   `modular-engine-plan.md`: Roadmap for the factory refactoring.

### 🔱 Athena CMS Factory (`~/myAgent/athena-y/`)
A high-performance website generation engine:
*   **Modular Engine**: AST-based code generation and phase-driven orchestration.
*   **MPA Support**: Capable of generating complex sites with hundreds of pages.
*   **Data Aggregator**: Optimized data loading via `all_data.json`.

### 🏥 Ecosystem Monitoring
*   **Health Dashboard**: Visual status of 55+ sites (http://localhost:5001/portfolio-status.html).
*   **Build Orchestration**: Trigger production builds directly from the dashboard.
*   **Doctor Controller**: Automated integrity audits and storage management (hydration/dehydration).

---

## 🚀 Autonomous Operations

### ⚙️ Starting the Employee
The AI Employee runs as a systemd background service:
```bash
systemctl --user start ai-employee.service
```

### 🔍 Monitoring
*   **Visual Dashboard:** http://localhost:5001/portfolio-status.html
*   **Service Logs:** `journalctl --user -u ai-employee.service -f`
*   **Brain State:** `cat ~/myAgent/brain/tasks.md`

### 🛠️ Capabilities
*   **Self-Healing**: Automatically detects and fixes missing `node_modules` or empty JSON files.
*   **Batch Operations**: Can publish, build, or update components across the entire 60+ site portfolio.
*   **Digital Strategist**: Simulated client onboarding and automated provisioning.

---

## ⚖️ Architecture Standards
*   **Memory-First**: All state is stored in local Markdown files for zero-latency context.
*   **Security-First**: Automated secret scanning and protected `.env` management.
*   **Efficiency**: Proactive Chromebook storage management through site dehydration.
