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

function currentPath() {
  const path = window.location.pathname.split("/").pop();
  return path || "index.html";
}

function navLinkTemplate(item, active) {
  const activeClass = active === item.href ? "is-active" : "";
  return `<a class="nav-link ${activeClass}" href="${item.href}">${item.label}</a>`;
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
        <nav class="nav-links" aria-label="Primary navigation">
          ${NAV_ITEMS.map((item) => navLinkTemplate(item, activePath)).join("")}
        </nav>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-drawer" aria-label="Toggle menu">
          ☰
        </button>
      </div>
      <div id="mobile-drawer" class="mobile-drawer" aria-label="Mobile navigation">
        <div class="container">
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
    toggle.textContent = willOpen ? "✕" : "☰";
  });
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
        <p>Oracle Learn Platform • Oracle DBA and Security Learning • ${year}</p>
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
