import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { backendClient } from "../api/backendClient";

const SAMPLE_DATA = [
  {ds:"2024-01-01",y:120},{ds:"2024-01-08",y:134},{ds:"2024-01-15",y:118},
  {ds:"2024-01-22",y:142},{ds:"2024-02-01",y:155},{ds:"2024-02-08",y:148},
  {ds:"2024-02-15",y:162},{ds:"2024-02-22",y:158},{ds:"2024-03-01",y:170},
  {ds:"2024-03-08",y:165},{ds:"2024-03-15",y:180},{ds:"2024-03-22",y:174},
];

export default function Dashboard() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("forecast"); // forecast | history | account
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [productName, setProductName] = useState("Mon produit");
  const [data, setData] = useState(SAMPLE_DATA);
  const [periods, setPeriods] = useState(30);
  const [csvError, setCsvError] = useState("");
  const [subStatus, setSubStatus] = useState(null);
  // const [history, setHistory] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/login"); return; }
      setUser(user);
    });
    backendClient.subscriptionStatus().then(setSubStatus).catch(() => {});
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function parseCsv(text) {
    const lines = text.trim().split("\n");
    const header = lines[0].toLowerCase().replace(/\r/g, "");
    if (!header.includes("ds") || !header.includes("y")) {
      throw new Error("Le CSV doit avoir les colonnes 'ds' (date) et 'y' (quantite)");
    }
    return lines.slice(1).map(line => {
      const [ds, y] = line.replace(/\r/g, "").split(",");
      return { ds: ds.trim(), y: parseFloat(y) };
    }).filter(r => r.ds && !isNaN(r.y));
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCsvError("");
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseCsv(ev.target.result);
        if (parsed.length < 7) throw new Error("Minimum 7 lignes de donnees requises");
        setData(parsed);
      } catch (err) {
        setCsvError(err.message);
      }
    };
    reader.readAsText(file);
  }

  async function runForecast() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await backendClient.recommendations(data, productName, periods);
      setResult(res);
    } catch (err) {
      setError(err.message || "Erreur backend");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await backendClient.createSubscription();
      if (res.checkout_url) window.location.href = res.checkout_url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const planLabel = subStatus?.plan || "trial";
  const planColor = planLabel === "active" ? "#006600" : planLabel === "trial" ? "#cc6600" : "#cc0000";

  const STYLE = {
    page: { fontFamily: "Courier New, monospace", background: "#fff", minHeight: "100vh", color: "#000" },
    nav: { borderBottom: "1px solid #000", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    main: { maxWidth: "900px", margin: "0 auto", padding: "32px" },
    tabs: { display: "flex", gap: "0", marginBottom: "32px", borderBottom: "2px solid #000" },
    tab: (active) => ({
      padding: "10px 24px", cursor: "pointer", fontFamily: "Courier New, monospace",
      fontWeight: active ? "700" : "400", fontSize: "14px",
      background: active ? "#000" : "transparent", color: active ? "#fff" : "#000",
      border: "none", borderBottom: active ? "none" : "none"
    }),
    card: { border: "1px solid #000", padding: "24px", marginBottom: "24px" },
    label: { display: "block", fontWeight: "700", marginBottom: "8px", fontSize: "13px" },
    input: { border: "1px solid #000", padding: "8px 12px", fontFamily: "Courier New, monospace", fontSize: "14px", width: "100%", boxSizing: "border-box" },
    btn: (variant = "primary") => ({
      background: variant === "primary" ? "#000" : "#fff",
      color: variant === "primary" ? "#fff" : "#000",
      border: "1px solid #000", padding: "10px 24px",
      fontFamily: "Courier New, monospace", fontWeight: "700", fontSize: "14px",
      cursor: "pointer"
    }),
    alert: (type) => ({
      padding: "10px 14px", marginBottom: "8px", fontSize: "13px",
      background: type === "CRITIQUE" ? "#fff0f0" : type === "ATTENTION" ? "#fffbe6" : "#f0fff0",
      borderLeft: `3px solid ${type === "CRITIQUE" ? "#cc0000" : type === "ATTENTION" ? "#cc6600" : "#006600"}`,
      color: "#000"
    }),
  };

  return (
    <div style={STYLE.page}>
      {/* NAV */}
      <nav style={STYLE.nav}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="/logoSTOCKPREDI.png" alt="StockPredi" style={{ height: "32px" }} />
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#000" }}>STOCKPREDI</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={{ fontSize: "12px", color: planColor, fontWeight: "700", border: `1px solid ${planColor}`, padding: "2px 8px" }}>
            {planLabel.toUpperCase()}
          </span>
          <span style={{ fontSize: "13px", color: "#555" }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ ...STYLE.btn("secondary"), padding: "6px 16px", fontSize: "13px" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={STYLE.main}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>Dashboard</h1>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "32px" }}>
          Prévisions de stock alimentées par IA (Prophet + Llama)
        </p>

        {/* TABS */}
        <div style={STYLE.tabs}>
          {[["forecast","Nouvelle prévision"],["history","Historique"],["account","Mon compte"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={STYLE.tab(tab === id)}>{label}</button>
          ))}
        </div>

        {/* ERREUR GLOBALE */}
        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #cc0000", padding: "12px", marginBottom: "24px", fontSize: "14px", color: "#cc0000" }}>
            {error}
          </div>
        )}

        {/* TAB: FORECAST */}
        {tab === "forecast" && (
          <div>
            <div style={STYLE.card}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Paramètres</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={STYLE.label}>Nom du produit</label>
                  <input style={STYLE.input} value={productName} onChange={e => setProductName(e.target.value)} placeholder="Ex: Widget A" />
                </div>
                <div>
                  <label style={STYLE.label}>Horizon de prévision (jours)</label>
                  <select style={STYLE.input} value={periods} onChange={e => setPeriods(Number(e.target.value))}>
                    <option value={7}>7 jours</option>
                    <option value={14}>14 jours</option>
                    <option value={30}>30 jours</option>
                    <option value={60}>60 jours</option>
                    <option value={90}>90 jours</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={STYLE.label}>Données CSV (colonnes: ds, y)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />
                  <button onClick={() => fileRef.current.click()} style={STYLE.btn("secondary")}>
                    Importer CSV
                  </button>
                  <span style={{ fontSize: "13px", color: "#555" }}>
                    {data === SAMPLE_DATA ? "Données exemple chargées" : `${data.length} lignes importées`}
                  </span>
                </div>
                {csvError && <p style={{ color: "#cc0000", fontSize: "13px", marginTop: "8px" }}>{csvError}</p>}
                <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
                  Format attendu : première ligne = "ds,y", puis date ISO et quantité (ex: 2024-01-15,142)
                </p>
              </div>

              <div style={{ marginTop: "24px" }}>
                <button onClick={runForecast} disabled={loading || !!csvError} style={{ ...STYLE.btn("primary"), opacity: (loading || !!csvError) ? 0.6 : 1 }}>
                  {loading ? "Analyse en cours..." : "Lancer la prévision IA"}
                </button>
              </div>
            </div>

            {/* RÉSULTATS */}
            {result && (
              <div>
                {/* RECOMMANDATIONS */}
                <div style={STYLE.card}>
                  <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>
                    Recommandations IA
                    <span style={{ fontSize: "11px", fontWeight: "400", color: "#888", marginLeft: "8px" }}>
                      via {result.ai_source === "ollama" ? "Llama3.1" : "règles métier"}
                    </span>
                  </h2>
                  <p style={{ fontSize: "13px", color: "#555", marginBottom: "16px" }}>{result.summary}</p>
                  {(result.recommendations || []).map((r, i) => (
                    <div key={i} style={STYLE.alert(r.priority)}>
                      <strong>[{r.priority}]</strong> {r.action}
                      {r.detail && <span style={{ color: "#555" }}> — {r.detail}</span>}
                    </div>
                  ))}
                </div>

                {/* ALERTES */}
                {result.alerts && result.alerts.length > 0 && (
                  <div style={STYLE.card}>
                    <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Alertes détectées</h2>
                    {result.alerts.map((a, i) => (
                      <div key={i} style={STYLE.alert(a.type === "stockout" ? "CRITIQUE" : "ATTENTION")}>
                        <strong>{a.type === "stockout" ? "RUPTURE" : "SURPLUS"}</strong> le {a.date} — {a.action}
                      </div>
                    ))}
                  </div>
                )}

                {/* PREVISIONS TABLEAU */}
                <div style={STYLE.card}>
                  <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>
                    Prévisions {periods} jours
                    <span style={{ fontSize: "11px", fontWeight: "400", color: "#888", marginLeft: "8px" }}>
                      modèle {result.forecast?.model} · précision {((result.forecast?.accuracy_score || 0)*100).toFixed(0)}%
                    </span>
                  </h2>
                  <p style={{ fontSize: "12px", color: "#555", marginBottom: "16px" }}>
                    Tendance : <strong>{result.trend}</strong> · {result.forecast?.data_points} points d'historique
                  </p>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #000" }}>
                          <th style={{ textAlign: "left", padding: "8px", fontWeight: "700" }}>Date</th>
                          <th style={{ textAlign: "right", padding: "8px", fontWeight: "700" }}>Prévision</th>
                          <th style={{ textAlign: "right", padding: "8px", fontWeight: "700", color: "#555" }}>Min</th>
                          <th style={{ textAlign: "right", padding: "8px", fontWeight: "700", color: "#555" }}>Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(result.forecast?.predictions || []).slice(0,10).map((p, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "8px" }}>{p.date}</td>
                            <td style={{ padding: "8px", textAlign: "right", fontWeight: "700" }}>{p.forecast}</td>
                            <td style={{ padding: "8px", textAlign: "right", color: "#888" }}>{p.confidence_lower}</td>
                            <td style={{ padding: "8px", textAlign: "right", color: "#888" }}>{p.confidence_upper}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(result.forecast?.predictions || []).length > 10 && (
                      <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
                        + {(result.forecast.predictions.length - 10)} lignes supplémentaires
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: HISTORY */}
        {tab === "history" && (
          <div style={STYLE.card}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Historique des prévisions</h2>
            <p style={{ fontSize: "14px", color: "#555" }}>
              L'historique sera disponible une fois le backend connecté et les prévisions sauvegardées en base.
            </p>
          </div>
        )}

        {/* TAB: ACCOUNT */}
        {tab === "account" && (
          <div>
            <div style={STYLE.card}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Mon abonnement</h2>
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                Plan actuel : <strong style={{ color: planColor }}>{planLabel.toUpperCase()}</strong>
              </p>
              {planLabel !== "active" && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ fontSize: "14px", marginBottom: "16px", color: "#555" }}>
                    Passez à l'abonnement payant pour un accès illimité — 35€/mois, annulation à tout moment.
                  </p>
                  <button onClick={handleSubscribe} disabled={loading} style={STYLE.btn("primary")}>
                    {loading ? "Redirection..." : "S'abonner — 35€/mois"}
                  </button>
                </div>
              )}
              {planLabel === "active" && (
                <p style={{ fontSize: "14px", color: "#006600", marginTop: "8px" }}>
                  Abonnement actif. Accès illimité à toutes les prévisions.
                </p>
              )}
            </div>

            <div style={STYLE.card}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Mon compte</h2>
              <p style={{ fontSize: "14px" }}>Email : <strong>{user?.email}</strong></p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>
                Inscrit le : {user?.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "—"}
              </p>
              <button onClick={handleLogout} style={{ ...STYLE.btn("secondary"), marginTop: "24px" }}>
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
