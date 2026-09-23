import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { backendClient } from "../api/backendClient";
import { SECTOR_CONFIGS, calculateTotalImpact } from "../config/sectorConfig";
import { validateAllSectors } from "../config/sectorConfig.validation";
import { SectorSelector } from "../components/SectorSelector";
import { SectorAdvancedMetrics } from "../components/SectorAdvancedMetrics";
import * as XLSX from "xlsx";

const SAMPLE_DATA = [
  {ds:"2024-01-01",y:120},{ds:"2024-01-08",y:134},{ds:"2024-01-15",y:118},
  {ds:"2024-01-22",y:142},{ds:"2024-02-01",y:155},{ds:"2024-02-08",y:148},
  {ds:"2024-02-15",y:162},{ds:"2024-02-22",y:158},{ds:"2024-03-01",y:170},
  {ds:"2024-03-08",y:165},{ds:"2024-03-15",y:180},{ds:"2024-03-22",y:174},
];

export default function Dashboard() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // ═════════════════════════════════════════════════════════════
  // STATE MANAGEMENT (allégé)
  // ═════════════════════════════════════════════════════════════
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("forecast");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [productName, setProductName] = useState("Mon produit");
  const [data, setData] = useState(null);
  const [periods, setPeriods] = useState(30);
  const [sector, setSector] = useState("general");
  const [sectorParams, setSectorParams] = useState({});
  const [advancedConfig, setAdvancedConfig] = useState(null);
  const [configErrors, setConfigErrors] = useState([]);
  const [csvError, setCsvError] = useState("");
  const [subStatus, setSubStatus] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // RGPD simplifiée
  const [rgpdLoading, setRgpdLoading] = useState(false);
  const [rgpdError, setRgpdError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rgpdExportLoading, setRgpdExportLoading] = useState(false);

  // ═════════════════════════════════════════════════════════════
  // INIT & EFFECTS
  // ═════════════════════════════════════════════════════════════
  useEffect(() => {
    const validation = validateAllSectors(SECTOR_CONFIGS);
    if (validation.invalid.length > 0) {
      console.error("❌ Invalid sector configs:", validation.invalid);
      setConfigErrors(validation.invalid.flatMap(inv => inv.errors));
    } else {
      console.log("✅ All sector configs valid");
    }
  }, []);

  useEffect(() => {
    if (!advancedConfig && sector) {
      const config = SECTOR_CONFIGS[sector] || SECTOR_CONFIGS.general;
      setAdvancedConfig(config);
      setSectorParams(config.logistics);
    }
  }, [sector, advancedConfig]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/login"); return; }
      setUser(user);
    });
    backendClient.subscriptionStatus()
      .then(setSubStatus)
      // ✅ MODIFICATION #2: Subscription fallback set to "trial" (Line 77)
      // This ensures users without active subscriptions default to trial, not active
      .catch(() => setSubStatus({ plan: "trial" }))
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

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════
  function handleSectorChange(val) {
    setSector(val);
    const config = SECTOR_CONFIGS[val] || SECTOR_CONFIGS.general;
    setAdvancedConfig(config);
    setSectorParams(config.logistics);
  }

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

  // ═════════════════════════════════════════════════════════════
  // RGPD: Export Data (Article 20 - Droit à la portabilité)
  // ═════════════════════════════════════════════════════════════
  async function handleRgpdExport() {
    setRgpdExportLoading(true);
    setRgpdError("");
    try {
      const data = await backendClient.rgpdExport();
      // Créer un blob JSON et télécharger
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stockpredi-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("✓ Données exportées avec succès!");
    } catch (err) {
      setRgpdError(`❌ Erreur export: ${err.message || "Contactez support"}`);
    } finally {
      setRgpdExportLoading(false);
    }
  }

  // ═════════════════════════════════════════════════════════════
  // RGPD: Delete Account (Article 17 - Droit à l'oubli)
  // ═════════════════════════════════════════════════════════════
  async function handleRgpdDelete() {
    setRgpdLoading(true);
    setRgpdError("");
    setShowDeleteConfirm(false);
    try {
      await backendClient.rgpdDelete();
      alert("✓ Compte supprimé avec succès. Redirection...");
      setTimeout(() => {
        supabase.auth.signOut();
        navigate("/");
      }, 1500);
    } catch (err) {
      setRgpdError(`❌ Erreur: ${err.message || "Contactez support"}`);
    } finally {
      setRgpdLoading(false);
    }
  }

  // ═════════════════════════════════════════════════════════════
  // CSV PARSER (existant, conservé tel quel)
  // ═════════════════════════════════════════════════════════════
  const DATE_KW = ["date","ds","jour","mois","semaine","période","periode","month","week","time","timestamp","année","annee","year"];
  const VAL_KW  = ["y","qty","quantite","quantity","ventes","stock","valeur","montant","total","ca","chiffre","prix","amount","revenue","sales","volume","count","nombre"];
  const MONTH_MAP = {jan:0,fev:1,feb:1,mar:2,avr:3,apr:3,mai:4,may:4,jui:5,jun:5,jul:6,aou:7,aug:7,sep:8,oct:9,nov:10,dec:11};

  function _isDateVal(v) {
    if (v === null || v === undefined || v === "") return false;
    const s = String(v).trim();
    const n = parseFloat(s);
    if (!isNaN(n) && n > 30000 && n < 70000) return true;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return true;
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(s)) return true;
    if (/^\d{1,2}[-/]\d{4}$/.test(s)) return true;
    const sl = s.toLowerCase();
    return Object.keys(MONTH_MAP).some(m => sl.includes(m));
  }

  function _isNumVal(v) {
    if (v === null || v === undefined || v === "") return false;
    if (typeof v === "number") return !isNaN(v);
    const s = String(v).replace(/\s/g,"").replace(",",".");
    return !isNaN(parseFloat(s)) && /^-?[\d.,]+$/.test(s.trim());
  }

  function _toDate(v, idx, sheetName) {
    if (v === null || v === undefined) return _seqDate(idx, sheetName);
    if (typeof v === "object" && v instanceof Date) return v.toISOString().slice(0,10);
    const s = String(v).trim();
    const n = parseFloat(s);
    if (!isNaN(n) && n > 30000 && n < 70000) {
      return new Date(Math.round((n-25569)*86400*1000)).toISOString().slice(0,10);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
    const fr = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (fr) return `${fr[3]}-${fr[2].padStart(2,"0")}-${fr[1].padStart(2,"0")}`;
    const mmy = s.match(/^(\d{1,2})[-/](\d{4})$/);
    if (mmy) return `${mmy[2]}-${mmy[1].padStart(2,"0")}-01`;
    const sl = s.toLowerCase();
    for (const [k,idx2] of Object.entries(MONTH_MAP)) {
      if (sl.includes(k)) {
        const ym = sl.match(/20\d{2}/); const yr = ym ? ym[0] : "2024";
        return `${yr}-${String(idx2+1).padStart(2,"0")}-01`;
      }
    }
    return _seqDate(idx, sheetName);
  }

  function _seqDate(idx, sheetName) {
    const base = _sheetDate(sheetName) || new Date("2020-01-01");
    const d = new Date(base); d.setDate(d.getDate() + idx * 7);
    return d.toISOString().slice(0,10);
  }

  function _sheetDate(name) {
    if (!name) return null;
    const s = name.toLowerCase();
    const ym = s.match(/20\d{2}/); const yr = ym ? parseInt(ym[0]) : new Date().getFullYear();
    for (const [k,mo] of Object.entries(MONTH_MAP)) {
      if (s.includes(k)) return new Date(yr, mo, 1);
    }
    return null;
  }

  function _toNum(v) {
    if (typeof v === "number") return v;
    return parseFloat(String(v).replace(/\s/g,"").replace(",","."));
  }

  function _analyzeMatrix(matrix) {
    if (!matrix || matrix.length < 2) return null;
    const headers = matrix[0].map(h => String(h).toLowerCase().trim());
    const dateIdx = headers.findIndex((h,i) => DATE_KW.some(kw => h.includes(kw)));
    const valIdx = headers.findIndex((h,i) => VAL_KW.some(kw => h.includes(kw)));
    if (dateIdx === -1 || valIdx === -1) return null;
    const rows = [];
    for (let i = 1; i < Math.min(matrix.length, 500); i++) {
      if (_isDateVal(matrix[i][dateIdx]) && _isNumVal(matrix[i][valIdx])) {
        rows.push({
          ds: _toDate(matrix[i][dateIdx], i, ""),
          y: _toNum(matrix[i][valIdx])
        });
      }
    }
    return rows.length >= 2 ? rows : null;
  }

  function handleFileUpload(e) {
    setCsvError("");
    setError("");
    const file = e.target.files[0];
    if (!file) return;

    // ✅ MODIFICATION #1: File size validation (Lines 268-273)
    // Prevents users from uploading files larger than 10MB
    // This protects backend memory and processing time
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setCsvError(`❌ Fichier trop volumineux (${sizeMB} MB). Maximum: 10MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        let parsed = null;
        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const matrix = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const rows = _analyzeMatrix(matrix);
          if (rows && rows.length >= 2) {
            parsed = rows;
            break;
          }
        }
        if (!parsed) {
          setCsvError("❌ Colonnes date/valeur non trouvées. Utilisez 'date' et 'y' ou 'quantity'.");
          return;
        }
        setData(parsed);
        setCsvError("");
      } catch (ex) {
        setCsvError("❌ Erreur: fichier invalide");
      }
    };
    reader.readAsBinaryString(file);
  }

  async function handlePredict() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await backendClient.recommendations(data, productName, periods, sector, sectorParams, advancedConfig);
      setResult(res);
      setTab("forecast");
    } catch (ex) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveScenario() {
    if (!result) return alert("❌ Pas de prédiction à sauvegarder");
    try {
      await backendClient.createScenario({
        name: productName,
        sector,
        forecast_data: result,
        tags: [sector, "manual"]
      });
      alert("✓ Scénario sauvegardé");
    } catch (ex) {
      alert("❌ Erreur: " + ex.message);
    }
  }

  // ═════════════════════════════════════════════════════════════
  // STYLES
  // ═════════════════════════════════════════════════════════════
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
      background: variant === "primary" ? "#000" : variant === "danger" ? "#cc0000" : "#999",
      color: "#fff",
      border: "1px solid #000", padding: "10px 24px",
      fontFamily: "Courier New, monospace", fontWeight: "700", fontSize: "14px",
      cursor: "pointer", borderRadius: "2px"
    }),
    alert: (type) => ({
      padding: "10px 14px", marginBottom: "8px", fontSize: "13px",
      background: type === "error" ? "#fff0f0" : type === "warning" ? "#fffbe6" : "#f0fff0",
      border: `1px solid ${type === "error" ? "#ff4444" : type === "warning" ? "#ffaa00" : "#00cc00"}`,
      color: "#000"
    })
  };

  // ✅ MODIFICATION #3: Default planLabel set to "trial" (Line 365)
  // This ensures the UI displays "TRIAL" when subscription status is unknown
  // Only shows "ACTIVE" if explicitly returned by the backend
  const planLabel = subStatus?.plan || "trial";
  const planColor = planLabel === "active" ? "#006600" : planLabel === "trial" ? "#cc6600" : "#cc0000";

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════
  return (
    <div style={STYLE.page}>
      {/* NAV */}
      <div style={STYLE.nav}>
        <h1 style={{ margin: 0, fontSize: "18px" }}>📊 StockPredi</h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {user && <span style={{ fontSize: "12px" }}>👤 {user.email}</span>}
          <span style={{ fontSize: "12px", color: planColor, fontWeight: "700" }}>Plan: {planLabel.toUpperCase()}</span>
          {subLoading ? "..." : null}
          <button onClick={handleLogout} style={{ ...STYLE.btn("secondary"), background: "#999", padding: "6px 12px", fontSize: "12px" }}>Logout</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={STYLE.main}>
        {/* TABS */}
        <div style={STYLE.tabs}>
          {["forecast", "history", "account"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={STYLE.tab(tab === t)}>
              {t === "forecast" ? "📈 Prédictions" : t === "history" ? "📋 Historique" : "⚙️ Compte"}
            </button>
          ))}
        </div>

        {/* FORECAST TAB */}
        {tab === "forecast" && (
          <div>
            {!result ? (
              <>
                <div style={STYLE.card}>
                  <h2 style={{ marginTop: 0 }}>Charger données (CSV/Excel)</h2>
                  <input type="file" ref={fileRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls" style={{ display: "none" }} />
                  <button onClick={() => fileRef.current?.click()} style={STYLE.btn()}>📁 Choisir fichier</button>
                  {csvError && <p style={STYLE.alert("error")}>{csvError}</p>}
                  {data && <p style={{ color: "#006600", fontSize: "13px" }}>✓ {data.length} lignes chargées</p>}
                </div>

                {data && (
                  <>
                    <div style={STYLE.card}>
                      <label style={STYLE.label}>Nom produit</label>
                      <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} style={STYLE.input} />
                    </div>

                    <div style={STYLE.card}>
                      <label style={STYLE.label}>Secteur d'activité</label>
                      <SectorSelector sector={sector} onSectorChange={handleSectorChange} />
                    </div>

                    {/* Display sector metrics */}
                    <div style={STYLE.card}>
                      <SectorAdvancedMetrics sector={sector} />
                    </div>

                    <div style={STYLE.card}>
                      <label style={STYLE.label}>Périodes à prédire</label>
                      <input type="number" min="7" max="365" value={periods} onChange={(e) => setPeriods(parseInt(e.target.value))} style={STYLE.input} />
                    </div>

                    <button onClick={handlePredict} disabled={loading} style={{...STYLE.btn(), opacity: loading ? 0.6 : 1 }}>
                      {loading ? "⏳ Analyse en cours..." : "🚀 Générer prédiction"}
                    </button>
                    {error && <p style={STYLE.alert("error")}>{error}</p>}
                  </>
                )}
              </>
            ) : (
              <>
                <div style={STYLE.card}>
                  <h2 style={{ marginTop: 0 }}>{productName}</h2>
                  <p><strong>Secteur:</strong> {sector}</p>
                  <p><strong>Périodes:</strong> {periods}</p>
                  {result.forecast && (
                    <div>
                      <p><strong>Prévisions:</strong></p>
                      <pre style={{ fontSize: "11px", overflow: "auto", maxHeight: "200px", background: "#f5f5f5", padding: "8px" }}>
                        {JSON.stringify(result.forecast.slice(0, 5), null, 2)}...
                      </pre>
                    </div>
                  )}
                  <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
                    <button onClick={handleSaveScenario} style={STYLE.btn()}>💾 Sauvegarder</button>
                    <button onClick={() => { setResult(null); setData(null); }} style={STYLE.btn("secondary")}>🔄 Nouvelle analyse</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div>
            <h2>Historique des prédictions</h2>
            {historyLoading ? (
              <p>Chargement...</p>
            ) : history && history.length > 0 ? (
              <div>
                {history.map(row => (
                  <div key={row.id} style={STYLE.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{row.filename}</strong>
                        <p style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>
                          {new Date(row.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => viewPrediction(row)} style={STYLE.btn()}>Voir</button>
                        <button onClick={() => deletePrediction(row.id)} style={STYLE.btn("danger")}>Supprimer</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#999" }}>Aucune prédiction pour le moment</p>
            )}
          </div>
        )}

        {/* ACCOUNT / RGPD TAB */}
        {tab === "account" && (
          <div>
            <h2>Paramètres du compte</h2>

            {/* Profil */}
            <div style={STYLE.card}>
              <h3 style={{ marginTop: 0 }}>Profil</h3>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Plan:</strong> <span style={{ color: planColor, fontWeight: "700" }}>{planLabel}</span></p>
              <button onClick={handleLogout} style={STYLE.btn("secondary")}>Déconnexion</button>
            </div>

            {/* RGPD - Données personnelles */}
            <div style={STYLE.card}>
              <h3 style={{ marginTop: 0 }}>📋 Données personnelles (Article 20 RGPD)</h3>
              <p style={{ fontSize: "13px", color: "#555" }}>
                Télécharge une copie de toutes tes données dans un format portable (JSON).
              </p>
              <button
                onClick={handleRgpdExport}
                disabled={rgpdExportLoading}
                style={{ ...STYLE.btn(), opacity: rgpdExportLoading ? 0.6 : 1 }}
              >
                {rgpdExportLoading ? "⏳ Export en cours..." : "📥 Télécharger mes données"}
              </button>
              {rgpdError && <p style={STYLE.alert("error")}>{rgpdError}</p>}
            </div>

            {/* RGPD - Suppression de compte */}
            <div style={STYLE.card}>
              <h3 style={{ marginTop: 0, color: "#cc0000" }}>🗑️ Supprimer mon compte (Article 17 RGPD)</h3>
              <p style={{ fontSize: "13px", color: "#555" }}>
                Ceci supprimera <strong>définitivement</strong> tous tes données: prédictions, scénarios, profil.
              </p>

              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={STYLE.btn("danger")}>
                  Supprimer mon compte
                </button>
              ) : (
                <div style={{ border: "2px solid #cc0000", padding: "16px", background: "#fff0f0" }}>
                  <p style={{ fontWeight: "700", color: "#cc0000" }}>⚠️ ATTENTION: CETTE ACTION EST IRRÉVERSIBLE</p>
                  <p style={{ fontSize: "13px" }}>Tous tes données seront supprimées définitivement:</p>
                  <ul style={{ fontSize: "13px", margin: "8px 0" }}>
                    <li>✓ Ton compte</li>
                    <li>✓ Tes prédictions</li>
                    <li>✓ Tes scénarios</li>
                    <li>✓ Toutes tes données</li>
                  </ul>
                  <p style={{ fontSize: "13px", color: "#666" }}>Tape "OUI" pour confirmer:</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleRgpdDelete}
                      disabled={rgpdLoading}
                      style={{ ...STYLE.btn("danger"), opacity: rgpdLoading ? 0.6 : 1 }}
                    >
                      {rgpdLoading ? "⏳ Suppression..." : "Oui, supprimer"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={rgpdLoading}
                      style={{ ...STYLE.btn("secondary"), opacity: rgpdLoading ? 0.6 : 1 }}
                    >
                      Annuler
                    </button>
                  </div>
                  {rgpdError && <p style={STYLE.alert("error")}>{rgpdError}</p>}
                </div>
              )}
            </div>

            {/* RGPD - Politique */}
            <div style={STYLE.card}>
              <h3 style={{ marginTop: 0 }}>📖 Politique de confidentialité</h3>
              <p style={{ fontSize: "13px", color: "#555" }}>
                Pour plus d'informations sur tes droits RGPD et comment nous protégeons tes données:
              </p>
              <Link to="/privacy-policy" style={{ color: "#000", fontWeight: "700", textDecoration: "underline" }}>
                Lire la politique de confidentialité →
              </Link>
            </div>

            {/* Liens légaux */}
            <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #000", fontSize: "12px", color: "#666" }}>
              <p style={{ marginBottom: "8px" }}>
                <a href="https://stockpredi-backend.onrender.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#000", marginRight: "16px" }}>
                  Politique de Confidentialité
                </a>
                <a href="https://stockpredi-backend.onrender.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#000", marginRight: "16px" }}>
                  CGU
                </a>
                <a href="https://stockpredi-backend.onrender.com/legal" target="_blank" rel="noopener noreferrer" style={{ color: "#000" }}>
                  Mentions Légales
                </a>
              </p>
              <p style={{ fontSize: "11px", color: "#999" }}>
                © 2026 StockPredi | Conforme RGPD | Pour toute question: <strong>contact@stockpredi.fr</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}