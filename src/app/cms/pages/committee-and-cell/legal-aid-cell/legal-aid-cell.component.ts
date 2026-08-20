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
import { LegalAidCellModalComponent } from './legal-aid-cell-modal/legal-aid-cell-modal.component';

export interface LegalAidCell {

  id: number;

  title: string;

  externalLink: string | null;

}
@Component({
  selector: 'app-legal-aid-cell',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    NgxPaginationModule,
    LegalAidCellModalComponent],
  templateUrl: './legal-aid-cell.component.html',
  styleUrl: './legal-aid-cell.component.scss'
})
export class LegalAidCellComponent implements OnInit {

  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService

  ) { }


  // -------------------------------------------------
  // Signals
  // -------------------------------------------------

  search = signal('');

  showModal = signal(false);

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  loggedInId = signal('');

  legalAidCells =
    signal<LegalAidCell[]>([]);

  selectedLegalAidCell =
    signal<LegalAidCell | null>(null);


  // -------------------------------------------------
  // Init
  // -------------------------------------------------

  ngOnInit(): void {

    this.getLegalAidCells();


    const user =
      localStorage.getItem('user');

    if (user) {

      this.loggedInId.set(

        JSON.parse(user).id

      );

    }

  }


  // -------------------------------------------------
  // Filter
  // -------------------------------------------------

  filteredLegalAidCells = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();

    if (!keyword) {

      return this.legalAidCells();

    }

    return this.legalAidCells().filter(item =>

      item.title
        .toLowerCase()
        .includes(keyword)

      ||

      (item.externalLink ?? '')
        .toLowerCase()
        .includes(keyword)

    );

  });


  // -------------------------------------------------
  // GET
  // -------------------------------------------------

  getLegalAidCells(): void {

    this.apiService

      .GetRequest('LegalAidCell')

      .subscribe({

        next: (res: any) => {

          console.log(res);

          const data =
            Array.isArray(res)

              ? res

              : res.data || [];


          const list: LegalAidCell[] =

            data.map((item: any) => ({

              id:

                item.id ??

                item.Id ??

                0,

              title:

                item.title ??

                item.Title ??

                '',

              externalLink:

                item.externalLink ??

                item.ExternalLink ??

                ''

            }));


          this.legalAidCells.set(list);

        },

        error: (err) => {

          console.error(err);

          this.toastr.error(

            err?.error?.message ||

            'Unable to load Legal Aid Cell records.'

          );

        }

      });

  }


  // -------------------------------------------------
  // ADD
  // -------------------------------------------------

  addLegalAidCell(): void {

    this.selectedLegalAidCell.set(null);

    this.showModal.set(true);

  }


  // -------------------------------------------------
  // EDIT
  // -------------------------------------------------

  editLegalAidCell(
    legalAidCell: LegalAidCell
  ): void {

    this.selectedLegalAidCell.set({

      ...legalAidCell

    });

    this.showModal.set(true);

  }


  // -------------------------------------------------
  // CLOSE MODAL
  // -------------------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedLegalAidCell.set(null);

  }


  // -------------------------------------------------
  // SAVE
  // -------------------------------------------------

  saveLegalAidCell(
    legalAidCell: LegalAidCell
  ): void {

    const isEdit =
      legalAidCell.id > 0;


    const formData =
      new FormData();


    if (isEdit) {

      formData.append(

        'Id',

        legalAidCell.id.toString()

      );

      formData.append(

        'UpdatedBy',

        this.loggedInId()

      );

    }

    else {

      formData.append(

        'CreatedBy',

        this.loggedInId()

      );

    }


    formData.append(

      'Title',

      legalAidCell.title

    );


    formData.append(

      'ExternalLink',

      legalAidCell.externalLink ?? ''

    );


    const request =

      isEdit

        ? this.apiService.PutRequest(

          'LegalAidCell',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'LegalAidCell',

          formData,

          true

        );


    request.subscribe({

      next: (res: any) => {

        if (res.isSucceeded) {

          this.toastr.success(

            res.message ||

            `Legal Aid Cell ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getLegalAidCells();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res.message ||

            'Unable to save Legal Aid Cell record.'

          );

        }

      },

      error: (err) => {

        console.error(err);

        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong while saving the Legal Aid Cell record.'

        );

      }

    });

  }


  // -------------------------------------------------
  // DELETE
  // -------------------------------------------------

  deleteLegalAidCell(
    legalAidCell: LegalAidCell
  ): void {

    Swal.fire({

      title: 'Delete Legal Aid Cell?',

      text:
        `Are you sure you want to delete "${legalAidCell.title}"?`,

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



      this.apiService

        .DeleteRequest(

          'LegalAidCell',

          legalAidCell.id.toString()
        )

        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(

                res.message ||

                'Legal Aid Cell deleted successfully.'

              );

              this.getLegalAidCells();

            }

            else {

              this.toastr.warning(

                res.message ||

                'Unable to delete Legal Aid Cell.'

              );

            }

          },

          error: (err) => {

            console.error(err);

            this.toastr.error(

              err?.error?.message ||

              err?.message ||

              'Unable to delete Legal Aid Cell.'

            );

          }

        });

    });

  }

}
