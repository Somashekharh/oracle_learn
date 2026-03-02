import { BLOG_POSTS } from "../data/blog-data.js";

const searchInput = document.getElementById("blog-search");
const sortSelect = document.getElementById("blog-sort");
const clearButton = document.getElementById("blog-clear");
const tagContainer = document.getElementById("blog-tags");
const listContainer = document.getElementById("blog-list");
const detailContainer = document.getElementById("blog-detail");
const statsContainer = document.getElementById("blog-stats");

let activeTag = "all";
let searchTerm = "";
let sortMode = "latest";
let selectedSlug = null;

const allTags = Array.from(new Set(BLOG_POSTS.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b));

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function updateUrl(slug) {
  const url = new URL(window.location.href);
  url.searchParams.set("post", slug);
  window.history.replaceState({}, "", url);
}

function renderTags() {
  if (!tagContainer) {
    return;
  }

  tagContainer.innerHTML = ["all", ...allTags]
    .map((tag) => {
      const label = tag === "all" ? "All Tags" : tag;
      const activeClass = tag === activeTag ? "is-active" : "";
      return `<button class="chip ${activeClass}" type="button" data-blog-tag="${escapeHtml(tag)}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function filterPosts() {
  const term = searchTerm.toLowerCase();
  return BLOG_POSTS.filter((post) => {
    const matchesTag = activeTag === "all" || post.tags.includes(activeTag);
    if (!matchesTag) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = [
      post.title,
      post.summary,
      post.impact,
      post.tags.join(" "),
      post.symptoms.join(" "),
      post.triageCommands.join(" "),
      post.body.join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return corpus.includes(term);
  });
}

function sortPosts(posts) {
  const sorted = [...posts];

  if (sortMode === "oldest") {
    sorted.sort((a, b) => a.date.localeCompare(b.date));
    return sorted;
  }

  if (sortMode === "title") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }

  sorted.sort((a, b) => b.date.localeCompare(a.date));
  return sorted;
}

function getFilteredPosts() {
  return sortPosts(filterPosts());
}

function renderStats(filteredCount) {
  if (!statsContainer) {
    return;
  }

  const latestDate = BLOG_POSTS.map((post) => post.date)
    .sort((a, b) => b.localeCompare(a))[0] || "";

  const latestText = latestDate ? formatDate(latestDate) : "N/A";
  statsContainer.textContent = `Showing ${filteredCount} of ${BLOG_POSTS.length} posts | Latest update ${latestText}`;
}

function renderDetail(post, posts) {
  if (!detailContainer || !post) {
    return;
  }

  const currentIndex = posts.findIndex((entry) => entry.slug === post.slug);
  const previousPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  const relatedPosts = posts
    .filter((entry) => entry.slug !== post.slug)
    .filter((entry) => entry.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  detailContainer.innerHTML = `
    <div class="blog-detail-head">
      <h2>${escapeHtml(post.title)}</h2>
      <div class="blog-post-meta">
        <span class="tag">Last updated: ${escapeHtml(formatDate(post.date))}</span>
        <span class="tag">${escapeHtml(post.level)}</span>
        <span class="tag">${escapeHtml(String(post.readMinutes))} min read</span>
        ${post.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <p class="blog-subtitle">${escapeHtml(post.summary)}</p>
    </div>

    <section class="blog-detail-section">
      <h3>Incident Impact</h3>
      <p>${escapeHtml(post.impact)}</p>
    </section>

    <section class="blog-detail-section">
      <h3>Symptoms</h3>
      <ul class="checklist">
        ${post.symptoms.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>

    <section class="blog-detail-section">
      <h3>Triage Commands</h3>
      <div class="blog-code-list">
        ${post.triageCommands
          .map(
            (command, index) => `
              <article class="blog-code-card">
                <div class="meta-row">
                  <strong>Command ${index + 1}</strong>
                  <button class="copy-btn" type="button" data-command-index="${index}">Copy</button>
                </div>
                <pre class="code-block">${escapeHtml(command)}</pre>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="blog-detail-section">
      <h3>Resolution Flow</h3>
      <ol>
        ${post.body.map((paragraph) => `<li>${escapeHtml(paragraph)}</li>`).join("")}
      </ol>
    </section>

    <section class="blog-detail-section">
      <h3>Official References</h3>
      <ul class="blog-ref-list">
        ${post.references
          .map(
            (reference) =>
              `<li><a href="${escapeHtml(reference.url)}" target="_blank" rel="noreferrer">${escapeHtml(reference.label)}</a></li>`
          )
          .join("")}
      </ul>
    </section>

    <div class="blog-detail-nav">
      <button class="btn btn-secondary" type="button" data-blog-nav="prev" ${previousPost ? "" : "disabled"}>Previous</button>
      <button class="btn btn-terminal" type="button" data-copy-link="${escapeHtml(window.location.href)}">Copy Post Link</button>
      <button class="btn btn-secondary" type="button" data-blog-nav="next" ${nextPost ? "" : "disabled"}>Next</button>
    </div>

    <section class="blog-detail-section">
      <h3>Related Posts</h3>
      ${
        relatedPosts.length
          ? `<div class="blog-related-grid">${relatedPosts
              .map(
                (related) =>
                  `<button class="blog-related-item" type="button" data-related-slug="${escapeHtml(related.slug)}">${escapeHtml(related.title)}</button>`
              )
              .join("")}</div>`
          : "<p>No related posts for this filter set. Change tags to discover more topics.</p>"
      }
    </section>
  `;

  updateUrl(post.slug);

  const copyButtons = Array.from(detailContainer.querySelectorAll("[data-command-index]"));
  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const commandIndex = Number(button.getAttribute("data-command-index") || "-1");
      const command = post.triageCommands[commandIndex] || "";
      try {
        await navigator.clipboard.writeText(command);
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1200);
      } catch {
        button.textContent = "Copy failed";
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1400);
      }
    });
  });

  const copyLinkButton = detailContainer.querySelector("[data-copy-link]");
  copyLinkButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyLinkButton.textContent = "Link copied";
      window.setTimeout(() => {
        copyLinkButton.textContent = "Copy Post Link";
      }, 1200);
    } catch {
      copyLinkButton.textContent = "Copy failed";
      window.setTimeout(() => {
        copyLinkButton.textContent = "Copy Post Link";
      }, 1400);
    }
  });

  const navButtons = Array.from(detailContainer.querySelectorAll("[data-blog-nav]"));
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.getAttribute("data-blog-nav");
      if (direction === "prev" && previousPost) {
        selectedSlug = previousPost.slug;
        renderList();
      }
      if (direction === "next" && nextPost) {
        selectedSlug = nextPost.slug;
        renderList();
      }
    });
  });

  const relatedButtons = Array.from(detailContainer.querySelectorAll("[data-related-slug]"));
  relatedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedSlug = button.getAttribute("data-related-slug");
      renderList();
    });
  });
}

