/* assets/js/site.js */
(() => {
  const getBase = () => {
    // Works for GitHub pages project sites: /<repo-name>/...
    const parts = window.location.pathname.split("/").filter(Boolean);
    // If path is just "/", base is ""
    if (parts.length === 0) return "";
    // Assume first segment is repo name (the-reverie)
    return `/${parts[0]}`;
  };

  const base = getBase();
  const abs = (p) => `${base}${p}`.replace(/\/+/g, "/");

  const ensureSiteCSS = () => {
    const want = abs("/assets/css/site.css");
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const already = links.some(l => (l.getAttribute("href") || "").includes("assets/css/site.css"));
    if (already) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = want;
    document.head.appendChild(link);
  };

  const fetchText = async (url) => {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return await res.text();
  };

  const insertHeaderFooter = async () => {
    // If page already has a header/footer (old standalone pages), do NOT inject again.
    const hasHeader = !!document.querySelector("header.site-header");
    const hasFooter = !!document.querySelector("footer.site-footer");

    const headerSlot =
      document.querySelector('[data-include="header"]') ||
      (() => {
        const d = document.createElement("div");
        d.setAttribute("data-include", "header");
        document.body.prepend(d);
        return d;
      })();

    const footerSlot =
      document.querySelector('[data-include="footer"]') ||
      (() => {
        const d = document.createElement("div");
        d.setAttribute("data-include", "footer");
        document.body.appendChild(d);
        return d;
      })();

    if (!hasHeader) {
      headerSlot.innerHTML = await fetchText(abs("/partials/header.html"));
      // Rewrite any root-relative links to include base (so they work on GitHub Pages project site)
      headerSlot.querySelectorAll("a[href]").forEach(a => {
        const href = a.getAttribute("href") || "";
        if (href.startsWith("/")) a.setAttribute("href", abs(href)); // "/pages/..." -> "/the-reverie/pages/..."
      });
    }

    if (!hasFooter) {
      footerSlot.innerHTML = await fetchText(abs("/partials/footer.html"));
    }

    // Nav toggle
    const btn = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    if (btn && nav) {
      btn.addEventListener("click", () => {
        const open = nav.classList.toggle("nav-open");
        btn.classList.toggle("nav-open", open);
        btn.setAttribute("aria-expanded", String(open));
      });

      // close after click
      nav.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
          nav.classList.remove("nav-open");
          btn.classList.remove("nav-open");
          btn.setAttribute("aria-expanded", "false");
        });
      });
    }

    // Active link (best effort)
    const cur = window.location.pathname.replace(/\/+$/, "");
    document.querySelectorAll(".main-nav a[href]").forEach(a => {
      const href = a.getAttribute("href") || "";
      try {
        const target = new URL(href, window.location.origin).pathname.replace(/\/+$/, "");
        const active = cur === target || (cur.startsWith(target) && target.includes("/pages/"));
        a.classList.toggle("active", active);
      } catch (_) {}
    });

    // Year
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  };

  const boot = async () => {
    ensureSiteCSS();
    try {
      await insertHeaderFooter();
    } catch (e) {
      // Don’t hard-fail the page; just log
      console.warn("[the-reverie] boot error:", e);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
