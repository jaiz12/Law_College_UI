
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  signal,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { MediaModalComponent } from './media-modal/media-modal.component';
import { Album } from '../album/album.component';
import { LayoutService } from '../../../layout/services/layout.service';

export interface Media {
  id: number;
  albumId: number;
  image: string | null;
  video: string | null;
  pdf: string | null;
  photos?: File[] | null;
  photo?: File | null;
}

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [
    CommonModule,
    MediaModalComponent
  ],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent implements OnInit, OnChanges {

  @Input() album: Album | null = null;
  @Output() back = new EventEmitter<void>();

  private apiService = inject(CmsApiService);
  private toastr = inject(ToastrService);
  private config = inject(ConfigService);
  private platformId = inject(PLATFORM_ID);
  private layout = inject(LayoutService);

  // Signals
  media = signal<Media[]>([]);
  showModal = signal<boolean>(false);
  selectedMedia = signal<Media | null>(null);
  imageURL = signal<string>('');
  loggedInId = signal<string>('');

  ngOnInit(): void {
    this.imageURL.set(
      this.config.get('IMAGE_API_URL') || ''
    );

    this.getLoggedInUser();
    this.getMedia();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['album'] &&
      !changes['album'].firstChange
    ) {
      this.getMedia();
    }
  }

  // -----------------------------------------
  // Logged-in user
  // -----------------------------------------

  private getLoggedInUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const userString = localStorage.getItem('user');

      if (userString) {
        const currentUser = JSON.parse(userString);

        this.loggedInId.set(
          currentUser?.id?.toString() ?? ''
        );
      }
    } catch (error) {
      console.error('Error reading logged in user:', error);
    }
  }

  // -----------------------------------------
  // Get media
  // -----------------------------------------

  getMedia(): void {
    if (!this.album?.id) {
      this.media.set([]);
      return;
    }

    this.layout.showPageLoader();

    this.apiService
      .GetRequest(`Media/Album/${this.album.id}`)
      .pipe(
        finalize(() => {
          this.layout.hidePageLoader();
        })
      )
      .subscribe({
        next: (res: any) => {

          const data = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res?.rows)
                ? res.rows
                : [];

          const mediaList: Media[] = data.map((item: any) => ({
            id: item.id ?? item.Id ?? 0,

            albumId:
              item.albumId ??
              item.AlbumId ??
              this.album?.id ??
              0,

            image: item.image ?? item.Image ?? null,
            video: item.video ?? item.Video ?? null,
            pdf: item.pdf ?? item.Pdf ?? null,

            photos: null,
            photo: null
          }));

          this.media.set(mediaList);
        },

        error: (err) => {
          console.error('Get Media Error:', err);

          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Unable to load media.'
          );
        }
      });
  }

  // -----------------------------------------
  // Media URL
  // -----------------------------------------

  getMediaUrl(
    path: string | null | undefined
  ): string {

    if (!path) {
      return '';
    }

    const trimmedPath = path.trim();

    if (!trimmedPath) {
      return '';
    }

    if (
      trimmedPath.startsWith('http://') ||
      trimmedPath.startsWith('https://') ||
      trimmedPath.startsWith('data:') ||
      trimmedPath.startsWith('blob:')
    ) {
      return trimmedPath;
    }

    const baseUrl = this.imageURL()
      .replace(/\/+$/, '');

    const filePath = trimmedPath
      .replace(/^\/+/, '');

    return baseUrl
      ? `${baseUrl}/${filePath}`
      : `/${filePath}`;
  }

  // -----------------------------------------
  // Media type checks
  // -----------------------------------------

  isImage(item: Media): boolean {
    return !!item.image;
  }

  isVideo(item: Media): boolean {
    return !!item.video;
  }

  isPdf(item: Media): boolean {
    return !!item.pdf;
  }

  // -----------------------------------------
  // Add media
  // -----------------------------------------

  openAddModal(): void {

    if (!this.album?.id) {
      this.toastr.warning(
        'Album information is missing.'
      );
      return;
    }

    this.selectedMedia.set(null);
    this.showModal.set(true);
  }

  // -----------------------------------------
  // Edit media
  // -----------------------------------------

  editMedia(item: Media): void {

    this.selectedMedia.set({
      id: item.id,
      albumId: item.albumId,
      image: item.image,
      video: item.video,
      pdf: item.pdf,
      photos: null,
      photo: null
    });

    this.showModal.set(true);
  }

  // -----------------------------------------
  // Close modal
  // -----------------------------------------

  closeModal(): void {
    this.showModal.set(false);
    this.selectedMedia.set(null);
  }

  // -----------------------------------------
  // Save media
  // -----------------------------------------

  saveMedia(formData: FormData): void {

    const id = formData.get('Id');
    const isEdit = !!id && Number(id) > 0;

    if (!isEdit) {
      formData.append(
        'CreatedBy',
        this.loggedInId()
      );
    } else {
      formData.append(
        'UpdatedBy',
        this.loggedInId()
      );
    }

    const request = isEdit
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

        } else {

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
        console.error('Media Save Error:', err);

        this.toastr.error(
          err?.error?.message ||
          err?.message ||
          'Unable to save media.'
        );
      }
    });
  }

  // -----------------------------------------
  // Delete media
  // -----------------------------------------

  deleteMedia(item: Media): void {

    Swal.fire({
      title: 'Delete Media?',
      text: 'Are you sure you want to delete this media?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    }).then((result) => {

      if (!result.isConfirmed) {
        return;
      }

      const formData = new FormData();

      formData.append('Id', item.id.toString());

      if (item.image) {
        formData.append('Image', item.image);
      }

      if (item.video) {
        formData.append('Video', item.video);
      }

      if (item.pdf) {
        formData.append('Pdf', item.pdf);
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

            } else {

              this.toastr.warning(
                res?.message ||
                'Unable to delete media.'
              );
            }
          },

          error: (err) => {
            console.error('Media Delete Error:', err);

            this.toastr.error(
              err?.error?.message ||
              err?.message ||
              'Unable to delete media.'
            );
          }
        });
    });
  }

  // -----------------------------------------
  // Back to albums
  // -----------------------------------------

  goBack(): void {
    this.back.emit();
  }
}
