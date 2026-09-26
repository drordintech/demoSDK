import { Component, inject, signal } from '@angular/core';
import { DrOdinService } from '../../core/services/drodin.service';

@Component({
  selector: 'app-integrate-page',
  standalone: true,
  templateUrl: './integrate.page.html',
})
export class IntegratePage {
  readonly drodin = inject(DrOdinService);
  readonly copied = signal<string | null>(null);

  readonly snippets = [
    {
      id: 'install',
      title: 'Install (partner project)',
      code: `npm install file:./web-sdk
# or: npm install ./dr-odin-web-sdk-1.0.0.tgz`,
    },
    {
      id: 'env',
      title: 'Environment + gateway',
      code: `# .env — restart npm run dev after edits
DRODIN_API_KEY=drod_...
DRODIN_GATEWAY=https://api.drodin.in`,
    },
    {
      id: 'init',
      title: 'Initialize + session + connect',
      code: `import { DrOdinSDK } from '@dr-odin/web-sdk';

const sdk = new DrOdinSDK({
  apiKey: environment.drodinApiKey,
  baseUrl: environment.drodinApiUrl,
  deviceType: 'bp_monitor',
});

await sdk.initialize();
await sdk.startSession({ patientName: 'Jane Doe', mobile: '9876543210' });
await sdk.connect();
await sdk.startMeasurement();`,
    },
  ];

  async copy(id: string, code: string) {
    await navigator.clipboard.writeText(code);
    this.copied.set(id);
    setTimeout(() => this.copied.set(null), 1400);
  }
}
