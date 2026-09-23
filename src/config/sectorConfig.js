export const SECTOR_CONFIGS = {
  restaurant: { id: 'restaurant', label: '🍽️ Restaurant', icon: '🍽️', color: '#E74C3C', perissable_pct: 95, saisonnalite_pct: 75, marge_securite_pct: 12, seasonal_hiring_months: [5, 6, 7, 8, 11, 12], vacation_risk_months: [7, 8], base_staff: 15, ai_context: 'Congés staff juillet/août -40%. Mariages juin +80%. Noël peak. Périssables = zéro surplus.' },
  boulangerie: { id: 'boulangerie', label: '🥐 Boulangerie', icon: '🥐', color: '#F39C12', perissable_pct: 100, saisonnalite_pct: 70, marge_securite_pct: 5, seasonal_hiring_months: [3, 4, 11, 12], vacation_risk_months: [7, 8], base_staff: 6, ai_context: 'Production jour-même. Pâques & Noël +100%. Congés = fermeture complète.' },
  epicerie: { id: 'epicerie', label: '🥬 Épicerie', icon: '🥬', color: '#27AE60', perissable_pct: 60, saisonnalite_pct: 65, marge_securite_pct: 20, seasonal_hiring_months: [6, 7, 8, 11, 12], vacation_risk_months: [8], base_staff: 8, ai_context: 'Fruits périssables 1-2 sem. Fêtes = stocks massifs. Cycles éco = impact direct prix.' },
  pepiniere: { id: 'pepiniere', label: '🌱 Pépinière', icon: '🌱', color: '#16A085', perissable_pct: 25, saisonnalite_pct: 95, marge_securite_pct: 30, seasonal_hiring_months: [2, 3, 4, 5, 8, 9, 10], vacation_risk_months: [7], base_staff: 10, ai_context: '⚠️ CRITIQUE: Gelées tardives avril = perte totale. Pics mars-mai & sept-oct = 95% CA. Hiver = zéro.' },
  boutique: { id: 'boutique', label: '🛍️ Boutique', icon: '🛍️', color: '#9B59B6', perissable_pct: 5, saisonnalite_pct: 60, marge_securite_pct: 25, seasonal_hiring_months: [10, 11, 12], vacation_risk_months: [8], base_staff: 5, ai_context: 'Noël +100%. Black Friday +60%. E-commerce cannibalise pied 30-40%.' },
  bureau_etudes: { id: 'bureau_etudes', label: '📐 Bureau d\'études', icon: '📐', color: '#3498DB', perissable_pct: 0, saisonnalite_pct: 35, marge_securite_pct: 40, seasonal_hiring_months: [1, 9], vacation_risk_months: [7, 8, 12], base_staff: 20, ai_context: 'Budgets janvier & septembre = pics. Vacances collectives = fermetures. Cycles construction critiques.' }
};

export function getSectorConfig(sectorId) {
  return SECTOR_CONFIGS[sectorId] || SECTOR_CONFIGS.restaurant;
}

export function getAllSectors() {
  return Object.values(SECTOR_CONFIGS).map(s => ({
    id: s.id, label: s.label, icon: s.icon, color: s.color
  }));
}

export function calculateTotalImpact(sectorId, params = {}) {
  const config = getSectorConfig(sectorId);
  const perissable = params.perissable_pct || config.perissable_pct;
  const saisonnalite = params.saisonnalite_pct || config.saisonnalite_pct;
  const totalImpact = Math.round((perissable * saisonnalite) / 100);
  const risqueLevel = totalImpact > 6000 ? 'CRITIQUE' : totalImpact > 4000 ? 'ÉLEVÉ' : totalImpact > 2000 ? 'MOYEN' : 'FAIBLE';
  return { totalImpact, risqueLevel, margin: config.marge_securite_pct || 15, recommendations: [] };
}