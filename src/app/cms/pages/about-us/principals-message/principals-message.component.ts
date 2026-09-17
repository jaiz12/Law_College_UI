import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
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
  selector: 'app-principals-message',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './principals-message.component.html'
})
export class PrincipalsMessageComponent implements OnInit {

  public Editor: any;
  editorConfig: any;

  pageForm: FormGroup;

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isDragging = false;
  isSubmitting = false;

  loggedInId = signal('');
  photo: string = '';
  pageName: string = 'Principals Message';

  readonly allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

  private platformId = inject(PLATFORM_ID);

  constructor(
    private fb: FormBuilder,
    private apiservice: CmsApiService,
    private toastr: ToastrService,
    private config: ConfigService,
    private validationService: ValidationService,
    private ckEditorConfig: CKEditorConfigService
  ) {
    // CKEditor build
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();

    this.pageForm = this.fb.group({
      id: [''],
      pageName: [''],
      photo: ['', Validators.required],
      description: ['', {
        validators: [
          Validators.required,
          this.validationService.noWhitespaceValidator()
        ],
        nonNullable: true
      }],
      metaTitle: ['', {
        validators: [
          this.validationService.noWhitespaceValidator()
        ],
        nonNullable: true
      }],
      metaDescription: ['', {
        validators: [
          this.validationService.noWhitespaceValidator()
        ],
        nonNullable: true
      }],
    });
  }

