(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };

  const normalize = (path) => (path || "").replace(/\/+$/, "").toLowerCase();

  // Works for GitHub Pages project sites: /<repo-name>/...
  // Also behaves fine on user/org pages by returning "" when there's no path segment.
  const getBase = () => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts.length ? `/${parts[0]}` : "";
  };

  // Load header/footer partials into <div data-include="..."></div> elements.
  async function includePartials(base) {
    const containers = document.querySelectorAll("[data-include]");
    if (!containers.length) return;

    const fetchPartial = async (name) => {
      const url = `${base}/partials/${name}.html`;
      const res = await fetch(url);
      return res.ok ? await res.text() : "";
    };

    for (const el of containers) {
      const name = el.getAttribute("data-include");
      try {
        const html = await fetchPartial(name);
        el.outerHTML = html;
      } catch (err) {
        console.error("Failed to load partial:", name, err);
      }
    }
  }

  const prefixNavLinks = (base) => {
    document.querySelectorAll("[data-nav-path]").forEach((a) => {
      const path = a.getAttribute("data-nav-path");
      if (!path) return;
      const normalized = path.startsWith("/") ? path : `/${path}`;
      a.setAttribute("href", `${base}${normalized}`);
    });
  };

  const closeNav = (nav, btn) => {
    if (!nav || !btn) return;
    nav.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-lock");
  };

  ready(() => {
    const base = getBase();

    includePartials(base).then(() => {
      setupNav(base);
      setFooterYear();
    });

    function setupNav(basePath) {
      prefixNavLinks(basePath);

      const btn = document.querySelector(".nav-toggle");
      const nav = document.querySelector(".main-nav");

      if (btn && nav) {
        const navContainer = nav.closest(".site-header") || nav;

        btn.addEventListener("click", () => {
          const open = nav.classList.toggle("nav-open");
          btn.setAttribute("aria-expanded", String(open));
          document.body.classList.toggle("nav-lock", open);
          if (open) btn.focus();
        });

        nav.querySelectorAll("a").forEach((a) => {
          a.addEventListener("click", () => closeNav(nav, btn));
        });

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") closeNav(nav, btn);
        });

        document.addEventListener("click", (e) => {
          if (!nav.classList.contains("nav-open")) return;
          if (nav.contains(e.target) || btn.contains(e.target)) return;
          closeNav(nav, btn);
        });

        document.addEventListener("focusin", (e) => {
          if (!nav.classList.contains("nav-open")) return;
          if (navContainer.contains(e.target) || btn.contains(e.target)) return;
          closeNav(nav, btn);
        });
      }

      // Active nav link highlight
      const cur = normalize(window.location.pathname);
      document.querySelectorAll(".main-nav a[href]").forEach((a) => {
        const href = a.getAttribute("href") || "";
        let targetPath = "";
        try {
          targetPath = normalize(new URL(href, window.location.origin).pathname);
        } catch {
          targetPath = normalize(href);
        }
        const curNoBase = normalize(cur.replace(basePath.toLowerCase(), "")) || "/";
        const targetNoBase = normalize(targetPath.replace(basePath.toLowerCase(), "")) || "/";
        const active =
          curNoBase === targetNoBase ||
          (targetNoBase !== "/" && curNoBase.startsWith(targetNoBase + "/"));
        a.classList.toggle("active", active);
      });
    }

    function setFooterYear() {
      const year = document.getElementById("year");
      if (year) year.textContent = String(new Date().getFullYear());
    }
  });
})();
