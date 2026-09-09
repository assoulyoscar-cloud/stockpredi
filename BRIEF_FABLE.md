# Brief StockPredi — Résolution "Failed to fetch"

## Architecture
- **Frontend React** : `stockpredi.vercel.app` — repo `assoulyoscar-cloud/stockpredi` (local : `C:\Users\Oscar\stockpredi`)
- **Backend Flask** : `stockpredi-backend.onrender.com` — repo `assoulyoscar-cloud/stockpredi-backend` (repo SÉPARÉ, pas en local)
- **Supabase** : auth + DB
- **Stripe** : paiements test mode

---

## Problème principal : "❌ Prévision impossible — Failed to fetch"

Le backend est **vivant** (`{"status":"ok"}` confirmé sur `/health`). Le CSV s'importe bien. Mais clic sur "Lancer la prévision IA" → `Failed to fetch`.

### Diagnostic à faire en premier (F12 → Network)
Ouvrir DevTools sur `stockpredi.vercel.app/dashboard`, onglet Network, cliquer "Lancer la prévision IA", trouver la requête rouge et noter :
- L'URL exacte appelée
- L'erreur (`net::ERR_*`, CORS, CSP…)

### Cause probable 1 — REACT_APP_BACKEND_URL mal configurée sur Vercel
Dans `src/api/backendClient.js` ligne 3 :
```js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
```
Si la variable Vercel est vide ou manquante, le frontend appelle `localhost:5000` → fail garanti.

**Vérifier sur Vercel → Environment Variables :**
- `REACT_APP_BACKEND_URL` = `https://stockpredi-backend.onrender.com` (https, sans slash final)

Si la valeur est mauvaise : corriger + déclencher un redéploiement Vercel (CRA bake les env vars au build).

### Cause probable 2 — CSP pas encore déployée sur Vercel
Le commit `f6c641f` a ajouté `https://stockpredi-backend.onrender.com` au `connect-src` de `vercel.json`. Vérifier sur vercel.com → stockpredi → Deployments que le dernier build est "Ready" et récent.

### Cause probable 3 — FRONTEND_URL mal configurée sur Render (CORS)
Le backend utilise `Config.FRONTEND_URL` pour CORS. Vérifier sur Render → Environment :
- `FRONTEND_URL` = `https://stockpredi.vercel.app`

---

## État actuel des deux repos

### Backend — Render tourne sur rollback `434718c`
Le rollback a été fait car trois commits successifs ont cassé le backend :
- `d224066` : duplicate `flask-cors` dans requirements.txt → pip install timeout
- `ee3a382` : SyntaxError dans app.py (`app = Flask(__name__)CORS(...)` sur une seule ligne)
- `6adcd20` : Fix syntax → gunicorn démarrait mais ne passait jamais "live" (cache Render corrompu)

**Le main branch GitHub du backend est correct** (6adcd20 + requirements.txt nettoyé). Pour redéployer proprement : Render → Manual Deploy → **"Clear build cache & deploy"**.

### Frontend — main branch GitHub est correct
- `vercel.json` : CSP avec `https://stockpredi-backend.onrender.com` (f6c641f) ✅
- `src/api/backendClient.js` : URL depuis `REACT_APP_BACKEND_URL` ✅
- `src/pages/Dashboard.jsx` : CSV validation, empty state, messages d'erreur ✅
- `src/pages/Signup.jsx` / `Login.jsx` : messages d'erreur et redirections ✅

---

## Variables d'environnement à vérifier

### Vercel
| Variable | Valeur attendue |
|---|---|
| `REACT_APP_BACKEND_URL` | `https://stockpredi-backend.onrender.com` |
| `REACT_APP_SUPABASE_URL` | (déjà set) |
| `REACT_APP_SUPABASE_ANON_KEY` | (déjà set) |

### Render
| Variable | Valeur attendue |
|---|---|
| `FRONTEND_URL` | `https://stockpredi.vercel.app` |
| `STRIPE_SECRET_KEY` | `sk_test_51TrGfe…` (déjà set) |
| `STRIPE_WEBHOOK_SECRET` | (déjà set) |
| `STRIPE_PRICE_ID` | `price_1TrGwPE7hirGgGy8Be9hBr5C` (déjà set) |
| `SUPABASE_URL` | (déjà set) |
| `SUPABASE_SERVICE_KEY` | (déjà set) |

---

## Séquence de tests après résolution du forecast

1. Upload CSV (`ds` + `y`, min 7 lignes) → "Lancer la prévision IA" → graphique de prévision affiché
2. Onglet "Mon compte" → "S'abonner 35€/mois" → Stripe Checkout → carte test `4242 4242 4242 4242` → vérifier dans Supabase table `profiles` que `plan` = `"active"`
3. Vérifier dans Stripe dashboard (test mode) que le paiement apparaît

---

## Fichiers CSV de test disponibles
Dans `C:\Users\Oscar\stockpredi\test_data\` :
- `test_tendance_hausse.csv` — 12 lignes, tendance croissante
- `test_tendance_baisse.csv` — 12 lignes, tendance décroissante
- `test_saisonnalite.csv` — 13 lignes, saisonnalité
- `test_rupture_stock.csv` — 12 lignes, stock qui s'épuise
