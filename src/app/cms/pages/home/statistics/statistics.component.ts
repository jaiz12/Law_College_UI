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
import { StatisticsModalComponent } from './statistics-modal/statistics-modal.component';


// =====================================================
// INTERFACE
// =====================================================

export interface Statistics {

  id: number;

  title: string;

  count: string;

}
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule,

    FormsModule,

    NgxPaginationModule,

    StatisticsModalComponent
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {


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
    signal<Statistics | null>(null);

  items =
    signal<Statistics[]>([]);

  loggedInId =
    signal('');


  // ===================================================
  // PAGE SIZE OPTIONS
  // ===================================================

  pageSizeOptions =
    [5, 10, 20, 50];

  PageName = "Statistics";


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

        item.count
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
    item: Statistics
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
        'Home/' + this.PageName
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
            Statistics[] =
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

                count:
                  item.count ??
                  item.Count ??
                  '',
              })
            );


          this.items.set(items);

        },

        error: (err) => {

          console.error(
            'Statistics Error:',
            err
          );

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Statistics.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveItem(item: Statistics): void {

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
    // PAGE NAME
    // =================================================

    formData.append(
      'PageName',
      this.PageName
    );


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
    // Count
    // =================================================

    formData.append(
      'Count',
      item.count?.trim() || ''
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
        'Home',
        formData,
        true
      )

      : this.apiService.PostRequest(
        'Home',
        formData,
        true
      );


    // =================================================
    // RESPONSE
    // =================================================

    request.subscribe({

      next: (res: any) => {

        console.log(
          'Home API Response:',
          res
        );


        if (res?.isSucceeded) {

          this.toastr.success(

            res?.message ||

            `Statistics ${isEdit
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
            } Statistics.`

          );

        }

      },


      error: (err) => {

        console.error(
          'Home API Error:',
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
    item: Statistics
  ): void {

    Swal.fire({

      title:
        'Delete Statistics?',

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


        const formData =
          new FormData();

        // =================================================
        // PAGE NAME
        // =================================================

        formData.append(
          'PageName',
          this.PageName
        );

        formData.append(
          'Id',
          item.id.toString()
        );


        this.apiService

          .DeleteFromFormRequest(
            'Home',
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

                  'Statistics deleted successfully.'

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
                'Delete Statistics Error:',
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
    item: Statistics
  ): number {

    return item.id;

  }

}
