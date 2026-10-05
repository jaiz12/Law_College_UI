import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { StatutoryBodiesModalComponent } from './statutory-bodies-modal/statutory-bodies-modal.component';
import { DescriptionModalComponent } from '../../../shared/description-modal/description-modal.component';
import { LayoutService } from '../../../layout/services/layout.service';
import { finalize } from 'rxjs';

export interface StatutoryBodiesBody {
  id: number;
  title: string;
  content: string;
}

@Component({
  selector: 'app-statutory-bodies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    StatutoryBodiesModalComponent,
    DescriptionModalComponent
  ],
  templateUrl: './statutory-bodies.component.html',
  styleUrl: './statutory-bodies.component.scss'
})
export class StatutoryBodiesComponent implements OnInit {

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
  selectedStatutoryBodies = signal<StatutoryBodiesBody | null>(null);
  statutoryBodies = signal<StatutoryBodiesBody[]>([]);
  imageURL = signal('');
  loggedInId = signal('');

  private platformId = inject(PLATFORM_ID);

  // =================================================
  // DESCRIPTION MODAL
  // =================================================

  showDescriptionModal =
    signal(false);


  selectedDescription =
    signal('');


  selectedDescriptionTitle =
    signal('');

  ngOnInit() {
    this.getStatutoryBodies();
    this.imageURL.set(this.config.get('IMAGE_API_URL') ?? '');

    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const currentUser = JSON.parse(userString);
          this.loggedInId.set(currentUser.id ?? '');
        } catch (e) {
          console.error('Error parsing user session', e);
        }
      }
    }
  }

  // ---------------------------------------
  // Filter
  // ---------------------------------------
  filteredStatutoryBodies = computed(() => {
    const keyword = this.search().trim().toLowerCase();

    if (!keyword) {
      return this.statutoryBodies();
    }

    return this.statutoryBodies().filter(item =>
      item.title?.toLowerCase().includes(keyword) ||
      item.content?.toLowerCase().includes(keyword) 
    );
  });

  // ---------------------------------------
  // Load Statutory Bodies
  // ---------------------------------------
  getStatutoryBodies(): void {
    this.layout.showPageLoader();
    this.apiService.GetRequest('StatutoryBodies').pipe(
      finalize(() => {
        this.layout.hidePageLoader();
      })
    ).subscribe({
      next: (res: any) => {
        this.page.set(1);
        const data = Array.isArray(res) ? res : [res];

        const statutoryBodiesList: StatutoryBodiesBody[] = data.map((item: any) => ({
          id: item.id ?? item.Id ?? null,
          title: item.title ?? item.Title ?? '',
          content: item.content ?? item.Content ?? '',
          photo: item.photo ?? item.Photo ?? item.image ?? item.Image ?? ''
        }));

        this.statutoryBodies.set(statutoryBodiesList);
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err, 'Unable to load Statutory Bodies.'));
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
  edit(statutoryBody: StatutoryBodiesBody): void {
    this.selectedStatutoryBodies.set({ ...statutoryBody });
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
    console.log(formData.get('Id'))
    // Safe handling: avoid appending duplicate 'Id', set audit metadata safely
    if (id && id.toString().trim() !== '') {
      formData.set('Id', id.toString());
      formData.set('UpdatedBy', this.loggedInId());
    } else {
      formData.delete('Id');
      formData.set('CreatedBy', this.loggedInId());
    }

    const request = id
      ? this.apiService.PutRequest('StatutoryBodies', formData, true)
      : this.apiService.PostRequest('StatutoryBodies', formData, true);

    request.subscribe({
      next: (res: any) => {
        if (res?.isSucceeded) {
          this.toastr.success(res.message || 'Saved successfully.');
          this.getStatutoryBodies();
          this.closeModal();
        } else {
          this.toastr.warning(res?.message || 'Warning occurred during save.');
        }
      },
      error: (err) => {
        this.toastr.error(this.getErrorMessage(err, 'Something went wrong.'));
      }
    });
  }

  // ---------------------------------------
  // Delete
  // ---------------------------------------
  delete(statutoryBody: StatutoryBodiesBody): void {
    Swal.fire({
      title: 'Delete Statutory Body?',
      text: `Are you sure you want to delete "${statutoryBody.title}"?`,
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
          'StatutoryBodies',
          statutoryBody.id.toString()
        )
        .subscribe({
          next: (res: any) => {
            if (res?.isSucceeded) {
              this.toastr.success(res.message || 'Deleted successfully.');
              this.getStatutoryBodies();
            } else {
              this.toastr.warning(res?.message || 'Unable to complete deletion.');
            }
          },
          error: (err) => {
            this.toastr.error(this.getErrorMessage(err, 'Unable to delete Statutory Body.'));
          }
        });
    });
  }

  // Helper method to resolve network/API error strings cleanly
  private getErrorMessage(err: any, fallback: string): string {
    if (typeof err?.error === 'string') return err.error;
    return err?.error?.message || err?.message || fallback;
  }

  // =================================================
  // VIEW DESCRIPTION
  // =================================================

  viewDescription(
    item: StatutoryBodiesBody
  ): void {

    this.selectedDescriptionTitle.set(

      item.title ?? 'Description'

    );


    this.selectedDescription.set(

      item.content ?? ''

    );


    this.showDescriptionModal.set(true);

  }


  // =================================================
  // CLOSE DESCRIPTION
  // =================================================

  closeDescriptionModal(): void {

    this.showDescriptionModal.set(false);

    this.selectedDescription.set('');

    this.selectedDescriptionTitle.set('');

  }
}
