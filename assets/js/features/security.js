import { SECURITY_CONTROLS, SECURITY_DOMAINS, SECURITY_PLAYBOOKS } from "../data/security-data.js";

const searchInput = document.getElementById("security-search");
const domainFilterContainer = document.getElementById("security-domain-filters");
const priorityButtons = Array.from(document.querySelectorAll("[data-security-priority]"));
const countEl = document.getElementById("security-count");
const progressEl = document.getElementById("security-progress");
const progressTextEl = document.getElementById("security-progress-text");
const controlGrid = document.getElementById("security-control-grid");
const playbooksEl = document.getElementById("security-playbooks");

const STORAGE_KEY = "oracle_learn_security_controls_v1";
const PRIORITY_ORDER = {
  Critical: 1,
  High: 2,
  Medium: 3
};

let activeDomain = "all";
let activePriority = "all";
let searchTerm = "";
let completedControls = loadCompleted();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadCompleted() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id) => SECURITY_CONTROLS.some((item) => item.id === id)));
  } catch {
    return new Set();
  }
}

function saveCompleted() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completedControls)));
  } catch {
    // Ignore storage write failures in restricted browser modes.
  }
}

function isCompleted(controlId) {
  return completedControls.has(controlId);
}

function toggleCompleted(controlId) {
  if (isCompleted(controlId)) {
    completedControls.delete(controlId);
  } else {
    completedControls.add(controlId);
  }
  saveCompleted();
}

function renderDomainFilters() {
  if (!domainFilterContainer) {
    return;
  }

  const counts = SECURITY_CONTROLS.reduce((acc, item) => {
    const current = acc.get(item.domain) || 0;
    acc.set(item.domain, current + 1);
    return acc;
  }, new Map());

  domainFilterContainer.innerHTML = ["all", ...SECURITY_DOMAINS]
    .map((domain) => {
      const count = domain === "all" ? SECURITY_CONTROLS.length : counts.get(domain) || 0;
      const label = domain === "all" ? `All Domains (${count})` : `${domain} (${count})`;
      return `<button class="chip ${domain === activeDomain ? "is-active" : ""}" type="button" data-security-domain="${escapeHtml(domain)}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function filteredControls() {
  const term = searchTerm.toLowerCase();
  return SECURITY_CONTROLS.filter((item) => {
    if (activeDomain !== "all" && item.domain !== activeDomain) {
      return false;
    }
    if (activePriority !== "all" && item.priority !== activePriority) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = [
      item.domain,
      item.priority,
      item.level,
      item.title,
      item.summary,
      item.whyImportant,
      item.verifyCommand,
      item.expectedOutput,
      item.riskIfMissed
    ]
      .join(" ")
      .toLowerCase();

    return corpus.includes(term);
  }).sort((a, b) => {
    const doneOrder = Number(isCompleted(a.id)) - Number(isCompleted(b.id));
    if (doneOrder !== 0) {
      return doneOrder;
    }
    const priorityOrder = (PRIORITY_ORDER[a.priority] || 99) - (PRIORITY_ORDER[b.priority] || 99);
    if (priorityOrder !== 0) {
      return priorityOrder;
    }
    const domainOrder = a.domain.localeCompare(b.domain);
    if (domainOrder !== 0) {
      return domainOrder;
    }
    return a.title.localeCompare(b.title);
  });
}

function renderProgress() {
  const done = completedControls.size;
  const total = SECURITY_CONTROLS.length;
  const percent = total ? (done / total) * 100 : 0;

  if (progressEl) {
    progressEl.style.width = `${percent}%`;
  }
  if (progressTextEl) {
    progressTextEl.textContent = `Hardening checklist progress: ${done} of ${total} controls completed (${Math.round(percent)}%).`;
  }
}

function controlCard(item) {
  const done = isCompleted(item.id);
  return `
    <article class="card security-control-card ${done ? "is-complete" : ""}">
      <div class="security-meta-row">
        <span class="badge ${item.priority}">${escapeHtml(item.priority)}</span>
        <span class="badge ${item.level}">${escapeHtml(item.level)}</span>
        <span class="tag">${escapeHtml(item.domain)}</span>
      </div>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.summary)}</p>
      <p><strong>Why important:</strong> ${escapeHtml(item.whyImportant)}</p>
      <p><strong>Risk if missed:</strong> ${escapeHtml(item.riskIfMissed)}</p>
      <details>
        <summary>Verification command</summary>
        <pre class="code-block">${escapeHtml(item.verifyCommand)}</pre>
        <p><strong>Expected output signal:</strong> ${escapeHtml(item.expectedOutput)}</p>
      </details>
      <div class="security-actions">
        <button class="copy-btn" type="button" data-copy-command="${escapeHtml(item.verifyCommand)}">Copy command</button>
        <button class="btn ${done ? "btn-secondary" : "btn-terminal"}" type="button" data-toggle-control="${escapeHtml(item.id)}">
          ${done ? "Mark Pending" : "Mark Complete"}
        </button>
      </div>
      <p><a href="${escapeHtml(item.reference)}" target="_blank" rel="noreferrer">Official reference</a></p>
    </article>
  `;
}

function renderControls() {
  if (!controlGrid) {
    return;
  }

  const items = filteredControls();
  if (countEl) {
    countEl.textContent = `Showing ${items.length} of ${SECURITY_CONTROLS.length} security controls`;
  }

  if (!items.length) {
    controlGrid.innerHTML = `<article class="card"><h2>No controls matched</h2><p>Try a different search term or filter.</p></article>`;
    renderProgress();
    return;
  }

  controlGrid.innerHTML = items.map((item) => controlCard(item)).join("");
  renderProgress();
}

function renderPlaybooks() {
  if (!playbooksEl) {
    return;
  }

  playbooksEl.innerHTML = SECURITY_PLAYBOOKS.map(
    (playbook) => `
      <article class="card security-playbook-card">
        <h3>${escapeHtml(playbook.title)}</h3>
        <p><strong>Trigger:</strong> ${escapeHtml(playbook.trigger)}</p>
        <h4>Response Steps</h4>
        <ol class="task-steps">
          ${playbook.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
        <h4>Key Commands</h4>
        <ul class="command-list">
          ${playbook.commands.map((command) => `<li><pre class="code-block">${escapeHtml(command)}</pre></li>`).join("")}
        </ul>
        <p><a href="${escapeHtml(playbook.reference)}" target="_blank" rel="noreferrer">Official reference</a></p>
      </article>
    `
  ).join("");
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
  renderControls();
});

domainFilterContainer?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (!target.matches("[data-security-domain]")) {
    return;
  }

  activeDomain = target.getAttribute("data-security-domain") || "all";
  renderDomainFilters();
  renderControls();
});

priorityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activePriority = button.getAttribute("data-security-priority") || "all";
    priorityButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderControls();
  });
});

controlGrid?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches("[data-copy-command]")) {
    const command = target.getAttribute("data-copy-command") || "";
    await copyText(command);
    const original = target.textContent;
    target.textContent = "Copied";
    window.setTimeout(() => {
      target.textContent = original;
    }, 900);
    return;
  }

  if (target.matches("[data-toggle-control]")) {
    const controlId = target.getAttribute("data-toggle-control") || "";
    if (!controlId) {
      return;
    }
    toggleCompleted(controlId);
    renderControls();
  }
});

renderDomainFilters();
renderControls();
renderPlaybooks();
