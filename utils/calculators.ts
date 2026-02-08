
import { Asset, PriorityLevel } from '../types';

export const calculatePriorityLevel = (score: number): PriorityLevel => {
  if (score >= 70) return PriorityLevel.HIGH;
  if (score >= 40) return PriorityLevel.MEDIUM;
  return PriorityLevel.LOW;
};

export const calculateFinancialRisk = (asset: Asset): number => {
  // Risk increases exponentially as RUL approaches 0
  const riskMultiplier = Math.max(1, (30 / Math.max(asset.predictedRUL, 0.5)));
  const baseLoss = asset.baseHourlyDowntimeCost * 8; // Assuming 8-hour shift for repair
  return Math.round(baseLoss * riskMultiplier);
};

export const calculateHealthScore = (asset: Asset): number => {
  const latest = asset.sensors[asset.sensors.length - 1];
  
  // 1. RUL Factor (40% of health)
  // Optimal health if RUL > 60 days
  const rulFactor = Math.min(100, (asset.predictedRUL / 60) * 100);

  // 2. Vibration Factor (30% of health)
  // Severity increases significantly above 4.5mm/s, critical at 8mm/s
  const vibFactor = Math.max(0, 100 - (latest.vibration > 2 ? (latest.vibration - 2) * 20 : 0));

  // 3. Temperature Factor (30% of health)
  // Industrial standard usually caps at 85C for continuous duty
  const tempFactor = Math.max(0, 100 - (latest.temperature > 50 ? (latest.temperature - 50) * 3 : 0));

  const weightedHealth = (rulFactor * 0.4) + (vibFactor * 0.3) + (tempFactor * 0.3);
  return Math.round(Math.min(100, Math.max(0, weightedHealth)));
};

export const calculateMaintenancePriorityScore = (asset: Asset): number => {
  // Weights for priority (High priority = High maintenance urgency)
  const HEALTH_DEFICIT_WEIGHT = 0.5; // (100 - health)
  const CRITICALITY_WEIGHT = 0.3;
  const LOAD_WEIGHT = 0.2;

  // Normalized values (0-100)
  const healthDeficit = 100 - asset.healthScore;
  const criticalityFactor = (asset.criticality / 10) * 100;
  const loadFactor = asset.operatingLoad;

  const score = (healthDeficit * HEALTH_DEFICIT_WEIGHT) + 
                (criticalityFactor * CRITICALITY_WEIGHT) + 
                (loadFactor * LOAD_WEIGHT);

  return Math.round(Math.min(100, score));
};
