import React, { useState } from 'react';
import { getSectorConfig } from '../config/sectorConfig';

export function SectorAdvancedMetrics({ sector }) {
  const config = getSectorConfig(sector);
  const [expandedSection, setExpandedSection] = useState('overview');

  return (
    <div className="advanced-metrics">
      <style>{`
        .advanced-metrics {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
          border: 1px solid #e0e0e0;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .metric-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 12px;
          border-radius: 8px;
          color: white;
          text-align: center;
        }
        .metric-label { font-size: 11px; opacity: 0.9; margin-bottom: 4px; text-transform: uppercase; }
        .metric-value { font-size: 22px; font-weight: 700; }
        .section { margin-top: 12px; border-top: 1px solid #e0e0e0; padding-top: 12px; }
        .section-title { font-size: 14px; font-weight: 600; color: #333; cursor: pointer; display: flex; justify-content: space-between; padding: 8px 0; }
        .section-content { margin-top: 8px; font-size: 13px; color: #666; line-height: 1.6; }
        .alert { background: #f0f0ff; border-left: 3px solid #667eea; padding: 10px; border-radius: 4px; margin: 6px 0; font-size: 12px; }
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