import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ProgramAndCurriculumModalComponent } from './program-and-curriculum-modal/program-and-curriculum-modal.component';

export interface ProgramCurriculum {

  id: string | null;

  programName: string;

  programType: string;

  duration: string;

  description: string;

  image: string;

  pdf: string;

  displayOrder: number;

}

@Component({
  selector: 'app-program-and-curriculum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ProgramAndCurriculumModalComponent
  ],
  templateUrl: './program-and-curriculum.component.html',
  styleUrl: './program-and-curriculum.component.scss'
})
export class ProgramAndCurriculumComponent {

  constructor(
    private apiService: CmsApiService,
    private toastr: ToastrService
  ) {

    this.getPrograms();

  }

  //-----------------------------------
  // Signals
  //-----------------------------------

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  showModal = signal(false);

  selectedProgram = signal<ProgramCurriculum | null>(null);

  programs = signal<ProgramCurriculum[]>([]);

  //-----------------------------------
  // Filter
  //-----------------------------------

  filteredPrograms = computed(() => {

    const keyword = this.search().trim().toLowerCase();

    if (!keyword)
      return this.programs();

    return this.programs().filter(x =>

      x.programName.toLowerCase().includes(keyword) ||

      x.programType.toLowerCase().includes(keyword) ||

      x.duration.toLowerCase().includes(keyword)

    );

  });

  //-----------------------------------
  // Get Programs
  //-----------------------------------

  getPrograms() {

    this.apiService
      .GetRequest('ProgramCurriculum/GetAll')
      .subscribe({

        next: (res: any) => {

          const list = res.data?.map((x: any) => ({

            id: String(x.id ?? x.Id),

            programName: x.programName,

            programType: x.programType,

            duration: x.duration,

            description: x.description,

            image: x.image,

            pdf: x.pdf,

            displayOrder: x.displayOrder,

            status: x.status

          })) ?? [];

          this.programs.set(list);

        },

        error: err => {

          this.toastr.error(

            err?.error?.message ||

            'Unable to load programs.'

          );

        }

      });

  }

  //-----------------------------------
  // Create
  //-----------------------------------

  createProgram() {

    this.selectedProgram.set(null);

    this.showModal.set(true);

  }

  //-----------------------------------
  // Edit
  //-----------------------------------

  edit(program: ProgramCurriculum) {

    this.selectedProgram.set({

      ...program

    });

    this.showModal.set(true);

  }

  //-----------------------------------
  // Close
  //-----------------------------------

  closeModal() {

    this.showModal.set(false);

    this.selectedProgram.set(null);

  }

  //-----------------------------------
  // Save
  //-----------------------------------

  saveProgram(formData: FormData) {

    const id = formData.get('Id');

    const request = id

      ? this.apiService.PutRequest(
        'ProgramCurriculum/Update',
        formData
      )

      : this.apiService.PostRequest(
        'ProgramCurriculum/Create',
        formData
      );

    request.subscribe({

      next: (res: any) => {

        if (res.messageType == 'success') {

          this.toastr.success(res.message);

          this.getPrograms();

          this.closeModal();

        }

        else {

          this.toastr.warning(res.message);

        }

      },

      error: err => {

        this.toastr.error(

          err?.error?.message ||

          'Something went wrong.'

        );

      }

    });

  }

  //-----------------------------------
  // Delete
  //-----------------------------------

  delete(program: ProgramCurriculum) {

    Swal.fire({

      title: 'Delete Program?',

      text: `Delete "${program.programName}" ?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Delete',

      cancelButtonText: 'Cancel',

      confirmButtonColor: '#dc2626',

      cancelButtonColor: '#6b7280',

      reverseButtons: true

    }).then(result => {

      if (!result.isConfirmed)
        return;

      this.apiService
        .DeleteRequest(
          'ProgramCurriculum/Delete',
          program.id
        )
        .subscribe({

          next: (res: any) => {

            if (res.messageType == 'success') {

              this.toastr.success(res.message);

              this.getPrograms();

            }

            else {

              this.toastr.warning(res.message);

            }

          },

          error: err => {

            this.toastr.error(

              err?.error?.message ||

              'Unable to delete.'

            );

          }

        });

    });

  }

}
