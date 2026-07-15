import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LayoutService } from '../services/layout.service';
import { SafeHtmlPipe } from '../../../services/safe-html.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(public router: Router) { }

  layout = inject(LayoutService);

  dashboardOpen = signal(true);

  toggleDashboard() {
    this.dashboardOpen.update(v => !v);
  }

  menus = [
    {
      name: 'Dashboard',
      routerlink: '/dashboard',
      expanded: false,
      svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
  stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path d="M3 10l9-7 9 7v10H3z"/>
  </svg>
      `,
      submenus: []
    },
    {
      name: 'User Management',
      routerlink: '',
      expanded: false,
      svgicon: `
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-5 h-5"
  stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5"/>
      <circle cx="9" cy="7" r="4"/>
  </svg>
    `,
      submenus: [
        {
          name: 'Manage User',
          routerlink: '/user-mangement/manager-user',
          svgicon: `
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-5 h-5"
  stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path d="M12 5v14M5 12h14"/>
  </svg>`
        },
        {
          name: 'Manage Role',
          routerlink: '/user-mangement/manage-role',
          svgicon: `
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-5 h-5"
  stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z"/>
  </svg>`
        }
      ]
    },
    {
      name: 'Home',
      routerlink: '/home',
      expanded: false,
      svgicon: `<svg xmlns="http://www.w3.org/2000/svg"
       fill="none"
       viewBox="0 0 24 24"
       stroke- width="1.8"
       stroke = "currentColor"
       class= "w-5 h-5" >
    <path stroke - linecap="round"
          stroke - linejoin="round"
          d = "M2.25 12L12 3.75 21.75 12M4.5 10.5V20.25h15V10.5M9.75 20.25v-6h4.5v6" />
    </svg>`,
      submenus: []
    },

    {
      name: 'About Us',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       fill="none"
       viewBox="0 0 24 24"
       stroke-width="1.8"
       stroke="currentColor"
       class="w-5 h-5">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9h.01M12 12v4.5M12 21a9 9 0 100-18 9 9 0 000 18z"/>
  </svg>
  `,
      submenus: [
        {
          name: 'General Overview',
          routerlink: '/about/general-overview',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 6v6l4 2"/>
        <circle cx="12" cy="12" r="9"/>
      </svg>`
        },

        {
          name: 'Vision & Mission',
          routerlink: '/about/vision-mission',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M2.25 12S6 5.25 12 5.25 21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`
        },

        {
          name: "Principal's Message",
          routerlink: '/about/principal-message',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 10h8M8 14h5"/>
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M5 4h14v16l-3-2-4 2-4-2-3 2V4z"/>
      </svg>`
        },

        {
          name: 'Governing Body',
          routerlink: '/about/governing-body',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 10l9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>
      </svg>`
        },

        {
          name: 'Organizational Structure',
          routerlink: '/about/organization-structure',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 4v4M6 12h12M6 20v-4M18 20v-4M12 8v4"/>
      </svg>`
        },

        {
          name: 'Recognitions & Affiliations',
          routerlink: '/about/recognitions',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.8l-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3z"/>
      </svg>`
        },

        {
          name: 'Statutory Bodies',
          routerlink: '/about/statutory-bodies',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
           stroke-width="1.8" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/>
      </svg>`
        }
      ]
    },

    {
      name: 'Academics',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       viewBox="0 0 24 24"
       stroke="currentColor"
       stroke-width="2">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4l9 5-9 5-9-5 9-5zm0 6v10m-6-7v5c0 1 3 3 6 3s6-2 6-3v-5"/>
  </svg>
  `,
      submenus: [

        {
          name: 'Program & Curriculum',
          routerlink: '/academics/program-curriculum',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6V4m0 2a6 6 0 016 6v6H6v-6a6 6 0 016-6z"/>
      </svg>`
        },

        {
          name: 'Programs Offered',
          routerlink: '/academics/programs',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6h16M4 12h16M4 18h16"/>
      </svg>`
        },

        {
          name: '5 Years Integrated BA LLB',
          routerlink: '/academics/ba-llb',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4l8 4-8 4-8-4 8-4zm0 8v8"/>
      </svg>`
        },

        {
          name: '3 Year LLB',
          routerlink: '/academics/llb',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3l9 4.5-9 4.5L3 7.5 12 3zm0 9v9"/>
      </svg>`
        },

        {
          name: 'Diploma/Certificate Courses',
          routerlink: '/academics/diploma',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 4h8v5l2 2v9H6V4h2z"/>
      </svg>`
        },

        {
          name: 'Syllabus & Course Outcomes',
          routerlink: '/academics/syllabus',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 5h10M7 9h10M7 13h7M5 3h14v18H5z"/>
      </svg>`
        },

        {
          name: 'Academic Calendar',
          routerlink: '/academics/calendar',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M16 3v4M8 3v4M3 10h18"/>
      </svg>`
        },

        {
          name: 'Time Table',
          routerlink: '/academics/timetable',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
      </svg>`
        },

        {
          name: 'Research & Publications',
          routerlink: '/academics/research',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M20 22V4a2 2 0 00-2-2H6a2 2 0 00-2 2v15.5"/>
      </svg>`
        },

        {
          name: 'Academic Policies',
          routerlink: '/academics/policies',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4M7 4h10l2 2v14H5V6l2-2z"/>
      </svg>`
        },

        {
          name: 'Scholarships & Academic Awards',
          routerlink: '/academics/scholarships',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 14l-1 7 5-3 5 3-1-7"/>
      </svg>`
        }

      ]
    },

    {
      name: 'Admissions',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       stroke="currentColor"
       stroke-width="2"
       viewBox="0 0 24 24">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4l9 5-9 5-9-5 9-5zm0 6v10m-6-7v5c0 1 3 3 6 3s6-2 6-3v-5"/>
  </svg>
  `,
      submenus: [

        {
          name: 'Admission Information',
          routerlink: '/admissions/information',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8h.01M11 12h1v4h1"/>
      </svg>`
        },

        {
          name: 'Eligibility & Intake',
          routerlink: '/admissions/eligibility',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4"/>
        <circle cx="12" cy="12" r="9"/>
      </svg>`
        },

        {
          name: 'Admission Process',
          routerlink: '/admissions/process',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 7h6v4H4zm10 0h6v4h-6zM9 17h6"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 11v2h10v-2"/>
      </svg>`
        },

        {
          name: 'Fee Structure',
          routerlink: '/admissions/fee-structure',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 7v10M15 9c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2"/>
      </svg>`
        },

        {
          name: 'Prospectus',
          routerlink: '/admissions/prospectus',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 2h9l5 5v15H6z"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 2v5h5"/>
      </svg>`
        },

        {
          name: 'Online Application',
          routerlink: '/admissions/application',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 6h8M8 10h8M8 14h5"/>
        <rect x="5" y="3" width="14" height="18" rx="2"/>
      </svg>`
        },

        {
          name: 'Contact Admission Office',
          routerlink: '/admissions/contact',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 15a2 2 0 01-2 2A17 17 0 013 5a2 2 0 012-2h2l2 5-2 1a14 14 0 007 7l1-2 5 2z"/>
      </svg>`
        }

      ]
    },

    {
      name: 'Infrastructure & Facilities',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       stroke="currentColor"
       stroke-width="2"
       viewBox="0 0 24 24">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
  </svg>
  `,
      submenus: [

        {
          name: 'Campus Overview',
          routerlink: '/infrastructure/campus',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
      </svg>`
        },

        {
          name: 'Moot Court',
          routerlink: '/infrastructure/moot-court',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3l2 5h5l-4 3 2 6-5-3-5 3 2-6-4-3h5z"/>
      </svg>`
        },

        {
          name: 'Library & Catalogue',
          routerlink: '/infrastructure/library',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 4h12v16H6z"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 8h6M9 12h6"/>
      </svg>`
        },

        {
          name: 'Classrooms & Labs',
          routerlink: '/infrastructure/classrooms',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 9h10M7 13h6"/>
      </svg>`
        },

        {
          name: 'Canteen',
          routerlink: '/infrastructure/canteen',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 3v8a2 2 0 01-2 2H5V3M16 3v18M20 3v7a3 3 0 01-3 3h-1"/>
      </svg>`
        },

        {
          name: 'Computer Lab',
          routerlink: '/infrastructure/computer-lab',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="12" rx="2"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 20h8M12 16v4"/>
      </svg>`
        },

        {
          name: 'Hostel Facilities',
          routerlink: '/infrastructure/hostel',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 21h18M5 21V8a2 2 0 012-2h10a2 2 0 012 2v13M9 12h2M13 12h2"/>
      </svg>`
        },

        {
          name: 'Accessibility',
          routerlink: '/infrastructure/accessibility',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 7v5m-4 1h8m-6 0l-2 8m6-8l2 8"/>
      </svg>`
        }

      ]
    },

    {
      name: 'Examinations',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       stroke="currentColor"
       stroke-width="2"
       viewBox="0 0 24 24">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 016 0M9 12h6M9 16h4"/>
  </svg>
  `,
      submenus: [

        {
          name: 'Academic Evaluation',
          routerlink: '/examinations/evaluation',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 4h14v16H5z"/>
      </svg>`
        },

        {
          name: 'Notifications',
          routerlink: '/examinations/notifications',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M10 21h4"/>
      </svg>`
        },

        {
          name: 'Exam Schedules',
          routerlink: '/examinations/schedules',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 3v4M8 3v4M3 10h18"/>
      </svg>`
        },

        {
          name: 'Results & Marksheet',
          routerlink: '/examinations/results',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 17l3-3 2 2 4-5"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 20V4h14v16"/>
      </svg>`
        },

        {
          name: 'Student Achievers',
          routerlink: '/examinations/achievers',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 14l-1 7 5-3 5 3-1-7"/>
      </svg>`
        },

        {
          name: 'Research Publications',
          routerlink: '/examinations/publications',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M20 22V4a2 2 0 00-2-2H6a2 2 0 00-2 2v15.5"/>
      </svg>`
        },

        {
          name: 'Previous Question Papers',
          routerlink: '/examinations/question-papers',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 2h9l5 5v15H6z"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 2v5h5"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h6M9 16h6"/>
      </svg>`
        }

      ]
    },

    {
      name: 'Student Life',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       stroke="currentColor"
       stroke-width="2"
       viewBox="0 0 24 24">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4a4 4 0 100 8 4 4 0 000-8zm-7 16a7 7 0 0114 0"/>
  </svg>
  `,
      submenus: [

        {
          name: 'Student Support',
          routerlink: '/student-life/support',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 21s-7-4.5-7-10a4 4 0 018-1 4 4 0 018 1c0 5.5-7 10-7 10z"/>
      </svg>`
        },

        {
          name: 'Anti-Ragging Cell',
          routerlink: '/student-life/anti-ragging',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 8l8 8M16 8l-8 8"/>
      </svg>`
        },

        {
          name: "Women's Cell",
          routerlink: '/student-life/women-cell',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 12v9M9 18h6"/>
      </svg>`
        },

        {
          name: 'SC/ST Cell',
          routerlink: '/student-life/scst-cell',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-8 0v2m8 0H9m6-10a3 3 0 11-6 0 3 3 0 016 0"/>
      </svg>`
        },

        {
          name: 'Grievance Redressal',
          routerlink: '/student-life/grievance',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 12h8M8 16h5"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 3h12a2 2 0 012 2v14l-4-3H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
      </svg>`
        },

        {
          name: 'Internships & Placements',
          routerlink: '/student-life/internships',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="13" rx="2"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 7V5h6v2"/>
      </svg>`
        },

        {
          name: 'Student Council',
          routerlink: '/student-life/student-council',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3"/>
        <circle cx="17" cy="8" r="3"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 20a5 5 0 0110 0M12 20a5 5 0 018 0"/>
      </svg>`
        },

        {
          name: 'Scholarships',
          routerlink: '/student-life/scholarships',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 14l-1 7 5-3 5 3-1-7"/>
      </svg>`
        },

        {
          name: 'Alumni Activities',
          routerlink: '/student-life/alumni-activities',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           stroke="currentColor"
           stroke-width="2"
           viewBox="0 0 24 24">
        <circle cx="8" cy="8" r="3"/>
        <circle cx="16" cy="8" r="3"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 20a5 5 0 0110 0M11 20a5 5 0 0110 0"/>
      </svg>`
        }

      ]
    },

    {
      name: 'Compliance / Disclosures',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       viewBox="0 0 24 24"
       stroke="currentColor"
       stroke-width="2">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12l2 2 4-4M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z"/>
  </svg>
  `,
      submenus: [
        {
          name: 'BCI Compliance',
          routerlink: '/compliance/bci',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z"/>
      </svg>`
        },
        {
          name: 'UGC Compliance',
          routerlink: '/compliance/ugc',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z"/>
      </svg>`
        },
        {
          name: 'NAAC Reports',
          routerlink: '/compliance/naac',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 17h6M9 13h6M9 9h4M7 3h8l4 4v14H7V3z"/>
      </svg>`
        },
        {
          name: 'State Council Compliance',
          routerlink: '/compliance/state-council',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"/>
      </svg>`
        },
        {
          name: 'NIRF / IQAC',
          routerlink: '/compliance/nirf-iqac',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 2l3 7h7l-5.5 4.2L18 21l-6-4-6 4 1.5-7.8L2 9h7l3-7z"/>
      </svg>`
        },
        {
          name: 'RTI',
          routerlink: '/compliance/rti',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 3h8l5 5v13H3V3h5zm0 0v5h5"/>
      </svg>`
        },
        {
          name: 'Annual Disclosure Reports',
          routerlink: '/compliance/annual-disclosure',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 3h10l4 4v14H7V3zm3 6h4m-4 4h7m-7 4h5"/>
      </svg>`
        }
      ]
    },

    {
      name: 'Legal Aid',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       viewBox="0 0 24 24"
       stroke="currentColor"
       stroke-width="2">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z"/>
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M8 11h8M12 8v6"/>
  </svg>
  `,
      submenus: [
        {
          name: 'Community Service',
          routerlink: '/legal-aid/community-service',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-8 0v2m8 0H9m6-10a3 3 0 11-6 0 3 3 0 016 0"/>
      </svg>`
        },
        {
          name: 'Legal Aid Clinic',
          routerlink: '/legal-aid/clinic',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h6m-3-3v6M5 21h14a2 2 0 002-2V7l-5-4H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>`
        },
        {
          name: 'How to Avail Legal Aid',
          routerlink: '/legal-aid/how-to-avail',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 10h8M8 14h5M7 3h10l4 4v14H7V3z"/>
      </svg>`
        },
        {
          name: 'Impact Stories / Case Studies',
          routerlink: '/legal-aid/case-studies',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v6l4 2"/>
        <circle cx="12" cy="12" r="9"/>
      </svg>`
        },
        {
          name: 'Volunteer Info',
          routerlink: '/legal-aid/volunteer',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4zM8 11c1.657 0 3-1.79 3-4S9.657 3 8 3 5 4.79 5 7s1.343 4 3 4zm0 2c-2.761 0-5 2.239-5 5v1h10v-1c0-2.761-2.239-5-5-5zm8 0c-.71 0-1.386.118-2.016.335A6.96 6.96 0 0119 19v1h5v-1c0-3.314-2.686-6-6-6z"/>
      </svg>`
        }
      ]
    },

    {
      name: 'News & Events',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       viewBox="0 0 24 24"
       stroke="currentColor"
       stroke-width="2">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z"/>
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M7 9h10M7 13h6M7 17h4"/>
  </svg>
  `,
      submenus: [
        {
          name: 'Announcements',
          routerlink: '/news/announcements',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M11 5l7 7-7 7M5 12h13"/>
      </svg>`
        },
        {
          name: 'Events Archive',
          routerlink: '/news/events',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 3v4M8 3v4M3 10h18"/>
      </svg>`
        },
        {
          name: 'Seminars & Webinars',
          routerlink: '/news/seminars',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <rect x="3" y="4" width="18" height="12" rx="2"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 20h8M12 16v4"/>
      </svg>`
        },
        {
          name: 'Moot Court Competitions',
          routerlink: '/news/moot-court',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v18M7 7h10M9 7l-3 5h6L9 7zm9 0l-3 5h6l-3-5z"/>
      </svg>`
        }
      ]
    },

    {
      name: 'Alumni',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       viewBox="0 0 24 24"
       stroke="currentColor"
       stroke-width="2">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-8 0v2m8 0H9m6-10a3 3 0 11-6 0 3 3 0 016 0"/>
  </svg>
  `,
      submenus: [
        {
          name: 'Register / Join',
          routerlink: '/alumni/register',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16M4 12h16"/>
      </svg>`
        },
        {
          name: 'Notable Alumni',
          routerlink: '/alumni/notable',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
      </svg>`
        },
        {
          name: 'Alumni Events',
          routerlink: '/alumni/events',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 3v4M8 3v4M3 10h18"/>
      </svg>`
        },
        {
          name: 'Newsletters',
          routerlink: '/alumni/newsletters',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 5h16v14H4V5zm3 4h10M7 13h6"/>
      </svg>`
        }
      ]
    },

    {
      name: 'Admin',
      routerlink: '',
      expanded: false,
      svgicon: `
  <svg xmlns="http://www.w3.org/2000/svg"
       class="w-5 h-5"
       fill="none"
       viewBox="0 0 24 24"
       stroke="currentColor"
       stroke-width="2">
    <path stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 2a2 2 0 012 2v1.1a7.002 7.002 0 013.9 3.9H19a2 2 0 012 2v2a2 2 0 01-2 2h-1.1a7.002 7.002 0 01-3.9 3.9V20a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1.1a7.002 7.002 0 01-3.9-3.9H3a2 2 0 01-2-2v-2a2 2 0 012-2h1.1a7.002 7.002 0 013.9-3.9V4a2 2 0 012-2h2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
  `,
      submenus: [
        {
          name: 'Admin & Staff Contacts',
          routerlink: '/admin/staff',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-8 0v2m8 0H9m6-10a3 3 0 11-6 0 3 3 0 016 0"/>
      </svg>`
        },
        {
          name: 'Feedback Form',
          routerlink: '/admin/feedback',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 10h8M8 14h5M7 3h10l4 4v14H7V3z"/>
      </svg>`
        },
        {
          name: 'Complaint Form',
          routerlink: '/admin/complaint',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v4m0 4h.01"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.29 3.86L1.82 18A2 2 0 003.53 21h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>`
        },
        {
          name: 'Campus Map',
          routerlink: '/admin/campus-map',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 20l-5-2V6l5 2 6-2 5 2v12l-5-2-6 2z"/>
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 8v12M15 6v12"/>
      </svg>`
        },
        {
          name: 'Helplines',
          routerlink: '/admin/helplines',
          svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"
           class="w-5 h-5"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
           stroke-width="2">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.52l.57 2.29a2 2 0 01-.54 1.92l-1.2 1.2a16 16 0 007.07 7.07l1.2-1.2a2 2 0 011.92-.54l2.29.57A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"/>
      </svg>`
        }
      ]
    }
  ];


  toggle(menu: any) {

    this.menus.forEach(x => {
      if (x !== menu) {
        x.expanded = false;
      }
    });

    menu.expanded = !menu.expanded;

  }

  onMouseEnter(): void {
    if (this.layout.sidebarCollapsed()) {
      this.layout.openSidebar();
    }
  }

  onMouseLeave(): void {
    if (!this.layout.sidebarCollapsed()) {
      this.layout.closeSidebar();
    }
  }

  isMenuActive(menu: any): boolean {

    // Parent has its own route
    if (menu.routerlink && this.router.isActive(menu.routerlink, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    })) {
      return true;
    }

    // Check child routes
    return menu.submenus?.some((submenu: any) =>
      this.router.isActive(submenu.routerlink, {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored'
      })
    ) ?? false;

  }
}
