import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("❌ Merci de renseigner votre email.");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (err) throw err;
      // Supabase ne révèle jamais si l'email existe (anti-énumération) :
      // on affiche toujours le message de succès.
      setSent(true);
    } catch (err) {
      const msg = err.message;
      if (msg?.toLowerCase().includes("rate limit") || msg?.toLowerCase().includes("too many")) {
        setError("❌ Trop de tentatives — merci de réessayer dans quelques minutes.");
      } else if (msg?.toLowerCase().includes("invalid")) {
        setError("❌ Adresse email invalide.");
      } else {
        setError(`❌ Impossible d'envoyer le lien — ${msg || "réessayez dans quelques secondes."}`);
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
        <Link to="/login" style={{ textDecoration: "underline", color: "#000", fontSize: "14px" }}>Retour à la connexion</Link>
      </nav>

      <div style={{ maxWidth: "400px", margin: "80px auto", padding: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "16px" }}>Mot de passe oublié</h1>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "32px" }}>
          Indiquez votre email, nous vous envoyons un lien pour réinitialiser votre mot de passe.
        </p>

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #cc0000", padding: "12px", marginBottom: "24px", fontSize: "14px", color: "#cc0000" }}>
            {error}
          </div>
        )}

        {sent ? (
          <div style={{ background: "#f0fff4", border: "1px solid #008800", padding: "16px", fontSize: "14px", color: "#006600" }}>
            ✅ Lien envoyé à votre email.
            <br />
            Vérifiez votre boîte de réception (et vos spams) pour réinitialiser votre mot de passe.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "24px" }}>
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
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: "#000", color: "#fff", border: "none", padding: "14px", fontFamily: "Courier New, monospace", fontWeight: "700", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Envoi..." : "Envoyer lien de réinitialisation"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "24px", fontSize: "14px", textAlign: "center" }}>
          <Link to="/login" style={{ textDecoration: "underline", color: "#000" }}>Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
