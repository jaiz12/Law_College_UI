import { Component, OnInit, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../../services/config.service';


@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [],
  templateUrl: './under-construction.component.html',
  styleUrl: './under-construction.component.scss'
})
export class UnderConstructionComponent implements OnInit {

  constructor(private router: Router, private configService: ConfigService) { }
  title = signal('');
  menus: any[] = [];
  ngOnInit() {
    this.menus =
      this.configService.get('menus') || [];
    this.loadMenus();
    this.title.set(
      this.routersLinks.find(
        x => x.routerlink === this.router.url
      )?.name ?? ''
    );
  }

  routersLinks: any[] = [];
  loadMenus(): void {

    this.routersLinks = [];




    this.menus

      .forEach(
        (menu: any) => {


          // ---------------------------------------
          // Menu has submenus
          // ---------------------------------------

          if (
            menu.submenus?.length
          ) {

            menu.submenus.forEach(
              (sub: any) => {

                this.routersLinks.push({

                  name:
                    sub.name,

                  routerlink:
                    sub.routerlink

                });

              }
            );

          }


          // ---------------------------------------
          // Main menu
          // ---------------------------------------

          else if (
            menu.routerlink
          ) {

            this.routersLinks.push({

              name:
                menu.name,

              routerlink:
                menu.routerlink

            });

          }

        }
      );

  }
}
