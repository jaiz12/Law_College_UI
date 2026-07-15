import { Routes } from '@angular/router';
import { LayoutComponent } from './cms/layout/layout/layout.component';
import { LoginComponent } from './cms/pages/login/login.component';
import { authGuard } from './services/auth.guard';
import { ResetPasswordComponent } from './cms/pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './cms/pages/forgot-password/forgot-password.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  }, 
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./cms/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'user-mangement/manager-user',
        loadComponent: () =>
          import('./cms/pages/usermanagement/user-manager/user-manager.component')
            .then(m => m.UserManagerComponent)
      },
      {
      path: 'user-mangement/manage-role',
      loadComponent: () =>
        import('./cms/pages/usermanagement/role-manager/role-manager.component')
          .then(m => m.RoleManagerComponent)
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
    redirectTo: ''
  }];
