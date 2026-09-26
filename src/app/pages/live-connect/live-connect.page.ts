import { UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { DeviceType } from '@dr-odin/web-sdk';
import { DEVICE_OPTIONS, DrOdinService, type LiveReading } from '../../core/services/drodin.service';

@Component({
  selector: 'app-live-connect-page',
  standalone: true,
  imports: [FormsModule, UpperCasePipe],
  templateUrl: './live-connect.page.html',
})
export class LiveConnectPage {
  readonly drodin = inject(DrOdinService);
  readonly deviceOptions = DEVICE_OPTIONS;

  patientName = 'Jane Doe';
  mobile = '9876543210';

  get busy() {
    const p = this.drodin.phase();
    return p === 'initializing' || p === 'connecting' || p === 'measuring';
  }

  onDeviceTypeChange(value: string) {
    this.drodin.setDeviceType(value as DeviceType);
  }

  readingSummary(r: LiveReading): string {
    switch (r.kind) {
      case 'spo2':
        return `${r.data.spo2}% · ${r.data.pulseRate} bpm`;
      case 'bp':
        return `${r.data.systolic}/${r.data.diastolic}`;
      case 'weight':
        return `${r.data.weight} ${r.data.unit}`;
      case 'glucose':
        return `${r.data.glucose} ${r.data.unit}`;
      case 'temperature':
        return `${r.data.temperatureCelsius ?? r.data.temperatureFahrenheit}`;
      case 'fetal':
        return `${r.data.fetalHeartRate} bpm${r.data.toco != null ? ` · TOCO ${r.data.toco}` : ''}`;
    }
  }

  phaseBadgeClass(): string {
    const p = this.drodin.phase();
    if (p === 'measuring' || p === 'connected') return 'online';
    if (p === 'error') return 'error';
    return 'connecting';
  }
}
