import React from 'react';
import { Link } from 'react-router-dom';

export default function MentionsLegales() {
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
          Mentions légales
        </h1>

        <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000' }}>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            Éditeur du site
          </h2>
          <p>
            <strong>Raison sociale :</strong> StockPredi (Micro-entreprise)<br />
            <strong>Gérant :</strong> Oscar Assouly<br />
            <strong>Adresse :</strong> 94 rue de l'Ourcq, 75019 Paris, France<br />
            <strong>SIRET :</strong> [À compléter après création micro-entreprise]<br />
            <strong>Email :</strong> assouly.oscar@gmail.com
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            Hébergement
          </h2>
          <p>
            <strong>Serveur web :</strong> Render.com<br />
            <strong>Base de données :</strong> Supabase (EU residency)<br />
            <strong>Localisation data :</strong> Union européenne
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            Propriété intellectuelle
          </h2>
          <p>
            Tous les contenus du site (textes, images, logos, code) sont la propriété exclusive de StockPredi (Oscar Assouly).<br />
            <br />
            Reproduction, modification ou utilisation sans autorisation écrite est interdite.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            Limitation de responsabilité
          </h2>
          <p>
            StockPredi ne peut être tenu responsable de :<br />
            — Interruptions de service<br />
            — Erreurs dans les prévisions (usage informatif)<br />
            — Dommages indirects liés à l'utilisation du service
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            Cookies
          </h2>
          <p>
            Ce site n'utilise que les cookies essentiels (session, préférences utilisateur). Voir Politique de confidentialité.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            Modifications
          </h2>
          <p>
            StockPredi se réserve le droit de modifier ces mentions légales à tout moment. Les modifications entrent en vigueur immédiatement.
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>
            Droit applicable
          </h2>
          <p>
            Ces mentions légales sont régies par le droit français. En cas de litige, compétence aux tribunaux français.
          </p>

          <p style={{ marginTop: '48px', fontSize: '14px', color: '#333333' }}>
            Dernière mise à jour : juin 2026
          </p>

        </div>

      </div>
    </div>
  );
}
