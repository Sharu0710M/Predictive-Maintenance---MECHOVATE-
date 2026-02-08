
export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum AssetType {
  PUMP = 'Centrifugal Pump',
  TURBINE = 'Gas Turbine',
  MOTOR = 'Induction Motor'
}

export interface SensorData {
  temperature: number; // Celsius
  vibration: number; // mm/s
  current: number; // Amperes
  timestamp: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  imageUrl: string;
  criticality: number; // 1 to 10
  operatingLoad: number; // %
  baseHourlyDowntimeCost: number; // USD
  sensors: SensorData[];
  predictedRUL: number; // Days
  healthScore: number; // 0 to 100: Overall mechanical health
  priorityScore: number; // 0 to 100: Calculated maintenance urgency
  isMaintenanceScheduled?: boolean; // New: Tracks if maintenance is active
}

export interface AIInsight {
  reasoning: string;
  recommendation: string;
  rootCauseContribution: {
    temperature: number;
    vibration: number;
    current: number;
  };
}
