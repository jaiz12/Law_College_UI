import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToastrService } from 'ngx-toastr';
import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ValidationService } from '../../../../services/validation-service.service';

@Component({
  selector: 'app-vision-and-mission',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    CKEditorModule],
  templateUrl: './vision-and-mission.component.html',
  styleUrl: './vision-and-mission.component.scss'
})
export class VisionAndMissionComponent implements OnInit {
 public Editor: any = ClassicEditor;

  pageForm: FormGroup;

  loggedInId = signal('')
  pageName: string = "Vision and Mission";

  constructor(private fb: FormBuilder, private apiservice: CmsApiService, private toastr: ToastrService, private validationService: ValidationService) {
   
    

    this.pageForm = this.fb.group({
      id: [''],
      pageName: [''],
      description: ['', {
        validators: [
          Validators.required,
          this.validationService.noWhitespaceValidator()
        ],
        nonNullable: true
      }],
      metaTitle: [''],
      metaDescription: [''],
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
          description: data.description ?? '',
          metaTitle: data.metaTitle ?? '',
          metaDescription: data.metaDescription ?? ''
        });

        
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

    // Stop if invalid
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

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
            pageName: '',
            description: '',
            metaTitle: '',
            metaDescription: ''
          });

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
