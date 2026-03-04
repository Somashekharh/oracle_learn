import { LAB_ITEMS } from "../data/labs-data.js";
import { FLASHCARDS } from "../data/flashcards-data.js";
import { copyTextWithFallback, setTemporaryButtonLabel } from "../utils/clipboard.js";

const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanels = {
  labs: document.getElementById("tab-labs"),
  flashcards: document.getElementById("tab-flashcards"),
  quiz: document.getElementById("tab-quiz")
};

const labSearch = document.getElementById("lab-search");
const labTypeButtons = Array.from(document.querySelectorAll("[data-lab-type]"));
const labLevelButtons = Array.from(document.querySelectorAll("[data-lab-level]"));
const labStatusButtons = Array.from(document.querySelectorAll("[data-lab-status]"));
const labRandomBtn = document.getElementById("lab-random");
const labResetBtn = document.getElementById("lab-reset-progress");
const labCountEl = document.getElementById("lab-count");
const labProgressEl = document.getElementById("lab-progress");
const labGrid = document.getElementById("lab-grid");

const flashcardWrap = document.getElementById("flashcard");
const flashcardMeta = document.getElementById("flashcard-meta");
const flashcardFront = document.getElementById("flashcard-front");
const flashcardBack = document.getElementById("flashcard-back");
const flashPrev = document.getElementById("flashcard-prev");
const flashFlip = document.getElementById("flashcard-flip");
const flashNext = document.getElementById("flashcard-next");

const STORAGE_KEY = "oracle_learn_labs_solved_v1";
const LEVEL_ORDER = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3
};

let activeTab = "labs";
let activeLabType = "all";
let activeLabLevel = "all";
let activeLabStatus = "all";
let labSearchTerm = "";
let flashIndex = 0;
let flipped = false;
let solvedLabs = loadSolvedLabs();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadSolvedLabs() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id) => LAB_ITEMS.some((item) => item.id === id)));
  } catch {
    return new Set();
  }
}

function saveSolvedLabs() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(solvedLabs)));
  } catch {
    // Ignore storage write failures in restricted browser modes.
  }
}

function isSolved(id) {
  return solvedLabs.has(id);
}

function renderTabState() {
  tabButtons.forEach((button) => {
    const tab = button.getAttribute("data-tab") || "labs";
    const isActive = tab === activeTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  Object.entries(tabPanels).forEach(([name, panel]) => {
    if (!panel) {
      return;
    }
    const isActive = name === activeTab;
    panel.hidden = !isActive;
    panel.setAttribute("aria-hidden", String(!isActive));
    panel.classList.toggle("is-active", isActive);
  });
}

function activateTab(tabName, shouldFocusButton = false) {
  if (!tabPanels[tabName]) {
    return;
  }
  activeTab = tabName;
  renderTabState();
  if (shouldFocusButton) {
    const button = tabButtons.find((item) => item.getAttribute("data-tab") === tabName);
    button?.focus();
  }
}

function setActiveChip(buttons, attribute, value) {
  buttons.forEach((button) => {
    const current = button.getAttribute(attribute) || "all";
    button.classList.toggle("is-active", current === value);
  });
}

function filteredLabs() {
  const term = labSearchTerm.toLowerCase();

  return LAB_ITEMS.filter((item) => {
    if (activeLabType !== "all" && item.type !== activeLabType) {
      return false;
    }
    if (activeLabLevel !== "all" && item.difficulty !== activeLabLevel) {
      return false;
    }
    if (activeLabStatus === "solved" && !isSolved(item.id)) {
      return false;
    }
    if (activeLabStatus === "pending" && isSolved(item.id)) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = `${item.type} ${item.title} ${item.prompt} ${item.solution} ${item.difficulty}`.toLowerCase();
    return corpus.includes(term);
  }).sort((a, b) => {
    const solvedOrder = Number(isSolved(a.id)) - Number(isSolved(b.id));
    if (solvedOrder !== 0) {
      return solvedOrder;
    }
    const typeOrder = a.type.localeCompare(b.type);
    if (typeOrder !== 0) {
      return typeOrder;
    }
    const levelOrder = (LEVEL_ORDER[a.difficulty] || 99) - (LEVEL_ORDER[b.difficulty] || 99);
    if (levelOrder !== 0) {
      return levelOrder;
    }
    return a.title.localeCompare(b.title);
  });
}

function renderLabStats(items) {
  if (labCountEl) {
    labCountEl.textContent = `Showing ${items.length} of ${LAB_ITEMS.length} labs`;
  }
  if (labProgressEl) {
    labProgressEl.textContent = `Solved ${solvedLabs.size} of ${LAB_ITEMS.length} labs`;
  }
}

function labCard(item) {
  const solved = isSolved(item.id);
  return `
    <article class="card lab-card ${solved ? "is-solved" : ""}" id="lab-card-${escapeHtml(item.id)}">
      <div class="meta-row">
        <span class="tag">${escapeHtml(item.type)}</span>
        <span class="badge ${item.difficulty}">${item.difficulty}</span>
        <span class="tag">${solved ? "Solved" : "Pending"}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p><strong>Practice:</strong> ${escapeHtml(item.prompt)}</p>
      <details class="lab-solution">
        <summary>Show model answer</summary>
        <p>${escapeHtml(item.solution)}</p>
      </details>
      <div class="lab-actions">
        <button class="copy-btn" type="button" data-copy-solution="${escapeHtml(item.solution)}">Copy Answer</button>
        <button class="btn ${solved ? "btn-secondary" : "btn-terminal"}" type="button" data-lab-toggle="${escapeHtml(item.id)}">
          ${solved ? "Mark Pending" : "Mark Solved"}
        </button>
      </div>
    </article>
  `;
}

function renderLabs() {
  if (!labGrid) {
    return;
  }

  const items = filteredLabs();
  renderLabStats(items);

  if (!items.length) {
    labGrid.innerHTML = `<article class="card"><h2>No labs found</h2><p>Try a different filter or keyword.</p></article>`;
    return;
  }

  labGrid.innerHTML = items.map((item) => labCard(item)).join("");
}

function renderFlashcard() {
  const card = FLASHCARDS[flashIndex];
  if (!card || !flashcardWrap || !flashcardMeta || !flashcardFront || !flashcardBack) {
    return;
  }

  flashcardMeta.textContent = `${card.topic} • ${card.level} • Card ${flashIndex + 1} of ${FLASHCARDS.length}`;
  flashcardFront.textContent = card.front;
  flashcardBack.textContent = card.back;
  flashcardWrap.classList.toggle("is-flipped", flipped);
}

function setFlipped(value) {
  flipped = value;
  renderFlashcard();
}

function moveFlashcard(direction) {
  flashIndex = (flashIndex + direction + FLASHCARDS.length) % FLASHCARDS.length;
  setFlipped(false);
}

function highlightLabCard(labId) {
  const card = document.getElementById(`lab-card-${labId}`);
  if (!card) {
    return;
  }
  card.classList.add("is-highlight");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    card.classList.remove("is-highlight");
  }, 1200);
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTab(button.getAttribute("data-tab") || "labs");
  });

  button.addEventListener("keydown", (event) => {
    const currentIndex = tabButtons.indexOf(button);
    if (currentIndex === -1) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % tabButtons.length;
      const nextTab = tabButtons[nextIndex].getAttribute("data-tab") || "labs";
      activateTab(nextTab, true);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      const prevTab = tabButtons[prevIndex].getAttribute("data-tab") || "labs";
      activateTab(prevTab, true);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      const firstTab = tabButtons[0].getAttribute("data-tab") || "labs";
      activateTab(firstTab, true);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastTab = tabButtons[tabButtons.length - 1].getAttribute("data-tab") || "labs";
      activateTab(lastTab, true);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateTab(button.getAttribute("data-tab") || "labs", true);
    }
  });
});

labTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeLabType = button.getAttribute("data-lab-type") || "all";
    setActiveChip(labTypeButtons, "data-lab-type", activeLabType);
    renderLabs();
  });
});

labLevelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeLabLevel = button.getAttribute("data-lab-level") || "all";
    setActiveChip(labLevelButtons, "data-lab-level", activeLabLevel);
    renderLabs();
  });
});

labStatusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeLabStatus = button.getAttribute("data-lab-status") || "all";
    setActiveChip(labStatusButtons, "data-lab-status", activeLabStatus);
    renderLabs();
  });
});

labSearch?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  labSearchTerm = target.value.trim();
  renderLabs();
});

labRandomBtn?.addEventListener("click", () => {
  const visible = filteredLabs();
  const pending = visible.filter((item) => !isSolved(item.id));
  const source = pending.length ? pending : visible;
  if (!source.length) {
    return;
  }
  const selected = source[Math.floor(Math.random() * source.length)];
  highlightLabCard(selected.id);
});

labResetBtn?.addEventListener("click", () => {
  solvedLabs = new Set();
  saveSolvedLabs();
  renderLabs();
});

labGrid?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches("[data-copy-solution]")) {
    const text = target.getAttribute("data-copy-solution") || "";
    const copied = await copyTextWithFallback(text, "Copy this solution");
    setTemporaryButtonLabel(target, copied, { timeoutMs: 900 });
    return;
  }

  if (target.matches("[data-lab-toggle]")) {
    const id = target.getAttribute("data-lab-toggle") || "";
    if (!id) {
      return;
    }
    if (isSolved(id)) {
      solvedLabs.delete(id);
    } else {
      solvedLabs.add(id);
    }
    saveSolvedLabs();
    renderLabs();
  }
});

flashFlip?.addEventListener("click", () => setFlipped(!flipped));
flashPrev?.addEventListener("click", () => moveFlashcard(-1));
flashNext?.addEventListener("click", () => moveFlashcard(1));

flashcardWrap?.addEventListener("click", () => setFlipped(!flipped));
flashcardWrap?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    setFlipped(!flipped);
  }
});

document.addEventListener("keydown", (event) => {
  if (activeTab !== "flashcards") {
    return;
  }

  const target = event.target;
  if (target instanceof HTMLElement) {
    const tag = target.tagName.toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A") {
      return;
    }
  }

  if (event.key === "ArrowRight") {
    moveFlashcard(1);
  }
  if (event.key === "ArrowLeft") {
    moveFlashcard(-1);
  }
});

renderTabState();
setActiveChip(labTypeButtons, "data-lab-type", activeLabType);
setActiveChip(labLevelButtons, "data-lab-level", activeLabLevel);
setActiveChip(labStatusButtons, "data-lab-status", activeLabStatus);
renderLabs();
renderFlashcard();
