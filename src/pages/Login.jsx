import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      navigate("/dashboard");
    } catch (err) {
      const msg = err.message;
      if (msg?.toLowerCase().includes("invalid")) {
        setError("❌ Email ou mot de passe incorrect.");
      } else if (msg?.toLowerCase().includes("email not confirmed")) {
        setError("❌ Email non confirmé — vérifiez votre boîte mail.");
      } else {
        setError(`❌ Connexion impossible — ${msg || "réessayez dans quelques secondes."}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "Courier New, monospace", background: "#fff", minHeight: "100vh" }}>
      <nav style={{ borderBottom: "1px solid #000", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="/logoSTOCKPREDI.png" alt="StockPredi" style={{ height: "32px" }} />
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#000" }}>STOCKPREDI</span>
        </Link>
        <Link to="/signup" style={{ textDecoration: "underline", color: "#000", fontSize: "14px" }}>Pas encore inscrit ?</Link>
      </nav>

      <div style={{ maxWidth: "400px", margin: "80px auto", padding: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "32px" }}>Connexion</h1>

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #cc0000", padding: "12px", marginBottom: "24px", fontSize: "14px", color: "#cc0000" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: "100%", border: "1px solid #000", padding: "10px 12px", fontFamily: "Courier New, monospace", fontSize: "14px", boxSizing: "border-box" }}
              placeholder="votre@email.com"
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: "100%", border: "1px solid #000", padding: "10px 12px", fontFamily: "Courier New, monospace", fontSize: "14px", boxSizing: "border-box" }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: "#000", color: "#fff", border: "none", padding: "14px", fontFamily: "Courier New, monospace", fontWeight: "700", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "14px", textAlign: "center" }}>
          Pas de compte ?{" "}
          <Link to="/signup" style={{ textDecoration: "underline", color: "#000" }}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
