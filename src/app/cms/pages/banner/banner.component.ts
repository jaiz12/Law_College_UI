import { CommonModule, isPlatformBrowser } from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  signal, inject, PLATFORM_ID
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';

import Swal from 'sweetalert2';
import { BannerModalComponent } from './banner-modal/banner-modal.component';
import { CmsApiService } from '../../../services/cms-api-service.service';
import { ConfigService } from '../../../services/config.service';
import { DescriptionModalComponent } from '../../shared/description-modal/description-modal.component';


// =====================================================
// INTERFACE
// =====================================================

export interface Banner {
  id: number;
  pageName: string;
  content: string | null;

  // Existing image path from database
  image: string | null;

  // Newly selected image file
  imagePath?: File | null;
}

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [
    CommonModule,

    FormsModule,

    NgxPaginationModule,

    BannerModalComponent,

    DescriptionModalComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent
  implements OnInit {


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private apiService:
      CmsApiService,

    private toastr:
      ToastrService,
    private config: ConfigService

  ) { }


  // ===================================================
  // SIGNALS
  // ===================================================

  search =
    signal('');

  page =
    signal(1);

  itemsPerPage =
    signal(5);

  pageSizeOptions =
    [5, 10, 20, 50];

  showModal =
    signal(false);

  selectedBanner =
    signal<Banner | null>(null);

  banner =
    signal<Banner[]>([]);

  loggedInId =
    signal('');

  imageURL = signal('');

  showDescriptionModal = signal(false);

  selectedDescription = signal('');

  selectedDescriptionTitle = signal('');
  private platformId = inject(PLATFORM_ID);
  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.getBanner();

    this.imageURL.set(this.config.get('IMAGE_API_URL'));

    if (isPlatformBrowser(this.platformId)) {
      const userString =
        localStorage.getItem('user');


      if (userString) {

        const currentUser =
          JSON.parse(userString);

        this.loggedInId.set(
          currentUser.id ?? ''
        );

      }
    }

  }


  // ===================================================
  // FILTER
  // ===================================================

  filteredBanners =
    computed(() => {

      const keyword =
        this.search()
          .trim()
          .toLowerCase();


      if (!keyword) {

        return this.banner();

      }


      return this.banner().filter(
        banner =>

          banner.pageName
            ?.toLowerCase()
            .includes(keyword)

          ||

          banner.content
            ?.toLowerCase()
            .includes(keyword)

      );

    });


  // ===================================================
  // CREATE
  // ===================================================

  createBanner(): void {

    this.selectedBanner.set(
      null
    );

    this.showModal.set(
      true
    );

  }


  // ===================================================
  // EDIT
  // ===================================================

  edit(
    calendar: Banner
  ): void {

    this.selectedBanner.set({

      ...calendar,

      imagePath:
        null

    });

    this.showModal.set(
      true
    );

  }


  // ===================================================
  // CLOSE MODAL
  // ===================================================

  closeModal(): void {

    this.showModal.set(
      false
    );

    this.selectedBanner.set(
      null
    );

  }


  // ===================================================
  // GET
  // ===================================================

  getBanner(): void {

    this.apiService

      .GetRequest(
        'Banner'
      )

      .subscribe({

        next: (res: any) => {
          this.page.set(1);
          const data =
            Array.isArray(res)
              ? res
              : res?.data || [];


          const banner:
            Banner[] =

            data.map(
              (item: any) => ({

                id:
                  item.id ??
                  item.Id ??
                  0,

                pageName:
                  item.pageName ??
                  item.PageName ??
                  '',

                content:
                  item.content ??
                  item.Content ??
                  null,

                image:
                  item.image ??
                  item.Iamge ??
                  item.imagePath ??
                  item.ImagePath ??
                  null,

                imagePath:
                  null,

              })
            );


          this.banner.set(
            banner
          );

        },

        error: (err) => {

          console.error(
            'Banner Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load Banner.'

          );

        }

      });

  }


  // ===================================================
  // SAVE
  // ===================================================

  saveBanner(
    banner: Banner
  ): void {


    // =================================================
    // DETERMINE CREATE / EDIT
    // =================================================

    const isEdit =
      !!banner.id;
      console.log(isEdit, banner.id)

    // =================================================
    // FORM DATA
    // =================================================

    const formData =
      new FormData();


    // =================================================
    // ID
    // =================================================

    if (isEdit) {

      formData.append(

        'Id',

        banner.id.toString()

      );

    }


    // =================================================
    // PageName
    // =================================================

    formData.append(

      'PageName',

      banner.pageName?.trim() ?? ''

    );


    // =================================================
    // CONTENT
    // =================================================

    formData.append(

      'Content',

      banner.content ?? ''

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
    // FILE
    // =================================================

    /*
     * Only send a file when the user selected
     * a NEW file.
     *
     * During edit, if no new file is selected,
     * the backend should keep the existing FilePath.
     */

    if (banner.imagePath) {

      formData.append(

        'Image',

        banner.imagePath,

        banner.imagePath.name

      );

    }


    // =================================================
    // API REQUEST
    // =================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(

          'Banner',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'Banner',

          formData,

          true

        );


    // =================================================
    // RESPONSE
    // =================================================

    request.subscribe({

      next: (res: any) => {

        if (
          res?.isSucceeded
        ) {

          this.toastr.success(

            res.message ||

            `Banner ${isEdit
              ? 'updated'
              : 'created'
            } successfully.`

          );


          this.getBanner();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            'Unable to save Banner.'

          );

        }

      },

      error: (err) => {

        console.error(

          'Save Banner Error:',

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


  // ===================================================
  // DELETE
  // ===================================================

  delete(
    banner: Banner
  ): void {

    Swal.fire({

      title:
        'Delete Banner?',

      text:
        `Are you sure you want to delete "${banner.pageName}"?`,

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


        // =================================================
        // FORM DATA
        // =================================================

        const formData =
          new FormData();


        formData.append(

          'Id',

          banner.id.toString()

        );


        /*
         * Existing file path.
         *
         * Your backend can use this to physically
         * delete the file if required.
         */

        if (
          banner.image
        ) {

          formData.append(

            'Image',

            banner.image

          );

        }


        // =================================================
        // API
        // =================================================

        this.apiService

          .DeleteFromFormRequest(

            'Banner',

            formData,

            true

          )

          .subscribe({

            next: (res: any) => {

              if (
                res?.isSucceeded
              ) {

                this.toastr.success(

                  res.message ||

                  'Banner deleted successfully.'

                );


                this.getBanner();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete Banner.'

                );

              }

            },

            error: (err) => {

              console.error(

                'Delete Banner Error:',

                err

              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete Banner.'

              );

            }

          });

      });

  }

  viewDescription(item: Banner): void {

    this.selectedDescriptionTitle.set(
      item.pageName ?? 'Content'
    );

    this.selectedDescription.set(
      item.content ?? ''
    );

    this.showDescriptionModal.set(true);
  }

  closeDescriptionModal(): void {

    this.showDescriptionModal.set(false);

    this.selectedDescription.set('');

    this.selectedDescriptionTitle.set('');
  }

}
