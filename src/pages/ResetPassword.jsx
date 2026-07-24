import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Si Supabase a redirigé avec une erreur explicite dans le hash
    // (lien expiré, déjà utilisé, invalide...), on l'affiche immédiatement
    // sans attendre — et surtout sans se fier à une session existante.
    const hash = window.location.hash || "";
    if (hash.includes("error=")) {
      setCheckingToken(false);
      setTokenValid(false);
      return;
    }

    let resolved = false;

    // Le lien de reset Supabase déclenche l'event PASSWORD_RECOVERY une fois
    // le token du lien parsé et la session temporaire de récupération créée
    // par le SDK. C'est le SEUL signal fiable : on ne se base jamais sur une
    // session déjà existante (getSession) car un utilisateur déjà connecté
    // dans ce navigateur ferait passer un lien expiré/invalide pour valide.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        resolved = true;
        setTokenValid(true);
        setCheckingToken(false);
      }
    });

    // Si après quelques secondes aucun event de récupération n'est reçu,
    // le lien est invalide ou expiré.
    const timeout = setTimeout(() => {
      if (!resolved) {
        setCheckingToken(false);
        setTokenValid(false);
      }
    }, 4000);

    return () => {
      listener?.subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("❌ Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const msg = err.message;
      if (msg?.toLowerCase().includes("expired") || msg?.toLowerCase().includes("invalid")) {
        setError("❌ Lien de réinitialisation expiré ou invalide — merci de refaire une demande.");
      } else if (msg?.toLowerCase().includes("session")) {
        setError("❌ Session de réinitialisation introuvable — merci de refaire une demande.");
      } else {
        setError(`❌ Réinitialisation impossible — ${msg || "réessayez dans quelques secondes."}`);
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
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "32px" }}>Réinitialiser le mot de passe</h1>

        {checkingToken ? (
          <p style={{ fontSize: "14px", color: "#555" }}>Vérification du lien...</p>
        ) : !tokenValid ? (
          <div style={{ background: "#fff0f0", border: "1px solid #cc0000", padding: "16px", fontSize: "14px", color: "#cc0000" }}>
            ❌ Ce lien de réinitialisation est invalide ou a expiré.
            <br /><br />
            <Link to="/forgot-password" style={{ textDecoration: "underline", color: "#cc0000" }}>Faire une nouvelle demande</Link>
          </div>
        ) : success ? (
          <div style={{ background: "#f0fff4", border: "1px solid #008800", padding: "16px", fontSize: "14px", color: "#006600" }}>
            ✅ Mot de passe réinitialisé avec succès.
            <br />
            Redirection vers la connexion...
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #cc0000", padding: "12px", marginBottom: "24px", fontSize: "14px", color: "#cc0000" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  style={{ width: "100%", border: "1px solid #000", padding: "10px 12px", fontFamily: "Courier New, monospace", fontSize: "14px", boxSizing: "border-box" }}
                  placeholder="Minimum 8 caractères"
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  style={{ width: "100%", border: "1px solid #000", padding: "10px 12px", fontFamily: "Courier New, monospace", fontSize: "14px", boxSizing: "border-box" }}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", background: "#000", color: "#fff", border: "none", padding: "14px", fontFamily: "Courier New, monospace", fontWeight: "700", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Réinitialisation..." : "Réinitialiser"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
