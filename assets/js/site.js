(() => {
  const include = async (name, path) => {
    const slot = document.querySelector(`[data-include="${name}"]`);
    if (!slot) return;
    const res = await fetch(path, { cache: "no-cache" });
    slot.innerHTML = await res.text();
  };

  include("header", "partials/header.html").then(() => {
    const btn = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    if (!btn || !nav) return;

    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  include("footer", "partials/footer.html").then(() => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  });
})();
