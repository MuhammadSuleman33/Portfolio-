import { useEffect, useState } from "react";

export default function CaseStudyModal({ project, projects, onClose, onSelectProject }) {
  const [viewerIndex, setViewerIndex] = useState(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setViewerIndex(null);
    setZoomed(false);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (viewerIndex !== null) setViewerIndex(null);
        else onClose();
      } else if (viewerIndex !== null && project.gallery?.length > 1) {
        if (e.key === "ArrowRight") {
          setZoomed(false);
          setViewerIndex((prev) => (prev + 1) % project.gallery.length);
        } else if (e.key === "ArrowLeft") {
          setZoomed(false);
          setViewerIndex((prev) => (prev - 1 + project.gallery.length) % project.gallery.length);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [project, viewerIndex, onClose]);

  if (!project) return null;

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
  const gallery = project.gallery || [{ src: project.image_url, wide: true, framed: true, label: project.title, alt: project.title }];
  const activeSlide = viewerIndex !== null ? gallery[viewerIndex] : null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-bar">
            <span className="label">
              Project {String(currentIndex + 1).padStart(2, "0")} of {String(projects.length).padStart(2, "0")}
            </span>
            <button type="button" className="dialog-close" onClick={onClose}>
              <span>Back to portfolio</span>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="case-body">
            <div className="case-header">
              <h2 className="case-title">{project.title}</h2>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {project.githubUrl && (
                  <a href={project.githubUrl} className="btn btn-outline-glass" target="_blank" rel="noopener noreferrer">
                    <span>GitHub repo</span>
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} className="btn btn-dark" target="_blank" rel="noopener noreferrer">
                    <span>Visit live app</span>
                    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div className="case-gallery-grid">
              {gallery.map((g, i) => (
                <figure key={i} className={g.wide ? "wide" : ""}>
                  <button
                    type="button"
                    className={`gallery-btn ${g.framed ? "framed" : ""}`}
                    onClick={() => {
                      setZoomed(false);
                      setViewerIndex(i);
                    }}
                  >
                    <img src={g.src} alt={g.alt || project.title} decoding="async" />
                    <span className="gallery-zoom-badge">Zoom ↗</span>
                  </button>
                </figure>
              ))}
            </div>

            <p className="case-about">{project.about}</p>

            <div className="case-footer-nav">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {prevProject && (
                  <button
                    type="button"
                    className="btn btn-outline-glass"
                    onClick={() => onSelectProject(prevProject)}
                  >
                    ← {prevProject.title}
                  </button>
                )}
                {nextProject && (
                  <button
                    type="button"
                    className="btn btn-outline-glass"
                    onClick={() => onSelectProject(nextProject)}
                  >
                    {nextProject.title} →
                  </button>
                )}
              </div>
              <button type="button" className="btn btn-dark" onClick={onClose}>
                Back to portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {activeSlide && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 400 }}
          onClick={() => setViewerIndex(null)}
        >
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-bar">
              <span className="label" style={{ color: "var(--silver)" }}>
                Preview · Use arrow keys or click image to zoom
              </span>
              <button type="button" className="dialog-close" onClick={() => setViewerIndex(null)}>
                <span>Back to project</span>
                <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`image-stage ${zoomed ? "zoomed" : ""}`}>
              <img
                src={activeSlide.src}
                alt={activeSlide.alt || project.title}
                onClick={() => setZoomed((z) => !z)}
              />
            </div>

            <div className="image-toolbar">
              <p style={{ color: "#E2E8F0" }}>{activeSlide.label || project.title}</p>
              <div className="image-controls">
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomed(false);
                        setViewerIndex((viewerIndex - 1 + gallery.length) % gallery.length);
                      }}
                    >
                      ← Prev
                    </button>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--silver)" }}>
                      {viewerIndex + 1} / {gallery.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomed(false);
                        setViewerIndex((viewerIndex + 1) % gallery.length);
                      }}
                    >
                      Next →
                    </button>
                  </>
                )}
                <button type="button" onClick={() => setZoomed((z) => !z)}>
                  {zoomed ? "Fit screen" : "Zoom in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
