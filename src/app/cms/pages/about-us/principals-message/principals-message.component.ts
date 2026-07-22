import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToastrService } from 'ngx-toastr';
import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { ValidationService } from '../../../../services/validation-service.service';

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
export class PrincipalsMessageComponent {

 public Editor: any = ClassicEditor;

  pageForm: FormGroup;

  imagePreview: string | ArrayBuffer | null = null;

  selectedFile: File | null = null;

  isDragging = false;

  loggedInId = signal('')
  photo: string = '';
  pageName: string = "Principals Message";

  constructor(private fb: FormBuilder, private apiservice: CmsApiService, private toastr: ToastrService, private config: ConfigService, private validationService: ValidationService) {

    this.pageForm = this.fb.group({

      id: [''],
      pageName: [''],
      photo: [''],
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


  ngOnInit() {
    this.get();
    const userString = localStorage.getItem('user');

    if (userString) {
      const currentUser = JSON.parse(userString);
      this.loggedInId.set(currentUser.id);
    }
  }


  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedFile = input.files[0];

    // Clear banner validation error
    this.pageForm.get('photo')?.setErrors(null);

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };

    reader.readAsDataURL(this.selectedFile);

  }

  removeImage(): void {
    this.selectedFile = null;

    this.imagePreview = null;

    this.photo = '';

    // Make banner invalid only when creating
    const id = this.pageForm.get('id')?.value;

    if (!id) {
      this.pageForm.get('photo')?.setErrors({
        required: true
      });
    }

  }

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

        // Keep existing database image path
        this.photo = data.image ?? '';

        if (this.photo) {
          this.imagePreview = this.config.get('IMAGE_API_URL') + this.photo;
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
    // Get CKEditor HTML
    const description = this.pageForm.get('description')?.value ?? '';

    // Remove HTML tags and whitespace
    const plainText = description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();

    // CKEditor validation
    if (!plainText) {
      this.pageForm.get('description')?.setErrors({ required: true });
    }
    else {
      this.pageForm.get('description')?.setErrors(null);
    }

    // Banner validation only for CREATE
    const id = this.pageForm.get('id')?.value;

    if (!id && !this.selectedFile) {
      this.pageForm.get('photo')?.setErrors({ required: true });
    }
    else {
      this.pageForm.get('photo')?.setErrors(null);
    }

    // Stop if invalid
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    // New image
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

    }
    else {
      formData.append('CreatedBy', this.loggedInId());

      this.create(formData);

    }

  }

  private create(formData: FormData): void {
    this.apiservice.PostRequest('AboutUs', formData, true).subscribe({
      next: (res) => {
        if (res.isSucceeded) {

          this.toastr.success(res.message);
          // Clear form
          this.pageForm.reset({
            id: '',
            photo: '',
            description: '',
            metaTitle: '',
            metaDescription: ''
          });

          // Clear selected image
          this.selectedFile = null;

          // Clear image preview
          this.imagePreview = null;

          // Clear stored image path
          this.photo = '';

          this.get();

        }
        else {

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

    this.apiservice.PutRequest('AboutUs', formData, true).subscribe({

      next: (res: any) => {

        if (res.isSucceeded) {

          this.toastr.success(res.message);

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
          'Something went wrong.'
        );

      }

    });

  }

}
