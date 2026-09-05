import { CommonModule } from '@angular/common';

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
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { ConfigService } from '../../../../services/config.service';
import { CKEditorConfigService } from '../../../../services/ckeditor-config.service';
import { ValidationService } from '../../../../services/validation-service.service';

import { Banner } from '../banner.component';


@Component({
  selector: 'app-banner-modal',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],

  templateUrl: './banner-modal.component.html',

  styleUrl: './banner-modal.component.scss'
})
export class BannerModalComponent
  implements OnChanges {


  // ===================================================
  // SERVICES
  // ===================================================

  private fb =
    inject(FormBuilder);

  private validationService =
    inject(ValidationService);


  constructor(
    private config: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {

    // ===============================================
    // CKEDITOR
    // ===============================================

    this.Editor =
      this.ckEditorConfig.Editor;

    this.editorConfig =
      this.ckEditorConfig.getConfig();


    // ===============================================
    // LOAD MENUS
    // ===============================================

    this.menus =
      this.config.get('menus') || [];

    this.UI_URL =
      this.config.get('UI_URL') || '';

    this.loadMenus();

  }


  // ===================================================
  // CKEDITOR
  // ===================================================

  public Editor: any;

  public editorConfig: any;


  // ===================================================
  // MENU
  // ===================================================

  menus: any[] = [];

  allMenus: any[] = [];

  selectedMenu: any = null;

  showMenus = false;

  UI_URL = '';


  searchControl =
    new FormControl(
      '',
      {
        nonNullable: true
      }
    );


  // ===================================================
  // INPUT
  // ===================================================

  @Input()
  banner: Banner | null = null;


  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  save =
    new EventEmitter<Banner>();


  @Output()
  close =
    new EventEmitter<void>();


  // ===================================================
  // IMAGE
  // ===================================================

  imagePreview:
    string | ArrayBuffer | null = null;

  selectedFile:
    File | null = null;

  dragging = false;


  // ===================================================
  // FORM
  // ===================================================

  pageForm =
    this.fb.group({

      id:
        this.fb.control<number | null>(
          null
        ),

      pageName:
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

      content:
        this.fb.control(
          '',
          {

            nonNullable: true

          }
        ),

      image:
        this.fb.control<string | null>(
          null, {
          validators: [
            Validators.required
          ]
        }
        )

    });


  // ===================================================
  // ALLOWED FILE TYPES
  // ===================================================

  readonly allowedExtensions = [

    '.png',
    '.jpg',
    '.jpeg',
    '.webp'

  ];


  // ===================================================
  // EDIT MODE
  // ===================================================

  get isEditMode(): boolean {

    return !!this.banner;

  }


  // ===================================================
  // INPUT CHANGES
  // ===================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    // ===============================================
    // EDIT MODE
    // ===============================================

    if (this.banner) {

      this.pageForm.patchValue({

        id:
          this.banner.id,

        pageName:
          this.banner.pageName,

        content:
          this.banner.content ?? '',

        image:
          this.banner.image

      });


      // =============================================
      // FIND SELECTED MENU
      // =============================================

      this.selectedMenu =
        this.allMenus.find(
          menu =>
            menu.name ===
            this.banner?.pageName
        ) ?? null;


      // =============================================
      // EXISTING IMAGE
      // =============================================

      const imagePath =
        this.banner.image;


      if (imagePath) {

        this.imagePreview =
          this.config.get('IMAGE_API_URL') +
          imagePath;

        // Existing image is valid
        this.pageForm.controls.image.setErrors(null);
      }

      else {

        this.imagePreview =
          null;
        // No existing image
        this.pageForm.controls.image.setErrors({
          required: true
        });

      }


      this.selectedFile =
        null;


      this.pageForm
        .get('image')
        ?.setErrors(null);


      this.showMenus =
        false;


      this.searchControl.setValue(
        ''
      );

    }

    // ===============================================
    // CREATE MODE
    // ===============================================

    else {

      this.pageForm.reset({

        id:
          null,

        pageName:
          '',

        content:
          '',

        image:
          null

      });


      this.selectedMenu =
        null;


      this.imagePreview =
        null;


      this.selectedFile =
        null;


      this.showMenus =
        false;


      this.searchControl.setValue(
        ''
      );


      this.pageForm
        .get('image')
        ?.setErrors(null);

    }

  }


  // ===================================================
  // SELECT MENU
  // ===================================================

  selectMenu(
    menu: any
  ): void {

    // ===============================================
    // SET SELECTED MENU
    // ===============================================

    this.selectedMenu =
      menu;


    // ===============================================
    // SET PAGE NAME
    // ===============================================

    this.pageForm.patchValue({

      pageName:
        menu.name

    });


    // ===============================================
    // CLOSE DROPDOWN
    // ===============================================

    this.showMenus =
      false;


    // ===============================================
    // CLEAR SEARCH
    // ===============================================

    this.searchControl.setValue(
      ''
    );


    // ===============================================
    // CLEAR PAGE NAME VALIDATION
    // ===============================================

    this.pageForm
      .get('pageName')
      ?.setErrors(null);

  }


  // ===================================================
  // LOAD MENUS
  // ===================================================

  loadMenus(): void {

    this.allMenus = [];


    const excludedMenus =
      this.config.get(
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

          // =========================================
          // SUBMENUS
          // =========================================

          this.allMenus.push({

            name:
              "Home"

          })
          if (
            menu.submenus?.length
          ) {

            menu.submenus.forEach(
              (sub: any) => {

                this.allMenus.push({

                  name:
                    sub.name

                });

              }
            );

          }

          // =========================================
          // MAIN MENU
          // =========================================

          else if (
            menu.routerlink
          ) {

            this.allMenus.push({

              name:
                menu.name

            });

          }

          

        }
      );

  }


  // ===================================================
  // FILTER MENUS
  // ===================================================

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


  // ===================================================
  // FILE CHANGE
  // ===================================================

  onFileChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (!input.files?.length) {

      return;

    }


    const file =
      input.files[0];


    if (
      !this.isAllowedFile(file)
    ) {

      this.selectedFile =
        null;

      this.imagePreview =
        null;


      this.pageForm
        .get('image')
        ?.setErrors({

          invalidFileType: true

        });


      this.pageForm
        .get('image')
        ?.markAsTouched();


      input.value = '';

      return;

    }


    this.selectedFile =
      file;


    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreview =
        reader.result as string;


      this.pageForm
        .get('image')
        ?.setValue(
          this.imagePreview
        );


      this.pageForm
        .get('image')
        ?.setErrors(null);

    };


    reader.readAsDataURL(
      file
    );


    input.value = '';

  }


  // ===================================================
  // FILE VALIDATION
  // ===================================================

  private isAllowedFile(
    file: File
  ): boolean {

    const fileName =
      file.name.toLowerCase();


    const extension =
      fileName.substring(
        fileName.lastIndexOf('.')
      );


    return this.allowedExtensions
      .includes(extension);

  }


  // ===================================================
  // DRAG OVER
  // ===================================================

  onDragOver(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging =
      true;

  }


  // ===================================================
  // DRAG LEAVE
  // ===================================================

  onDragLeave(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging =
      false;

  }


  // ===================================================
  // DROP
  // ===================================================

  onDrop(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging =
      false;


    const file =
      event.dataTransfer
        ?.files?.[0];


    if (!file) {

      return;

    }


    if (
      !this.isAllowedFile(file)
    ) {

      this.pageForm
        .get('image')
        ?.setErrors({

          invalidFileType: true

        });


      this.pageForm
        .get('image')
        ?.markAsTouched();


      return;

    }


    this.selectedFile =
      file;


    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreview =
        reader.result as string;


      this.pageForm
        .get('image')
        ?.setValue(
          this.imagePreview
        );


      this.pageForm
        .get('image')
        ?.setErrors(null);

    };


    reader.readAsDataURL(
      file
    );

  }


  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  removeImage(): void {

    this.selectedFile =
      null;

    this.imagePreview =
      null;


    const imageControl =
      this.pageForm.get('image');


    imageControl?.setValue(
      null
    );


    if (!this.isEditMode) {

      imageControl?.setErrors({

        required: true

      });

    }


    imageControl?.markAsTouched();

    imageControl?.updateValueAndValidity();

  }


  // ===================================================
  // SUBMIT
  // ===================================================
  isSubmitting = false;
  submit(): void {

    const pageNameControl =
      this.pageForm.get(
        'pageName'
      );


    const imageControl =
      this.pageForm.get(
        'image'
      );


    // ===============================================
    // PAGE REQUIRED
    // ===============================================

    if (
      !this.selectedMenu
    ) {

      pageNameControl?.setErrors({

        required: true

      });

    }


    // ===============================================
    // IMAGE REQUIRED
    // ===============================================

    if (
      !this.isEditMode &&
      !this.selectedFile &&
      !this.imagePreview
    ) {

      imageControl?.setErrors({

        required: true

      });

    }


    // ===============================================
    // FORM VALIDATION
    // ===============================================

    if (
      this.pageForm.invalid
    ) {

      this.pageForm.markAllAsTouched();

      return;

    }

    this.isSubmitting = true;


    // ===============================================
    // VALUES
    // ===============================================

    const value =
      this.pageForm.getRawValue();

      console.log(value)
    // ===============================================
    // SAVE
    // ===============================================

    this.save.emit({

      id:
        value.id ?? 0,

      pageName:
        value.pageName,

      content:
        value.content,

      image:
        this.banner?.image ?? null,

      imagePath:
        this.selectedFile

    });

  }


  // ===================================================
  // CANCEL
  // ===================================================

  cancel(): void {

    this.close.emit();

  }

}
