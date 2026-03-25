const NAV_ITEMS = [
  { href: "index.html", label: "Home" },
  { href: "modules.html", label: "Modules" },
  { href: "architecture.html", label: "Architecture" },
  { href: "dataflow.html", label: "Data Flow" },
  { href: "commands.html", label: "Commands" },
  { href: "dba-life.html", label: "DBA Life" },
  { href: "roadmap.html", label: "Roadmap" },
  { href: "labs.html", label: "Labs" },
  { href: "security.html", label: "Security" },
  { href: "resources.html", label: "Resources" },
  { href: "blog.html", label: "Blog" }
];

const NAV_SEARCH_ITEMS = [
  { href: "index.html", label: "Home", keywords: "start learning oracle platform overview" },
  { href: "modules.html", label: "Learning Modules", keywords: "module fundamentals architecture installation administration" },
  { href: "architecture.html", label: "Architecture", keywords: "instance sga pga dbwr lgwr smon pmon ckpt arcn" },
  { href: "dataflow.html", label: "Data Flow", keywords: "select insert update delete commit rollback ddl" },
  { href: "commands.html", label: "DBA Commands", keywords: "sql command center rman datapump linux" },
  { href: "dba-life.html", label: "DBA Life", keywords: "daily workflow runbook monitoring backup tuning" },
  { href: "roadmap.html", label: "Roadmap", keywords: "6 week study plan progression" },
  { href: "labs.html", label: "Labs and Quiz", keywords: "practice flashcards interview questions quiz" },
  { href: "security.html", label: "Security", keywords: "hardening auditing roles privileges tde" },
  { href: "resources.html", label: "Resources", keywords: "reference docs oracle links" },
  { href: "blog.html", label: "Troubleshooting Blog", keywords: "incident ora errors performance recovery" }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function currentPath() {
  const path = window.location.pathname.split("/").pop();
  return path || "index.html";
}

function navLinkTemplate(item, active) {
  const activeClass = active === item.href ? "is-active" : "";
  return `<a class="nav-link ${activeClass}" href="${item.href}">${item.label}</a>`;
}

function filterSearchItems(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const terms = normalized.split(/\s+/).filter(Boolean);
  return NAV_SEARCH_ITEMS.filter((item) => {
    const corpus = `${item.label} ${item.keywords}`.toLowerCase();
    return terms.every((term) => corpus.includes(term));
  }).slice(0, 8);
}

function renderSearchResults(resultsEl, items) {
  if (!resultsEl) {
    return;
  }

  if (!items.length) {
    resultsEl.innerHTML = `<p class="nav-search-empty">No matching page.</p>`;
    resultsEl.hidden = false;
    return;
  }

  resultsEl.innerHTML = items
    .map((item) => `<a class="nav-search-item" href="${item.href}">${escapeHtml(item.label)}</a>`)
    .join("");
  resultsEl.hidden = false;
}

function wireSingleSearch(inputEl, resultsEl, wrapper) {
  if (!inputEl || !resultsEl || !wrapper) {
    return;
  }

  const closeResults = () => {
    resultsEl.hidden = true;
    resultsEl.innerHTML = "";
  };

  inputEl.addEventListener("input", () => {
    const items = filterSearchItems(inputEl.value);
    if (!inputEl.value.trim()) {
      closeResults();
      return;
    }
    renderSearchResults(resultsEl, items);
  });

  inputEl.addEventListener("focus", () => {
    if (!inputEl.value.trim()) {
      return;
    }
    renderSearchResults(resultsEl, filterSearchItems(inputEl.value));
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const matches = filterSearchItems(inputEl.value);
      if (!matches.length) {
        return;
      }
      event.preventDefault();
      window.location.href = matches[0].href;
      return;
    }

    if (event.key === "ArrowDown") {
      const first = resultsEl.querySelector(".nav-search-item");
      if (first instanceof HTMLElement) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (event.key === "Escape") {
      closeResults();
    }
  });

  resultsEl.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeResults();
      inputEl.focus();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (!wrapper.contains(target)) {
      closeResults();
    }
  });
}

function wireNavSearch(host) {
  if (!host) {
    return;
  }

  wireSingleSearch(
    host.querySelector("#nav-search-input"),
    host.querySelector("#nav-search-results"),
    host.querySelector(".nav-search-desktop")
  );

  wireSingleSearch(
    host.querySelector("#mobile-nav-search-input"),
    host.querySelector("#mobile-nav-search-results"),
    host.querySelector(".nav-search-mobile")
  );
}

