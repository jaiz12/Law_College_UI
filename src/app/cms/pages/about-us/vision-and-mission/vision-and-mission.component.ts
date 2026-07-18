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
import { ToastrService } from 'ngx-toastr';
import { CmsApiService } from '../../../../services/cms-api-service.service';

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

  constructor(private fb: FormBuilder, private apiservice: CmsApiService, private toastr: ToastrService) {
   

    this.pageForm = this.fb.group({
      id: [''],
      vision: ['',Validators.required],
      mission: ['',Validators.required],
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
    this.apiservice.GetRequest('VisionMission').subscribe({
      next: (res: any) => {

        const data = Array.isArray(res) ? res[0] : res;

        if (!data) {
          return;
        }

        this.pageForm.patchValue({
          id: data.id ?? '',
          vision: data.vision ?? '',
          mission: data.mission ?? '',
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
    const vision = this.pageForm.get('vision')?.value ?? '';
    const mission = this.pageForm.get('mission')?.value ?? '';

    // Remove HTML tags and whitespace
    const visonText = vision.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();

    // CKEditor validation
    if (!visonText) {
      this.pageForm.get('vision')?.setErrors({ required: true });
    }
    else {
      this.pageForm.get('vision')?.setErrors(null);
    }

    // Remove HTML tags and whitespace
    const missonText = mission.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();

    // CKEditor validation
    if (!missonText) {
      this.pageForm.get('mission')?.setErrors({ required: true });
    }
    else {
      this.pageForm.get('mission')?.setErrors(null);
    }

    // Banner validation only for CREATE
    const id = this.pageForm.get('id')?.value;

    // Stop if invalid
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    formData.append('Vision', vision);

    formData.append('Mission', mission);

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
    this.apiservice.PostRequest('VisionMission', formData, true).subscribe({
      next: (res) => {
        if (res.isSucceeded) {

          this.toastr.success(res.message,
            res.messageType);
          // Clear form
          this.pageForm.reset({
            id: '',
            vision: '',
            mission: '',
            description: '',
            metaTitle: '',
            metaDescription: ''
          });

          this.get();

        }
        else {

          this.toastr.warning(res.message, res.messageType);

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

    this.apiservice.PutRequest('VisionMission', formData, true).subscribe({

      next: (res: any) => {

        if (res.isSucceeded) {

          this.toastr.success(res.message, res.messageType);

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
