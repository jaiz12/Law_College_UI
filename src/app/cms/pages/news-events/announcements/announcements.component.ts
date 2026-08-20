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

import { AnnouncementsModalComponent } from './announcements-modal/announcements-modal.component';


// =====================================================
// INTERFACE
// =====================================================

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
  selector: 'app-announcements',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    AnnouncementsModalComponent
  ],

  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss'
})
export class AnnouncementsComponent implements OnInit {


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

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

  showModal = signal(false);

  selectedAnnouncements =
    signal<Announcements | null>(null);

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
  // CREATE
  // ===================================================

  createAnnouncements(): void {

    this.selectedAnnouncements.set(null);

    this.showModal.set(true);

  }


  // ===================================================
  // EDIT
  // ===================================================

  edit(
    announcement: Announcements
  ): void {

    this.selectedAnnouncements.set({

      ...announcement,

      filePath: null

    });

    this.showModal.set(true);

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(false);

    this.selectedAnnouncements.set(null);

  }


  // ===================================================
  // GET
  // ===================================================

  getAnnouncements(): void {

    this.apiService
      .GetRequest('Announcements')
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
  // SAVE
  // ===================================================

  saveAnnouncements(
    announcement: Announcements
  ): void {

    const isEdit =
      !!announcement.id;


    const formData =
      new FormData();


    // =================================================
    // ID
    // =================================================

    if (isEdit) {

      formData.append(
        'Id',
        announcement.id.toString()
      );

    }


    // =================================================
    // TITLE
    // =================================================

    formData.append(
      'Title',
      announcement.title?.trim() ?? ''
    );


    // =================================================
    // CATEGORY
    // =================================================

    formData.append(
      'Category',
      announcement.category?.trim() ?? ''
    );


    // =================================================
    // START DATE
    // =================================================

    formData.append(
      'StartDate',
      announcement.startDate
    );


    // =================================================
    // END DATE
    // =================================================

    if (announcement.endDate) {

      formData.append(
        'EndDate',
        announcement.endDate
      );

    }


    // =================================================
    // URGENT
    // =================================================

    formData.append(
      'Urgent',
      announcement.urgent
        ? 'true'
        : 'false'
    );

    // =================================================
    // IsActive
    // =================================================

    formData.append(
      'IsActive',
      'true'
    );


    // =================================================
    // USER
    // =================================================

    if (isEdit) {

      formData.append(
        'UpdatedBy',
        this.loggedInId()
      );

    }

    else {

      formData.append(
        'CreatedBy',
        this.loggedInId()
      );

    }


    // =================================================
    // FILE
    // =================================================

    if (announcement.filePath) {

      formData.append(
        'File',
        announcement.filePath,
        announcement.filePath.name
      );

    }


    // =================================================
    // API
    // =================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(
          'Announcements',
          formData,
          true
        )

        : this.apiService.PostRequest(
          'Announcements',
          formData,
          true
        );


    // =================================================
    // RESPONSE
    // =================================================

    request.subscribe({

      next: (res: any) => {

        if (res?.isSucceeded) {

          this.toastr.success(

            res.message ||

            `Announcements ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getAnnouncements();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save Announcements.'

          );

        }

      },

      error: (err) => {

        console.error(
          'Save Announcements Error:',
          err
        );


        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong while saving.'

        );

      }

    });

  }


  // ===================================================
  // ARCHIVE
  // ===================================================

  archive(
    announcement: Announcements
  ): void {

    Swal.fire({

      title:
        'Archive Announcement?',

      text:
        `Are you sure you want to archive "${announcement.title}"?`,

      icon:
        'info',

      showCancelButton:
        true,

      confirmButtonColor:
        '#dc2626',

      cancelButtonColor:
        '#6b7280',

      confirmButtonText:
        'Yes, Archive',

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

                  'Unable to archive Announcement.'

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

  // ===================================================
  // SET URGENT
  // ===================================================

  setUrgent(
    announcement: Announcements
  ): void {

    // =================================================
    // ALREADY URGENT
    // =================================================

    if (announcement.urgent) {
      return;
    }


    // =================================================
    // BACKUP
    // =================================================

    const previousItems =
      this.announcements().map(item => ({
        ...item
      }));


    // =================================================
    // OPTIMISTIC UPDATE
    // Only selected announcement becomes urgent
    // Other announcements remain unchanged
    // =================================================

    this.announcements.update(
      list =>
        list.map(item =>
          item.id === announcement.id
            ? {
              ...item,
              urgent: true
            }
            : item
        )
    );


    // =================================================
    // FORM DATA
    // =================================================

    const formData =
      new FormData();


    // =================================================
    // ID
    // =================================================

    formData.append(
      'Id',
      announcement.id.toString()
    );


    // =================================================
    // TITLE
    // =================================================

    formData.append(
      'Title',
      announcement.title?.trim() ?? ''
    );


    // =================================================
    // CATEGORY
    // =================================================

    formData.append(
      'Category',
      announcement.category?.trim() ?? ''
    );


    // =================================================
    // START DATE
    // =================================================

    formData.append(
      'StartDate',
      announcement.startDate ?? ''
    );


    // =================================================
    // END DATE
    // =================================================

    formData.append(
      'EndDate',
      announcement.endDate ?? ''
    );



    // =================================================
    // FILE
    // =================================================

    if (announcement.filePath) {

      formData.append(
        'File',
        announcement.filePath,
        announcement.filePath.name
      );

    }


    // =================================================
    // URGENT
    // =================================================

    formData.append(
      'Urgent',
      'true'
    );

    // =================================================
    // IsActive
    // =================================================

    formData.append(
      'IsActive',
      'true'
    );


    // =================================================
    // UPDATED BY
    // =================================================

    formData.append(
      'UpdatedBy',
      this.loggedInId()
    );


    // =================================================
    // API
    // =================================================

    this.apiService
      .PutRequest(
        'Announcements',
        formData,
        true
      )
      .subscribe({

        next: (res: any) => {

          if (res?.isSucceeded) {

            this.toastr.success(
              res?.message ||
              'Announcement marked as urgent.'
            );

          }

          else {

            // =================================================
            // ROLLBACK
            // =================================================

            this.announcements.set(
              previousItems
            );

            this.toastr.warning(
              res?.message ||
              'Unable to update announcement status.'
            );

          }

        },

        error: (err) => {

          // =================================================
          // ROLLBACK
          // =================================================

          this.announcements.set(
            previousItems
          );


          console.error(
            'Set Urgent Error:',
            err
          );


          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Unable to update announcement status.'
          );

        }

      });

  }

}
