import { DBA_TASKS } from "../data/dba-tasks-data.js";

const taskGrid = document.getElementById("task-grid");
const searchInput = document.getElementById("task-search");
const cadenceFilters = document.getElementById("task-cadence-filters");
const priorityFilters = document.getElementById("task-priority-filters");
const taskCount = document.getElementById("task-count");

const STORAGE_KEY = "oracle_learn_dba_task_progress_v2";
const PRIORITY_ORDER = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4
};

let searchTerm = "";
let activeCadence = "all";
let activePriority = "all";
let taskProgress = loadProgress();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function saveProgress() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(taskProgress));
  } catch {
    // Ignore storage write failures in restricted browser modes.
  }
}

function taskState(task) {
  const existing = taskProgress[task.id];
  if (existing && Array.isArray(existing.steps)) {
    const normalizedSteps = task.steps.map((_, index) => Boolean(existing.steps[index]));
    return {
      done: Boolean(existing.done) && normalizedSteps.every(Boolean),
      steps: normalizedSteps
    };
  }

  return {
    done: false,
    steps: task.steps.map(() => false)
  };
}

function setTaskState(taskId, state) {
  taskProgress[taskId] = state;
  saveProgress();
}

function doneCount(task) {
  const state = taskState(task);
  return state.steps.filter(Boolean).length;
}

function isDone(task) {
  const state = taskState(task);
  return state.done || state.steps.every(Boolean);
}

function uniqueCadences() {
  const values = Array.from(new Set(DBA_TASKS.map((task) => task.cadence).filter(Boolean)));
  return values.sort((a, b) => a.localeCompare(b));
}

function uniquePriorities() {
  const values = Array.from(new Set(DBA_TASKS.map((task) => task.priority).filter(Boolean)));
  return values.sort((a, b) => (PRIORITY_ORDER[a] || 99) - (PRIORITY_ORDER[b] || 99));
}

