import React from 'react';
import { Sprout, ShieldAlert, Plane, BarChart3 } from 'lucide-react';

const PERSONAS = [
  {
    id: 'traveler',
    title: 'Traveler & General',
    icon: Plane,
    desc: 'Outdoor planning, comfort & clothing tips',
    color: '#38bdf8'
  },
  {
    id: 'farmer',
    title: 'Farmer & Agriculture',
    icon: Sprout,
    desc: 'Crop safety, soil moisture & spray timing',
    color: '#34d399'
  },
  {
    id: 'disaster_manager',
    title: 'Disaster & Gov Official',
    icon: ShieldAlert,
    desc: 'Emergency protocols & hazard mitigation',
    color: '#f43f5e'
  },
  {
    id: 'researcher',
    title: 'Climate Researcher',
    icon: BarChart3,
    desc: 'Atmospheric metrics & multi-year trends',
    color: '#a855f7'
  }
];

export default function PersonaSelector({ activePersona, setPersona }) {
  return (
    <div style={{ margin: '0 24px 20px 24px' }}>
      <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>Target User Persona Context</span>
        <span style={{ height: '1px', background: 'var(--border-glass)', flex: 1 }}></span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {PERSONAS.map(p => {
          const Icon = p.icon;
          const isActive = activePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className="glass-panel"
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                background: isActive ? `linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)` : 'rgba(18, 26, 44, 0.4)',
                border: isActive ? `1.5px solid ${p.color}` : '1px solid var(--border-glass)',
                boxShadow: isActive ? `0 0 15px ${p.color}33` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                background: isActive ? p.color : 'rgba(255,255,255,0.05)',
                color: isActive ? '#000' : p.color,
                padding: '10px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={20} />
              </div>
              <div>
                <div style={{ color: isActive ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.88rem' }}>
                  {p.title}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '2px' }}>
                  {p.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
