import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URL || "https://stockpredi-backend.onrender.com";
const DEFAULT_ERR = "Impossible d'envoyer le lien. Vérifiez l'adresse email.";

// Erreur backend/Supabase -> texte lisible (jamais "{}" ni "[object Object]")
function errorText(err, fallback = DEFAULT_ERR) {
  if (!err) return fallback;
  if (typeof err === "string") return err.trim() || fallback;
  const msg = err.message || err.error_description || err.msg || err.error;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (msg && typeof msg === "object") return errorText(msg, fallback);
  return fallback;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const STYLE = {
    page: { fontFamily: "Courier New, monospace", minHeight: "100vh", background: "#fff", color: "#000", display: "flex", flexDirection: "column" },
    nav: { borderBottom: "1px solid #000", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    main: { maxWidth: "480px", margin: "80px auto", padding: "32px", width: "100%" },
    label: { display: "block", fontWeight: "700", marginBottom: "8px", fontSize: "13px" },
    input: { border: "1px solid #000", padding: "10px 14px", fontFamily: "Courier New, monospace", fontSize: "14px", width: "100%", boxSizing: "border-box", marginBottom: "16px" },
    btn: { background: "#000", color: "#fff", border: "none", padding: "12px 24px", fontFamily: "Courier New, monospace", fontWeight: "700", fontSize: "14px", cursor: "pointer", width: "100%", opacity: 1 },
    error: { background: "#fff0f0", border: "1px solid #cc0000", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#cc0000" },
    success: { background: "#f0fff0", border: "1px solid #006600", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#006600" },
    link: { color: "#000", fontSize: "13px", textAlign: "center", display: "block", marginTop: "16px" },
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setErr("Veuillez saisir votre adresse email.");
      return;
    }
    
    setLoading(true);
    setErr("");
    
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      // Une page d'erreur HTML (Render en veille, 502) ne doit pas faire planter le parse
      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        setErr("Trop de demandes. Patientez 15 minutes avant de réessayer.");
      } else if (!response.ok) {
        setErr(errorText(data));
      } else {
        setSent(true);
      }
    } catch (e) {
      setErr("Serveur injoignable. Vérifiez votre connexion internet puis réessayez dans 1 minute.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={STYLE.page}>
      <nav style={STYLE.nav}>
        <span style={{ fontWeight: "700", fontSize: "16px" }}>STOCKPREDI</span>
        <Link to="/login" style={{ ...STYLE.link, marginTop: 0 }}>Retour à la connexion</Link>
      </nav>
      <div style={STYLE.main}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>Mot de passe oublié</h1>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "24px" }}>
          Indiquez votre email, nous vous envoyons un lien pour réinitialiser votre mot de passe.
        </p>
        {err && <div style={STYLE.error}>❌ {err}</div>}
        {sent && <div style={STYLE.success}>✅ Lien envoyé à {email}. Vérifiez vos emails (et vos spams).</div>}
        {!sent && (
          <form onSubmit={handleSubmit}>
            <label style={STYLE.label}>Email</label>
            <input
              style={STYLE.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              autoFocus
            />
            <button style={{ ...STYLE.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer lien de réinitialisation"}
            </button>
          </form>
        )}
        <Link to="/login" style={STYLE.link}>Retour à la connexion</Link>
      </div>
    </div>
  );
}
