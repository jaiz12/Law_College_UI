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
  removedBannerImage: string = '';
  bannerImage: string = '';

  constructor(private fb: FormBuilder, private apiservice: CmsApiService, private toastr: ToastrService, private config: ConfigService) {
    this.pageForm = this.fb.group({
      id: [''],
      banner: [''],
      description: ['', Validators.required],
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

    // New image selected,
    // do not delete old image
    this.removedBannerImage ='';

    const reader =new FileReader();

    reader.onload = () => {
      this.imagePreview =reader.result as string;
    };

    reader.readAsDataURL(this.selectedFile);

  }

  removeImage(): void {

    if (this.bannerImage) {
      this.removedBannerImage =this.bannerImage;
    }

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
    this.apiservice.GetRequest('GeneralOverview').subscribe({
       next: (res: any) => {

          const data =Array.isArray(res) ? res[0] : res;

        if (!data) {
            return;
          }

          this.pageForm.patchValue({
            id: data.id ?? '',
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


    formData.append('Description',description);

    formData.append('MetaTitle',this.pageForm.get('metaTitle')?.value ?? '');

    formData.append('MetaDescription',this.pageForm.get('metaDescription')?.value ?? '');

    if (id) {formData.append('Id', id.toString());

      formData.append('UpdatedBy',this.loggedInId());

      formData.append('RemovedBannerImage',this.removedBannerImage);

      this.update(id, formData);

    }
    else {
      formData.append('CreatedBy',this.loggedInId());

      this.create(formData);

    }

  }

  private create(formData: FormData): void {
    this.apiservice.PostRequest('GeneralOverview', formData, true).subscribe({
        next: (res) => {
          if (res.isSucceeded) {            

            this.toastr.success(res.message,
              res.messageType);
            // Clear form
            this.pageForm.reset({
              id: '',
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

            // Clear removed image path
            this.removedBannerImage = '';

            this.get();

          }
          else {

            this.toastr.warning(res.message,res.messageType);

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

    this.apiservice.PutRequest('GeneralOverview',formData,true).subscribe({

      next: (res: any) => {

          if (res.isSucceeded) {

            this.toastr.success(res.message,res.messageType);

            this.selectedFile =null;

            this.removedBannerImage ='';

            this.get();

          }

          else {

            this.toastr.warning(
              res.message,
              res.messageType

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
