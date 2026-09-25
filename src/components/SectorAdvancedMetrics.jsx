import React, { useState } from 'react';
import { getSectorConfig } from '../config/sectorConfig';

export function SectorAdvancedMetrics({ sector }) {
  const config = getSectorConfig(sector);
  const [expandedSection, setExpandedSection] = useState('overview');

  return (
    <div className="advanced-metrics">
      <style>{`
        .advanced-metrics {
          background: #fff;
          padding: 16px;
          margin-top: 12px;
          border: 1px solid #eee;
          font-family: "Courier New", monospace;
          font-weight: 400;
          color: #000;
        }
        .advanced-metrics .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .advanced-metrics .metric-card {
          background: #fff;
          padding: 12px;
          border: 1px solid #000;
          color: #000;
          text-align: center;
        }
        .advanced-metrics .metric-label { font-size: 11px; color: #888; margin-bottom: 4px; text-transform: uppercase; }
        .advanced-metrics .metric-value { font-size: 16px; font-weight: 700; }
        .advanced-metrics .section { margin-top: 12px; border-top: 1px solid #eee; padding-top: 12px; }
        .advanced-metrics .section-title { font-size: 13px; font-weight: 700; color: #000; cursor: pointer; display: flex; justify-content: space-between; padding: 8px 0; }
        .advanced-metrics .section-content { margin-top: 8px; font-size: 13px; color: #555; line-height: 1.6; }
        .advanced-metrics .alert { background: #f5f5f5; border-left: 3px solid #000; padding: 10px; margin: 6px 0; font-size: 12px; }
      `}</style>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Périssables</div>
          <div className="metric-value">{config.perissable_pct}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Saisonnalité</div>
          <div className="metric-value">{config.saisonnalite_pct}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Marge Sécu</div>
          <div className="metric-value">{config.marge_securite_pct}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Staff Base</div>
          <div className="metric-value">{config.base_staff}</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title" onClick={() => setExpandedSection(expandedSection === 'vacation' ? null : 'vacation')}>
          <span>🏖️ Congés critiques</span>
          <span>▼</span>
        </div>
        {expandedSection === 'vacation' && (
          <div className="section-content">
            <p>Mois à risque: {config.vacation_risk_months.map(m => ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][m-1]).join(', ')}</p>
            <div className="alert">💡 Capacité réduite de -30 à -40% pendant ces périodes.</div>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title" onClick={() => setExpandedSection(expandedSection === 'staff' ? null : 'staff')}>
          <span>👥 Effectifs & RH</span>
          <span>▼</span>
        </div>
        {expandedSection === 'staff' && (
          <div className="section-content">
            <p><strong>Base:</strong> {config.base_staff} personnes</p>
            <p><strong>Pic saisonnier:</strong> +{Math.round(config.base_staff * 0.4)} à +{Math.round(config.base_staff * 0.6)} ETP</p>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title" onClick={() => setExpandedSection(expandedSection === 'ai' ? null : 'ai')}>
          <span>🤖 Contexte IA</span>
          <span>▼</span>
        </div>
        {expandedSection === 'ai' && (
          <div className="section-content">
            <div className="alert">{config.ai_context}</div>
          </div>
        )}
      </div>
    </div>
  );
}