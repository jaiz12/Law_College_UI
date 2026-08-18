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
import { OurProgramModalComponent } from './our-program-modal/our-program-modal.component';


// =====================================================
// INTERFACE
// =====================================================

export interface OurProgram {

  id: number;

  title: string;

  shortDescription: string;

  description: string;

}

@Component({
  selector: 'app-our-program',
  standalone: true,
  imports: [CommonModule,

    FormsModule,

    NgxPaginationModule,

    OurProgramModalComponent
  ],
  templateUrl: './our-program.component.html',
  styleUrl: './our-program.component.scss'
})
export class OurProgramComponent implements OnInit {


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService

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

  showModal =
    signal(false);

  selectedItem =
    signal<OurProgram | null>(null);

  items =
    signal<OurProgram[]>([]);

  loggedInId =
    signal('');


  // ===================================================
  // PAGE SIZE OPTIONS
  // ===================================================

  pageSizeOptions =
    [5, 10, 20, 50];



  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.getItems();

    const userString =
      localStorage.getItem('user');

    if (userString) {

      try {

        const currentUser =
          JSON.parse(userString);

        this.loggedInId.set(
          currentUser?.id ?? ''
        );

      }
      catch {

        this.loggedInId.set('');

      }

    }

  }


  // ===================================================
  // FILTERED ITEMS
  // ===================================================

  filteredItems =
    computed(() => {

      const keyword =
        this.search()
          .trim()
          .toLowerCase();

      if (!keyword) {

        return this.items();

      }

      return this.items().filter(item =>

        item.title
          ?.toLowerCase()
          .includes(keyword)

        ||

        item.shortDescription
          ?.toLowerCase()
          .includes(keyword)

        ||

        item.description
          ?.toLowerCase()
          .includes(keyword)


      );

    });


  // ===================================================
  // ADD
  // ===================================================

  addItem(): void {

    this.selectedItem.set(null);

    this.showModal.set(true);

  }


  // ===================================================
  // EDIT
  // ===================================================

  editItem(
    item: OurProgram
  ): void {

    this.selectedItem.set({

      ...item

    });

    this.showModal.set(true);

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(false);

    this.selectedItem.set(null);

  }


  // ===================================================
  // GET ITEMS
  // ===================================================

  getItems(): void {

    this.apiService

      .GetRequest(
        'OurProgram'
      )

      .subscribe({

        next: (res: any) => {

          const data =
            Array.isArray(res)

              ? res

              : Array.isArray(res?.data)

                ? res.data

                : [];


          const items:
            OurProgram[] =
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

                shortDescription:
                  item.shortDescription ??
                  item.ShortDescription ??
                  '',

                description:
                  item.description ??
                  item.Description ??
                  '',
              })
            );


          this.items.set(items);

        },

        error: (err) => {

          console.error(
            'Our Program Error:',
            err
          );

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Our Program.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveItem(item: OurProgram): void {

    console.log('SAVE ITEM RECEIVED:', item);


    // =================================================
    // CHECK EDIT / CREATE
    // =================================================

    const isEdit =
      Number(item.id) > 0;


    console.log(
      'Is Edit:',
      isEdit
    );


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
        item.id.toString()
      );

    }


    // =================================================
    // USER
    // =================================================

    if (isEdit) {

      formData.append(
        'UpdatedBy',
        this.loggedInId() || ''
      );

    }
    else {

      formData.append(
        'CreatedBy',
        this.loggedInId() || ''
      );

    }


    // =================================================
    // TITLE
    // =================================================

    formData.append(
      'Title',
      item.title?.trim() || ''
    );


    // =================================================
    // Short Description
    // =================================================

    formData.append(
      'shortDescription',
      item.shortDescription?.trim() || ''
    );

    // =================================================
    // Description
    // =================================================

    formData.append(
      'Description',
      item.shortDescription?.trim() || ''
    );


    // =================================================
    // DEBUG FORMDATA
    // =================================================

    formData.forEach((value, key) => {

      console.log(
        `${key}:`,
        value
      );

    });


    // =================================================
    // API REQUEST
    // =================================================

    const request = isEdit

      ? this.apiService.PutRequest(
        'OurProgram',
        formData,
        true
      )

      : this.apiService.PostRequest(
        'OurProgram',
        formData,
        true
      );


    // =================================================
    // RESPONSE
    // =================================================

    request.subscribe({

      next: (res: any) => {

        console.log(
          'Our Program Response:',
          res
        );


        if (res?.isSucceeded) {

          this.toastr.success(

            res?.message ||

            `Our Program ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          // Reload data
          this.getItems();


          // Close modal
          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            `Unable to ${isEdit
              ? 'update'
              : 'create'
            } OurProgram.`

          );

        }

      },


      error: (err) => {

        console.error(
          'Our Program API Error:',
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

  deleteItem(
    item: OurProgram
  ): void {

    Swal.fire({

      title:
        'Delete Our Program?',

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


        this.apiService

          .DeleteRequest(
            'OurProgram',
            item.id.toString()
          )

          .subscribe({

            next: (res: any) => {

              if (
                res?.isSucceeded
              ) {

                this.toastr.success(

                  res?.message ||

                  'Our Program deleted successfully.'

                );

                this.getItems();

              }
              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete item.'

                );

              }

            },

            error: (err) => {

              console.error(
                'Delete Our Program Error:',
                err
              );

              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete item.'

              );

            }

          });

      });

  }


  // ===================================================
  // TRACK BY
  // ===================================================

  trackById(
    index: number,
    item: OurProgram
  ): number {

    return item.id;

  }

}
