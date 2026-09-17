import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  signal,
  inject,
  PLATFORM_ID,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { ValidationService } from '../../../../services/validation-service.service';
import { CKEditorConfigService } from '../../../../services/ckeditor-config.service';

import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-logo-and-title',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],

  templateUrl: './logo-and-title.component.html',

  styleUrl: './logo-and-title.component.scss'
})
export class LogoAndTitleComponent implements OnInit {

  // =====================================================
  // CKEDITOR
  // =====================================================

  public Editor: any;

  editorConfig: any;


  // =====================================================
  // FORM
  // =====================================================

  pageForm: FormGroup;


  // =====================================================
  // IMAGE
  // =====================================================

  selectedFile: File | null = null;

  imagePreview: string | null = null;

  LogoPath: string = '';


  // =====================================================
  // SUBMIT
  // =====================================================

  isSubmitting = false;


  // =====================================================
  // USER
  // =====================================================

  loggedInId =
    signal('');


  // =====================================================
  // PAGE
  // =====================================================

  pageName =
    'Logo And Title';


  // =====================================================
  // CONSTANTS
  // =====================================================

  readonly maxTitleLength =
    50;


  // =====================================================
  // FILE VALIDATION
  // =====================================================

  readonly allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];


  readonly maxFileSize =
    1 * 1024 * 1024; // 1 MB


  // =====================================================
  // PLATFORM
  // =====================================================

  private platformId =
    inject(PLATFORM_ID);


  // =====================================================
  // VALIDATION SERVICE
  // =====================================================

  private validationService =
    inject(ValidationService);


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private fb: FormBuilder,

    private apiService: CmsApiService,

    private toastr: ToastrService,

    private config: ConfigService,

    private ckEditorConfig: CKEditorConfigService

  ) {

    // ===================================================
    // CKEDITOR
    // ===================================================

    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      this.Editor =
        this.ckEditorConfig.Editor;

    }


    this.editorConfig =
      this.ckEditorConfig.getConfig();


    // ===================================================
    // FORM
    // ===================================================

    this.pageForm =
      this.fb.group({

        id:
          this.fb.control<number | null>(
            null
          ),


        sectionName:
          this.pageName,


        logo:
          this.fb.control<string | null>(
            null,
            {
              validators: [
                Validators.required
              ]
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
          )

      });

  }


  // =====================================================
  // ON INIT
  // =====================================================

  ngOnInit(): void {

    this.get();


    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      const userString =
        localStorage.getItem(
          'user'
        );


      if (userString) {

        const currentUser =
          JSON.parse(
            userString
          );


        this.loggedInId.set(
          currentUser?.id ?? ''
        );

      }

    }

  }


  // =====================================================
  // VALIDATE IMAGE FILE
  // =====================================================

  private validateImageFile(file: File): {
    invalidFileType?: string;
    fileSize?: string;
  } | null {

    // ============================================
    // FILE TYPE
    // ============================================

    if (!this.allowedTypes.includes(file.type.toLowerCase())) {

      return {
        invalidFileType:
          'Only PNG, JPG, JPEG and WEBP images are allowed.'
      };

    }


    // ============================================
    // FILE SIZE
    // ============================================

    if (file.size > this.maxFileSize) {

      return {
        fileSize:
          'Image size cannot exceed 1 MB.'
      };

    }


    return null;
  }


  // =====================================================
  // FILE CHANGE
  // =====================================================

  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file =
      input.files[0];

    const logoControl =
      this.pageForm.get('logo');


    // ============================================
    // VALIDATE FILE
    // ============================================

    const validationError =
      this.validateImageFile(file);


    if (validationError) {

      this.selectedFile = null;

      if (!this.LogoPath) {
        this.imagePreview = null;
      }


      // ==========================================
      // INVALID FILE TYPE
      // ==========================================

      if (validationError.invalidFileType) {

        logoControl?.setErrors({
          invalidFileType:
            validationError.invalidFileType
        });

      }


      // ==========================================
      // FILE SIZE
      // ==========================================

      else if (validationError.fileSize) {

        logoControl?.setErrors({
          fileSize:
            validationError.fileSize
        });

      }


      logoControl?.markAsTouched();

      input.value = '';

      return;
    }


    // ============================================
    // VALID FILE
    // ============================================

    this.selectedFile =
      file;


    // Remove previous file errors

    const errors =
    {
      ...(logoControl?.errors || {})
    };

    delete errors['required'];
    delete errors['invalidFileType'];
    delete errors['fileSize'];


    logoControl?.setErrors(
      Object.keys(errors).length
        ? errors
        : null
    );


    // ============================================
    // PREVIEW
    // ============================================

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

    };

    reader.readAsDataURL(file);


    // Allow selecting same file again

    input.value = '';

  }


  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  removeImage(): void {

    this.selectedFile =
      null;


    this.imagePreview =
      null;


    this.LogoPath =
      '';


    const logoControl =
      this.pageForm.get(
        'logo'
      );


    logoControl?.setValue(
      null
    );


    logoControl?.setErrors({

      required: true

    });


    logoControl?.markAsTouched();


    logoControl?.updateValueAndValidity();

  }


  // =====================================================
  // GET DATA
  // =====================================================

  get(): void {

    this.apiService

      .GetRequest(
        'HeaderAndFooter/0/' +
        this.pageName
      )

      .subscribe({

        next: (res: any) => {

          const data =
            Array.isArray(res)
              ? res[0]
              : res;


          if (!data) {

            return;

          }


          // =============================================
          // PATCH FORM
          // =============================================

          this.pageForm.patchValue({

            id:
              data.id ?? '',

            logo:
              data.logo ??
              data.Logo ??
              data.LogoPath ??
              '',

            name:
              data.name ??
              data.Name ??
              ''

          });


          // =============================================
          // EXISTING LOGO
          // =============================================

          this.LogoPath =
            data.logoPath ??
            data.LogoPath ??
            '';


          // =============================================
          // IMAGE PREVIEW
          // =============================================

          if (this.LogoPath) {

            this.imagePreview =
              this.config.get(
                'IMAGE_API_URL'
              ) +
              this.LogoPath;


            this.pageForm
              .get('logo')
              ?.setErrors(null);

          }

          else {

            this.imagePreview =
              null;


            this.pageForm
              .get('logo')
              ?.setErrors({

                required: true

              });

          }

        },


        error: (err) => {

          console.error(
            'Get Logo And Title Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Something went wrong. Please try again.',

            'Error'

          );

        }

      });

  }


  // =====================================================
  // SAVE
  // =====================================================

  save(): void {

    // ===================================================
    // PREVENT DOUBLE SUBMIT
    // ===================================================

    if (
      this.isSubmitting
    ) {

      return;

    }


    const id =
      this.pageForm
        .get('id')
        ?.value;


    const logoControl =
      this.pageForm.get(
        'logo'
      );


    // ===================================================
    // IMAGE REQUIRED
    // ===================================================

    const hasImage =

      !!this.selectedFile ||

      !!this.LogoPath ||

      !!this.imagePreview;


    if (!hasImage) {

      logoControl?.setErrors({

        ...(logoControl.errors || {}),

        required: true

      });


      logoControl?.markAsTouched();

      logoControl?.updateValueAndValidity();

      return;

    }


    // ===================================================
    // VALIDATE NEW FILE
    // ===================================================

    if (
      this.selectedFile
    ) {

      const validationError =
        this.validateImageFile(
          this.selectedFile
        );


      if (validationError) {

        logoControl?.setErrors({

          ...(logoControl.errors || {}),

          invalidFile:
            validationError

        });


        logoControl?.markAsTouched();



        return;

      }

    }


    // ===================================================
    // REMOVE FILE VALIDATION ERRORS
    // ===================================================

    const errors =
    {
      ...(logoControl?.errors || {})
    };


    delete errors['required'];

    delete errors['invalidFile'];


    logoControl?.setErrors(

      Object.keys(errors).length

        ? errors

        : null

    );


    // ===================================================
    // FORM VALIDATION
    // ===================================================

    if (
      this.pageForm.invalid
    ) {

      this.pageForm.markAllAsTouched();

      return;

    }


    // ===================================================
    // START SUBMIT
    // ===================================================

    this.isSubmitting =
      true;


    try {

      const formData =
        new FormData();


      // ===============================================
      // FILE
      // ===============================================

      if (
        this.selectedFile
      ) {

        formData.append(

          'Logo',

          this.selectedFile,

          this.selectedFile.name

        );

      }


      // ===============================================
      // NAME
      // ===============================================

      formData.append(

        'Name',

        this.pageForm
          .get('name')
          ?.value ?? ''

      );


      // ===============================================
      // SECTION NAME
      // ===============================================

      formData.append(

        'SectionName',

        this.pageForm
          .get('sectionName')
          ?.value ?? ''

      );


      // ===============================================
      // UPDATE
      // ===============================================

      if (id) {

        formData.append(

          'Id',

          id.toString()

        );


        formData.append(

          'UpdatedBy',

          this.loggedInId()

        );


        this.update(

          id,

          formData

        );

      }


      // ===============================================
      // CREATE
      // ===============================================

      else {

        formData.append(

          'CreatedBy',

          this.loggedInId()

        );


        this.create(
          formData
        );

      }

    }

    catch (error) {

      console.error(

        'Error while saving Logo and Title:',

        error

      );


      this.isSubmitting =
        false;


      this.toastr.error(

        'Something went wrong while saving.'

      );

    }

  }


  // =====================================================
  // CREATE
  // =====================================================

  private create(
    formData: FormData
  ): void {

    this.apiService

      .PostRequest(
        'HeaderAndFooter',
        formData,
        true
      )

      .pipe(

        finalize(
          () =>
            this.isSubmitting =
            false
        )

      )

      .subscribe({

        next: (res: any) => {

          if (
            res?.isSucceeded
          ) {

            this.toastr.success(

              res.message ||

              'Logo and Title created successfully.'

            );


            this.selectedFile =
              null;


            this.imagePreview =
              null;


            this.LogoPath =
              '';


            this.get();

          }

          else {

            this.toastr.warning(

              res?.message ||

              'Unable to create Logo and Title.'

            );

          }

        },


        error: (err) => {

          console.error(

            'Create Logo And Title Error:',

            err

          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Something went wrong.'

          );

        }

      });

  }


  // =====================================================
  // UPDATE
  // =====================================================

  private update(

    id: number,

    formData: FormData

  ): void {

    this.apiService

      .PutRequest(

        'HeaderAndFooter',

        formData,

        true

      )

      .pipe(

        finalize(

          () =>

            this.isSubmitting =
            false

        )

      )

      .subscribe({

        next: (res: any) => {

          if (
            res?.isSucceeded
          ) {

            this.toastr.success(

              res.message ||

              'Logo and Title updated successfully.'

            );


            this.selectedFile =
              null;


            this.get();

          }

          else {

            this.toastr.warning(

              res?.message ||

              'Unable to update Logo and Title.'

            );

          }

        },


        error: (err) => {

          console.error(

            'Update Logo And Title Error:',

            err

          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Something went wrong.'

          );

        }

      });

  }

}
