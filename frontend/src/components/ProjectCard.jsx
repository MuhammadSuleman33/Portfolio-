export default function ProjectCard({ project, index, isAdmin, onOpenCase, onDelete }) {
  const cover = project.gallery?.[0] || {
    src: project.image_url,
    alt: project.title,
  };

  return (
    <article
      className={`work-card rv ${index % 2 === 1 ? "is-reversed" : ""}`}
      style={{ "--d": `${Math.min(index * 70, 210)}ms` }}
    >
      <div className="work-media" onClick={() => onOpenCase(project)}>
        <img src={cover.src} alt={cover.alt || project.title} loading="lazy" decoding="async" />
        <span className="live-pill-badge">
          <i aria-hidden="true" />
          Live
        </span>
      </div>

      <div className="work-info">
        <div className="work-meta">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true">—</span>
          <span>{project.tag || "Full-Stack Build"}</span>
        </div>

        <h3 className="work-title">{project.title}</h3>
        <p className="work-summary">{project.oneliner}</p>

        <div className="work-tags">
          {(project.tags || []).map((t, idx) => (
            <span key={idx}>{t}</span>
          ))}
        </div>

        <div className="work-actions">
          <button type="button" className="btn btn-outline" onClick={() => onOpenCase(project)}>
            <span>Case Study</span>
          </button>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              className="btn btn-amber"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Live Demo</span>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Source</span>
            </a>
          )}

          {isAdmin && (
            <button
              type="button"
              className="btn btn-danger-ghost"
              onClick={() => onDelete(project.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
