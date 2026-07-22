import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from '../../../../services/config.service';
import { ValidationService } from '../../../../services/validation-service.service';

@Component({
  selector: 'app-general-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './general-overview.component.html',
  styleUrl: './general-overview.component.scss'
})
export class GeneralOverviewComponent implements OnInit {

  // Use the editor type expected by the CKEditor Angular component
  public Editor: any = ClassicEditor;

  selectedFile: File | null = null;

  imagePreview: string | null = null;

  pageForm: FormGroup;

  loggedInId = signal('')
  bannerImage: string = '';
  pageName: string = "General Overview";
  constructor(private fb: FormBuilder, private apiservice: CmsApiService, private toastr: ToastrService, private config: ConfigService, private validationService: ValidationService) {
    this.pageForm = this.fb.group({
      id: [''],
      pageName: [''],
      banner: [''],
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

    this.selectedFile =input.files[0];

    // Clear banner validation error
    this.pageForm.get('banner')?.setErrors(null);


    const reader =new FileReader();

    reader.onload = () => {
      this.imagePreview =reader.result as string;
    };

    reader.readAsDataURL(this.selectedFile);

  }

  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;

    this.bannerImage = '';

    // Make banner invalid only when creating
    const id = this.pageForm.get('id')?.value;

    if (!id) {
      this.pageForm.get('banner')?.setErrors({
          required: true
        });
    }

  }

  get(): void {
    this.apiservice.GetRequest('AboutUs/0/' + this.pageName).subscribe({
       next: (res: any) => {

          const data =Array.isArray(res) ? res[0] : res;

        if (!data) {
            return;
          }

          this.pageForm.patchValue({
            id: data.id ?? '',
            pageName: data.pageName ?? '',
            banner: data.bannerImage ?? '',
            description: data.description ?? '',
            metaTitle: data.metaTitle ?? '',
            metaDescription: data.metaDescription ?? ''
          });

          // Keep existing database image path
          this.bannerImage = data.bannerImage ?? '';

          if (this.bannerImage) {
            this.imagePreview = this.config.get('IMAGE_API_URL') + this.bannerImage;
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
    const plainText =description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();

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
      this.pageForm.get('banner')?.setErrors({ required: true });
    }
    else {
      this.pageForm.get('banner')?.setErrors(null);
    }

    // Stop if invalid
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    // New image
    if (this.selectedFile) {
      formData.append('Banner',this.selectedFile,this.selectedFile.name);
    }


    formData.append('PageName', this.pageName);
    formData.append('Description',description);

    formData.append('MetaTitle',this.pageForm.get('metaTitle')?.value ?? '');

    formData.append('MetaDescription',this.pageForm.get('metaDescription')?.value ?? '');

    if (id) {formData.append('Id', id.toString());

      formData.append('UpdatedBy',this.loggedInId());

      this.update(id, formData);

    }
    else {
      formData.append('CreatedBy',this.loggedInId());

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
              pageName: 'General Overview',
              banner: '',
              description: '',
              metaTitle: '',
              metaDescription: ''
            });

            // Clear selected image
            this.selectedFile = null;

            // Clear image preview
            this.imagePreview = null;

            // Clear stored image path
            this.bannerImage ='';

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

  private update(id: number,formData: FormData): void {

    this.apiservice.PutRequest('AboutUs',formData,true).subscribe({

      next: (res: any) => {

          if (res.isSucceeded) {

            this.toastr.success(res.message);

            this.selectedFile =null;

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
