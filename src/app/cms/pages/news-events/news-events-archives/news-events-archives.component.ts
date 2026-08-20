import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';

import Swal from 'sweetalert2';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';

export interface Announcements {

  id: number;

  title: string;

  category: string | null;

  startDate: string;

  endDate: string | null;

  file: string | null;

  filePath?: File | null;

  urgent: boolean;

  isActive: boolean;

}


@Component({
  selector: 'app-news-events-archives',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    NgxPaginationModule,],
  templateUrl: './news-events-archives.component.html',
  styleUrl: './news-events-archives.component.scss'
})
export class NewsEventsArchivesComponent implements OnInit {


  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService,

    private config: ConfigService

  ) { }

  // ===================================================
  // SIGNALS
  // ===================================================

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [
    5,
    10,
    20,
    50
  ];

  announcements =
    signal<Announcements[]>([]);

  loggedInId = signal('');

  imageURL = signal('');

  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.getAnnouncements();

    this.imageURL.set(
      this.config.get('IMAGE_API_URL') || ''
    );


    const userString =
      localStorage.getItem('user');


    if (userString) {

      try {

        const currentUser =
          JSON.parse(userString);

        this.loggedInId.set(
          currentUser.id ?? ''
        );

      }

      catch (error) {

        console.error(
          'Unable to parse logged in user:',
          error
        );

      }

    }

  }


  // ===================================================
  // FILTER
  // ===================================================

  filteredAnnouncements = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    if (!keyword) {

      return this.announcements();

    }


    return this.announcements().filter(
      announcement =>

        announcement.title
          ?.toLowerCase()
          .includes(keyword)

        ||

        announcement.category
          ?.toLowerCase()
          .includes(keyword)

    );

  });

  // ===================================================
  // GET
  // ===================================================

  getAnnouncements(): void {

    this.apiService
      .GetRequest('Announcements/ArchiveNewsAndEvents')
      .subscribe({

        next: (res: any) => {

          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const announcements:
            Announcements[] =

            data.map(
              (item: any) => ({

                id:
                  item.id ??
                  item.Id ??
                  0,

                title:
                  item.title ??
                  item.Title ??
                  '',

                category:
                  item.category ??
                  item.Category ??
                  null,

                startDate:
                  item.startDate ??
                  item.StartDate ??
                  '',

                endDate:
                  item.endDate ??
                  item.EndDate ??
                  null,

                file:
                  item.file ??
                  item.File ??
                  item.filePath ??
                  item.FilePath ??
                  null,

                urgent:
                  item.urgent ??
                  item.Urgent ??
                  false,

                isActive:
                  item.isActive ??
                  item.IsActive ??
                  true,

              })
            );


          this.announcements.set(
            announcements
          );

        },

        error: (err) => {

          console.error(
            'Announcements Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Announcements.'

          );

        }

      });

  }

  // ===================================================
  // ARCHIVE
  // ===================================================

  setActive(
    announcement: Announcements
  ): void {

    Swal.fire({

      title:
        'Un-Archive Announcement?',

      text:
        `Are you sure you want to un-archive "${announcement.title}"?`,

      icon:
        'info',

      showCancelButton:
        true,

      confirmButtonColor:
        '#dc2626',

      cancelButtonColor:
        '#6b7280',

      confirmButtonText:
        'Yes, Un-Archive',

      cancelButtonText:
        'Cancel',

      reverseButtons:
        true,

      focusCancel:
        true

    })
      .then(result => {

        if (!result.isConfirmed) {
          return;
        }


        this.apiService
          .PutRequestByValues(
            'Announcements/' + announcement.id + "/" + this.loggedInId(),
          )
          .subscribe({

            next: (res: any) => {

              if (res?.isSucceeded) {

                this.toastr.success(

                  res.message ||

                  'Announcement Archived successfully.'

                );


                this.getAnnouncements();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to un archive Announcement.'

                );

              }

            },

            error: (err) => {

              console.error(
                'Delete Announcements Error:',
                err
              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete Announcement.'

              );

            }

          });

      });

  }


  delete(
    announcement: Announcements
  ): void {

    Swal.fire({

      title:
        'Delete Announcement?',

      text:
        `Are you sure you want to delete "${announcement.title}"?`,

      icon:
        'warning',

      showCancelButton:
        true,

      confirmButtonColor:
        '#dc2626',

      cancelButtonColor:
        '#6b7280',

      confirmButtonText:
        'Yes, Delete',

      cancelButtonText:
        'Cancel',

      reverseButtons:
        true,

      focusCancel:
        true

    })

      .then(result => {

        if (
          !result.isConfirmed
        ) {

          return;

        }

        console.log(announcement);

        // =================================================
        // FORM DATA
        // =================================================

        const formData =
          new FormData();


        formData.append(

          'Id',

          announcement.id.toString()

        );


        /*
         * Existing file path.
         *
         * Your backend can use this to physically
         * delete the file if required.
         */

        if (
          announcement.file
        ) {

          formData.append(

            'FilePath',

            announcement.file

          );

        }


        // =================================================
        // API
        // =================================================

        this.apiService.DeleteFromFormRequest(

            'Announcements',

            formData,

            true

          )

          .subscribe({

            next: (res: any) => {

              if (
                res?.isSucceeded
              ) {

                this.toastr.success(

                  res.message ||

                  'Announcements deleted successfully.'

                );


                this.getAnnouncements();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete Announcements.'

                );

              }

            },

            error: (err) => {

              console.error(

                'Delete Announcements Error:',

                err

              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete Announcements.'

              );

            }

          });

      });

  }

}
