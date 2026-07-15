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
      name: 'Master',
      routerlink: '',
      expanded: false,
      svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"  class="w-5 h-5" fill="none" stroke="currentColor"
      stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z"/>
      </svg>
    `,
      submenus: [
        {
          name: 'State Master',
          routerlink: '/master/statemaster',
          svgicon: `
        <svg xmlns="http://www.w3.org/2000/svg"  class="w-5 h-5" fill="none" stroke="currentColor"
      stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z"/>
      </svg>`
        },
        {
          name: 'District Master',
          routerlink: '/master/districtmaster',
          svgicon: `
        <svg xmlns="http://www.w3.org/2000/svg"  class="w-5 h-5" fill="none" stroke="currentColor"
      stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z"/>
      </svg>`
        }
      ]
    },
    {
      name: 'About Us',
      routerlink: '/aboutus',
      expanded: false,
      svgicon: `
      <svg xmlns="http://www.w3.org/2000/svg"  class="w-5 h-5" fill="none" stroke="currentColor"
      stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z"/>
      </svg>
    `,
      submenus: []
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
