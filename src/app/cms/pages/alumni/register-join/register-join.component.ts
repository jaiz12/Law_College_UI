import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { finalize } from 'rxjs';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutService } from '../../../layout/services/layout.service';


// ===================================================
// INTERFACE
// ===================================================

export interface AlumniRegistration {

  id: string | null;

  fullName: string;

  email: string;

  mobileNumber: string;

  courseProgramme: string;

  batchGraduationYear: string;

  currentProfessionRole: string;

  currentOrganisationChamber: string;

  currentCityLocation: string;

  connectionPreferences: string[];

  linkedInProfile: string;

  profilePhoto: string;

  createdDate: string | null;

}


// ===================================================
// COMPONENT
// ===================================================

@Component({
  selector: 'app-register-join',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './register-join.component.html',
  styleUrl: './register-join.component.scss'
})
export class RegisterJoinComponent implements OnInit {


  // ===================================================
  // SERVICES
  // ===================================================

  constructor(
    private apiService: CmsApiService,
    private toastr: ToastrService,
    private config: ConfigService,
    private layout: LayoutService
  ) { }


  // ===================================================
  // SIGNALS
  // ===================================================

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  alumni = signal<AlumniRegistration[]>([]);

  imageURL = signal('');


  // ===================================================
  // PLATFORM
  // ===================================================

  private platformId = inject(PLATFORM_ID);


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.imageURL.set(
      this.config.get('IMAGE_API_URL')
    );

    this.getData();

  }


  // ===================================================
  // FILTERED DATA
  // ===================================================

  filteredRegistration = computed(() => {

    const keyword = this.search()
      .trim()
      .toLowerCase();

    if (!keyword) {
      return this.alumni();
    }

    return this.alumni().filter(item => {

      const preferences =
        item.connectionPreferences
          ?.toString()
          .toLowerCase() || '';

      return (

        item.fullName
          ?.toLowerCase()
          .includes(keyword) ||

        item.email
          ?.toLowerCase()
          .includes(keyword) ||

        item.mobileNumber
          ?.toLowerCase()
          .includes(keyword) ||

        item.courseProgramme
          ?.toLowerCase()
          .includes(keyword) ||

        item.batchGraduationYear
          ?.toLowerCase()
          .includes(keyword) ||

        item.currentProfessionRole
          ?.toLowerCase()
          .includes(keyword) ||

        item.currentOrganisationChamber
          ?.toLowerCase()
          .includes(keyword) ||

        item.currentCityLocation
          ?.toLowerCase()
          .includes(keyword) ||

        preferences.includes(keyword) ||

        item.linkedInProfile
          ?.toLowerCase()
          .includes(keyword)

      );

    });

  });

  // ===================================================
  // GET ALUMNI REGISTRATIONS
  // ===================================================

  getData(): void {

    this.layout.showPageLoader();

    this.apiService
      .GetRequest('Registration')
      .pipe(
        finalize(() => {

          this.layout.hidePageLoader();

        })
      )
      .subscribe({

        // -----------------------------------------------
        // SUCCESS
        // -----------------------------------------------

        next: (res: any) => {

          this.page.set(1);

          const data = Array.isArray(res)
            ? res
            : [res];


          const datas: AlumniRegistration[] =
            data.map((item: any) => ({

              id:
                item.id ??
                item.Id ??
                null,


              fullName:
                item.fullName ??
                item.FullName ??
                '',


              email:
                item.email ??
                item.Email ??
                '',


              mobileNumber:
                item.mobileNumber ??
                item.MobileNumber ??
                '',


              courseProgramme:
                item.courseProgramme ??
                item.CourseProgramme ??
                '',


              batchGraduationYear:
                item.batchGraduationYear ??
                item.BatchGraduationYear ??
                '',


              currentProfessionRole:
                item.currentProfessionRole ??
                item.CurrentProfessionRole ??
                '',


              currentOrganisationChamber:
                item.currentOrganisationChamber ??
                item.CurrentOrganisationChamber ??
                '',


              currentCityLocation:
                item.currentCityLocation ??
                item.CurrentCityLocation ??
                '',


              connectionPreferences:
                this.parseConnectionPreferences(
                  item.connectionPreferences ??
                  item.ConnectionPreferences
                ),


              linkedInProfile:
                item.linkedInProfile ??
                item.LinkedInProfile ??
                '',


              profilePhoto:
                this.getProfilePhoto(
                  item.profilePhoto ??
                  item.ProfilePhoto ??
                  item.photo ??
                  item.Photo ??
                  ''
                ),


              createdDate:
                item.createdDate ??
                item.CreatedDate ??
                null

            }));


          this.alumni.set(datas);

        },


        // -----------------------------------------------
        // ERROR
        // -----------------------------------------------

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load alumni registrations.',

            'Error'

          );

        }

      });

  }


  // ===================================================
  // CONNECTION PREFERENCES
  // ===================================================

  private parseConnectionPreferences(
    value: any
  ): string[] {

    if (Array.isArray(value)) {

      return value;

    }

    if (!value) {

      return [];

    }

    if (typeof value === 'string') {

      try {

        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {

          return parsed;

        }

      }
      catch {

        // Not JSON, continue below

      }


      return value
        .split(',')
        .map(x => x.trim())
        .filter(x => !!x);

    }

    return [];

  }


  // ===================================================
  // PROFILE PHOTO
  // ===================================================

  private getProfilePhoto(
    photo: string
  ): string {

    if (!photo) {

      return '';

    }


    // Already a complete URL

    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://')
    ) {

      return photo;

    }


    // Already a data URL

    if (photo.startsWith('data:')) {

      return photo;

    }


    return `${this.imageURL()}${photo}`;

  }

}
