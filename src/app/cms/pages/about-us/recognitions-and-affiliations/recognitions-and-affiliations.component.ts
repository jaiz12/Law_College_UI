import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  signal, inject, PLATFORM_ID
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';

import { RecognitionsAndAffiliationsModalComponent } from './recognitions-and-affiliations-modal/recognitions-and-affiliations-modal.component';
import { DescriptionModalComponent } from '../../../shared/description-modal/description-modal.component';

export interface RecognitionAffiliation {

  id: number;

  title: string;

  content: string | null;

  // Existing PDF path from database
  file: string | null;

  // Newly selected file
  filePath?: File | null;

}

@Component({

  selector: 'app-recognitions-and-affiliations',

  standalone: true,

  imports: [

    CommonModule,
    FormsModule,
    NgxPaginationModule,
    RecognitionsAndAffiliationsModalComponent,
    DescriptionModalComponent

  ],

  templateUrl:
    './recognitions-and-affiliations.component.html',

  styleUrl:
    './recognitions-and-affiliations.component.scss'

})

export class RecognitionsAndAffiliationsComponent
  implements OnInit {


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

  selectedRecognitionAffiliation = signal<RecognitionAffiliation | null>(null);

  recognitionAffiliation = signal<RecognitionAffiliation[]>([]);


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

    this.getRecognitionAffiliation();

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

  filteredRecognitionAffiliation = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    if (!keyword) {

      return this.recognitionAffiliation();

    }


    return this.recognitionAffiliation().filter(
      recognitionAffiliation =>

        recognitionAffiliation.title
          ?.toLowerCase()
          .includes(keyword)

        ||

        recognitionAffiliation.content
          ?.toLowerCase()
          .includes(keyword)

    );

  });


  // ===================================================
  // CREATE
  // ===================================================

  createRecognitionAffiliation(): void {

    this.selectedRecognitionAffiliation.set(null);

    this.showModal.set(true);

  }


  // ===================================================
  // EDIT
  // ===================================================

  edit(
    RecognitionAffiliation: RecognitionAffiliation
  ): void {

    this.selectedRecognitionAffiliation.set({

      ...RecognitionAffiliation,

      filePath: null

    });

    this.showModal.set(true);

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(false);

    this.selectedRecognitionAffiliation.set(null);

  }


  // ===================================================
  // GET
  // ===================================================

  getRecognitionAffiliation(): void {

    this.apiService

      .GetRequest(
        'RecognitionsAndAffiliations'
      )

      .subscribe({

        next: (res: any) => {

          this.page.set(1);
          console.log(res)

          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const RecognitionAffiliation:
            RecognitionAffiliation[] =

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


          this.recognitionAffiliation.set(
            RecognitionAffiliation
          );


        },


        error: (err) => {

          console.error(
            'Recognition Affiliation Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Recognition Affiliation.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveRecognitionAffiliation(
    RecognitionAffiliation: RecognitionAffiliation
  ): void {


    // =================================================
    // DETERMINE CREATE / EDIT
    // =================================================

    const isEdit =
      !!RecognitionAffiliation.id;


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

        RecognitionAffiliation.id.toString()

      );

    }


    // =================================================
    // TITLE
    // =================================================

    formData.append(

      'Title',

      RecognitionAffiliation.title?.trim() ?? ''

    );


    // =================================================
    // CONTENT
    // =================================================

    formData.append(

      'Content',

      RecognitionAffiliation.content ?? ''

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

    if (RecognitionAffiliation.filePath) {

      formData.append(

        'File',

        RecognitionAffiliation.filePath,

        RecognitionAffiliation.filePath.name

      );

    }


    // =================================================
    // API REQUEST
    // =================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(

          'RecognitionsAndAffiliations',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'RecognitionsAndAffiliations',

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

            `RecognitionAffiliation ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getRecognitionAffiliation();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save RecognitionAffiliation.'

          );

        }

      },


      error: (err) => {

        console.error(

          'Save RecognitionAffiliation Error:',

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
    RecognitionAffiliation: RecognitionAffiliation
  ): void {

    Swal.fire({

      title:
        'Delete RecognitionAffiliation?',

      text:
        `Are you sure you want to delete "${RecognitionAffiliation.title}"?`,

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

          RecognitionAffiliation.id.toString()

        );


        /*
         * Existing PDF path.
         *
         * Backend can use this to physically
         * delete the PDF if required.
         */

        if (
          RecognitionAffiliation.file
        ) {

          formData.append(

            'File',

            RecognitionAffiliation.file

          );

        }


        // =================================================
        // API
        // =================================================

        this.apiService

          .DeleteFromFormRequest(

            'RecognitionsAndAffiliations',

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

                  'RecognitionAffiliation deleted successfully.'

                );


                this.getRecognitionAffiliation();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete RecognitionAffiliation.'

                );

              }

            },


            error: (err) => {

              console.error(

                'Delete RecognitionAffiliation Error:',

                err

              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete RecognitionAffiliation.'

              );

            }

          });

      });

  }


  // ===================================================
  // VIEW DESCRIPTION
  // ===================================================

  viewDescription(
    item: RecognitionAffiliation
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
