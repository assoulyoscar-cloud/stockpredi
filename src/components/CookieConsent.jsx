import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('stockpredi_cookie_consent');
    if (!consent) {
      setShown(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('stockpredi_cookie_consent', 'accepted');
    // Load analytics here if needed
    loadAnalytics();
    setShown(false);
  };

  const handleReject = () => {
    localStorage.setItem('stockpredi_cookie_consent', 'rejected');
    setShown(false);
  };

  if (!shown) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '16px 24px',
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      zIndex: 9999,
      borderTop: '2px solid #000000',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      <div style={{ flex: 1, minWidth: '250px' }}>
        <p style={{ margin: 0 }}>
          Nous utilisons des cookies pour améliorer votre expérience. 
          <a href="/politique-confidentialite" style={{ color: '#ffffff', textDecoration: 'underline', marginLeft: '4px' }}>
            Politique de confidentialité
          </a>
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleAccept}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          Accepter
        </button>
        
        <button
          onClick={handleReject}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '1px solid #ffffff',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Refuser
        </button>
      </div>
    </div>
  );
}

function loadAnalytics() {
  // Placeholder for Google Analytics or other tracking
  // Call your analytics initialization here (aucun outil de mesure installe pour l'instant)
}
