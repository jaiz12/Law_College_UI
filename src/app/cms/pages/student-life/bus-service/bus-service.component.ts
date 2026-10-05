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
  selector: 'app-bus-service',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    CKEditorModule],
  templateUrl: './bus-service.component.html',
  styleUrl: './bus-service.component.scss'
})
export class BusServiceComponent implements OnInit {

  public Editor: any;

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  pageForm: FormGroup;
  loggedInId = signal('');
  pageName: string = "Bus Service";
  editorConfig: any;
  isSubmitting = false;
  isEdit = false;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private fb: FormBuilder,
    private apiservice: CmsApiService,
    private toastr: ToastrService,
    private config: ConfigService,
    private validationService: ValidationService,
    private ckEditorConfig: CKEditorConfigService,
    private layout: LayoutService
  ) {
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();

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
    });
  }

  ngOnInit() {
    this.get();
    if (isPlatformBrowser(this.platformId)) {
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
        });
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

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('PageName', this.pageName);
    formData.append('Content', content);

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
              pageName: 'Bus Service',
              content: '',
            });

            this.selectedFile = null;
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