function renderNav() {
  const host = document.querySelector("[data-site-nav]");
  if (!host) {
    return;
  }

  const activePath = currentPath();
  host.innerHTML = `
    <header class="top-nav">
      <div class="container nav-inner">
        <a class="brand" href="index.html" aria-label="Oracle Learn home">
          <span class="brand-mark">OL</span>
          <span class="brand-copy">
            <strong>Oracle Learn</strong>
            <span>Oracle Learning Platform</span>
          </span>
        </a>
        <div class="nav-meta">
          <nav class="nav-links" aria-label="Primary navigation">
            ${NAV_ITEMS.map((item) => navLinkTemplate(item, activePath)).join("")}
          </nav>
          <div class="nav-search nav-search-desktop" role="search">
            <label class="sr-only" for="nav-search-input">Search site pages</label>
            <input id="nav-search-input" class="nav-search-input" type="search" placeholder="Search pages..." autocomplete="off" />
            <div id="nav-search-results" class="nav-search-results" hidden></div>
          </div>
          <button class="btn btn-secondary nav-feedback-btn" type="button" data-feedback-open>Feedback</button>
        </div>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-drawer" aria-label="Toggle menu">
          ☰
        </button>
      </div>
      <div id="mobile-drawer" class="mobile-drawer" aria-label="Mobile navigation">
        <div class="container">
          <div class="nav-search nav-search-mobile" role="search">
            <label class="sr-only" for="mobile-nav-search-input">Search site pages</label>
            <input id="mobile-nav-search-input" class="nav-search-input" type="search" placeholder="Search pages..." autocomplete="off" />
            <div id="mobile-nav-search-results" class="nav-search-results" hidden></div>
          </div>
          ${NAV_ITEMS.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
          <button class="btn btn-secondary mobile-feedback-btn" type="button" data-feedback-open>Give Feedback</button>
        </div>
      </div>
    </header>
  `;

  const toggle = host.querySelector(".nav-toggle");
  const drawer = host.querySelector("#mobile-drawer");
  if (!toggle || !drawer) {
    return;
  }

  toggle.addEventListener("click", () => {
    const willOpen = !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.textContent = willOpen ? "X" : "☰";
  });

  const mobileLinks = Array.from(drawer.querySelectorAll("a"));
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    });
  });

  wireNavSearch(host);
}

