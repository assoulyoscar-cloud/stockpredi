# StockPredi — Guide de déploiement

## Architecture

```
Frontend (React)  →  Vercel        →  https://stockpredi.vercel.app
Backend (Flask)   →  Render        →  https://stockpredi-backend.onrender.com
Base de données   →  Supabase      →  https://xbachldmxbjqktyqxzum.supabase.co
Paiements         →  Stripe        →  stripe.com
Emails transac.   →  Resend        →  resend.com
```

---

## 1. Variables d'environnement

### Frontend (Vercel → Settings → Environment Variables)
| Variable | Valeur |
|---|---|
| `REACT_APP_SUPABASE_URL` | `https://xbachldmxbjqktyqxzum.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | `sb_publishable_3P7WQj8rEZH5i96VV3_ucQ_zdSUc0xh` |
| `REACT_APP_BACKEND_URL` | `https://stockpredi-backend.onrender.com` |

### Backend (Render → Environment)
| Variable | Où trouver |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys |
| `STRIPE_PRICE_ID` | Stripe → Products → ton produit → Price ID |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → Signing secret |
| `FRONTEND_URL` | `https://stockpredi.vercel.app` |
| `FLASK_ENV` | `production` |

---

## 2. Déploiement backend sur Render

1. Pousse le code sur GitHub : `git push origin main`
2. Va sur [render.com](https://render.com) → New → Web Service
3. Connecte ton repo GitHub (`stockpredi`)
4. Render détecte automatiquement `render.yaml`
5. Configure les variables d'environnement (tableau ci-dessus)
6. Clique **Deploy** → attends ~3 min

**Commande de démarrage** (déjà dans Procfile) :
```
gunicorn app_backend:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

---

## 3. Configuration Stripe

### Créer le produit
1. Stripe → Products → + Add product
2. Nom : `StockPredi Premium`
3. Prix : `35,00 €` / mois / récurrent
4. Copier le `Price ID` (commence par `price_`)

### Configurer le webhook
1. Stripe → Developers → Webhooks → + Add endpoint
2. URL : `https://stockpredi-backend.onrender.com/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copier le **Signing secret** → ajouter comme `STRIPE_WEBHOOK_SECRET` sur Render

---

## 4. Migration Supabase (Stripe)

Exécuter dans **Supabase → SQL Editor** :

```sql
-- Fichier : supabase_stripe_migration.sql
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer
  ON public.users (stripe_customer_id);
```

---

## 5. Configuration domaine (stockpredi.fr)

### DNS sur Gandi.net
| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `76.76.19.165` |
| CNAME | `www` | `cname.vercel-dns.com` |

### Vercel
- Vercel → Project → Settings → Domains → ajouter `stockpredi.fr`
- Vercel vérifie automatiquement une fois le DNS propagé (~24h)

### Render (domaine custom)
- Render → Service → Settings → Custom Domain → ajouter `api.stockpredi.fr`
- Ajouter le CNAME chez Gandi :
  - Type : `CNAME`, Nom : `api`, Valeur : fournie par Render

---

## 6. Email contact@stockpredi.fr

### Option A — Resend (recommandé)
1. Resend → Domains → Add domain → `stockpredi.fr`
2. Ajouter les DNS records fournis par Resend chez Gandi
3. Une fois vérifié : créer `contact@stockpredi.fr` avec forwarding vers `assouly.oscar@gmail.com`
4. Mettre à jour `SMTP_FROM` dans Supabase Auth → SMTP Settings : `contact@stockpredi.fr`

### Option B — Gandi Mail
- Gandi → Emails → créer forwarding `contact@` → `assouly.oscar@gmail.com`

---

## 7. Routes backend

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Inscription |
| POST | `/api/auth/login` | — | Connexion |
| POST | `/api/auth/logout` | — | Déconnexion |
| POST | `/api/auth/refresh` | — | Refresh token |
| GET | `/api/predictions/forecast` | JWT | Prévision CSV |
| POST | `/api/predictions/recommendations` | JWT | Recommandations IA |
| GET | `/api/user/profile` | JWT | Profil utilisateur |
| PATCH | `/api/user/profile` | JWT | Modifier profil |
| GET | `/api/user/predictions` | JWT | Historique prévisions |
| POST | `/api/stripe/create-subscription` | JWT | Créer abonnement |
| POST | `/api/stripe/cancel-subscription` | JWT | Annuler abonnement |
| GET | `/api/stripe/status` | JWT | Statut abonnement |
| POST | `/api/stripe/webhook` | Stripe sig | Webhook paiement |
| GET | `/health` | — | Healthcheck |

---

## 8. Push initial

```bash
cd stockpredi
git add .
git commit -m "feat: backend complet (auth + predictions + stripe + deploy config)"
git push origin main
```
