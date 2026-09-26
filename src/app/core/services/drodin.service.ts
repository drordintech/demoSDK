import { Injectable, computed, signal } from '@angular/core';
import {
  DrOdinSDK,
  type BPReading,
  type DeviceType,
  type FetalReading,
  type GlucoseReading,
  type InitializeResult,
  type SessionInfo,
  type Spo2Reading,
  type TemperatureReading,
  type WeightReading,
} from '@dr-odin/web-sdk';
import { environment } from '../../../environments/environment';

export type ConnectionPhase =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'session'
  | 'connecting'
  | 'connected'
  | 'measuring'
  | 'error';

export type LiveReading =
  | { kind: 'spo2'; data: Spo2Reading }
  | { kind: 'bp'; data: BPReading }
  | { kind: 'weight'; data: WeightReading }
  | { kind: 'temperature'; data: TemperatureReading }
  | { kind: 'glucose'; data: GlucoseReading }
  | { kind: 'fetal'; data: FetalReading };

export const DEVICE_OPTIONS: { value: DeviceType; label: string }[] = [
  { value: 'bp_monitor', label: 'Blood Pressure Monitor' },
  { value: 'weight_scale', label: 'Weight Scale' },
  { value: 'digital_thermometer', label: 'Digital Thermometer' },
  { value: 'infrared_thermometer', label: 'Infrared Thermometer' },
  { value: 'wearable_thermometer', label: 'Wearable Thermometer' },
  { value: 'glucometer', label: 'Glucometer' },
  { value: 'fetal_doppler', label: 'Fetal Doppler' },
  { value: 'pulse_oximeter', label: 'Pulse Oximeter' },
];

@Injectable({ providedIn: 'root' })
export class DrOdinService {
  private sdk: DrOdinSDK | null = null;
  private deviceTypeValue: DeviceType = 'bp_monitor';

  readonly phase = signal<ConnectionPhase>('idle');
  readonly error = signal<string | null>(null);
  readonly logs = signal<string[]>([]);
  readonly initResult = signal<InitializeResult | null>(null);
  readonly session = signal<SessionInfo | null>(null);
  readonly deviceType = signal<DeviceType>('bp_monitor');
  readonly deviceName = signal<string | null>(null);
  readonly latestReading = signal<LiveReading | null>(null);
  readonly readings = signal<LiveReading[]>([]);
  readonly bleSupported = signal(
    typeof navigator !== 'undefined' && Boolean((navigator as Navigator & { bluetooth?: unknown }).bluetooth),
  );

  readonly gatewayUrl = environment.drodinGateway;
  /** Shown in UI — the real Docker gateway */
  readonly apiUrl = environment.drodinGateway;
  readonly apiKeyConfigured = Boolean(
    environment.drodinApiKey && !environment.drodinApiKey.includes('your_api_key'),
  );

  readonly liveActive = computed(() => {
    const p = this.phase();
    return p === 'connected' || p === 'measuring';
  });

  setDeviceType(type: DeviceType) {
    this.deviceTypeValue = type;
    this.deviceType.set(type);
  }

