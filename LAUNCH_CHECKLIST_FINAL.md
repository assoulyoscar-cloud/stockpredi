# StockPredi — Final Launch Checklist (August 31, 2026)

## WORKFLOW COMPLET
- [ ] Tâche 3.1 : Clés Stripe ajoutées à Render (STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET)
- [ ] Tâche 3.2 : Webhook Stripe configuré → https://stockpredi-backend.onrender.com/api/stripe/webhook
- [ ] Tâche 3.3 : REACT_APP_STRIPE_PUBLISHABLE_KEY ajoutée à Vercel
- [ ] Tâche 3.4 : Signup → Login → Dashboard → CSV upload → Forecast → Subscribe testé end-to-end
- [ ] Tâche 3.5 : Paiement test 4242 4242 4242 4242 → plan passe à "active" dans Supabase

## SUPABASE / AUTH
- [ ] Site URL = https://stockpredi.vercel.app (Authentication → URL Configuration)
- [ ] Redirect URLs contient https://stockpredi.vercel.app/**
- [ ] Confirmation email : comportement vérifié (lien pointe vers stockpredi.vercel.app)
- [ ] RLS actif sur tables users et predictions
- [ ] Migration SQL exécutée (colonnes plan, stripe_customer_id, stripe_subscription_id)

## CODE QUALITY
- [ ] Tâche 9 : npm audit — 0 high (note : 13 high dans webpack-dev-server dev-only, non bloquant prod)
- [ ] Tâche 10 : pip audit backend → 0 vulnérabilités critiques
- [ ] Tâche 11 : Zéro console.log sensibles (mots de passe, tokens, clés API) ✓ (fait)
- [ ] Tâche 12 : Messages d'erreur standardisés (❌ format) ✓ (fait)

## POLISH FRONTEND
- [ ] Signup : redirect dashboard si session auto-confirmée ✓ (fait)
- [ ] Dashboard : empty state "📁 Aucune prévision" ✓ (fait)
- [ ] Dashboard : CSV validation (.csv only, colonnes ds+y, min 7 lignes) ✓ (fait)
- [ ] Login : messages d'erreur clairs ✓ (fait)
- [ ] Logout : fonctionne et redirige vers /

## INFRASTRUCTURE
- [ ] Vercel : domaine custom stockpredi.fr configuré (DNS Gandi)
- [ ] Render : backend actif, toutes env vars configurées
- [ ] Render : cold start < 4 min (free tier)
- [ ] Resend : emails transactionnels fonctionnels

## SÉCURITÉ
- [ ] securityheaders.com → Grade A
- [ ] RLS Supabase actif
- [ ] Aucun secret hardcodé dans le code
- [ ] Admin checks côté serveur
- [ ] HTTPS forcé partout

## LOGS PROPRES
- [ ] Vercel logs : zéro erreurs
- [ ] Render logs : zéro erreurs
- [ ] Console F12 : zéro erreurs rouges

## LÉGAL
- [ ] Micro-entreprise créée (SIRET obtenu)
- [ ] Domaine stockpredi.fr acheté
- [ ] Mentions légales à jour (nom légal, SIRET, adresse)
- [ ] CGU à jour
- [ ] Politique de confidentialité à jour (RGPD)

## SIGN-OFF FINAL
- [ ] Tous les items ci-dessus cochés
- [ ] Test utilisateur réel effectué (pas Oscar)
- [ ] Date de lancement : 31 août 2026
