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

import { DescriptionModalComponent } from '../../../shared/description-modal/description-modal.component';

import { SyllabusModalComponent } from './syllabus-modal/syllabus-modal.component';


// =====================================================
// INTERFACE
// =====================================================

export interface Syllabus {

  id: number;

  title: string;

  content: string | null;

  // Existing PDF path from database
  file: string | null;

  // Newly selected file
  filePath?: File | null;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-syllabus',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    SyllabusModalComponent,

    DescriptionModalComponent

  ],

  templateUrl: './syllabus.component.html',

  styleUrl: './syllabus.component.scss'

})
export class SyllabusComponent implements OnInit {


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

  selectedSyllabus = signal<Syllabus | null>(null);

  syllabus = signal<Syllabus[]>([]);


  loggedInId = signal('');

  imageURL = signal('');


  // ===================================================
  // DESCRIPTION MODAL
  // ===================================================

  showDescriptionModal = signal(false);

  selectedDescription = signal('');

  selectedDescriptionTitle = signal('');


  // ===================================================
  // PLATFORM
  // ===================================================

  private platformId = inject(PLATFORM_ID);


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.getSyllabus();

    this.imageURL.set(
      this.config.get('IMAGE_API_URL')
    );


    // -----------------------------------------------
    // Get logged-in user
    // -----------------------------------------------

    if (isPlatformBrowser(this.platformId)) {

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

  filteredSyllabus = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    if (!keyword) {

      return this.syllabus();

    }


    return this.syllabus().filter(
      syllabus =>

        syllabus.title
          ?.toLowerCase()
          .includes(keyword)

        ||

        syllabus.content
          ?.toLowerCase()
          .includes(keyword)

    );

  });


  // ===================================================
  // CREATE
  // ===================================================

  createSyllabus(): void {

    this.selectedSyllabus.set(null);

    this.showModal.set(true);

  }


  // ===================================================
  // EDIT
  // ===================================================

  edit(
    syllabus: Syllabus
  ): void {

    this.selectedSyllabus.set({

      ...syllabus,

      filePath: null

    });

    this.showModal.set(true);

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(false);

    this.selectedSyllabus.set(null);

  }


  // ===================================================
  // GET
  // ===================================================

  getSyllabus(): void {

    this.apiService

      .GetRequest(
        'Syllabus'
      )

      .subscribe({

        next: (res: any) => {

          this.page.set(1);
          console.log(res)

          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const syllabus:
            Syllabus[] =

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


                filePath:
                  null

              })
            );


          this.syllabus.set(
            syllabus
          );

          console.log(this.syllabus())

        },


        error: (err) => {

          console.error(
            'Syllabus Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Syllabus.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveSyllabus(
    syllabus: Syllabus
  ): void {


    // =================================================
    // DETERMINE CREATE / EDIT
    // =================================================

    const isEdit =
      !!syllabus.id;


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

        syllabus.id.toString()

      );

    }


    // =================================================
    // TITLE
    // =================================================

    formData.append(

      'Title',

      syllabus.title?.trim() ?? ''

    );


    // =================================================
    // CONTENT
    // =================================================

    formData.append(

      'Content',

      syllabus.content ?? ''

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

    if (syllabus.filePath) {

      formData.append(

        'File',

        syllabus.filePath,

        syllabus.filePath.name

      );

    }


    // =================================================
    // API REQUEST
    // =================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(

          'Syllabus',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'Syllabus',

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

            `Syllabus ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getSyllabus();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save Syllabus.'

          );

        }

      },


      error: (err) => {

        console.error(

          'Save Syllabus Error:',

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
    syllabus: Syllabus
  ): void {

    Swal.fire({

      title:
        'Delete Syllabus?',

      text:
        `Are you sure you want to delete "${syllabus.title}"?`,

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

          syllabus.id.toString()

        );


        /*
         * Existing PDF path.
         *
         * Backend can use this to physically
         * delete the PDF if required.
         */

        if (
          syllabus.file
        ) {

          formData.append(

            'File',

            syllabus.file

          );

        }


        // =================================================
        // API
        // =================================================

        this.apiService

          .DeleteFromFormRequest(

            'Syllabus',

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

                  'Syllabus deleted successfully.'

                );


                this.getSyllabus();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete Syllabus.'

                );

              }

            },


            error: (err) => {

              console.error(

                'Delete Syllabus Error:',

                err

              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete Syllabus.'

              );

            }

          });

      });

  }


  // ===================================================
  // VIEW DESCRIPTION
  // ===================================================

  viewDescription(
    item: Syllabus
  ): void {

    this.selectedDescriptionTitle.set(

      item.title ?? 'Content'

    );


    this.selectedDescription.set(

      item.content ?? ''

    );


    this.showDescriptionModal.set(true);

  }


  // ===================================================
  // CLOSE DESCRIPTION MODAL
  // ===================================================

  closeDescriptionModal(): void {

    this.showDescriptionModal.set(false);

    this.selectedDescription.set('');

    this.selectedDescriptionTitle.set('');

  }

}
