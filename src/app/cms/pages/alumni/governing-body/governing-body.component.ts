import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { GoverningBodyModalComponent } from './governing-body-modal/governing-body-modal.component';
import { DescriptionModalComponent } from '../../../shared/description-modal/description-modal.component';


export interface GoverningBody {

  id: string | null;

  title: string;

  content: string;

  photo: string;

}
@Component({
  selector: 'app-governing-body',
  standalone: true,
  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    GoverningBodyModalComponent,
    DescriptionModalComponent

  ],

  templateUrl: './governing-body.component.html',
  styleUrl: './governing-body.component.scss'
})
export class GoverningBodyComponent implements OnInit {


  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService,

    private config: ConfigService

  ) { }

  // ---------------------------------------
  // Signals
  // ---------------------------------------

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  showModal = signal(false);

  selectedItem = signal<GoverningBody | null>(null);

  items = signal<GoverningBody[]>([]);
  imageURL = signal('');

  loggedInId = signal('');

  private platformId = inject(PLATFORM_ID);

  // ===================================================
  // DESCRIPTION MODAL
  // ===================================================

  showDescriptionModal = signal(false);

  selectedDescription = signal('');

  selectedDescriptionTitle = signal('');

  ngOnInit() {
    this.getData();
    this.imageURL.set(this.config.get('IMAGE_API_URL'));
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('user');

      if (userString) {
        const currentUser = JSON.parse(userString);
        this.loggedInId.set(currentUser.id);
      }
    }
  }

  // ---------------------------------------
  // Filter
  // ---------------------------------------

  filteredData = computed(() => {

    const keyword = this.search()
      .trim()
      .toLowerCase();

    if (!keyword) {
      return this.items();
    }

    return this.items().filter(item =>

      item.title
        ?.toLowerCase()
        .includes(keyword) ||

      item.content
        ?.toLowerCase()
        .includes(keyword) ||
      item.photo
        ?.toLowerCase()
        .includes(keyword)

    );

  });



  // ---------------------------------------
  // Load GoverningBody
  // ---------------------------------------

  getData(): void {

    this.apiService
      .GetRequest('GoverningBody')
      .subscribe({

        next: (res: any) => {
          this.page.set(1);
          const data = Array.isArray(res)
            ? res
            : [res];

          const datas: GoverningBody[] =
            data.map((item: any) => ({

              id:
                item.id ??
                item.Id ??
                null,

              title:
                item.title ??
                item.Title ??
                '',

              content:
                item.content ??
                item.Content ??
                '',

              photo:
                item.photo ??
                item.Photo ??
                item.image ??
                item.Image ??
                ''
            }));

          this.items.set(datas);
        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load governing Body.'

          );

        }

      });

  }

  // ---------------------------------------
  // Create
  // ---------------------------------------

  create(): void {

    this.selectedItem.set(null);

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Edit
  // ---------------------------------------

  edit(data: GoverningBody): void {

    this.selectedItem.set({

      ...data

    });

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedItem.set(null);

  }

  // ---------------------------------------
  // Save
  // ---------------------------------------

  save(formData: FormData): void {
    const id = formData.get('Id');

    if (id) {
      // Prevent duplicate appending if the child modal already appended 'Id'
      formData.set('Id', id.toString());
      formData.append('UpdatedBy', this.loggedInId());
    } else {
      formData.append('CreatedBy', this.loggedInId());
    }

    const request = id
      ? this.apiService.PutRequest('GoverningBody', formData, true)
      : this.apiService.PostRequest('GoverningBody', formData, true);

    request.subscribe({
      next: (res: any) => {
        if (res?.isSucceeded) {
          this.toastr.success(res.message || 'Operation successful');
          this.getData();
          this.closeModal();
        } else {
          this.toastr.warning(res?.message || 'Warning occurred');
        }
      },
      error: (err) => {
        // Safely access error response text
        const errorMessage = typeof err?.error === 'string'
          ? err.error
          : err?.error?.message || err?.message || 'Something went wrong.';

        this.toastr.error(errorMessage);
      }
    });
  }

  // ---------------------------------------
  // Delete
  // ---------------------------------------

  delete(data: GoverningBody): void {

    Swal.fire({

      title: 'Delete Governing Body?',

      text:
        `Are you sure you want to delete "${data.title}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#dc2626',

      cancelButtonColor: '#6b7280',

      confirmButtonText: 'Yes, Delete',

      cancelButtonText: 'Cancel',

      reverseButtons: true,

      focusCancel: true

    }).then(result => {

      if (!result.isConfirmed) {

        return;

      }
      const formData = new FormData();
      formData.append('Id', data.id ?? '');
      formData.append('Image', data.photo);

      this.apiService

        .DeleteFromFormRequest(
          'GoverningBody',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(res.message);

              this.getData();

            }
            else {

              this.toastr.warning(
                res.message
              );

            }

          },

          error: (err) => {

            this.toastr.error(

              err?.error?.message ||

              'Unable to delete Governing body.'

            );

          }

        });

    });

  }


  // ===================================================
  // VIEW DESCRIPTION
  // ===================================================

  viewDescription(
    item: GoverningBody
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
