import { useEffect } from 'react';
import { HangupIcon, PhoneIcon } from './icons';
import type { CallAlert } from './callAlertRules';

/** How long a missed-call popup stays before it fades on its own. */
const ALERT_MS = 12000;

/**
 * Missed-call popups, stacked in the bottom-right corner of the window.
 *
 * A ring that nobody answers used to leave nothing behind but a line in the footer; the
 * caller never noticed and the callee could not tell whether somebody had tried
 * (user, 2026-09-15). These sit above everything, name the person, and let the caller
 * dial again in one click.
 */
export default function CallAlerts({ alerts, onDismiss, onRetry }: {
  alerts: CallAlert[];
  onDismiss: (id: string) => void;
  onRetry: (alert: CallAlert) => void;
}) {
  return <div className="call-alerts" role="log" aria-live="polite">
    {alerts.map((alert) => <CallAlertCard key={alert.id} alert={alert}
      onDismiss={onDismiss} onRetry={onRetry} />)}
  </div>;
}

function CallAlertCard({ alert, onDismiss, onRetry }: {
  alert: CallAlert;
  onDismiss: (id: string) => void;
  onRetry: (alert: CallAlert) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(alert.id), ALERT_MS);
    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);
  return <section className={`call-alert ${alert.kind}`} role="alert">
    <div className="call-alert-icon"><HangupIcon /></div>
    <div className="call-alert-copy">
      <strong>{alert.title}</strong>
      <small>{alert.detail}</small>
    </div>
    <div className="call-alert-actions">
      <button type="button" className="primary" onClick={() => onRetry(alert)}>
        <PhoneIcon />再拨一次
      </button>
      <button type="button" onClick={() => onDismiss(alert.id)}>知道了</button>
    </div>
  </section>;
}
