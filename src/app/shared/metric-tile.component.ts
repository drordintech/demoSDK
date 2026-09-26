import { Component, Input } from '@angular/core';
import type { DeviceMetrics } from '../core/models/device.model';

export interface MetricTileModel {
  label: string;
  value: string | number;
  unit?: string;
  tone?: 'default' | 'warn' | 'critical' | 'ok';
}

export function metricsToTiles(metrics: DeviceMetrics): MetricTileModel[] {
  const tiles: MetricTileModel[] = [];
  if (metrics.heartRate != null)
    tiles.push({
      label: 'Heart Rate',
      value: metrics.heartRate || '—',
      unit: 'bpm',
      tone: metrics.heartRate > 120 || metrics.heartRate < 50 ? 'critical' : 'ok',
    });
  if (metrics.spo2 != null)
    tiles.push({
      label: 'SpO₂',
      value: metrics.spo2 || '—',
      unit: '%',
      tone: metrics.spo2 < 92 ? 'critical' : metrics.spo2 < 95 ? 'warn' : 'ok',
    });
  if (metrics.systolic != null && metrics.diastolic != null)
    tiles.push({
      label: 'Blood Pressure',
      value: `${metrics.systolic}/${metrics.diastolic}`,
      unit: 'mmHg',
      tone: metrics.systolic > 140 ? 'warn' : 'default',
    });
  if (metrics.respiratoryRate != null)
    tiles.push({ label: 'Resp. Rate', value: metrics.respiratoryRate, unit: '/min' });
  if (metrics.temperature != null)
    tiles.push({
      label: 'Temperature',
      value: metrics.temperature.toFixed(1),
      unit: '°C',
      tone: metrics.temperature >= 38 ? 'warn' : 'default',
    });
  if (metrics.infusionRate != null)
    tiles.push({ label: 'Infusion Rate', value: metrics.infusionRate, unit: 'mL/h' });
  if (metrics.tidalVolume != null)
    tiles.push({ label: 'Tidal Volume', value: metrics.tidalVolume, unit: 'mL' });
  if (metrics.battery != null)
    tiles.push({
      label: 'Battery',
      value: metrics.battery,
      unit: '%',
      tone: metrics.battery < 20 ? 'critical' : metrics.battery < 40 ? 'warn' : 'default',
    });
  return tiles;
}

@Component({
  selector: 'app-metric-tile',
  standalone: true,
  template: `
    <div class="metric-tile tone-{{ tone }}">
      <div class="metric-tile-top">
        <span class="metric-label">{{ label }}</span>
      </div>
      <div class="metric-value">
        {{ value }}
        @if (unit) {
          <span class="metric-unit">{{ unit }}</span>
        }
      </div>
    </div>
  `,
})
export class MetricTileComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() unit = '';
  @Input() tone: MetricTileModel['tone'] = 'default';
}
