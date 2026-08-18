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
      // home
      {
        path: 'home/why-choose-us',
        loadComponent: () =>
          import('./cms/pages/home/why-choose-us/why-choose-us.component')
            .then(m => m.WhyChooseUsComponent)
      },
      {
        path: 'home/statistics',
        loadComponent: () =>
          import('./cms/pages/home/statistics/statistics.component')
            .then(m => m.StatisticsComponent)
      },
      // about us
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
        path: 'about/faculty',
        loadComponent: () =>
          import('./cms/pages/about-us/faculty/faculty.component')
            .then(m => m.FacultyComponent)
      },
      {
        path: 'about/administrative-staff',
        loadComponent: () =>
          import('./cms/pages/about-us/administrative-staff/administrative-staff.component')
            .then(m => m.AdministrativeStaffComponent)
      },
      {
        path: 'about/infrastructure',
        loadComponent: () =>
          import('./cms/pages/about-us/infrastructure/infrastructure.component')
            .then(m => m.InfrastructureComponent)
      },
      {
        path: 'about/recognitions-and-affiliations',
        loadComponent: () =>
          import('./cms/pages/about-us/recognitions-and-affiliations/recognitions-and-affiliations.component')
            .then(m => m.RecognitionsAndAffiliationsComponent)
      },
      {
        path: 'about/statutory-bodies',
        loadComponent: () =>
          import('./cms/pages/about-us/statutory-bodies/statutory-bodies.component')
            .then(m => m.StatutoryBodiesComponent)
      },

      // ===========================
      // Academics
      // ===========================

      {
        path: 'academics/our-program',
        loadComponent: () =>
          import('./cms/pages/academics/our-program/our-program.component')
            .then(m => m.OurProgramComponent)
      },
      {
        path: 'academics/syllabus',
        loadComponent: () =>
          import('./cms/pages/academics/syllabus/syllabus.component')
            .then(m => m.SyllabusComponent)
      },
      {
        path: 'academics/academic-calendar',
        loadComponent: () =>
          import('./cms/pages/academics/academic-calendar/academic-calendar.component')
            .then(m => m.AcademicCalendarComponent)
      },
      {
        path: 'academics/research-and-publications',
        loadComponent: () =>
          import('./cms/pages/academics/research-and-publications/research-and-publications.component')
            .then(m => m.ResearchAndPublicationsComponent)
      },
      {
        path: 'academics/academic-policies',
        loadComponent: () =>
          import('./cms/pages/academics/academic-policies/academic-policies.component')
            .then(m => m.AcademicPoliciesComponent)
      },

      // ===========================
      // Admissions
      // ===========================

      {
        path: 'admissions/eligibility-admission-process-and-intake',
        loadComponent: () =>
          import('./cms/pages/admissions/eligibility-admission-process-and-intake/eligibility-admission-process-and-intake.component')
            .then(m => m.EligibilityAdmissionProcessAndIntakeComponent)
      },
      {
        path: 'admissions/reservation-policy',
        loadComponent: () =>
          import('./cms/pages/admissions/reservation-policy/reservation-policy.component')
            .then(m => m.ReservationPolicyComponent)
      },
      {
        path: 'admissions/fee-structure',
        loadComponent: () =>
          import('./cms/pages/admissions/fee-structure/fee-structure.component')
            .then(m => m.FeeStructureComponent)
      },
      {
        path: 'admissions/prospectus',
        loadComponent: () =>
          import('./cms/pages/admissions/prospectus/prospectus.component')
            .then(m => m.ProspectusComponent)
      },
      {
        path: 'admissions/online-application',
        loadComponent: () =>
          import('./cms/pages/admissions/online-application/online-application.component')
            .then(m => m.OnlineApplicationComponent)
      },
      {
        path: 'admissions/contact-admission-office',
        loadComponent: () =>
          import('./cms/pages/admissions/contact-admission-office/contact-admission-office.component')
            .then(m => m.ContactAdmissionOfficeComponent)
      },

      // ===========================
      // Examinations
      // ===========================

      {
        path: 'examinations/notifications',
        loadComponent: () =>
          import('./cms/pages/examinations/notifications/notifications.component')
            .then(m => m.NotificationsComponent)
      },
      {
        path: 'examinations/exam-schedules',
        loadComponent: () =>
          import('./cms/pages/examinations/exam-schedules/exam-schedules.component')
            .then(m => m.ExamSchedulesComponent)
      },
      {
        path: 'examinations/results',
        loadComponent: () =>
          import('./cms/pages/examinations/results/results.component')
            .then(m => m.ResultsComponent)
      },
      {
        path: 'examinations/student-achievers',
        loadComponent: () =>
          import('./cms/pages/examinations/student-achievers/student-achievers.component')
            .then(m => m.StudentAchieversComponent)
      },

      // ===========================
      // Student Life
      // ===========================

      {
        path: 'student-life/student-representative-council',
        loadComponent: () =>
          import('./cms/pages/student-life/student-representative-council/student-representative-council.component')
            .then(m => m.StudentRepresentativeCouncilComponent)
      },
      {
        path: 'student-life/library',
        loadComponent: () =>
          import('./cms/pages/student-life/library/library.component')
            .then(m => m.LibraryComponent)
      },
      {
        path: 'student-life/student-club',
        loadComponent: () =>
          import('./cms/pages/student-life/student-club/student-club.component')
            .then(m => m.StudentClubComponent)
      },
      {
        path: 'student-life/national-social-service',
        loadComponent: () =>
          import('./cms/pages/student-life/national-social-service/national-social-service.component')
            .then(m => m.NationalSocialServiceComponent)
      },
      {
        path: 'student-life/national-cadet-corps',
        loadComponent: () =>
          import('./cms/pages/student-life/national-cadet-crops/national-cadet-crops.component')
            .then(m => m.NationalCadetCropsComponent)
      },
      {
        path: 'student-life/medical-aid-cell',
        loadComponent: () =>
          import('./cms/pages/student-life/medical-aid-cell/medical-aid-cell.component')
            .then(m => m.MedicalAidCellComponent)
      },
      {
        path: 'student-life/internships',
        loadComponent: () =>
          import('./cms/pages/student-life/internships/internships.component')
            .then(m => m.InternshipsComponent)
      },
      {
        path: 'student-life/scholarships',
        loadComponent: () =>
          import('./cms/pages/student-life/scholarships/scholarships.component')
            .then(m => m.ScholarshipsComponent)
      },
      {
        path: 'student-life/bus-service',
        loadComponent: () =>
          import('./cms/pages/student-life/bus-service/bus-service.component')
            .then(m => m.BusServiceComponent)
      },
      {
        path: 'student-life/canteen',
        loadComponent: () =>
          import('./cms/pages/student-life/canteen/canteen.component')
            .then(m => m.CanteenComponent)
      },

      // ===========================
      // Compliance
      // ===========================

      {
        path: 'compliance/bci-compliance',
        loadComponent: () =>
          import('./cms/pages/compliance/bci-compliance/bci-compliance.component')
            .then(m => m.BciComplianceComponent)
      },
      {
        path: 'compliance/ugc-compliance',
        loadComponent: () =>
          import('./cms/pages/compliance/ugc-compliance/ugc-compliance.component')
            .then(m => m.UgcComplianceComponent)
      },
      {
        path: 'compliance/nirf-iqac',
        loadComponent: () =>
          import('./cms/pages/compliance/nirf-iqac/nirf-iqac.component')
            .then(m => m.NirfIqacComponent)
      },
      {
        path: 'compliance/nirf',
        loadComponent: () =>
          import('./cms/pages/compliance/nirf/nirf.component')
            .then(m => m.NirfComponent)
      },
      {
        path: 'compliance/aishe',
        loadComponent: () =>
          import('./cms/pages/compliance/aishe/aishe.component')
            .then(m => m.AisheComponent)
      },

      // ===========================
      // Committee and Cell
      // ===========================

      {
        path: 'committee-and-cell/internal-quality-assurance-cell',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/internal-quality-assurance-cell/internal-quality-assurance-cell.component')
            .then(m => m.InternalQualityAssuranceCellComponent)
      },
      {
        path: 'committee-and-cell/college-management-committee',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/college-management-committee/college-management-committee.component')
            .then(m => m.CollegeManagementCommitteeComponent)
      },
      {
        path: 'committee-and-cell/admission-committee',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/admission-committee/admission-committee.component')
            .then(m => m.AdmissionCommitteeComponent)
      },
      {
        path: 'committee-and-cell/examination-committee',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/examination-committee/examination-committee.component')
            .then(m => m.ExaminationCommitteeComponent)
      },
      {
        path: 'committee-and-cell/disciplinary-committee',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/disciplinary-committee/disciplinary-committee.component')
            .then(m => m.DisciplinaryCommitteeComponent)
      },
      {
        path: 'committee-and-cell/grievances-redressal-committee',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/grievances-redressal-committee/grievances-redressal-committee.component')
            .then(m => m.GrievancesRedressalCommitteeComponent)
      },
      {
        path: 'committee-and-cell/internal-committee',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/internal-committee/internal-committee.component')
            .then(m => m.InternalCommitteeComponent)
      },
      {
        path: 'committee-and-cell/gender-sensitization-cell',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/gender-sensitization-cell/gender-sensitization-cell.component')
            .then(m => m.GenderSensitizationCellComponent)
      },
      {
        path: 'committee-and-cell/anti-ragging-committee-and-squad',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/anti-ragging-committee-and-squad/anti-ragging-committee-and-squad.component')
            .then(m => m.AntiRaggingCommitteeAndSquadComponent)
      },
      {
        path: 'committee-and-cell/legal-research-development-cell',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/legal-research-development-cell/legal-research-development-cell.component')
            .then(m => m.LegalResearchDevelopmentCellComponent)
      },
      {
        path: 'committee-and-cell/career-counselling-and-placement-cell',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/career-counselling-placement-cell/career-counselling-placement-cell.component')
            .then(m => m.CareerCounsellingPlacementCellComponent)
      },
      {
        path: 'committee-and-cell/moot-court-committee',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/moot-court-committee/moot-court-committee.component')
            .then(m => m.MootCourtCommitteeComponent)
      },
      {
        path: 'committee-and-cell/legal-aid-cell',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/legal-aid-cell/legal-aid-cell.component')
            .then(m => m.LegalAidCellComponent)
      },
      {
        path: 'committee-and-cell/sc-st-minority-cell',
        loadComponent: () =>
          import('./cms/pages/committee-and-cell/sc-st-minority-cell/sc-st-minority-cell.component')
            .then(m => m.ScStMinorityCellComponent)
      },

      // ===========================
      // News & Events
      // ===========================

      {
        path: 'news-events/announcements',
        loadComponent: () =>
          import('./cms/pages/news-events/announcements/announcements.component')
            .then(m => m.AnnouncementsComponent)
      },
      {
        path: 'news-events/seminars-webinars',
        loadComponent: () =>
          import('./cms/pages/news-events/seminars-webinars/seminars-webinars.component')
            .then(m => m.SeminarsWebinarsComponent)
      },
      {
        path: 'news-events/moot-court-competitions',
        loadComponent: () =>
          import('./cms/pages/news-events/moot-court-competitions/moot-court-competitions.component')
            .then(m => m.MootCourtCompetitionsComponent)
      },
      {
        path: 'news-events/news-events-archives',
        loadComponent: () =>
          import('./cms/pages/news-events/news-events-archives/news-events-archives.component')
            .then(m => m.NewsEventsArchivesComponent)
      },

      // ===========================
      // Alumni
      // ===========================

      {
        path: 'alumni/governing-body',
        loadComponent: () =>
          import('./cms/pages/alumni/governing-body/governing-body.component')
            .then(m => m.GoverningBodyComponent)
      },
      {
        path: 'alumni/register-join',
        loadComponent: () =>
          import('./cms/pages/alumni/register-join/register-join.component')
            .then(m => m.RegisterJoinComponent)
      },
      {
        path: 'alumni/notable-alumni',
        loadComponent: () =>
          import('./cms/pages/alumni/notable-alumni/notable-alumni.component')
            .then(m => m.NotableAlumniComponent)
      },
      {
        path: 'alumni/alumni-events',
        loadComponent: () =>
          import('./cms/pages/alumni/alumni-events/alumni-events.component')
            .then(m => m.AlumniEventsComponent)
      },
      {
        path: 'alumni/newsletters',
        loadComponent: () =>
          import('./cms/pages/alumni/newsletters/newsletters.component')
            .then(m => m.NewslettersComponent)
      },

      // ===========================
      // Media & Gallery
      // ===========================

      {
        path: 'media-gallery',
        loadComponent: () =>
          import('./cms/pages/media-gallery/media-gallery.component')
            .then(m => m.MediaGalleryComponent)
      },

      // ===========================
      // Contact Us
      // ===========================

      {
        path: 'contact-us',
        loadComponent: () =>
          import('./cms/pages/contact-us/contact-us.component')
            .then(m => m.ContactUsComponent)
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
