import { useState } from 'react';

export function DeleteAccountButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    // Confirmation dialog
    const confirmed = window.confirm(
      '⚠️ ATTENTION: Cette action est IRRÉVERSIBLE!\n\n' +
      'Tout sera supprimé définitivement:\n' +
      '✓ Votre compte\n' +
      '✓ Tous vos scénarios\n' +
      '✓ Toutes vos données\n\n' +
      'Êtes-vous SÛRE de vouloir continuer?'
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken'); // Adjust based on your auth storage
      
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Redirect to login
        alert('✅ Compte supprimé avec succès. Redirection...');
        window.location.href = '/login';
      } else {
        alert('❌ Erreur: ' + (await response.json()).error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Erreur réseau: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDeleteAccount}
      disabled={isLoading}
      style={{
        background: '#dc3545',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        opacity: isLoading ? 0.7 : 1,
        transition: 'opacity 0.3s'
      }}
    >
      {isLoading ? '⏳ Suppression...' : '🗑️ Supprimer mon compte'}
    </button>
  );
}