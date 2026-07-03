import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function Signup() {
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { setError("Mot de passe minimum 8 caractères"); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` }
      });
      if (err) throw err;
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Inscription impossible");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ fontFamily: "Courier New, monospace", background: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "16px" }}>Vérifiez votre email</h1>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333" }}>
            Un email de confirmation a été envoyé à <strong>{email}</strong>.<br />
            Cliquez sur le lien pour activer votre compte et démarrer votre essai gratuit de 14 jours.
          </p>
          <Link to="/" style={{ display: "inline-block", marginTop: "32px", textDecoration: "underline", color: "#000" }}>← Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Courier New, monospace", background: "#fff", minHeight: "100vh" }}>
      <nav style={{ borderBottom: "1px solid #000", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="/logoSTOCKPREDI.png" alt="StockPredi" style={{ height: "32px" }} />
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#000" }}>STOCKPREDI</span>
        </Link>
        <Link to="/login" style={{ textDecoration: "underline", color: "#000", fontSize: "14px" }}>Déjà inscrit ?</Link>
      </nav>

      <div style={{ maxWidth: "400px", margin: "80px auto", padding: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Essai gratuit 14 jours</h1>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "32px" }}>Sans carte bancaire. Annulation à tout moment.</p>

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
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: "100%", border: "1px solid #000", padding: "10px 12px", fontFamily: "Courier New, monospace", fontSize: "14px", boxSizing: "border-box" }}
              placeholder="Minimum 8 caractères"
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
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
            {loading ? "Inscription..." : "Démarrer l'essai gratuit"}
          </button>
        </form>
        <p style={{ marginTop: "16px", fontSize: "12px", color: "#555", textAlign: "center" }}>
          En vous inscrivant, vous acceptez nos{" "}
          <Link to="/conditions-utilisation" style={{ textDecoration: "underline", color: "#000" }}>CGU</Link>
          {" "}et notre{" "}
          <Link to="/politique-confidentialite" style={{ textDecoration: "underline", color: "#000" }}>Politique de confidentialité</Link>.
        </p>
      </div>
    </div>
  );
}
