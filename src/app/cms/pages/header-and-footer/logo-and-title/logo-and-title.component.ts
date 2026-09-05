import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from '../../../../services/config.service';
import { ValidationService } from '../../../../services/validation-service.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
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
  public Editor: any;

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  pageForm: FormGroup;
  loggedInId = signal('');
  LogoPath: string = '';
  pageName: string = 'Logo And Title';
  editorConfig: any;
  isSubmitting = false;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private fb: FormBuilder,
    private apiService: CmsApiService,
    private toastr: ToastrService,
    private config: ConfigService,
    private validationService: ValidationService,
    private ckEditorConfig: CKEditorConfigService
  ) {
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();

    this.pageForm = this.fb.group({
      id: this.fb.control<number | null>(null),
      sectionName: this.pageName,
      logo: this.fb.control<string | null>(null, {
        validators: [Validators.required]
      }),
      name: this.fb.control('', {
        validators: [
          Validators.required,
          this.validationService.noWhitespaceValidator()
        ],
        nonNullable: true
      })
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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.toastr.warning(
        'Only JPG, PNG and WEBP images are allowed.',
        'Invalid File'
      );
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toastr.warning(
        'Maximum logo size is 2 MB.',
        'File Too Large'
      );
      input.value = '';
      return;
    }

    this.selectedFile = file;

    this.pageForm.get('logo')?.setErrors(null);

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.LogoPath = '';

    const imageControl = this.pageForm.get('logo');
    imageControl?.setValue(null);
    imageControl?.setErrors({ required: true });
    imageControl?.markAsTouched();
    imageControl?.updateValueAndValidity();
  }

  get(): void {
    this.apiService
      .GetRequest('HeaderAndFooter/0/' + this.pageName)
      .subscribe({
        next: (res: any) => {
          const data = Array.isArray(res) ? res[0] : res;

          if (!data) {
            return;
          }

          this.pageForm.patchValue({
            id: data.id ?? '',
            logo: data.logo ?? data.Logo ?? data.LogoPath ?? '',
            name: data.name ?? data.Name ?? ''
          });

          this.LogoPath = data.logoPath ?? data.LogoPath ?? '';

          if (this.LogoPath) {
            this.imagePreview = this.config.get('IMAGE_API_URL') + this.LogoPath;
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
    const id = this.pageForm.get('id')?.value;
    const imageControl = this.pageForm.get('logo');

    const hasImage =
      !!this.selectedFile ||
      !!this.LogoPath ||
      !!this.imagePreview;

    if (!hasImage) {
      imageControl?.setErrors({
        ...(imageControl.errors || {}),
        required: true
      });

      imageControl?.markAsTouched();
      imageControl?.updateValueAndValidity();
      return;
    }

    if (imageControl?.hasError('required')) {
      const errors = { ...(imageControl.errors || {}) };
      delete errors['required'];

      imageControl.setErrors(
        Object.keys(errors).length ? errors : null
      );
    }

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    if (this.selectedFile) {
      formData.append(
        'Logo',
        this.selectedFile,
        this.selectedFile.name
      );
    }

    formData.append(
      'Name',
      this.pageForm.get('name')?.value ?? ''
    );

    formData.append(
      'SectionName',
      this.pageForm.get('sectionName')?.value ?? ''
    );

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
    this.apiService
      .PostRequest('HeaderAndFooter', formData, true)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: any) => {
          if (res.isSucceeded) {
            this.toastr.success(
              res.message || 'Logo and Title created successfully.'
            );
            this.selectedFile = null;
            this.imagePreview = null;
            this.LogoPath = '';
            this.get();
          } else {
            this.toastr.warning(
              res.message || 'Unable to create Logo and Title.'
            );
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
    this.apiService
      .PutRequest('HeaderAndFooter', formData, true)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: any) => {
          if (res.isSucceeded) {
            this.toastr.success(
              res.message || 'Logo and Title updated successfully.'
            );
            this.selectedFile = null;
            this.get();
          } else {
            this.toastr.warning(
              res.message || 'Unable to update Logo and Title.'
            );
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
