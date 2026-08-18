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

import {
  WhyChooseUsModalComponent
} from './why-choose-us-modal/why-choose-us-modal.component';


// =====================================================
// INTERFACE
// =====================================================

export interface WhyChooseUs {

  id: number;

  icon: string;

  title: string;

  description: string;

  externalLink: string | null;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-why-choose-us',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    WhyChooseUsModalComponent

  ],

  templateUrl:
    './why-choose-us.component.html',

  styleUrl:
    './why-choose-us.component.scss'

})
export class WhyChooseUsComponent
  implements OnInit {


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
    signal<WhyChooseUs | null>(null);

  items =
    signal<WhyChooseUs[]>([]);

  loggedInId =
    signal('');


  // ===================================================
  // PAGE SIZE OPTIONS
  // ===================================================

  pageSizeOptions =
    [5, 10, 20, 50];

  PageName = "Why Choose Us";


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

        item.description
          ?.toLowerCase()
          .includes(keyword)

        ||

        item.icon
          ?.toLowerCase()
          .includes(keyword)

        ||

        item.externalLink
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
    item: WhyChooseUs
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
            WhyChooseUs[] =
            data.map(
              (item: any) => ({

                id:
                  item.id ??
                  item.Id ??
                  0,

                icon:
                  item.icon ??
                  item.Icon ??
                  '',

                title:
                  item.title ??
                  item.Title ??
                  '',

                description:
                  item.description ??
                  item.Description ??
                  '',

                externalLink:
                  item.externalLink ??
                  item.ExternalLink ??
                  null

              })
            );


          this.items.set(items);

        },

        error: (err) => {

          console.error(
            'Why Choose Us Error:',
            err
          );

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Why Choose Us.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveItem(item: WhyChooseUs): void {

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
    // ICON
    // =================================================

    formData.append(
      'Icon',
      item.icon?.trim() || ''
    );


    // =================================================
    // TITLE
    // =================================================

    formData.append(
      'Title',
      item.title?.trim() || ''
    );


    // =================================================
    // DESCRIPTION
    // =================================================

    formData.append(
      'Description',
      item.description?.trim() || ''
    );


    // =================================================
    // EXTERNAL LINK
    // =================================================

    formData.append(
      'ExternalLink',
      item.externalLink?.trim() || ''
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

            `Why Choose Us ${isEdit
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
            } Why Choose Us.`

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
    item: WhyChooseUs
  ): void {

    Swal.fire({

      title:
        'Delete Why Choose Us?',

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

                  'Why Choose Us deleted successfully.'

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
                'Delete Why Choose Us Error:',
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
    item: WhyChooseUs
  ): number {

    return item.id;

  }

}
