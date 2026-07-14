const page = document.body.dataset.page || "start";

const navItems = [
  { key: "start", label: "Start", href: "index.html", icon: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>` },
  { key: "oferta", label: "Oferta", href: "oferta.html", icon: `<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>` },
  { key: "cennik", label: "Cennik", href: "cennik.html", icon: `<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>` },
  { key: "imprezy", label: "Imprezy", href: "imprezy.html", icon: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>` },
  { key: "galeria", label: "Galeria", href: "galeria.html", icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>` },
  { key: "kontakt", label: "Kontakt", href: "kontakt.html", icon: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>` }
];

function renderHeader() {
  const target = document.querySelector("[data-site-header]");
  if (!target) return;
  target.innerHTML = `
    <header class="topbar">
      <div class="topbar-line left-line"></div>
      <a class="brand" href="index.html">
        <img src="assets/media/LOGO LT.jpg" alt="Logo Laser Tag">
      </a>
      <div class="topbar-line right-line"></div>
      
      <nav class="desktop-nav">
        ${navItems.map(item => `<a class="${page === item.key ? "active" : ""}" href="${item.href}">${item.label}</a>`).join("")}
      </nav>
    </header>
    
    <nav class="bottom-nav glass">
      ${navItems.filter(item => item.key !== "imprezy").map(item => `
        <a class="${page === item.key ? "active" : ""}" href="${item.href}">
          ${item.icon}
          ${item.label}
        </a>
      `).join("")}
    </nav>
  `;
}

function renderFooter() {
  const target = document.querySelector("[data-site-footer]");
  if (!target) return;
  target.innerHTML = `
    <footer>
      <p>&copy; ${new Date().getFullYear()} Magazyn Laser Tag Giżycko. Wszelkie prawa zastrzeżone.</p>
    </footer>
  `;
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-on-scroll').forEach(el => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  initScrollAnimations();
});
