import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      fontFamily: 'Courier New, monospace',
      background: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{
          fontSize: '72px',
          fontWeight: '700',
          margin: '0 0 16px 0',
          color: '#000'
        }}>
          404
        </h1>

        <p style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 24px 0',
          color: '#000'
        }}>
          Page non trouvée
        </p>

        <p style={{
          fontSize: '16px',
          color: '#555',
          lineHeight: '1.6',
          margin: '0 0 32px 0'
        }}>
          La page que vous recherchez n'existe pas ou a été supprimée.
        </p>

        <div style={{
          border: '1px solid #000',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700' }}>
            Suggestions :
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#333' }}>
            <li>Vérifiez l'URL dans la barre d'adresse</li>
            <li>Retournez à l'accueil et naviguez depuis le menu</li>
            <li>Si vous pensiez accéder à une page protégée, reconnectez-vous</li>
            <li>Contactez le support si le problème persiste</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              background: '#000',
              color: '#fff',
              padding: '12px 32px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              border: '2px solid #000',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#000';
              e.target.style.color = '#fff';
            }}
          >
            ← Retour à l'accueil
          </Link>
          <Link
            to="/contact"
            style={{
              background: '#fff',
              color: '#000',
              padding: '12px 32px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              border: '2px solid #000',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#000';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#000';
            }}
          >
            Nous contacter →
          </Link>
        </div>
      </div>

      <footer style={{
        position: 'fixed',
        bottom: '32px',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>StockPredi — Gestion de stocks intelligente</p>
      </footer>
    </div>
  );
}
