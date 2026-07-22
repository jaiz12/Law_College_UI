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

import { RecognitionsAndAffiliationsModalComponent } from './recognitions-and-affiliations-modal/recognitions-and-affiliations-modal.component';

export interface RecognitionAffiliation {

  id: number;

  title: string;

  description: string;

  externalUrl: string | null;

  image: string | null;

  imageFile: File | null;

  displayOrder: number;

}

@Component({

  selector: 'app-recognitions-and-affiliations',

  standalone: true,

  imports: [

    CommonModule,
    FormsModule,
    NgxPaginationModule,
    RecognitionsAndAffiliationsModalComponent

  ],

  templateUrl:
    './recognitions-and-affiliations.component.html',

  styleUrl:
    './recognitions-and-affiliations.component.scss'

})

export class RecognitionsAndAffiliationsComponent
  implements OnInit {

  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService,

    private config: ConfigService

  ) { }

  // -------------------------------------------------
  // Signals
  // -------------------------------------------------

  search = signal('');

  showModal = signal(false);

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  imageURL = signal('');

  loggedInId = signal('');

  recognitions =
    signal<RecognitionAffiliation[]>([]);

  selectedRecognition =
    signal<RecognitionAffiliation | null>(null);


  ngOnInit(): void {

    this.imageURL.set(
      this.config.get('IMAGE_API_URL')
    );

    this.getRecognitions();

    const user =
      localStorage.getItem('user');

    if (user) {

      this.loggedInId.set(

        JSON.parse(user).id

      );

    }

  }

  // -------------------------------------------------
  // Filter
  // -------------------------------------------------

  filteredRecognitions = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();

    if (!keyword) {

      return this.recognitions();

    }

    return this.recognitions().filter(item =>

      item.title
        .toLowerCase()
        .includes(keyword)

      ||

      item.description
        .toLowerCase()
        .includes(keyword)

      ||

      (item.externalUrl ?? '')
        .toLowerCase()
        .includes(keyword)

    );

  });

  // -------------------------------------------------
  // Load Recognitions & Affiliations
  // -------------------------------------------------

  getRecognitions(): void {

    this.apiService

      .GetRequest('RecognitionsAndAffiliations')

      .subscribe({

        next: (res: any) => {

          console.log(res);

          const data = Array.isArray(res)

            ? res

            : res.data || [];

          const list: RecognitionAffiliation[] =

            data.map((item: any) => ({

              id:

                item.id ??

                item.Id ??

                0,

              title:

                item.title ??

                item.Title ??

                '',

              description:

                item.description ??

                item.Description ??

                '',

              externalUrl:

                item.externalUrl ??

                item.ExternalUrl ??

                '',

              image:

                item.image ??

                item.Image ??

                item.coverImage ??

                item.CoverImage ??

                null,

              // Used only while uploading a new image
              imageFile: null,

              displayOrder:

                item.displayOrder ??

                item.DisplayOrder ??

                item.order ??

                item.Order ??

                0

            }));

          this.recognitions.set(list);

        },

        error: (err) => {

          console.error(err);

          this.toastr.error(

            err?.error?.message ||

            'Unable to load Recognitions & Affiliations.'

          );

        }

      });

  }

  // -------------------------------------------------
  // Add Recognition
  // -------------------------------------------------

  addRecognition(): void {

    this.selectedRecognition.set(null);

    this.showModal.set(true);

  }

  // -------------------------------------------------
  // Edit Recognition
  // -------------------------------------------------

  editRecognition(
    recognition: RecognitionAffiliation
  ): void {

    this.selectedRecognition.set({

      ...recognition

    });

    this.showModal.set(true);

  }

  // -------------------------------------------------
  // Close Modal
  // -------------------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedRecognition.set(null);

  }

  // -------------------------------------------------
  // Save Recognition
  // -------------------------------------------------

  saveRecognition(
    recognition: RecognitionAffiliation
  ): void {

    const isEdit =
      recognition.id > 0;

    const formData =
      new FormData();

    if (isEdit) {

      formData.append(
        'Id',
        recognition.id.toString()
      );

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

    formData.append(
      'Title',
      recognition.title
    );

    formData.append(
      'Description',
      recognition.description
    );

    formData.append(
      'ExternalUrl',
      recognition.externalUrl ?? ''
    );

    formData.append(
      'DisplayOrder',
      recognition.displayOrder.toString()
    );

    // Upload image only when user selects a new one
    if (recognition.imageFile) {

      formData.append(
        'Image',
        recognition.imageFile,
        recognition.imageFile.name
      );

    }

    const request = isEdit

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

    request.subscribe({

      next: (res: any) => {

        if (res.isSucceeded) {

          this.toastr.success(

            res.message ||

            `Recognitions And Affiliations ${isEdit ? 'updated' : 'created'
            } successfully.`

          );

          this.getRecognitions();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res.message ||

            'Unable to save recognition.'

          );

        }

      },

      error: (err) => {

        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong while saving the recognition.'

        );

      }

    });

  }

  // -------------------------------------------------
  // Delete
  // -------------------------------------------------

  deleteRecognition(recognitionandaffiliation: RecognitionAffiliation): void {

    Swal.fire({

      title: 'Delete Member?',

      text: `Are you sure you want to delete "${recognitionandaffiliation.title}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Yes, Delete',

      cancelButtonText: 'Cancel',

      confirmButtonColor: '#dc2626',

      reverseButtons: true

    }).then(result => {

      if (!result.isConfirmed) {

        return;

      }

      const formData = new FormData();

      formData.append(
        'Id',
        recognitionandaffiliation.id.toString()
      );

      formData.append(
        'CoverImage',
        recognitionandaffiliation.image ?? ''
      );

      this.apiService

        .DeleteFromFormRequest(
          'RecognitionsAndAffiliations',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(
                res.message || 'Member deleted successfully.'
              );

              this.getRecognitions();

            } else {

              this.toastr.warning(
                res.message || 'Unable to delete member.'
              );

            }

          },

          error: (err) => {

            this.toastr.error(

              err?.error?.message ||

              err?.message ||

              'Unable to delete member.'

            );

          }

        });

    });

  }

}
