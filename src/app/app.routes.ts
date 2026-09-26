import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'live' },
      {
        path: 'live',
        loadComponent: () =>
          import('./pages/live-connect/live-connect.page').then((m) => m.LiveConnectPage),
      },
      {
        path: 'integrate',
        loadComponent: () => import('./pages/integrate/integrate.page').then((m) => m.IntegratePage),
      },
    ],
  },
  { path: '**', redirectTo: 'live' },
];
