import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import ProjectCard from "./components/ProjectCard";
import CaseStudyModal from "./components/CaseStudyModal";
import UploadModal from "./components/UploadModal";
import LoginModal from "./components/LoginModal";
import { PROFILE } from "./data/defaultProjects";
import {
  fetchProjects,
  deleteProject,
  isAuthenticated,
  logoutAdmin,
} from "./services/api";

function normalizeApiProject(item) {
  return {
    id: item.id,
    isBuiltIn: false,
    tag: item.featured ? "Featured Product" : "Production Build",
    period: item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "2026",
    title: item.title,
    oneliner: item.summary,
    tags: Array.isArray(item.tech_stack) ? item.tech_stack : [],
    liveUrl: item.live_url || "",
    githubUrl: item.github_url || "",
    about: item.description,
    gallery: [
      {
        src: item.image_url,
        wide: true,
        framed: true,
        label: item.title,
        alt: item.title,
      },
    ],
  };
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isAdmin, setIsAdmin] = useState(isAuthenticated());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [scrollRatio, setScrollRatio] = useState(0);
  const [toast, setToast] = useState("");
  const [portraitVisible, setPortraitVisible] = useState(true);

  // Contact Composer State
  const [topic, setTopic] = useState("Full-Time Engineering Role");
  const [senderName, setSenderName] = useState("");
  const [senderSubject, setSenderSubject] = useState("Full-Time Engineering Role — Muhammad Suleman");
  const [senderMessage, setSenderMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const spotlightRef = useRef(null);
  const portraitRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  // Hidden Admin Access: Ctrl + Shift + A or #admin in URL
  useEffect(() => {
    const triggerAdmin = () => {
      if (isAuthenticated()) {
        setIsAdmin(true);
        setUploadOpen(true);
      } else {
        setLoginOpen(true);
      }
    };

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        triggerAdmin();
      }
    };

    const handleHashChange = () => {
      if (window.location.hash === "#admin") {
        triggerAdmin();
        window.history.replaceState(null, "", window.location.pathname);
      }
    };

    handleHashChange();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Load projects from FastAPI + Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const apiRows = await fetchProjects();
        const mapped = (apiRows || []).map(normalizeApiProject);
        setProjects(mapped);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    load();
  }, []);

  // Ambient Desktop Cursor Spotlight
  useEffect(() => {
    const onMove = (e) => {
      if (!spotlightRef.current) return;
      spotlightRef.current.style.opacity = "1";
      spotlightRef.current.style.transform = `translate3d(${e.clientX - 340}px, ${e.clientY - 340}px, 0)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Scroll Progress + Active Section Spy + Reveal Observer
  useEffect(() => {
    const handleScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollRatio(docH > 0 ? Math.min(Math.max(window.scrollY / docH, 0), 1) : 0);

      const offset = window.scrollY + window.innerHeight * 0.35;
      const sections = ["home", "about", "work", "experience", "education", "contact"];
      let current = "home";
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= offset) current = id;
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );

    document.querySelectorAll(".rv").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [projects, activeFilter, loadingProjects]);

  const handleMagnetic = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const dx = ((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 8;
    const dy = ((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 6;
    el.style.setProperty("--mx", `${dx.toFixed(1)}px`);
    el.style.setProperty("--my", `${dy.toFixed(1)}px`);
  };

  const resetMagnetic = (e) => {
    e.currentTarget.style.setProperty("--mx", "0px");
    e.currentTarget.style.setProperty("--my", "0px");
  };

  const handlePortraitMove = (e) => {
    if (e.pointerType !== "mouse" || !portraitRef.current) return;
    const r = portraitRef.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    portraitRef.current.style.setProperty("--rx", `${(-ny * 6).toFixed(2)}deg`);
    portraitRef.current.style.setProperty("--ry", `${(nx * 6).toFixed(2)}deg`);
  };

  const resetPortraitMove = () => {
    if (!portraitRef.current) return;
    portraitRef.current.style.setProperty("--rx", "0deg");
    portraitRef.current.style.setProperty("--ry", "0deg");
  };

  const copyText = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToast(label);
  };

  const handleDownloadCV = () => {
    const a = document.createElement("a");
    a.href = PROFILE.cvUrl;
    a.download = "Muhammad_Suleman_CV.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Downloading Muhammad_Suleman_CV.pdf...");
  };

  const handleProjectCreated = (createdRow) => {
    const formatted = normalizeApiProject(createdRow);
    setProjects((prev) => [formatted, ...prev]);
    setActiveFilter("All");
    showToast("Project published to Supabase!");
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project permanently from Supabase?")) return;
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) setSelectedProject(null);
      showToast("Project deleted.");
    } catch (err) {
      showToast("Session expired. Press Ctrl + Shift + A to sign in again.");
    }
  };

  const handleTopicSelect = (selectedTopic) => {
    setTopic(selectedTopic);
    setSenderSubject(`${selectedTopic} — Muhammad Suleman`);
  };

  const validateComposer = () => {
    const errs = {};
    if (!senderName.trim()) errs.name = "Please enter your name.";
    if (!senderSubject.trim()) errs.subject = "Please enter a subject.";
    if (!senderMessage.trim()) errs.body = "Please enter a message.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendGmail = (e) => {
    e.preventDefault();
    if (!validateComposer()) return;
    const subj = `${senderSubject.trim()} (${senderName.trim()})`;
    const body = `From: ${senderName.trim()}\n\n${senderMessage.trim()}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      PROFILE.email
    )}&su=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    showToast("Opening Gmail compose window...");
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  const filterCategories = ["All", "AI / FastAPI", "C# / .NET", "React / Web"];

  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => {
          const hay = `${p.title} ${p.oneliner} ${(p.tags || []).join(" ")}`.toLowerCase();
          if (activeFilter === "AI / FastAPI") {
            return hay.includes("ai") || hay.includes("fastapi") || hay.includes("python") || hay.includes("ml");
          }
          if (activeFilter === "C# / .NET") {
            return hay.includes("c#") || hay.includes(".net") || hay.includes("maui") || hay.includes("sql server");
          }
          if (activeFilter === "React / Web") {
            return hay.includes("react") || hay.includes("web") || hay.includes("supabase");
          }
          return true;
        });

  const marqueeTech = [
    "C# / .NET MAUI",
    "Python · FastAPI",
    "React.js",
    "Supabase",
    "PostgreSQL",
    "SQL Server",
    "Gemini · Groq · Cohere",
    "Scikit-learn · PyTorch",
    "Stripe",
    "Docker",
    "Vercel · Railway",
  ];

  return (
    <>
      <div className="bg-grid-layer" aria-hidden="true" />
      <div className="cursor-spotlight" ref={spotlightRef} style={{ opacity: 0 }} aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${scrollRatio})` }} />
      </div>

      <Navbar activeSection={activeSection} profile={PROFILE} />

      <main id="main">
        {/* HERO SECTION */}
        <section className="hero-editorial" id="home">
          <div className="hero-aurora-1" aria-hidden="true" />
          <div className="hero-aurora-2" aria-hidden="true" />

          <div className="wrap hero-grid">
            <div>
              <div className="hero-status-row hero-stagger" style={{ "--d": "60ms" }}>
                <span className="status-badge">
                  <span className="status-dot" aria-hidden="true" />
                  Available for work
                </span>
                <span className="location-tag">Pakistan · Remote &amp; On-site</span>
              </div>

              <h1 className="hero-headline">
                <span className="mask-line" style={{ "--d": "120ms" }}>
                  <span>I Turn Ideas Into</span>
                </span>
                <span className="mask-line" style={{ "--d": "220ms" }}>
                  <span>Digital Products</span>
                </span>
                <span className="mask-line" style={{ "--d": "320ms" }}>
                  <span>
                    That <span className="highlight">Work.</span>
                  </span>
                </span>
              </h1>

              <p className="hero-lead hero-stagger" style={{ "--d": "400ms" }}>
                Hi, I&apos;m <strong>{PROFILE.name}</strong> — C# / .NET developer, Full Stack &amp; AI/ML engineer. I build Android apps, REST APIs, and AI products from database architecture through production deployment.
              </p>

              <div className="hero-cta-row hero-stagger" style={{ "--d": "480ms" }}>
                <a
                  href="#contact"
                  className="btn btn-amber"
                  onPointerMove={handleMagnetic}
                  onPointerLeave={resetMagnetic}
                >
                  <span>Start a Project</span>
                  <svg className="icon icon-arrow" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#work"
                  className="btn btn-outline"
                  onPointerMove={handleMagnetic}
                  onPointerLeave={resetMagnetic}
                >
                  <span>View My Work</span>
                </a>
                <button
                  type="button"
                  className="btn btn-outline"
                  onPointerMove={handleMagnetic}
                  onPointerLeave={resetMagnetic}
                  onClick={handleDownloadCV}
                >
                  <span>Download CV</span>
                </button>
              </div>

              <div className="hero-quick-links hero-stagger" style={{ "--d": "540ms" }}>
                <a
                  href={`https://wa.me/${PROFILE.phoneRaw.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp {PROFILE.phoneDisplay}
                </a>
                <span>·</span>
                <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
                <span>·</span>
                <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </div>

              <ul className="hero-pill-list hero-stagger" style={{ "--d": "600ms" }}>
                <li>C# / .NET MAUI</li>
                <li>Python / FastAPI</li>
                <li>React.js</li>
                <li>PostgreSQL / SQL Server</li>
                <li>AI / ML</li>
              </ul>
            </div>

            <div className="hero-visual hero-stagger" style={{ "--d": "220ms" }}>
              <div
                className="portrait-frame"
                ref={portraitRef}
                onPointerMove={handlePortraitMove}
                onPointerLeave={resetPortraitMove}
              >
                <div className="portrait-inner">
                  {portraitVisible && (
                    <img
                      src={PROFILE.portraitUrl}
                      alt={PROFILE.name}
                      onError={() => setPortraitVisible(false)}
                    />
                  )}
                  <div className="portrait-fallback" aria-hidden="true">
                    <div className="portrait-fallback-badge">{PROFILE.initials}</div>
                  </div>
                </div>

                <span className="float-chip float-chip-1">Python · FastAPI</span>
                <span className="float-chip float-chip-2">C# · .NET MAUI</span>
                <span className="float-chip float-chip-3">React.js</span>
                <span className="float-chip float-chip-4">AI / ML</span>
              </div>
            </div>
          </div>
        </section>

        {/* INFINITE TECH MARQUEE */}
        <div className="marquee-strip" aria-hidden="true">
          <div className="marquee-track">
            {[...marqueeTech, ...marqueeTech].map((item, idx) => (
              <span key={idx}>{item}</span>
            ))}
          </div>
        </div>

        {/* 01 — WHAT I DO */}
        <section className="sec" id="about">
          <div className="wrap">
            <div className="sec-header-editorial rv">
              <div>
                <div className="sec-num-tag">
                  <span>01</span>
                  <span className="sec-num-line" aria-hidden="true" />
                  <span>What I do</span>
                </div>
                <h2 className="sec-heading">One developer. The whole stack.</h2>
              </div>
              <p className="sec-desc">
                From the first mobile or web screen to the database and AI pipeline behind it — one engineer who builds, connects, and ships all of it.
              </p>
            </div>

            <div className="cap-grid">
              <div className="cap-card rv">
                <div className="cap-icon-box" aria-hidden="true">
                  <svg className="icon" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </div>
                <h3>Frontend &amp; Mobile</h3>
                <p>
                  Responsive, fast web interfaces and native cross-platform Android applications built with clean architecture.
                </p>
                <ul className="cap-list">
                  <li>React.js</li>
                  <li>C#</li>
                  <li>.NET MAUI</li>
                  <li>XAML</li>
                  <li>MVVM</li>
                  <li>Responsive UI</li>
                </ul>
              </div>

              <div className="cap-card rv" style={{ "--d": "90ms" }}>
                <div className="cap-icon-box" aria-hidden="true">
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M4 7h16M4 12h16M4 17h10" />
                  </svg>
                </div>
                <h3>Backend &amp; AI Systems</h3>
                <p>
                  Asynchronous REST APIs, multi-model AI integrations, AutoML pipelines, and secure role-based authentication.
                </p>
                <ul className="cap-list">
                  <li>Python</li>
                  <li>FastAPI</li>
                  <li>Gemini · Groq · Cohere</li>
                  <li>Scikit-learn</li>
                  <li>PyTorch</li>
                  <li>Celery &amp; Redis</li>
                </ul>
              </div>

              <div className="cap-card rv" style={{ "--d": "180ms" }}>
                <div className="cap-icon-box" aria-hidden="true">
                  <svg className="icon" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                  </svg>
                </div>
                <h3>Database &amp; Deploy</h3>
                <p>
                  Normalized relational schemas, cloud object storage, payment subscriptions, and production CI/CD deployments.
                </p>
                <ul className="cap-list">
                  <li>PostgreSQL</li>
                  <li>SQL Server</li>
                  <li>Supabase</li>
                  <li>Stripe</li>
                  <li>Vercel &amp; Railway</li>
                  <li>Docker</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS STRIP */}
        <section className="metrics-strip">
          <div className="wrap metrics-grid">
            <div className="metric-box rv">
              <div className="metric-val">Full-Stack</div>
              <div className="metric-lbl">Web, Mobile &amp; AI Systems</div>
            </div>
            <div className="metric-box rv" style={{ "--d": "70ms" }}>
              <div className="metric-val">3 AI Models</div>
              <div className="metric-lbl">Integrated in Gigora SaaS</div>
            </div>
            <div className="metric-box rv" style={{ "--d": "140ms" }}>
              <div className="metric-val">2026</div>
              <div className="metric-lbl">BS Computer Science (IUB)</div>
            </div>
            <div className="metric-box rv" style={{ "--d": "210ms" }}>
              <div className="metric-val">End-to-End</div>
              <div className="metric-lbl">Database to Cloud Production</div>
            </div>
          </div>
        </section>

        {/* 02 — SELECTED WORK (100% Dynamic from Supabase) */}
        <section className="sec sec-alt" id="work">
          <div className="wrap">
            <div className="sec-header-editorial rv">
              <div>
                <div className="sec-num-tag">
                  <span>02</span>
                  <span className="sec-num-line" aria-hidden="true" />
                  <span>Selected Work</span>
                </div>
                <h2 className="sec-heading">Products, systems and interfaces.</h2>
              </div>
              <p className="sec-desc">
                Each project below is a live production build. Open any case study for architecture details and full-screen previews.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div className="filter-bar" style={{ marginBottom: 0 }}>
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-chip ${activeFilter === cat ? "is-active" : ""}`}
                    onClick={() => setActiveFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {isAdmin && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="btn btn-amber" onClick={() => setUploadOpen(true)}>
                    + Upload Project
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      logoutAdmin();
                      setIsAdmin(false);
                      showToast("Exited Admin mode.");
                    }}
                  >
                    Lock Admin
                  </button>
                </div>
              )}
            </div>

            {loadingProjects ? (
              <div className="projects-stack">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="work-card"
                    style={{ minHeight: "260px", opacity: 0.5 }}
                  />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div
                className="cap-card rv"
                style={{ textAlign: "center", padding: "3.5rem 1.5rem" }}
              >
                <p style={{ color: "var(--muted)" }}>
                  {projects.length === 0
                    ? "No projects published yet."
                    : "No projects match this filter."}
                </p>
              </div>
            ) : (
              <div className="projects-stack">
                {filteredProjects.map((p, idx) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    index={idx}
                    isAdmin={isAdmin}
                    onOpenCase={setSelectedProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 03 — EXPERIENCE WITH ANIMATED SPINE RUNNER */}
        <section className="sec" id="experience">
          <div className="wrap">
            <div className="sec-header-editorial rv">
              <div>
                <div className="sec-num-tag">
                  <span>03</span>
                  <span className="sec-num-line" aria-hidden="true" />
                  <span>Experience</span>
                </div>
                <h2 className="sec-heading">Recent engineering work.</h2>
              </div>
              <p className="sec-desc">
                BS Computer Science (2026). Delivering full-stack, mobile, and data-driven applications from architecture through deployment.
              </p>
            </div>

            <div className="exp-timeline-wrap">
              <div className="exp-spine" aria-hidden="true">
                <span className="exp-runner" />
              </div>

              <div className="exp-timeline">
                {[
                  {
                    date: "Aug 2026 – Present",
                    title: "Android LMS · UVAS Lahore",
                    text: "Architected and deployed an Android LMS covering curriculum, attendance, assessments, and grading on SQL Server.",
                    stack: ["C#", ".NET MAUI", "XAML", "MVVM", "SQL Server"],
                  },
                  {
                    date: "Jul – Aug 2026",
                    title: "Full Stack Developer · Mufasa Developer",
                    text: "Engineered and deployed Gigora on Railway and Vercel with Stripe subscription tiers and three integrated AI models.",
                    stack: ["Python", "FastAPI", "React", "PostgreSQL", "Stripe"],
                  },
                  {
                    date: "Feb – May 2026",
                    title: "Final Year Project · ICMS AutoML",
                    text: "Built an AutoML platform automating data cleaning, exploratory analysis, model selection, and SHAP evaluation.",
                    stack: ["Python", "Scikit-learn", "FastAPI", "Celery", "Redis"],
                  },
                ].map((item, i) => (
                  <div key={i} className="exp-card rv" style={{ "--d": `${i * 85}ms` }}>
                    <span className="exp-node-dot" aria-hidden="true" />
                    <div>
                      <span className="exp-period">{item.date}</span>
                    </div>
                    <div>
                      <h3 className="exp-role">{item.title}</h3>
                      <p className="exp-desc">{item.text}</p>
                      <div className="work-tags">
                        {item.stack.map((tech, idx) => (
                          <span key={idx}>{tech}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 04 — EDUCATION & CREDENTIALS */}
        <section className="sec sec-alt" id="education">
          <div className="wrap">
            <div className="sec-header-editorial rv">
              <div>
                <div className="sec-num-tag">
                  <span>04</span>
                  <span className="sec-num-line" aria-hidden="true" />
                  <span>Credentials</span>
                </div>
                <h2 className="sec-heading">Education &amp; certifications.</h2>
              </div>
              <p className="sec-desc">
                Academic foundation in computer science paired with specialized certifications in machine learning and software engineering.
              </p>
            </div>

            <div className="edu-grid">
              <div className="edu-card rv">
                <span className="exp-period" style={{ marginBottom: "14px" }}>
                  2022 – 2026
                </span>
                <h3 className="exp-role" style={{ fontSize: "1.4rem" }}>
                  The Islamia University of Bahawalpur
                </h3>
                <p style={{ color: "var(--ink-2)", marginTop: "6px" }}>
                  Bachelor of Computer Science (BSCS)
                </p>
                <div style={{ marginTop: "22px" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onPointerMove={handleMagnetic}
                    onPointerLeave={resetMagnetic}
                    onClick={handleDownloadCV}
                  >
                    <span>Download Full CV</span>
                  </button>
                </div>
              </div>

              <div className="edu-card rv" style={{ "--d": "85ms" }}>
                <h3 className="exp-role">Verified Certificates</h3>
                <div className="cert-item">
                  <span>Supervised Learning</span>
                  <span>Certificate</span>
                </div>
                <div className="cert-item">
                  <span>Unsupervised Learning</span>
                  <span>Certificate</span>
                </div>
                <div className="cert-item">
                  <span>Software Development</span>
                  <span>Certificate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05 — CONTACT */}
        <section className="sec" id="contact">
          <div className="wrap">
            <div className="sec-header-editorial rv">
              <div>
                <div className="sec-num-tag">
                  <span>05</span>
                  <span className="sec-num-line" aria-hidden="true" />
                  <span>Contact</span>
                </div>
                <h2 className="sec-heading">Let&apos;s build something together.</h2>
              </div>
              <p className="sec-desc">
                Open to C# / .NET, full-stack, and AI/ML engineering roles or freelance builds.
              </p>
            </div>

            <div className="contact-grid">
              <div className="contact-links-stack rv">
                <div className="contact-item-card">
                  <div>
                    <span className="contact-item-label">Email</span>
                    <span className="contact-item-val">{PROFILE.email}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        PROFILE.email
                      )}`}
                      className="chip-action"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Gmail
                    </a>
                    <button
                      type="button"
                      className="chip-action"
                      onClick={() => copyText(PROFILE.email, `Copied: ${PROFILE.email}`)}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="contact-item-card">
                  <div>
                    <span className="contact-item-label">Phone / WhatsApp</span>
                    <span className="contact-item-val">{PROFILE.phoneDisplay}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <a
                      href={`https://wa.me/${PROFILE.phoneRaw.replace(/\D/g, "")}`}
                      className="chip-action"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      className="chip-action"
                      onClick={() => copyText(PROFILE.phoneRaw, `Copied: ${PROFILE.phoneDisplay}`)}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="contact-item-card">
                  <div>
                    <span className="contact-item-label">GitHub</span>
                    <span className="contact-item-val">github.com/MuhammadSuleman33</span>
                  </div>
                  <a
                    href={PROFILE.github}
                    className="chip-action"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open
                  </a>
                </div>

                <div className="contact-item-card">
                  <div>
                    <span className="contact-item-label">LinkedIn</span>
                    <span className="contact-item-val">
                      linkedin.com/in/muhammad-suleman-riaz-095201355
                    </span>
                  </div>
                  <a
                    href={PROFILE.linkedin}
                    className="chip-action"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open
                  </a>
                </div>
              </div>

              <form className="composer-box rv" style={{ "--d": "85ms" }} onSubmit={handleSendGmail} noValidate>
                <h3 className="exp-role">Send a direct message</h3>
                <p style={{ fontSize: "0.84rem", color: "var(--muted)" }}>
                  Select a topic and open pre-filled in Gmail.
                </p>

                <div className="topic-pills">
                  {[
                    { label: "Full-time role", value: "Full-Time Engineering Role" },
                    { label: "AI / API project", value: "AI / FastAPI Project" },
                    { label: "Mobile / web app", value: "Mobile / Full-Stack Build" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`topic-pill ${topic === t.value ? "is-active" : ""}`}
                      onClick={() => handleTopicSelect(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="form-row">
                  <label htmlFor="senderName">Your name</label>
                  <input
                    id="senderName"
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name"
                  />
                  {formErrors.name && <div className="form-err">{formErrors.name}</div>}
                </div>

                <div className="form-row">
                  <label htmlFor="senderSubject">Subject</label>
                  <input
                    id="senderSubject"
                    type="text"
                    value={senderSubject}
                    onChange={(e) => setSenderSubject(e.target.value)}
                  />
                  {formErrors.subject && <div className="form-err">{formErrors.subject}</div>}
                </div>

                <div className="form-row">
                  <label htmlFor="senderMessage">
                    <span>Message</span>
                    <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                      {senderMessage.length} / 500
                    </span>
                  </label>
                  <textarea
                    id="senderMessage"
                    rows={4}
                    maxLength={500}
                    value={senderMessage}
                    onChange={(e) => setSenderMessage(e.target.value)}
                    placeholder="Hi Suleman, I saw your portfolio..."
                  />
                  {formErrors.body && <div className="form-err">{formErrors.body}</div>}
                </div>

                <button
                  type="submit"
                  className="btn btn-amber"
                  style={{ width: "100%" }}
                  onPointerMove={handleMagnetic}
                  onPointerLeave={resetMagnetic}
                >
                  <span>Send via Gmail</span>
                  <svg className="icon icon-arrow" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="wrap site-footer">
        <span>© 2026 {PROFILE.name} · C# / .NET · Full Stack · AI/ML</span>
        <a href="#home" style={{ color: "var(--amber-light)", fontWeight: 600 }}>
          Back to top ↑
        </a>
      </footer>

      {/* Case Study & Lightbox */}
      <CaseStudyModal
        project={selectedProject}
        projects={filteredProjects}
        onClose={() => setSelectedProject(null)}
        onSelectProject={setSelectedProject}
      />

      {/* Hidden Admin Modals (Triggered via Ctrl + Shift + A or #admin) */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setUploadOpen(true);
          showToast("Admin mode unlocked!");
        }}
      />

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleProjectCreated}
      />

      <div className={`toast ${toast ? "is-on" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
