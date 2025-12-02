(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };

  const closeNav = (nav, btn) => {
    if (!nav || !btn) return;
    nav.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-lock");
  };

  ready(() => {
    setupNav();
    setFooterYear();

    function setupNav() {
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
      const normalize = (path) => (path || "").replace(/\/+$/, "").toLowerCase();
      const cur = normalize(window.location.pathname.replace(/^\/the-reverie/i, ""));
      document.querySelectorAll(".main-nav a[href]").forEach((a) => {
        const href = a.getAttribute("href") || "";
        let targetPath = "";
        try {
          targetPath = normalize(new URL(href, window.location.origin).pathname);
        } catch {
          targetPath = normalize(href);
        }
        const curNoBase = cur || "/";
        const targetNoBase = targetPath.replace(/^\/the-reverie/i, "") || "/";
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
