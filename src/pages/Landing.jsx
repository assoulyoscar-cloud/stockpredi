import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ fontFamily: 'Courier New, monospace', color: '#000000', backgroundColor: '#FFFFFF' }}>

      {/* NAVBAR */}
      <nav style={{
        borderBottom: '1px solid #000000',
        padding: '16px 32px',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        zIndex: 100
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/logoSTOCKPREDI.png" alt="StockPredi" style={{ height: '32px', width: 'auto' }} />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#000000' }}>STOCKPREDI</span>
          </Link>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#000000', fontSize: '14px', fontWeight: '700' }}>
              Connexion
            </Link>
            <Link to="/signup" style={{
              background: '#000000',
              color: '#FFFFFF',
              padding: '8px 16px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 32px 64px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', marginBottom: '24px' }}>
          PREVISIONS DE STOCK IA - PME FRANCAISES
        </p>
        <h1 style={{ fontSize: '48px', fontWeight: '700', lineHeight: '1.1', marginBottom: '24px' }}>
          Zero rupture.<br />Zero surplus.
        </h1>
        <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '40px', color: '#333333' }}>
          StockPredi analyse votre historique de ventes et predit exactement quoi commander, quand, et en quelle quantite. En 2 minutes.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{
            background: '#000000',
            color: '#FFFFFF',
            padding: '14px 28px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '14px',
            display: 'inline-block'
          }}>
            COMMENCER
          </Link>
          <Link to="/login" style={{
            background: '#FFFFFF',
            color: '#000000',
            border: '2px solid #000000',
            padding: '14px 28px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '14px',
            display: 'inline-block'
          }}>
            SE CONNECTER
          </Link>
        </div>
      </section>

      {/* SEPARATEUR */}
      <div style={{ borderTop: '1px solid #000000', maxWidth: '680px', margin: '0 auto' }} />

      {/* PROBLEME */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Le probleme</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            ['Ruptures de stock', 'Des ventes perdues a cause d un reapprovisionnement trop tardif.'],
            ['Surplus inutiles', 'Du capital immobilise en marchandises qui ne bougent pas.'],
            ['Gestion manuelle', 'Des heures passees sur Excel a faire des estimations a l instinct.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ border: '1px solid #000000', padding: '24px', display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>X</span>
              <div>
                <p style={{ fontWeight: '700', marginBottom: '4px' }}>{title}</p>
                <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEPARATEUR */}
      <div style={{ borderTop: '1px solid #000000', maxWidth: '680px', margin: '0 auto' }} />

      {/* COMMENT CA MARCHE */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Comment ca marche</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            ['01', 'Importez vos donnees', 'Glissez votre fichier CSV ou Excel (historique de ventes, stocks). Aucune integration requise.'],
            ['02', 'L IA analyse', 'Notre modele detecte saisonnalite, tendances et anomalies sur vos donnees.'],
            ['03', 'Recevez vos previsions', 'Un rapport clair : quoi commander, quand, combien. Exportable en 1 clic.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ border: '1px solid #000000', padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '32px', fontWeight: '700', color: '#CCCCCC', flexShrink: 0, lineHeight: 1 }}>{num}</span>
              <div>
                <p style={{ fontWeight: '700', marginBottom: '8px' }}>{title}</p>
                <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEPARATEUR */}
      <div style={{ borderTop: '1px solid #000000', maxWidth: '680px', margin: '0 auto' }} />

      {/* BADGES CONFIANCE */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {[
            ['RGPD', 'Conforme'],
            ['DATA EU', 'Hébergé en Europe'],
            ['SECURITE', 'Données chiffrées'],
            ['<4H', 'Support garanti'],
          ].map(([title, sub]) => (
            <div key={title} style={{ border: '1px solid #000000', padding: '16px 20px', textAlign: 'center', flex: '1', minWidth: '120px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' }}>{title}</p>
              <p style={{ fontSize: '11px', color: '#666666', margin: 0 }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEPARATEUR */}
      <div style={{ borderTop: '1px solid #000000', maxWidth: '680px', margin: '0 auto' }} />

      {/* TARIF */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Tarif</h2>
        <div style={{ border: '2px solid #000000', padding: '32px' }}>
          <p style={{ fontSize: '48px', fontWeight: '700', margin: '0 0 4px 0' }}>
            35 EUR<span style={{ fontSize: '18px', fontWeight: '400', color: '#333333' }}>/mois</span>
          </p>
          <p style={{ fontSize: '14px', color: '#333333', marginBottom: '24px' }}>
            Sans engagement — Annulation a tout moment
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {[
              'Previsions IA illimitees',
              'Import CSV / Excel',
              'Export rapport PDF',
              'Support email moins de 4h',
              'Donnees hebergees en UE (RGPD)',
              "Jusqu a 10 000 references produits",
            ].map((item) => (
              <div key={item} style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                <span>V</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Link to="/signup" style={{
            background: '#000000',
            color: '#FFFFFF',
            padding: '14px 28px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '14px',
            display: 'inline-block'
          }}>
            CREER MON COMPTE
          </Link>
        </div>
      </section>

      {/* SEPARATEUR */}
      <div style={{ borderTop: '1px solid #000000', maxWidth: '680px', margin: '0 auto' }} />

      {/* ENCADRE CONNEXION / COMPTE */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Acces a la plateforme</h2>
        <p style={{ fontSize: '15px', color: '#333333', marginBottom: '32px' }}>
          Deja client ou pret a demarrer ? Accedez directement a votre espace.
        </p>
        <div style={{ border: '2px solid #000000', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to="/login" style={{
            background: '#FFFFFF',
            color: '#000000',
            border: '2px solid #000000',
            padding: '16px 28px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '15px',
            display: 'block',
            textAlign: 'center'
          }}>
            SE CONNECTER
          </Link>
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#666666' }}>ou</div>
          <Link to="/signup" style={{
            background: '#000000',
            color: '#FFFFFF',
            padding: '16px 28px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '15px',
            display: 'block',
            textAlign: 'center'
          }}>
            CREER UN COMPTE
          </Link>
          <p style={{ fontSize: '12px', color: '#666666', margin: 0, textAlign: 'center' }}>
            Une question ? <a href="mailto:contact@stockpredi.fr" style={{ color: '#000000' }}>contact@stockpredi.fr</a>
          </p>
        </div>
      </section>

      {/* SEPARATEUR */}
      <div style={{ borderTop: '1px solid #000000' }} />

      {/* FOOTER */}
      <footer style={{ maxWidth: '680px', margin: '0 auto', padding: '32px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700' }}>STOCKPREDI 2026</span>
        <div style={{ display: 'flex', gap: '24px', fontSize: '13px', flexWrap: 'wrap' }}>
          <Link to="/mentions-legales" style={{ color: '#000000', textDecoration: 'underline' }}>Mentions legales</Link>
          <Link to="/politique-confidentialite" style={{ color: '#000000', textDecoration: 'underline' }}>Confidentialite</Link>
          <Link to="/conditions-utilisation" style={{ color: '#000000', textDecoration: 'underline' }}>CGU</Link>
          <Link to="/contact" style={{ color: '#000000', textDecoration: 'underline' }}>Contact</Link>
        </div>
      </footer>

    </div>
  );
}
