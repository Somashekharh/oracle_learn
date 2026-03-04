import { RESOURCE_CATEGORIES, RESOURCE_LINKS } from "../data/resources-data.js";
import { copyTextWithFallback, setTemporaryButtonLabel } from "../utils/clipboard.js";

const searchInput = document.getElementById("resource-search");
const categoryFilters = document.getElementById("resource-category-filters");
const levelButtons = Array.from(document.querySelectorAll("[data-resource-level]"));
const randomButton = document.getElementById("resource-random");
const clearBookmarksButton = document.getElementById("resource-clear-bookmarks");
const countEl = document.getElementById("resource-count");
const bookmarkCountEl = document.getElementById("resource-bookmark-count");
const resourceGrid = document.getElementById("resource-grid");
const bookmarksPanel = document.getElementById("resource-bookmarks");

const STORAGE_KEY = "oracle_learn_resource_bookmarks_v1";
const LEVEL_ORDER = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3
};

let activeCategory = "all";
let activeLevel = "all";
let searchTerm = "";
let bookmarks = loadBookmarks();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadBookmarks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id) => RESOURCE_LINKS.some((item) => item.id === id)));
  } catch {
    return new Set();
  }
}

function saveBookmarks() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(bookmarks)));
  } catch {
    // Ignore storage write failures in restricted browser modes.
  }
}

function isBookmarked(id) {
  return bookmarks.has(id);
}

function toggleBookmark(id) {
  if (isBookmarked(id)) {
    bookmarks.delete(id);
  } else {
    bookmarks.add(id);
  }
  saveBookmarks();
}

function renderCategoryFilters() {
  if (!categoryFilters) {
    return;
  }

  const counts = RESOURCE_LINKS.reduce((acc, item) => {
    const current = acc.get(item.category) || 0;
    acc.set(item.category, current + 1);
    return acc;
  }, new Map());

  categoryFilters.innerHTML = ["all", ...RESOURCE_CATEGORIES]
    .map((category) => {
      const count = category === "all" ? RESOURCE_LINKS.length : counts.get(category) || 0;
      const label = category === "all" ? `All Categories (${count})` : `${category} (${count})`;
      return `<button class="chip ${category === activeCategory ? "is-active" : ""}" type="button" data-resource-category="${escapeHtml(category)}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function filteredResources() {
  const term = searchTerm.toLowerCase();

  return RESOURCE_LINKS.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }
    if (activeLevel !== "all" && item.level !== activeLevel) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = [item.title, item.summary, item.category, item.level, ...item.tags].join(" ").toLowerCase();
    return corpus.includes(term);
  }).sort((a, b) => {
    const bookmarkedOrder = Number(isBookmarked(b.id)) - Number(isBookmarked(a.id));
    if (bookmarkedOrder !== 0) {
      return bookmarkedOrder;
    }
    const categoryOrder = a.category.localeCompare(b.category);
    if (categoryOrder !== 0) {
      return categoryOrder;
    }
    const levelOrder = (LEVEL_ORDER[a.level] || 99) - (LEVEL_ORDER[b.level] || 99);
    if (levelOrder !== 0) {
      return levelOrder;
    }
    return a.title.localeCompare(b.title);
  });
}

function resourceCard(item) {
  const bookmarked = isBookmarked(item.id);
  return `
    <article class="card resource-card ${bookmarked ? "is-bookmarked" : ""}" id="resource-card-${escapeHtml(item.id)}">
      <div class="meta-row">
        <span class="tag">${escapeHtml(item.category)}</span>
        <span class="badge ${item.level}">${escapeHtml(item.level)}</span>
        <span class="tag">${bookmarked ? "Bookmarked" : "Not Bookmarked"}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <p><strong>Tags:</strong> ${item.tags.map((tag) => escapeHtml(tag)).join(", ")}</p>
      <div class="resource-actions">
        <a class="btn btn-primary" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Open Resource</a>
        <button class="copy-btn" type="button" data-copy-resource="${escapeHtml(item.url)}">Copy Link</button>
        <button class="btn ${bookmarked ? "btn-secondary" : "btn-terminal"}" type="button" data-toggle-resource="${escapeHtml(item.id)}">
          ${bookmarked ? "Remove Bookmark" : "Bookmark"}
        </button>
      </div>
    </article>
  `;
}

function renderBookmarkPanel() {
  if (!bookmarksPanel) {
    return;
  }

  const items = RESOURCE_LINKS.filter((item) => isBookmarked(item.id)).sort((a, b) => a.title.localeCompare(b.title));
  if (!items.length) {
    bookmarksPanel.innerHTML = `<p>No bookmarks yet. Save key docs to build your personal study list.</p>`;
    return;
  }

  bookmarksPanel.innerHTML = items
    .map(
      (item) => `
      <article class="card resource-bookmark-item">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.category)} • ${escapeHtml(item.level)}</p>
        <div class="resource-actions">
          <a class="btn btn-primary" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Open</a>
          <button class="btn btn-secondary" type="button" data-toggle-resource="${escapeHtml(item.id)}">Remove</button>
        </div>
      </article>
    `
    )
    .join("");
}

function renderResources() {
  if (!resourceGrid) {
    return;
  }

  const items = filteredResources();
  if (countEl) {
    countEl.textContent = `Showing ${items.length} of ${RESOURCE_LINKS.length} resources`;
  }
  if (bookmarkCountEl) {
    bookmarkCountEl.textContent = `Bookmarked ${bookmarks.size} resources`;
  }

  if (!items.length) {
    resourceGrid.innerHTML = `<article class="card"><h2>No resources matched</h2><p>Try adjusting filters or search terms.</p></article>`;
    renderBookmarkPanel();
    return;
  }

  resourceGrid.innerHTML = items.map((item) => resourceCard(item)).join("");
  renderBookmarkPanel();
}

function highlightResource(resourceId) {
  const card = document.getElementById(`resource-card-${resourceId}`);
  if (!card) {
    return;
  }
  card.classList.add("is-highlight");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    card.classList.remove("is-highlight");
  }, 1100);
}

searchInput?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  searchTerm = target.value.trim();
  renderResources();
});

categoryFilters?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (!target.matches("[data-resource-category]")) {
    return;
  }

  activeCategory = target.getAttribute("data-resource-category") || "all";
  renderCategoryFilters();
  renderResources();
});

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeLevel = button.getAttribute("data-resource-level") || "all";
    levelButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderResources();
  });
});

randomButton?.addEventListener("click", () => {
  const items = filteredResources();
  if (!items.length) {
    return;
  }
  const pending = items.filter((item) => !isBookmarked(item.id));
  const pool = pending.length ? pending : items;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  highlightResource(selected.id);
});

clearBookmarksButton?.addEventListener("click", () => {
  bookmarks = new Set();
  saveBookmarks();
  renderResources();
});

async function handleResourceAction(target) {
  if (target.matches("[data-copy-resource]")) {
    const link = target.getAttribute("data-copy-resource") || "";
    const copied = await copyTextWithFallback(link, "Copy this resource link");
    setTemporaryButtonLabel(target, copied, { timeoutMs: 900 });
    return true;
  }

  if (target.matches("[data-toggle-resource]")) {
    const id = target.getAttribute("data-toggle-resource") || "";
    if (!id) {
      return true;
    }
    toggleBookmark(id);
    renderResources();
    return true;
  }

  return false;
}

resourceGrid?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  await handleResourceAction(target);
});

bookmarksPanel?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  await handleResourceAction(target);
});

renderCategoryFilters();
renderResources();
