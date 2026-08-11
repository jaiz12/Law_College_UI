import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ValidationService
} from '../../../../../services/validation-service.service';

import {
  ImportantLink
} from '../important-links.component';

import {
  ConfigService
} from '../../../../../services/config.service';


@Component({

  selector: 'app-important-link-modal',

  standalone: true,

  imports: [

    CommonModule,

    ReactiveFormsModule

  ],

  templateUrl:
    './important-link-modal.component.html',

  styleUrl:
    './important-link-modal.component.scss'

})


export class ImportantLinkModalComponent
  implements OnChanges {


  // ---------------------------------------
  // Services
  // ---------------------------------------

  private fb =
    inject(FormBuilder);


  private validationService =
    inject(ValidationService);


  private configService =
    inject(ConfigService);


  // ---------------------------------------
  // Input / Output
  // ---------------------------------------

  @Input()
  link: ImportantLink | null = null;


  @Output()
  save =
    new EventEmitter<ImportantLink>();


  @Output()
  close =
    new EventEmitter<void>();


  // ---------------------------------------
  // Menu Variables
  // ---------------------------------------

  showMenus = false;


  selectedMenu: any = null;


  searchControl =
    new FormControl(
      '',
      {
        nonNullable: true
      }
    );


  // ---------------------------------------
  // Menu Configuration
  // ---------------------------------------

  menus: any[] = [];


  allMenus: any[] = [];


  UI_URL = '';


  // ---------------------------------------
  // Section
  // ---------------------------------------

  section =
    'Important Links';


  // ---------------------------------------
  // Form
  // ---------------------------------------

  pageForm =
    this.fb.group({

      id:
        this.fb.control<number | null>(
          null
        ),


      type:
        this.fb.control<
          'internal' | 'external'
        >(
          'internal',
          {
            validators: [
              Validators.required
            ],

            nonNullable: true
          }
        ),


      name:
        this.fb.control(
          '',
          {

            validators: [

              Validators.required,

              this.validationService
                .noWhitespaceValidator()

            ],

            nonNullable: true

          }
        ),


      link:
        this.fb.control(
          '',
          {

            validators: [

              Validators.required,

              this.validationService
                .noWhitespaceValidator()

            ],

            nonNullable: true

          }
        )

    });


  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {

    return !!this.link;

  }


  // ---------------------------------------
  // Constructor
  // ---------------------------------------

  constructor() {

    this.menus =
      this.configService.get('menus') || [];


    this.UI_URL =
      this.configService.get('UI_URL') || '';


    this.loadMenus();


    // ---------------------------------------
    // Type Change
    // ---------------------------------------

    this.pageForm
      .get('type')
      ?.valueChanges
      .subscribe(type => {

        this.showMenus = false;


        this.selectedMenu = null;


        if (type === 'internal') {

          // Clear fields when switching
          // to internal

          this.pageForm.patchValue({

            name: '',

            link: ''

          });

        }

        else {

          // External link

          this.pageForm.patchValue({

            name: '',

            link: ''

          });

        }

      });

  }


  // ---------------------------------------
  // Input Changes
  // ---------------------------------------

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.link) {

      this.pageForm.patchValue({

        id:
          this.link.id,

        type:
          this.link.type,

        name:
          this.link.name,

        link:
          this.link.link

      });


      this.searchControl.setValue('');


      this.showMenus = false;


      // ---------------------------------------
      // Existing Internal Link
      // ---------------------------------------

      if (
        this.link.type ===
        'internal'
      ) {

        this.selectedMenu =
          this.allMenus.find(

            x =>
              x.routerlink ===
              this.link!.link

          ) ?? null;

      }

      else {

        this.selectedMenu = null;

      }

    }

    else {

      // ---------------------------------------
      // Add Mode
      // ---------------------------------------

      this.selectedMenu = null;


      this.searchControl.setValue('');


      this.showMenus = false;


      this.pageForm.reset({

        id: null,

        type: 'internal',

        name: '',

        link: ''

      });

    }

  }


  // ===========================================
  // Flatten Menus
  // ===========================================

  loadMenus(): void {

    this.allMenus = [];


    const excludedMenus = [

      'Dashboard',

      'User Management'

    ];


    this.menus

      .filter(
        (menu: any) =>
          !excludedMenus.includes(
            menu.name
          )
      )

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

                this.allMenus.push({

                  name:
                    sub.name,

                  routerlink:
                    this.UI_URL +
                    sub.UIrouterlink

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

            this.allMenus.push({

              name:
                menu.name,

              routerlink:
                this.UI_URL +
                menu.UIrouterlink

            });

          }

        }
      );

  }


  // ===========================================
  // Search Menus
  // ===========================================

  filteredMenus(): any[] {

    const search =
      this.searchControl.value
        .toLowerCase()
        .trim();


    if (!search) {

      return this.allMenus;

    }


    return this.allMenus.filter(
      menu =>

        menu.name
          .toLowerCase()
          .includes(search)

        ||

        menu.routerlink
          .toLowerCase()
          .includes(search)

    );

  }


  // ===========================================
  // Select Menu
  // ===========================================

  selectMenu(menu: any): void {

    this.selectedMenu =
      menu;


    this.pageForm.patchValue({

      name:
        menu.name,

      link:
        menu.routerlink

    });


    this.showMenus = false;


    this.searchControl.setValue('');

  }


  // ===========================================
  // Submit
  // ===========================================

  submit(): void {

    if (
      this.pageForm.invalid
    ) {

      this.pageForm.markAllAsTouched();

      return;

    }


    const value =
      this.pageForm.getRawValue();


    const importantLink:
      ImportantLink = {

      id:
        value.id ?? 0,

      type:
        value.type,

      name:
        value.name.trim(),

      link:
        value.link.trim()

    };


    console.log(
      'Important Link:',
      importantLink
    );


    this.save.emit(
      importantLink
    );

  }


  // ===========================================
  // Cancel
  // ===========================================

  cancel(): void {

    this.pageForm.reset({

      id: null,

      type: 'internal',

      name: '',

      link: ''

    });


    this.selectedMenu = null;


    this.searchControl.setValue('');


    this.showMenus = false;


    this.close.emit();

  }

}
