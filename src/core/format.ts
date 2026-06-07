/** Formatting helpers shared across the UI. */

export function formatCurrency(value: number, withCents = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/** Turns a month count into a human phrase, e.g. "2 yrs 3 mos". */
export function formatDuration(months: number): string {
  if (months <= 0) return '0 mos';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (rem > 0) parts.push(`${rem} mo${rem > 1 ? 's' : ''}`);
  return parts.join(' ');
}

export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
