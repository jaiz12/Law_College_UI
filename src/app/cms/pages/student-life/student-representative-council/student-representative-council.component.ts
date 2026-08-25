import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { ViewStructureComponent } from '../../../shared/view-structure/view-structure.component';
import { StudentRepresentativeCouncilModalComponent } from './student-representative-council-modal/student-representative-council-modal.component';

export interface StudentRepresentativeCouncil {

  id: number;

  name: string;

  designation: string;

  photo: string | null;

  photoFile: File | null;

}
@Component({
  selector: 'app-student-representative-council',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    NgxPaginationModule,
    StudentRepresentativeCouncilModalComponent,
    ViewStructureComponent],
  templateUrl: './student-representative-council.component.html',
  styleUrl: './student-representative-council.component.scss'
})
export class StudentRepresentativeCouncilComponent implements OnInit {

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

  showModal = signal(false);
  showViewModal = signal(false);
  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  selectedMember =
    signal<StudentRepresentativeCouncil | null>(null);

  members = signal<StudentRepresentativeCouncil[]>([]);

  imageURL = signal('');

  loggedInId = signal('');

  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.getMembers();
    this.imageURL.set(this.config.get('IMAGE_API_URL'));
    console.log(this.imageURL())
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

  filteredMembers = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();

    if (!keyword) {

      return this.members();

    }

    return this.members().filter(member =>

      member.name
        .toLowerCase()
        .includes(keyword)

      ||

      member.designation
        .toLowerCase()
        .includes(keyword)

    );

  });

  viewStructure(): void {
    this.showViewModal.set(true);
  }

  closeViewStructureModal(): void {
    this.showViewModal.set(false);
  }


  // ---------------------------------------
  // Add Member
  // ---------------------------------------

  addMember(): void {

    this.selectedMember.set(null);

    this.showModal.set(true);

  }


  // ---------------------------------------
  // Edit Member
  // ---------------------------------------

  editMember(
    member: StudentRepresentativeCouncil
  ): void {

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
  // Save Member
  // ---------------------------------------

  getMembers(): void {

    this.apiService

      .GetRequest('AdministrativeStaff')

      .subscribe({

        next: (res: any) => {
          console.log(res)

          const data = Array.isArray(res)

            ? res

            : res.data || [];
          const members: StudentRepresentativeCouncil[] = data.map((item: any) => ({

            id:
              item.id ??
              item.Id ??
              0,

            name:
              item.name ??
              item.Name ??
              '',

            designation:
              item.designation ??
              item.Designation ??
              '',

            photo:
              item.photo ??
              item.Photo ??
              item.profilePhoto ??
              item.ProfilePhoto ??
              null,

            // Only used when selecting a new image in the browser
            photoFile: null,

          }));

          this.members.set(members);

        },


        error: (err) => {

          this.toastr.error(

            err?.error?.message ||

            'Unable to load organization structure.'

          );

        }

      });

  }

  // ---------------------------------------
  // Save Member
  // ---------------------------------------

  saveMember(member: StudentRepresentativeCouncil): void {

    const isEdit = member.id > 0;

    const formData = new FormData();
    console.log(isEdit)

    if (isEdit) {

      formData.append(
        'Id',
        member.id.toString()
      );
      formData.append('UpdatedBy', this.loggedInId());

    }
    else {
      formData.append('CreatedBy', this.loggedInId());
    }

    formData.append(
      'Name',
      member.name
    );

    formData.append(
      'Designation',
      member.designation
    );


    // IMPORTANT: Send actual file
    if (member.photoFile) {

      formData.append(
        'Photo',
        member.photoFile,
        member.photoFile.name
      );

    }

    const request = isEdit

      ? this.apiService.PutRequest(
        'AdministrativeStaff',
        formData,
        true
      )

      : this.apiService.PostRequest(
        'AdministrativeStaff',
        formData,
        true
      );

    request.subscribe({

      next: (res: any) => {

        if (res.isSucceeded) {

          this.toastr.success(

            res.message ||

            `Organization member ${isEdit ? 'updated' : 'created'
            } successfully.`

          );

          this.getMembers();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res.message ||

            'Unable to save organization member.'

          );

        }

      },

      error: (err) => {

        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong while saving the organization member.'

        );

      }

    });

  }

  // ---------------------------------------
  // Delete Member
  // ---------------------------------------

  deleteMember(member: StudentRepresentativeCouncil): void {

    Swal.fire({

      title: 'Delete Member?',

      text: `Are you sure you want to delete "${member.name}"?`,

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

      const formData = new FormData();

      formData.append(
        'Id',
        member.id.toString()
      );

      formData.append(
        'ProfilePhoto',
        member.photo ?? ''
      );

      this.apiService

        .DeleteFromFormRequest(
          'AdministrativeStaff',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(
                res.message || 'Member deleted successfully.'
              );

              this.getMembers();

            } else {

              this.toastr.warning(
                res.message || 'Unable to delete member.'
              );

            }

          },

          error: (err) => {

            this.toastr.error(

              err?.error?.message ||

              err?.message ||

              'Unable to delete member.'

            );

          }

        });

    });

  }


  // ---------------------------------------
  // Get Parent Name
  // ---------------------------------------

  getParentName(
    parentId: number | null
  ): string {

    if (!parentId) {

      return 'Top Level';

    }

    return this.members()

      .find(x =>

        x.id === parentId

      )

      ?.name

      ??

      'Unknown';

  }


}
