import { BLOG_POSTS } from "../data/blog-data.js";
import { ROADMAP_WEEKS } from "../data/roadmap-data.js";
import { COMMAND_ENTRIES } from "../data/commands-data.js";
import { QUIZ_QUESTIONS } from "../data/quiz-data.js";
import { FLASHCARDS } from "../data/flashcards-data.js";
import { LAB_ITEMS } from "../data/labs-data.js";

const weekFocusEl = document.getElementById("home-week-focus");
const blogFeedEl = document.getElementById("home-blog-feed");
const platformStatsEl = document.getElementById("home-platform-stats");
const ROADMAP_PROGRESS_KEY = "oracle_learn_roadmap_progress_v2";
const LEARNING_PAGE_COUNT = 11;

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

function loadCompletedWeeks() {
  try {
    const raw = window.localStorage.getItem(ROADMAP_PROGRESS_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((value) => Number.isInteger(value)));
  } catch {
    return new Set();
  }
}

function pickCurrentWeek() {
  if (!ROADMAP_WEEKS.length) {
    return null;
  }
  const sortedWeeks = [...ROADMAP_WEEKS].sort((a, b) => a.week - b.week);
  const completed = loadCompletedWeeks();
  const pending = sortedWeeks.find((entry) => !completed.has(entry.week));
  return {
    week: pending || sortedWeeks[sortedWeeks.length - 1],
    completedCount: Math.min(completed.size, sortedWeeks.length),
    totalCount: sortedWeeks.length,
    roadmapComplete: !pending
  };
}

function renderWeekFocus() {
  if (!weekFocusEl) {
    return;
  }

  const current = pickCurrentWeek();
  if (!current) {
    weekFocusEl.innerHTML = "<h2>This Week Focus</h2><p>Roadmap content is not available.</p>";
    return;
  }
  const week = current.week;

  weekFocusEl.innerHTML = `
    <p class="eyebrow">Week ${escapeHtml(week.week)}</p>
    <h2>${escapeHtml(week.focus)}</h2>
    <p><strong>Roadmap Progress:</strong> ${escapeHtml(String(current.completedCount))} / ${escapeHtml(String(current.totalCount))} weeks complete</p>
    <p><strong>Milestone:</strong> ${escapeHtml(week.milestone)}</p>
    <p><strong>Interview Checkpoint:</strong> ${escapeHtml(week.interviewCheckpoint)}</p>
    <p><strong>Status:</strong> ${current.roadmapComplete ? "All roadmap weeks completed. Use this week for revision and mock interviews." : "Current pending focus week from your roadmap tracker."}</p>
    <ul class="track-list">
      ${week.outcomes.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
    <div class="hero-actions">
      <a class="btn btn-secondary" href="roadmap.html">View Full Roadmap</a>
      <a class="btn btn-terminal" href="labs.html">Practice in Labs</a>
    </div>
  `;
}

function renderPlatformStats() {
  if (!platformStatsEl) {
    return;
  }
  platformStatsEl.innerHTML = `
    <div class="stat-card">
      <strong>${LEARNING_PAGE_COUNT}</strong>
      <span>Learning Pages</span>
    </div>
    <div class="stat-card">
      <strong>${COMMAND_ENTRIES.length}</strong>
      <span>DBA Commands</span>
    </div>
    <div class="stat-card">
      <strong>${QUIZ_QUESTIONS.length}</strong>
      <span>Quiz Questions</span>
    </div>
    <div class="stat-card">
      <strong>${FLASHCARDS.length}</strong>
      <span>Interview Flashcards</span>
    </div>
    <div class="stat-card">
      <strong>${LAB_ITEMS.length}</strong>
      <span>Lab Challenges</span>
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
renderPlatformStats();
