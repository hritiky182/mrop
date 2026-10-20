import { format, parseISO, isValid } from 'date-fns';

/**
 * Format currency amount with AUD prefix
 */
export function formatCurrency(amount: number, compact: boolean = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}k`;
    }
  }
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format numbers with thousands separators
 */
export function formatNumber(val: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

/**
 * Format percentage with sign option
 */
export function formatPercent(val: number, decimals: number = 1, showSign: boolean = false): string {
  const formatted = val.toFixed(decimals) + '%';
  if (showSign && val > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/**
 * Format ISO date string into readable mining standard format: 14 Oct 2026
 */
export function formatDate(dateStr: string | undefined | null, formatStr: string = 'dd MMM yyyy'): string {
  if (!dateStr) return '—';
  try {
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return dateStr;
    return format(parsed, formatStr);
  } catch {
    return dateStr;
  }
}

/**
 * Format gold ounces
 */
export function formatGoldOz(oz: number): string {
  return `${formatNumber(oz, 0)} oz`;
}

/**
 * Format ore tonnage
 */
export function formatTonnes(tonnes: number): string {
  return `${formatNumber(tonnes, 0)} t`;
}

/**
 * Format gold grade in grams per tonne
 */
export function formatGrade(gradeGpt: number): string {
  return `${gradeGpt.toFixed(2)} g/t Au`;
}
