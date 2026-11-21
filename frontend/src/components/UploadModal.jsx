import { useState } from "react";
import { uploadProject } from "../services/api";

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [featured, setFeatured] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Please select a project screenshot (PNG, JPG, or WEBP).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("summary", summary);
      formData.append("description", description);
      formData.append("tech_stack", techStack);
      if (githubUrl) formData.append("github_url", githubUrl);
      if (liveUrl) formData.append("live_url", liveUrl);
      formData.append("featured", featured);
      formData.append("image", imageFile);

      const created = await uploadProject(formData);
      onSuccess(created);

      setTitle("");
      setSummary("");
      setDescription("");
      setTechStack("");
      setGithubUrl("");
      setLiveUrl("");
      setFeatured(true);
      setImageFile(null);
      setPreviewUrl("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-sm" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-bar">
          <span className="label">Supabase Storage &amp; Database</span>
          <button type="button" className="dialog-close" onClick={onClose}>
            <span>Cancel</span>
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>
            Upload New Project
          </h2>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#FEE2E2", color: "#991B1B", fontSize: "0.86rem" }}>
              {error}
            </div>
          )}

          <div className="modal-field">
            <label>Project Screenshot *</label>
            <label className="upload-dropzone" style={{ display: "block" }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ maxHeight: "180px", margin: "0 auto", borderRadius: "10px" }} />
              ) : (
                <div style={{ padding: "14px 0", color: "var(--muted)", fontSize: "0.9rem" }}>
                  Click to choose PNG, JPG, or WEBP screenshot
                </div>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="modal-field">
              <label>Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gigora AI"
              />
            </div>

            <div className="modal-field">
              <label>Tech Stack (comma separated) *</label>
              <input
                type="text"
                required
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="FastAPI, React, Supabase"
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Card Summary (1 sentence) *</label>
            <input
              type="text"
              required
              maxLength={300}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short summary displayed on the portfolio card..."
            />
          </div>

          <div className="modal-field">
            <label>Case Study Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed architecture, features, and deployment details..."
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="modal-field">
              <label>Live Site URL</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="modal-field">
              <label>GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Mark as Featured / Live Web App
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid var(--line-dark)" }}>
            <button type="button" className="btn btn-outline-glass" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? "Uploading to Supabase..." : "Publish Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
