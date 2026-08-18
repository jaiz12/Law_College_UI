import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ImportantLinkModalComponent } from './important-link-modal/important-link-modal.component';

export interface ImportantLink {

  id: number;

  type: 'internal' | 'external';

  name: string;

  link: string;

}


@Component({

  selector: 'app-important-links',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    ImportantLinkModalComponent

  ],

  templateUrl: './important-links.component.html',

  styleUrl: './important-links.component.scss'

})


export class ImportantLinksComponent implements OnInit {


  constructor(

    private apiService: CmsApiService,

    private toastr: ToastrService

  ) { }


  // ---------------------------------------
  // Signals
  // ---------------------------------------

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  showModal = signal(false);

  selectedLink =
    signal<ImportantLink | null>(null);

  links =
    signal<ImportantLink[]>([]);


  // ---------------------------------------
  // Section Name
  // ---------------------------------------

  SectionName = 'Important Links';


  // ---------------------------------------
  // Logged In User
  // ---------------------------------------

  loggedInId = signal('');


  // ---------------------------------------
  // On Init
  // ---------------------------------------

  ngOnInit(): void {

    this.getLinks();


    const userString =
      localStorage.getItem('user');


    if (userString) {

      const currentUser =
        JSON.parse(userString);


      this.loggedInId.set(
        currentUser.id
      );

    }

  }


  // ---------------------------------------
  // Filter
  // ---------------------------------------

  filteredLinks = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    if (!keyword) {

      return this.links();

    }


    return this.links().filter(link =>

      link.name
        ?.toLowerCase()
        .includes(keyword)

      ||

      link.link
        ?.toLowerCase()
        .includes(keyword)

      ||

      link.type
        ?.toLowerCase()
        .includes(keyword)

    );

  });


  // ---------------------------------------
  // Get Important Links
  // ---------------------------------------

  getLinks(): void {

    this.apiService

      .GetRequest(
        'ContactUs/0/' + this.SectionName
      )

      .subscribe({

        next: (res: any) => {

          console.log(
            'Important Links API Response:',
            res
          );


          const data = Array.isArray(res)
            ? res
            : [res];


          const links: ImportantLink[] =

            data.map((item: any) => ({

              id:
                item.id ??
                item.Id ??
                0,


              type:
                item.type ??
                item.Type ??
                'internal',


              name:
                item.name ??
                item.Name ??
                '',


              link:
                item.link ??
                item.Link ??
                ''

            }));


          this.links.set(links);

        },


        error: (err) => {

          console.error(err);


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load important links.'

          );

        }

      });

  }


  // ---------------------------------------
  // Add
  // ---------------------------------------

  openAddModal(): void {

    this.selectedLink.set(null);

    this.showModal.set(true);

  }


  // ---------------------------------------
  // Edit
  // ---------------------------------------

  editLink(
    link: ImportantLink
  ): void {

    this.selectedLink.set({

      ...link

    });


    this.showModal.set(true);

  }


  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedLink.set(null);

  }


  // ---------------------------------------
  // Save
  // ---------------------------------------

  saveLink(
    link: ImportantLink
  ): void {

    const isEdit =
      link.id > 0;


    const formData =
      new FormData();


    // ---------------------------------------
    // ID
    // ---------------------------------------

    if (isEdit) {

      formData.append(

        'Id',

        link.id.toString()

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


    // ---------------------------------------
    // Section Name
    // ---------------------------------------

    formData.append(

      'SectionName',

      this.SectionName

    );


    // ---------------------------------------
    // Type
    // ---------------------------------------

    formData.append(

      'Type',

      link.type

    );


    // ---------------------------------------
    // Name
    // ---------------------------------------

    formData.append(

      'Name',

      link.name

    );


    // ---------------------------------------
    // Link
    // ---------------------------------------

    formData.append(

      'Link',

      link.link

    );


    console.log(
      'Important Link FormData:',
      formData
    );


    // ---------------------------------------
    // API Request
    // ---------------------------------------

    const request = isEdit

      ? this.apiService.PutRequest(

        'ContactUs',

        formData,

        true

      )

      : this.apiService.PostRequest(

        'ContactUs',

        formData,

        true

      );


    request.subscribe({

      next: (res: any) => {

        console.log(
          'Save Important Link Response:',
          res
        );


        if (res.isSucceeded) {

          this.toastr.success(

            res.message ||

            `Important link ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getLinks();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res.message ||

            'Unable to save important link.'

          );

        }

      },


      error: (err) => {

        console.error(err);


        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong while saving important link.'

        );

      }

    });

  }


  // ---------------------------------------
  // Delete
  // ---------------------------------------

  deleteLink(
    link: ImportantLink
  ): void {

    Swal.fire({

      title:
        'Delete Important Link?',

      text:
        `Are you sure you want to delete "${link.name}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#dc2626',

      cancelButtonColor: '#6b7280',

      confirmButtonText:
        'Yes, Delete',

      cancelButtonText:
        'Cancel',

      reverseButtons: true,

      focusCancel: true

    }).then(result => {


      if (!result.isConfirmed) {

        return;

      }

      const formData =
        new FormData();


      formData.append(

        'Id',

        link.id.toString()

      );

      formData.append(

        'SectionName',

        this.SectionName

      );




      // ---------------------------------------
      // Delete API
      // ---------------------------------------

      this.apiService

        .DeleteFromFormRequest(
          'ContactUs',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            console.log(
              'Delete Important Link Response:',
              res
            );


            if (res.isSucceeded) {

              this.toastr.success(

                res.message ||

                'Important link deleted successfully.'

              );


              this.getLinks();

            }

            else {

              this.toastr.warning(

                res.message ||

                'Unable to delete important link.'

              );

            }

          },


          error: (err) => {

            console.error(err);


            this.toastr.error(

              err?.error?.message ||

              err?.message ||

              'Unable to delete important link.'

            );

          }

        });

    });

  }

}
