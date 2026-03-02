import { BLOG_POSTS } from "../data/blog-data.js";
import { ROADMAP_WEEKS } from "../data/roadmap-data.js";

const weekFocusEl = document.getElementById("home-week-focus");
const blogFeedEl = document.getElementById("home-blog-feed");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function pickCurrentWeek() {
  if (!ROADMAP_WEEKS.length) {
    return null;
  }

  const cycleStart = new Date("2026-01-05T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - cycleStart.getTime()) / 86400000);
  const cycleIndex = ((Math.floor(diffDays / 7) % ROADMAP_WEEKS.length) + ROADMAP_WEEKS.length) % ROADMAP_WEEKS.length;

  return ROADMAP_WEEKS[cycleIndex];
}

function renderWeekFocus() {
  if (!weekFocusEl) {
    return;
  }

  const week = pickCurrentWeek();
  if (!week) {
    weekFocusEl.innerHTML = "<h2>This Week Focus</h2><p>Roadmap content is not available.</p>";
    return;
  }

  weekFocusEl.innerHTML = `
    <p class="eyebrow">Week ${escapeHtml(week.week)}</p>
    <h2>${escapeHtml(week.focus)}</h2>
    <p><strong>Milestone:</strong> ${escapeHtml(week.milestone)}</p>
    <p><strong>Interview Checkpoint:</strong> ${escapeHtml(week.interviewCheckpoint)}</p>
    <ul class="track-list">
      ${week.outcomes.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
    <div class="hero-actions">
      <a class="btn btn-secondary" href="roadmap.html">View Full Roadmap</a>
      <a class="btn btn-terminal" href="labs.html">Practice in Labs</a>
    </div>
  `;
}

function renderLatestPosts() {
  if (!blogFeedEl) {
    return;
  }

  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  if (!posts.length) {
    blogFeedEl.innerHTML = '<article class="card"><h3>No posts yet</h3><p>Blog updates will appear here.</p></article>';
    return;
  }

  blogFeedEl.innerHTML = posts
    .map(
      (post) => `
        <article class="card link-card home-post-card">
          <div class="meta-row">
            <span class="badge ${escapeHtml(post.level)}">${escapeHtml(post.level)}</span>
            <span class="eyebrow">${escapeHtml(formatDate(post.date))}</span>
          </div>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.summary)}</p>
          <p class="flow-desc">${escapeHtml(post.readMinutes)} min read | Tags: ${escapeHtml(post.tags.join(", "))}</p>
          <a class="btn btn-terminal" href="blog.html?post=${escapeHtml(post.slug)}">Read Post</a>
        </article>
      `
    )
    .join("");
}

renderWeekFocus();
renderLatestPosts();
