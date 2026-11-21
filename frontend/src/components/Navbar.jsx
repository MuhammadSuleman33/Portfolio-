import { useState } from "react";

export default function Navbar({ activeSection, profile }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "work", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Skills" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <header className="site-nav">
        <div className="wrap nav-inner">
          <a href="#home" className="brand-link" aria-label={`${profile.name} — home`}>
            <span className="brand-badge">{profile.initials}</span>
            <span>{profile.name}</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? "is-active" : ""}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-cta-group nav-cta-desktop">
            <a href="#contact" className="btn btn-amber">
              Hire Me
            </a>
          </div>

          <button
            type="button"
            className="mob-menu-btn"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            {drawerOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="mob-drawer">
          <nav className="mob-drawer-list" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setDrawerOpen(false)}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </a>
            ))}
          </nav>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
            <a
              href="#contact"
              className="btn btn-amber"
              style={{ width: "100%", marginBottom: "14px" }}
              onClick={() => setDrawerOpen(false)}
            >
              Hire Me
            </a>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{profile.email}</p>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginTop: "2px" }}>
              {profile.phoneDisplay}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
