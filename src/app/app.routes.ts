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
        path: 'under-construction',
        loadComponent: () =>
          import('./cms/shared/under-construction/under-construction.component')
            .then(m => m.UnderConstructionComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./cms/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      // usermanagement
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
      // about
      {
        path: 'about/general-overview',
        loadComponent: () =>
          import('./cms/pages/about-us/general-overview/general-overview.component')
            .then(m => m.GeneralOverviewComponent)
      },
      {
        path: 'about/vision-mission',
        loadComponent: () =>
          import('./cms/pages/about-us/vision-and-mission/vision-and-mission.component')
            .then(m => m.VisionAndMissionComponent)
      },
      {
        path: 'about/principal-message',
        loadComponent: () =>
          import('./cms/pages/about-us/principals-message/principals-message.component')
            .then(m => m.PrincipalsMessageComponent)
      },
      {
        path: 'about/governing-body',
        loadComponent: () =>
          import('./cms/pages/about-us/governing-body/governing-body.component')
            .then(m => m.GoverningBodyComponent)
      },
      {
        path: 'about/organization-structure',
        loadComponent: () =>
          import('./cms/pages/about-us/organizational-structure/organizational-structure.component')
            .then(m => m.OrganizationalStructureComponent)
      },
      {
        path: 'about/recognitions-and-affiliations',
        loadComponent: () =>
          import('./cms/pages/about-us/recognitions-and-affiliations/recognitions-and-affiliations.component')
            .then(m => m.RecognitionsAndAffiliationsComponent)
      },

      //academics
      {
        path: 'academics/program-curriculum',
        loadComponent: () =>
          import('./cms/pages/academics/program-and-curriculum/program-and-curriculum.component')
            .then(m => m.ProgramAndCurriculumComponent)
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
