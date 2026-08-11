import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  NgxPaginationModule
} from 'ngx-pagination';

import Swal from 'sweetalert2';

import {
  ToastrService
} from 'ngx-toastr';

import {
  CmsApiService
} from '../../../../services/cms-api-service.service';

import {
  AlbumModalComponent
} from './album-modal/album-modal.component';

import {
  MediaComponent
} from '../media/media.component';
import { ConfigService } from '../../../../services/config.service';


// =====================================================
// ALBUM INTERFACE
// =====================================================

export interface Album {

  id: number;

  name: string;

  description: string;

  coverImage: string | null;

  photo: File | null;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-album',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    NgxPaginationModule,

    AlbumModalComponent,

    MediaComponent

  ],

  templateUrl:
    './album.component.html',

  styleUrl:
    './album.component.scss'

})
export class AlbumComponent
  implements OnInit {


  // =====================================================
  // SERVICES
  // =====================================================

  constructor(

    private apiService:
      CmsApiService,

    private toastr:
      ToastrService,

    private config: ConfigService

  ) { }


  // =====================================================
  // SIGNALS
  // =====================================================

  albums =
    signal<Album[]>([]);


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


  selectedAlbum =
    signal<Album | null>(null);


  openedAlbum =
    signal<Album | null>(null);


  loggedInId =
    signal('');

  imageURL = signal('');

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.getLoggedInUser();

    this.getAlbums();

    this.imageURL.set(this.config.get('IMAGE_API_URL'));

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


  // =====================================================
  // FILTERED ALBUMS
  // =====================================================

  filteredAlbums =
    computed(() => {

      const keyword =
        this.search()
          .trim()
          .toLowerCase();


      if (!keyword) {

        return this.albums();

      }


      return this.albums()
        .filter(album => {

          const name =
            album.name
              ?.toLowerCase() ?? '';


          const description =
            album.description
              ?.toLowerCase() ?? '';


          return (

            name.includes(keyword) ||

            description.includes(keyword)

          );

        });

    });


  // =====================================================
  // SEARCH
  // =====================================================

  onSearchChange(
    value: string
  ): void {

    this.search.set(value);

    this.page.set(1);

  }


  // =====================================================
  // PAGE SIZE
  // =====================================================

  onPageSizeChange(
    value: number | string
  ): void {

    this.itemsPerPage.set(
      Number(value)
    );

    this.page.set(1);

  }


  // =====================================================
  // PAGE CHANGE
  // =====================================================

  onPageChange(
    pageNumber: number
  ): void {

    this.page.set(
      pageNumber
    );

  }


  // =====================================================
  // GET ALL ALBUMS
  // =====================================================

  getAlbums(): void {

    this.apiService

      .GetRequest('Album')

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


          const albums: Album[] =

            data.map(
              (item: any) => ({

                id:
                  item.id ??
                  item.Id ??
                  0,


                name:
                  item.name ??
                  item.Name ??
                  '',


                description:
                  item.description ??
                  item.Description ??
                  '',


                coverImage:
                  item.coverImage ??
                  item.CoverImage ??
                  null,


                // File is only used when
                // selecting a new image.
                photo:
                  null

              })
            );


          this.albums.set(
            albums
          );

        },


        error: (err) => {

          console.error(
            'Get Albums Error:',
            err
          );


          this.toastr.error(

            err?.error?.message ||

            err?.message ||

            'Unable to load albums.'

          );

        }

      });

  }


  // =====================================================
  // ADD ALBUM
  // =====================================================

  openAddModal(): void {

    this.selectedAlbum.set(
      null
    );

    this.showModal.set(
      true
    );

  }


  // =====================================================
  // EDIT ALBUM
  // =====================================================

  editAlbum(
    album: Album
  ): void {

    this.selectedAlbum.set({

      id:
        album.id,

      name:
        album.name,

      description:
        album.description,

      coverImage:
        album.coverImage,

      photo:
        null

    });


    this.showModal.set(
      true
    );

  }


  // =====================================================
  // OPEN ALBUM
  // =====================================================

  openAlbum(
    album: Album
  ): void {

    this.openedAlbum.set(
      album
    );

  }


  // =====================================================
  // CLOSE ALBUM
  // =====================================================

  closeAlbum(): void {

    this.openedAlbum.set(
      null
    );

  }


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  closeModal(): void {

    this.showModal.set(
      false
    );

    this.selectedAlbum.set(
      null
    );

  }


  // =====================================================
  // CREATE / UPDATE ALBUM
  // =====================================================

  saveAlbum(
    album: Album
  ): void {

    const isEdit =
      album.id > 0;


    const formData =
      new FormData();


    // ===================================================
    // ID
    // ===================================================

    if (isEdit) {

      formData.append(

        'Id',

        album.id.toString()

      );

    }


    // ===================================================
    // NAME
    // ===================================================

    formData.append(

      'Name',

      album.name.trim()

    );


    // ===================================================
    // DESCRIPTION
    // ===================================================

    formData.append(

      'Description',

      album.description?.trim() ?? ''

    );


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


    // ===================================================
    // PHOTO
    //
    // This MUST be "Photo" because the C# DTO has:
    //
    // public IFormFile? Photo { get; set; }
    // ===================================================

    if (album.photo) {

      formData.append(

        'Photo',

        album.photo,

        album.photo.name

      );

    }


    // ===================================================
    // DEBUG
    // ===================================================

    console.log(
      'Album FormData'
    );


    formData.forEach(
      (value, key) => {

        console.log(
          key,
          value
        );

      }
    );


    // ===================================================
    // API REQUEST
    // =====================================================

    const request =

      isEdit

        ? this.apiService.PutRequest(

          'Album',

          formData,

          true

        )

        : this.apiService.PostRequest(

          'Album',

          formData,

          true

        );


    // ===================================================
    // RESPONSE
    // ===================================================

    request.subscribe({

      next: (res: any) => {

        if (res?.isSucceeded) {

          this.toastr.success(

            res.message ||

            (

              isEdit

                ? 'Album updated successfully.'

                : 'Album created successfully.'

            )

          );


          this.getAlbums();

          this.closeModal();

        }

        else {

          this.toastr.warning(

            res?.message ||

            (

              isEdit

                ? 'Unable to update album.'

                : 'Unable to create album.'

            )

          );

        }

      },


      error: (err) => {

        console.error(
          'Album Save Error:',
          err
        );


        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Unable to save album.'

        );

      }

    });

  }


  // =====================================================
  // DELETE ALBUM
  // =====================================================

  deleteAlbum(album: Album): void {

    Swal.fire({

      title: 'Delete Album?',

      text:
        `Are you sure you want to delete "${album.name}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#dc2626',

      cancelButtonColor: '#6b7280',

      confirmButtonText: 'Yes, Delete',

      cancelButtonText: 'Cancel',

      reverseButtons: true,

      focusCancel: true

    }).then(result => {

      // =================================================
      // CANCEL
      // =================================================

      if (!result.isConfirmed) {

        return;

      }


      // =================================================
      // FORM DATA
      // =================================================

      const formData =
        new FormData();


      // =================================================
      // ID
      // =================================================

      formData.append(

        'Id',

        album.id.toString()

      );


      // =================================================
      // COVER IMAGE
      // =================================================

      if (album.coverImage) {

        formData.append(

          'CoverImage',

          album.coverImage

        );

      }


      // =================================================
      // DEBUG
      // =================================================

      console.log(
        'Delete Album FormData:'
      );


      formData.forEach(
        (value, key) => {

          console.log(
            key,
            value
          );

        }
      );


      // =================================================
      // DELETE API
      // =================================================

      this.apiService

        .DeleteFromFormRequest(

          'Album',

          formData,

          true

        )

        .subscribe({

          // =============================================
          // SUCCESS
          // =============================================

          next: (res: any) => {

            if (res?.isSucceeded) {

              this.toastr.success(

                res.message ||

                'Album deleted successfully.'

              );


              // -----------------------------------------
              // Close opened album
              // -----------------------------------------

              if (

                this.openedAlbum()?.id ===
                album.id

              ) {

                this.closeAlbum();

              }


              // -----------------------------------------
              // Close edit modal
              // -----------------------------------------

              if (

                this.selectedAlbum()?.id ===
                album.id

              ) {

                this.closeModal();

              }


              // -----------------------------------------
              // Reload albums
              // -----------------------------------------

              this.getAlbums();

            }

            else {

              this.toastr.warning(

                res?.message ||

                'Unable to delete album.'

              );

            }

          },


          // =============================================
          // ERROR
          // =============================================

          error: (err) => {

            console.error(

              'Album Delete Error:',

              err

            );


            this.toastr.error(

              err?.error?.message ||

              err?.message ||

              'Unable to delete album.'

            );

          }

        });

    });

  }

}
