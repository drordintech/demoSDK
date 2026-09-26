import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DeviceService } from '../../core/services/device.service';
import { DEVICE_TYPE_LABELS, formatRelativeTime } from '../../core/utils/labels';
import { DeviceCardComponent } from '../../shared/device-card.component';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [RouterLink, DeviceCardComponent],
  templateUrl: './overview.page.html',
})
export class OverviewPage {
  readonly devices = inject(DeviceService);

  readonly online = computed(() => this.devices.devices().filter((d) => d.status === 'online').length);
  readonly offline = computed(() => this.devices.devices().filter((d) => d.status === 'offline').length);
  readonly maintenance = computed(
    () => this.devices.devices().filter((d) => d.status === 'maintenance').length,
  );
  readonly alerts = computed(() =>
    this.devices.devices().flatMap((d) =>
      d.alerts.filter((a) => !a.acknowledged).map((a) => ({ ...a, deviceName: d.name, deviceId: d.id })),
    ),
  );
  readonly wards = computed(() => [...new Set(this.devices.devices().map((d) => d.ward))]);
  readonly types = computed(() =>
    [...new Set(this.devices.devices().map((d) => DEVICE_TYPE_LABELS[d.type] ?? d.type))].join(' · '),
  );

  wardCount(ward: string) {
    return this.devices.devices().filter((d) => d.ward === ward).length;
  }

  rel(ts: number) {
    return formatRelativeTime(ts);
  }
}
