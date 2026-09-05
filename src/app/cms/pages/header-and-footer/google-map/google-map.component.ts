import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

import { CmsApiService } from '../../../../services/cms-api-service.service';

export interface GoogleMapLocation {
  id: number;
  sectionName: string;
  latitude: string;
  longitude: string;
}

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './google-map.component.html',
  styleUrl: './google-map.component.scss'
})
export class GoogleMapComponent implements OnInit {

  pageForm: FormGroup;
  mapUrl: SafeResourceUrl | null = null;
  selectedLocation: GoogleMapLocation | null = null;
  SectionName = 'Google Map';
  loggedInId = '';
  isSubmitting = false;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private apiService: CmsApiService,
    private toastr: ToastrService
  ) {
    this.pageForm = this.fb.group({
      id: this.fb.control<number>(0),

      latitude: this.fb.control<string>('', {
        validators: [
          Validators.required,
          Validators.min(0)
        ],
        nonNullable: true
      }),

      longitude: this.fb.control<string>('', {
        validators: [
          Validators.required,
          Validators.min(0)
        ],
        nonNullable: true
      })
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('user');

      if (userString) {
        try {
          const currentUser = JSON.parse(userString);
          this.loggedInId = currentUser.id;
        } catch (e) {
          console.error('Error parsing user session', e);
        }
      }
    }

    this.getLocation();
  }

  /**
   * Prevents typing 'e', 'E', and '-' in numerical inputs.
   */
  preventInvalidChars(event: KeyboardEvent): void {
    if (['e', 'E', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  getLocation(): void {
    this.apiService
      .GetRequest('HeaderAndFooter/0/' + this.SectionName)
      .subscribe({
        next: (res: any) => {
          const data = Array.isArray(res) ? res : [res];

          if (!data.length || !data[0]) {
            this.selectedLocation = null;
            this.pageForm.reset({
              id: 0,
              latitude: '',
              longitude: ''
            });
            this.mapUrl = null;
            return;
          }

          const item = data[0];

          const location: GoogleMapLocation = {
            id: item.id ?? item.Id ?? 0,
            sectionName: item.sectionName ?? item.SectionName ?? this.SectionName,
            latitude: item.latitude ?? item.Latitude ?? '',
            longitude: item.longitude ?? item.Longitude ?? ''
          };

          this.selectedLocation = location;

          this.pageForm.patchValue({
            id: location.id,
            latitude: location.latitude,
            longitude: location.longitude
          });

          if (location.latitude && location.longitude) {
            this.generateMap(location.latitude, location.longitude);
          }
        },

        error: (err) => {
          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Unable to load Google Map location.'
          );
        }
      });
  }

  generateMap(latitude: string, longitude: string): void {
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${latitude},${longitude}&z=15&t=k&output=embed`
    );
  }

  saveLocation(): void {
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const value = this.pageForm.getRawValue();
    const id = value.id;
    const isEdit = id > 0;

    const formData = new FormData();

    if (isEdit) {
      formData.append('Id', id.toString());
      formData.append('UpdatedBy', this.loggedInId);
    } else {
      formData.append('CreatedBy', this.loggedInId);
    }

    formData.append('SectionName', this.SectionName);
    formData.append('Latitude', value.latitude);
    formData.append('Longitude', value.longitude);

    const request = isEdit
      ? this.apiService.PutRequest('HeaderAndFooter', formData, true)
      : this.apiService.PostRequest('HeaderAndFooter', formData, true);

    request
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: any) => {
          if (res.isSucceeded) {
            this.toastr.success(
              res.message ||
              `Google Map location ${isEdit ? 'updated' : 'saved'} successfully.`
            );

            this.generateMap(value.latitude, value.longitude);
            this.getLocation();
          } else {
            this.toastr.warning(
              res.message ||
              `Unable to ${isEdit ? 'update' : 'save'} Google Map location.`
            );
          }
        },

        error: (err) => {
          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Something went wrong while saving Google Map location.'
          );
        }
      });
  }

  setLocation(): void {
    this.saveLocation();
  }

  resetLocation(): void {
    this.pageForm.reset({
      id: this.selectedLocation?.id ?? 0,
      latitude: this.selectedLocation?.latitude ?? '',
      longitude: this.selectedLocation?.longitude ?? ''
    });

    if (
      this.selectedLocation?.latitude &&
      this.selectedLocation?.longitude
    ) {
      this.generateMap(
        this.selectedLocation.latitude,
        this.selectedLocation.longitude
      );
    }
  }
}
