import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { InfrastructureModalComponent } from './infrastructure-modal/infrastructure-modal.component';


export interface InfrastructureBody {

  id: string | null;

  title: string;

  content: string;

  photo: string;

}


@Component({

  selector: 'app-infrastructure',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    InfrastructureModalComponent

  ],

  templateUrl: './infrastructure.component.html',

  styleUrl: './infrastructure.component.scss'

})


export class InfrastructureComponent implements OnInit {


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

  selectedInfrastructure = signal<InfrastructureBody | null>(null);

  infrastructures = signal<InfrastructureBody[]>([]);
  imageURL = signal('');

  loggedInId = signal('');

  ngOnInit() {
    this.getInfrastructures();
    this.imageURL.set(this.config.get('IMAGE_API_URL'));

    const userString = localStorage.getItem('user');

    if (userString) {
      const currentUser = JSON.parse(userString);
      this.loggedInId.set(currentUser.id);
    }
  }

  // ---------------------------------------
  // Filter
  // ---------------------------------------

  filteredInfrastructures = computed(() => {

    const keyword = this.search()
      .trim()
      .toLowerCase();

    if (!keyword) {
      return this.infrastructures();
    }

    return this.infrastructures().filter(infrastructure =>

      infrastructure.title
        ?.toLowerCase()
        .includes(keyword) ||

      infrastructure.content
        ?.toLowerCase()
        .includes(keyword) ||
      infrastructure.photo
        ?.toLowerCase()
        .includes(keyword)

    );

  });



  // ---------------------------------------
  // Load Infrastructures
  // ---------------------------------------

  getInfrastructures(): void {

    this.apiService
      .GetRequest('Infrastructure')
      .subscribe({

        next: (res: any) => {

          const data = Array.isArray(res)
            ? res
            : [res];

          const infrastructures: InfrastructureBody[] =
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

          this.infrastructures.set(infrastructures);

          console.log(this.infrastructures())
        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Infrastructures.'

          );

        }

      });

  }

  // ---------------------------------------
  // Create
  // ---------------------------------------

  createInfrastructure(): void {

    this.selectedInfrastructure.set(null);

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Edit
  // ---------------------------------------

  edit(infrastructure : InfrastructureBody): void {

    this.selectedInfrastructure.set({

      ...infrastructure

    });

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedInfrastructure.set(null);

  }

  // ---------------------------------------
  // Save
  // ---------------------------------------

  saveInfrastructure(formData: FormData): void {


    const id = formData.get('Id');

    if (id) {
      formData.append('Id', id.toString());

      formData.append('UpdatedBy', this.loggedInId());

    }
    else {
      formData.append('CreatedBy', this.loggedInId());

    }



    const request = id

      ? this.apiService.PutRequest(
        'Infrastructure',
        formData,
        true
      )

      : this.apiService.PostRequest(
        'Infrastructure',
        formData,
        true
      );

    request.subscribe({

      next: (res: any) => {
        console.log(res)

        if (res.isSucceeded) {

          this.toastr.success(res.message);

          this.getInfrastructures();

          this.closeModal();

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

          err?.message ||

          'Something went wrong.'

        );

      }

    });

  }

  // ---------------------------------------
  // Delete
  // ---------------------------------------

  delete(infrastructure: InfrastructureBody): void {

    Swal.fire({

      title: 'Delete Infrastructures?',

      text:
        `Are you sure you want to delete "${infrastructure.title}"?`,

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
      formData.append('Id', infrastructure.id ?? '');
      formData.append('Image', infrastructure.photo);

      this.apiService

        .DeleteFromFormRequest(
          'Infrastructure',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(res.message);

              this.getInfrastructures();

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

              'Unable to delete infrastructures.'

            );

          }

        });

    });

  }

}
