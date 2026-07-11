# Politique de securite — StockPredi Frontend

## Regles

- Seule la cle Supabase ANON (publique) est utilisee cote frontend. Jamais de cle service ni de cle secrete Stripe.
- Les variables d'environnement sont configurees sur Vercel (voir .env.example) et integrees au build : redeployer apres toute modification.
- CSP stricte definie dans vercel.json : connect-src limite a Supabase, Stripe et au backend Render.

## Vulnerabilites npm

Les alertes npm audit restantes proviennent de la chaine de build react-scripts (nth-check, postcss, svgo, webpack-dev-server...). Elles concernent uniquement les outils de developpement et n'affectent pas le bundle servi en production. Ne pas lancer npm audit fix --force (casse react-scripts).

## Signalement

Vulnerabilite a signaler a : contact@stockpredi.fr
