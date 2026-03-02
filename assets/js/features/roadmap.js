import { ROADMAP_WEEKS } from "../data/roadmap-data.js";

const track = document.getElementById("roadmap-track");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

if (track) {
  track.innerHTML = ROADMAP_WEEKS.map(
    (weekData) => `
      <article class="card roadmap-item">
        <p class="eyebrow">Week ${weekData.week}</p>
        <h2>${escapeHtml(weekData.focus)}</h2>
        <h3>Outcomes</h3>
        <ul>
          ${weekData.outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join("")}
        </ul>
        <h3>Exercises</h3>
        <ul>
          ${weekData.exercises.map((exercise) => `<li>${escapeHtml(exercise)}</li>`).join("")}
        </ul>
      </article>
    `
  ).join("");
}
