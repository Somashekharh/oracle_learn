import { BLOG_POSTS } from "../data/blog-data.js";

const searchInput = document.getElementById("blog-search");
const tagContainer = document.getElementById("blog-tags");
const listContainer = document.getElementById("blog-list");
const detailContainer = document.getElementById("blog-detail");

let activeTag = "all";
let searchTerm = "";

const allTags = Array.from(new Set(BLOG_POSTS.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b));

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function renderTags() {
  if (!tagContainer) {
    return;
  }

  tagContainer.innerHTML = ["all", ...allTags]
    .map((tag) => {
      const label = tag === "all" ? "All Tags" : tag;
      const activeClass = tag === activeTag ? "is-active" : "";
      return `<button class="chip ${activeClass}" data-blog-tag="${tag}">${label}</button>`;
    })
    .join("");

  const buttons = Array.from(tagContainer.querySelectorAll("[data-blog-tag]"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeTag = button.getAttribute("data-blog-tag") || "all";
      renderTags();
      renderList();
    });
  });
}

function filterPosts() {
  const term = searchTerm.toLowerCase();
  return BLOG_POSTS.filter((post) => {
    const tagOk = activeTag === "all" || post.tags.includes(activeTag);
    if (!tagOk) {
      return false;
    }

    if (!term) {
      return true;
    }

    const corpus = `${post.title} ${post.summary} ${post.tags.join(" ")} ${post.body.join(" ")}`.toLowerCase();
    return corpus.includes(term);
  });
}

function renderDetail(post) {
  if (!detailContainer || !post) {
    return;
  }

  detailContainer.innerHTML = `
    <h2>${post.title}</h2>
    <div class="blog-post-meta">
      <span class="tag">Last updated: ${formatDate(post.date)}</span>
      ${post.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    </div>
    <p>${post.summary}</p>
    ${post.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
  `;
}

function renderList() {
  if (!listContainer) {
    return;
  }

  const posts = filterPosts();
  if (!posts.length) {
    listContainer.innerHTML = `<article class="blog-item"><strong>No posts found</strong><small>Try another keyword or tag.</small></article>`;
    if (detailContainer) {
      detailContainer.innerHTML = `<h2>No matching post</h2><p>Adjust filters to find troubleshooting content.</p>`;
    }
    return;
  }

  listContainer.innerHTML = posts
    .map(
      (post, index) => `
      <article class="blog-item ${index === 0 ? "is-active" : ""}" data-blog-slug="${post.slug}" tabindex="0" role="button" aria-label="Open post ${post.title}">
        <strong>${post.title}</strong>
        <small>${formatDate(post.date)} • ${post.tags.join(", ")}</small>
      </article>
    `
    )
    .join("");

  renderDetail(posts[0]);

  const items = Array.from(listContainer.querySelectorAll(".blog-item"));
  items.forEach((item) => {
    const activate = () => {
      const slug = item.getAttribute("data-blog-slug");
      const post = posts.find((entry) => entry.slug === slug);
      if (!post) {
        return;
      }
      items.forEach((entry) => entry.classList.remove("is-active"));
      item.classList.add("is-active");
      renderDetail(post);
    };

    item.addEventListener("click", activate);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  const url = new URL(window.location.href);
  const requestedSlug = url.searchParams.get("post");
  if (requestedSlug) {
    const requested = posts.find((post) => post.slug === requestedSlug);
    if (requested) {
      const target = items.find((item) => item.getAttribute("data-blog-slug") === requested.slug);
      target?.click();
    }
  }
}

searchInput?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }
  searchTerm = target.value.trim();
  renderList();
});

renderTags();
renderList();
