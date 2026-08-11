import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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


  // ---------------------------------------
  // Constructor
  // ---------------------------------------

  // ---------------------------------------
  // Form
  // ---------------------------------------
  pageForm: FormGroup;
  constructor(

    private fb: FormBuilder,

    private sanitizer: DomSanitizer,

    private apiService: CmsApiService,

    private toastr: ToastrService

  ) {
    this.pageForm = this.fb.group({

      latitude: this.fb.control<string>('', {

        validators: [

          Validators.required,

          Validators.min(-90),

          Validators.max(90)

        ],

        nonNullable: true

      }),

      longitude: this.fb.control<string>('', {

        validators: [

          Validators.required,

          Validators.min(-180),

          Validators.max(180)

        ],

        nonNullable: true

      })

    });
  }


  // ---------------------------------------
  // Variables
  // ---------------------------------------

  mapUrl: SafeResourceUrl | null = null;

  selectedLocation:
    GoogleMapLocation | null = null;

  SectionName = 'Google Map';

  loggedInId = '';





  // ---------------------------------------
  // On Init
  // ---------------------------------------

  ngOnInit(): void {

    const userString =
      localStorage.getItem('user');


    if (userString) {

      const currentUser =
        JSON.parse(userString);

      this.loggedInId =
        currentUser.id;

    }


    this.getLocation();

  }


  // ---------------------------------------
  // GET
  // ---------------------------------------

  getLocation(): void {

    this.apiService

      .GetRequest(

        'ContactUs/0/' +
        this.SectionName

      )

      .subscribe({

        next: (res: any) => {


          const data = Array.isArray(res)
            ? res
            : [res];


          if (!data.length) {

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


          const location:
            GoogleMapLocation = {

            id:
              item.id ??
              item.Id ??
              0,

            sectionName:
              item.sectionName ??
              item.SectionName ??
              this.SectionName,

            latitude:
              item.latitude ??
              item.Latitude ??
              '',

            longitude:
              item.longitude ??
              item.Longitude ??
              ''

          };


          this.selectedLocation =
            location;


          this.pageForm.patchValue({

            id:
              location.id,

            latitude:
              location.latitude,

            longitude:
              location.longitude

          });


          // Display map

          if (
            location.latitude &&
            location.longitude
          ) {

            this.generateMap(

              location.latitude,

              location.longitude

            );

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


  // ---------------------------------------
  // Generate Map
  // ---------------------------------------

  generateMap(

    latitude: string,

    longitude: string

  ): void {

    this.mapUrl =

      this.sanitizer

        .bypassSecurityTrustResourceUrl(

          `https://www.google.com/maps?q=${latitude},${longitude}&z=15&t=k&output=embed`

        );

  }


  // ---------------------------------------
  // Save / Update
  // ---------------------------------------

  saveLocation(): void {

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }


    const value =
      this.pageForm.getRawValue();


    const id =
      value.id;


    const isEdit =
      id > 0;


    const formData =
      new FormData();


    // ---------------------------------------
    // ID
    // ---------------------------------------

    if (isEdit) {

      formData.append(

        'Id',

        id.toString()

      );


      formData.append(

        'UpdatedBy',

        this.loggedInId

      );

    }

    else {

      formData.append(

        'CreatedBy',

        this.loggedInId

      );

    }


    // ---------------------------------------
    // Section Name
    // ---------------------------------------

    formData.append(

      'SectionName',

      this.SectionName

    );


    // ---------------------------------------
    // Latitude
    // ---------------------------------------

    formData.append(

      'Latitude',

      value.latitude

    );


    // ---------------------------------------
    // Longitude
    // ---------------------------------------

    formData.append(

      'Longitude',

      value.longitude

    );

    // ---------------------------------------
    // API
    // ---------------------------------------

    const request = isEdit

      ? this.apiService.PutRequest(

        'ContactUs',

        formData,

        true

      )

      : this.apiService.PostRequest(

        'ContactUs',

        formData,

        true

      );


    request.subscribe({

      next: (res: any) => {


        if (res.isSucceeded) {

          this.toastr.success(

            res.message ||

            `Google Map location ${isEdit
              ? 'updated'
              : 'saved'
            } successfully.`

          );


          // Update map immediately

          this.generateMap(

            value.latitude,

            value.longitude

          );


          // Reload from database

          this.getLocation();

        }

        else {

          this.toastr.warning(

            res.message ||

            `Unable to ${isEdit
              ? 'update'
              : 'save'
            } Google Map location.`

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


  // ---------------------------------------
  // Set Location
  // ---------------------------------------

  setLocation(): void {

    this.saveLocation();

  }


  // ---------------------------------------
  // Reset
  // ---------------------------------------

  resetLocation(): void {

    this.pageForm.reset({

      id:
        this.selectedLocation?.id ??
        0,

      latitude:
        this.selectedLocation?.latitude ??
        '',

      longitude:
        this.selectedLocation?.longitude ??
        ''

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
