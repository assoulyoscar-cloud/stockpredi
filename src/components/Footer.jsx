// src/components/Footer.jsx — Footer légal global StockPredi
import React from "react";

const STYLE = {
  footer: {
    fontFamily: "Courier New, monospace",
    borderTop: "1px solid #000",
    padding: "32px",
    marginTop: "auto",
    background: "#000",
    color: "#fff",
  },
  inner: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "32px",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  title: {
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "1px",
    marginBottom: "4px",
  },
  link: {
    color: "#ccc",
    textDecoration: "none",
    fontSize: "12px",
  },
  text: {
    color: "#aaa",
    fontSize: "11px",
    lineHeight: "1.6",
  },
  bottom: {
    maxWidth: "900px",
    margin: "24px auto 0",
    paddingTop: "16px",
    borderTop: "1px solid #333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  copy: {
    color: "#888",
    fontSize: "11px",
  },
  badge: {
    color: "#888",
    fontSize: "10px",
    border: "1px solid #444",
    padding: "2px 8px",
  },
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={STYLE.footer}>
      <div style={STYLE.inner}>
        {/* Col 1 — Identité */}
        <div style={STYLE.col}>
          <div style={STYLE.title}>STOCKPREDI®</div>
          <p style={STYLE.text}>
            Prévisions de stock IA pour PME françaises.<br />
            Marque déposée — Tous droits réservés.
          </p>
          <p style={STYLE.text}>
            SIRET : en cours d'enregistrement<br />
            APE : 6201Z — Édition de logiciels<br />
            TVA : franchise art. 293 B CGI
          </p>
        </div>

        {/* Col 2 — Liens légaux */}
        <div style={STYLE.col}>
          <div style={STYLE.title}>LÉGAL</div>
          <a href="/mentions-legales" style={STYLE.link}>Mentions légales</a>
          <a href="/politique-confidentialite" style={STYLE.link}>Politique de confidentialité</a>
          <a href="/conditions-utilisation" style={STYLE.link}>Conditions d'utilisation</a>
          <a href="/contact" style={STYLE.link}>Contact</a>
        </div>

        {/* Col 3 — Contact & RGPD */}
        <div style={STYLE.col}>
          <div style={STYLE.title}>CONTACT</div>
          <p style={STYLE.text}>
            Support : support@stockpredi.fr<br />
            DPO / RGPD : support@stockpredi.fr<br />
            Site : stockpredi.fr
          </p>
          <p style={STYLE.text}>
            Hébergement : Vercel (UE)<br />
            Données : Supabase Frankfurt (EU)<br />
            Paiements : Stripe (certifié PCI DSS)
          </p>
        </div>
      </div>

      {/* Barre du bas */}
      <div style={STYLE.bottom}>
        <span style={STYLE.copy}>
          © {year} StockPredi® — Marque déposée — Toute reproduction interdite sans autorisation écrite
        </span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span style={STYLE.badge}>RGPD Conforme</span>
          <span style={STYLE.badge}>Hébergement UE</span>
          <span style={STYLE.badge}>PCI DSS Stripe</span>
        </div>
      </div>
    </footer>
  );
}