  ngOnInit(): void {
    this.get();
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('user');

      if (userString) {
        const currentUser = JSON.parse(userString);
        this.loggedInId.set(currentUser.id);
      }
    }
  }

  // ===================================================
  // FILE CHANGE & VALIDATION
  // ===================================================

  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file =
      input.files[0];

    const photoControl =
      this.pageForm.get('photo');

    // Clear previous file errors
    photoControl?.setErrors(null);


    // ============================================
    // TYPE VALIDATION
    // ============================================

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type.toLowerCase())) {

      photoControl?.setErrors({
        invalidFile: true
      });

      photoControl?.markAsTouched();

      this.selectedFile = null;
      this.imagePreview = null;

      input.value = '';

      return;
    }


    // ============================================
    // SIZE VALIDATION - 1 MB
    // ============================================

    const maxSize =
      1 * 1024 * 1024;

    if (file.size > maxSize) {

      photoControl?.setErrors({
        fileSize: true
      });

      photoControl?.markAsTouched();

      this.selectedFile = null;
      this.imagePreview = null;

      input.value = '';

      return;
    }


    // ============================================
    // VALID FILE
    // ============================================

    this.loadFile(file);

    input.value = '';
  }



  private validateImageFile(file: File): 'invalidFile' | 'fileSize' | null {

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    // File type
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'invalidFile';
    }

    // Maximum 1 MB
    const maxSize = 1 * 1024 * 1024;

    if (file.size > maxSize) {
      return 'fileSize';
    }

    return null;
  }

  private loadFile(file: File): void {

    this.selectedFile =
      file;

    const photoControl =
      this.pageForm.get('photo');

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

      photoControl?.setValue(
        this.imagePreview
      );

      photoControl?.setErrors(null);

      photoControl?.markAsTouched();

    };

    reader.readAsDataURL(file);
  }

  // ===================================================
  // DRAG AND DROP HANDLERS
  // ===================================================

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {

    event.preventDefault();

    this.isDragging = false;

    const file =
      event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    const photoControl =
      this.pageForm.get('photo');

    // Clear previous errors
    photoControl?.setErrors(null);

    // Validate
    const fileError =
      this.validateImageFile(file);

    if (fileError) {

      this.selectedFile = null;
      this.imagePreview = null;

      photoControl?.setErrors({
        [fileError]: true
      });

      photoControl?.markAsTouched();

      if (fileError === 'fileSize') {

        this.toastr.warning(
          'Image size cannot exceed 1 MB.',
          'Invalid Image'
        );

      }
      else {

        this.toastr.warning(
          'Only JPG, JPEG, PNG, or WEBP images are allowed.',
          'Invalid Image'
        );

      }

      return;
    }

    // Valid file
    this.loadFile(file);
  }

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.photo = '';

    const photoControl = this.pageForm.get('photo');
    photoControl?.setValue('');
    photoControl?.setErrors({ required: true });
    photoControl?.markAsTouched();
    photoControl?.updateValueAndValidity();
  }

  // ===================================================
  // API DATA FETCH & SUBMISSION
  // ===================================================

  get(): void {
    this.apiservice.GetRequest('AboutUs/0/' + this.pageName).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res[0] : res;

        if (!data) {
          return;
        }

        this.pageForm.patchValue({
          id: data.id ?? '',
          pageName: data.pageName ?? '',
          photo: data.image ?? '',
          description: data.description ?? '',
          metaTitle: data.metaTitle ?? '',
          metaDescription: data.metaDescription ?? ''
        });

        this.photo = data.image ?? '';

        if (this.photo) {
          this.imagePreview = this.config.get('IMAGE_API_URL') + this.photo;
          this.pageForm.get('photo')?.setErrors(null);
        } else {
          this.imagePreview = null;
          this.pageForm.get('photo')?.setErrors({ required: true });
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

  save(): void {

    if (this.isSubmitting) {
      return;
    }

    const descriptionControl =
      this.pageForm.get('description');

    const photoControl =
      this.pageForm.get('photo');

    const description =
      descriptionControl?.value ?? '';


    // ============================================
    // DESCRIPTION
    // ============================================

    const plainText =
      description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim();

    if (!plainText) {

      descriptionControl?.setErrors({
        required: true
      });

    }


    // ============================================
    // IMAGE REQUIRED
    // ============================================

    if (!this.selectedFile && !this.photo) {

      photoControl?.setErrors({
        required: true
      });

    }


    // ============================================
    // SELECTED FILE VALIDATION
    // ============================================

    if (this.selectedFile) {

      const fileError =
        this.validateImageFile(
          this.selectedFile
        );

      if (fileError) {

        photoControl?.setErrors({
          [fileError]: true
        });

        photoControl?.markAsTouched();

        if (fileError === 'fileSize') {

          this.toastr.warning(
            'Image size cannot exceed 1 MB.',
            'Invalid Image'
          );

        }
        else {

          this.toastr.warning(
            'Only JPG, JPEG, PNG, or WEBP images are allowed.',
            'Invalid Image'
          );

        }

        return;
      }

    }


    // ============================================
    // FORM VALIDATION
    // ============================================

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;
    }


    // ============================================
    // SUBMIT
    // ============================================

    this.isSubmitting = true;

    const formData =
      new FormData();

    const id =
      this.pageForm.get('id')?.value;


    if (this.selectedFile) {

      formData.append(
        'Photo',
        this.selectedFile,
        this.selectedFile.name
      );

    }


    formData.append(
      'PageName',
      this.pageName
    );

    formData.append(
      'Description',
      description
    );

    formData.append(
      'MetaTitle',
      this.pageForm.get('metaTitle')?.value ?? ''
    );

    formData.append(
      'MetaDescription',
      this.pageForm.get('metaDescription')?.value ?? ''
    );


    // ============================================
    // CREATE / UPDATE
    // ============================================

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

  private create(formData: FormData): void {
    this.apiservice.PostRequest('AboutUs', formData, true)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          if (res.isSucceeded) {
            this.toastr.success(res.message);
            this.resetForm();
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
    this.apiservice.PutRequest('AboutUs', formData, true)
      .pipe(finalize(() => (this.isSubmitting = false)))
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

  resetForm(): void {
    this.pageForm.reset({
      id: '',
      pageName: '',
      photo: '',
      description: '',
      metaTitle: '',
      metaDescription: ''
    });
    this.selectedFile = null;
    this.imagePreview = null;
    this.photo = '';
  }
}
