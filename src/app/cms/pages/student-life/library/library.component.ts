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
import { LibraryModalComponent } from './library-modal/library-modal.component';

export interface Library {

  id: number;

  title: string;

  externalLink: string | null;

}

@Component({

  selector: 'app-library',

  standalone: true,

  imports: [

    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LibraryModalComponent

  ],

  templateUrl:
    './library.component.html',

  styleUrl:
    './library.component.scss'

})

export class LibraryComponent
  implements OnInit {

  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService

  ) { }


  // -------------------------------------------------
  // Signals
  // -------------------------------------------------

  search = signal('');

  showModal = signal(false);

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  loggedInId = signal('');

  libraries =
    signal<Library[]>([]);

  selectedLibrary =
    signal<Library | null>(null);


  // -------------------------------------------------
  // Init
  // -------------------------------------------------

  ngOnInit(): void {

    this.getLibraries();


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

  filteredLibraries = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();

    if (!keyword) {

      return this.libraries();

    }

    return this.libraries().filter(item =>

      item.title
        .toLowerCase()
        .includes(keyword)

      ||

      (item.externalLink ?? '')
        .toLowerCase()
        .includes(keyword)

    );

  });


  // -------------------------------------------------
  // GET
  // -------------------------------------------------

  getLibraries(): void {

    this.apiService

      .GetRequest('Library')

      .subscribe({

        next: (res: any) => {

          console.log(res);

          const data =
            Array.isArray(res)

              ? res

              : res.data || [];


          const list: Library[] =

            data.map((item: any) => ({

              id:

                item.id ??

                item.Id ??

                0,

              title:

                item.title ??

                item.Title ??

                '',

              externalLink:

                item.externalLink ??

                item.ExternalLink ??

                ''

            }));


          this.libraries.set(list);

        },

        error: (err) => {

          console.error(err);

          this.toastr.error(

            err?.error?.message ||

            'Unable to load library records.'

          );

        }

      });

  }


  // -------------------------------------------------
  // ADD
  // -------------------------------------------------

  addLibrary(): void {

    this.selectedLibrary.set(null);

    this.showModal.set(true);

  }


  // -------------------------------------------------
  // EDIT
  // -------------------------------------------------

  editLibrary(
    library: Library
  ): void {

    this.selectedLibrary.set({

      ...library

    });

    this.showModal.set(true);

  }


  // -------------------------------------------------
  // CLOSE MODAL
  // -------------------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedLibrary.set(null);

  }


  // -------------------------------------------------
  // SAVE
  // -------------------------------------------------

  saveLibrary(
    library: Library
  ): void {

    const isEdit =
      library.id > 0;


    const formData =
      new FormData();


    if (isEdit) {

      formData.append(

        'Id',

        library.id.toString()

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

      library.title

    );


    formData.append(

      'ExternalLink',

      library.externalLink ?? ''

    );


    const request =

      isEdit

        ? this.apiService.PutRequest(

          'Library',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'Library',

          formData,

          true

        );


    request.subscribe({

      next: (res: any) => {

        if (res.isSucceeded) {

          this.toastr.success(

            res.message ||

            `Library ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getLibraries();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res.message ||

            'Unable to save library record.'

          );

        }

      },

      error: (err) => {

        console.error(err);

        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong while saving the library record.'

        );

      }

    });

  }


  // -------------------------------------------------
  // DELETE
  // -------------------------------------------------

  deleteLibrary(
    library: Library
  ): void {

    Swal.fire({

      title: 'Delete Library?',

      text:
        `Are you sure you want to delete "${library.title}"?`,

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


      const formData =
        new FormData();


      formData.append(

        'Id',

        library.id.toString()

      );


      this.apiService

        .DeleteFromFormRequest(

          'Library',

          formData,

          true

        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(

                res.message ||

                'Library deleted successfully.'

              );

              this.getLibraries();

            }

            else {

              this.toastr.warning(

                res.message ||

                'Unable to delete library.'

              );

            }

          },

          error: (err) => {

            console.error(err);

            this.toastr.error(

              err?.error?.message ||

              err?.message ||

              'Unable to delete library.'

            );

          }

        });

    });

  }

}
