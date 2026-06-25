import React, { useState } from 'react';

export default function StockPrediLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ fontFamily: 'Courier New, monospace', color: '#000000', backgroundColor: '#FFFFFF' }}>
      
      {/* NAVBAR */}
      <nav style={{
        borderBottom: '1px solid #000000',
        padding: '12px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>STOCKPREDI</div>
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
          <a href="#pricing" style={{ textDecoration: 'underline', color: '#000000', cursor: 'pointer' }}>Tarif</a>
          <a href="#faq" style={{ textDecoration: 'underline', color: '#000000', cursor: 'pointer' }}>FAQ</a>
          <a href="#contact" style={{ textDecoration: 'underline', color: '#000000', cursor: 'pointer' }}>Contact</a>
        </div>
      </nav>

      {/* CONTAINER */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px' }}>

        {/* ========== HERO ========== */}
        <section style={{ paddingTop: '64px', paddingBottom: '64px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1.2', marginBottom: '16px' }}>
            Prévisions de stock qui fonctionnent. Vraiment.
          </h1>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333333', marginBottom: '32px' }}>
            En 5 minutes, réduisez les ruptures de 80% et économisez plus de €5 000/an. Sans complexité. Sans consultant. Juste l'IA qui comprend votre stock.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button style={{
              background: '#000000',
              color: '#FFFFFF',
              border: '2px solid #000000',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={(e) => { e.target.style.background = '#FFFFFF'; e.target.style.color = '#000000'; }}
            onMouseLeave={(e) => { e.target.style.background = '#000000'; e.target.style.color = '#FFFFFF'; }}
            >
              ESSAI GRATUIT 14 JOURS
            </button>
            <button style={{
              background: '#FFFFFF',
              color: '#000000',
              border: '2px solid #000000',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={(e) => { e.target.style.opacity = '0.7'; }}
            onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
            >
              VOIR UNE DÉMO
            </button>
          </div>
          <div style={{ marginTop: '48px', padding: '24px', border: '1px solid #000000', backgroundColor: '#FFFFFF' }}>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#333333', margin: 0 }}>
              [Illustration du dashboard StockPredi — Prévisions claires + Recommandations]
            </p>
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: '#000000', margin: '32px 0' }} />

        {/* ========== PROBLÈME ========== */}
        <section style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3', marginBottom: '24px' }}>
            Vous perdez temps et argent chaque mois
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>30–50% d'erreur de prévision</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Stockouts : clients qui partent. Surstock : €5K+ bloqués en stock.
              </p>
            </div>
            
            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Gestion manuelle ou outils complexes</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Les PME françaises gèrent ça à la main. Ou paient €1000+/mois pour des solutions enterprise.
              </p>
            </div>
            
            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Vous n'êtes pas seul</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                500+ PME françaises cherchent une solution simple et abordable. On change ça.
              </p>
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: '#000000', margin: '32px 0' }} />

        {/* ========== SOLUTION ========== */}
        <section style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3', marginBottom: '24px' }}>
            Setup 5 minutes. Résultats immédiats.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>1️⃣ Upload vos données</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Connectez Shopify, WooCommerce, ou un fichier Excel. Notre IA détecte vos colonnes automatiquement.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>2️⃣ Notre IA prédit</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Prophet + Llama analysent 6 mois d'historique. Précision : 85% vs 35% à la main.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>3️⃣ Dashboard recommande</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Voyez : "Commandez 140 unités semaine 4" avec confiance et explications claires.
              </p>
            </div>

          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: '#000000', margin: '32px 0' }} />

        {/* ========== FEATURES ========== */}
        <section style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3', marginBottom: '24px' }}>
            Tout ce qu'il faut. Rien de plus.
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ paddingLeft: '24px', borderLeft: '2px solid #000000' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>✓ Forecast illimité</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>3 mois, 6 mois, 12 mois. Vous choisissez.</p>
            </div>

            <div style={{ paddingLeft: '24px', borderLeft: '2px solid #000000' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>✓ Shopify + WooCommerce intégrés</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>Export automatique. Zéro API key.</p>
            </div>

            <div style={{ paddingLeft: '24px', borderLeft: '2px solid #000000' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>✓ Support français rapide</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>Email répondu en &lt;4h. Pas de chat bot.</p>
            </div>

            <div style={{ paddingLeft: '24px', borderLeft: '2px solid #000000' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>✓ Vos données restent vôtres</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>Option self-host Llama = zéro cloud. Conforme RGPD jour 1.</p>
            </div>

            <div style={{ paddingLeft: '24px', borderLeft: '2px solid #000000' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>✓ Alertes intelligentes</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>"Rupture risquée en semaine 3" → Email automatique.</p>
            </div>

            <div style={{ paddingLeft: '24px', borderLeft: '2px solid #000000' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>✓ Export + API (futur)</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>Intégrez dans votre workflow.</p>
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: '#000000', margin: '32px 0' }} />

        {/* ========== PRICING ========== */}
        <section id="pricing" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3', marginBottom: '24px' }}>
            €35/mois. C'est tout.
          </h2>
          
          <div style={{ border: '2px solid #000000', padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 24px 0', color: '#333333' }}>STOCKPREDI</p>
            <p style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>€35/mois</p>
            <p style={{ fontSize: '14px', color: '#333333', margin: '0 0 24px 0' }}>(ou €350/an, −2%)</p>
            
            <div style={{ textAlign: 'left', margin: '24px 0', fontSize: '14px', lineHeight: '1.8' }}>
              <p>✓ Produits illimités</p>
              <p>✓ Forecast illimité</p>
              <p>✓ Shopify + WC</p>
              <p>✓ Alerts + Support FR</p>
            </div>

            <button style={{
              background: '#000000',
              color: '#FFFFFF',
              border: '2px solid #000000',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 200ms ease',
              marginBottom: '12px'
            }}
            onMouseEnter={(e) => { e.target.style.background = '#FFFFFF'; e.target.style.color = '#000000'; }}
            onMouseLeave={(e) => { e.target.style.background = '#000000'; e.target.style.color = '#FFFFFF'; }}
            >
              ESSAI GRATUIT 14 JOURS
            </button>
            
            <p style={{ fontSize: '12px', color: '#333333', margin: 0 }}>Aucune carte requise</p>
          </div>

          <p style={{ fontSize: '14px', color: '#333333', marginTop: '24px', textAlign: 'center' }}>
            Pas de "Starter/Pro/Business". Un prix. Zéro surprise.
          </p>
        </section>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: '#000000', margin: '32px 0' }} />

        {/* ========== CTA FINAL ========== */}
        <section style={{ paddingTop: '48px', paddingBottom: '48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3', marginBottom: '24px' }}>
            Prêt à réduire vos stockouts ?
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333333', marginBottom: '24px' }}>
            Les PME françaises font confiance à StockPredi pour automatiser leur prévision de stock. Rejoignez-les. 14 jours gratuit. Aucun engagement.
          </p>
          
          <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700' }}>Email *</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.fr"
                style={{
                  border: '1px solid #000000',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontFamily: 'Courier New, monospace',
                  height: '40px',
                  backgroundColor: '#FFFFFF'
                }}
              />
            </div>
            <button type="submit" style={{
              background: '#000000',
              color: '#FFFFFF',
              border: '2px solid #000000',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={(e) => { e.target.style.background = '#FFFFFF'; e.target.style.color = '#000000'; }}
            onMouseLeave={(e) => { e.target.style.background = '#000000'; e.target.style.color = '#FFFFFF'; }}
            >
              ESSAI GRATUIT 14 JOURS
            </button>
            {submitted && <p style={{ fontSize: '14px', color: '#333333', marginTop: '12px' }}>✓ Email reçu</p>}
          </form>
        </section>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: '#000000', margin: '32px 0' }} />

        {/* ========== FAQ ========== */}
        <section id="faq" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3', marginBottom: '24px' }}>
            Questions fréquentes
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Quelles données vous avez besoin ?</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Historique ventes (6 mois min). Date + Produit + Quantité. On détecte vos colonnes automatiquement.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Fonctionne avec Shopify/WooCommerce ?</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Oui. Export en 2 clics. Intégration API futur.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Et si j'ai plusieurs sites/entrepôts ?</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                €35/mois couvre tout. Illimité produits ET sites.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Mes données sont confidentielles ?</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                RGPD conforme. Data en EU (Supabase). Option self-host Llama = zéro cloud.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Support français ?</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Email + chat FR. Réponse &lt;4h garanti.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Combien de temps pour le setup ?</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                5 minutes. Upload CSV → Dashboard → Recommandations.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Vous gardez mes données après résiliation ?</p>
              <p style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: 0 }}>
                Non. Suppression complète sur demande.
              </p>
            </div>

          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: '#000000', margin: '32px 0' }} />

        {/* ========== FOOTER ========== */}
        <footer id="contact" style={{ paddingTop: '48px', paddingBottom: '48px', textAlign: 'center', fontSize: '12px', color: '#333333' }}>
          <p style={{ fontWeight: '700', marginBottom: '16px' }}>StockPredi</p>
          <p style={{ margin: '8px 0' }}>© 2026 — Tous droits réservés</p>
          
          <div style={{ margin: '24px 0', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <a href="#" style={{ textDecoration: 'underline', color: '#000000' }}>Mentions légales</a>
            <span>•</span>
            <a href="#" style={{ textDecoration: 'underline', color: '#000000' }}>Confidentialité</a>
            <span>•</span>
            <a href="#" style={{ textDecoration: 'underline', color: '#000000' }}>CGU</a>
            <span>•</span>
            <a href="#" style={{ textDecoration: 'underline', color: '#000000' }}>Contact</a>
          </div>

          <p style={{ margin: '16px 0', fontWeight: '700' }}>contact@stockpredi.fr</p>
          
          <div style={{ margin: '24px 0', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <a href="#" style={{ textDecoration: 'underline', color: '#000000' }}>LinkedIn</a>
            <span>•</span>
            <a href="#" style={{ textDecoration: 'underline', color: '#000000' }}>Twitter</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
