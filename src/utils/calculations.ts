import { OperationalRisk, SparePart } from '@/types';

/**
 * Calculate variance percentage between actual and planned values.
 * Returns percentage (e.g., -4.5 for a 4.5% shortfall).
 * Handles zero denominator safely.
 */
export function calculateVariancePct(actual: number, planned: number): number {
  if (planned === 0) {
    return actual === 0 ? 0 : 100;
  }
  return ((actual - planned) / Math.abs(planned)) * 100;
}

/**
 * Automatically determine spare part stock status from available quantity and minimum stock level
 */
export function calculateStockStatus(availableQty: number, minimumStockLevel: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (availableQty <= 0) {
    return 'Out of Stock';
  }
  if (availableQty <= minimumStockLevel) {
    return 'Low Stock';
  }
  return 'In Stock';
}

/**
 * Determine operational risk score (0-100) based on active vulnerabilities
 */
export function calculateRiskScore(risks: OperationalRisk[]): {
  score: number;
  criticalCount: number;
  level: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
} {
  let score = 25; // baseline operation risk
  let criticalCount = 0;

  for (const risk of risks) {
    if (risk.currentStatus === 'Resolved') continue;

    const multiplier = risk.currentStatus === 'Unmitigated' ? 1.0 : 0.6;
    if (risk.severity === 'Critical') {
      score += 18 * multiplier;
      criticalCount++;
    } else if (risk.severity === 'High') {
      score += 10 * multiplier;
    } else if (risk.severity === 'Medium') {
      score += 5 * multiplier;
    } else {
      score += 2 * multiplier;
    }
  }

  const boundedScore = Math.min(100, Math.round(score));
  let level: 'Low' | 'Moderate' | 'Elevated' | 'Critical' = 'Low';
  if (boundedScore >= 75) level = 'Critical';
  else if (boundedScore >= 55) level = 'Elevated';
  else if (boundedScore >= 35) level = 'Moderate';

  return { score: boundedScore, criticalCount, level };
}

/**
 * Enrich spare parts list with dynamic stock status
 */
export function enrichSparePart(part: SparePart): SparePart {
  return {
    ...part,
    stockStatus: calculateStockStatus(part.availableQuantity, part.minimumStockLevel),
  };
}
