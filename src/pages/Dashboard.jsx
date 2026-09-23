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

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // STATE MANAGEMENT (allÃ©gÃ©)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

  // RGPD simplifiÃ©e
  const [rgpdLoading, setRgpdLoading] = useState(false);
  const [rgpdError, setRgpdError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rgpdExportLoading, setRgpdExportLoading] = useState(false);

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // INIT & EFFECTS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  useEffect(() => {
    const validation = validateAllSectors(SECTOR_CONFIGS);
    if (validation.invalid.length > 0) {
      console.error("âŒ Invalid sector configs:", validation.invalid);
      setConfigErrors(validation.invalid.flatMap(inv => inv.errors));
    } else {
      console.log("âœ… All sector configs valid");
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
      // âœ… MODIFICATION #2: Subscription fallback set to "trial" (Line 77)
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

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // HANDLERS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RGPD: Export Data (Article 20 - Droit Ã  la portabilitÃ©)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  async function handleRgpdExport() {
    setRgpdExportLoading(true);
    setRgpdError("");
    try {
      const data = await backendClient.rgpdExport();
      // CrÃ©er un blob JSON et tÃ©lÃ©charger
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
      alert("âœ“ DonnÃ©es exportÃ©es avec succÃ¨s!");
    } catch (err) {
      setRgpdError(`âŒ Erreur export: ${err.message || "Contactez support"}`);
    } finally {
      setRgpdExportLoading(false);
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RGPD: Delete Account (Article 17 - Droit Ã  l'oubli)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  async function handleRgpdDelete() {
    setRgpdLoading(true);
    setRgpdError("");
    setShowDeleteConfirm(false);
    try {
      await backendClient.rgpdDelete();
      alert("âœ“ Compte supprimÃ© avec succÃ¨s. Redirection...");
      setTimeout(() => {
        supabase.auth.signOut();
        navigate("/");
      }, 1500);
    } catch (err) {
      setRgpdError(`âŒ Erreur: ${err.message || "Contactez support"}`);
    } finally {
      setRgpdLoading(false);
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // CSV PARSER (existant, conservÃ© tel quel)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const DATE_KW = ["date","ds","jour","mois","semaine","pÃ©riode","periode","month","week","time","timestamp","annÃ©e","annee","year"];
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

    // âœ… MODIFICATION #1: File size validation (Lines 268-273)
    // Prevents users from uploading files larger than 10MB
    // This protects backend memory and processing time
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setCsvError(`âŒ Fichier trop volumineux (${sizeMB} MB). Maximum: 10MB.`);
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
          setCsvError("âŒ Colonnes date/valeur non trouvÃ©es. Utilisez 'date' et 'y' ou 'quantity'.");
          return;
        }
        setData(parsed);
        setCsvError("");
      } catch (ex) {
        setCsvError("âŒ Erreur: fichier invalide");
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
    if (!result) return alert("âŒ Pas de prÃ©diction Ã  sauvegarder");
    try {
      await backendClient.createScenario({
        name: productName,
        sector,
        forecast_data: result,
        tags: [sector, "manual"]
      });
      alert("âœ“ ScÃ©nario sauvegardÃ©");
    } catch (ex) {
      alert("âŒ Erreur: " + ex.message);
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // STYLES
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

  // âœ… MODIFICATION #3: Default planLabel set to "trial" (Line 365)
  // This ensures the UI displays "TRIAL" when subscription status is unknown
  // Only shows "ACTIVE" if explicitly returned by the backend
  const planLabel = subStatus?.plan || "trial";
  const planColor = planLabel === "active" ? "#006600" : planLabel === "trial" ? "#cc6600" : "#cc0000";

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // RENDER
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <div style={STYLE.page}>
      {/* NAV */}
      <div style={STYLE.nav}>
        <h1 style={{ margin: 0, fontSize: "18px" }}>ðŸ“Š StockPredi</h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {user && <span style={{ fontSize: "12px" }}>ðŸ‘¤ {user.email}</span>}
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
              {t === "forecast" ? "ðŸ“ˆ PrÃ©dictions" : t === "history" ? "ðŸ“‹ Historique" : "âš™ï¸ Compte"}
            </button>
          ))}
        </div>

        {/* FORECAST TAB */}
        {tab === "forecast" && (
          <div>
            {/* SECTEUR TOUJOURS VISIBLE - AVANT L'IMPORT */}
            <div style={STYLE.card}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Secteur d'activité</h2>
              <select style={STYLE.input} value={sector} onChange={e => handleSectorChange(e.target.value)}>
                <option value="general">Général</option>
                <option value="restaurant">Restaurant / Traiteur</option>
                <option value="epicerie">Épicerie / Alimentation</option>
                <option value="boulangerie">Boulangerie / Pâtisserie</option>
                <option value="pepiniere">Pépinière / Jardinerie</option>
                <option value="boutique">Boutique / Commerce de détail</option>
                <option value="bureau_etude">Bureau d'études / Services</option>
              </select>
              <p style={{ fontSize: "12px", color: "#888", marginTop: "12px" }}>Choisissez avant d'importer</p>
            </div>

            {!result ? (
              <>
                <div style={STYLE.card}>
                  <h2 style={{ marginTop: 0 }}>Charger donnÃ©es (CSV/Excel)</h2>
                  <input type="file" ref={fileRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls" style={{ display: "none" }} />
                  <button onClick={() => fileRef.current?.click()} style={STYLE.btn()}>ðŸ“ Choisir fichier</button>
                  {csvError && <p style={STYLE.alert("error")}>{csvError}</p>}
                  {data && <p style={{ color: "#006600", fontSize: "13px" }}>âœ“ {data.length} lignes chargÃ©es</p>}
                </div>

                {data && (
                  <>
                    <div style={STYLE.card}>
                      <label style={STYLE.label}>Nom produit</label>
                      <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} style={STYLE.input} />
                    </div>

                    <div style={STYLE.card}>
                      <label style={STYLE.label}>Secteur d'activitÃ©</label>
                      <SectorSelector sector={sector} onSectorChange={handleSectorChange} />
                    </div>

                    {/* Display sector metrics */}
                    <div style={STYLE.card}>
                      <SectorAdvancedMetrics sector={sector} />
                    </div>

                    <div style={STYLE.card}>
                      <label style={STYLE.label}>PÃ©riodes Ã  prÃ©dire</label>
                      <input type="number" min="7" max="365" value={periods} onChange={(e) => setPeriods(parseInt(e.target.value))} style={STYLE.input} />
                    </div>

                    <button onClick={handlePredict} disabled={loading} style={{...STYLE.btn(), opacity: loading ? 0.6 : 1 }}>
                      {loading ? "â³ Analyse en cours..." : "ðŸš€ GÃ©nÃ©rer prÃ©diction"}
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
                  <p><strong>PÃ©riodes:</strong> {periods}</p>
                  {result.forecast && (
                    <div>
                      <p><strong>PrÃ©visions:</strong></p>
                      <pre style={{ fontSize: "11px", overflow: "auto", maxHeight: "200px", background: "#f5f5f5", padding: "8px" }}>
                        {JSON.stringify(result.forecast.slice(0, 5), null, 2)}...
                      </pre>
                    </div>
                  )}
                  <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
                    <button onClick={handleSaveScenario} style={STYLE.btn()}>ðŸ’¾ Sauvegarder</button>
                    <button onClick={() => { setResult(null); setData(null); }} style={STYLE.btn("secondary")}>ðŸ”„ Nouvelle analyse</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div>
            <h2>Historique des prÃ©dictions</h2>
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
              <p style={{ color: "#999" }}>Aucune prÃ©diction pour le moment</p>
            )}
          </div>
        )}

        {/* ACCOUNT / RGPD TAB */}
        {tab === "account" && (
          <div>
            <h2>ParamÃ¨tres du compte</h2>

            {/* Profil */}
            <div style={STYLE.card}>
              <h3 style={{ marginTop: 0 }}>Profil</h3>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Plan:</strong> <span style={{ color: planColor, fontWeight: "700" }}>{planLabel}</span></p>
              <button onClick={handleLogout} style={STYLE.btn("secondary")}>DÃ©connexion</button>
            </div>

            {/* RGPD - DonnÃ©es personnelles */}
            <div style={STYLE.card}>
              <h3 style={{ marginTop: 0 }}>ðŸ“‹ DonnÃ©es personnelles (Article 20 RGPD)</h3>
              <p style={{ fontSize: "13px", color: "#555" }}>
                TÃ©lÃ©charge une copie de toutes tes donnÃ©es dans un format portable (JSON).
              </p>
              <button
                onClick={handleRgpdExport}
                disabled={rgpdExportLoading}
                style={{ ...STYLE.btn(), opacity: rgpdExportLoading ? 0.6 : 1 }}
              >
                {rgpdExportLoading ? "â³ Export en cours..." : "ðŸ“¥ TÃ©lÃ©charger mes donnÃ©es"}
              </button>
              {rgpdError && <p style={STYLE.alert("error")}>{rgpdError}</p>}
            </div>

            {/* RGPD - Suppression de compte */}
            <div style={STYLE.card}>
              <h3 style={{ marginTop: 0, color: "#cc0000" }}>ðŸ—‘ï¸ Supprimer mon compte (Article 17 RGPD)</h3>
              <p style={{ fontSize: "13px", color: "#555" }}>
                Ceci supprimera <strong>dÃ©finitivement</strong> tous tes donnÃ©es: prÃ©dictions, scÃ©narios, profil.
              </p>

              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={STYLE.btn("danger")}>
                  Supprimer mon compte
                </button>
              ) : (
                <div style={{ border: "2px solid #cc0000", padding: "16px", background: "#fff0f0" }}>
                  <p style={{ fontWeight: "700", color: "#cc0000" }}>âš ï¸ ATTENTION: CETTE ACTION EST IRRÃ‰VERSIBLE</p>
                  <p style={{ fontSize: "13px" }}>Tous tes donnÃ©es seront supprimÃ©es dÃ©finitivement:</p>
                  <ul style={{ fontSize: "13px", margin: "8px 0" }}>
                    <li>âœ“ Ton compte</li>
                    <li>âœ“ Tes prÃ©dictions</li>
                    <li>âœ“ Tes scÃ©narios</li>
                    <li>âœ“ Toutes tes donnÃ©es</li>
                  </ul>
                  <p style={{ fontSize: "13px", color: "#666" }}>Tape "OUI" pour confirmer:</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleRgpdDelete}
                      disabled={rgpdLoading}
                      style={{ ...STYLE.btn("danger"), opacity: rgpdLoading ? 0.6 : 1 }}
                    >
                      {rgpdLoading ? "â³ Suppression..." : "Oui, supprimer"}
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
              <h3 style={{ marginTop: 0 }}>ðŸ“– Politique de confidentialitÃ©</h3>
              <p style={{ fontSize: "13px", color: "#555" }}>
                Pour plus d'informations sur tes droits RGPD et comment nous protÃ©geons tes donnÃ©es:
              </p>
              <Link to="/privacy-policy" style={{ color: "#000", fontWeight: "700", textDecoration: "underline" }}>
                Lire la politique de confidentialitÃ© â†’
              </Link>
            </div>

            {/* Liens lÃ©gaux */}
            <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #000", fontSize: "12px", color: "#666" }}>
              <p style={{ marginBottom: "8px" }}>
                <a href="https://stockpredi-backend.onrender.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#000", marginRight: "16px" }}>
                  Politique de ConfidentialitÃ©
                </a>
                <a href="https://stockpredi-backend.onrender.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#000", marginRight: "16px" }}>
                  CGU
                </a>
                <a href="https://stockpredi-backend.onrender.com/legal" target="_blank" rel="noopener noreferrer" style={{ color: "#000" }}>
                  Mentions LÃ©gales
                </a>
              </p>
              <p style={{ fontSize: "11px", color: "#999" }}>
                Â© 2026 StockPredi | Conforme RGPD | Pour toute question: <strong>contact@stockpredi.fr</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}