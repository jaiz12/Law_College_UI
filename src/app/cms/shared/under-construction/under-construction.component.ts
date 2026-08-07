import { Component, OnInit, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [],
  templateUrl: './under-construction.component.html',
  styleUrl: './under-construction.component.scss'
})
export class UnderConstructionComponent implements OnInit {

  constructor(private router: Router) { }
  title = signal('');

  ngOnInit() {
    this.title.set(
      this.routersLinks.find(
        x => x.routerlink === this.router.url
      )?.name ?? ''
    );
  }

  routersLinks = [
    // ===========================
    // Academics
    // ===========================
    {
      name: '5-Year Integrated BA LLB',
      routerlink: '/academics/5-years-integrated-ba-llb'
    },
    {
      name: '2-Year LLM',
      routerlink: '/academics/2-year-llm'
    },
    {
      name: 'Syllabus',
      routerlink: '/academics/syllabus'
    },
    {
      name: 'Academic Calendar',
      routerlink: '/academics/academic-calendar'
    },
    {
      name: 'Research & Publications',
      routerlink: '/academics/research-and-publications'
    },
    {
      name: 'Academic Policies',
      routerlink: '/academics/academic-policies'
    },

    // ===========================
    // Admissions
    // ===========================
    {
      name: 'Eligibility Admission Process & Intake',
      routerlink: '/admissions/eligibility-admission-process-and-intake'
    },
    {
      name: 'Reservation Policy',
      routerlink: '/admissions/reservation-policy'
    },
    {
      name: 'Fee Structure',
      routerlink: '/admissions/fee-structure'
    },
    {
      name: 'Prospectus',
      routerlink: '/admissions/prospectus'
    },
    {
      name: 'Online Application',
      routerlink: '/admissions/online-application'
    },
    {
      name: 'Contact Admission Office',
      routerlink: '/admissions/contact-admission-office'
    },

    // ===========================
    // Examinations
    // ===========================
    {
      name: 'Notifications',
      routerlink: '/examinations/notifications'
    },
    {
      name: 'Exam Schedules',
      routerlink: '/examinations/exam-schedules'
    },
    {
      name: 'Results',
      routerlink: '/examinations/results'
    },
    {
      name: 'Student Achievers',
      routerlink: '/examinations/student-achievers'
    },

    // ===========================
    // Student Life
    // ===========================
    {
      name: 'Student Representative Council (SRC)',
      routerlink: '/student-life/student-representative-council'
    },
    {
      name: 'Library',
      routerlink: '/student-life/library'
    },
    {
      name: 'Student Club',
      routerlink: '/student-life/student-club'
    },
    {
      name: 'National Social Service (NSS)',
      routerlink: '/student-life/national-social-service'
    },
    {
      name: 'National Cadet Corps (NCC)',
      routerlink: '/student-life/national-cadet-crops'
    },
    {
      name: 'Medical Aid Cell',
      routerlink: '/student-life/medical-aid-cell'
    },
    {
      name: 'Internships',
      routerlink: '/student-life/interships'
    },
    {
      name: 'Scholarships',
      routerlink: '/student-life/scholarships'
    },
    {
      name: 'Bus Service',
      routerlink: '/student-life/bus-service'
    },
    {
      name: 'Canteen',
      routerlink: '/student-life/canteen'
    },
    {
      name: 'Statistics',
      routerlink: '/student-life/statistics'
    },

    // ===========================
    // Compliance / Disclosures
    // ===========================
    {
      name: 'BCI Compliance',
      routerlink: '/compliance/bci-compliance'
    },
    {
      name: 'UGC Compliance',
      routerlink: '/compliance/ugc-compliance'
    },
    {
      name: 'NIRF / IQAC',
      routerlink: '/compliance/nirf-iqac'
    },
    {
      name: 'NIRF',
      routerlink: '/compliance/nirf'
    },
    {
      name: 'AISHE',
      routerlink: '/compliance/aishe'
    },

    // ===========================
    // Committee and Cell
    // ===========================
    {
      name: 'Internal Quality Assurance Cell (IQAC)',
      routerlink: '/committee-and-cell/internal-quality-assurance-cell'
    },
    {
      name: 'College Management Committee',
      routerlink: '/committee-and-cell/college-management-committee'
    },
    {
      name: 'Admission Committee',
      routerlink: '/committee-and-cell/admission-committee'
    },
    {
      name: 'Examination Committee',
      routerlink: '/committee-and-cell/examination-committee'
    },
    {
      name: 'Disciplinary Committee',
      routerlink: '/committee-and-cell/disciplinary-committee'
    },
    {
      name: 'Grievances Redressal Committee',
      routerlink: '/committee-and-cell/grievances-redressal-committee'
    },
    {
      name: 'Internal Committee (Sexual Harassment Inquiry Committee)',
      routerlink: '/committee-and-cell/internal-committee'
    },
    {
      name: 'Gender Sensitization Cell',
      routerlink: '/committee-and-cell/gender-sensitization-cell'
    },
    {
      name: 'Anti Ragging Committee and Squad',
      routerlink: '/committee-and-cell/anti-ragging-committee-and-squad'
    },
    {
      name: 'Legal Research Development Cell',
      routerlink: '/committee-and-cell/legal-research-development-cell'
    },
    {
      name: 'Career Counselling & Placement Cell',
      routerlink: '/committee-and-cell/career-counselling-placement-cell'
    },
    {
      name: 'Moot Court Committee',
      routerlink: '/committee-and-cell/moot-court-committee'
    },
    {
      name: 'Legal Aid Cell',
      routerlink: '/committee-and-cell/legal-aid-cell'
    },
    {
      name: 'SC/ST & Minority Cell',
      routerlink: '/committee-and-cell/sc-st-minority-cell'
    },

    // ===========================
    // News & Events
    // ===========================
    {
      name: 'Announcements',
      routerlink: '/news-events/announcements'
    },
    {
      name: 'Seminars & Webinars',
      routerlink: '/news-events/seminars-webinars'
    },
    {
      name: 'Moot Court Competitions',
      routerlink: '/news-events/moot-court-competitions'
    },
    {
      name: 'News & Events Archives',
      routerlink: '/news-events/news-events-archives'
    },

    // ===========================
    // Alumni
    // ===========================
    {
      name: 'Governing Body',
      routerlink: '/alumni/governing-body'
    },
    {
      name: 'Register / Join',
      routerlink: '/alumni/register-join'
    },
    {
      name: 'Notable Alumni',
      routerlink: '/alumni/notable-alumni'
    },
    {
      name: 'Alumni Events',
      routerlink: '/alumni/alumni-events'
    },
    {
      name: 'Newsletters',
      routerlink: '/alumni/newsletters'
    },
    {
      name: 'Media & Gallery',
      routerlink: '/media-gallery'
    },
    {
      name: 'Contact Us',
      routerlink: '/contact-us'
    }
  ]


}
