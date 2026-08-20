import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { SocialMediaModalComponent } from './social-media-modal/social-media-modal.component';

export interface SocialMedia {
  id: number;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-social-media',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    SocialMediaModalComponent
  ],

  templateUrl: './social-media.component.html',

  styleUrl: './social-media.component.scss'
})
export class SocialMediaComponent implements OnInit {

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

  selectedSocialMedia =
    signal<SocialMedia | null>(null);

  socialMedia =
    signal<SocialMedia[]>([]);

  SectionName = 'Social Media';

  loggedInId = signal('');


  // ---------------------------------------
  // On Init
  // ---------------------------------------

  ngOnInit(): void {

    this.getSocialMedia();


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

  filteredSocialMedia = computed(() => {

    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    if (!keyword) {

      return this.socialMedia();

    }


    return this.socialMedia().filter(item =>

      item.icon
        ?.toLowerCase()
        .includes(keyword)

      ||

      item.link
        ?.toLowerCase()
        .includes(keyword)

    );

  });


  // ---------------------------------------
  // Get Social Media
  // ---------------------------------------

  getSocialMedia(): void {

    this.apiService

      .GetRequest(
        'HeaderAndFooter/0/' + this.SectionName
      )

      .subscribe({

        next: (res: any) => {

          console.log(
            'Social Media API Response:',
            res
          );


          const data = Array.isArray(res)
            ? res
            : [res];


          const socialMedia:
            SocialMedia[] =

            data.map((item: any) => ({

              id:
                item.id ??
                item.Id ??
                0,

              icon:
                item.icon ??
                item.Icon ??
                '',

              link:
                item.link ??
                item.Link ??
                '',

              sectionName:
                item.sectionName ??
                item.SectionName ??
                this.SectionName

            }));


          this.socialMedia.set(
            socialMedia
          );

        },


        error: (err) => {

          console.error(err);


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load social media details.'

          );

        }

      });

  }


  // ---------------------------------------
  // Add
  // ---------------------------------------

  openAddModal(): void {

    this.selectedSocialMedia.set(null);

    this.showModal.set(true);

  }


  // ---------------------------------------
  // Edit
  // ---------------------------------------

  editSocialMedia(
    item: SocialMedia
  ): void {

    this.selectedSocialMedia.set({

      ...item

    });

    this.showModal.set(true);

  }


  // ---------------------------------------
  // Close
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedSocialMedia.set(null);

  }


  // ---------------------------------------
  // Save
  // ---------------------------------------

  saveSocialMedia(
    socialMedia: SocialMedia
  ): void {

    const isEdit =
      socialMedia.id > 0;


    const formData =
      new FormData();


    // ---------------------------------------
    // ID / User
    // ---------------------------------------

    if (isEdit) {

      formData.append(
        'Id',
        socialMedia.id.toString()
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
    // Icon
    // ---------------------------------------

    formData.append(
      'Icon',
      socialMedia.icon
    );


    // ---------------------------------------
    // Link
    // ---------------------------------------

    formData.append(
      'Link',
      socialMedia.link
    );


    // ---------------------------------------
    // API Request
    // ---------------------------------------

    const request =

      isEdit

        ? this.apiService.PutRequest(
          'HeaderAndFooter',
          formData,
          true
        )

        : this.apiService.PostRequest(
          'HeaderAndFooter',
          formData,
          true
        );


    request.subscribe({

      next: (res: any) => {

        console.log(
          'Social Media Save Response:',
          res
        );


        if (res.isSucceeded) {

          this.toastr.success(

            res.message ||

            `Social media ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getSocialMedia();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res.message ||

            'Unable to save social media.'

          );

        }

      },


      error: (err) => {

        console.error(err);


        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong while saving social media.'

        );

      }

    });

  }


  // ---------------------------------------
  // Delete
  // ---------------------------------------

  deleteSocialMedia(
    item: SocialMedia
  ): void {

    Swal.fire({

      title:
        'Delete Social Media?',

      text:
        `Are you sure you want to delete this social media link?`,

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

    }).then(result => {

      if (!result.isConfirmed) {

        return;

      }

      const formData =
        new FormData();


      formData.append(

        'Id',

        item.id.toString()

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
          'HeaderAndFooter',
          formData,
          true
        )

        .subscribe({

          next: (res: any) => {

            console.log(
              'Delete Social Media Response:',
              res
            );


            if (res.isSucceeded) {

              this.toastr.success(

                res.message ||

                'Social media deleted successfully.'

              );


              this.getSocialMedia();

            }

            else {

              this.toastr.warning(

                res.message ||

                'Unable to delete social media.'

              );

            }

          },


          error: (err) => {

            console.error(err);


            this.toastr.error(

              err?.error?.message ||

              err?.message ||

              'Unable to delete social media.'

            );

          }

        });

    });

  }

}
