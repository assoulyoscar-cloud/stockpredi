import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { captureEmail } from '../api/supabaseClient';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const result = await captureEmail(email, 'landing');
    if (result.success) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    } else {
      setSubmitError('Erreur : ' + result.error);
    }
  };

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
          <a href="#contact" style={{ textDecoration: 'underline', color: '#000000', cursor: 'pointer', fontSize: '14px' }}>
            Essai gratuit
          </a>
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
          <a href="#contact" style={{
            background: '#000000',
            color: '#FFFFFF',
            padding: '14px 28px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '14px',
            display: 'inline-block'
          }}>
            ESSAI GRATUIT 14 JOURS
          </a>
          <span style={{ fontSize: '14px', color: '#666666', lineHeight: '1', alignSelf: 'center' }}>
            Sans carte bancaire
          </span>
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

      {/* RESULTATS */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Resultats clients</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            ['-32%', 'de ruptures de stock'],
            ['-28%', 'de surplus inutiles'],
            ['4h', 'economisees par semaine'],
          ].map(([stat, label]) => (
            <div key={stat} style={{ border: '1px solid #000000', padding: '24px', flex: '1', minWidth: '140px' }}>
              <p style={{ fontSize: '36px', fontWeight: '700', margin: '0 0 4px 0' }}>{stat}</p>
              <p style={{ fontSize: '13px', color: '#333333', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEPARATEUR */}
      <div style={{ borderTop: '1px solid #000000', maxWidth: '680px', margin: '0 auto' }} />

      {/* TEMOIGNAGES */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Ce qu'ils disent</h2>
        <p style={{ fontSize: '14px', color: '#666666', marginBottom: '32px' }}>Bêta-testeurs ayant eu accès anticipé</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ border: '1px solid #000000', padding: '24px' }}>
            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '16px', fontStyle: 'italic' }}>
              "On commandait à l'instinct depuis 10 ans. StockPredi nous a montré qu'on sur-stockait de 30% sur 3 références. Résultat : 4 000€ récupérés en 2 mois."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', border: '1px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>ML</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>Marie L.</p>
                <p style={{ fontSize: '12px', color: '#666666', margin: 0 }}>Gérante, boutique mode en ligne — 12 employés</p>
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #000000', padding: '24px' }}>
            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '16px', fontStyle: 'italic' }}>
              "J'ai uploadé 2 ans d'historique Excel. En 3 minutes j'avais mes prévisions pour Noël. C'est exactement ce dont j'avais besoin."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', border: '1px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>TR</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>Thomas R.</p>
                <p style={{ fontSize: '12px', color: '#666666', margin: 0 }}>Directeur logistique, distributeur alimentaire — 8 employés</p>
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #000000', padding: '24px' }}>
            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '16px', fontStyle: 'italic' }}>
              "Simple, rapide, et ça marche. On a réduit nos ruptures de 40% sur le premier mois. Aucun abonnement SaaS ne nous a autant rapporté aussi vite."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', border: '1px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>SB</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>Sophie B.</p>
                <p style={{ fontSize: '12px', color: '#666666', margin: 0 }}>Co-fondatrice, e-commerce cosmétiques — 6 employés</p>
              </div>
            </div>
          </div>

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
            ['0 CARTE', 'Trial sans CB'],
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
            Essai gratuit 14 jours - Sans engagement - Annulation a tout moment
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
          <a href="#contact" style={{
            background: '#000000',
            color: '#FFFFFF',
            padding: '14px 28px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '14px',
            display: 'inline-block'
          }}>
            COMMENCER L ESSAI GRATUIT
          </a>
        </div>
      </section>

      {/* SEPARATEUR */}
      <div style={{ borderTop: '1px solid #000000', maxWidth: '680px', margin: '0 auto' }} />

      {/* CONTACT */}
      <section id="contact" style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Demarrer l essai gratuit</h2>
        <p style={{ fontSize: '16px', color: '#333333', marginBottom: '32px' }}>
          14 jours gratuits, sans carte bancaire. On vous envoie les acces par email.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.fr"
            style={{
              flex: '1',
              minWidth: '200px',
              border: '2px solid #000000',
              borderRight: 'none',
              padding: '14px 16px',
              fontSize: '14px',
              fontFamily: 'Courier New, monospace',
              outline: 'none',
            }}
          />
          <button type="submit" style={{
            background: '#000000',
            color: '#FFFFFF',
            border: '2px solid #000000',
            padding: '14px 24px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace',
            whiteSpace: 'nowrap',
          }}>
            ESSAI GRATUIT
          </button>
        </form>
        {submitted && (
          <p style={{ fontSize: '14px', color: '#333333', marginTop: '16px' }}>
            ✓ Vous allez recevoir un email avec vos accès sous 5 minutes.
          </p>
        )}
        {submitError && (
          <p style={{ fontSize: '14px', color: '#cc0000', marginTop: '16px' }}>
            {submitError}
          </p>
        )}
        <p style={{ fontSize: '13px', color: '#666666', marginTop: '16px' }}>
          Ou ecrivez-nous directement :{' '}
          <a href="mailto:contact@stockpredi.fr" style={{ color: '#000000' }}>contact@stockpredi.fr</a>
        </p>
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
