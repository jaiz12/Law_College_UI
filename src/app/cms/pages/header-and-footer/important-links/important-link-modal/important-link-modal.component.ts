import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

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


  // ===========================================
  // Services
  // ===========================================

  private fb = inject(FormBuilder);

  private validationService =
    inject(ValidationService);

  private configService =
    inject(ConfigService);


  // ===========================================
  // Input / Output
  // ===========================================

  @Input()
  link: ImportantLink | null = null;

  @Input()
  items: ImportantLink[] = [];

  @Output()
  save =
    new EventEmitter<ImportantLink>();

  @Output()
  close =
    new EventEmitter<void>();


  // ===========================================
  // Menu Variables
  // ===========================================

  showMenus = false;

  selectedMenu: any = null;

  searchControl =
    new FormControl('', {
      nonNullable: true
    });


  // ===========================================
  // Menu Configuration
  // ===========================================

  menus: any[] = [];

  allMenus: any[] = [];

  UI_URL = '';

  section = 'Important Links';


  // ===========================================
  // URL Validator
  // ===========================================

  private urlValidator() {

    return (control: any) => {

      const value =
        control.value?.trim();

      // Empty value is handled by required validator
      if (!value) {
        return null;
      }

      // URL cannot contain whitespace
      if (/\s/.test(value)) {
        return {
          urlWhitespace: true
        };
      }

      // HTTP / HTTPS URL
      const urlPattern =
        /^https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?::\d+)?(?:[/?#][^\s]*)?$/;

      if (!urlPattern.test(value)) {
        return {
          invalidUrl: true
        };
      }

      return null;
    };
  }


  // ===========================================
  // Duplicate Validator
  // ===========================================
  //
  // Internal:
  //   name  -> duplicate internal page name
  //   link  -> duplicate internal page URL
  //
  // External:
  //   name  -> duplicate external Link Name
  //   link  -> duplicate external URL
  //
  // Current record is ignored during edit.
  // ===========================================

  private duplicateValidator(
    field: 'name' | 'link'
  ) {

    return (control: any) => {

      const value =
        control.value
          ?.trim()
          .toLowerCase();

      if (!value) {
        return null;
      }

      const currentId =
        Number(
          this.pageForm
            ?.get('id')
            ?.value || 0
        );

      const currentType =
        this.pageForm
          ?.get('type')
          ?.value;


      const duplicate =
        this.items.some(item => {

          // ---------------------------------------
          // Ignore current record while editing
          // ---------------------------------------

          if (
            currentId > 0 &&
            Number(item.id) === currentId
          ) {
            return false;
          }


          // ---------------------------------------
          // Only compare same link type
          // ---------------------------------------

          if (
            item.type !== currentType
          ) {
            return false;
          }


          // ---------------------------------------
          // Compare field
          // ---------------------------------------

          const itemValue =
            item[field]
              ?.trim()
              .toLowerCase();

          return itemValue === value;

        });


      return duplicate
        ? {
          duplicate: true
        }
        : null;
    };
  }


  // ===========================================
  // Form
  // ===========================================

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

              Validators.maxLength(100),

              this.validationService
                .noWhitespaceValidator(),

              this.duplicateValidator('name')

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
                .noWhitespaceValidator(),

              this.duplicateValidator('link'),

              this.urlValidator()

            ],

            nonNullable: true

          }
        )

    });


  // ===========================================
  // Edit Mode
  // ===========================================

  get isEditMode(): boolean {

    return !!this.link;

  }


  // ===========================================
  // Constructor
  // ===========================================

  constructor() {

    this.menus =
      this.configService.get('menus') || [];

    this.UI_URL =
      this.configService.get('UI_URL') || '';

    this.loadMenus();


    // ===========================================
    // Type Change
    // ===========================================

    this.pageForm
      .get('type')
      ?.valueChanges
      .subscribe(() => {

        this.clearFormOnTypeChange();

      });

  }


  // ===========================================
  // Clear Form On Type Change
  // ===========================================

  private clearFormOnTypeChange(): void {

    const nameControl =
      this.pageForm.get('name');

    const linkControl =
      this.pageForm.get('link');


    // -----------------------------------------
    // Clear values
    // -----------------------------------------

    nameControl?.setValue('', {
      emitEvent: false
    });

    linkControl?.setValue('', {
      emitEvent: false
    });


    // -----------------------------------------
    // Clear validation errors/state
    // -----------------------------------------

    nameControl?.setErrors(null);
    linkControl?.setErrors(null);

    nameControl?.markAsPristine();
    nameControl?.markAsUntouched();

    linkControl?.markAsPristine();
    linkControl?.markAsUntouched();


    // -----------------------------------------
    // Clear selected internal page
    // -----------------------------------------

    this.selectedMenu = null;

    this.showMenus = false;

    this.searchControl.setValue('', {
      emitEvent: false
    });


    // -----------------------------------------
    // Recalculate validators
    // -----------------------------------------

    nameControl?.updateValueAndValidity({
      emitEvent: false
    });

    linkControl?.updateValueAndValidity({
      emitEvent: false
    });

  }


  // ===========================================
  // Input Changes
  // ===========================================

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

      }, {
        emitEvent: false
      });


      this.searchControl.setValue('', {
        emitEvent: false
      });

      this.showMenus = false;


      // -----------------------------------------
      // Existing Internal Link
      // -----------------------------------------

      if (
        this.link.type === 'internal'
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

      // -----------------------------------------
      // Add Mode
      // -----------------------------------------

      this.selectedMenu = null;

      this.searchControl.setValue('', {
        emitEvent: false
      });

      this.showMenus = false;


      this.pageForm.reset({

        id: null,

        type: 'internal',

        name: '',

        link: ''

      }, {
        emitEvent: false
      });


      this.pageForm.get('name')?.setErrors(null);
      this.pageForm.get('link')?.setErrors(null);

    }


    // -----------------------------------------
    // Refresh validators
    // -----------------------------------------

    this.pageForm
      .get('name')
      ?.updateValueAndValidity({
        emitEvent: false
      });

    this.pageForm
      .get('link')
      ?.updateValueAndValidity({
        emitEvent: false
      });

  }


  // ===========================================
  // Flatten Menus
  // ===========================================

  loadMenus(): void {

    this.allMenus = [];

    const excludedMenus =
      this.configService.get(
        'excludedMenus'
      ) || [];


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
          // Submenus
          // ---------------------------------------

          if (
            menu.submenus?.length
          ) {

            menu.submenus.forEach(
              (sub: any) => {

                if (sub.routerlink) {

                  this.allMenus.push({

                    name:
                      sub.name,

                    routerlink:
                      this.UI_URL +
                      sub.UIrouterlink

                  });

                }

              }
            );

          }


          // ---------------------------------------
          // Main Menu
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

        (menu.name || '')
          .toLowerCase()
          .includes(search)

        ||

        (menu.routerlink || '')
          .toLowerCase()
          .includes(search)

    );

  }


  // ===========================================
  // Select Internal Menu
  // ===========================================

  selectMenu(menu: any): void {

    this.selectedMenu =
      menu;


    // -----------------------------------------
    // Set selected page values
    // -----------------------------------------

    this.pageForm.patchValue({

      name:
        menu.name || '',

      link:
        menu.routerlink || ''

    }, {
      emitEvent: false
    });


    // -----------------------------------------
    // Mark fields touched
    // -----------------------------------------

    this.pageForm
      .get('name')
      ?.markAsTouched();

    this.pageForm
      .get('link')
      ?.markAsTouched();


    // -----------------------------------------
    // Run duplicate validators
    // -----------------------------------------

    this.pageForm
      .get('name')
      ?.updateValueAndValidity();

    this.pageForm
      .get('link')
      ?.updateValueAndValidity();


    // -----------------------------------------
    // Close dropdown
    // -----------------------------------------

    this.showMenus = false;

    this.searchControl.setValue('', {
      emitEvent: false
    });

  }


  // ===========================================
  // Submit
  // ===========================================

  isSubmitting = false;

  submit(): void {

    // -----------------------------------------
    // Internal page must be selected
    // -----------------------------------------

    if (
      this.pageForm.get('type')?.value ===
      'internal'
    ) {

      if (!this.selectedMenu) {

        const linkControl =
          this.pageForm.get('link');

        linkControl?.setErrors({
          ...(linkControl.errors || {}),
          required: true
        });

        linkControl?.markAsTouched();

        return;

      }

    }


    // -----------------------------------------
    // Run all validators
    // -----------------------------------------

    this.pageForm
      .get('name')
      ?.updateValueAndValidity();

    this.pageForm
      .get('link')
      ?.updateValueAndValidity();


    // -----------------------------------------
    // Invalid form
    // -----------------------------------------

    if (
      this.pageForm.invalid
    ) {

      this.pageForm.markAllAsTouched();

      return;

    }


    // -----------------------------------------
    // Submit
    // -----------------------------------------

    this.isSubmitting = true;


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


    this.save.emit(
      importantLink
    );


    setTimeout(() => {

      this.isSubmitting = false;

    }, 5000);

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

    }, {
      emitEvent: false
    });


    this.pageForm.get('name')?.setErrors(null);
    this.pageForm.get('link')?.setErrors(null);


    this.selectedMenu = null;

    this.searchControl.setValue('', {
      emitEvent: false
    });

    this.showMenus = false;

    this.isSubmitting = false;

    this.close.emit();

  }

}
