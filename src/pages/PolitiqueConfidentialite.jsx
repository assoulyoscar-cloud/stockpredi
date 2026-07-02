import React from 'react';
import { Link } from 'react-router-dom';

export default function PolitiqueConfidentialite() {
  return (
    <div style={{ fontFamily: 'Courier New, monospace', color: '#000000', backgroundColor: '#FFFFFF' }}>
      
      {/* NAVBAR */}
      <nav style={{
        borderBottom: '1px solid #000000',
        padding: '12px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img src="/logoSTOCKPREDI.png" alt="StockPredi" style={{ height: '32px', width: 'auto' }} />
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#000000' }}>STOCKPREDI</span>
        </Link>
        <Link to="/" style={{ textDecoration: 'underline', color: '#000000', cursor: 'pointer', fontSize: '14px' }}>← Retour</Link>
      </nav>

      {/* CONTAINER */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px' }}>
        
        <h1 style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1.2', marginBottom: '32px' }}>
          Politique de confidentialité
        </h1>

        <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000' }}>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            1. Données collectées
          </h2>
          <p>
            StockPredi collecte les données suivantes :
          </p>
          <ul style={{ marginLeft: '24px' }}>
            <li>Email et mot de passe (création compte)</li>
            <li>Fichiers CSV/Excel uploadés (historique stock)</li>
            <li>Logs d'utilisation (accès, actions, erreurs)</li>
            <li>Adresse IP et user-agent (analytics)</li>
          </ul>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            2. Utilisation des données
          </h2>
          <p>
            Nous utilisons vos données pour :
          </p>
          <ul style={{ marginLeft: '24px' }}>
            <li>Fournir le service StockPredi (prévisions, recommandations)</li>
            <li>Améliorer l'IA (anonymisé, sans données personnelles)</li>
            <li>Support client (répondre à vos questions)</li>
            <li>Analytics (améliorer UX du produit)</li>
          </ul>
          <p>
            <strong>Nous ne revendons jamais vos données à des tiers.</strong>
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            3. Stockage et sécurité
          </h2>
          <p>
            — Data hébergée en EU (Supabase, RGPD conforme)<br />
            — Chiffrement HTTPS (transit)<br />
            — Chiffrement base de données au repos<br />
            — Accès limité aux employés StockPredi<br />
            — Audit de sécurité annuel
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            4. Vos droits RGPD
          </h2>
          <p>
            Vous avez le droit de :
          </p>
          <ul style={{ marginLeft: '24px' }}>
            <li><strong>Accès :</strong> Demander une copie de vos données</li>
            <li><strong>Correction :</strong> Modifier vos données personnelles</li>
            <li><strong>Suppression :</strong> Effacer votre compte et données</li>
            <li><strong>Portabilité :</strong> Exporter vos données en format standard</li>
            <li><strong>Opposition :</strong> Refuser certains traitements</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez : <strong>contact@stockpredi.fr</strong>
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            5. Durée de conservation
          </h2>
          <p>
            — <strong>Compte actif :</strong> Données conservées tant que vous êtes client<br />
            — <strong>Logs :</strong> Suppression après 3 mois<br />
            — <strong>Backups :</strong> Conservation 30 jours après suppression de compte<br />
            — <strong>Après résiliation :</strong> Suppression complète sur demande
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            6. Cookies
          </h2>
          <p>
            StockPredi utilise :
          </p>
          <ul style={{ marginLeft: '24px' }}>
            <li><strong>Cookie session :</strong> ID session (expire après logout)</li>
            <li><strong>Cookie préférences :</strong> Langue, thème (optionnel)</li>
          </ul>
          <p>
            Pas de cookies de suivi tiers. Vous pouvez refuser les cookies optionnels.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            7. Contact DPO
          </h2>
          <p>
            Pour toute question sur vos données ou vos droits :<br />
            <strong>contact@stockpredi.fr</strong>
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            8. Modifications
          </h2>
          <p>
            Nous modifierons cette politique si la loi l'exige. Vous serez notifié par email des changements majeurs.
          </p>

          <p style={{ marginTop: '48px', fontSize: '14px', color: '#333333' }}>
            Dernière mise à jour : juin 2026
          </p>

          <div style={{ borderTop: '1px solid #000000', marginTop: '48px', paddingTop: '24px' }}>
            <p style={{ fontSize: '14px', color: '#333333', marginBottom: '8px' }}>Pages légales</p>
            <p style={{ fontSize: '14px' }}>
              <Link to="/" style={{ textDecoration: 'underline', color: '#000000' }}>← Accueil</Link>
              {' · '}
              <Link to="/mentions-legales" style={{ textDecoration: 'underline', color: '#000000' }}>Mentions légales</Link>
              {' · '}
              <Link to="/conditions-utilisation" style={{ textDecoration: 'underline', color: '#000000' }}>CGU</Link>
              {' · '}
              <Link to="/contact" style={{ textDecoration: 'underline', color: '#000000' }}>Contact</Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
