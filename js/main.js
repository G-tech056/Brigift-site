const navToggle=document.querySelector(".nav-toggle");
const navMenu = document.getElementById("nav-menu");

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", isOpen);
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
});

const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

const loadMapButton = document.getElementById("load-map");

if (loadMapButton) {
  loadMapButton.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = loadMapButton.dataset.src;
    iframe.title = "Map showing the BRIGIFT Gas & Electricals shop in Utawala, Nairobi";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.allowFullscreen = true;

    document.getElementById("map-wrap").replaceChildren(iframe);
  });
}