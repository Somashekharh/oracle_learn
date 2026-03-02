import { ROADMAP_WEEKS } from "../data/roadmap-data.js";

const track = document.getElementById("roadmap-track");
const summary = document.getElementById("roadmap-summary");
const progress = document.getElementById("roadmap-progress");
const hoursLabel = document.getElementById("roadmap-hours");
const searchInput = document.getElementById("roadmap-search");
const startDateInput = document.getElementById("roadmap-start-date");
const forecastEl = document.getElementById("roadmap-forecast");
const currentWeekEl = document.getElementById("roadmap-current-week");
const filterButtons = Array.from(document.querySelectorAll("[data-roadmap-filter]"));
const resetButton = document.getElementById("roadmap-reset");

const STORAGE_KEY = "oracle_learn_roadmap_progress_v2";
const DATE_STORAGE_KEY = "oracle_learn_roadmap_start_date_v1";
let activeFilter = "all";
let searchTerm = "";
let completedWeeks = loadCompletedWeeks();
let startDate = loadStartDate();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadCompletedWeeks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const validWeeks = new Set(ROADMAP_WEEKS.map((weekData) => weekData.week));
    return Array.from(new Set(parsed.filter((value) => Number.isInteger(value) && validWeeks.has(value))));
  } catch {
    return [];
  }
}

function saveCompletedWeeks() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedWeeks));
  } catch {
    // Ignore storage write failures in restricted browser modes.
  }
}

function loadStartDate() {
  try {
    const value = window.localStorage.getItem(DATE_STORAGE_KEY) || "";
    if (!value) {
      return "";
    }
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }
    return value;
  } catch {
    return "";
  }
}

