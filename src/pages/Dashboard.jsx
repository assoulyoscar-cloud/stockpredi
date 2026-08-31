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
  const [rgpdExporting, setRgpdExporting] = useState(false);
  const [importedFiles, setImportedFiles] = useState([]); // liste des fichiers importés
  const [rgpdDeleting, setRgpdDeleting] = useState(false);
  const [rgpdStatus, setRgpdStatus] = useState(null);
  const [rgpdContactOpen, setRgpdContactOpen] = useState(false);
  const [rgpdContactType, setRgpdContactType] = useState("question");
  const [rgpdContactMsg, setRgpdContactMsg] = useState("");

  // RGPD state
  const [rgpdLoading, setRgpdLoading] = useState(false);
  const [rgpdError, setRgpdError] = useState("");
  const [rgpdSuccess, setRgpdSuccess] = useState("");
  const [rgpdStatus, setRgpdStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  useEffect(() => { if (tab === "account" && rgpdStatus === null && user) { backendClient.rgpdStatus().then(setRgpdStatus).catch(() => {}); } }, [tab, user, rgpdStatus]);

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

  async function handleRgpdExport() {
    setRgpdExporting(true);
    try { await backendClient.rgpdExport(); setRgpdStatus(s=>({...s,last_export:new Date().toISOString()})); alert("Export RGPD envoye par email !"); }
    catch(err) { alert("Erreur : "+err.message); }
    finally { setRgpdExporting(false); }
  }
  async function handleRgpdDelete() {
    if (!window.confirm("Supprimer toutes vos previsions ? Action irreversible.")) return;
    setRgpdDeleting(true);
    try { const res=await backendClient.rgpdDelete(); setHistory([]); alert(res.deleted_predictions+" prevision(s) supprimee(s)."); }
    catch(err) { alert("Erreur : "+err.message); }
    finally { setRgpdDeleting(false); }
  }
  async function handleRgpdContact() {
    if (!rgpdContactMsg.trim()) return;
    try { await backendClient.rgpdContact({email:user?.email,type:rgpdContactType,message:rgpdContactMsg}); setRgpdContactOpen(false); setRgpdContactMsg(""); alert("Demande envoyee. Reponse sous 30 jours."); }
    catch(err) { alert("Erreur : "+err.message); }
  }
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  // ═══════════════════════════════════════════════════
  // SMART PARSER — Lit tout Excel/CSV automatiquement
  // ═══════════════════════════════════════════════════

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
    const nCols = Math.max(...matrix.map(r => r.length));

    // Trouver la ligne d'en-tête (première avec du texte non-numérique)
    let hdr = 0;
    for (let i = 0; i < Math.min(15, matrix.length); i++) {
      const textCells = matrix[i].filter(v => v !== null && v !== "" && !_isNumVal(v) && !_isDateVal(v));
      if (textCells.length >= 1) { hdr = i; break; }
    }

    const headers = (matrix[hdr] || []).map(h => String(h ?? "").trim());
    const data = matrix.slice(hdr + 1);

    // Stats par colonne
    const cols = Array.from({length: nCols}, (_, ci) => {
      let dates=0, nums=0, empties=0, positiveNums=0;
      const samples = [];
      for (const row of data) {
        const v = row[ci];
        if (v === null || v === undefined || String(v).trim() === "") { empties++; continue; }
        if (_isDateVal(v)) { dates++; if (samples.length<2) samples.push(v); }
        else if (_isNumVal(v)) {
          nums++;
          const n = _toNum(v);
          if (n > 0) positiveNums++;
          if (samples.length<2) samples.push(v);
        }
      }
      const h = (headers[ci] || "").toLowerCase();
      return {
        ci, header: headers[ci] || "",
        dates, nums, positiveNums, empties,
        total: data.length - empties,
        dateScore: (DATE_KW.some(k => h.includes(k)) ? 4 : 0) + dates * 2 + (dates>0?2:0),
        valScore: (VAL_KW.some(k => h===k || h.includes(k)) ? 3 : 0)
                + positiveNums * 1.5
                - (DATE_KW.some(k => h.includes(k)) ? 10 : 0),
        samples
      };
    });

    const sorted_d = [...cols].sort((a,b) => b.dateScore - a.dateScore);
    const bestDate = sorted_d[0];
    const bestVal = [...cols].filter(c => c.ci !== bestDate.ci).sort((a,b) => b.valScore - a.valScore)[0] || cols[0];
    const hasRealDates = bestDate.dateScore > 2;

    return { hdr, headers, data, cols, bestDate, bestVal, hasRealDates };
  }

  function _extractSeries(analysis, sheetName) {
    const { data, bestDate, bestVal, hasRealDates } = analysis;
    const result = {};
    let idx = 0;
    for (const row of data) {
      const rawV = row[bestVal.ci];
      if (!_isNumVal(rawV) && typeof rawV !== "number") continue;
      const y = _toNum(rawV);
      if (isNaN(y) || y <= 0) continue;
      const rawD = row[bestDate.ci];
      const ds = (hasRealDates && rawD) ? _toDate(rawD, idx, sheetName) : _seqDate(idx, sheetName);
      result[ds] = (result[ds] || 0) + y; // additionner si même date
      idx++;
    }
    return Object.entries(result).map(([ds,y]) => ({ds,y})).sort((a,b)=>a.ds.localeCompare(b.ds));
  }

  function smartParseCSV(text) {
    const clean = text.replace(/^\uFEFF/, "");
    const lines = clean.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) throw new Error("❌ Fichier trop court — minimum 2 lignes.");
    const sep = lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
    const matrix = lines.map(l => l.split(sep).map(v => v.trim().replace(/^"|"$/g,"")));
    const analysis = _analyzeMatrix(matrix);
    if (!analysis) throw new Error("❌ Impossible d'analyser ce fichier CSV.");
    const rows = _extractSeries(analysis, "CSV");
    if (rows.length < 7) throw new Error(`❌ Seulement ${rows.length} valeurs extraites (minimum 7).\nColonne date: "${analysis.bestDate.header || "générée"}" | Colonne valeur: "${analysis.bestVal.header}"`);
    return { rows, meta: { mode: analysis.hasRealDates?"série temporelle":"bordereau", dateCol: analysis.bestDate.header||"générée", valueCol: analysis.bestVal.header, count: rows.length } };
  }

  function smartParseExcel(buf) {
    const wb = XLSX.read(buf, { type:"array", cellDates:false, raw:true });
    const results = [];
    for (const sn of wb.SheetNames) {
      const ws = wb.Sheets[sn];
      const matrix = XLSX.utils.sheet_to_json(ws, { header:1, defval:null, raw:true });
      if (!matrix || matrix.length < 3) continue;
      const analysis = _analyzeMatrix(matrix);
      if (!analysis) continue;
      const rows = _extractSeries(analysis, sn);
      if (rows.length < 3) continue;
      const quality = rows.length + (analysis.hasRealDates?20:0) + analysis.bestVal.positiveNums*0.5;
      results.push({ sn, rows, analysis, quality });
    }
    if (results.length === 0) throw new Error("❌ Aucune donnée exploitable dans ce fichier Excel.\n\nVérifiez que votre fichier contient des colonnes avec des valeurs numériques (montants, quantités, ventes...).");
    results.sort((a,b) => b.quality - a.quality);
    const best = results[0];
    if (best.rows.length < 7) throw new Error(`❌ Données insuffisantes : ${best.rows.length} lignes valides (minimum 7).\nFeuille: "${best.sn}" | Valeur: "${best.analysis.bestVal.header}"`);
    return { rows: best.rows, meta: { sheet: best.sn, mode: best.analysis.hasRealDates?"série temporelle":"bordereau (dates auto)", dateCol: best.analysis.bestDate.header||"auto", valueCol: best.analysis.bestVal.header, count: best.rows.length, sheets: results.length } };
  }

  async function handleFile(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    // Vérifier formats
    const invalid = files.filter(f => {
      const n = f.name.toLowerCase();
      return !n.endsWith(".csv") && !n.endsWith(".xlsx") && !n.endsWith(".xls");
    });
    if (invalid.length > 0) {
      setCsvError(`❌ Format non supporté : ${invalid.map(f=>f.name).join(", ")} — utilisez .csv, .xlsx ou .xls`);
      return;
    }
    setCsvError("");
    setData(null);

    // Parser chaque fichier
    const readFile = (file) => new Promise((resolve, reject) => {
      const name = file.name.toLowerCase();
      const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const result = isExcel
            ? smartParseExcel(ev.target.result)
            : smartParseCSV(ev.target.result);
          resolve({ file: file.name, ...result });
        } catch(err) {
          reject(new Error(`${file.name} : ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error(`Erreur lecture ${file.name}`));
      if (isExcel) reader.readAsArrayBuffer(file);
      else reader.readAsText(file, "UTF-8");
    });

    try {
      const results = await Promise.all(files.map(readFile));

      // Fusionner toutes les séries en une seule
      const merged = {};
      for (const r of results) {
        for (const {ds, y} of r.rows) {
          merged[ds] = (merged[ds] || 0) + y;
        }
      }
      const allRows = Object.entries(merged)
        .map(([ds, y]) => ({ds, y}))
        .sort((a,b) => a.ds.localeCompare(b.ds));

      if (allRows.length < 7) {
        throw new Error(`❌ Seulement ${allRows.length} points de données après fusion (minimum 7).`);
      }

      setData(allRows);
      setResult(null);
      setImportedFiles(results.map(r => ({
        name: r.file,
        count: r.rows.length,
        mode: r.meta.mode,
        valueCol: r.meta.valueCol
      })));

      // Messages d'info (ne bloquent pas le bouton)
      if (files.length > 1) {
        setCsvError(""); // pas d'erreur
      } else if (results[0].meta.mode.includes("bordereau")) {
        setCsvError(""); // pas d'erreur
      }
    } catch(err) {
      setCsvError(err.message);
      setData(null);
      setImportedFiles([]);
    }
  }

  function generatePDF() {
    const now = new Date().toLocaleDateString("fr-FR", {day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
    const preds = result.forecast?.predictions || [];
    const recs = result.recommendations || [];
    const alerts = result.alerts || [];
    const accuracy = ((result.forecast?.accuracy_score||0)*100).toFixed(0);

    const tableRows = preds.map((p,i) => `
      <tr style="background:${i%2===0?"#f9f9f9":"#fff"}">
        <td>${p.date}</td>
        <td style="font-weight:700;text-align:right">${p.forecast}</td>
        <td style="color:#666;text-align:right">${p.confidence_lower}</td>
        <td style="color:#666;text-align:right">${p.confidence_upper}</td>
      </tr>`).join("");

    const recRows = recs.map(r => {
      const col = r.priority==="CRITIQUE"?"#cc0000":r.priority==="ATTENTION"?"#cc6600":"#006600";
      return `<div style="padding:8px;margin-bottom:6px;border-left:3px solid ${col};background:${r.priority==="CRITIQUE"?"#fff0f0":r.priority==="ATTENTION"?"#fffbe6":"#f0fff0"}">
        <strong style="color:${col}">[${r.priority}]</strong> ${r.action}${r.detail?` <span style="color:#555">— ${r.detail}</span>`:""}
      </div>`;
    }).join("");

    const alertRows = alerts.map(a => {
      const isR = a.type==="stockout";
      return `<div style="padding:8px;margin-bottom:6px;border-left:3px solid ${isR?"#cc0000":"#cc6600"};background:${isR?"#fff0f0":"#fffbe6"}">
        <strong>${isR?"RUPTURE":"SURPLUS"}</strong> le ${a.date} — ${a.action}
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>StockPredi — ${productName}</title>
    <style>
      body{font-family:"Courier New",monospace;color:#000;margin:0;padding:0;font-size:12px}
      .header{background:#000;color:#fff;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}
      .header h1{margin:0;font-size:20px;letter-spacing:2px}
      .header small{font-size:10px;opacity:.8}
      .content{padding:24px}
      .meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0;padding:16px;border:1px solid #000}
      .meta div{text-align:center}
      .meta .val{font-size:18px;font-weight:700}
      .meta .lbl{font-size:10px;color:#555;margin-top:4px}
      h2{font-size:14px;border-bottom:2px solid #000;padding-bottom:4px;margin-top:24px}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
      th{background:#000;color:#fff;padding:6px 8px;text-align:left}
      th:not(:first-child){text-align:right}
      td{padding:5px 8px;border-bottom:1px solid #eee}
      td:not(:first-child){text-align:right}
      .footer{margin-top:32px;padding-top:8px;border-top:1px solid #ccc;font-size:9px;color:#888;display:flex;justify-content:space-between}
      @media print{.no-print{display:none}}
    </style></head><body>
    <div class="header">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="https://stockpredi.vercel.app/logoSTOCKPREDI.png" alt="StockPredi" style="height:36px;filter:invert(1)" onerror="this.style.display='none'"/>
        <div><h1>STOCKPREDI®</h1><small>Rapport de prévision IA — Document confidentiel</small></div>
      </div>
      <div style="text-align:right"><div style="font-size:14px;font-weight:700">${productName||"Mon produit"}</div><small>${now}</small></div>
    </div>
    <div class="content">
      <div class="meta">
        <div><div class="val">${result.trend||"-"}</div><div class="lbl">Tendance</div></div>
        <div><div class="val">${accuracy}%</div><div class="lbl">Précision modèle</div></div>
        <div><div class="val">${periods}j</div><div class="lbl">Horizon prévision</div></div>
      </div>
      <div style="font-size:10px;color:#555;margin-bottom:16px">
        Modèle : ${result.forecast?.model||"-"} · ${result.forecast?.data_points??(data?data.length:"-")} points d'historique
      </div>
      ${recs.length?`<h2>Recommandations IA</h2>${recRows}`:""}
      ${alerts.length?`<h2>Alertes détectées</h2>${alertRows}`:""}
      <h2>Prévisions ${periods} jours</h2>
      <table>
        <thead><tr><th>Date</th><th>Prévision</th><th>Min</th><th>Max</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">
        <div>
          <div style="font-weight:700;font-size:11px;letter-spacing:1px">STOCKPREDI®</div>
          <div>Marque déposée — Tous droits réservés © ${new Date().getFullYear()}</div>
          <div>SIRET : En cours d'enregistrement — APE 6201Z — APE 6201Z</div>
          <div>stockpredi.fr — support@stockpredi.fr</div>
          <div style="margin-top:4px;font-style:italic;color:#555">Document généré automatiquement par StockPredi. Toute reproduction ou diffusion interdite sans autorisation écrite.</div>
          <div style="margin-top:2px;color:#888">Hébergement UE — Données protégées RGPD — Paiements sécurisés Stripe (PCI DSS)</div>
        </div>
        <div style="text-align:right">
          <div>Généré le ${now}</div>
          <div style="margin-top:4px">Rapport confidentiel — Usage interne uniquement</div>
        </div>
      </div>
    </div>
    </body></html>`;

    const w = window.open("","_blank","width=900,height=700");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
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

  // RGPD: Export data
  async function handleRgpdExport() {
    setRgpdLoading(true);
    setRgpdError("");
    setRgpdSuccess("");
    try {
      const res = await backendClient.rgpdExport();
      setRgpdSuccess("✓ Données exportées avec succès ! Un email contenant le PDF a été envoyé à votre adresse et le fichier a été sauvegardé dans Google Drive.");
      // Refresh status after export
      setTimeout(() => loadRgpdStatus(), 1000);
    } catch (err) {
      setRgpdError(`❌ Erreur lors de l'export — ${err.message || "Réessayez dans quelques instants."}`);
    } finally {
      setRgpdLoading(false);
    }
  }

  // RGPD: Load export history
  async function loadRgpdStatus() {
    setRgpdLoading(true);
    setRgpdError("");
    try {
      const res = await backendClient.rgpdStatus();
      setRgpdStatus(res);
    } catch (err) {
      setRgpdError(`❌ Erreur lors du chargement de l'historique — ${err.message || "Réessayez."}`);
    } finally {
      setRgpdLoading(false);
    }
  }

  // RGPD: Delete account
  async function handleRgpdDelete() {
    setRgpdLoading(true);
    setRgpdError("");
    setRgpdSuccess("");
    setShowDeleteConfirm(false);
    try {
      const res = await backendClient.rgpdDelete();
      setRgpdSuccess("✓ Compte supprimé avec succès. Redirection...");
      setTimeout(() => {
        supabase.auth.signOut();
        navigate("/");
      }, 2000);
    } catch (err) {
      setRgpdError(`❌ Erreur lors de la suppression — ${err.message || "Contactez support@stockpredi.fr"}`);
      setShowDeleteConfirm(false);
    } finally {
      setRgpdLoading(false);
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
      background: variant === "primary" ? "#000" : variant === "danger" ? "#cc0000" : "#fff",
      color: variant === "primary" || variant === "danger" ? "#fff" : "#000",
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
          {[["forecast","Nouvelle prévision"],["history","Historique"],["account","Mon compte"],["privacy","Confidentialité"]].map(([id, label]) => (
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
                  Importez un ou plusieurs fichiers CSV/Excel avec vos données historiques.
                </p>
                <button
                  onClick={() => fileRef.current && fileRef.current.click()}
                  style={STYLE.btn("primary")}
                >
                  Importer un fichier
                </button>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} multiple style={{ display: "none" }} />
                <div style={{ marginTop: "24px", fontSize: "12px", color: "#888", textAlign: "left", maxWidth: "400px", margin: "24px auto 0" }}>
                  <strong>Formats acceptés : .csv · .xlsx · .xls · plusieurs fichiers simultanément</strong><br />
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
                    <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} multiple style={{ display: "none" }} />
                    <button onClick={() => fileRef.current.click()} style={STYLE.btn("secondary")}>
                      {data ? "Changer le fichier" : "Importer un fichier"}
                    </button>
                    <span style={{ fontSize: "13px", color: data ? "#006600" : "#555" }}>
                      {data
  ? importedFiles.length > 1
    ? `✓ ${importedFiles.length} fichiers — ${data.length} points fusionnés`
    : `✓ ${data.length} lignes importées`
  : "Aucun fichier"}
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
                    <button
                      onClick={generatePDF}
                      style={{ ...STYLE.btn("secondary"), marginTop: "16px", fontSize: "13px" }}
                    >
                      Télécharger le rapport PDF
                    </button>
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
            <div style={{...STYLE.card,marginTop:"24px"}}>
              <h2 style={{fontSize:"16px",fontWeight:"700",marginBottom:"16px"}}>Confidentialite et RGPD</h2>
              <p style={{fontSize:"12px",color:"#555",marginBottom:"16px"}}>Conformement au RGPD, vous disposez des droits suivants.</p>
              <div style={{fontSize:"12px",marginBottom:"16px",lineHeight:"1.8"}}>
                <div>Art. 15 - Droit d'acces a vos donnees</div>
                <div>Art. 16 - Droit de rectification</div>
                <div>Art. 17 - Droit a l'effacement</div>
                <div>Art. 20 - Droit a la portabilite</div>
                <div>Art. 21 - Droit d'opposition</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <div>
                  <button onClick={handleRgpdExport} disabled={rgpdExporting} style={{...STYLE.btn("primary"),fontSize:"13px",opacity:rgpdExporting?0.6:1}}>
                    {rgpdExporting?"Generation...":"Telecharger mes donnees (PDF par email)"}
                  </button>
                  {rgpdStatus?.last_export&&<p style={{fontSize:"11px",color:"#555",marginTop:"6px"}}>Dernier export : {new Date(rgpdStatus.last_export).toLocaleDateString("fr-FR")}</p>}
                </div>
                <button onClick={handleRgpdDelete} disabled={rgpdDeleting} style={{...STYLE.btn("secondary"),color:"#cc0000",borderColor:"#cc0000",fontSize:"13px"}}>
                  {rgpdDeleting?"Suppression...":"Supprimer mes previsions"}
                </button>
                <button onClick={()=>setRgpdContactOpen(o=>!o)} style={{...STYLE.btn("secondary"),fontSize:"13px"}}>
                  Contacter le DPO
                </button>
                {rgpdContactOpen&&(<div style={{border:"1px solid #000",padding:"16px",marginTop:"4px"}}>
                  <select style={{...STYLE.input,marginBottom:"8px"}} value={rgpdContactType} onChange={e=>setRgpdContactType(e.target.value)}>
                    <option value="question">Question generale</option>
                    <option value="rectification">Rectification de donnees</option>
                    <option value="opposition">Opposition au traitement</option>
                    <option value="suppression">Suppression de compte</option>
                  </select>
                  <textarea style={{...STYLE.input,height:"80px",resize:"vertical"}} placeholder="Votre message..." value={rgpdContactMsg} onChange={e=>setRgpdContactMsg(e.target.value)}/>
                  <button onClick={handleRgpdContact} style={{...STYLE.btn("primary"),marginTop:"8px",fontSize:"13px"}}>Envoyer</button>
                </div>)}
              </div>
              <div style={{marginTop:"16px",fontSize:"12px",borderTop:"1px solid #eee",paddingTop:"12px"}}>
                <a href="/politique-confidentialite" style={{color:"#000",marginRight:"16px"}}>Politique de confidentialite</a>
                <a href="/mentions-legales" style={{color:"#000"}}>Mentions legales</a>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRIVACY (RGPD) */}
        {tab === "privacy" && (
          <div>
            {/* RGPD ERRORS & SUCCESS */}
            {rgpdError && (
              <div style={{ background: "#fff0f0", border: "1px solid #cc0000", padding: "12px", marginBottom: "24px", fontSize: "14px", color: "#cc0000" }}>
                {rgpdError}
              </div>
            )}
            {rgpdSuccess && (
              <div style={{ background: "#f0fff0", border: "1px solid #006600", padding: "12px", marginBottom: "24px", fontSize: "14px", color: "#006600" }}>
                {rgpdSuccess}
              </div>
            )}

            {/* CONFIDENTIALITÉ & DONNÉES */}
            <div style={STYLE.card}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>
                Confidentialité et RGPD
              </h2>
              <p style={{ fontSize: "13px", color: "#555", marginBottom: "20px" }}>
                Conformément au RGPD (Règlement Général sur la Protection des Données), vous avez le droit de télécharger, modifier ou supprimer vos données personnelles.
              </p>

              <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", marginTop: "20px" }}>
                📥 Télécharger mes données
              </h3>
              <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>
                Récupérez une copie complète de vos données au format PDF. Le fichier sera envoyé par email et sauvegardé dans Google Drive.
              </p>
              <button
                onClick={handleRgpdExport}
                disabled={rgpdLoading}
                style={{ ...STYLE.btn("primary"), opacity: rgpdLoading ? 0.6 : 1 }}
              >
                {rgpdLoading ? "Préparation..." : "Télécharger mes données"}
              </button>

              <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", marginTop: "24px" }}>
                📋 Historique des exports
              </h3>
              <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>
                Consultez la liste de tous vos exports de données et les dates de téléchargement.
              </p>
              <button
                onClick={loadRgpdStatus}
                disabled={rgpdLoading}
                style={{ ...STYLE.btn("secondary"), opacity: rgpdLoading ? 0.6 : 1 }}
              >
                {rgpdLoading ? "Chargement..." : "Afficher l'historique"}
              </button>

              {rgpdStatus && rgpdStatus.exports && rgpdStatus.exports.length > 0 && (
                <div style={{ marginTop: "16px", padding: "12px", background: "#f9f9f9", border: "1px solid #eee" }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
                    {rgpdStatus.exports.length} export(s) trouvé(s) :
                  </p>
                  <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ textAlign: "left", padding: "6px", fontWeight: "700" }}>Date</th>
                        <th style={{ textAlign: "left", padding: "6px", fontWeight: "700" }}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rgpdStatus.exports.map((exp, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "6px" }}>
                            {new Date(exp.created_at).toLocaleDateString("fr-FR", { 
                              year: "numeric", month: "long", day: "numeric", 
                              hour: "2-digit", minute: "2-digit" 
                            })}
                          </td>
                          <td style={{ padding: "6px", color: exp.status === "completed" ? "#006600" : "#cc6600" }}>
                            {exp.status === "completed" ? "✓ Complété" : "⏳ En attente"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SUPPRIMER MON COMPTE */}
            <div style={STYLE.card}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>
                ⚠️ Zone de danger
              </h2>
              <p style={{ fontSize: "13px", color: "#555", marginBottom: "16px", marginTop: "12px" }}>
                La suppression de votre compte est définitive et irréversible. Toutes vos données seront supprimées des serveurs.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={STYLE.btn("danger")}
                >
                  Supprimer mon compte
                </button>
              ) : (
                <div style={{ background: "#fff0f0", border: "1px solid #cc0000", padding: "16px" }}>
                  <p style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#cc0000" }}>
                    ⚠️ Êtes-vous vraiment sûr(e) ?
                  </p>
                  <p style={{ fontSize: "13px", color: "#555", marginBottom: "16px" }}>
                    Cette action est définitive. Votre compte et toutes vos données seront supprimés.
                  </p>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={handleRgpdDelete}
                      disabled={rgpdLoading}
                      style={{ ...STYLE.btn("danger"), opacity: rgpdLoading ? 0.6 : 1 }}
                    >
                      {rgpdLoading ? "Suppression..." : "Oui, supprimer mon compte"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={rgpdLoading}
                      style={{ ...STYLE.btn("secondary"), opacity: rgpdLoading ? 0.6 : 1 }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* POLITIQUE DE CONFIDENTIALITÉ LINK */}
            <div style={STYLE.card}>
              <p style={{ fontSize: "13px", color: "#555" }}>
                Pour plus d'informations, consultez notre{" "}
                <Link to="/politique-confidentialite" style={{ color: "#000", fontWeight: "700", textDecoration: "underline" }}>
                  politique de confidentialité
                </Link>
                {" "}ou contactez notre responsable de la protection des données (DPO) à{" "}
                <strong>dpo@stockpredi.fr</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
