export interface DrOdinSDKOptions {
  /** Partner API key (drod_...) */
  apiKey: string;
  /** Gateway or parser base URL (default: http://localhost:8080) */
  baseUrl?: string;
  /** Pre-select device type for scan/connect */
  deviceType?: DeviceType;
  /** Auto-reconnect after unexpected disconnect (default: true) */
  autoReconnect?: boolean;
  /** Reconnect backoff settings */
  reconnect?: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  };
}

export type DeviceType =
  | 'weight_scale'
  | 'bp_monitor'
  | 'pulse_oximeter'
  | 'digital_thermometer'
  | 'infrared_thermometer'
  | 'wearable_thermometer'
  | 'glucometer'
  | 'fetal_doppler';

export interface WeightReading {
  weight: number;
  unit: string;
  timestamp?: string;
}

export interface BPReading {
  systolic: number;
  diastolic: number;
  pulse: number;
  unit?: string;
  timestamp?: string;
}

export interface Spo2Reading {
  spo2: number;
  pulseRate: number;
  pi?: number;
  rr?: number;
  timestamp?: string;
}

export interface FetalReading {
  fetalHeartRate: number;
  toco?: number;
  volume?: number;
  batteryPercent?: number;
  signalLocked?: boolean;
  movement?: number;
  movementCount?: number;
  unit?: string;
  timestamp?: string;
}

export interface TemperatureReading {
  temperatureCelsius?: number;
  temperatureFahrenheit?: number;
  unit?: string;
  timestamp?: string;
}

export interface GlucoseReading {
  glucose: number;
  unit: string;
  timestamp?: string;
}

export interface DisconnectEvent {
  reason: 'manual' | 'gatt_disconnected';
  deviceName?: string;
}

export interface SessionInfo {
  sessionId: string;
  patientName: string;
  mobile: string;
  deviceType?: string;
  status: 'active' | 'ended';
  startedAt?: string;
  endedAt?: string | null;
}

export interface StartSessionPayload {
  patientName: string;
  mobile: string;
  deviceType?: DeviceType;
}

export interface InitializeResult {
  success?: boolean;
  /** Always true — BLE requires startSession with patient name and mobile */
  sessionRequired?: boolean;
  partner?: {
    companyName?: string;
    allowedDevices?: DeviceType[];
    dailyLimit?: number;
  };
  deviceProfiles?: object[];
  allowedDevices?: DeviceType[];
}

export declare class DrOdinSDK {
  constructor(options: DrOdinSDKOptions);

  initialize(): Promise<InitializeResult>;
  startSession(payload: StartSessionPayload): Promise<SessionInfo>;
  getSession(): SessionInfo | null;
  hasActiveSession(): boolean;
  endSession(): Promise<SessionInfo>;
  scan(deviceType?: DeviceType): Promise<{ device: BluetoothDevice; profile: object }>;
  connect(options?: {
    deviceType?: DeviceType;
    device?: BluetoothDevice;
    profile?: object;
  }): Promise<{ device: BluetoothDevice; profile: object; server: BluetoothRemoteGATTServer }>;
  disconnect(): Promise<void>;
  startMeasurement(): Promise<void>;
  stopMeasurement(): Promise<void>;

  /** @param {(info: SessionInfo) => void} callback */
  onSessionStart(callback: (info: SessionInfo) => void): this;
  /** @param {(info: SessionInfo) => void} callback */
  onSessionEnd(callback: (info: SessionInfo) => void): this;

  onWeight(callback: (data: WeightReading) => void): this;
  onBP(callback: (data: BPReading) => void): this;
  onSpo2(callback: (data: Spo2Reading) => void): this;
  onFetal(callback: (data: FetalReading) => void): this;
  onTemperature(callback: (data: TemperatureReading) => void): this;
  onGlucose(callback: (data: GlucoseReading) => void): this;
  onDisconnect(callback: (event: DisconnectEvent) => void): this;
  onError(callback: (error: Error) => void): this;

  on(event: string, callback: (...args: unknown[]) => void): this;
  off(event: string, callback: (...args: unknown[]) => void): this;
}

export default DrOdinSDK;