function saveStartDate(value) {
  try {
    if (value) {
      window.localStorage.setItem(DATE_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(DATE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage write failures in restricted browser modes.
  }
}

function isCompleted(week) {
  return completedWeeks.includes(week);
}

function filteredWeeks() {
  const term = searchTerm.toLowerCase();
  const sorted = [...ROADMAP_WEEKS].sort((a, b) => a.week - b.week);
  return sorted.filter((item) => {
    if (activeFilter === "done" && !isCompleted(item.week)) {
      return false;
    }
    if (activeFilter === "pending" && isCompleted(item.week)) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = [
      item.focus,
      item.milestone || "",
      item.interviewCheckpoint || "",
      ...item.outcomes,
      ...item.exercises,
      ...(item.deliverables || [])
    ]
      .join(" ")
      .toLowerCase();

    return corpus.includes(term);
  });
}

function totalPlannedHours() {
  return ROADMAP_WEEKS.reduce((acc, weekData) => acc + (weekData.estimatedHours || 0), 0);
}

function completedHours() {
  return ROADMAP_WEEKS.filter((weekData) => isCompleted(weekData.week)).reduce(
    (acc, weekData) => acc + (weekData.estimatedHours || 0),
    0
  );
}

function formatDateValue(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parsedStartDate() {
  if (!startDate) {
    return null;
  }
  const parsed = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function weekTargetDate(weekNumber) {
  const parsed = parsedStartDate();
  if (!parsed) {
    return "";
  }
  const target = new Date(parsed);
  target.setDate(target.getDate() + weekNumber * 7 - 1);
  return formatDateValue(target);
}

function roadmapEndDate() {
  const parsed = parsedStartDate();
  if (!parsed) {
    return "";
  }
  const target = new Date(parsed);
  target.setDate(target.getDate() + ROADMAP_WEEKS.length * 7 - 1);
  return formatDateValue(target);
}

function currentFocusWeek() {
  const pending = [...ROADMAP_WEEKS]
    .sort((a, b) => a.week - b.week)
    .find((weekData) => !isCompleted(weekData.week));
  return pending ? pending.week : ROADMAP_WEEKS[ROADMAP_WEEKS.length - 1]?.week || 1;
}

function renderSummary() {
  const doneCount = completedWeeks.length;
  const totalCount = ROADMAP_WEEKS.length;

  if (summary) {
    summary.textContent = `${doneCount} of ${totalCount} weeks completed.`;
  }

  if (hoursLabel) {
    const doneHours = completedHours();
    hoursLabel.textContent = `${doneHours} of ${totalPlannedHours()} planned hours completed.`;
  }

  if (progress) {
    const percent = totalCount ? (doneCount / totalCount) * 100 : 0;
    progress.style.width = `${percent}%`;
  }

  if (currentWeekEl) {
    const focusWeek = currentFocusWeek();
    currentWeekEl.textContent =
      doneCount === totalCount
        ? "All roadmap weeks are completed."
        : `Current focus week: Week ${focusWeek}`;
  }

  if (forecastEl) {
    if (!startDate) {
      forecastEl.textContent = "Set a study start date to see target completion timeline.";
    } else {
      const end = roadmapEndDate();
      forecastEl.textContent = `Projected roadmap completion by ${end}.`;
    }
  }
}

function weekCard(weekData) {
  const done = isCompleted(weekData.week);
  const statusLabel = done ? "Completed" : "Pending";
  const targetDate = weekTargetDate(weekData.week);

  return `
    <article class="card roadmap-item ${done ? "is-complete" : ""}">
      <div class="roadmap-item-head">
        <p class="eyebrow">Week ${weekData.week}</p>
        <span class="tag">${statusLabel}</span>
      </div>
      <h2>${escapeHtml(weekData.focus)}</h2>
      <p><strong>Milestone:</strong> ${escapeHtml(weekData.milestone || "Define measurable weekly goal.")}</p>
      <p><strong>Estimated Hours:</strong> ${escapeHtml(String(weekData.estimatedHours || 0))}</p>
      <p><strong>Target Completion:</strong> ${escapeHtml(targetDate || "Set study start date in planner.")}</p>
      <p><strong>Interview Checkpoint:</strong> ${escapeHtml(weekData.interviewCheckpoint || "Revise this week topics verbally.")}</p>
      <h3>Outcomes</h3>
      <ul>
        ${weekData.outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join("")}
      </ul>
      <h3>Exercises</h3>
      <ul>
        ${weekData.exercises.map((exercise) => `<li>${escapeHtml(exercise)}</li>`).join("")}
      </ul>
      <h3>Deliverables</h3>
      <ul>
        ${(weekData.deliverables || []).map((deliverable) => `<li>${escapeHtml(deliverable)}</li>`).join("")}
      </ul>
      <div class="roadmap-item-actions">
        <button class="btn ${done ? "btn-secondary" : "btn-terminal"}" type="button" data-week-toggle="${weekData.week}">
          ${done ? "Mark Pending" : "Mark Complete"}
        </button>
      </div>
    </article>
  `;
}

function renderFilters() {
  filterButtons.forEach((button) => {
    const filterValue = button.getAttribute("data-roadmap-filter") || "all";
    const isActive = filterValue === activeFilter;
    button.classList.toggle("btn-primary", isActive);
    button.classList.toggle("btn-secondary", !isActive);
  });
}

function renderRoadmap() {
  if (!track) {
    return;
  }

  const weeks = filteredWeeks();
  if (!weeks.length) {
    track.innerHTML = `<article class="card"><h2>No weeks in this filter</h2><p>Switch filter to view your roadmap content.</p></article>`;
    return;
  }

  track.innerHTML = weeks.map((weekData) => weekCard(weekData)).join("");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.getAttribute("data-roadmap-filter") || "all";
    renderFilters();
    renderRoadmap();
  });
});

searchInput?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  searchTerm = target.value.trim();
  renderRoadmap();
});

startDateInput?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  startDate = target.value;
  saveStartDate(startDate);
  renderSummary();
  renderRoadmap();
});

resetButton?.addEventListener("click", () => {
  completedWeeks = [];
  saveCompletedWeeks();
  renderSummary();
  renderRoadmap();
  renderFilters();
});

track?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (!target.matches("[data-week-toggle]")) {
    return;
  }

  const week = Number(target.getAttribute("data-week-toggle"));
  if (!Number.isInteger(week)) {
    return;
  }

  if (isCompleted(week)) {
    completedWeeks = completedWeeks.filter((item) => item !== week);
  } else {
    completedWeeks = [...completedWeeks, week].sort((a, b) => a - b);
  }

  saveCompletedWeeks();
  renderSummary();
  renderRoadmap();
  renderFilters();
});

if (startDateInput) {
  startDateInput.value = startDate;
}

renderSummary();
renderFilters();
renderRoadmap();
