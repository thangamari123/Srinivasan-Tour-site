import type { Timestamp } from 'firebase/firestore';

export function toDate(ts: Timestamp | null | undefined): Date | null {
  if (!ts || typeof (ts as Timestamp).toDate !== 'function') return null;
  return ts.toDate();
}

export function formatDate(ts: Timestamp | null | undefined, withTime = false): string {
  const d = toDate(ts);
  if (!d) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function timeAgo(ts: Timestamp | null | undefined): string {
  const d = toDate(ts);
  if (!d) return 'just now';
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(ts);
}

export function millis(ts: Timestamp | null | undefined): number {
  return toDate(ts)?.getTime() ?? 0;
}
