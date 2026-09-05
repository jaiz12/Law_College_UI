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
      metaTitle: [''],
      metaDescription: ['']
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
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    if (!this.isAllowedFile(file)) {
      this.selectedFile = null;
      this.imagePreview = null;

      this.pageForm.get('photo')?.setErrors({
        invalidFileType: true
      });
      this.pageForm.get('photo')?.markAsTouched();

      input.value = '';
      return;
    }

    this.loadFile(file);
    input.value = '';
  }

  private isAllowedFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    return this.allowedExtensions.includes(extension);
  }

  private loadFile(file: File): void {
    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;

      this.pageForm.get('photo')?.setValue(this.imagePreview);
      this.pageForm.get('photo')?.setErrors(null);
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

    const file = event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    if (!this.isAllowedFile(file)) {
      this.pageForm.get('photo')?.setErrors({
        invalidFileType: true
      });
      this.pageForm.get('photo')?.markAsTouched();
      return;
    }

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
    const description = this.pageForm.get('description')?.value ?? '';
    const plainText = description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();

    if (!plainText) {
      this.pageForm.get('description')?.setErrors({ required: true });
    } else {
      this.pageForm.get('description')?.setErrors(null);
    }

    if (!this.selectedFile && !this.photo) {
      this.pageForm.get('photo')?.setErrors({ required: true });
      this.toastr.error('Please upload an image.', 'Validation Error');
    } else if (this.pageForm.get('photo')?.hasError('invalidFileType')) {
      this.toastr.error('Invalid image format.', 'Validation Error');
    } else {
      this.pageForm.get('photo')?.setErrors(null);
    }

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    const id = this.pageForm.get('id')?.value;

    if (this.selectedFile) {
      formData.append('Photo', this.selectedFile, this.selectedFile.name);
    }

    formData.append('PageName', this.pageName);
    formData.append('Description', description);
    formData.append('MetaTitle', this.pageForm.get('metaTitle')?.value ?? '');
    formData.append('MetaDescription', this.pageForm.get('metaDescription')?.value ?? '');

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