  private log(line: string) {
    this.logs.update((prev) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev].slice(0, 40));
  }

  private ensureSdk(): DrOdinSDK {
    if (!this.apiKeyConfigured) {
      throw new Error('Set DRODIN_API_KEY in .env, then restart npm run dev');
    }
    // Same-origin → Angular proxy → gateway (avoids browser CORS)
    const baseUrl =
      environment.drodinApiUrl ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5180');

    if (!this.sdk) {
      this.sdk = new DrOdinSDK({
        apiKey: environment.drodinApiKey,
        baseUrl,
        deviceType: this.deviceTypeValue,
        autoReconnect: true,
      });

      this.sdk.onSpo2((data) => this.pushReading({ kind: 'spo2', data }, `SpO₂ ${data.spo2}% · PR ${data.pulseRate}`));
      this.sdk.onBP((data) =>
        this.pushReading({ kind: 'bp', data }, `BP ${data.systolic}/${data.diastolic} · pulse ${data.pulse}`),
      );
      this.sdk.onWeight((data) =>
        this.pushReading({ kind: 'weight', data }, `Weight ${data.weight} ${data.unit}`),
      );
      this.sdk.onTemperature((data) => {
        const value =
          data.temperatureCelsius ??
          (data.temperatureFahrenheit != null
            ? (((data.temperatureFahrenheit - 32) * 5) / 9).toFixed(1)
            : '—');
        this.pushReading({ kind: 'temperature', data }, `Temp ${value} °C`);
      });
      this.sdk.onGlucose((data) =>
        this.pushReading({ kind: 'glucose', data }, `Glucose ${data.glucose} ${data.unit}`),
      );
      this.sdk.onFetal((data) =>
        this.pushReading(
          { kind: 'fetal', data },
          `Fetal HR ${data.fetalHeartRate}${data.toco != null ? ` · TOCO ${data.toco}` : ''}`,
        ),
      );
      this.sdk.onDisconnect((event) => {
        this.phase.update((p) => (p === 'idle' || p === 'ready' || p === 'session' ? p : 'session'));
        this.deviceName.set(null);
        this.log(`Disconnected (${event.reason})`);
      });
      this.sdk.onError((err) => {
        this.error.set(err.message);
        this.log(`Error: ${err.message}`);
      });
      this.sdk.onSessionStart((info) => {
        this.session.set(info);
        this.log(`Session started ${info.sessionId}`);
      });
      this.sdk.onSessionEnd((info) => {
        this.session.set(null);
        this.log(`Session ended ${info.sessionId}`);
      });
    }
    return this.sdk;
  }

  private pushReading(reading: LiveReading, message: string) {
    this.latestReading.set(reading);
    this.readings.update((prev) => [reading, ...prev].slice(0, 30));
    this.log(message);
  }

  async initialize(): Promise<void> {
    this.error.set(null);
    this.sdk = null; // recreate with current proxy/base URL
    this.phase.set('initializing');
    try {
      const sdk = this.ensureSdk();
      this.log(`initialize() → ${environment.drodinGateway} (via proxy)`);
      const result = await sdk.initialize();
      this.initResult.set(result);
      this.phase.set('ready');
      const allowed =
        result.partner?.allowedDevices?.join(', ') ||
        result.allowedDevices?.join(', ') ||
        'all configured';
      this.log(`Initialized · partner ${result.partner?.companyName ?? 'ok'} · devices: ${allowed}`);
    } catch (err) {
      this.phase.set('error');
      this.sdk = null;
      const raw = err instanceof Error ? err.message : 'Initialize failed';
      const message =
        raw === 'Network Error'
          ? `Network Error — proxy cannot reach ${environment.drodinGateway}. Confirm Docker is up and proxy.conf.json target is correct.`
          : raw;
      this.error.set(message);
      this.log(`initialize failed: ${message}`);
    }
  }

  async startSession(payload: { patientName: string; mobile: string }): Promise<void> {
    this.error.set(null);
    try {
      const sdk = this.ensureSdk();
      this.log(`startSession(${payload.patientName}, ${payload.mobile})`);
      const info = await sdk.startSession({ ...payload, deviceType: this.deviceTypeValue });
      this.session.set(info);
      this.phase.set('session');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'startSession failed';
      this.error.set(message);
      this.log(`startSession failed: ${message}`);
    }
  }

  async connect(): Promise<void> {
    this.error.set(null);
    this.phase.set('connecting');
    try {
      const sdk = this.ensureSdk();
      this.log(`connect(${this.deviceTypeValue}) — pick device in Chrome BLE dialog`);
      const result = await sdk.connect({ deviceType: this.deviceTypeValue });
      this.deviceName.set(result.device.name ?? result.device.id);
      this.phase.set('connected');
      this.log(`Connected · ${result.device.name ?? result.device.id}`);
    } catch (err) {
      this.phase.set('session');
      const message = err instanceof Error ? err.message : 'connect failed';
      this.error.set(message);
      this.log(`connect failed: ${message}`);
    }
  }

  async startMeasurement(): Promise<void> {
    this.error.set(null);
    try {
      const sdk = this.ensureSdk();
      this.log('startMeasurement()');
      await sdk.startMeasurement();
      this.phase.set('measuring');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'startMeasurement failed';
      this.error.set(message);
      this.log(`startMeasurement failed: ${message}`);
    }
  }

  async stopMeasurement(): Promise<void> {
    try {
      await this.ensureSdk().stopMeasurement();
      this.phase.set('connected');
      this.log('stopMeasurement()');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'stopMeasurement failed');
    }
  }

  async disconnect(): Promise<void> {
    try {
      const sdk = this.ensureSdk();
      await sdk.disconnect();
      this.deviceName.set(null);
      this.phase.set(this.session() || sdk.hasActiveSession() ? 'session' : 'ready');
      this.log('disconnect()');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'disconnect failed');
    }
  }

  async endSession(): Promise<void> {
    try {
      await this.ensureSdk().endSession();
      this.session.set(null);
      this.deviceName.set(null);
      this.phase.set('ready');
      this.log('endSession()');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'endSession failed');
    }
  }
}
