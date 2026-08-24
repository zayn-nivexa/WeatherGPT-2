import React from 'react';
import { Sparkles } from 'lucide-react';

const SAMPLE_PROMPTS = [
  { text: "What is the live weather forecast in Tokyo right now?", category: "Forecast" },
  { text: "I am a farmer in Punjab. Is it safe to spray pesticides tomorrow?", category: "Agriculture" },
  { text: "Are there any active cyclone or severe weather alerts near Miami?", category: "Disaster" },
  { text: "Show summer temperature trends in New Delhi over the past 5 years.", category: "Climate History" },
  { text: "What is the weather in Paris for an outdoor wedding this weekend?", category: "Travel" }
];

export default function QuickPrompts({ onSelectPrompt }) {
  return (
    <div style={{ margin: '0 0 16px 0' }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, paddingRight: '4px', whiteSpace: 'nowrap' }}>
          <Sparkles size={14} /> Quick Queries:
        </div>
        {SAMPLE_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p.text)}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-glass)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {p.text}
          </button>
        ))}
      </div>
    </div>
  );
}
