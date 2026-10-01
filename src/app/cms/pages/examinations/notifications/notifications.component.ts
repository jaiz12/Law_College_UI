import { CommonModule, isPlatformBrowser } from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';

import Swal from 'sweetalert2';

import { CmsApiService } from '../../../../services/cms-api-service.service';

import { ConfigService } from '../../../../services/config.service';
import { NotificationsModalComponent } from './notifications-modal/notifications-modal.component';




// =====================================================
// INTERFACE
// =====================================================

export interface Notifications {

  id: number;

  title: string;

  // Existing PDF path from database
  file: string | null;

  // Newly selected file
  filePath?: File | null;

}
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule,

    FormsModule,

    NgxPaginationModule,

    NotificationsModalComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {


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

  pageSizeOptions = [5, 10, 20, 50];


  showModal = signal(false);

  selectedNotifications =
    signal<Notifications | null>(null);

  notifications =
    signal<Notifications[]>([]);


  loggedInId = signal('');

  imageURL = signal('');


  // ===================================================
  // DESCRIPTION MODAL
  // ===================================================

  showDescriptionModal =
    signal(false);

  selectedDescription =
    signal('');

  selectedDescriptionTitle =
    signal('');


  // ===================================================
  // PLATFORM
  // ===================================================

  private platformId =
    inject(PLATFORM_ID);


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.getNotifications();

    this.imageURL.set(
      this.config.get('IMAGE_API_URL')
    );


    // -----------------------------------------------
    // Get logged-in user
    // -----------------------------------------------

    if (
      isPlatformBrowser(this.platformId)
    ) {

      const userString =
        localStorage.getItem('user');


      if (userString) {

        const currentUser =
          JSON.parse(userString);


        this.loggedInId.set(
          currentUser.id ?? ''
        );

      }

    }

  }


  // ===================================================
  // FILTER
  // ===================================================

  filteredNotifications = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    if (!keyword) {

      return this.notifications();

    }


    return this.notifications().filter(

      notifications =>

        notifications.title
          ?.toLowerCase()
          .includes(keyword)

    );

  });


  // ===================================================
  // CREATE
  // ===================================================

  createNotifications(): void {

    this.selectedNotifications.set(null);

    this.showModal.set(true);

  }


  // ===================================================
  // EDIT
  // ===================================================

  edit(
    notifications: Notifications
  ): void {

    this.selectedNotifications.set({

      ...notifications,

      filePath: null

    });

    this.showModal.set(true);

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(false);

    this.selectedNotifications.set(null);

  }


  // ===================================================
  // GET
  // ===================================================

  getNotifications(): void {

    this.apiService

      .GetRequest(
        'Notifications'
      )

      .subscribe({

        next: (res: any) => {

          this.page.set(1);

          console.log(res);


          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const notification:
            Notifications[] =

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


                file:
                  item.file ??
                  item.File ??
                  item.filePath ??
                  item.FilePath ??
                  null,


                filePath:
                  null

              })
            );


          this.notifications.set(
            notification
          );


          console.log(
            this.notifications()
          );

        },


        error: (err) => {

          console.error(
            'Notifications Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Notifications.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveNotifications(
    notifications: Notifications
  ): void {


    // =================================================
    // DETERMINE CREATE / EDIT
    // =================================================

    const isEdit =
      !!notifications.id;


    // =================================================
    // FORM DATA
    // =================================================

    const formData =
      new FormData();


    // =================================================
    // ID
    // =================================================

    if (isEdit) {

      formData.append(

        'Id',

        notifications.id.toString()

      );

    }


    // =================================================
    // TITLE
    // =================================================

    formData.append(

      'Title',

      notifications.title?.trim() ?? ''

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
    // PDF
    // =================================================

    /*
     * Only send PDF when user selects a new file.
     *
     * During edit, if no new PDF is selected,
     * backend should preserve existing PDF.
     */

    if (notifications.filePath) {

      formData.append(

        'File',

        notifications.filePath,

        notifications.filePath.name

      );

    }


    // =================================================
    // API REQUEST
    // =================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(

          'Notifications',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'Notifications',

          formData,

          true

        );


    // =================================================
    // RESPONSE
    // =================================================

    request.subscribe({

      next: (res: any) => {

        if (
          res?.isSucceeded
        ) {

          this.toastr.success(

            res.message ||

            `Notifications ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getNotifications();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save Notifications.'

          );

        }

      },


      error: (err) => {

        console.error(

          'Save Notifications Error:',

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
  // DELETE
  // ===================================================

  delete(
    notification: Notifications
  ): void {

    Swal.fire({

      title:
        'Delete Notifications?',

      text:
        `Are you sure you want to delete "${notification.title}"?`,

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


        // =================================================
        // FORM DATA
        // =================================================

        const formData =
          new FormData();


        formData.append(

          'Id',

          notification.id.toString()

        );


        /*
         * Existing PDF path.
         *
         * Backend can use this to physically
         * delete the PDF if required.
         */

        if (
          notification.file
        ) {

          formData.append(

            'File',

            notification.file

          );

        }


        // =================================================
        // API
        // =================================================

        this.apiService

          .DeleteFromFormRequest(

            'Notifications',

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

                  'Notifications deleted successfully.'

                );


                this.getNotifications();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete Notifications.'

                );

              }

            },


            error: (err) => {

              console.error(

                'Delete Notifications Error:',

                err

              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete Notifications.'

              );

            }

          });

      });

  }

}
