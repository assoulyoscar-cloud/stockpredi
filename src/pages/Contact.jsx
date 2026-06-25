import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
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
        backgroundColor: '#FFFFFF'
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'none', color: '#000000' }}>STOCKPREDI</a>
        <a href="/" style={{ textDecoration: 'underline', color: '#000000', cursor: 'pointer', fontSize: '14px' }}>← Retour</a>
      </nav>

      {/* CONTAINER */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px' }}>
        
        <h1 style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1.2', marginBottom: '32px' }}>
          Contact & Support
        </h1>

        <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000' }}>

          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
            Besoin d'aide ?
          </h2>

          <div style={{ border: '1px solid #000000', padding: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Email direct</p>
            <p style={{ margin: 0 }}>
              <a href="mailto:contact@stockpredi.fr" style={{ textDecoration: 'underline', color: '#000000' }}>
                contact@stockpredi.fr
              </a>
            </p>
            <p style={{ fontSize: '12px', color: '#333333', margin: '8px 0 0 0' }}>
              Réponse garantie &lt;4h (jours ouvrables)
            </p>
          </div>

          {/* FORMULAIRE CONTACT */}
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
            Formulaire de contact
          </h2>

          <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                Nom *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  border: '1px solid #000000',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontFamily: 'Courier New, monospace',
                  height: '40px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  border: '1px solid #000000',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontFamily: 'Courier New, monospace',
                  height: '40px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                Sujet *
              </label>
              <select
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                style={{
                  width: '100%',
                  border: '1px solid #000000',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontFamily: 'Courier New, monospace',
                  height: '40px',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="">-- Sélectionner --</option>
                <option value="support">Support technique</option>
                <option value="feature">Demande de fonctionnalité</option>
                <option value="billing">Facturation/Abonnement</option>
                <option value="data">Données/RGPD</option>
                <option value="partnership">Partenariat</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                Message *
              </label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                style={{
                  width: '100%',
                  border: '1px solid #000000',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: 'Courier New, monospace',
                  minHeight: '120px',
                  boxSizing: 'border-box'
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
              transition: 'all 200ms ease',
              width: '100%'
            }}
            onMouseEnter={(e) => { e.target.style.background = '#FFFFFF'; e.target.style.color = '#000000'; }}
            onMouseLeave={(e) => { e.target.style.background = '#000000'; e.target.style.color = '#FFFFFF'; }}
            >
              ENVOYER
            </button>

            {submitted && (
              <p style={{ fontSize: '14px', color: '#333333', marginTop: '12px', textAlign: 'center' }}>
                ✓ Message reçu. Nous vous répondrons sous 4h.
              </p>
            )}
          </form>

          {/* FAQ RAPIDE */}
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
            Questions fréquentes
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Quel est le temps de réponse au support ?</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>
                Email répondu en &lt;4h (jours ouvrables). Chat en temps réel futur.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Je veux annuler mon abonnement. Comment ?</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>
                Contactez support@stockpredi.fr ou accédez à "Paramètres → Abonnement → Annuler".
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Où sont hébergées mes données ?</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>
                Union européenne (Supabase). RGPD conforme. Voir Politique de confidentialité.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Puis-je exporter mes données ?</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>
                Oui. Droit de portabilité RGPD : contact@stockpredi.fr avec demande écrite.
              </p>
            </div>

            <div style={{ border: '1px solid #000000', padding: '24px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Je souhaite un partenariat. Qui contacter ?</p>
              <p style={{ fontSize: '14px', color: '#333333', margin: 0 }}>
                Écrivez à contact@stockpredi.fr avec sujet "Partenariat".
              </p>
            </div>

          </div>

          {/* RESSOURCES */}
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '48px', marginBottom: '24px' }}>
            Ressources
          </h2>

          <p>
            <a href="/" style={{ textDecoration: 'underline', color: '#000000' }}>← Retour à l'accueil</a><br />
            <a href="/mentions-legales" style={{ textDecoration: 'underline', color: '#000000' }}>Mentions légales</a><br />
            <a href="/politique-confidentialite" style={{ textDecoration: 'underline', color: '#000000' }}>Politique de confidentialité</a><br />
            <a href="/conditions-utilisation" style={{ textDecoration: 'underline', color: '#000000' }}>Conditions d'utilisation</a>
          </p>

        </div>

      </div>
    </div>
  );
}
