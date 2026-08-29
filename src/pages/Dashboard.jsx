import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { backendClient } from "../api/backendClient";
import * as XLSX from "xlsx";

const SAMPLE_DATA = [
  {ds:"2024-01-01",y:120},{ds:"2024-01-08",y:134},{ds:"2024-01-15",y:118},
  {ds:"2024-01-22",y:142},{ds:"2024-02-01",y:155},{ds:"2024-02-08",y:148},
  {ds:"2024-02-15",y:162},{ds:"2024-02-22",y:158},{ds:"2024-03-01",y:170},
  {ds:"2024-03-08",y:165},{ds:"2024-03-15",y:180},{ds:"2024-03-22",y:174},
];

const REQUIRED_COLS = ["ds", "y"];

export default function Dashboard() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("forecast");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [productName, setProductName] = useState("Mon produit");
  const [data, setData] = useState(null); // null = no CSV loaded yet (empty state)
  const [periods, setPeriods] = useState(30);
  const [csvError, setCsvError] = useState("");
  const [subStatus, setSubStatus] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const [history, setHistory] = useState(null); // null = pas encore charge
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/login"); return; }
      setUser(user);
    });
    backendClient.subscriptionStatus()
      .then(setSubStatus)
      .catch(() => setSubStatus({ plan: "active" })) // fallback bypass
      .finally(() => setSubLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (tab === "history" && history === null && user) {
      setHistoryLoading(true);
      supabase
        .from("predictions")
        .select("id, filename, forecast_data, created_at")
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data: rows, error: histErr }) => {
          if (histErr) { console.error("Historique:", histErr.message); setHistory([]); }
          else setHistory(rows || []);
          setHistoryLoading(false);
        });
    }
  }, [tab, history, user]);

  async function deletePrediction(id) {
    const { error: delErr } = await supabase.from("predictions").delete().eq("id", id);
    if (!delErr) setHistory(h => (h || []).filter(r => r.id !== id));
  }

  function viewPrediction(row) {
    const fd = row.forecast_data || {};
    setResult(fd);
    setProductName(fd.product_name || row.filename || "Mon produit");
    if (fd.periods) setPeriods(fd.periods);
    setTab("forecast");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  // Correspondances colonnes flexibles
  const COL_ALIASES = {
    ds: ["ds", "date", "Date", "DATE", "jour", "Jour", "JOUR", "Jour_livraison", "periode", "Periode", "PERIODE", "mois", "Mois", "MOIS", "semaine", "Semaine", "SEMAINE"],
    y:  ["y", "Y", "qty", "Qty", "QTY", "quantite", "Quantite", "QUANTITE", "quantity", "Quantity",
         "ventes", "Ventes", "VENTES", "stock", "Stock", "STOCK", "valeur", "Valeur", "VALEUR",
         "montant", "Montant", "MONTANT", "ca", "CA", "chiffre"]
  };

  function findCol(headers, field) {
    return headers.findIndex(h => COL_ALIASES[field].includes(h.trim()));
  }

  function normalizeDate(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    // Format ISO direct
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    // FR dd/mm/yyyy ou dd-mm-yyyy
    const fr = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    if (fr) return `${fr[3]}-${String(fr[2]).padStart(2,"0")}-${String(fr[1]).padStart(2,"0")}`;
    // US mm/dd/yyyy
    const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (us) {
      const m = parseInt(us[1]), d = parseInt(us[2]);
      if (m > 12) return `${us[3]}-${String(d).padStart(2,"0")}-${String(m).padStart(2,"0")}`;
      return `${us[3]}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    }
    // Numéro série Excel (nombre de jours depuis 1900-01-01)
    const n = parseFloat(s);
    if (!isNaN(n) && n > 1000 && n < 100000) {
      const d = new Date(Math.round((n - 25569) * 86400 * 1000));
      return d.toISOString().slice(0, 10);
    }
    return null;
  }

  function rowsFromMatrix(matrix) {
    if (!matrix || matrix.length < 2) throw new Error("❌ Fichier trop court — minimum 2 lignes requises.");
    const rawHeader = matrix[0].map(h => String(h ?? "").trim());
    const dsIdx = findCol(rawHeader, "ds");
    const yIdx  = findCol(rawHeader, "y");
    if (dsIdx < 0) throw new Error(`❌ Colonne date introuvable. Colonnes détectées : ${rawHeader.join(", ")}. Renommez-la "ds", "date", "Date", "jour" ou "mois".`);
    if (yIdx  < 0) throw new Error(`❌ Colonne quantité introuvable. Colonnes détectées : ${rawHeader.join(", ")}. Renommez-la "y", "qty", "quantite", "ventes" ou "stock".`);
    const rows = matrix.slice(1)
      .map(row => ({ ds: normalizeDate(row[dsIdx]), y: parseFloat(String(row[yIdx] ?? "").replace(",", ".")) }))
      .filter(r => r.ds && !isNaN(r.y));
    if (rows.length < 7) throw new Error("❌ Données insuffisantes — minimum 7 lignes de données valides requises.");
    return rows;
  }

  function parseCsv(text) {
    // Supprimer BOM UTF-8 éventuel
    const clean = text.replace(/^\uFEFF/, "");
    const lines = clean.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) throw new Error("❌ CSV trop court — minimum 2 lignes requises.");
    // Détecter le séparateur (virgule ou point-virgule)
    const sep = (lines[0].split(";").length > lines[0].split(",").length) ? ";" : ",";
    const matrix = lines.map(l => l.split(sep));
    return rowsFromMatrix(matrix);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");
    const isCsv   = name.endsWith(".csv");
    if (!isExcel && !isCsv) {
      setCsvError("❌ Format non supporté — utilisez un fichier .csv, .xlsx ou .xls");
      return;
    }
    setCsvError("");
    const reader = new FileReader();
    if (isExcel) {
      reader.onload = ev => {
        try {
          const wb = XLSX.read(ev.target.result, { type: "array", cellDates: false });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
          const parsed = rowsFromMatrix(matrix);
          setData(parsed);
          setResult(null);
        } catch (err) {
          setCsvError(err.message);
          setData(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = ev => {
        try {
          const parsed = parseCsv(ev.target.result);
          setData(parsed);
          setResult(null);
        } catch (err) {
          setCsvError(err.message);
          setData(null);
        }
      };
      reader.readAsText(file, "UTF-8");
    }
  }

  async function runForecast() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const payload = data || SAMPLE_DATA;
      const res = await backendClient.recommendations(payload, productName, periods);
      setResult(res);
      // Sauvegarde dans l'historique (Supabase direct — pas de dependance backend)
      if (user) {
        const { error: saveErr } = await supabase.from("predictions").insert({
          user_id: user.id,
          filename: productName || "Sans nom",
          forecast_data: { ...res, product_name: productName, periods, data_points: payload.length }
        });
        if (saveErr) console.error("Sauvegarde historique:", saveErr.message);
        else setHistory(null); // force le rechargement au prochain passage sur l'onglet
      }
    } catch (err) {
      setError(`❌ Prévision impossible — ${err.message || "Erreur serveur. Réessayez dans quelques secondes."}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    setLoading(true);
    setError("");
    try {
      const res = await backendClient.createSubscription();
      if (res.checkout_url) window.location.href = res.checkout_url;
    } catch (err) {
      setError(`❌ Abonnement impossible — ${err.message || "Contactez support@stockpredi.fr"}`);
    } finally {
      setLoading(false);
    }
  }

  const planLabel = subStatus?.plan || "active";
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
      border: "none", borderBottom: "none"
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
    emptyState: {
      border: "2px dashed #ccc", padding: "48px 24px", textAlign: "center",
      marginBottom: "24px", color: "#555"
    },
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
          {!subLoading && (
            <span style={{ fontSize: "12px", color: planColor, fontWeight: "700", border: `1px solid ${planColor}`, padding: "2px 8px" }}>
              {planLabel.toUpperCase()}
            </span>
          )}
          <span style={{ fontSize: "13px", color: "#555" }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ ...STYLE.btn("secondary"), padding: "6px 16px", fontSize: "13px" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={STYLE.main}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>Dashboard</h1>
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "32px" }}>
          Prévisions de stock IA pour PME françaises
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
            {/* EMPTY STATE — no CSV loaded yet */}
            {!data && !result && (
              <div style={STYLE.emptyState}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>📁</div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "#000" }}>
                  Aucune prévision pour l'instant
                </h2>
                <p style={{ fontSize: "14px", marginBottom: "24px" }}>
                  Importez un CSV avec vos données historiques pour démarrer.
                </p>
                <button
                  onClick={() => fileRef.current && fileRef.current.click()}
                  style={STYLE.btn("primary")}
                >
                  Importer CSV ou Excel
                </button>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
                <div style={{ marginTop: "24px", fontSize: "12px", color: "#888", textAlign: "left", maxWidth: "400px", margin: "24px auto 0" }}>
                  <strong>Formats acceptés : .csv · .xlsx · .xls</strong><br />
                  <code style={{ background: "#f5f5f5", padding: "8px", display: "block", marginTop: "8px", fontSize: "11px" }}>
                    ds,y<br />
                    2024-01-01,120<br />
                    2024-01-08,134<br />
                    2024-01-15,118<br />
                    ... (minimum 7 lignes)
                  </code>
                </div>
              </div>
            )}

            {/* FORM — CSV loaded */}
            {(data || result) && (
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
                  <label style={STYLE.label}>Fichier CSV</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
                    <button onClick={() => fileRef.current.click()} style={STYLE.btn("secondary")}>
                      {data ? "Changer le fichier" : "Importer CSV / Excel"}
                    </button>
                    <span style={{ fontSize: "13px", color: data ? "#006600" : "#555" }}>
                      {data ? `✓ ${data.length} lignes importées` : "Aucun fichier"}
                    </span>
                  </div>
                  {csvError && <p style={{ color: "#cc0000", fontSize: "13px", marginTop: "8px" }}>{csvError}</p>}
                  <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
                    CSV ou Excel — colonnes : date (ds, date, Date...) et quantité (y, qty, quantite...)
                  </p>
                </div>

                <div style={{ marginTop: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    onClick={runForecast}
                    disabled={loading || !!csvError}
                    style={{ ...STYLE.btn("primary"), opacity: (loading || !!csvError) ? 0.6 : 1 }}
                  >
                    {loading ? "Analyse en cours..." : "Lancer la prévision IA"}
                  </button>
                  <button
                    onClick={() => { setData(null); setResult(null); setCsvError(""); setError(""); }}
                    style={{ ...STYLE.btn("secondary"), fontSize: "13px", padding: "8px 16px" }}
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}

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
                  {result.ai_source !== "ollama" && (
                    <p style={{ fontSize: "11px", color: "#888", marginTop: "12px" }}>
                      (recommandations basées sur règles métier — IA Llama indisponible)
                    </p>
                  )}
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
                    Tendance : <strong>{result.trend}</strong> · {result.forecast?.data_points ?? (data ? data.length : "\u2014")} points d'historique
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
          <div>
            {historyLoading && (
              <p style={{ fontSize: "14px", color: "#888" }}>Chargement de l'historique...</p>
            )}
            {!historyLoading && (history || []).length === 0 && (
              <div style={STYLE.emptyState}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>📊</div>
                <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#000" }}>
                  Historique des prévisions
                </h2>
                <p style={{ fontSize: "14px" }}>
                  Aucune prévision sauvegardée pour l'instant. Lancez votre première prévision !
                </p>
              </div>
            )}
            {!historyLoading && (history || []).length > 0 && (
              <div style={STYLE.card}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
                  Historique des prévisions
                  <span style={{ fontSize: "11px", fontWeight: "400", color: "#888", marginLeft: "8px" }}>
                    {history.length} sauvegardée{history.length > 1 ? "s" : ""}
                  </span>
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #000" }}>
                        <th style={{ textAlign: "left", padding: "8px", fontWeight: "700" }}>Date</th>
                        <th style={{ textAlign: "left", padding: "8px", fontWeight: "700" }}>Produit</th>
                        <th style={{ textAlign: "right", padding: "8px", fontWeight: "700" }}>Horizon</th>
                        <th style={{ textAlign: "left", padding: "8px", fontWeight: "700" }}>Tendance</th>
                        <th style={{ textAlign: "right", padding: "8px", fontWeight: "700" }}>Précision</th>
                        <th style={{ padding: "8px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => {
                        const fd = row.forecast_data || {};
                        return (
                          <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "8px" }}>{new Date(row.created_at).toLocaleDateString("fr-FR")}</td>
                            <td style={{ padding: "8px", fontWeight: "700" }}>{fd.product_name || row.filename}</td>
                            <td style={{ padding: "8px", textAlign: "right" }}>{fd.periods ? `${fd.periods} j` : "—"}</td>
                            <td style={{ padding: "8px" }}>{fd.trend || "—"}</td>
                            <td style={{ padding: "8px", textAlign: "right" }}>
                              {fd.forecast?.accuracy_score != null ? `${(fd.forecast.accuracy_score * 100).toFixed(0)}%` : "—"}
                            </td>
                            <td style={{ padding: "8px", textAlign: "right", whiteSpace: "nowrap" }}>
                              <button onClick={() => viewPrediction(row)} style={{ ...STYLE.btn("secondary"), padding: "4px 10px", fontSize: "12px", marginRight: "8px" }}>
                                Voir
                              </button>
                              <button onClick={() => deletePrediction(row.id)} style={{ ...STYLE.btn("secondary"), padding: "4px 10px", fontSize: "12px", color: "#cc0000", borderColor: "#cc0000" }}>
                                Suppr.
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ACCOUNT */}
        {tab === "account" && (
          <div>
            <div style={STYLE.card}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Mon abonnement</h2>
              {subLoading ? (
                <p style={{ fontSize: "14px", color: "#888" }}>Chargement...</p>
              ) : (
                <>
                  <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                    Plan actuel : <strong style={{ color: planColor }}>{planLabel.toUpperCase()}</strong>
                  </p>
                  {planLabel === "active" ? (
                    <p style={{ fontSize: "14px", color: "#006600", marginTop: "8px" }}>
                      ✓ Abonnement actif — accès illimité à toutes les prévisions.
                    </p>
                  ) : (
                    <div style={{ marginTop: "16px" }}>
                      <p style={{ fontSize: "14px", marginBottom: "16px", color: "#555" }}>
                        Passez à l'abonnement payant pour un accès illimité — 35 €/mois, annulation à tout moment.
                      </p>
                      <button onClick={handleSubscribe} disabled={loading} style={{ ...STYLE.btn("primary"), opacity: loading ? 0.6 : 1 }}>
                        {loading ? "Redirection..." : "S'abonner — 35 €/mois"}
                      </button>
                    </div>
                  )}
                </>
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