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

import { LayoutService } from '../../../layout/services/layout.service';
import { finalize } from 'rxjs';
import { EligibilityAdmissionProcessAndIntakeModalComponent } from './eligibility-admission-process-and-intake-modal/eligibility-admission-process-and-intake-modal.component';



// =====================================================
// INTERFACE
// =====================================================

export interface EligibilityAdmissionProcessAndIntake {

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
  selector: 'app-eligibility-admission-process-and-intake',
  standalone: true,
  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    EligibilityAdmissionProcessAndIntakeModalComponent,

  ],
  templateUrl: './eligibility-admission-process-and-intake.component.html',
  styleUrl: './eligibility-admission-process-and-intake.component.scss'
})
export class EligibilityAdmissionProcessAndIntakeComponent implements OnInit {


  // ===================================================
  // CONSTRUCTOR
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


  showModal = signal(false);

  items =
    signal<EligibilityAdmissionProcessAndIntake | null>(null);

  item =
    signal<EligibilityAdmissionProcessAndIntake[]>([]);


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

    this.get();

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

  filteredData = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    if (!keyword) {

      return this.item();

    }


    return this.item().filter(

      item =>

        item.title
          ?.toLowerCase()
          .includes(keyword)

    );

  });


  // ===================================================
  // CREATE
  // ===================================================

  create(): void {

    this.items.set(null);

    this.showModal.set(true);

  }


  // ===================================================
  // EDIT
  // ===================================================

  edit(
    item: EligibilityAdmissionProcessAndIntake
  ): void {

    this.items.set({

      ...item,

      filePath: null

    });

    this.showModal.set(true);

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(false);

    this.items.set(null);

  }


  // ===================================================
  // GET
  // ===================================================

  get(): void {
    this.layout.showPageLoader();
    this.apiService

      .GetRequest(
        'EligibilityAdmissionProcessAndIntake'
      ).pipe(
        finalize(() => {
          this.layout.hidePageLoader();
        })
      )

      .subscribe({

        next: (res: any) => {

          this.page.set(1);

          console.log(res);


          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const item:
            EligibilityAdmissionProcessAndIntake[] =

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


          this.item.set(
            item
          );


          console.log(
            this.item()
          );

        },


        error: (err) => {

          console.error(
            'Eligibility Admission Process And Intake Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Eligibility Admission Process And Intake.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  save(
    prospectus: EligibilityAdmissionProcessAndIntake
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

          'EligibilityAdmissionProcessAndIntake',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'EligibilityAdmissionProcessAndIntake',

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


          this.get();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save Eligibility Admission Process And Intake.'

          );

        }

      },


      error: (err) => {

        console.error(

          'Save Eligibility Admission Process And Intake Error:',

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
    item: EligibilityAdmissionProcessAndIntake
  ): void {

    Swal.fire({

      title:
        'Delete Prospectus?',

      text:
        `Are you sure you want to delete "${item.title}"?`,

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

          item.id.toString()

        );


        /*
         * Existing PDF path.
         *
         * Backend can use this to physically
         * delete the PDF if required.
         */

        if (
          item.file
        ) {

          formData.append(

            'File',

            item.file

          );

        }


        // =================================================
        // API
        // =================================================

        this.apiService

          .DeleteFromFormRequest(

            'EligibilityAdmissionProcessAndIntake',

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


                this.get();

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
