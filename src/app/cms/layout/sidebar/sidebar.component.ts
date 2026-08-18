import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  Router,
  RouterModule,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs';

import { LayoutService } from '../services/layout.service';
import { SafeHtmlPipe } from '../../../services/safe-html.pipe';
import { ConfigService } from '../../../services/config.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe
  ],

  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  constructor(
    public router: Router,
    private configService: ConfigService
  ) { }

  layout = inject(LayoutService);

  dashboardOpen = signal(true);

  menus: any[] = [];


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.menus =
      this.configService.get('menus') || [];


    // Check active menu when component loads
    this.expandActiveMenu();


    // Check again whenever route changes
    this.router.events

      .pipe(
        filter(
          event => event instanceof NavigationEnd
        )
      )

      .subscribe(() => {

        this.expandActiveMenu();

      });

  }


  // ===================================================
  // EXPAND ACTIVE MENU
  // ===================================================

  private expandActiveMenu(): void {

    this.menus.forEach((menu: any) => {

      // ------------------------------------------------
      // Parent menu itself is active
      // ------------------------------------------------

      if (
        menu.routerlink &&
        this.router.isActive(
          menu.routerlink,
          {
            paths: 'exact',
            queryParams: 'ignored',
            fragment: 'ignored',
            matrixParams: 'ignored'
          }
        )
      ) {

        menu.expanded = true;

        return;

      }


      // ------------------------------------------------
      // Check child menu
      // ------------------------------------------------

      const hasActiveChild =
        menu.submenus?.some(
          (submenu: any) => {

            return submenu.routerlink &&
              this.router.isActive(
                submenu.routerlink,
                {
                  paths: 'subset',
                  queryParams: 'ignored',
                  fragment: 'ignored',
                  matrixParams: 'ignored'
                }
              );

          }
        );


      // ------------------------------------------------
      // Expand parent if child is active
      // ------------------------------------------------

      menu.expanded =
        !!hasActiveChild;

    });

  }


  // ===================================================
  // TOGGLE MENU
  // ===================================================

  toggle(menu: any): void {

    this.menus.forEach((x: any) => {

      if (x !== menu) {

        x.expanded = false;

      }

    });


    menu.expanded =
      !menu.expanded;

  }


  // ===================================================
  // MOUSE ENTER
  // ===================================================

  onMouseEnter(): void {

    if (
      this.layout.sidebarCollapsed()
    ) {

      this.layout.openSidebar();

    }

  }


  // ===================================================
  // MOUSE LEAVE
  // ===================================================

  onMouseLeave(): void {

    if (
      !this.layout.sidebarCollapsed()
    ) {

      this.layout.closeSidebar();

    }

  }


  // ===================================================
  // CHECK ACTIVE MENU
  // ===================================================

  isMenuActive(menu: any): boolean {

    // Parent has its own route
    if (
      menu.routerlink &&
      this.router.isActive(
        menu.routerlink,
        {
          paths: 'exact',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored'
        }
      )
    ) {

      return true;

    }


    // Check child routes
    return menu.submenus?.some(
      (submenu: any) => {

        return submenu.routerlink &&
          this.router.isActive(
            submenu.routerlink,
            {
              paths: 'subset',
              queryParams: 'ignored',
              fragment: 'ignored',
              matrixParams: 'ignored'
            }
          );

      }
    ) ?? false;

  }

}
