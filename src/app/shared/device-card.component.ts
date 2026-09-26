import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MedicalDevice } from '../core/models/device.model';
import { DEVICE_TYPE_LABELS, formatRelativeTime } from '../core/utils/labels';
import { MetricTileComponent, metricsToTiles } from './metric-tile.component';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'app-device-card',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, MetricTileComponent],
  template: `
    <a class="device-card" [routerLink]="['/devices', device.id]">
      <div class="device-card-head">
        <div>
          <p class="device-type">{{ typeLabel }}</p>
          <h3>{{ device.name }}</h3>
        </div>
        <app-status-badge [status]="device.status" />
      </div>
      <div class="device-meta">
        <span>{{ device.ward }}{{ device.bed ? ' · ' + device.bed : '' }}</span>
        <span>Seen {{ seen }}</span>
      </div>
      @if (tiles.length) {
        <div class="device-card-metrics">
          @for (t of tiles; track t.label) {
            <app-metric-tile [label]="t.label" [value]="t.value" [unit]="t.unit || ''" [tone]="t.tone" />
          }
        </div>
      }
      @if (openAlerts > 0) {
        <div class="device-alert-chip">{{ openAlerts }} open alert{{ openAlerts > 1 ? 's' : '' }}</div>
      }
    </a>
  `,
})
export class DeviceCardComponent {
  @Input({ required: true }) device!: MedicalDevice;

  get typeLabel() {
    return DEVICE_TYPE_LABELS[this.device.type] ?? this.device.type;
  }

  get seen() {
    return formatRelativeTime(this.device.lastSeen);
  }

  get tiles() {
    return metricsToTiles(this.device.metrics).slice(0, 3);
  }

  get openAlerts() {
    return this.device.alerts.filter((a) => !a.acknowledged).length;
  }
}
