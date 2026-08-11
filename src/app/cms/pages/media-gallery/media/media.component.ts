import {
  CommonModule
} from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import Swal from 'sweetalert2';

import {
  ToastrService
} from 'ngx-toastr';

import {
  CmsApiService
} from '../../../../services/cms-api-service.service';

import {
  ConfigService
} from '../../../../services/config.service';

import {
  MediaModalComponent
} from './media-modal/media-modal.component';

import {
  Album
} from '../album/album.component';


// =====================================================
// MEDIA INTERFACE
// =====================================================

export interface Media {

  id: number;

  albumId: number;

  image: string | null;

  video: string | null;

  photo: File | null;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-media',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    MediaModalComponent

  ],

  templateUrl:
    './media.component.html',

  styleUrl:
    './media.component.scss'

})
export class MediaComponent
  implements OnInit {


  // ===================================================
  // INPUT
  // ===================================================

  @Input()
  album: Album | null = null;


  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  back =
    new EventEmitter<void>();


  // ===================================================
  // SERVICES
  // ===================================================

  constructor(

    private apiService:
      CmsApiService,

    private toastr:
      ToastrService,

    private config:
      ConfigService

  ) { }


  // ===================================================
  // SIGNALS
  // ===================================================

  media =
    signal<Media[]>([]);


  showModal =
    signal(false);


  selectedMedia =
    signal<Media | null>(null);


  imageURL =
    signal('');

  loggedInId =
    signal('');

  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.imageURL.set(
      this.config.get('IMAGE_API_URL')
    );
    this.getLoggedInUser();

    this.getMedia();

  }

  // =====================================================
  // GET LOGGED IN USER
  // =====================================================

  private getLoggedInUser(): void {

    const userString =
      localStorage.getItem('user');


    if (!userString) {

      return;

    }


    try {

      const currentUser =
        JSON.parse(userString);


      this.loggedInId.set(

        currentUser?.id?.toString() ?? ''

      );

    }

    catch (error) {

      console.error(
        'Unable to read logged in user.',
        error
      );

      this.loggedInId.set('');

    }

  }


  // ===================================================
  // GET MEDIA
  // ===================================================

  getMedia(): void {

    if (!this.album?.id) {

      this.media.set([]);

      return;

    }


    this.apiService

      .GetRequest(
        `Media/Album/${this.album.id}`
      )

      .subscribe({

        next: (res: any) => {

          const data =

            Array.isArray(res)

              ? res

              : Array.isArray(res?.data)

                ? res.data

                : Array.isArray(res?.rows)

                  ? res.rows

                  : [];


          const mediaList:
            Media[] =

            data.map(
              (item: any) => ({

                id:
                  item.id ??
                  item.Id ??
                  0,


                albumId:
                  item.albumId ??
                  item.AlbumId ??
                  this.album?.id ??
                  0,


                image:
                  item.image ??
                  item.Image ??
                  null,


                video:
                  item.video ??
                  item.Video ??
                  null,


                photo:
                  null

              })
            );


          this.media.set(
            mediaList
          );

        },


        error: (err) => {

          console.error(
            'Get Media Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load media.'

          );

        }

      });

  }


  // ===================================================
  // GET MEDIA URL
  // ===================================================

  getMediaUrl(
    path: string | null
  ): string {

    if (!path) {

      return '';

    }


    if (

      path.startsWith('http://') ||

      path.startsWith('https://') ||

      path.startsWith('data:')

    ) {

      return path;

    }


    const baseUrl =
      this.imageURL()
        ?.replace(/\/+$/, '') ?? '';


    const filePath =
      path
        .replace(/^\/+/, '');


    return `${baseUrl}/${filePath}`;

  }


  // ===================================================
  // CHECK IMAGE
  // ===================================================

  isImage(
    item: Media
  ): boolean {

    return !!item.image;

  }


  // ===================================================
  // CHECK VIDEO
  // ===================================================

  isVideo(
    item: Media
  ): boolean {

    return !!item.video;

  }


  // ===================================================
  // ADD MEDIA
  // ===================================================

  openAddModal(): void {

    if (!this.album?.id) {

      this.toastr.warning(
        'Album information is missing.'
      );

      return;

    }


    this.selectedMedia.set(
      null
    );


    this.showModal.set(
      true
    );

  }


  // ===================================================
  // EDIT MEDIA
  // ===================================================

  editMedia(
    item: Media
  ): void {

    this.selectedMedia.set({

      id:
        item.id,

      albumId:
        item.albumId,

      image:
        item.image,

      video:
        item.video,

      photo:
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


    this.selectedMedia.set(
      null
    );

  }


  // ===================================================
  // SAVE MEDIA
  // ===================================================

  saveMedia(
    formData: FormData
  ): void {

    const id =
      formData.get('Id');


    const isEdit =
      !!id &&
      Number(id) > 0;

    // ===================================================
    // CREATED BY
    // ===================================================

    if (!isEdit) {

      formData.append(

        'CreatedBy',

        this.loggedInId()

      );

    }


    // ===================================================
    // UPDATED BY
    // ===================================================

    if (isEdit) {

      formData.append(

        'UpdatedBy',

        this.loggedInId()

      );

    }


    const request =

      isEdit

        ? this.apiService.PutRequest(

          'Media',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'Media',

          formData,

          true

        );


    request.subscribe({

      next: (res: any) => {

        if (res?.isSucceeded) {

          this.toastr.success(

            res.message ||

            (

              isEdit

                ? 'Media updated successfully.'

                : 'Media added successfully.'

            )

          );


          this.closeModal();


          this.getMedia();

        }

        else {

          this.toastr.warning(

            res?.message ||

            (

              isEdit

                ? 'Unable to update media.'

                : 'Unable to add media.'

            )

          );

        }

      },


      error: (err) => {

        console.error(
          'Media Save Error:',
          err
        );


        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Unable to save media.'

        );

      }

    });

  }


  // ===================================================
  // DELETE MEDIA
  // ===================================================

  deleteMedia(
    item: Media
  ): void {

    Swal.fire({

      title:
        'Delete Media?',

      text:
        'Are you sure you want to delete this media?',

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

        if (!result.isConfirmed) {

          return;

        }


        const formData =
          new FormData();


        formData.append(

          'Id',

          item.id.toString()

        );


        if (item.image) {

          formData.append(

            'Image',

            item.image

          );

        }


        if (item.video) {

          formData.append(

            'Video',

            item.video

          );

        }


        this.apiService

          .DeleteFromFormRequest(

            'Media',

            formData,

            true

          )

          .subscribe({

            next: (res: any) => {

              if (res?.isSucceeded) {

                this.toastr.success(

                  res.message ||

                  'Media deleted successfully.'

                );


                this.getMedia();

              }

              else {

                this.toastr.warning(

                  res?.message ||

                  'Unable to delete media.'

                );

              }

            },


            error: (err) => {

              console.error(
                'Media Delete Error:',
                err
              );


              this.toastr.error(

                err?.error?.message ||

                err?.message ||

                'Unable to delete media.'

              );

            }

          });

      });

  }


  // ===================================================
  // BACK TO ALBUMS
  // ===================================================

  goBack(): void {

    this.back.emit();

  }

}
