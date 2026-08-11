import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { Album } from '../album/album.component';
import { MediaModalComponent } from './media-modal/media-modal.component';

export interface Media {
  id: number;
  albumId: number;
  type: 'photo' | 'video';
  title: string;
  description: string;
  file: string;
  selectedFile?: File | null;
}

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MediaModalComponent
  ],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent implements OnInit {

  constructor(
    private apiService: CmsApiService,
    private toastr: ToastrService
  ) { }

  // ---------------------------------------
  // Input / Output
  // ---------------------------------------

  @Input()
  album: Album | null = null;

  @Output()
  back = new EventEmitter<void>();

  // ---------------------------------------
  // Signals
  // ---------------------------------------

  media = signal<Media[]>([]);

  showModal = signal(false);

  selectedMedia = signal<Media | null>(null);

  loggedInId = signal('');

  // ---------------------------------------
  // Init
  // ---------------------------------------

  ngOnInit(): void {

    const userString =
      localStorage.getItem('user');

    if (userString) {

      const currentUser =
        JSON.parse(userString);

      this.loggedInId.set(
        currentUser.id
      );
    }

    if (this.album) {
      this.getMedia();
    }
  }

  // ---------------------------------------
  // Get Media
  // ---------------------------------------

  getMedia(): void {

    if (!this.album) {
      return;
    }

    this.apiService
      .GetRequest(
        'Media/Album/' + this.album.id
      )
      .subscribe({

        next: (res: any) => {

          const data =
            Array.isArray(res)
              ? res
              : res?.data
                ? res.data
                : res?.rows
                  ? res.rows
                  : [];

          const media: Media[] =
            data.map((item: any) => ({

              id:
                item.id ??
                item.Id ??
                0,

              albumId:
                item.albumId ??
                item.AlbumId ??
                this.album!.id,

              type:
                item.type ??
                item.Type ??
                'photo',

              title:
                item.title ??
                item.Title ??
                '',

              description:
                item.description ??
                item.Description ??
                '',

              file:
                item.file ??
                item.File ??
                '',

              selectedFile:
                null

            }));

          this.media.set(media);
        },

        error: (err) => {

          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Unable to load media.'
          );

        }

      });
  }

  // ---------------------------------------
  // Add Media
  // ---------------------------------------

  openAddModal(): void {

    this.selectedMedia.set(null);

    this.showModal.set(true);
  }

  // ---------------------------------------
  // Edit Media
  // ---------------------------------------

  editMedia(item: Media): void {

    this.selectedMedia.set({

      ...item,

      selectedFile: null

    });

    this.showModal.set(true);
  }

  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.showModal.set(false);

    this.selectedMedia.set(null);
  }

  // ---------------------------------------
  // Save Media
  // ---------------------------------------

  saveMedia(item: Media): void {

    if (!this.album) {
      return;
    }

    const isEdit =
      item.id > 0;

    const formData =
      new FormData();

    // ---------------------------------------
    // ID / User
    // ---------------------------------------

    if (isEdit) {

      formData.append(
        'Id',
        item.id.toString()
      );

      formData.append(
        'UpdatedBy',
        this.loggedInId()
      );

    } else {

      formData.append(
        'CreatedBy',
        this.loggedInId()
      );
    }

    // ---------------------------------------
    // Album
    // ---------------------------------------

    formData.append(
      'AlbumId',
      this.album.id.toString()
    );

    // ---------------------------------------
    // Type
    // ---------------------------------------

    formData.append(
      'Type',
      item.type
    );

    // ---------------------------------------
    // Title
    // ---------------------------------------

    formData.append(
      'Title',
      item.title
    );

    // ---------------------------------------
    // Description
    // ---------------------------------------

    formData.append(
      'Description',
      item.description
    );

    // ---------------------------------------
    // File
    // ---------------------------------------

    if (item.selectedFile) {

      formData.append(
        'File',
        item.selectedFile,
        item.selectedFile.name
      );
    }

    // ---------------------------------------
    // API
    // ---------------------------------------

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

        if (res.isSucceeded) {

          this.toastr.success(
            res.message ||
            `Media ${isEdit ? 'updated' : 'added'
            } successfully.`
          );

          this.getMedia();

          this.closeModal();

        } else {

          this.toastr.warning(
            res.message ||
            'Unable to save media.'
          );
        }

      },

      error: (err) => {

        console.error(
          'Media API Error:',
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

  // ---------------------------------------
  // Delete Media
  // ---------------------------------------

  deleteMedia(item: Media): void {

    Swal.fire({

      title: 'Delete Media?',

      text:
        `Are you sure you want to delete "${item.title}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#dc2626',

      cancelButtonColor: '#6b7280',

      confirmButtonText: 'Yes, Delete',

      cancelButtonText: 'Cancel',

      reverseButtons: true,

      focusCancel: true

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.apiService
        .DeleteRequest(
          'Media',
          item.id
        )
        .subscribe({

          next: (res: any) => {

            if (res.isSucceeded) {

              this.toastr.success(
                res.message ||
                'Media deleted successfully.'
              );

              this.getMedia();

            } else {

              this.toastr.warning(
                res.message ||
                'Unable to delete media.'
              );

            }

          },

          error: (err) => {

            this.toastr.error(
              err?.error?.message ||
              err?.message ||
              'Unable to delete media.'
            );

          }

        });

    });
  }

  // ---------------------------------------
  // Back
  // ---------------------------------------

  goBack(): void {
    this.back.emit();
  }

}
