import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DeviceService } from '../../core/services/device.service';
import { DEVICE_TYPE_LABELS, formatClock, formatRelativeTime } from '../../core/utils/labels';
import { MetricTileComponent, metricsToTiles } from '../../shared/metric-tile.component';
import { SparklineComponent } from '../../shared/sparkline.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, MetricTileComponent, SparklineComponent],
  templateUrl: './device-detail.page.html',
})
export class DeviceDetailPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  readonly devices = inject(DeviceService);

  readonly id = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly device = computed(() => this.devices.getDevice(this.id()));
  readonly tiles = computed(() => {
    const d = this.device();
    return d ? metricsToTiles(d.metrics) : [];
  });

  readonly hrHistory = signal<number[]>([]);
  readonly spo2History = signal<number[]>([]);
  busy = false;

  private readonly historyEffect = effect(() => {
    const d = this.device();
    if (!d || d.status !== 'online') return;
    if (d.metrics.heartRate != null) {
      this.hrHistory.update((prev) => [...prev.slice(-39), d.metrics.heartRate!]);
    }
    if (d.metrics.spo2 != null) {
      this.spo2History.update((prev) => [...prev.slice(-39), d.metrics.spo2!]);
    }
  });

  ngOnDestroy(): void {
    this.historyEffect.destroy();
  }

  typeLabel(type: string) {
    return DEVICE_TYPE_LABELS[type] ?? type;
  }

  rel(ts: number) {
    return formatRelativeTime(ts);
  }

  clock(ts: number) {
    return formatClock(ts);
  }

  async toggle() {
    const d = this.device();
    if (!d) return;
    this.busy = true;
    try {
      if (d.status === 'online') await this.devices.disconnect(d.id);
      else await this.devices.reconnect(d.id);
    } finally {
      this.busy = false;
    }
  }
}
