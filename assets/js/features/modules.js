import { MODULE_LESSONS } from "../data/modules-data.js";

const grid = document.getElementById("module-grid");
const levelButtons = Array.from(document.querySelectorAll("[data-level-filter]"));
const moduleButtons = Array.from(document.querySelectorAll("[data-module-filter]"));
const searchInput = document.getElementById("module-search");
const statsEl = document.getElementById("module-stats");

let activeLevel = "all";
let activeModuleTrack = "all";
let searchTerm = "";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeModuleFilterValue(value) {
  if (!value || value === "all") {
    return "all";
  }
  return value;
}

function matchesModuleTrack(lesson) {
  if (activeModuleTrack === "all") {
    return true;
  }
  return lesson.moduleId.startsWith(activeModuleTrack);
}

function getFilteredLessons() {
  const term = searchTerm.toLowerCase();

  return MODULE_LESSONS.filter((lesson) => {
    const levelMatch = activeLevel === "all" || lesson.level === activeLevel;
    const moduleMatch = matchesModuleTrack(lesson);
    if (!levelMatch || !moduleMatch) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = `${lesson.moduleId} ${lesson.title} ${lesson.summary} ${lesson.keyPoints.join(" ")} ${lesson.commands.join(" ")}`.toLowerCase();
    return corpus.includes(term);
  });
}

function renderStats(filtered) {
  if (!statsEl) {
    return;
  }

  const beginner = filtered.filter((item) => item.level === "Beginner").length;
  const intermediate = filtered.filter((item) => item.level === "Intermediate").length;
  const advanced = filtered.filter((item) => item.level === "Advanced").length;

  statsEl.textContent = `Lessons: ${filtered.length} • Beginner: ${beginner} • Intermediate: ${intermediate} • Advanced: ${advanced}`;
}

function renderModules() {
  if (!grid) {
    return;
  }

  const filtered = getFilteredLessons();
  renderStats(filtered);

  if (!filtered.length) {
    grid.innerHTML = `<article class="card"><h2>No lessons found</h2><p>Try another filter or search term.</p></article>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (lesson) => `
      <article class="card lesson-card">
        <p class="badge ${lesson.level}">${lesson.level}</p>
        <p class="eyebrow">${escapeHtml(lesson.moduleId)}</p>
        <h3>${escapeHtml(lesson.title)}</h3>
        <p>${escapeHtml(lesson.summary)}</p>
        <div class="lesson-keypoints">
          <h4>Key Points</h4>
          <ul>
            ${lesson.keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
          </ul>
        </div>
        <div class="lesson-commands">
          <h4>Command Reference</h4>
          ${lesson.commands.map((command) => `<pre class="code-block">${escapeHtml(command)}</pre>`).join("")}
        </div>
      </article>
    `
    )
    .join("");
}

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeLevel = button.getAttribute("data-level-filter") || "all";
    levelButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderModules();
  });
});

moduleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeModuleTrack = normalizeModuleFilterValue(button.getAttribute("data-module-filter"));
    moduleButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderModules();
  });
});

searchInput?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  searchTerm = target.value.trim();
  renderModules();
});

renderModules();
