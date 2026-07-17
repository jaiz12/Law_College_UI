import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { GoverningBodyModalComponent } from './governing-body-modal/governing-body-modal.component';

export interface GoverningBody {

  id: string | null;

  name: string;

  description: string;

  image: string;

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
export class GoverningBodyComponent {

  constructor(
    private apiService: CmsApiService,
    private toastr: ToastrService
  ) {
    this.getMembers();
  }

  //---------------------------------------
  // Signals
  //---------------------------------------

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  showModal = signal(false);

  selectedMember = signal<GoverningBody | null>(null);

  members = signal<GoverningBody[]>([]);

  //---------------------------------------
  // Filter
  //---------------------------------------

  filteredMembers = computed(() => {

    const keyword = this.search().trim().toLowerCase();

    if (!keyword) {
      return this.members();
    }

    return this.members().filter(x =>

      x.name.toLowerCase().includes(keyword) ||

      x.description.toLowerCase().includes(keyword)

    );

  });

  //---------------------------------------
  // Load Members
  //---------------------------------------

  getMembers() {

    this.apiService
      .GetRequest('GoverningBody/GetAll')
      .subscribe({

        next: (res: any) => {

          const list = res.data?.map((x: any) => ({

            id: String(x.id ?? x.Id),

            name: x.name ?? x.Name,

            description: x.description ?? x.Description,

            image: x.image ?? x.Image

          })) ?? [];

          this.members.set(list);

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

  //---------------------------------------
  // Create
  //---------------------------------------

  createMember() {

    this.selectedMember.set(null);

    this.showModal.set(true);

  }

  //---------------------------------------
  // Edit
  //---------------------------------------

  edit(member: GoverningBody) {

    this.selectedMember.set({

      ...member

    });

    this.showModal.set(true);

  }

  //---------------------------------------
  // Close Modal
  //---------------------------------------

  closeModal() {

    this.showModal.set(false);

    this.selectedMember.set(null);

  }

  //---------------------------------------
  // Save
  //---------------------------------------

  saveMember(formData: FormData) {

    const id = formData.get('Id');

    const request = id

      ? this.apiService.PutRequest(
        'GoverningBody/Update',
        formData
      )

      : this.apiService.PostRequest(
        'GoverningBody/Create',
        formData
      );

    request.subscribe({

      next: (res: any) => {

        if (res.messageType === 'success') {

          this.toastr.success(res.message);

          this.getMembers();

          this.closeModal();

        }

        else {

          this.toastr.warning(res.message);

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

  //---------------------------------------
  // Delete
  //---------------------------------------

  delete(member: GoverningBody) {

    Swal.fire({

      title: 'Delete Member?',

      text: `Are you sure you want to delete "${member.name}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#dc2626',

      cancelButtonColor: '#6b7280',

      confirmButtonText: 'Yes, Delete',

      cancelButtonText: 'Cancel',

      reverseButtons: true,

      focusCancel: true

    }).then(result => {

      if (!result.isConfirmed) return;

      this.apiService
        .DeleteRequest(
          'GoverningBody/Delete',
          member.id
        )
        .subscribe({

          next: (res: any) => {

            if (res.messageType === 'success') {

              this.toastr.success(res.message);

              this.getMembers();

            }

            else {

              this.toastr.warning(res.message);

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
