import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  selector: 'app-national-cadet-crops',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    CKEditorModule],
  templateUrl: './national-cadet-crops.component.html',
  styleUrl: './national-cadet-crops.component.scss'
})
export class NationalCadetCropsComponent implements OnInit {

  public Editor: any = null;

  imagePreview: string | null = null;
  pageForm: FormGroup;
  loggedInId = signal('');
  pageName: string = "National Cadet Crops";
  public editorConfig: any = null;
  isSubmitting = false;
  isEdit = false;

  private platformId = inject(PLATFORM_ID);
  imageURL = signal('');

  // =========================================
  // FILE VARIABLES
  // =========================================

  selectedFile: File | null = null;

  existingFile: string | null = null;

  fileName = '';

  dragging = false;


  readonly allowedExtensions = [
    '.pdf'
  ];


  readonly allowedMimeTypes = [
    'application/pdf'
  ];


  readonly maxFileSize =
    5 * 1024 * 1024; // 5 MB
  constructor(
    private fb: FormBuilder,
    private apiservice: CmsApiService,
    private toastr: ToastrService,
    private config: ConfigService,
    private validationService: ValidationService,
    private ckEditorConfig: CKEditorConfigService,
    private layout: LayoutService
  ) {

    this.pageForm = this.fb.group({
      id: [''],
      pageName: [''],
      content: ['', {
        validators: [
          Validators.required,
          this.validationService.noWhitespaceValidator()
        ],
        nonNullable: true
      }],
      file: this.fb.control<string | null>(null)
    });
  }

  ngOnInit() {
    this.get();

    this.imageURL.set(
      this.config.get('IMAGE_API_URL')
    );

    if (isPlatformBrowser(this.platformId)) {
      try {
        this.Editor = this.ckEditorConfig.loadEditor();
        this.editorConfig = this.ckEditorConfig.getConfig();
      } catch (error) {
        console.error('Failed to load editor:', error);
        this.toastr.error('Unable to load the text editor.');
      }
      const userString = localStorage.getItem('user');

      if (userString) {
        const currentUser = JSON.parse(userString);
        this.loggedInId.set(currentUser.id);
      }
    }
  }

  get(): void {
    this.layout.showPageLoader();
    this.apiservice.GetRequest('StudentLife/0/' + this.pageName).pipe(
      finalize(() => {
        this.layout.hidePageLoader();
      })
    ).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res[0] : res;

        if (!data) {
          return;
        }

        this.pageForm.patchValue({
          id: data.id ?? '',
          pageName: data.pageName ?? '',
          content: data.content ?? '',
          file: data.filePath ?? null
        });
        // Existing PDF

        this.existingFile =
          data.filePath ?? null;


        this.fileName =
          this.getFileName(
            this.existingFile
          );


        // Reset selected file

        this.selectedFile = null;


        this.pageForm
          .get('file')
          ?.setErrors(null);
        this.isEdit = true;
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

  // =========================================
  // FILE SELECTION
  // =========================================

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


    // Allow selecting the same
    // file again

    input.value = '';

  }


  // =========================================
  // FILE LOADING & VALIDATION
  // =========================================

  loadFile(
    file: File
  ): void {

    const fileControl =
      this.pageForm.get('file');


    const validationError =
      this.validateFile(file);


    // =====================================
    // INVALID
    // =====================================

    if (validationError) {

      this.selectedFile = null;

      this.fileName = '';

      fileControl?.setErrors(
        validationError
      );

      fileControl?.markAsTouched();

      return;

    }


    // =====================================
    // VALID
    // =====================================

    this.selectedFile = file;

    this.fileName = file.name;


    fileControl?.setValue(
      file.name
    );


    fileControl?.setErrors(null);

    fileControl?.markAsTouched();


    /*
     * New PDF selected.
     *
     * Existing PDF should no longer
     * be submitted as the selected file.
     */

    this.existingFile = null;

  }


  // =========================================
  // COMPLETE FILE VALIDATION
  // =========================================

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


    // =====================================
    // EXTENSION
    // =====================================

    if (
      !this.allowedExtensions
        .includes(extension)
    ) {

      return {
        invalidFileType: true
      };

    }


    // =====================================
    // MIME TYPE
    // =====================================

    if (
      !this.allowedMimeTypes
        .includes(file.type)
    ) {

      return {
        invalidFileType: true
      };

    }


    // =====================================
    // FILE SIZE
    // =====================================

    if (
      file.size > this.maxFileSize
    ) {

      return {
        maxFileSize: true
      };

    }


    return null;

  }


  // =========================================
  // DRAG & DROP
  // =========================================

  onDragOver(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = true;

  }


  onDragLeave(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;

  }


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


  // =========================================
  // REMOVE FILE
  // =========================================

  removeFile(): void {

    this.selectedFile = null;

    this.fileName = '';

    const fileControl =
      this.pageForm.get('file');

    fileControl?.setValue(null);


    /*
     * Creation:
     * File is required.
     */

    if (!this.isEdit) {

      this.existingFile = null;

      fileControl?.setErrors({
        required: true
      });

    }

    else {

      /*
       * Editing:
       * If existing file was removed,
       * require a replacement file.
       */

      this.existingFile = null;

      fileControl?.setErrors({
        required: true
      });

    }

    fileControl?.markAsTouched();

    fileControl?.updateValueAndValidity();
  }


  // =========================================
  // GET FILE NAME
  // =========================================

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
      .pop() ?? '';

  }

  save(): void {
    const content = this.pageForm.get('content')?.value ?? '';
    const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();

    if (!plainText) {
      this.pageForm.get('content')?.setErrors({ required: true });
    } else {
      this.pageForm.get('content')?.setErrors(null);
    }

    const id = this.pageForm.get('id')?.value;

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }
    // =====================================
    // FILE VALIDATION
    // =====================================

    /*
     * Create:
     * A file is mandatory.
     *
     * Edit:
     * Existing file OR newly selected file
     * must be available.
     */
    const fileControl =
      this.pageForm.get('file');

    if (
      !this.selectedFile &&
      !this.existingFile
    ) {

      fileControl?.setErrors({
        required: true
      });

      fileControl?.markAsTouched();
    }

    this.isSubmitting = true;

    const formData = new FormData();

    formData.append('PageName', this.pageName);
    formData.append('Content', content);

    if (this.selectedFile) {
      formData.append(
        'File',
        this.selectedFile,
        this.selectedFile.name
      );
    }

    if (id) {
      formData.append('Id', id.toString());
      formData.append('UpdatedBy', this.loggedInId());
      this.update(id, formData);
    } else {
      formData.append('CreatedBy', this.loggedInId());
      this.create(formData);
    }
  }

  private create(formData: FormData): void {
    this.apiservice.PostRequest('StudentLife', formData, true)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (res.isSucceeded) {
            this.toastr.success(res.message);
            this.pageForm.reset({
              id: '',
              pageName: 'National Cadet Crops',
              content: '',
              file: null
            });
            this.selectedFile = null;
            this.existingFile = null;
            this.fileName = '';
            this.imagePreview = null;
            this.get();
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Something went wrong.'
          );
        }
      });
  }

  private update(id: number, formData: FormData): void {
    this.apiservice.PutRequest('StudentLife', formData, true)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res: any) => {
          if (res.isSucceeded) {
            this.toastr.success(res.message);
            this.selectedFile = null;
            this.get();
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Something went wrong.'
          );
        }
      });
  }
}
