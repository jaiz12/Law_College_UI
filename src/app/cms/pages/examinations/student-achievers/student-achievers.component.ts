import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { DescriptionModalComponent } from '../../../shared/description-modal/description-modal.component';
import { LayoutService } from '../../../layout/services/layout.service';
import { finalize } from 'rxjs';
import { StudentAchieversModalComponent } from './student-achievers-modal/student-achievers-modal.component';


export interface StudentAchievers {

  id: string | null;

  name: string;

  content: string;

  photo: string;

}
@Component({
  selector: 'app-student-achievers',
  standalone: true,
  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    StudentAchieversModalComponent,

    DescriptionModalComponent

  ],
  templateUrl: './student-achievers.component.html',
  styleUrl: './student-achievers.component.scss'
})
export class StudentAchieversComponent implements OnInit {


  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService,

    private config: ConfigService,
    private layout: LayoutService

  ) { }

  // ---------------------------------------
  // Signals
  // ---------------------------------------

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  showModal = signal(false);

  selectedStudentAchievers = signal<StudentAchievers | null>(null);

  studentAchievers = signal<StudentAchievers[]>([]);
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
    this.getStudentAchievers();
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

  filteredStudentAchievers = computed(() => {

    const keyword = this.search()
      .trim()
      .toLowerCase();

    if (!keyword) {
      return this.studentAchievers();
    }

    return this.studentAchievers().filter(studentAchiever =>

      studentAchiever.name
        ?.toLowerCase()
        .includes(keyword) ||

      studentAchiever.content
        ?.toLowerCase()
        .includes(keyword) ||
      studentAchiever.photo
        ?.toLowerCase()
        .includes(keyword)

    );

  });



  // ---------------------------------------
  // Load studentAchievers
  // ---------------------------------------

  getStudentAchievers(): void {
    this.layout.showPageLoader();
    this.apiService
      .GetRequest('StudentAchievers').pipe(
        finalize(() => {
          this.layout.hidePageLoader();
        })
      )
      .subscribe({

        next: (res: any) => {
          this.page.set(1);
          const data = Array.isArray(res)
            ? res
            : [res];

          const studentAchievers: StudentAchievers[] =
            data.map((item: any) => ({

              id:
                item.id ??
                item.Id ??
                null,

              name:
                item.name ??
                item.Name ??
                '',

              content:
                item.content ??
                item.Content ??
                '',

              photo:
                item.photo ??
                item.Photo ??
                item.profileImage ??
                item.ProfileImage ??
                ''
            }));

          this.studentAchievers.set(studentAchievers);

          console.log(this.studentAchievers())
        },

        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Student Achievers.'

          );

        }

      });

  }

  // ---------------------------------------
  // Create
  // ---------------------------------------

  createStudentAchievers(): void {

    this.selectedStudentAchievers.set(null);

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Edit
  // ---------------------------------------

  edit(studentAchievers: StudentAchievers): void {

    this.selectedStudentAchievers.set({

      ...studentAchievers

    });

    this.showModal.set(true);

  }

  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedStudentAchievers.set(null);

  }

  // ---------------------------------------
  // Save
  // ---------------------------------------

  saveStudentAchievers(formData: FormData): void {
    const id = formData.get('Id');

    if (id) {
      // Prevent duplicate appending if the child modal already appended 'Id'
      formData.set('Id', id.toString());
      formData.append('UpdatedBy', this.loggedInId());
    } else {
      formData.append('CreatedBy', this.loggedInId());
    }

    const request = id
      ? this.apiService.PutRequest('StudentAchievers', formData, true)
      : this.apiService.PostRequest('StudentAchievers', formData, true);

    request.subscribe({
      next: (res: any) => {
        if (res?.isSucceeded) {
          this.toastr.success(res.message || 'Operation successful');
          this.getStudentAchievers();
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

  delete(infrastructure: StudentAchievers): void {

    Swal.fire({

      title: 'Delete Student Achievers?',

      text:
        `Are you sure you want to delete "${infrastructure.name}"?`,

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
          'StudentAchievers',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(res.message);

              this.getStudentAchievers();

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

              'Unable to delete Student Achievers.'

            );

          }

        });

    });

  }


  // ===================================================
  // VIEW DESCRIPTION
  // ===================================================

  viewDescription(
    item: StudentAchievers
  ): void {

    this.selectedDescriptionTitle.set(

      item.name ?? 'Content'

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
