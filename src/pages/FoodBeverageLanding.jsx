/**
 * F&B Landing Page - Pricing & Sales
 * Route: /industries/food-beverage
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendClient } from '../api/backendClient';

const FoodBeverageLanding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roiData, setRoiData] = useState(null);
  const token = localStorage.getItem('token');

  const handleCreateCheckout = async (tier) => {
    if (!token) {
      navigate('/login?redirect=/industries/food-beverage');
      return;
    }

    setLoading(true);
    try {
      const response = await backendClient.post(
        '/api/subscriptions/create-session',
        { tier },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.checkout_url;
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  const calculateROI = (revenue, margin, waste) => {
    if (!revenue || !margin || !waste) return null;
    const dailyWaste = (revenue * margin * waste) / 100 / 100;
    const monthlyWaste = dailyWaste * 30;
    const annualWaste = monthlyWaste * 12;
    const savings = annualWaste * 0.25; // Assume 25% reduction with StockPredi
    return {
      dailyWaste: dailyWaste.toFixed(2),
      monthlyWaste: monthlyWaste.toFixed(2),
      annualWaste: annualWaste.toFixed(2),
      potentialSavings: savings.toFixed(2),
      proROI: ((savings - 348) / 348 * 100).toFixed(0), // €29 * 12 = €348/year
    };
  };

  const styles = {
    container: {
      fontFamily: '"Courier New", monospace',
      color: '#000',
      backgroundColor: '#fff',
    },
    hero: {
      padding: '80px 20px',
      textAlign: 'center',
      borderBottom: '1px solid #000',
    },
    heroTitle: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '20px',
      lineHeight: '1.2',
    },
    heroSubtitle: {
      fontSize: '20px',
      color: '#666',
      maxWidth: '600px',
      margin: '0 auto 20px',
    },
    section: {
      maxWidth: '1200px',
      margin: '60px auto',
      padding: '0 20px',
    },
    sectionTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '40px',
      textAlign: 'center',
    },
    pricingCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '30px',
      marginBottom: '60px',
    },
    card: {
      border: '2px solid #000',
      padding: '40px 30px',
      position: 'relative',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
    },
    cardFeatured: {
      borderWidth: '3px',
      transform: 'scale(1.05)',
    },
    badge: {
      position: 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#000',
      color: '#fff',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    cardTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    price: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    priceSpan: {
      fontSize: '16px',
      fontWeight: 'normal',
    },
    cardList: {
      listStyle: 'none',
      flex: 1,
      marginBottom: '20px',
    },
    cardListItem: {
      padding: '8px 0',
      borderBottom: '1px solid #eee',
      fontSize: '14px',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#000',
      color: '#fff',
      border: 'none',
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: 'auto',
    },
    caseStudy: {
      border: '2px solid #000',
      padding: '40px',
      backgroundColor: '#f9f9f9',
      marginBottom: '60px',
    },
    caseStudyTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    caseStudySubtitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '30px',
    },
    metrics: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      marginBottom: '30px',
    },
    metric: {
      textAlign: 'center',
    },
    metricValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    metricLabel: {
      fontSize: '14px',
      color: '#666',
    },
    blockquote: {
      fontSize: '16px',
      fontStyle: 'italic',
      borderLeft: '4px solid #000',
      paddingLeft: '20px',
      margin: '20px 0',
    },
    roiCalculator: {
      border: '2px solid #000',
      padding: '40px',
      marginBottom: '60px',
      maxWidth: '600px',
      margin: '0 auto 60px',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '15px',
      border: '1px solid #000',
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
    },
    roiResult: {
      backgroundColor: '#f0f0f0',
      padding: '20px',
      marginTop: '20px',
      border: '1px solid #000',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Predict demand.<br />
          Reduce waste.<br />
          Increase profit.
        </h1>
        <p style={styles.heroSubtitle}>
          StockPredi F&B: AI-powered forecasting for restaurants, cafés, and food delivery.
        </p>
      </div>

      {/* Problem Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>The Problem</h2>
        <div style={{ fontSize: '18px', lineHeight: '1.8', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <p><strong>30% of food</strong> purchased by restaurants is wasted.</p>
          <p><strong>For a 40-cover restaurant:</strong> €225 waste/day × 365 = <strong>€82,000 annually</strong></p>
          <p>Bad forecasting costs you money. <strong>Every day.</strong></p>
        </div>
      </div>

      {/* ROI Calculator */}
      <div style={styles.roiCalculator}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
          How much could you save?
        </h2>
        <input
          type="number"
          placeholder="Daily revenue (€)"
          style={styles.input}
          onChange={(e) => setRoiData(calculateROI(
            parseFloat(e.target.value),
            parseFloat(document.getElementById('margin')?.value || 0),
            parseFloat(document.getElementById('waste')?.value || 0)
          ))}
        />
        <input
          id="margin"
          type="number"
          placeholder="Profit margin (%)"
          style={styles.input}
          onChange={(e) => setRoiData(calculateROI(
            parseFloat(document.getElementById('revenue')?.value || 0),
            parseFloat(e.target.value),
            parseFloat(document.getElementById('waste')?.value || 0)
          ))}
        />
        <input
          id="waste"
          type="number"
          placeholder="Current waste (%)"
          style={styles.input}
          onChange={(e) => setRoiData(calculateROI(
            parseFloat(document.getElementById('revenue')?.value || 0),
            parseFloat(document.getElementById('margin')?.value || 0),
            parseFloat(e.target.value)
          ))}
        />
        <input id="revenue" type="number" placeholder="Daily revenue" style={{ display: 'none' }} />
        
        {roiData && (
          <div style={styles.roiResult}>
            <p><strong>Annual waste:</strong> €{roiData.annualWaste}</p>
            <p><strong>With StockPredi:</strong> €{roiData.potentialSavings}/year saved</p>
            <p><strong>ROI:</strong> {roiData.proROI}% (Pro tier)</p>
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Pricing</h2>
        <div style={styles.pricingCards}>
          {/* Free Tier */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Free</h3>
            <p style={styles.price}>€0<span style={styles.priceSpan}>/month</span></p>
            <ul style={styles.cardList}>
              <li style={styles.cardListItem}>1 forecast/month</li>
              <li style={styles.cardListItem}>Basic predictions</li>
              <li style={styles.cardListItem}>No weather data</li>
              <li style={styles.cardListItem}>Community support</li>
            </ul>
            <button style={styles.button} onClick={() => navigate('/login')}>
              Get Started
            </button>
          </div>

          {/* Pro Tier */}
          <div style={{ ...styles.card, ...styles.cardFeatured }}>
            <span style={styles.badge}>MOST POPULAR</span>
            <h3 style={styles.cardTitle}>Pro</h3>
            <p style={styles.price}>€29<span style={styles.priceSpan}>/month</span></p>
            <ul style={styles.cardList}>
              <li style={styles.cardListItem}>10 forecasts/month</li>
              <li style={styles.cardListItem}>Weather adjustments</li>
              <li style={styles.cardListItem}>CSV export</li>
              <li style={styles.cardListItem}>Email support</li>
              <li style={styles.cardListItem}>14-day free trial</li>
            </ul>
            <button 
              style={styles.button} 
              onClick={() => handleCreateCheckout('pro')}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Start Free Trial'}
            </button>
          </div>

          {/* Enterprise Tier */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Enterprise</h3>
            <p style={styles.price}>€99<span style={styles.priceSpan}>/month</span></p>
            <ul style={styles.cardList}>
              <li style={styles.cardListItem}>Unlimited forecasts</li>
              <li style={styles.cardListItem}>API access</li>
              <li style={styles.cardListItem}>Slack integration</li>
              <li style={styles.cardListItem}>24/7 dedicated support</li>
              <li style={styles.cardListItem}>Custom sectors</li>
            </ul>
            <button 
              style={styles.button} 
              onClick={() => handleCreateCheckout('enterprise')}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Contact Sales'}
            </button>
          </div>
        </div>
      </div>

      {/* Case Study */}
      <div style={styles.section}>
        <div style={styles.caseStudy}>
          <h2 style={styles.caseStudyTitle}>Restaurant Le Petit Matin</h2>
          <p style={styles.caseStudySubtitle}>Fine dining, Paris 11e | 40 covers/day average</p>
          
          <div style={styles.metrics}>
            <div style={styles.metric}>
              <div style={styles.metricValue}>34%</div>
              <div style={styles.metricLabel}>Waste reduction</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricValue}>€5,400</div>
              <div style={styles.metricLabel}>Annual savings</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricValue}>2 mo.</div>
              <div style={styles.metricLabel}>ROI payback</div>
            </div>
          </div>
          
          <blockquote style={styles.blockquote}>
            "StockPredi predicted we'd run out of fresh herbs on Thursdays. 
             Now we order exactly right, and waste dropped 34%. 
             The forecast is eerily accurate."<br/>
            <strong>— Chef Marie Dubois, Le Petit Matin</strong>
          </blockquote>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ ...styles.section, textAlign: 'center', paddingBottom: '80px' }}>
        <h2 style={styles.sectionTitle}>Ready to reduce waste?</h2>
        <button 
          style={{ ...styles.button, width: '200px', margin: '0 auto' }}
          onClick={() => handleCreateCheckout('pro')}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Start Free Trial (Pro)'}
        </button>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          No credit card required. 14-day free trial.
        </p>
      </div>
    </div>
  );
};

export default FoodBeverageLanding;
