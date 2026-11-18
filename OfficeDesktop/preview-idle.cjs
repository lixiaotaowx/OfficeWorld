

const AWAY_PAUSE_SECONDS = 60;

function createPreviewIdleGate(dependencies = {}) {
  const powerMonitor = dependencies.powerMonitor
    || require('electron').powerMonitor;
  const awaySeconds = dependencies.awaySeconds ?? AWAY_PAUSE_SECONDS;
  const onChange = dependencies.onChange || (() => {});
  let paused = false;

  const idleSeconds = () => {
    try {
      const value = Number(powerMonitor?.getSystemIdleTime?.());
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch {
      return 0;
    }
  };

  const check = () => {
    const next = idleSeconds() >= awaySeconds;
    if (next !== paused) {
      paused = next;
      try { onChange(paused); } catch {  }
    }
    return paused;
  };

  return { check, paused: () => paused, idleSeconds, awaySeconds };
}

module.exports = { createPreviewIdleGate, AWAY_PAUSE_SECONDS };
