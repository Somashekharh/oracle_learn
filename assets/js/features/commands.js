import { COMMAND_ENTRIES, COMMAND_CATEGORIES } from "../data/commands-data.js";

const searchInput = document.getElementById("command-search");
const levelButtons = Array.from(document.querySelectorAll("[data-command-level]"));
const categoryContainer = document.getElementById("category-filters");
const resultsContainer = document.getElementById("command-results");
const countEl = document.getElementById("command-count");

let searchTerm = "";
let activeLevel = "all";
let activeCategory = "all";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCategoryFilters() {
  if (!categoryContainer) {
    return;
  }

  const buttons = ["all", ...COMMAND_CATEGORIES]
    .map((category) => {
      const isActive = category === activeCategory;
      const label = category === "all" ? "All Categories" : category;
      return `<button class="chip ${isActive ? "is-active" : ""}" data-command-category="${category}">${label}</button>`;
    })
    .join("");

  categoryContainer.innerHTML = buttons;

  const categoryButtons = Array.from(document.querySelectorAll("[data-command-category]"));
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.getAttribute("data-command-category") || "all";
      activeCategory = value;
      renderCategoryFilters();
      renderCommands();
    });
  });
}

function filteredCommands() {
  const term = searchTerm.toLowerCase();
  return COMMAND_ENTRIES.filter((entry) => {
    const levelOk = activeLevel === "all" || entry.level === activeLevel;
    const categoryOk = activeCategory === "all" || entry.category === activeCategory;
    if (!levelOk || !categoryOk) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = [
      entry.category,
      entry.syntax,
      entry.explanation,
      entry.scenario,
      entry.level,
      ...entry.commonMistakes
    ]
      .join(" ")
      .toLowerCase();

    return corpus.includes(term);
  });
}

function renderCommands() {
  if (!resultsContainer) {
    return;
  }

  const items = filteredCommands();
  if (countEl) {
    countEl.textContent = `Showing ${items.length} of ${COMMAND_ENTRIES.length} commands`;
  }
  if (!items.length) {
    resultsContainer.innerHTML = `<article class="card"><h2>No matching commands</h2><p>Try adjusting category, level, or search keyword.</p></article>`;
    return;
  }

  resultsContainer.innerHTML = items
    .map(
      (entry) => `
      <article class="card command-card">
        <div class="meta-row">
          <p class="badge ${entry.level}">${entry.level}</p>
          <span class="tag">${escapeHtml(entry.category)}</span>
        </div>
        <h3>${escapeHtml(entry.syntax.split(" ")[0])} Command</h3>
        <p>${escapeHtml(entry.explanation)}</p>
        <div class="card-actions">
          <button class="copy-btn" type="button" data-copy="${escapeHtml(entry.syntax)}" aria-label="Copy command syntax">Copy command</button>
        </div>
        <pre class="code-block">${escapeHtml(entry.syntax)}</pre>
        <p><strong>Scenario:</strong> ${escapeHtml(entry.scenario)}</p>
        <p><strong>Common mistakes:</strong></p>
        <ul>
          ${entry.commonMistakes.map((mistake) => `<li>${escapeHtml(mistake)}</li>`).join("")}
        </ul>
        <details>
          <summary>Output example</summary>
          <pre class="code-block">${escapeHtml(entry.outputExample)}</pre>
        </details>
      </article>
    `
    )
    .join("");
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
  renderCommands();
});

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeLevel = button.getAttribute("data-command-level") || "all";
    levelButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderCommands();
  });
});

resultsContainer?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (!target.matches("[data-copy]")) {
    return;
  }

  const text = target.getAttribute("data-copy") || "";
  await copyText(text);
  const original = target.textContent;
  target.textContent = "Copied";
  window.setTimeout(() => {
    target.textContent = original;
  }, 1000);
});

renderCategoryFilters();
renderCommands();
