import React from 'react';
import { User, Sparkles, Sprout, ShieldAlert, Plane, BarChart3, Bot } from 'lucide-react';
import WeatherCard from './WeatherCard';
import ClimateChart from './ClimateChart';

const PERSONA_BADGES = {
  farmer: { title: 'Farmer Context', icon: Sprout, color: '#34d399' },
  disaster_manager: { title: 'Disaster Context', icon: ShieldAlert, color: '#f43f5e' },
  traveler: { title: 'Traveler Context', icon: Plane, color: '#38bdf8' },
  researcher: { title: 'Research Context', icon: BarChart3, color: '#a855f7' }
};

export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user';
  const personaMeta = PERSONA_BADGES[message.persona] || PERSONA_BADGES.traveler;
  const PersonaIcon = personaMeta.icon;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '20px',
      maxWidth: '100%'
    }}>
      {/* Sender Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {!isUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            <Bot size={15} /> WeatherGPT AI Engine
          </div>
        )}
        {!isUser && message.persona && (
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: `${personaMeta.color}15`,
            color: personaMeta.color,
            border: `1px solid ${personaMeta.color}35`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600
          }}>
            <PersonaIcon size={12} /> {personaMeta.title}
          </span>
        )}
        {isUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <User size={14} /> You
          </div>
        )}
      </div>

      {/* Message Bubble */}
      <div style={{
        maxWidth: isUser ? '80%' : '90%',
        padding: '16px 20px',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        background: isUser ? 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)' : 'rgba(18, 26, 44, 0.75)',
        border: isUser ? 'none' : '1px solid var(--border-glass)',
        color: '#fff',
        boxShadow: isUser ? '0 4px 15px rgba(79, 70, 229, 0.3)' : '0 4px 20px rgba(0,0,0,0.2)',
        fontSize: '0.94rem',
        lineHeight: 1.6,
        whiteSpace: 'pre-line'
      }}>
        {message.text}

        {/* Embedded Weather Widget */}
        {message.weatherData && (
          <div style={{ marginTop: '16px' }}>
            <WeatherCard weatherData={message.weatherData} locationName={message.location} />
          </div>
        )}

        {/* Embedded Climate Chart */}
        {message.historicalData && (
          <div style={{ marginTop: '12px' }}>
            <ClimateChart historicalData={message.historicalData} />
          </div>
        )}
      </div>
    </div>
  );
}
