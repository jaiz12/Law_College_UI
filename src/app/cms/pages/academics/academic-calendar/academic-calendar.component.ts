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

import { AcademicCalendarModalComponent } from './academic-calendar-modal/academic-calendar-modal.component';
import { ConfigService } from '../../../../services/config.service';
import { DescriptionModalComponent } from '../../../shared/description-modal/description-modal.component';
import { OurProgram } from '../our-program/our-program.component';


// =====================================================
// INTERFACE
// =====================================================

export interface AcademicCalendar {

  id: number;

  title: string;

  content: string | null;

  // Existing file path from database
  file: string | null;

  // Newly selected file
  filePath?: File | null;

  isActive: boolean;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector:
    'app-academic-calendar',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    AcademicCalendarModalComponent,

    DescriptionModalComponent

  ],

  templateUrl:
    './academic-calendar.component.html',

  styleUrl:
    './academic-calendar.component.scss'

})
export class AcademicCalendarComponent
  implements OnInit {


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private apiService:
      CmsApiService,

    private toastr:
      ToastrService,
    private config: ConfigService

  ) { }


  // ===================================================
  // SIGNALS
  // ===================================================

  search =
    signal('');

  page =
    signal(1);

  itemsPerPage =
    signal(5);

  pageSizeOptions =
    [5, 10, 20, 50];

  showModal =
    signal(false);

  selectedAcademicCalendar =
    signal<AcademicCalendar | null>(null);

  academicCalendars =
    signal<AcademicCalendar[]>([]);

  loggedInId =
    signal('');

  imageURL = signal('');

  showDescriptionModal = signal(false);

  selectedDescription = signal('');

  selectedDescriptionTitle = signal('');
  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.getAcademicCalendars();

    this.imageURL.set(this.config.get('IMAGE_API_URL'));

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

  filteredAcademicCalendars =
    computed(() => {

      const keyword =
        this.search()
          .trim()
          .toLowerCase();


      if (!keyword) {

        return this.academicCalendars();

      }


      return this.academicCalendars().filter(
        calendar =>

          calendar.title
            ?.toLowerCase()
            .includes(keyword)

          ||

          calendar.content
            ?.toLowerCase()
            .includes(keyword)

      );

    });


  // ===================================================
  // CREATE
  // ===================================================

  createAcademicCalendar(): void {

    this.selectedAcademicCalendar.set(
      null
    );

    this.showModal.set(
      true
    );

  }


  // ===================================================
  // EDIT
  // ===================================================

  edit(
    calendar: AcademicCalendar
  ): void {

    this.selectedAcademicCalendar.set({

      ...calendar,

      filePath:
        null

    });

    this.showModal.set(
      true
    );

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(
      false
    );

    this.selectedAcademicCalendar.set(
      null
    );

  }


  // ===================================================
  // GET
  // ===================================================

  getAcademicCalendars(): void {

    this.apiService

      .GetRequest(
        'AcademicCalendar'
      )

      .subscribe({

        next: (res: any) => {

          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const calendars:
            AcademicCalendar[] =

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

                content:
                  item.content ??
                  item.Content ??
                  null,

                file:
                  item.file ??
                  item.File ??
                  item.filePath ??
                  item.FilePath ??
                  null,

                fileFile:
                  null,

                isActive:
                  item.isActive ??
                  item.IsActive ??
                  false

              })
            );


          this.academicCalendars.set(
            calendars
          );

        },

        error: (err) => {

          console.error(
            'Academic Calendar Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Academic Calendar.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveAcademicCalendar(
    calendar: AcademicCalendar
  ): void {


    // =================================================
    // DETERMINE CREATE / EDIT
    // =================================================

    const isEdit =
      !!calendar.id;


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

        calendar.id.toString()

      );

    }


    // =================================================
    // TITLE
    // =================================================

    formData.append(

      'Title',

      calendar.title?.trim() ?? ''

    );


    // =================================================
    // CONTENT
    // =================================================

    formData.append(

      'Content',

      calendar.content ?? ''

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
    // IS ACTIVE
    // =================================================

    formData.append(
      'IsActive',
      'false'
    );


    // =================================================
    // FILE
    // =================================================

    /*
     * Only send a file when the user selected
     * a NEW file.
     *
     * During edit, if no new file is selected,
     * the backend should keep the existing FilePath.
     */

    if (calendar.filePath) {

      formData.append(

        'File',

        calendar.filePath,

        calendar.filePath.name

      );

    }


    // =================================================
    // API REQUEST
    // =================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(

          'AcademicCalendar',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'AcademicCalendar',

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

            `Academic Calendar ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getAcademicCalendars();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save Academic Calendar.'

          );

        }

      },

      error: (err) => {

        console.error(

          'Save Academic Calendar Error:',

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
  // SET ACTIVE
  // ===================================================

  setActive(
    calendar: AcademicCalendar
  ): void {

    // Already active
    if (
      calendar.isActive
    ) {

      return;

    }


    // =================================================
    // BACKUP
    // =================================================

    const previousItems =
      this.academicCalendars()
        .map(item => ({
          ...item
        }));


    // =================================================
    // OPTIMISTIC UPDATE
    // =================================================

    this.academicCalendars.update(

      list =>

        list.map(item => ({

          ...item,

          isActive:
            item.id === calendar.id

        }))

    );


    // =================================================
    // FORM DATA
    // =================================================

    const formData =
      new FormData();


    formData.append(

      'Id',

      calendar.id.toString()

    );

    // =================================================
    // TITLE
    // =================================================

    formData.append(

      'Title',

      calendar.title?.trim() ?? ''

    );


    // =================================================
    // CONTENT
    // =================================================

    formData.append(

      'Content',

      calendar.content ?? ''

    );

    if (calendar.filePath) {

      formData.append(

        'File',

        calendar.filePath,

        calendar.filePath.name

      );

    }
    formData.append(

      'IsActive',

      'true'

    );


    formData.append(

      'UpdatedBy',

      this.loggedInId()

    );


    // =================================================
    // API
    // =================================================

    this.apiService

      .PutRequest(

        'AcademicCalendar',

        formData,

        true

      )

      .subscribe({

        next: (res: any) => {

          if (
            res?.isSucceeded
          ) {

            this.toastr.success(

              res?.message ||

              'Status updated.'

            );

          }

          else {

            // Rollback
            this.academicCalendars.set(
              previousItems
            );


            this.toastr.warning(

              res?.message ||

              'Unable to update status.'

            );

          }

        },

        error: (err) => {

          // Rollback
          this.academicCalendars.set(
            previousItems
          );


          console.error(
            'Set Active Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to update status.'

          );

        }

      });

  }


  // ===================================================
  // DELETE
  // ===================================================

  delete(
    calendar: AcademicCalendar
  ): void {

    Swal.fire({

      title:
        'Delete Academic Calendar?',

      text:
        `Are you sure you want to delete "${calendar.title}"?`,

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

          calendar.id.toString()

        );


        /*
         * Existing file path.
         *
         * Your backend can use this to physically
         * delete the file if required.
         */

        if (
          calendar.file
        ) {

          formData.append(

            'File',

            calendar.file

          );

        }


        // =================================================
        // API
        // =================================================

        this.apiService

          .DeleteFromFormRequest(

            'AcademicCalendar',

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

                  'Academic Calendar deleted successfully.'

                );


                this.getAcademicCalendars();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete Academic Calendar.'

                );

              }

            },

            error: (err) => {

              console.error(

                'Delete Academic Calendar Error:',

                err

              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete Academic Calendar.'

              );

            }

          });

      });

  }

  viewDescription(item: AcademicCalendar): void {

    this.selectedDescriptionTitle.set(
      item.title ?? 'Content'
    );

    this.selectedDescription.set(
      item.content ?? ''
    );

    this.showDescriptionModal.set(true);
  }

  closeDescriptionModal(): void {

    this.showDescriptionModal.set(false);

    this.selectedDescription.set('');

    this.selectedDescriptionTitle.set('');
  }

}
