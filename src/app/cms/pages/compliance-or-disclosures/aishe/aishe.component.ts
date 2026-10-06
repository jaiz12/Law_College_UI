import {
  Component,
  OnInit,
  signal,
  inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from '../../../../services/config.service';
import { ValidationService } from '../../../../services/validation-service.service';
import { CKEditorConfigService } from '../../../../services/ckeditor-config.service';

import { finalize } from 'rxjs/operators';

import { LayoutService } from '../../../layout/services/layout.service';


@Component({
  selector: 'app-aishe',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './aishe.component.html',
  styleUrl: './aishe.component.scss'
})
export class AisheComponent implements OnInit {

  public Editor: any;

  pageForm: FormGroup;

  loggedInId = signal('');

  editorConfig: any;

  isSubmitting = false;

  isEdit = false;

  pageName: string = "AISHE";

  private platformId = inject(PLATFORM_ID);


  // =====================================================
  // FILE VARIABLES
  // =====================================================

  selectedFile: File | null = null;

  existingFile: string | null = null;

  fileName = '';

  dragging = false;

  imageURL = signal('');

  // =====================================================
  // FILE VALIDATION
  // =====================================================

  readonly allowedExtensions = [
    '.pdf'
  ];

  readonly allowedMimeTypes = [
    'application/pdf'
  ];

  readonly maxFileSize = 5 * 1024 * 1024; // 5 MB


  constructor(
    private fb: FormBuilder,
    private apiservice: CmsApiService,
    private toastr: ToastrService,
    private config: ConfigService,
    private ckEditorConfig: CKEditorConfigService,
    private layout: LayoutService
  ) {

    this.Editor = this.ckEditorConfig.Editor;

    this.editorConfig =
      this.ckEditorConfig.getConfig();


    // =====================================================
    // FORM
    // =====================================================

    this.pageForm = this.fb.group({

      id: [''],

      pageName: [''],

      // CKEditor is NOT required
      content: [''],

      // PDF is REQUIRED
      file: [
        null,
        Validators.required
      ]

    });

  }


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.get();

    this.imageURL.set(
      this.config.get('IMAGE_API_URL')
    );
    console.log(this.imageURL)

    if (isPlatformBrowser(this.platformId)) {

      const userString =
        localStorage.getItem('user');

      if (userString) {

        const currentUser =
          JSON.parse(userString);

        this.loggedInId.set(
          currentUser.id
        );

      }

    }

  }


  // =====================================================
  // GET
  // =====================================================

  get(): void {

    this.layout.showPageLoader();

    this.apiservice
      .GetRequest('ComplianceOrDisclosures/' + this.pageName)
      .pipe(
        finalize(() => {

          this.layout.hidePageLoader();

        })
      )
      .subscribe({

        next: (res: any) => {

          const data =
            Array.isArray(res)
              ? res[0]
              : res;


          // =================================================
          // NO RECORD
          // =================================================

          if (!data) {

            this.isEdit = false;

            this.pageForm.reset({
              id: '',
              pageName: this.pageName,
              content: '',
              file: null
            });

            this.selectedFile = null;

            this.existingFile = null;

            this.fileName = '';

            return;

          }


          // =================================================
          // EDIT MODE
          // =================================================

          this.isEdit = true;


          // =================================================
          // EXISTING PDF
          // =================================================

          this.existingFile =
            data.filePath ??
            data.file ??
            data.pdfFile ??
            null;


          this.fileName =
            this.getFileName(
              this.existingFile
            );


          // =================================================
          // BIND FORM
          // =================================================

          this.pageForm.patchValue({

            id: data.id ?? '',

            pageName: data.pageName ?? '',

            content: data.content ?? '',

            // Existing PDF satisfies required validation
            file: this.fileName || null

          });


          // =================================================
          // CLEAR NEW FILE
          // =================================================

          this.selectedFile = null;


          // =================================================
          // FILE VALIDATION
          // =================================================

          const fileControl =
            this.pageForm.get('file');

          if (this.fileName) {

            fileControl?.setErrors(null);

          }
          else {

            fileControl?.setErrors({
              required: true
            });

          }

        },

        error: (err) => {

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

    const fileControl =
      this.pageForm.get('file');


    // ===================================================
    // CHECK PDF
    // ===================================================

    if (
      !this.selectedFile &&
      !this.existingFile
    ) {

      fileControl?.setErrors({
        required: true
      });

      fileControl?.markAsTouched();

    }


    // ===================================================
    // FORM VALIDATION
    // ===================================================

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }


    this.isSubmitting = true;


    const id =
      this.pageForm.get('id')?.value;

    const content =
      this.pageForm.get('content')?.value ?? '';

    console.log(this.pageForm.value);

    // ===================================================
    // FORM DATA
    // ===================================================

    const formData =
      new FormData();

    // CKEditor content is optional
    formData.append(
      'PageName',
      this.pageName
    );


    // CKEditor content is optional
    formData.append(
      'Content',
      content
    );


    // ===================================================
    // CREATE
    // ===================================================

    if (!id) {

      formData.append(
        'CreatedBy',
        this.loggedInId()
      );


      // New PDF is mandatory during creation
      if (this.selectedFile) {

        formData.append(
          'File',
          this.selectedFile,
          this.selectedFile.name
        );

      }


      this.create(formData);

    }


    // ===================================================
    // UPDATE
    // ===================================================

    else {

      formData.append(
        'Id',
        id.toString()
      );


      formData.append(
        'UpdatedBy',
        this.loggedInId()
      );


      // Send PDF only when user selected a new PDF
      if (this.selectedFile) {

        formData.append(
          'File',
          this.selectedFile,
          this.selectedFile.name
        );

      }


      this.update(
        Number(id),
        formData
      );

    }

  }


  // =====================================================
  // CREATE
  // =====================================================

  private create(
    formData: FormData
  ): void {

    this.apiservice
      .PostRequest(
        'ComplianceOrDisclosures',
        formData,
        true
      )
      .pipe(
        finalize(() => {

          this.isSubmitting = false;

        })
      )
      .subscribe({

        next: (res: any) => {

          if (res.isSucceeded) {

            this.toastr.success(
              res.message
            );


            this.pageForm.reset({
              id: '',
              pageName: this.pageName,
              content: '',
              file: null
            });


            this.selectedFile = null;

            this.existingFile = null;

            this.fileName = '';


            this.isEdit = false;


            this.get();

          }
          else {

            this.toastr.warning(
              res.message
            );

          }

        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||
            err?.message ||
            'Something went wrong.',

            'Error'

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

    this.apiservice
      .PutRequest(
        'ComplianceOrDisclosures',
        formData,
        true
      )
      .pipe(
        finalize(() => {

          this.isSubmitting = false;

        })
      )
      .subscribe({

        next: (res: any) => {

          if (res.isSucceeded) {

            this.toastr.success(
              res.message
            );


            this.selectedFile = null;


            this.get();

          }
          else {

            this.toastr.warning(
              res.message
            );

          }

        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||
            err?.message ||
            'Something went wrong.',

            'Error'

          );

        }

      });

  }


  // =====================================================
  // FILE CHANGE
  // =====================================================

  onFileChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (!input.files?.length) {

      return;

    }


    this.loadFile(
      input.files[0]
    );


    // Allow selecting same file again
    input.value = '';

  }


  // =====================================================
  // LOAD FILE
  // =====================================================

  loadFile(
    file: File
  ): void {

    const fileControl =
      this.pageForm.get('file');


    const validationError =
      this.validateFile(file);


    // ===================================================
    // INVALID
    // ===================================================

    if (validationError) {

      this.selectedFile = null;

      this.fileName = '';

      this.existingFile = null;


      fileControl?.setErrors(
        validationError
      );

      fileControl?.markAsTouched();

      return;

    }


    // ===================================================
    // VALID
    // ===================================================

    this.selectedFile = file;

    this.fileName = file.name;


    fileControl?.setValue(
      file.name
    );


    fileControl?.setErrors(null);

    fileControl?.markAsTouched();


    // New PDF replaces existing PDF
    this.existingFile = null;

  }


  // =====================================================
  // VALIDATE FILE
  // =====================================================

  private validateFile(
    file: File
  ): { [key: string]: boolean } | null {


    const fileName =
      file.name
        .trim()
        .toLowerCase();


    const extension =
      fileName.substring(
        fileName.lastIndexOf('.')
      );


    // ===================================================
    // EXTENSION
    // ===================================================

    if (
      !this.allowedExtensions.includes(
        extension
      )
    ) {

      return {
        invalidFileType: true
      };

    }


    // ===================================================
    // MIME TYPE
    // ===================================================

    if (
      !this.allowedMimeTypes.includes(
        file.type
      )
    ) {

      return {
        invalidFileType: true
      };

    }


    // ===================================================
    // FILE SIZE
    // ===================================================

    if (
      file.size > this.maxFileSize
    ) {

      return {
        maxFileSize: true
      };

    }


    return null;

  }


  // =====================================================
  // DRAG OVER
  // =====================================================

  onDragOver(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = true;

  }


  // =====================================================
  // DRAG LEAVE
  // =====================================================

  onDragLeave(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;

  }


  // =====================================================
  // DROP
  // =====================================================

  onDrop(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;


    const file =
      event.dataTransfer
        ?.files?.[0];


    if (file) {

      this.loadFile(file);

    }

  }


  // =====================================================
  // REMOVE FILE
  // =====================================================

  removeFile(): void {

    this.selectedFile = null;

    this.fileName = '';

    this.existingFile = null;


    const fileControl =
      this.pageForm.get('file');


    fileControl?.setValue(null);


    // PDF is always required
    fileControl?.setErrors({
      required: true
    });


    fileControl?.markAsTouched();

    fileControl?.updateValueAndValidity();

  }


  // =====================================================
  // GET FILE NAME
  // =====================================================

  private getFileName(
    path: string | null
  ): string {

    if (!path) {

      return '';

    }


    return path
      .split('/')
      .pop()
      ?.split('\\')
      .pop()
      ?? '';

  }

}
