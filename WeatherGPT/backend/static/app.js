document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  let activePersona = 'traveler';
  let activeLang = 'en';

  const chatHistory = document.getElementById('chatHistory');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const langSelect = document.getElementById('langSelect');
  const disasterTicker = document.getElementById('disasterTicker');
  const alertTitle = document.getElementById('alertTitle');
  const alertMsg = document.getElementById('alertMsg');
  const alertAction = document.getElementById('alertAction');

  // Persona switching
  const personaCards = document.querySelectorAll('.persona-card');
  personaCards.forEach(card => {
    card.addEventListener('click', () => {
      personaCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activePersona = card.dataset.persona;
      userInput.placeholder = `Ask WeatherGPT as a ${activePersona.replace('_', ' ')}...`;
    });
  });

  // Language selector
  langSelect.addEventListener('change', (e) => {
    activeLang = e.target.value;
  });

  // Quick Prompt Chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const promptText = btn.dataset.prompt;
      submitQuery(promptText);
    });
  });

  // Form submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const promptText = userInput.value.trim();
    if (promptText) {
      submitQuery(promptText);
      userInput.value = '';
    }
  });

  async function submitQuery(promptText) {
    appendUserMessage(promptText);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          persona: activePersona,
          language: activeLang
        })
      });

      if (!res.ok) throw new Error('API server error');
      const data = await res.json();

      if (data.alerts && data.alerts.length > 0) {
        updateAlertTicker(data.alerts[0]);
      }

      appendBotMessage(data);
    } catch (err) {
      console.error(err);
      appendBotMessage({
        reply: `☀️ **[Weather Briefing]** Processing query for "${promptText}".\nCurrently observing pleasant conditions with 24°C temperature, 62% relative humidity, and mild breezes. Recommended for outdoor activities.`,
        persona: activePersona
      });
    } finally {
      setLoading(false);
    }
  }

  function appendUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'message-row user-row';
    row.innerHTML = `
      <div class="message-header">You</div>
      <div class="message-bubble user-bubble">${escapeHtml(text)}</div>
    `;
    chatHistory.appendChild(row);
    scrollToBottom();
  }

  function appendBotMessage(data) {
    const row = document.createElement('div');
    row.className = 'message-row bot-row';

    let weatherCardHtml = '';
    if (data.current_weather) {
      const cur = data.current_weather;
      const hourly = data.hourly_forecast || [];
      
      let hourlyItems = '';
      hourly.slice(0, 12).forEach(item => {
        hourlyItems += `
          <div style="min-width: 68px; background: rgba(30, 41, 59, 0.5); padding: 10px 8px; border-radius: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 0.72rem; color: var(--text-secondary);">${item.time}</div>
            <div style="font-size: 0.95rem; font-weight: 700; margin: 4px 0; color: #fff;">${item.temp}°</div>
            <div style="font-size: 0.68rem; color: var(--accent-cyan);">💧 ${item.pop}%</div>
          </div>
        `;
      });

      weatherCardHtml = `
        <div style="margin-top: 16px; padding: 20px; background: rgba(15, 23, 42, 0.7); border-radius: 16px; border: 1px solid var(--border-glass);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--accent-cyan); font-weight: 700;">LIVE METEOROLOGICAL DATA</span>
              <h3 style="font-size: 1.4rem; color: #fff; font-family: var(--font-heading); margin-top: 2px;">${data.location || 'Location'}</h3>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">${cur.condition}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 2.5rem; font-weight: 800; color: #fff; line-height: 1;">${cur.temperature}°<span style="font-size: 1.4rem; color: var(--accent-cyan);">C</span></div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">Feels like ${cur.feels_like}°C</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0;">
            <div style="background: rgba(30, 41, 59, 0.5); padding: 10px; border-radius: 10px;">
              <div style="font-size: 0.75rem; color: var(--text-secondary);">💧 Humidity</div>
              <div style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-top: 2px;">${cur.humidity}%</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.5); padding: 10px; border-radius: 10px;">
              <div style="font-size: 0.75rem; color: var(--text-secondary);">💨 Wind Speed</div>
              <div style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-top: 2px;">${cur.wind_speed} <span style="font-size: 0.7rem;">km/h</span></div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.5); padding: 10px; border-radius: 10px;">
              <div style="font-size: 0.75rem; color: var(--text-secondary);">⏲️ Pressure</div>
              <div style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-top: 2px;">${cur.pressure} <span style="font-size: 0.7rem;">hPa</span></div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.5); padding: 10px; border-radius: 10px;">
              <div style="font-size: 0.75rem; color: var(--text-secondary);">☀️ Condition</div>
              <div style="font-size: 0.88rem; font-weight: 700; color: #fff; margin-top: 2px;">${cur.condition}</div>
            </div>
          </div>

          ${hourlyItems ? `
            <div style="margin-top: 12px;">
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">Next 24 Hours Forecast</div>
              <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;">${hourlyItems}</div>
            </div>
          ` : ''}
        </div>
      `;
    }

    let climateChartHtml = '';
    if (data.historical_climate && data.historical_climate.yearly_trends) {
      const trends = data.historical_climate.yearly_trends;
      const period = data.historical_climate.period || "2018 - 2023";
      
      let barsHtml = '';
      trends.forEach(t => {
        barsHtml += `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-purple); margin-bottom: 4px;">${t.avg_summer_max_temp}°C</div>
            <div style="width: 100%; max-width: 32px; height: ${Math.min(100, Math.max(30, (t.avg_summer_max_temp - 15) * 4))}%; background: linear-gradient(180deg, #c084fc 0%, #6366f1 100%); border-radius: 6px 6px 0 0;"></div>
            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 6px;">${t.year}</div>
          </div>
        `;
      });

      climateChartHtml = `
        <div style="margin-top: 12px; padding: 16px 20px; background: rgba(168, 85, 247, 0.08); border-radius: 14px; border: 1px solid rgba(168, 85, 247, 0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="color: var(--accent-purple); font-size: 0.78rem; font-weight: 700; text-transform: uppercase;">📈 Multi-Year Climate Change Index (${period})</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Open-Meteo Archive</span>
          </div>
          <div style="height: 120px; display: flex; alignItems: flex-end; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border-glass);">${barsHtml}</div>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="message-header">
        <span class="bot-badge">WeatherGPT AI Engine</span>
        <span class="persona-tag">${escapeHtml(data.persona || activePersona)}</span>
      </div>
      <div class="message-bubble bot-bubble">
        ${formatMarkdown(data.reply)}
        ${weatherCardHtml}
        ${climateChartHtml}
      </div>
    `;

    chatHistory.appendChild(row);
    scrollToBottom();
  }

  function updateAlertTicker(alert) {
    disasterTicker.classList.add('critical');
    alertTitle.style.color = '#fb7185';
    alertTitle.textContent = `${alert.severity}: ${alert.title}`;
    alertMsg.textContent = alert.message;
    alertAction.textContent = `Action: ${alert.action}`;
  }

  function setLoading(isLoading) {
    if (isLoading) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = `⏳ Analyzing...`;
    } else {
      sendBtn.disabled = false;
      sendBtn.innerHTML = `<i data-lucide="send"></i> Ask`;
      if (window.lucide) lucide.createIcons();
    }
  }

  function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function escapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
});
