import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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


@Component({
  selector: 'app-logo-and-title',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './logo-and-title.component.html',
  styleUrl: './logo-and-title.component.scss'
})
export class LogoAndTitleComponent implements OnInit {

  selectedFile: File | null = null;

  imagePreview: string | null = null;

  pageForm: FormGroup;

  loggedInId = signal('');

  LogoPath: string = '';

  pageName: string = 'Logo And Title';

  constructor(
    private fb: FormBuilder,
    private apiService: CmsApiService,
    private toastr: ToastrService,
    private config: ConfigService,
    private validationService: ValidationService
  ) {

    this.pageForm = this.fb.group({

      id: [''],

      sectionName: this.pageName,

      logo: [''],

      name: ['', {
        validators: [
          Validators.required,
          this.validationService.noWhitespaceValidator()
        ],
        nonNullable: true
      }],

    });

  }


  // ---------------------------------------
  // Init
  // ---------------------------------------

  ngOnInit(): void {

    this.get();

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


  // ---------------------------------------
  // File Change
  // ---------------------------------------

  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {

      return;

    }

    const file =
      input.files[0];

    const allowedTypes = [
      'image/jpeg',
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

    this.pageForm
      .get('logo')
      ?.setErrors(null);

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

    };

    reader.readAsDataURL(file);

  }


  // ---------------------------------------
  // Remove Logo
  // ---------------------------------------

  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;

    this.LogoPath = '';

    this.pageForm
      .get('logo')
      ?.setValue('');

    const id =
      this.pageForm.get('id')?.value;

    // Logo is required only during create

    if (!id) {

      this.pageForm
        .get('logo')
        ?.setErrors({
          required: true
        });

    }

  }


  // ---------------------------------------
  // Get Data
  // ---------------------------------------

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

          console.log(data)

          if (!data) {

            return;

          }

          this.pageForm.patchValue({

            id:
              data.id ??
              '',

            logo:
              data.logo ??
              data.Logo ??
              data.LogoPath ??
              data.LogoPath ??
              '',

            name:
              data.name ??
              data.Name ??
              ''

          });

          // Keep existing database image path
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


  // ---------------------------------------
  // Save
  // ---------------------------------------

  save(): void {

    const id =
      this.pageForm.get('id')?.value;


    // Logo validation only for CREATE

    if (!id && !this.selectedFile) {

      this.pageForm
        .get('logo')
        ?.setErrors({
          required: true
        });

    }
    else {

      this.pageForm
        .get('logo')
        ?.setErrors(null);

    }


    // Form validation

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }


    const formData =
      new FormData();


    // Logo

    if (this.selectedFile) {

      formData.append(
        'Logo',
        this.selectedFile,
        this.selectedFile.name
      );

    }


    // Title

    formData.append(
      'Name',
      this.pageForm
        .get('name')
        ?.value ?? ''
    );

    // Section Name

    formData.append(
      'SectionName',
      this.pageForm
        .get('sectionName')
        ?.value ?? ''
    );


    // Update

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

    // Create

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


  // ---------------------------------------
  // Create
  // ---------------------------------------

  private create(
    formData: FormData
  ): void {

    this.apiService
      .PostRequest(
        'HeaderAndFooter',
        formData,
        true
      )
      .subscribe({

        next: (res: any) => {

          if (res.isSucceeded) {

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
              res.message ||
              'Unable to create Logo and Title.'
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


  // ---------------------------------------
  // Update
  // ---------------------------------------

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
      .subscribe({

        next: (res: any) => {

          if (res.isSucceeded) {

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
              res.message ||
              'Unable to update Logo and Title.'
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