function renderCadenceFilters() {
  if (!cadenceFilters) {
    return;
  }

  cadenceFilters.innerHTML = ["all", ...uniqueCadences()]
    .map((cadence) => {
      const label = cadence === "all" ? "All Cadence" : cadence;
      return `<button class="chip ${cadence === activeCadence ? "is-active" : ""}" type="button" data-cadence="${cadence}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function renderPriorityFilters() {
  if (!priorityFilters) {
    return;
  }

  priorityFilters.innerHTML = ["all", ...uniquePriorities()]
    .map((priority) => {
      const label = priority === "all" ? "All Priority" : priority;
      return `<button class="chip ${priority === activePriority ? "is-active" : ""}" type="button" data-priority="${priority}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function filteredTasks() {
  const term = searchTerm.toLowerCase();

  return DBA_TASKS.filter((task) => {
    if (activeCadence !== "all" && task.cadence !== activeCadence) {
      return false;
    }
    if (activePriority !== "all" && task.priority !== activePriority) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = [
      task.title,
      task.why,
      task.riskIfSkipped,
      task.cadence || "",
      task.priority || "",
      task.executionWindow || "",
      task.slaTarget || "",
      ...task.steps,
      ...task.commands
    ]
      .join(" ")
      .toLowerCase();

    return corpus.includes(term);
  }).sort((a, b) => {
    const doneOrder = Number(isDone(a)) - Number(isDone(b));
    if (doneOrder !== 0) {
      return doneOrder;
    }

    const priorityOrder = (PRIORITY_ORDER[a.priority || ""] || 99) - (PRIORITY_ORDER[b.priority || ""] || 99);
    if (priorityOrder !== 0) {
      return priorityOrder;
    }

    return a.title.localeCompare(b.title);
  });
}

function taskMarkup(task) {
  const state = taskState(task);
  const completedSteps = doneCount(task);
  const totalSteps = task.steps.length;
  const done = isDone(task);

  return `
    <article class="card task-card ${done ? "is-complete" : ""}">
      <div class="task-meta-row">
        <p class="badge ${task.priority || "Beginner"}">${escapeHtml(task.priority || "General")}</p>
        <span class="tag">${escapeHtml(task.cadence || "Planned")}</span>
        <span class="tag">${escapeHtml(task.executionWindow || "Operational Window")}</span>
      </div>
      <h2>${escapeHtml(task.title)}</h2>
      <p><strong>Why we do it:</strong> ${escapeHtml(task.why)}</p>
      <p><strong>If skipped:</strong> ${escapeHtml(task.riskIfSkipped)}</p>
      <p><strong>SLA Target:</strong> ${escapeHtml(task.slaTarget || "Define SLA by environment policy.")}</p>
      <p class="eyebrow">Progress: ${completedSteps} / ${totalSteps} steps complete</p>

      <h3>Step-by-step Guide</h3>
      <ol class="task-steps task-checklist">
        ${task.steps
          .map(
            (step, index) => `
            <li>
              <label class="task-step-line">
                <input type="checkbox" data-task-step="${escapeHtml(task.id)}:${index}" ${state.steps[index] ? "checked" : ""} />
                <span>${escapeHtml(step)}</span>
              </label>
            </li>
          `
          )
          .join("")}
      </ol>

      <h3>Commands</h3>
      <ul class="command-list">
        ${task.commands
          .map(
            (command, index) => `
            <li>
              <div class="task-command-row">
                <button class="copy-btn" type="button" data-copy-command="${escapeHtml(command)}" aria-label="Copy task command ${index + 1}">Copy command</button>
              </div>
              <pre class="code-block">${escapeHtml(command)}</pre>
            </li>
          `
          )
          .join("")}
      </ul>
      ${
        task.references && task.references.length
          ? `
      <details>
        <summary>Official references</summary>
        <ul>
          ${task.references
            .map((reference) => `<li><a href="${escapeHtml(reference)}" target="_blank" rel="noreferrer">${escapeHtml(reference)}</a></li>`)
            .join("")}
        </ul>
      </details>`
          : ""
      }
      <div class="task-actions">
        <button class="btn ${done ? "btn-secondary" : "btn-terminal"}" type="button" data-task-toggle="${escapeHtml(task.id)}">
          ${done ? "Mark As Pending" : "Mark Task Complete"}
        </button>
      </div>
    </article>
  `;
}

function renderTasks() {
  if (!taskGrid) {
    return;
  }

  const items = filteredTasks();
  if (taskCount) {
    taskCount.textContent = `Showing ${items.length} of ${DBA_TASKS.length} DBA workflows`;
  }

  if (!items.length) {
    taskGrid.innerHTML = `<article class="card"><h2>No matching tasks</h2><p>Adjust your filters or search keyword.</p></article>`;
    return;
  }

  taskGrid.innerHTML = items.map((task) => taskMarkup(task)).join("");
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const temp = document.createElement("textarea");
  temp.value = text;
  document.body.append(temp);
  temp.select();
  document.execCommand("copy");
  temp.remove();
  return Promise.resolve();
}

searchInput?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  searchTerm = target.value.trim();
  renderTasks();
});

cadenceFilters?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (!target.matches("[data-cadence]")) {
    return;
  }

  activeCadence = target.getAttribute("data-cadence") || "all";
  renderCadenceFilters();
  renderTasks();
});

priorityFilters?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (!target.matches("[data-priority]")) {
    return;
  }

  activePriority = target.getAttribute("data-priority") || "all";
  renderPriorityFilters();
  renderTasks();
});

taskGrid?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  if (!target.matches("[data-task-step]")) {
    return;
  }

  const raw = target.getAttribute("data-task-step") || "";
  const [taskId, indexText] = raw.split(":");
  const stepIndex = Number(indexText);
  const task = DBA_TASKS.find((item) => item.id === taskId);
  if (!task || !Number.isInteger(stepIndex)) {
    return;
  }

  const state = taskState(task);
  state.steps[stepIndex] = target.checked;
  state.done = state.steps.every(Boolean);
  setTaskState(taskId, state);
  renderTasks();
});

taskGrid?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches("[data-copy-command]")) {
    const command = target.getAttribute("data-copy-command") || "";
    await copyText(command);
    const originalText = target.textContent;
    target.textContent = "Copied";
    window.setTimeout(() => {
      target.textContent = originalText;
    }, 900);
    return;
  }

  if (target.matches("[data-task-toggle]")) {
    const taskId = target.getAttribute("data-task-toggle") || "";
    const task = DBA_TASKS.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const current = taskState(task);
    const nextDone = !isDone(task);
    const nextState = {
      done: nextDone,
      steps: task.steps.map(() => nextDone)
    };
    if (!nextDone && current.steps.some(Boolean)) {
      nextState.steps = task.steps.map(() => false);
    }
    setTaskState(taskId, nextState);
    renderTasks();
  }
});

renderCadenceFilters();
renderPriorityFilters();
renderTasks();
