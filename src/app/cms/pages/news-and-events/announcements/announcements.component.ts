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

import { ConfigService } from '../../../../services/config.service';

import {
  AnnouncementsModalComponent
} from './announcements-modal/announcements-modal.component';


// =================================================
// Interface
// =================================================

export interface Announcement {

  Id: number;

  Title: string;

  ShortDescription: string;

  Content: string;

  image: string | null;

  imageFile: File | null;

  AttachmentUrl?: string;

  PublishDate: string;

  ExpiryDate?: string;

  IsFeatured: boolean;

  IsImportant: boolean;

}


@Component({

  selector:
    'app-announcements',

  standalone:
    true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    AnnouncementsModalComponent

  ],

  templateUrl:
    './announcements.component.html',

  styleUrl:
    './announcements.component.scss'

})


export class AnnouncementsComponent
  implements OnInit {


  constructor(

    private apiService:
      CmsApiService,

    private toastr:
      ToastrService,

    private config:
      ConfigService

  ) { }


  // =================================================
  // Signals
  // =================================================

  search =
    signal('');


  showModal =
    signal(false);


  page =
    signal(1);


  itemsPerPage =
    signal(5);


  pageSizeOptions =
    [5, 10, 20, 50];


  imageURL =
    signal('');


  loggedInId =
    signal('');


  announcements =
    signal<Announcement[]>([]);


  selectedAnnouncement =
    signal<Announcement | null>(null);


  // =================================================
  // Init
  // =================================================

  ngOnInit(): void {

    this.imageURL.set(

      this.config.get(
        'IMAGE_API_URL'
      )

    );


    this.getAnnouncements();


    const user =
      localStorage.getItem('user');


    if (user) {

      const currentUser =
        JSON.parse(user);


      this.loggedInId.set(
        currentUser.id
      );

    }

  }


  // =================================================
  // Filter
  // =================================================

  filteredAnnouncements =
    computed(() => {


      const keyword =
        this.search()

          .trim()

          .toLowerCase();


      if (!keyword) {

        return this.announcements();

      }


      return this.announcements()

        .filter(item =>


          item.Title

            .toLowerCase()

            .includes(keyword)


          ||


          item.ShortDescription

            .toLowerCase()

            .includes(keyword)


          ||


          item.Content

            .toLowerCase()

            .includes(keyword)


        );

    });


  // =================================================
  // Get Announcements
  // =================================================

  getAnnouncements(): void {


    this.apiService

      .GetRequest(

        'Announcements'

      )

      .subscribe({


        next:
          (res: any) => {


            const data =


              Array.isArray(res)


                ? res


                : res.data || [];


            const list:


              Announcement[] =


              data.map((item: any) => ({


                Id:

                  item.Id ??

                  item.id ??

                  0,


                Title:

                  item.Title ??

                  item.title ??

                  '',


                ShortDescription:

                  item.ShortDescription ??

                  item.shortDescription ??

                  '',


                Content:

                  item.Content ??

                  item.content ??

                  '',


                image:

                  item.image ??

                  item.Image ??

                  item.CoverImage ??

                  item.coverImage ??

                  null,


                imageFile:

                  null,


                AttachmentUrl:

                  item.AttachmentUrl ??

                  item.attachmentUrl ??

                  '',


                PublishDate:

                  item.PublishDate ??

                  item.publishDate ??

                  '',


                ExpiryDate:

                  item.ExpiryDate ??

                  item.expiryDate ??

                  '',


                IsFeatured:

                  item.IsFeatured ??

                  item.isFeatured ??

                  false,


                IsImportant:

                  item.IsImportant ??

                  item.isImportant ??

                  false


              }));


            this.announcements.set(
              list
            );


          },


        error:
          (err) => {


            this.toastr.error(


              err?.error?.message ||


              'Unable to load announcements.'


            );

          }


      });


  }


  // =================================================
  // Add
  // =================================================

  addAnnouncement(): void {


    this.selectedAnnouncement.set(
      null
    );


    this.showModal.set(
      true
    );


  }


  // =================================================
  // Edit
  // =================================================

  editAnnouncement(

    announcement:
      Announcement

  ): void {


    this.selectedAnnouncement.set({

      ...announcement

    });


    this.showModal.set(
      true
    );


  }


  // =================================================
  // Close
  // =================================================

  closeModal(): void {


    this.showModal.set(
      false
    );


    this.selectedAnnouncement.set(
      null
    );


  }


  // =================================================
  // Save
  // =================================================

  saveAnnouncement(

    announcement:
      Announcement

  ): void {


    const isEdit =

      announcement.Id > 0;


    const formData =

      new FormData();


    // -----------------------------------------------
    // Id and User
    // -----------------------------------------------

    if (isEdit) {


      formData.append(

        'Id',

        announcement.Id.toString()

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


    // -----------------------------------------------
    // Basic Details
    // -----------------------------------------------

    formData.append(

      'Title',

      announcement.Title

    );


    formData.append(

      'ShortDescription',

      announcement.ShortDescription

    );


    formData.append(

      'Content',

      announcement.Content

    );


    // -----------------------------------------------
    // Attachment URL
    // -----------------------------------------------

    if (

      announcement.AttachmentUrl

    ) {


      formData.append(

        'AttachmentUrl',

        announcement.AttachmentUrl

      );

    }


    // -----------------------------------------------
    // Publish Date
    // -----------------------------------------------

    formData.append(

      'PublishDate',

      announcement.PublishDate

    );


    // -----------------------------------------------
    // Expiry Date
    // -----------------------------------------------

    if (

      announcement.ExpiryDate

    ) {


      formData.append(

        'ExpiryDate',

        announcement.ExpiryDate

      );

    }


    // -----------------------------------------------
    // Boolean Values
    // -----------------------------------------------

    formData.append(

      'IsFeatured',

      announcement.IsFeatured.toString()

    );


    formData.append(

      'IsImportant',

      announcement.IsImportant.toString()

    );


    // -----------------------------------------------
    // Image
    // -----------------------------------------------

    if (

      announcement.imageFile

    ) {


      formData.append(

        'Image',

        announcement.imageFile,

        announcement.imageFile.name

      );

    }


    // -----------------------------------------------
    // API Request
    // -----------------------------------------------

    const request =


      isEdit


        ? this.apiService.PutRequest(

          'Announcements',

          formData,

          true

        )


        : this.apiService.PostRequest(

          'Announcements',

          formData,

          true

        );


    request.subscribe({


      next:
        (res: any) => {


          if (

            res.isSucceeded

          ) {


            this.toastr.success(


              res.message ||


              `Announcement ${isEdit

                ? 'updated'

                : 'created'

              } successfully.`


            );


            this.getAnnouncements();


            this.closeModal();


          }


          else {


            this.toastr.warning(


              res.message ||


              'Unable to save announcement.'


            );

          }


        },


      error:
        (err) => {


          this.toastr.error(


            err?.error?.message ||


            err?.message ||


            'Something went wrong.'


          );

        }


    });


  }


  // =================================================
  // Delete
  // =================================================

  deleteAnnouncement(

    announcement:
      Announcement

  ): void {


    Swal.fire({


      title:
        'Delete Announcement?',


      text:

        `Are you sure you want to delete "${announcement.Title

        }"?`,


      icon:
        'warning',


      showCancelButton:
        true,


      confirmButtonText:
        'Yes, Delete',


      cancelButtonText:
        'Cancel',


      confirmButtonColor:
        '#dc2626',


      reverseButtons:
        true


    })


      .then(result => {


        if (

          !result.isConfirmed

        ) {


          return;

        }


        const formData =

          new FormData();


        formData.append(

          'Id',

          announcement.Id.toString()

        );


        formData.append(

          'Image',

          announcement.image ??

          ''

        );


        this.apiService


          .DeleteFromFormRequest(

            'Announcements',

            formData,

            true

          )


          .subscribe({


            next:
              (res: any) => {


                if (

                  res.isSucceeded

                ) {


                  this.toastr.success(


                    res.message ||


                    'Announcement deleted successfully.'


                  );


                  this.getAnnouncements();


                }


                else {


                  this.toastr.warning(


                    res.message ||


                    'Unable to delete announcement.'


                  );

                }


              },


            error:
              (err) => {


                this.toastr.error(


                  err?.error?.message ||


                  'Unable to delete announcement.'


                );

              }


          });


      });


  }


}
