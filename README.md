# StockPredi — Landing Page

Prévisions de stock IA pour PME françaises.

## Structure du projet

```
stockpredi/
├── public/
│   └── index.html              (HTML entry point)
├── src/
│   ├── pages/
│   │   ├── Landing.jsx         (Page d'accueil)
│   │   ├── MentionsLegales.jsx (Mentions légales)
│   │   ├── PolitiqueConfidentialite.jsx
│   │   ├── ConditionsUtilisation.jsx
│   │   └── Contact.jsx         (Contact + support)
│   ├── App.jsx                 (React Router setup)
│   └── index.js                (Entry point React)
├── package.json
├── vercel.json
└── README.md
```

## Installation locale (optionnel pour tester)

```bash
npm install
npm start
```

Ouvre [http://localhost:3000](http://localhost:3000)

## Déploiement sur Vercel

### Étape 1 : Créer repo GitHub

```bash
# Sur ta machine locale
git init
git add .
git commit -m "Initial commit: StockPredi landing + pages légales"
git branch -M main
git remote add origin https://github.com/[TON_USERNAME]/stockpredi.git
git push -u origin main
```

### Étape 2 : Connecter Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Log in (ou crée un compte avec GitHub)
3. Clique "Add New..." → "Project"
4. Sélectionne le repo `stockpredi`
5. Framework : "Create React App"
6. Clique "Deploy"

Vercel va builder et deployer en ~2 min.

**URL temporaire :** `stockpredi.vercel.app`

### Étape 3 : Connecter domaine stockpredi.fr (après achat 25 juillet)

1. Sur Vercel → Project Settings → Domains
2. Ajoute `stockpredi.fr`
3. Vercel te donne les nameservers
4. Sur Gandi → Domain Settings → Nameservers
5. Copie les nameservers Vercel
6. Attends 24–48h pour propagation

Boom ! `stockpredi.fr` pointe sur ton landing.

---

## Notes importantes

- **Pages légales :** À jour avec tes infos (adresse, email, SIRET placeholder)
- **SIRET :** À compléter le 25 juillet après création micro-entreprise
- **Routes React Router :**
  - `/` → Landing
  - `/mentions-legales` → Mentions
  - `/politique-confidentialite` → Politique
  - `/conditions-utilisation` → CGU
  - `/contact` → Contact + formulaire

---

## Prochaines étapes

1. ✅ Créer repo GitHub
2. ✅ Deploy sur Vercel
3. Acheter domaine `stockpredi.fr` (25 juillet)
4. Connecter domaine à Vercel
5. Backend : Prophet + Llama (semaine prochaine)

---

**Questions ? contact@stockpredi.fr**
