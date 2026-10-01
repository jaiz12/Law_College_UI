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

import { ProspectusModalComponent } from './prospectus-modal/prospectus-modal.component';



// =====================================================
// INTERFACE
// =====================================================

export interface Prospectus {

  id: number;

  title: string;

  // Existing PDF path from database
  file: string | null;

  // Newly selected file
  filePath?: File | null;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-prospectus',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    ProspectusModalComponent,

  ],

  templateUrl: './prospectus.component.html',

  styleUrl: './prospectus.component.scss'

})
export class ProspectusComponent implements OnInit {


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

  selectedProspectus =
    signal<Prospectus | null>(null);

  prospectus =
    signal<Prospectus[]>([]);


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

    this.getProspectus();

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

  filteredProspectus = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    if (!keyword) {

      return this.prospectus();

    }


    return this.prospectus().filter(

      prospectus =>

        prospectus.title
          ?.toLowerCase()
          .includes(keyword)

    );

  });


  // ===================================================
  // CREATE
  // ===================================================

  createProspectus(): void {

    this.selectedProspectus.set(null);

    this.showModal.set(true);

  }


  // ===================================================
  // EDIT
  // ===================================================

  edit(
    prospectus: Prospectus
  ): void {

    this.selectedProspectus.set({

      ...prospectus,

      filePath: null

    });

    this.showModal.set(true);

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(false);

    this.selectedProspectus.set(null);

  }


  // ===================================================
  // GET
  // ===================================================

  getProspectus(): void {

    this.apiService

      .GetRequest(
        'Prospectus'
      )

      .subscribe({

        next: (res: any) => {

          this.page.set(1);

          console.log(res);


          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const prospectus:
            Prospectus[] =

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


          this.prospectus.set(
            prospectus
          );


          console.log(
            this.prospectus()
          );

        },


        error: (err) => {

          console.error(
            'Prospectus Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Prospectus.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveProspectus(
    prospectus: Prospectus
  ): void {


    // =================================================
    // DETERMINE CREATE / EDIT
    // =================================================

    const isEdit =
      !!prospectus.id;


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

        prospectus.id.toString()

      );

    }


    // =================================================
    // TITLE
    // =================================================

    formData.append(

      'Title',

      prospectus.title?.trim() ?? ''

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

    if (prospectus.filePath) {

      formData.append(

        'File',

        prospectus.filePath,

        prospectus.filePath.name

      );

    }


    // =================================================
    // API REQUEST
    // =================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(

          'Prospectus',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'Prospectus',

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

            `Prospectus ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getProspectus();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save Prospectus.'

          );

        }

      },


      error: (err) => {

        console.error(

          'Save Prospectus Error:',

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
    prospectus: Prospectus
  ): void {

    Swal.fire({

      title:
        'Delete Prospectus?',

      text:
        `Are you sure you want to delete "${prospectus.title}"?`,

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

          prospectus.id.toString()

        );


        /*
         * Existing PDF path.
         *
         * Backend can use this to physically
         * delete the PDF if required.
         */

        if (
          prospectus.file
        ) {

          formData.append(

            'File',

            prospectus.file

          );

        }


        // =================================================
        // API
        // =================================================

        this.apiService

          .DeleteFromFormRequest(

            'Prospectus',

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

                  'Prospectus deleted successfully.'

                );


                this.getProspectus();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete Prospectus.'

                );

              }

            },


            error: (err) => {

              console.error(

                'Delete Prospectus Error:',

                err

              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete Prospectus.'

              );

            }

          });

      });

  }

}
