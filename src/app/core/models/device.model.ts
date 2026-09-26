export type DeviceStatus = 'online' | 'offline' | 'connecting' | 'error' | 'maintenance';
export type DeviceType =
  | 'patient_monitor'
  | 'infusion_pump'
  | 'ventilator'
  | 'ecg'
  | 'pulse_oximeter'
  | 'blood_pressure'
  | 'defibrillator';

export interface DeviceMetrics {
  heartRate?: number;
  spo2?: number;
  systolic?: number;
  diastolic?: number;
  respiratoryRate?: number;
  temperature?: number;
  infusionRate?: number;
  tidalVolume?: number;
  battery?: number;
}

export interface DeviceAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface MedicalDevice {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: DeviceStatus;
  ward: string;
  bed?: string;
  firmware: string;
  lastSeen: number;
  connectedAt?: number;
  metrics: DeviceMetrics;
  alerts: DeviceAlert[];
}

export interface ScanResult {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  signalStrength: number;
  protocol: 'BLE' | 'Wi-Fi' | 'USB' | 'HL7' | 'FHIR';
}
