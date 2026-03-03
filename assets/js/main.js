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