function renderList() {
  if (!listContainer) {
    return;
  }

  const posts = getFilteredPosts();
  renderStats(posts.length);

  if (!posts.length) {
    listContainer.innerHTML = `<article class="blog-item"><strong>No posts found</strong><small>Try another keyword or tag.</small></article>`;
    if (detailContainer) {
      detailContainer.innerHTML = `<h2>No matching post</h2><p>Adjust filters to find troubleshooting content.</p>`;
    }
    return;
  }

  const validSelected = posts.find((post) => post.slug === selectedSlug);
  if (!validSelected) {
    selectedSlug = posts[0].slug;
  }

  listContainer.innerHTML = posts
    .map((post) => {
      const isActive = post.slug === selectedSlug;
      return `
        <article class="blog-item ${isActive ? "is-active" : ""}" data-blog-slug="${escapeHtml(post.slug)}" tabindex="0" role="button" aria-label="Open post ${escapeHtml(post.title)}">
          <div class="blog-item-header">
            <strong>${escapeHtml(post.title)}</strong>
            <span class="badge ${escapeHtml(post.level)}">${escapeHtml(post.level)}</span>
          </div>
          <small>${escapeHtml(formatDate(post.date))} | ${escapeHtml(post.readMinutes)} min</small>
          <div class="blog-item-tags">
            ${post.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");

  const current = posts.find((post) => post.slug === selectedSlug) || posts[0];
  renderDetail(current, posts);

  const items = Array.from(listContainer.querySelectorAll(".blog-item"));
  items.forEach((item) => {
    const activate = () => {
      selectedSlug = item.getAttribute("data-blog-slug");
      renderList();
    };

    item.addEventListener("click", activate);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
}

function bindEvents() {
  if (tagContainer) {
    tagContainer.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const button = target.closest("[data-blog-tag]");
      if (!button) {
        return;
      }

      activeTag = button.getAttribute("data-blog-tag") || "all";
      renderTags();
      renderList();
    });
  }

  searchInput?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    searchTerm = target.value.trim();
    renderList();
  });

  sortSelect?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    sortMode = target.value;
    renderList();
  });

  clearButton?.addEventListener("click", () => {
    activeTag = "all";
    searchTerm = "";
    sortMode = "latest";
    if (searchInput) {
      searchInput.value = "";
    }
    if (sortSelect) {
      sortSelect.value = "latest";
    }
    renderTags();
    renderList();
  });
}

function setInitialSelection() {
  const url = new URL(window.location.href);
  const requestedSlug = url.searchParams.get("post");
  if (requestedSlug && BLOG_POSTS.some((post) => post.slug === requestedSlug)) {
    selectedSlug = requestedSlug;
    return;
  }

  const sorted = sortPosts(BLOG_POSTS);
  selectedSlug = sorted[0]?.slug || null;
}

setInitialSelection();
renderTags();
bindEvents();
renderList();
