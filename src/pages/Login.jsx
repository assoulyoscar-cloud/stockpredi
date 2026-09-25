import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { useFormValidation } from "../hooks/useFormValidation";
import { validateLoginForm } from "../utils/validators";
import { useEffect, useState } from "react";
import { backendClient } from "../api/backendClient";

export default function Login() {
  const navigate = useNavigate();
  const [error] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitCooldown, setSubmitCooldown] = useState(false);

  // Render dort : le reveiller pendant la saisie des identifiants
  useEffect(() => { backendClient.wake(); }, []);

  const form = useFormValidation(
    { email: "", password: "" },
    async (values) => {
      setSubmitError("");
      try {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (err) throw err;
        navigate("/dashboard");
      } catch (err) {
        const msg = err.message;
        if (msg?.toLowerCase().includes("invalid")) {
          setSubmitError("❌ Email ou mot de passe incorrect.");
        } else if (msg?.toLowerCase().includes("email not confirmed")) {
          setSubmitError("❌ Email non confirmé — vérifiez votre boîte mail.");
        } else {
          setSubmitError(
            `❌ Connexion impossible — ${msg || "réessayez dans quelques secondes."}`
          );
        }
        // Anti-spam: cooldown
        setSubmitCooldown(true);
        setTimeout(() => setSubmitCooldown(false), 2000);
      }
    },
    validateLoginForm
  );

  return (
    <div
      style={{
        fontFamily: "Courier New, monospace",
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <nav
        style={{
          borderBottom: "1px solid #000",
          padding: "12px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <img src="/logoSTOCKPREDI.png" alt="StockPredi" style={{ height: "32px" }} />
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#000" }}>
            STOCKPREDI
          </span>
        </Link>
        <Link
          to="/signup"
          style={{
            textDecoration: "underline",
            color: "#000",
            fontSize: "14px",
          }}
        >
          Pas encore inscrit ?
        </Link>
      </nav>

      <div style={{ maxWidth: "400px", margin: "80px auto", padding: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "32px" }}>
          Connexion
        </h1>

        {(error || submitError) && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #cc0000",
              padding: "12px",
              marginBottom: "24px",
              fontSize: "14px",
              color: "#cc0000",
            }}
          >
            {submitError || error}
          </div>
        )}

        <form onSubmit={form.handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.values.email}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              style={{
                width: "100%",
                border: form.errors.email && form.touched.email ? "1px solid #cc0000" : "1px solid #000",
                padding: "10px 12px",
                fontFamily: "Courier New, monospace",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="votre@email.com"
            />
            {form.errors.email && form.touched.email && (
              <p style={{ fontSize: "12px", color: "#cc0000", margin: "4px 0 0 0" }}>
                {form.errors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={form.values.password}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              style={{
                width: "100%",
                border: form.errors.password && form.touched.password ? "1px solid #cc0000" : "1px solid #000",
                padding: "10px 12px",
                fontFamily: "Courier New, monospace",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="••••••••"
            />
            {form.errors.password && form.touched.password && (
              <p style={{ fontSize: "12px", color: "#cc0000", margin: "4px 0 0 0" }}>
                {form.errors.password}
              </p>
            )}
          </div>

          <p style={{ textAlign: "right", marginBottom: "24px" }}>
            <Link
              to="/forgot-password"
              style={{
                textDecoration: "underline",
                color: "#000",
                fontSize: "13px",
              }}
            >
              Mot de passe oublié ?
            </Link>
          </p>

          <button
            type="submit"
            disabled={form.isSubmitting || submitCooldown || Object.keys(form.errors).length > 0}
            style={{
              width: "100%",
              background: "#000",
              color: "#fff",
              border: "none",
              padding: "14px",
              fontFamily: "Courier New, monospace",
              fontWeight: "700",
              fontSize: "14px",
              cursor:
                form.isSubmitting || submitCooldown || Object.keys(form.errors).length > 0
                  ? "not-allowed"
                  : "pointer",
              opacity:
                form.isSubmitting || submitCooldown || Object.keys(form.errors).length > 0
                  ? 0.6
                  : 1,
            }}
          >
            {form.isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "14px", textAlign: "center" }}>
          Pas de compte ?{" "}
          <Link
            to="/signup"
            style={{ textDecoration: "underline", color: "#000" }}
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