function renderFooter() {
  const host = document.querySelector("[data-site-footer]");
  if (!host) {
    return;
  }

  const year = new Date().getFullYear();
  host.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <p>Oracle Learn Platform | Oracle DBA and Security Learning | ${year}</p>
        <div class="footer-links">
          <a href="modules.html">Modules</a>
          <a href="commands.html">Commands</a>
          <a href="labs.html">Labs</a>
          <a href="security.html">Security</a>
          <a href="resources.html">Resources</a>
          <a href="blog.html">Blog</a>
          <button class="footer-feedback-btn" type="button" data-feedback-open>Feedback</button>
        </div>
      </div>
    </footer>
  `;
}

function revealOnScroll() {
  const targets = Array.from(document.querySelectorAll(".reveal"));
  if (!targets.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
    observer.observe(el);
  });
}

renderNav();
renderFooter();
revealOnScroll();

// ------------------------------
// Feedback popup (timed)
// ------------------------------
const FEEDBACK_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
const FEEDBACK_POPUP_DELAY_MS = 15000; // show after user stays on page for ~15s
const FEEDBACK_MAX_SHOWN_PER_SESSION = 1;
const FEEDBACK_STORAGE_KEY = "oracle_learn_feedback_popup_v1";
const FEEDBACK_STORAGE_KEY_SUBMITTED = "oracle_learn_feedback_submitted_v1";

function isLikelyFeedbackConfigured() {
  return typeof FEEDBACK_SCRIPT_URL === "string" && !FEEDBACK_SCRIPT_URL.includes("PASTE_");
}

function getTodayKey() {
  // Local day so users don't get spammed repeatedly across visits.
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function canShowFeedbackPopup() {
  try {
    // If already submitted at least once, do not ask again.
    if (window.localStorage.getItem(FEEDBACK_STORAGE_KEY_SUBMITTED) === "1") {
      return false;
    }

    const shownRaw = window.sessionStorage.getItem(`${FEEDBACK_STORAGE_KEY}:shown`);
    const shownCount = shownRaw ? Number(shownRaw) : 0;
    if (shownCount >= FEEDBACK_MAX_SHOWN_PER_SESSION) {
      return false;
    }

    // Optional daily throttling: store the last day popup was dismissed/shown.
    // This keeps it calmer even across reloads.
    const lastDayRaw = window.localStorage.getItem(`${FEEDBACK_STORAGE_KEY}:lastDay`);
    const today = getTodayKey();
    if (lastDayRaw === today) {
      return false;
    }

    return true;
  } catch {
    // If storage is blocked, prefer not to spam.
    return false;
  }
}

function markFeedbackShown() {
  try {
    const shownRaw = window.sessionStorage.getItem(`${FEEDBACK_STORAGE_KEY}:shown`);
    const shownCount = shownRaw ? Number(shownRaw) : 0;
    window.sessionStorage.setItem(`${FEEDBACK_STORAGE_KEY}:shown`, String(shownCount + 1));
    window.localStorage.setItem(`${FEEDBACK_STORAGE_KEY}:lastDay`, getTodayKey());
  } catch {
    // ignore
  }
}

function setFeedbackSubmitted() {
  try {
    window.localStorage.setItem(FEEDBACK_STORAGE_KEY_SUBMITTED, "1");
  } catch {
    // ignore
  }
}

function createFeedbackPopup() {
  const overlay = document.createElement("div");
  overlay.className = "feedback-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "feedback-title");

  const modal = document.createElement("div");
  modal.className = "feedback-modal";
  modal.tabIndex = -1;

  modal.innerHTML = `
    <div class="feedback-header">
      <h2 id="feedback-title">Quick feedback</h2>
      <button type="button" class="feedback-close" aria-label="Close feedback form">×</button>
    </div>

    <p class="feedback-subtitle">Help me improve Oracle Learn. It will take about 30 seconds.</p>

    <form id="feedback-form" class="feedback-form">
      <label for="feedback-name">Name (optional)</label>
      <input id="feedback-name" name="name" class="feedback-input" type="text" maxlength="120" placeholder="Your name" />

      <label for="feedback-email">Email (optional)</label>
      <input id="feedback-email" name="email" class="feedback-input" type="email" maxlength="180" placeholder="you@example.com" />

      <label for="feedback-liked-most">What did you like most?</label>
      <textarea id="feedback-liked-most" name="likedMost" class="feedback-textarea" required rows="4" placeholder="Example: The labs made learning easy..." maxlength="2000"></textarea>

      <label for="feedback-improvements">What improvements would you suggest?</label>
      <textarea id="feedback-improvements" name="improvements" class="feedback-textarea" required rows="4" placeholder="Example: Add more real-world DBA scenarios..." maxlength="2000"></textarea>

      <label for="feedback-bugs">Did you find any bugs? (optional)</label>
      <textarea id="feedback-bugs" name="bugs" class="feedback-textarea" rows="3" placeholder="Tell us the page and what happened..." maxlength="2000"></textarea>

      <label for="feedback-comments">Any other comments? (optional)</label>
      <textarea id="feedback-comments" name="comments" class="feedback-textarea" rows="3" placeholder="Any final thoughts..." maxlength="2000"></textarea>

      <label for="feedback-rating">How would you rate the website?</label>
      <select id="feedback-rating" name="rating" class="feedback-select" required>
        <option value="" selected disabled>Select a rating</option>
        <option value="5">5</option>
        <option value="4">4</option>
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>
      </select>

      <div class="feedback-meta">
        <input type="hidden" name="page" />
        <input type="hidden" name="url" />
        <input type="hidden" name="title" />
      </div>

      <div class="feedback-actions">
        <button type="button" class="btn btn-secondary feedback-dismiss">Not now</button>
        <button type="submit" class="btn btn-primary feedback-submit">Submit feedback</button>
      </div>

      <p id="feedback-status" class="feedback-status" aria-live="polite"></p>
    </form>
  `;

  overlay.appendChild(modal);
  return overlay;
}

function wireFeedbackPopup(overlay, onClose) {
  const form = overlay.querySelector("#feedback-form");
  const likedMostEl = overlay.querySelector("#feedback-liked-most");
  const statusEl = overlay.querySelector("#feedback-status");
  const dismissBtn = overlay.querySelector(".feedback-dismiss");
  const closeBtn = overlay.querySelector(".feedback-close");
  const pageInput = overlay.querySelector('input[name="page"]');
  const urlInput = overlay.querySelector('input[name="url"]');
  const titleInput = overlay.querySelector('input[name="title"]');

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  function close() {
    overlay.remove();
    if (typeof onClose === "function") {
      onClose();
    }
  }

  dismissBtn?.addEventListener("click", () => close(), { once: true });
  closeBtn?.addEventListener("click", () => close(), { once: true });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        close();
      }
    },
    { once: true }
  );

  if (pageInput && urlInput && titleInput) {
    pageInput.value = window.location.pathname || "";
    urlInput.value = window.location.href || "";
    titleInput.value = document.title || "";
  }

  // Focus the first question for accessibility/UX.
  likedMostEl?.focus();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.textContent = "";

    const payloadFromForm = new FormData(form);
    const payload = {
      // Field names are chosen to make Apps Script mapping simple.
      name: String(payloadFromForm.get("name") || ""),
      email: String(payloadFromForm.get("email") || ""),
      likedMost: String(payloadFromForm.get("likedMost") || ""),
      improvements: String(payloadFromForm.get("improvements") || ""),
      bugs: String(payloadFromForm.get("bugs") || ""),
      comments: String(payloadFromForm.get("comments") || ""),
      rating: String(payloadFromForm.get("rating") || ""),
      page: String(payloadFromForm.get("page") || ""),
      url: String(payloadFromForm.get("url") || ""),
      title: String(payloadFromForm.get("title") || ""),
      submittedAt: new Date().toISOString()
    };

    // Basic front-end sanity checks (server should also validate).
    if (!payload.likedMost.trim() || !payload.improvements.trim()) {
      statusEl.textContent = "Please fill in the required fields.";
      statusEl.classList.add("is-error");
      return;
    }

    if (!isLikelyFeedbackConfigured()) {
      statusEl.textContent = "Feedback is not configured yet. Please paste the Apps Script URL in `main.js`.";
      statusEl.classList.add("is-error");
      return;
    }

    statusEl.textContent = "Submitting...";

    try {
      const response = await fetch(FEEDBACK_SCRIPT_URL, {
        method: "POST",
        // Send as x-www-form-urlencoded to avoid CORS preflight issues.
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: new URLSearchParams(payload).toString(),
        // Avoid caching feedback submissions in some setups.
        cache: "no-store"
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      setFeedbackSubmitted();
      statusEl.textContent = "Thanks! Your feedback has been submitted.";
      statusEl.classList.remove("is-error");

      // Close after a short moment so the user sees confirmation.
      setTimeout(() => close(), 900);
    } catch (err) {
      statusEl.textContent = `Could not submit feedback. Please try again later.`;
      statusEl.classList.add("is-error");
      // Keep details in console for debugging.
      console.error("Feedback submit error:", err);
    }
  });
}

function openFeedbackPopup() {
  if (document.querySelector(".feedback-overlay")) {
    return;
  }

  const overlay = createFeedbackPopup();
  wireFeedbackPopup(overlay, () => {
    document.body.classList.remove("is-feedback-open");
  });
  document.body.classList.add("is-feedback-open");
  document.body.appendChild(overlay);
}

function renderFeedbackLauncher() {
  if (document.querySelector(".feedback-float-btn")) {
    return;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-primary feedback-float-btn";
  button.setAttribute("data-feedback-open", "");
  button.textContent = "Feedback";
  document.body.appendChild(button);
}

function wireFeedbackTriggers() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const trigger = target.closest("[data-feedback-open]");
    if (!trigger) {
      return;
    }
    event.preventDefault();
    openFeedbackPopup();
  });
}

function initFeedbackPopup() {
  if (!canShowFeedbackPopup()) {
    return;
  }

  window.setTimeout(() => {
    if (!canShowFeedbackPopup()) {
      return;
    }
    markFeedbackShown();
    openFeedbackPopup();
  }, FEEDBACK_POPUP_DELAY_MS);
}

renderFeedbackLauncher();
wireFeedbackTriggers();
initFeedbackPopup();
