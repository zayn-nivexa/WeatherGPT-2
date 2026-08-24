import React from 'react';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function ClimateChart({ historicalData }) {
  if (!historicalData || !historicalData.yearly_trends) return null;

  const trends = historicalData.yearly_trends;
  const period = historicalData.period || "2018 - 2023";

  // Calculate max temp for chart scaling
  const maxTemp = Math.max(...trends.map(t => t.avg_summer_max_temp), 35);
  const minTemp = Math.min(...trends.map(t => t.avg_summer_max_temp), 20);

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '18px', margin: '16px 0', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <TrendingUp size={16} /> Multi-Year Climate Change Index ({period})
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
            July Peak Temperature & Rainfall Shifts
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '4px 10px', borderRadius: '8px' }}>
          <Calendar size={14} /> Open-Meteo Historical Archive
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0 20px 0', borderBottom: '1px solid var(--border-glass)' }}>
        {trends.map((item, idx) => {
          const heightPercent = Math.min(100, Math.max(25, ((item.avg_summer_max_temp - minTemp + 5) / (maxTemp - minTemp + 10)) * 100));
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '4px' }}>
                {item.avg_summer_max_temp}°C
              </div>
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: '36px',
                  height: `${heightPercent}%`, 
                  background: 'linear-gradient(180deg, #c084fc 0%, #6366f1 100%)', 
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                  transition: 'height 0.5s ease'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600 }}>
                {item.year}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>* Average July Peak Ambient Temperatures</span>
        <span style={{ color: 'var(--accent-cyan)' }}>Precipitation baseline: ~120mm/mo</span>
      </div>
    </div>
  );
}
