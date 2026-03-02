import { DBA_TASKS } from "../data/dba-tasks-data.js";

const taskGrid = document.getElementById("task-grid");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

if (taskGrid) {
  taskGrid.innerHTML = DBA_TASKS.map(
    (task) => `
      <article class="card">
        <h2>${escapeHtml(task.title)}</h2>
        <p><strong>Why we do it:</strong> ${escapeHtml(task.why)}</p>
        <p><strong>If skipped:</strong> ${escapeHtml(task.riskIfSkipped)}</p>

        <h3>Step-by-step Guide</h3>
        <ol class="task-steps">
          ${task.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>

        <h3>Commands</h3>
        <ul class="command-list">
          ${task.commands.map((command) => `<li><pre class="code-block">${escapeHtml(command)}</pre></li>`).join("")}
        </ul>
      </article>
    `
  ).join("");
}
