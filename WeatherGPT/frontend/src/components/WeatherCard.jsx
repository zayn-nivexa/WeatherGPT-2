import React from 'react';
import { Thermometer, Wind, Droplets, Gauge, Sun, CloudRain, Cloud, Compass } from 'lucide-react';

export default function WeatherCard({ weatherData, locationName }) {
  if (!weatherData || !weatherData.current) return null;

  const current = weatherData.current;
  const hourly = weatherData.hourly_forecast || [];

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            LIVE METEOROLOGICAL DATA
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#fff', marginTop: '2px' }}>
            {locationName || "Current Location"}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {current.condition} • {current.is_day ? 'Daytime Observation' : 'Nighttime Observation'}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1, color: '#fff' }}>
            {current.temperature}°<span style={{ fontSize: '1.6rem', color: 'var(--accent-cyan)' }}>C</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Feels like {current.feels_like}°C
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '20px 0' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <Droplets size={14} color="#38bdf8" /> Humidity
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>
            {current.humidity}%
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <Wind size={14} color="#34d399" /> Wind Speed
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>
            {current.wind_speed} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>km/h</span>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <Gauge size={14} color="#a855f7" /> Barometer
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>
            {current.pressure} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>hPa</span>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <Thermometer size={14} color="#f59e0b" /> Condition
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: '4px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {current.condition}
          </div>
        </div>
      </div>

      {/* Hourly forecast slider */}
      {hourly.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', tracking: '0.05em', fontWeight: 600 }}>
            Next 24 Hours Forecast
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
            {hourly.slice(0, 12).map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  minWidth: '68px', 
                  background: 'rgba(30, 41, 59, 0.5)', 
                  padding: '10px 8px', 
                  borderRadius: '10px', 
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.time}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0', color: '#fff' }}>{item.temp}°</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>💧 {item.pop}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
