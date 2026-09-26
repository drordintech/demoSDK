import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { DeviceStatus } from '../../core/models/device.model';
import { DeviceService } from '../../core/services/device.service';
import { DEVICE_TYPE_LABELS } from '../../core/utils/labels';
import { DeviceCardComponent } from '../../shared/device-card.component';

@Component({
  selector: 'app-devices-page',
  standalone: true,
  imports: [FormsModule, DeviceCardComponent],
  templateUrl: './devices.page.html',
})
export class DevicesPage {
  readonly devices = inject(DeviceService);
  readonly query = signal('');
  readonly statusFilter = signal<'all' | DeviceStatus>('all');
  readonly busyId = signal<string | null>(null);
  readonly filters = ['all', 'online', 'offline', 'maintenance', 'error'] as const;

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    const status = this.statusFilter();
    return this.devices.devices().filter((d) => {
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.ward.toLowerCase().includes(q) ||
        d.serialNumber.toLowerCase().includes(q);
      const matchesStatus = status === 'all' || d.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  typeLabel(type: string) {
    return DEVICE_TYPE_LABELS[type] ?? type;
  }

  async connect(id: string) {
    this.busyId.set(id);
    try {
      await this.devices.connect(id);
    } finally {
      this.busyId.set(null);
    }
  }
}
