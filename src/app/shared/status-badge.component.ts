import { Component, Input } from '@angular/core';
import type { DeviceStatus } from '../core/models/device.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge status-{{ status }}">{{ status }}</span>`,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: DeviceStatus;
}
