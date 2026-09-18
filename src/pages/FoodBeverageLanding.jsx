import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import './Landing.css';

export default function FoodBeverageLanding() {
  const [roiData, setRoiData] = useState({
    dailyRevenue: 1500,
    profitMargin: 15,
    currentWaste: 8
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const calculateROI = () => {
    const { dailyRevenue, profitMargin, currentWaste } = roiData;
    const annualRevenue = dailyRevenue * 365;
    const dailyWaste = (annualRevenue * (profitMargin / 100) * (currentWaste / 100)) / 365;
    const annualWaste = dailyWaste * 365;
    const wasteReduction = annualWaste * 0.25; // 25% reduction with StockPredi
    const costPerYear = 35 * 12; // €35/month
    const netROI = wasteReduction - costPerYear;
    const paybackMonths = costPerYear > 0 ? Math.ceil((costPerYear / wasteReduction) * 12) : 0;

    return { annualWaste, wasteReduction, netROI, paybackMonths, costPerYear };
  };

  const roi = calculateROI();

  const handleCreateCheckout = async () => {
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      setLoading(true);
      const token = session.access_token;

      // Call backend to create checkout session
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://stockpredi-backend.onrender.com'}/api/subscriptions/create-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        window.location.href = data.checkout_url;
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erreur lors de la création du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setRoiData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Prédisez la demande. Réduisez le gaspillage. Augmentez le profit.</h1>
        <p style={styles.heroSubtitle}>
          StockPredi utilise l'IA pour anticiper la demande et optimiser votre inventaire F&B.
        </p>
        <button onClick={handleCreateCheckout} style={styles.ctaButton} disabled={loading}>
          {loading ? 'Chargement...' : 'Commencer maintenant'}
        </button>
      </section>

      {/* Problem */}
      <section style={styles.problem}>
        <h2 style={styles.sectionTitle}>Le problème</h2>
        <div style={styles.problemBox}>
          <p style={styles.problemText}>
            <strong>€82,000</strong> de pertes annuelles pour un restaurant moyen en gaspillage alimentaire.
          </p>
          <p style={styles.problemDetail}>
            Surstock → expiration → perte directe. Sous-stock → rupture → client mécontent.
          </p>
        </div>
      </section>

      {/* ROI Calculator */}
      <section style={styles.calculator}>
        <h2 style={styles.sectionTitle}>Calculez votre ROI</h2>
        <div style={styles.calcGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Chiffre d'affaires quotidien (€)</label>
            <input
              type="number"
              value={roiData.dailyRevenue}
              onChange={(e) => handleInputChange('dailyRevenue', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Marge bénéficiaire (%)</label>
            <input
              type="number"
              value={roiData.profitMargin}
              onChange={(e) => handleInputChange('profitMargin', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Gaspillage actuel (%)</label>
            <input
              type="number"
              value={roiData.currentWaste}
              onChange={(e) => handleInputChange('currentWaste', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.results}>
          <div style={styles.resultBox}>
            <p style={styles.resultLabel}>Gaspillage annuel</p>
            <p style={styles.resultValue}>€{roi.annualWaste.toFixed(0)}</p>
          </div>
          <div style={styles.resultBox}>
            <p style={styles.resultLabel}>Économies potentielles (25% réduction)</p>
            <p style={styles.resultValue} style={{ color: '#27ae60' }}>€{roi.wasteReduction.toFixed(0)}</p>
          </div>
          <div style={styles.resultBox}>
            <p style={styles.resultLabel}>ROI Année 1 (après €{roi.costPerYear.toFixed(0)} abonnement)</p>
            <p style={styles.resultValue} style={{ color: '#e74c3c', fontSize: '1.8em' }}>€{roi.netROI.toFixed(0)}</p>
          </div>
          <div style={styles.resultBox}>
            <p style={styles.resultLabel}>Retour sur investissement</p>
            <p style={styles.resultValue}>{roi.paybackMonths} mois</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={styles.pricing}>
        <h2 style={styles.sectionTitle}>Tarification simple</h2>
        <div style={styles.priceBox}>
          <h3 style={styles.priceName}>StockPredi Pro</h3>
          <p style={styles.priceAmount}>35€ HT<span style={styles.priceFreq}>/mois</span></p>
          <p style={styles.priceDesc}>Prévisions illimitées • Support prioritaire • Accès complet</p>
          <button onClick={handleCreateCheckout} style={styles.buyButton} disabled={loading}>
            {loading ? 'Chargement...' : 'S\'abonner maintenant'}
          </button>
        </div>
      </section>

      {/* Case Study */}
      <section style={styles.caseStudy}>
        <h2 style={styles.sectionTitle}>Cas d'usage</h2>
        <div style={styles.caseBox}>
          <h3 style={styles.caseName}>Restaurant Le Petit Matin</h3>
          <p style={styles.caseDetail}>
            <strong>Avant StockPredi:</strong> 12% gaspillage, €9,600/an perdu
          </p>
          <p style={styles.caseDetail}>
            <strong>Après StockPredi (3 mois):</strong> 8% gaspillage, €6,400/an perdu
          </p>
          <p style={styles.caseDetail} style={{ color: '#27ae60' }}>
            <strong>Résultat:</strong> €3,200/an d'économies • ROI: 2 mois
          </p>
        </div>
      </section>

      {/* CTA Footer */}
      <section style={styles.footerCTA}>
        <h2 style={styles.footerTitle}>Prêt à réduire votre gaspillage?</h2>
        <button onClick={handleCreateCheckout} style={styles.finalCTA} disabled={loading}>
          {loading ? 'Chargement...' : 'Commencer votre essai - 35€ HT/mois'}
        </button>
      </section>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Courier New, monospace',
    backgroundColor: '#fff',
    color: '#000'
  },
  hero: {
    background: '#000',
    color: '#fff',
    padding: '80px 40px',
    textAlign: 'center',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroTitle: {
    fontSize: '2.5em',
    marginBottom: '20px',
    lineHeight: '1.2'
  },
  heroSubtitle: {
    fontSize: '1.2em',
    marginBottom: '40px',
    opacity: 0.9
  },
  ctaButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '15px 40px',
    fontSize: '1em',
    fontFamily: 'Courier New, monospace',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.3s'
  },
  problem: {
    padding: '60px 40px',
    backgroundColor: '#f5f5f5'
  },
  problemBox: {
    backgroundColor: '#ffe6e6',
    padding: '30px',
    borderLeft: '4px solid #e74c3c',
    marginTop: '20px'
  },
  problemText: {
    fontSize: '1.5em',
    margin: '0 0 10px 0'
  },
  problemDetail: {
    fontSize: '1em',
    opacity: 0.8
  },
  calculator: {
    padding: '60px 40px',
    backgroundColor: '#fff'
  },
  calcGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '30px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '0.9em',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  input: {
    padding: '10px',
    border: '1px solid #000',
    fontFamily: 'Courier New, monospace',
    fontSize: '1em'
  },
  results: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '40px'
  },
  resultBox: {
    background: '#f5f5f5',
    padding: '20px',
    border: '1px solid #000',
    textAlign: 'center'
  },
  resultLabel: {
    fontSize: '0.9em',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  resultValue: {
    fontSize: '1.8em',
    fontWeight: 'bold',
    margin: 0
  },
  sectionTitle: {
    fontSize: '2em',
    borderBottom: '2px solid #000',
    paddingBottom: '10px',
    marginBottom: '30px'
  },
  pricing: {
    padding: '60px 40px',
    backgroundColor: '#f5f5f5',
    textAlign: 'center'
  },
  priceBox: {
    background: '#fff',
    border: '2px solid #000',
    padding: '40px',
    maxWidth: '300px',
    margin: '0 auto',
    marginTop: '30px'
  },
  priceName: {
    fontSize: '1.5em',
    marginBottom: '15px'
  },
  priceAmount: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  priceFreq: {
    fontSize: '0.6em',
    fontWeight: 'normal'
  },
  priceDesc: {
    fontSize: '0.95em',
    marginBottom: '20px',
    lineHeight: '1.6'
  },
  buyButton: {
    width: '100%',
    padding: '12px',
    background: '#000',
    color: '#fff',
    border: 'none',
    fontFamily: 'Courier New, monospace',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.3s'
  },
  caseStudy: {
    padding: '60px 40px',
    backgroundColor: '#fff'
  },
  caseBox: {
    background: '#f0f8ff',
    border: '1px solid #000',
    padding: '30px',
    marginTop: '20px'
  },
  caseName: {
    fontSize: '1.3em',
    marginBottom: '15px'
  },
  caseDetail: {
    fontSize: '0.95em',
    marginBottom: '10px'
  },
  footerCTA: {
    background: '#000',
    color: '#fff',
    padding: '60px 40px',
    textAlign: 'center'
  },
  footerTitle: {
    fontSize: '2em',
    marginBottom: '30px'
  },
  finalCTA: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '15px 40px',
    fontSize: '1em',
    fontFamily: 'Courier New, monospace',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.3s'
  }
};
