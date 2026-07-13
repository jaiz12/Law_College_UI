import { Routes } from '@angular/router';
import { LayoutComponent } from './cms/layout/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./cms/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'user-mangement/create-users',
        loadComponent: () =>
          import('./cms/pages/usermanagement/create-users/create-users.component')
            .then(m => m.CreateUsersComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }];
