import React, { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ fontFamily: 'Courier New, monospace', color: '#000000', backgroundColor: '#FFFFFF', lineHeight: '1.6' }}>
      
      {/* NAVBAR */}
      <nav style={{ borderBottom: '1px solid #000000', padding: '16px 32px', position: 'sticky', top: 0, backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>STOCKPREDI</div>
          <a href="#contact" style={{ textDecoration: 'underline', color: '#000000', cursor: 'pointer', fontSize: '14px' }}>Essai gratuit</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '64px 32px', borderBottom: '1px solid #000000', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', lineHeight: '1.2' }}>
            Prévisions de stock qui fonctionnent. Vraiment.
          </h1>
          <p style={{ fontSize: '16px', marginBottom: '32px', color: '#333333' }}>
            Arrêtez de perdre du temps et de l'argent. StockPredi prédit votre stock avec l'IA en moins de 5 minutes.
          </p>
          <button onClick={() => document.getElementById('contact').scrollIntoView()} style={{
            background: '#000000', color: '#FFFFFF', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Courier New'
          }}>
            DÉMARRER (14 jours gratuit)
          </button>
          <p style={{ fontSize: '12px', color: '#666666', marginTop: '12px' }}>Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: '64px 32px', borderBottom: '1px solid #000000' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Votre problème</h2>
          
          <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #000000' }}>
            <p style={{ fontWeight: '700', marginBottom: '8px' }}>30-50% d'erreur dans vos prévisions</p>
            <p style={{ fontSize: '14px', color: '#333333' }}>Excel, tableurs manuels, aucune automatisation = mauvaises décisions.</p>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #000000' }}>
            <p style={{ fontWeight: '700', marginBottom: '8px' }}>Stockouts et overstock coûteux</p>
            <p style={{ fontSize: '14px', color: '#333333' }}>Vous perdez €10K-60K/an en ruptures ou surplus de stock.</p>
          </div>

          <div style={{ padding: '16px', border: '1px solid #000000' }}>
            <p style={{ fontWeight: '700', marginBottom: '8px' }}>Outils complexes et chers</p>
            <p style={{ fontSize: '14px', color: '#333333' }}>Les solutions "enterprise" coûtent €1000+/mois et demandent 3 mois de setup.</p>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ padding: '64px 32px', borderBottom: '1px solid #000000' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Comment ça marche</h2>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', minWidth: '32px' }}>1</div>
            <div>
              <p style={{ fontWeight: '700', marginBottom: '8px' }}>Uploadez votre CSV</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>Shopify, WooCommerce, Excel, n'importe quel format. Aucun template.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', minWidth: '32px' }}>2</div>
            <div>
              <p style={{ fontWeight: '700', marginBottom: '8px' }}>L'IA analyse automatiquement</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>Détecte vos colonnes (Date, Produit, Quantité) sans config manuelle.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', minWidth: '32px' }}>3</div>
            <div>
              <p style={{ fontWeight: '700', marginBottom: '8px' }}>Obtenez vos recommandations</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>"Commandez 140 units semaine 4 pour 95% de confiance"</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '64px 32px', borderBottom: '1px solid #000000' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Fonctionnalités</h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #000000' }}>
              <p style={{ fontWeight: '700' }}>✓ Prévisions illimitées</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>3, 6, 12 mois. Produits illimités.</p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #000000' }}>
              <p style={{ fontWeight: '700' }}>✓ Intégrations Shopify + WooCommerce</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>Connectez directement ou uploadez CSV.</p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #000000' }}>
              <p style={{ fontWeight: '700' }}>✓ Support français &lt;4h</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>Email, ChatBot, équipe réactive.</p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #000000' }}>
              <p style={{ fontWeight: '700' }}>✓ RGPD 100% conforme</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>Données EU. Aucun partage tiers.</p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #000000' }}>
              <p style={{ fontWeight: '700' }}>✓ Alertes en temps réel</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>Notifiés si stock critique.</p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #000000' }}>
              <p style={{ fontWeight: '700' }}>✓ API (futur)</p>
              <p style={{ fontSize: '14px', color: '#333333' }}>Connectez votre système ERP.</p>
            </div>
          </div>
        </div>
      </section>
{/* PRICING */}
      <section style={{ padding: '64px 32px', borderBottom: '1px solid #000000' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Tarification simple</h2>
          
          <div style={{ padding: '32px', border: '2px solid #000000' }}>
            <p style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>€35/mois</p>
            <p style={{ fontSize: '14px', color: '#333333', marginBottom: '24px' }}>Tout inclus. Zéro surprise.</p>
            
            <ul style={{ marginBottom: '24px', paddingLeft: '0' }}>
              <li style={{ marginBottom: '8px', fontSize: '14px' }}>✓ Produits illimités</li>
              <li style={{ marginBottom: '8px', fontSize: '14px' }}>✓ Prévisions illimitées (3/6/12 mois)</li>
              <li style={{ marginBottom: '8px', fontSize: '14px' }}>✓ Shopify + WooCommerce</li>
              <li style={{ marginBottom: '8px', fontSize: '14px' }}>✓ Support français</li>
              <li style={{ marginBottom: '8px', fontSize: '14px' }}>✓ RGPD conforme</li>
              <li style={{ fontSize: '14px' }}>✓ 14 jours gratuit (no card)</li>
            </ul>

            <button onClick={() => document.getElementById('contact').scrollIntoView()} style={{
              background: '#000000', color: '#FFFFFF', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%', fontFamily: 'Courier New'
            }}>
              ESSAYER GRATUITEMENT
            </button>

            <p style={{ fontSize: '12px', color: '#666666', marginTop: '12px', textAlign: 'center' }}>Annulation à tout moment</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '64px 32px', borderBottom: '1px solid #000000' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Questions fréquentes</h2>
          
          <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #000000' }}>
            <p style={{ fontWeight: '700', marginBottom: '8px' }}>Aucun engagement ?</p>
            <p style={{ fontSize: '14px', color: '#333333' }}>14 jours gratuit, aucune carte bancaire, annulation 1 clic.</p>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #000000' }}>
            <p style={{ fontWeight: '700', marginBottom: '8px' }}>Où sont mes données ?</p>
            <p style={{ fontSize: '14px', color: '#333333' }}>Union européenne (RGPD). Aucun partage tiers.</p>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #000000' }}>
            <p style={{ fontWeight: '700', marginBottom: '8px' }}>Combien de produits ?</p>
            <p style={{ fontSize: '14px', color: '#333333' }}>Illimité. 1 produit ou 10K, c'est la même prix.</p>
          </div>

          <div style={{ padding: '16px', border: '1px solid #000000' }}>
            <p style={{ fontWeight: '700', marginBottom: '8px' }}>Support ?</p>
            <p style={{ fontSize: '14px', color: '#333333' }}>Email français répondu &lt;4h.</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contact" style={{ padding: '64px 32px', borderBottom: '1px solid #000000', backgroundColor: '#000000', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Prêt ?</h2>
          
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #FFFFFF',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontSize: '14px',
                fontFamily: 'Courier New',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            <button type="submit" style={{
              background: '#FFFFFF', color: '#000000', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%', fontFamily: 'Courier New'
            }}>
              DÉMARRER L'ESSAI GRATUIT
            </button>
          </form>

          {submitted && (
            <p style={{ fontSize: '14px', color: '#CCCCCC', textAlign: 'center' }}>✓ Email reçu ! Vérifiez votre inbox.</p>
          )}

          <p style={{ fontSize: '12px', color: '#999999', textAlign: 'center' }}>14 jours gratuit. Aucune carte bancaire. Annulation facile.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px', borderTop: '1px solid #000000', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', marginBottom: '16px' }}>© 2026 StockPredi. Tous droits réservés.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
            <a href="/mentions-legales" style={{ color: '#000000', textDecoration: 'underline' }}>Mentions légales</a>
            <a href="/politique-confidentialite" style={{ color: '#000000', textDecoration: 'underline' }}>Confidentialité</a>
            <a href="/conditions-utilisation" style={{ color: '#000000', textDecoration: 'underline' }}>CGU</a>
            <a href="/contact" style={{ color: '#000000', textDecoration: 'underline' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}