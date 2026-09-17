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
import { DublicateValidationService } from '../../../../services/dublicate-validation.-service.service';

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

  private dublicateValidationService =
    inject(DublicateValidationService);


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(
    private config: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {

    // =================================================
    // CKEDITOR
    // =================================================

    this.Editor =
      this.ckEditorConfig.Editor;

    this.editorConfig =
      this.ckEditorConfig.getConfig();


    // =================================================
    // LOAD MENUS
    // =================================================

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

  @Input()
  items: Banner[] = [];


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
  // SUBMITTING
  // ===================================================

  isSubmitting = false;


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

      // -----------------------------------------------
      // ID
      // -----------------------------------------------

      id:
        this.fb.control<number | null>(
          null
        ),


      // -----------------------------------------------
      // PAGE NAME
      // -----------------------------------------------

      pageName:
        this.fb.control<string>(
          '',
          {
            validators: [

              Validators.required,

              Validators.maxLength(100),

              this.validationService
                .noWhitespaceValidator(),

              this.dublicateValidationService
                .duplicateValidator(
                  () => this.items,
                  ['pageName']
                )

            ],

            nonNullable: true
          }
        ),


      // -----------------------------------------------
      // CONTENT
      // -----------------------------------------------

      content:
        this.fb.control(
          '',
          {
            nonNullable: true
          }
        ),


      // -----------------------------------------------
      // IMAGE
      // -----------------------------------------------

      image:
        this.fb.control<string | null>(
          null,
          {
            validators: [
              Validators.required
            ]
          }
        )

    });


  // ===================================================
  // FILE VALIDATION
  // ===================================================

  readonly allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp'
  ];

  readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  readonly maxFileSize =
    1 * 1024 * 1024; // 1 MB


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

    // =================================================
    // EDIT MODE
    // =================================================

    if (this.banner) {

      this.pageForm.patchValue({

        id:
          this.banner.id,

        pageName:
          this.banner.pageName ?? '',

        content:
          this.banner.content ?? '',

        image:
          this.banner.image ?? ''

      });


      // -----------------------------------------------
      // EXISTING IMAGE
      // -----------------------------------------------

      if (this.banner.image) {

        this.imagePreview =
          this.config.get('IMAGE_API_URL') +
          this.banner.image;

        this.selectedFile = null;

        this.pageForm
          .get('image')
          ?.setErrors(null);

      }

      else {

        this.imagePreview = null;

        this.selectedFile = null;

        this.pageForm
          .get('image')
          ?.setErrors({
            required: true
          });

      }

    }

    // =================================================
    // CREATE MODE
    // =================================================

    else {

      this.pageForm.reset({

        id: null,

        pageName: '',

        content: '',

        image: null

      });

      this.imagePreview = null;

      this.selectedFile = null;

      this.pageForm
        .get('image')
        ?.setErrors({
          required: true
        });

    }


    // =================================================
    // RESET MENU
    // =================================================

    this.selectedMenu = null;

    this.searchControl.setValue(
      '',
      {
        emitEvent: false
      }
    );

    this.showMenus = false;


    // =================================================
    // REVALIDATE PAGE NAME
    // =================================================

    this.pageForm
      .get('pageName')
      ?.updateValueAndValidity({
        emitEvent: false
      });

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
              "Home",
            routerlink:
              this.UI_URL

          })

          if (
            menu.submenus?.length
          ) {

            menu.submenus.forEach(
              (sub: any) => {

                if (sub.name) {

                  this.allMenus.push({

                    name:
                      sub.name,

                    routerlink:
                      this.UI_URL +
                      (sub.UIrouterlink || '')

                  });

                }

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
                menu.name,

              routerlink:
                this.UI_URL +
                (menu.UIrouterlink || '')

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

        (menu.name || '')
          .toLowerCase()
          .includes(search)

        ||

        (menu.routerlink || '')
          .toLowerCase()
          .includes(search)

    );

  }


  // ===================================================
  // SELECT MENU
  // ===================================================

  selectMenu(
    menu: any
  ): void {

    this.selectedMenu =
      menu;


    this.pageForm.patchValue({

      pageName:
        menu.name

    });


    this.showMenus = false;

    this.searchControl.setValue('');


    // Re-run duplicate validation
    this.pageForm
      .get('pageName')
      ?.updateValueAndValidity();


    this.pageForm
      .get('pageName')
      ?.markAsTouched();

  }


  // ===================================================
  // VALIDATE FILE
  // ===================================================

  private validateFile(
    file: File
  ):
    'invalidFileType'
    | 'fileTooLarge'
    | null {

    const fileName =
      file.name.toLowerCase();


    const lastDot =
      fileName.lastIndexOf('.');


    const extension =
      lastDot >= 0
        ? fileName.substring(lastDot)
        : '';


    // ===============================================
    // EXTENSION
    // ===============================================

    const validExtension =
      this.allowedExtensions.includes(
        extension
      );


    // ===============================================
    // MIME TYPE
    // ===============================================

    const validMimeType =
      this.allowedMimeTypes.includes(
        file.type
      );


    // ===============================================
    // FILE TYPE
    // ===============================================

    if (
      !validExtension ||
      !validMimeType
    ) {

      return 'invalidFileType';

    }


    // ===============================================
    // FILE SIZE
    // ===============================================

    if (
      file.size > this.maxFileSize
    ) {

      return 'fileTooLarge';

    }


    return null;

  }


  // ===================================================
  // PROCESS VALID FILE
  // ===================================================

  private processValidFile(
    file: File
  ): void {

    this.selectedFile =
      file;


    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreview =
        reader.result as string;


      const imageControl =
        this.pageForm.get('image');


      imageControl?.setValue(
        this.imagePreview
      );


      imageControl?.setErrors(null);

      imageControl?.markAsTouched();

      imageControl?.updateValueAndValidity({
        emitEvent: false
      });

    };


    reader.readAsDataURL(file);

  }


  // ===================================================
  // FILE CHANGE
  // ===================================================

  onFileChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files?.length
    ) {

      return;

    }


    const file =
      input.files[0];


    const error =
      this.validateFile(file);


    // ===============================================
    // INVALID FILE
    // ===============================================

    if (error) {

      this.selectedFile =
        null;

      this.imagePreview =
        null;


      const imageControl =
        this.pageForm.get('image');


      imageControl?.setErrors({

        [error]: true

      });


      imageControl?.markAsTouched();


      input.value = '';

      return;

    }


    // ===============================================
    // VALID FILE
    // ===============================================

    this.processValidFile(file);


    input.value = '';

  }


  // ===================================================
  // DRAG OVER
  // ===================================================

  onDragOver(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = true;

  }


  // ===================================================
  // DRAG LEAVE
  // ===================================================

  onDragLeave(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;

  }


  // ===================================================
  // DROP
  // ===================================================

  onDrop(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;


    const file =
      event.dataTransfer?.files?.[0];


    if (!file) {

      return;

    }


    const error =
      this.validateFile(file);


    // ===============================================
    // INVALID FILE
    // ===============================================

    if (error) {

      this.selectedFile = null;

      this.imagePreview = null;


      const imageControl =
        this.pageForm.get('image');


      imageControl?.setErrors({

        [error]: true

      });


      imageControl?.markAsTouched();

      return;

    }


    // ===============================================
    // VALID FILE
    // ===============================================

    this.processValidFile(file);

  }


  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;


    const imageControl =
      this.pageForm.get('image');


    imageControl?.setValue(null);


    imageControl?.setErrors({

      required: true

    });


    imageControl?.markAsTouched();

    imageControl?.updateValueAndValidity();

  }


  // ===================================================
  // SUBMIT
  // ===================================================

  submit(): void {

    const pageNameControl =
      this.pageForm.get('pageName');


    const imageControl =
      this.pageForm.get('image');


    // =================================================
    // PAGE NAME
    // =================================================

    pageNameControl
      ?.updateValueAndValidity();


    // =================================================
    // IMAGE REQUIRED
    // =================================================

    if (
      !this.isEditMode &&
      !this.selectedFile &&
      !this.imagePreview
    ) {

      imageControl?.setErrors({

        ...(imageControl.errors || {}),

        required: true

      });

    }


    // =================================================
    // FORM INVALID
    // =================================================

    if (
      this.pageForm.invalid
    ) {

      this.pageForm.markAllAsTouched();

      return;

    }


    // =================================================
    // SUBMITTING
    // =================================================

    this.isSubmitting = true;


    const value =
      this.pageForm.getRawValue();


    // =================================================
    // SAVE
    // =================================================

    this.save.emit({

      id:
        value.id ?? 0,

      pageName:
        value.pageName.trim(),

      content:
        value.content,

      image:
        this.banner?.image ?? null,

      imagePath:
        this.selectedFile

    });


    // Keep your existing behavior.
    // Parent can close the modal after save.

    setTimeout(() => {

      this.isSubmitting = false;

    }, 5000);

  }


  // ===================================================
  // CANCEL
  // ===================================================

  cancel(): void {

    this.close.emit();

  }

}
