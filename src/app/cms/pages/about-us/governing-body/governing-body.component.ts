import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { GoverningBodyModalComponent } from './governing-body-modal/governing-body-modal.component';
import { ConfigService } from '../../../../services/config.service';

export interface GoverningBody {

  id: string | null;

  name: string;

  description: string;

  photo: string;

}

@Component({
  selector: 'app-governing-body',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    GoverningBodyModalComponent
  ],
  templateUrl: './governing-body.component.html',
  styleUrl: './governing-body.component.scss'
})
export class GoverningBodyComponent implements OnInit {

  constructor(
    private apiService: CmsApiService,
    private toastr: ToastrService,
    private config: ConfigService
  ) {
    
  }

  // ---------------------------------------
  // Signals
  // ---------------------------------------

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  showModal = signal(false);

  selectedMember = signal<GoverningBody | null>(null);

  members = signal<GoverningBody[]>([]);
  pageName: string = "Governing Body";
  imageURL = signal('');

  loggedInId = signal('');

  ngOnInit() {
    this.getMembers();
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

  filteredMembers = computed(() => {

    const keyword = this.search()
      .trim()
      .toLowerCase();

    if (!keyword) {
      return this.members();
    }

    return this.members().filter(member =>

      member.name
        ?.toLowerCase()
        .includes(keyword) ||

      member.description
        ?.toLowerCase()
        .includes(keyword) ||
      member.photo
        ?.toLowerCase()
        .includes(keyword)

    );

  });

 

  // ---------------------------------------
  // Load Members
  // ---------------------------------------

  getMembers(): void {

    this.apiService
      .GetRequest('AboutUs/0/' + this.pageName)
      .subscribe({

        next: (res: any) => {

          const data = Array.isArray(res)
            ? res
            : [res];

          const members: GoverningBody[] =
            data.map((item: any) => ({

              id:
                item.id ??
                item.Id ??
                null,

              name:
                item.name ??
                item.Name ??
                '',

              description:
                item.description ??
                item.Description ??
                '',

              photo:
                item.photo ??
                item.Photo ??
                item.image ??
                item.Image ??
                ''
            }));

          this.members.set(members);

          console.log(this.members())
        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load governing body members.'

          );

        }

      });

  }

  // ---------------------------------------
  // Create
  // ---------------------------------------

  createMember(): void {

    this.selectedMember.set(null);

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Edit
  // ---------------------------------------

  edit(member: GoverningBody): void {

    this.selectedMember.set({

      ...member

    });

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedMember.set(null);

  }

  // ---------------------------------------
  // Save
  // ---------------------------------------

  saveMember(formData: FormData): void {

    const id = formData.get('Id');
    formData.append(

      'PageName',

      this.pageName

    );

    if (id) {
      formData.append('Id', id.toString());

      formData.append('UpdatedBy', this.loggedInId());

    }
    else {
      formData.append('CreatedBy', this.loggedInId());

    }

  

    const request = id

      ? this.apiService.PutRequest(
        'AboutUs',
        formData,
        true
      )

      : this.apiService.PostRequest(
        'AboutUs',
        formData,
        true
      );

    request.subscribe({

      next: (res: any) => {
        console.log(res)

        if (res.isSucceeded) {

          this.toastr.success(res.message);

          this.getMembers();

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

  delete(member: GoverningBody): void {

    Swal.fire({

      title: 'Delete Member?',

      text:
        `Are you sure you want to delete "${member.name}"?`,

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
      console.log(member.id)
      formData.append('Id', member.id ?? '');
      formData.append('PageName', this.pageName);
      formData.append('Image', member.photo);

      this.apiService

        .DeleteFromFormRequest(
          'AboutUs',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded ) {

              this.toastr.success(res.message);

              this.getMembers();

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

              'Unable to delete member.'

            );

          }

        });

    });

  }

}
