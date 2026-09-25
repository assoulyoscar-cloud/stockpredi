import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { useFormValidation } from "../hooks/useFormValidation";
import { validateSignupForm } from "../utils/validators";

export default function Signup() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitCooldown, setSubmitCooldown] = useState(false);

  const form = useFormValidation(
    { email: "", password: "", confirm: "" },
    async (values) => {
      setSubmitError("");
      try {
        const { data, error: err } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (err) throw err;
        // Si Supabase auto-confirme (email confirmation désactivé), on a une session directement
        if (data?.session) {
          navigate("/dashboard");
        } else {
          setSuccess(true);
        }
      } catch (err) {
        const msg = err.message;
        if (msg && msg !== "{}") {
          setSubmitError(`❌ Inscription impossible — ${msg}`);
        } else {
          setSubmitError(
            "❌ Inscription impossible. Vérifiez votre email ou réessayez."
          );
        }
        // Anti-spam: cooldown
        setSubmitCooldown(true);
        setTimeout(() => setSubmitCooldown(false), 2000);
      }
    },
    validateSignupForm
  );

  if (success) {
    return (
      <div
        style={{
          fontFamily: "Courier New, monospace",
          background: "#fff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
            Compte créé ✓
          </h1>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#555" }}>
            Un email de confirmation a été envoyé à <strong>{form.values.email}</strong>.
            <br />
            Cliquez sur le lien pour activer votre compte.
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              marginTop: "32px",
              background: "#000",
              color: "#fff",
              padding: "12px 32px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            Se connecter →
          </Link>
        </div>
      </div>
    );
  }

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
          <img
            src="/logoSTOCKPREDI.png"
            alt="StockPredi"
            style={{ height: "32px" }}
          />
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#000" }}>
            STOCKPREDI
          </span>
        </Link>
        <Link
          to="/login"
          style={{
            textDecoration: "underline",
            color: "#000",
            fontSize: "14px",
          }}
        >
          Déjà inscrit ?
        </Link>
      </nav>

      <div style={{ maxWidth: "400px", margin: "80px auto", padding: "32px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Essai gratuit 14 jours
        </h1>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "32px" }}>
          Sans carte bancaire. Annulation à tout moment.
        </p>

        {submitError && (
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
            {submitError}
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

          <div style={{ marginBottom: "20px" }}>
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
              placeholder="Minimum 8 caractères"
            />
            {form.errors.password && form.touched.password && (
              <p style={{ fontSize: "12px", color: "#cc0000", margin: "4px 0 0 0" }}>
                {form.errors.password}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirm"
              value={form.values.confirm}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              style={{
                width: "100%",
                border: form.errors.confirm && form.touched.confirm ? "1px solid #cc0000" : "1px solid #000",
                padding: "10px 12px",
                fontFamily: "Courier New, monospace",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="••••••••"
            />
            {form.errors.confirm && form.touched.confirm && (
              <p style={{ fontSize: "12px", color: "#cc0000", margin: "4px 0 0 0" }}>
                {form.errors.confirm}
              </p>
            )}
          </div>

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
            {form.isSubmitting ? "Inscription..." : "Démarrer l'essai gratuit"}
          </button>
        </form>

        <p
          style={{
            marginTop: "16px",
            fontSize: "12px",
            color: "#555",
            textAlign: "center",
          }}
        >
          En vous inscrivant, vous acceptez nos{" "}
          <Link
            to="/conditions-utilisation"
            style={{ textDecoration: "underline", color: "#000" }}
          >
            CGU
          </Link>
          {" "}et notre{" "}
          <Link
            to="/politique-confidentialite"
            style={{ textDecoration: "underline", color: "#000" }}
          >
            Politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
