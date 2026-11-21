import { useState } from "react";
import { loginAdmin } from "../services/api";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginAdmin(username, password);
      setUsername("");
      setPassword("");
      onLoginSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-xs" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-bar">
          <span className="label">Admin Authentication</span>
          <button type="button" className="dialog-close" onClick={onClose}>
            <span>Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700 }}>
            Sign in to Manage Projects
          </h2>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#FEE2E2", color: "#991B1B", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <div className="modal-field">
            <label>Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Sallu"
            />
          </div>

          <div className="modal-field">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-dark" disabled={loading} style={{ width: "100%", marginTop: "4px" }}>
            {loading ? "Signing in..." : "Unlock Upload Mode"}
          </button>
        </form>
      </div>
    </div>
  );
}
