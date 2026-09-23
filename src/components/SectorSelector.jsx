import { useState, useEffect } from "react";
import { backendClient } from "../api/backendClient";
import "../styles/SectorSelector.css";

const SECTORS = [
  { id: "fob", label: "F&B", icon: "🍽️", color: "#FF6B6B" },
  { id: "retail", label: "Retail", icon: "🛍️", color: "#4ECDC4" },
  { id: "manufacturing", label: "Manufacturing", icon: "⚙️", color: "#45B7D1" },
];

export default function SectorSelector({ activeSector, onSectorChange, loading = false }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSectorChange = async (sectorId) => {
    if (loading || isSaving || sectorId === activeSector) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await backendClient.post("/user/sector", {
        sector: sectorId,
        remember: true,
      });

      if (response.data?.success) {
        onSectorChange(sectorId);
      } else {
        setError("Failed to save sector preference");
      }
    } catch (err) {
      console.error("Sector change error:", err);
      setError(err.response?.data?.error || "Failed to change sector");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sector-selector-container">
      <div className="sector-selector">
        {SECTORS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSectorChange(s.id)}
            className={`sector-tab ${activeSector === s.id ? "active" : ""}`}
            style={{
              "--sector-color": s.color,
            }}
            disabled={loading || isSaving}
            title={`Switch to ${s.label}`}
          >
            <span className="sector-icon">{s.icon}</span>
            <span className="sector-label">{s.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="sector-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="close-error">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
