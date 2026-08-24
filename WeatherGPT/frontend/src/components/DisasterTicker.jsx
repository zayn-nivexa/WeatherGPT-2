import React from 'react';
import { AlertTriangle, ShieldAlert, Radio } from 'lucide-react';

export default function DisasterTicker({ alerts = [] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div style={{
        margin: '0 24px 16px 24px',
        padding: '10px 20px',
        borderRadius: '12px',
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.85rem',
        color: '#34d399'
      }}>
        <Radio size={16} className="animate-pulse-glow" />
        <span><strong>Global Warning Monitor:</strong> No critical severe weather disasters active for searched location. Normal safety protocols apply.</span>
      </div>
    );
  }

  return (
    <div style={{
      margin: '0 24px 16px 24px',
      padding: '12px 20px',
      borderRadius: '12px',
      background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.1) 100%)',
      border: '1px solid rgba(244, 63, 94, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      boxShadow: '0 4px 20px rgba(244, 63, 94, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: '#f43f5e',
          color: '#fff',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <ShieldAlert size={20} />
        </div>
        <div>
          <h4 style={{ color: '#fb7185', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {alerts[0].severity}: {alerts[0].title}
          </h4>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.82rem', marginTop: '2px' }}>
            {alerts[0].message}
          </p>
        </div>
      </div>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '0.78rem',
        color: '#ffe4e6',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}>
        Action: {alerts[0].action}
      </div>
    </div>
  );
}
