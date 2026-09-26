export const DEVICE_TYPE_LABELS: Record<string, string> = {
  patient_monitor: 'Patient Monitor',
  infusion_pump: 'Infusion Pump',
  ventilator: 'Ventilator',
  ecg: 'ECG',
  pulse_oximeter: 'Pulse Oximeter',
  blood_pressure: 'Blood Pressure',
  defibrillator: 'Defibrillator',
};

export function formatRelativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
