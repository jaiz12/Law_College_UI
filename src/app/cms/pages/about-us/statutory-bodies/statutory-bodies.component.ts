import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { StatutoryBodiesModalComponent } from './statutory-bodies-modal/statutory-bodies-modal.component';


export interface StatutoryBodiesBody {

  id: string | null;

  title: string;

  content: string;

  photo: string;

}

@Component({
  selector: 'app-statutory-bodies',
  standalone: true,
  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    StatutoryBodiesModalComponent

  ],
  templateUrl: './statutory-bodies.component.html',
  styleUrl: './statutory-bodies.component.scss'
})
export class StatutoryBodiesComponent implements OnInit {


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

  selectedStatutoryBodies = signal<StatutoryBodiesBody | null>(null);

  StatutoryBodies = signal<StatutoryBodiesBody[]>([]);
  imageURL = signal('');

  loggedInId = signal('');

  ngOnInit() {
    this.getStatutoryBodies();
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

  filteredStatutoryBodies = computed(() => {

    const keyword = this.search()
      .trim()
      .toLowerCase();

    if (!keyword) {
      return this.StatutoryBodies();
    }

    return this.StatutoryBodies().filter(StatutoryBodies =>

      StatutoryBodies.title
        ?.toLowerCase()
        .includes(keyword) ||

      StatutoryBodies.content
        ?.toLowerCase()
        .includes(keyword) ||
      StatutoryBodies.photo
        ?.toLowerCase()
        .includes(keyword)

    );

  });



  // ---------------------------------------
  // Load StatutoryBodies
  // ---------------------------------------

  getStatutoryBodies(): void {

    this.apiService
      .GetRequest('StatutoryBodies')
      .subscribe({

        next: (res: any) => {

          const data = Array.isArray(res)
            ? res
            : [res];

          const StatutoryBodies: StatutoryBodiesBody[] =
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

          this.StatutoryBodies.set(StatutoryBodies);

          console.log(this.StatutoryBodies())
        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Statutory Bodies.'

          );

        }

      });

  }

  // ---------------------------------------
  // Create
  // ---------------------------------------

  createStatutoryBodies(): void {

    this.selectedStatutoryBodies.set(null);

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Edit
  // ---------------------------------------

  edit(StatutoryBodies: StatutoryBodiesBody): void {

    this.selectedStatutoryBodies.set({

      ...StatutoryBodies

    });

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedStatutoryBodies.set(null);

  }

  // ---------------------------------------
  // Save
  // ---------------------------------------

  saveStatutoryBodies(formData: FormData): void {



    const id = formData.get('Id');

    if (id) {
      formData.append('Id', id.toString());

      formData.append('UpdatedBy', this.loggedInId());

    }
    else {
      formData.append('CreatedBy', this.loggedInId());

    }

    const data: any = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log("formData", data);

    const request = id

      ? this.apiService.PutRequest(
        'StatutoryBodies',
        formData,
        true
      )

      : this.apiService.PostRequest(
        'StatutoryBodies',
        formData,
        true
      );

    request.subscribe({

      next: (res: any) => {
        console.log(res)

        if (res.isSucceeded) {

          this.toastr.success(res.message);

          this.getStatutoryBodies();

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

  delete(StatutoryBodies: StatutoryBodiesBody): void {

    Swal.fire({

      title: 'Delete Statutory Body?',

      text:
        `Are you sure you want to delete "${StatutoryBodies.title}"?`,

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
      formData.append('Id', StatutoryBodies.id ?? '');
      formData.append('Image', StatutoryBodies.photo);

      this.apiService

        .DeleteFromFormRequest(
          'StatutoryBodies',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(res.message);

              this.getStatutoryBodies();

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

              'Unable to delete Statutory Body.'

            );

          }

        });

    });

  }

}
