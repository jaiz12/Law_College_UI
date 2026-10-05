import { CommonModule, isPlatformBrowser } from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';

import Swal from 'sweetalert2';

import { CmsApiService } from '../../../../services/cms-api-service.service';

import { DescriptionModalComponent } from '../../../shared/description-modal/description-modal.component';

import { ResearchAndPublicationsModalComponent } from './research-and-publications-modal/research-and-publications-modal.component';
import { LayoutService } from '../../../layout/services/layout.service';
import { finalize } from 'rxjs';


export interface ResearchAndPublications {

  id: number;

  title: string;

  description: string | null;

  link: string | null;

}
@Component({
  selector: 'app-research-and-publications',
  standalone: true,
  imports: [CommonModule,

    FormsModule,

    NgxPaginationModule,

    ResearchAndPublicationsModalComponent,

    DescriptionModalComponent],
  templateUrl: './research-and-publications.component.html',
  styleUrl: './research-and-publications.component.scss'
})
export class ResearchAndPublicationsComponent implements OnInit {


  // =================================================
  // SERVICES
  // =================================================

  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService,
    private layout: LayoutService

  ) { }


  // =================================================
  // PLATFORM
  // =================================================

  private platformId =
    inject(PLATFORM_ID);


  // =================================================
  // SEARCH / PAGINATION
  // =================================================

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [
    5,
    10,
    20,
    50
  ];


  // =================================================
  // DATA
  // =================================================

  researchAndPublications =
    signal<ResearchAndPublications[]>([]);


  // =================================================
  // MODAL
  // =================================================

  showModal =
    signal(false);


  selectedResearchAndPublications =
    signal<ResearchAndPublications | null>(null);


  // =================================================
  // DESCRIPTION MODAL
  // =================================================

  showDescriptionModal =
    signal(false);


  selectedDescription =
    signal('');


  selectedDescriptionTitle =
    signal('');


  // =================================================
  // LOGGED-IN USER
  // =================================================

  loggedInId =
    signal('');


  // =================================================
  // FILTERED DATA
  // =================================================

  filteredResearchAndPublications =
    computed(() => {

      const keyword =
        this.search()
          .trim()
          .toLowerCase();


      if (!keyword) {

        return this.researchAndPublications();

      }


      return this.researchAndPublications()
        .filter(item =>

          item.title
            ?.toLowerCase()
            .includes(keyword)

          ||

          item.description
            ?.toLowerCase()
            .includes(keyword)

          ||

          item.link
            ?.toLowerCase()
            .includes(keyword)

        );

    });


  // =================================================
  // INIT
  // =================================================

  ngOnInit(): void {

    this.getResearchAndPublications();


    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      const userString =
        localStorage.getItem('user');


      if (userString) {

        try {

          const currentUser =
            JSON.parse(userString);


          this.loggedInId.set(
            currentUser.id ?? ''
          );

        }
        catch (error) {

          console.error(
            'Unable to parse logged-in user.',
            error
          );

        }

      }

    }

  }


  // =================================================
  // CREATE
  // =================================================

  createResearchAndPublications(): void {

    this.selectedResearchAndPublications
      .set(null);


    this.showModal.set(true);

  }


  // =================================================
  // EDIT
  // =================================================

  edit(
    item: ResearchAndPublications
  ): void {

    this.selectedResearchAndPublications.set({

      ...item

    });


    this.showModal.set(true);

  }


  // =================================================
  // CLOSE MODAL
  // =================================================

  closeModal(): void {

    this.showModal.set(false);

    this.selectedResearchAndPublications
      .set(null);

  }


  // =================================================
  // GET
  // =================================================

  getResearchAndPublications(): void {
    this.layout.showPageLoader();
    this.apiService

      .GetRequest(
        'ResearchAndPublications'
    ).pipe(
      finalize(() => {
        this.layout.hidePageLoader();
      })
    )

      .subscribe({

        next: (res: any) => {

          this.page.set(1);


          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const result:
            ResearchAndPublications[] =

            data.map(
              (item: any) => ({

                id:
                  item.id ??
                  item.Id ??
                  0,


                title:
                  item.title ??
                  item.Title ??
                  '',


                description:
                  item.description ??
                  item.Description ??
                  '',


                link:
                  item.link ??
                  item.Link ??
                  ''

              })
            );


          this.researchAndPublications
            .set(result);

        },


        error: (err) => {

          console.error(
            'Research & Publications Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Research & Publications.'

          );

        }

      });

  }


  // =================================================
  // SAVE
  // =================================================

  saveResearchAndPublications(
    item: ResearchAndPublications
  ): void {

    const isEdit =
      !!item.id;


    const formData =
      new FormData();


    // =================================================
    // ID
    // =================================================

    if (isEdit) {

      formData.append(

        'Id',

        item.id.toString()

      );

    }


    // =================================================
    // TITLE
    // =================================================

    formData.append(

      'Title',

      item.title?.trim() ?? ''

    );


    // =================================================
    // DESCRIPTION
    // =================================================

    formData.append(

      'Description',

      item.description ?? ''

    );


    // =================================================
    // LINK
    // =================================================

    formData.append(

      'Link',

      item.link?.trim() ?? ''

    );


    // =================================================
    // USER
    // =================================================

    if (isEdit) {

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


    // =================================================
    // API
    // =================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(

          'ResearchAndPublications',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'ResearchAndPublications',

          formData,

          true

        );


    request.subscribe({

      next: (res: any) => {

        if (
          res?.isSucceeded
        ) {

          this.toastr.success(

            res.message ||

            `Research & Publication ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getResearchAndPublications();

          this.closeModal();

        }
        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save Research & Publication.'

          );

        }

      },


      error: (err) => {

        console.error(
          'Save Research & Publication Error:',
          err
        );


        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong while saving.'

        );

      }

    });

  }


  // =================================================
  // DELETE
  // =================================================

  delete(
    item: ResearchAndPublications
  ): void {

    Swal.fire({

      title:
        'Delete Research & Publication?',

      text:
        `Are you sure you want to delete "${item.title}"?`,

      icon:
        'warning',

      showCancelButton:
        true,

      confirmButtonColor:
        '#dc2626',

      cancelButtonColor:
        '#6b7280',

      confirmButtonText:
        'Yes, Delete',

      cancelButtonText:
        'Cancel',

      reverseButtons:
        true,

      focusCancel:
        true

    })

      .then(result => {

        if (
          !result.isConfirmed
        ) {

          return;

        }        


        this.apiService          
          .DeleteRequest(
            'ResearchAndPublications',
            item.id.toString()
          )

          .subscribe({

            next: (res: any) => {

              if (
                res?.isSucceeded
              ) {

                this.toastr.success(

                  res.message ||

                  'Research & Publication deleted successfully.'

                );


                this.getResearchAndPublications();

              }
              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete Research & Publication.'

                );

              }

            },


            error: (err) => {

              console.error(

                'Delete Research & Publication Error:',

                err

              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete Research & Publication.'

              );

            }

          });

      });

  }


  // =================================================
  // VIEW DESCRIPTION
  // =================================================

  viewDescription(
    item: ResearchAndPublications
  ): void {

    this.selectedDescriptionTitle.set(

      item.title ?? 'Description'

    );


    this.selectedDescription.set(

      item.description ?? ''

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
