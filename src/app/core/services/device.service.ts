import { Injectable, computed, signal } from '@angular/core';
import type { DeviceMetrics, DeviceStatus, MedicalDevice, ScanResult } from '../models/device.model';
import { DISCOVERABLE, SEED_DEVICES } from '../sdk/mock-devices';

function clone<T>(value: T): T {
  return structuredClone(value);
}

function jitter(base: number, range: number, min: number, max: number) {
  const next = base + (Math.random() * range * 2 - range);
  return Math.round(Math.min(max, Math.max(min, next)) * 10) / 10;
}

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly store = signal<MedicalDevice[]>([]);
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  readonly devices = this.store.asReadonly();
  readonly loading = signal(true);
  readonly scanning = signal(false);
  readonly scanResults = signal<ScanResult[]>([]);
  readonly error = signal<string | null>(null);

  readonly onlineCount = computed(() => this.store().filter((d) => d.status === 'online').length);
  readonly alertCount = computed(() =>
    this.store().reduce((n, d) => n + d.alerts.filter((a) => !a.acknowledged).length, 0),
  );

  constructor() {
    void this.init();
  }

  async init(): Promise<void> {
    await this.delay(300);
    if (!this.initialized) {
      this.store.set(SEED_DEVICES.map(clone));
      this.initialized = true;
      this.startPolling();
    }
    this.loading.set(false);
  }

  getDevice(id: string): MedicalDevice | undefined {
    return this.store().find((d) => d.id === id);
  }

  async scan(): Promise<void> {
    this.scanning.set(true);
    this.error.set(null);
    try {
      await this.delay(1800);
      const connected = new Set(this.store().map((d) => d.id));
      console.log('Connected devices:', connected);
      this.scanResults.set(
        DISCOVERABLE.filter((d) => !connected.has(d.id.replace('scan-', 'dev-'))).map(clone),
      );
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      this.scanning.set(false);
    }
  }

  async connect(scanId: string): Promise<void> {
    const found = DISCOVERABLE.find((d) => d.id === scanId);
    if (!found) throw new Error(`Device not found: ${scanId}`);
    await this.delay(900);
    const device: MedicalDevice = {
      id: scanId.replace('scan-', 'dev-'),
      name: found.name,
      type: found.type,
      manufacturer: found.manufacturer,
      model: found.model,
      serialNumber: `${found.manufacturer.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-5)}`,
      status: 'online',
      ward: 'Unassigned',
      firmware: '1.0.0',
      lastSeen: Date.now(),
      connectedAt: Date.now(),
      metrics: { battery: 100 },
      alerts: [],
    };
    this.store.update((prev) => [device, ...prev]);
    this.scanResults.update((prev) => prev.filter((r) => r.id !== scanId));
  }

  async disconnect(deviceId: string): Promise<void> {
    await this.delay(300);
    this.patch(deviceId, { status: 'offline', lastSeen: Date.now() });
  }

  async reconnect(deviceId: string): Promise<void> {
    this.patch(deviceId, { status: 'connecting' });
    await this.delay(700);
    this.store.update((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              status: 'online',
              lastSeen: Date.now(),
              connectedAt: Date.now(),
              alerts: d.alerts.filter((a) => a.severity !== 'critical'),
            }
          : d,
      ),
    );
  }

  acknowledgeAlert(deviceId: string, alertId: string): void {
    this.store.update((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              alerts: d.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
            }
          : d,
      ),
    );
  }

  private patch(id: string, partial: Partial<MedicalDevice>) {
    this.store.update((prev) => prev.map((d) => (d.id === id ? { ...d, ...partial } : d)));
  }

  private startPolling() {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => this.tick(), 2000);
  }

  private tick() {
    this.store.update((prev) =>
      prev.map((d) => {
        if (d.status !== 'online') return d;
        return { ...d, metrics: this.nextMetrics(d.metrics), lastSeen: Date.now() };
      }),
    );
  }

  private nextMetrics(m: DeviceMetrics): DeviceMetrics {
    const next = { ...m };
    if (next.heartRate != null) next.heartRate = Math.round(jitter(next.heartRate || 75, 3, 55, 140));
    if (next.spo2 != null) next.spo2 = Math.round(jitter(next.spo2 || 97, 1.2, 88, 100));
    if (next.systolic != null) next.systolic = Math.round(jitter(next.systolic || 120, 4, 90, 180));
    if (next.diastolic != null) next.diastolic = Math.round(jitter(next.diastolic || 80, 3, 50, 110));
    if (next.respiratoryRate != null)
      next.respiratoryRate = Math.round(jitter(next.respiratoryRate || 16, 1.5, 8, 30));
    if (next.temperature != null) next.temperature = jitter(next.temperature || 36.6, 0.08, 35.5, 39.5);
    if (next.infusionRate != null) next.infusionRate = Math.round(jitter(next.infusionRate || 40, 1, 5, 120));
    if (next.tidalVolume != null) next.tidalVolume = Math.round(jitter(next.tidalVolume || 480, 8, 300, 700));
    if (next.battery != null) next.battery = Math.max(0, next.battery - (Math.random() < 0.15 ? 1 : 0));
    return next;
  }

  private delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export type { DeviceStatus };
