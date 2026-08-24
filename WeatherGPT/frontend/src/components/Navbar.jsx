import React from 'react';
import { CloudSun, ShieldAlert, Sparkles, Globe, Cpu } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' }
];

export default function Navbar({ currentLang, setLang, activePersona }) {
  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
        }}>
          <CloudSun size={26} color="#ffffff" className="animate-float" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Weather<span className="gradient-text">GPT</span>
            <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 600 }}>
              AI Intelligence v1.0
            </span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time Meteorological AI & Climate Decision Support
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
          Open-Meteo Live API Active
        </div>

        {/* Language selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.6)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <Globe size={16} color="var(--accent-cyan)" />
          <select 
            value={currentLang} 
            onChange={(e) => setLang(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} style={{ background: '#0f172a', color: '#fff' }}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
