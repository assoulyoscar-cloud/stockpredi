import React from 'react';
import { Link } from 'react-router-dom';

export default function ConditionsUtilisation() {
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
          Conditions générales d'utilisation
        </h1>

        <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000' }}>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            1. Objet du service
          </h2>
          <p>
            StockPredi est un service SaaS de prévisions de stock basé sur l'IA.<br />
            <br />
            <strong>Abonnement :</strong> €35/mois<br />
            <strong>Essai gratuit :</strong> 14 jours (sans carte bancaire)<br />
            <strong>Renouvellement :</strong> Automatique après expiration trial
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            2. Responsabilités de l'utilisateur
          </h2>
          <p>
            Vous êtes responsable de :
          </p>
          <ul style={{ marginLeft: '24px' }}>
            <li>La sécurité de votre mot de passe</li>
            <li>L'exactitude des données uploadées (CSV, Excel)</li>
            <li>L'utilisation légale du service</li>
            <li>Le respect des lois applicables (RGPD, droit du travail français)</li>
          </ul>
          <p>
            <strong>Interdictions :</strong><br />
            — Données de mineurs (mineurs &lt; 18 ans)<br />
            — Données sensibles non anonymisées (santé, biométrie, politique)<br />
            — Utilisation à des fins discriminatoires
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            3. Responsabilités de StockPredi
          </h2>
          <p>
            StockPredi garantit :
          </p>
          <ul style={{ marginLeft: '24px' }}>
            <li>Disponibilité 99.5% (best effort, sauf maintenance)</li>
            <li>Respect RGPD et data EU residency</li>
            <li>Support client &lt;4h (jours ouvrables)</li>
            <li>Confidentialité des données</li>
          </ul>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            4. Limitation de responsabilité
          </h2>
          <p>
            StockPredi ne peut être tenu responsable de :
          </p>
          <ul style={{ marginLeft: '24px' }}>
            <li>Prévisions incorrectes (usage informatif uniquement)</li>
            <li>Perte de revenus ou opportunités manquées</li>
            <li>Interruptions de service non imputables à StockPredi</li>
            <li>Dommages indirects ou consécutifs</li>
          </ul>
          <p>
            <strong>Plafond :</strong> Remboursement maximal = 1 mois d'abonnement
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            5. Résiliation et remboursement
          </h2>
          <p>
            — <strong>Trial gratuit :</strong> Aucun engagement. Annulation à tout moment.<br />
            — <strong>Abonnement payant :</strong> Résiliation à tout moment (remboursement prorata).<br />
            — <strong>Après résiliation :</strong> Accès coupé immédiatement. Données supprimées sous 30 jours.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            6. Modifications des CGU
          </h2>
          <p>
            StockPredi peut modifier ces conditions à tout moment. Les modifications entrent en vigueur 30 jours après notification (email).
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            7. Droit applicable
          </h2>
          <p>
            Ces CGU sont régies par le droit français. En cas de litige, compétence exclusive aux tribunaux français.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            8. Contact
          </h2>
          <p>
            Pour toute question ou réclamation :<br />
            <strong>contact@stockpredi.fr</strong>
          </p>

          <p style={{ marginTop: '48px', fontSize: '14px', color: '#333333' }}>
            Dernière mise à jour : juin 2026
          </p>

        </div>

      </div>
    </div>
  );
}
