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
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ConfigService } from '../../../../services/config.service';
import { MediaModalComponent } from './media-modal/media-modal.component';
import { Album } from '../album/album.component';

export interface Media {
  id: number;
  albumId: number;
  image: string | null;
  video: string | null;
  photos?: File[] | null;
  photo?: File | null;
}

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaModalComponent],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent implements OnInit, OnChanges {
  // Inputs & Outputs
  @Input() album: Album | null = null;
  @Output() back = new EventEmitter<void>();

  // Services
  private apiService = inject(CmsApiService);
  private toastr = inject(ToastrService);
  private config = inject(ConfigService);
  private platformId = inject(PLATFORM_ID);

  // Signals
  media = signal<Media[]>([]);
  showModal = signal<boolean>(false);
  selectedMedia = signal<Media | null>(null);
  imageURL = signal<string>('');
  loggedInId = signal<string>('');

  ngOnInit(): void {
    this.imageURL.set(this.config.get('IMAGE_API_URL') || '');
    this.getLoggedInUser();
    this.getMedia();
  }

  // Refetch media if the selected album changes dynamically
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['album'] && !changes['album'].firstChange) {
      this.getMedia();
    }
  }

  private getLoggedInUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const currentUser = JSON.parse(userString);
          this.loggedInId.set(currentUser?.id?.toString() ?? '');
        }
      } catch (e) {
        console.error('Error reading logged in user', e);
      }
    }
  }

  getMedia(): void {
    if (!this.album?.id) {
      this.media.set([]);
      return;
    }

    this.apiService.GetRequest(`Media/Album/${this.album.id}`).subscribe({
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
          albumId: item.albumId ?? item.AlbumId ?? this.album?.id ?? 0,
          image: item.image ?? item.Image ?? null,
          video: item.video ?? item.Video ?? null,
          photos: null,
          photo: null
        }));

        this.media.set(mediaList);
      },
      error: (err) => {
        console.error('Get Media Error:', err);
        this.toastr.error(
          err?.error?.message || err?.message || 'Unable to load media.'
        );
      }
    });
  }

  getMediaUrl(path: string | null): string {
    if (!path) return '';

    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:') ||
      path.startsWith('blob:')
    ) {
      return path;
    }

    const baseUrl = this.imageURL()?.replace(/\/+$/, '') ?? '';
    const filePath = path.replace(/^\/+/, '');

    return `${baseUrl}/${filePath}`;
  }

  isImage(item: Media): boolean {
    return !!item.image;
  }

  isVideo(item: Media): boolean {
    return !!item.video;
  }

  openAddModal(): void {
    if (!this.album?.id) {
      this.toastr.warning('Album information is missing.');
      return;
    }
    this.selectedMedia.set(null);
    this.showModal.set(true);
  }

  editMedia(item: Media): void {
    this.selectedMedia.set({
      id: item.id,
      albumId: item.albumId,
      image: item.image,
      video: item.video,
      photos: null,
      photo: null
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedMedia.set(null);
  }

  saveMedia(formData: FormData): void {
    const id = formData.get('Id');
    const isEdit = !!id && Number(id) > 0;

    if (!isEdit) {
      formData.append('CreatedBy', this.loggedInId());
    } else {
      formData.append('UpdatedBy', this.loggedInId());
    }

    const request = isEdit
      ? this.apiService.PutRequest('Media', formData, true)
      : this.apiService.PostRequest('Media', formData, true);

    request.subscribe({
      next: (res: any) => {
        if (res?.isSucceeded) {
          this.toastr.success(
            res.message || (isEdit ? 'Media updated successfully.' : 'Media added successfully.')
          );
          this.closeModal();
          this.getMedia();
        } else {
          this.toastr.warning(
            res?.message || (isEdit ? 'Unable to update media.' : 'Unable to add media.')
          );
        }
      },
      error: (err) => {
        console.error('Media Save Error:', err);
        this.toastr.error(
          err?.error?.message || err?.message || 'Unable to save media.'
        );
      }
    });
  }

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
      if (!result.isConfirmed) return;

      const formData = new FormData();
      formData.append('Id', item.id.toString());
      if (item.image) formData.append('Image', item.image);
      if (item.video) formData.append('Video', item.video);

      this.apiService.DeleteFromFormRequest('Media', formData, true).subscribe({
        next: (res: any) => {
          if (res?.isSucceeded) {
            this.toastr.success(res.message || 'Media deleted successfully.');
            this.getMedia();
          } else {
            this.toastr.warning(res?.message || 'Unable to delete media.');
          }
        },
        error: (err) => {
          console.error('Media Delete Error:', err);
          this.toastr.error(
            err?.error?.message || err?.message || 'Unable to delete media.'
          );
        }
      });
    });
  }

  goBack(): void {
    this.back.emit();
  }
}
