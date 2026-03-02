import { LAB_ITEMS } from "../data/labs-data.js";
import { FLASHCARDS } from "../data/flashcards-data.js";

const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanels = {
  labs: document.getElementById("tab-labs"),
  flashcards: document.getElementById("tab-flashcards"),
  quiz: document.getElementById("tab-quiz")
};

const labSearch = document.getElementById("lab-search");
const labTypeButtons = Array.from(document.querySelectorAll("[data-lab-type]"));
const labGrid = document.getElementById("lab-grid");

const flashcardWrap = document.getElementById("flashcard");
const flashcardMeta = document.getElementById("flashcard-meta");
const flashcardFront = document.getElementById("flashcard-front");
const flashcardBack = document.getElementById("flashcard-back");
const flashPrev = document.getElementById("flashcard-prev");
const flashFlip = document.getElementById("flashcard-flip");
const flashNext = document.getElementById("flashcard-next");

let activeTab = "labs";
let activeLabType = "all";
let labSearchTerm = "";
let flashIndex = 0;
let flipped = false;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTabState() {
  tabButtons.forEach((button) => {
    const tab = button.getAttribute("data-tab") || "labs";
    const isActive = tab === activeTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  Object.entries(tabPanels).forEach(([name, panel]) => {
    if (!panel) {
      return;
    }
    const isActive = name === activeTab;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
}

function filteredLabs() {
  const term = labSearchTerm.toLowerCase();
  return LAB_ITEMS.filter((item) => {
    const typeMatch = activeLabType === "all" || item.type === activeLabType;
    if (!typeMatch) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = `${item.type} ${item.title} ${item.prompt} ${item.solution} ${item.difficulty}`.toLowerCase();
    return corpus.includes(term);
  });
}

function renderLabs() {
  if (!labGrid) {
    return;
  }

  const items = filteredLabs();
  if (!items.length) {
    labGrid.innerHTML = `<article class="card"><h2>No labs found</h2><p>Try a different keyword or type filter.</p></article>`;
    return;
  }

  labGrid.innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <div class="meta-row">
          <span class="tag">${escapeHtml(item.type)}</span>
          <span class="badge ${item.difficulty}">${item.difficulty}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p><strong>Practice:</strong> ${escapeHtml(item.prompt)}</p>
        <p><strong>Model answer:</strong> ${escapeHtml(item.solution)}</p>
      </article>
    `
    )
    .join("");
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

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeTab = button.getAttribute("data-tab") || "labs";
    renderTabState();
  });
});

labTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeLabType = button.getAttribute("data-lab-type") || "all";
    labTypeButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
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

  if (event.key === "ArrowRight") {
    moveFlashcard(1);
  }
  if (event.key === "ArrowLeft") {
    moveFlashcard(-1);
  }
});

renderTabState();
renderLabs();
renderFlashcard();
