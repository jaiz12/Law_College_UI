
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Media } from '../media.component';

export interface MediaPreviewItem {
  id?: number;
  url: string;
  type: 'image' | 'video' | 'pdf';
  file?: File;
}

// Allowed file extensions
const ALLOWED_IMAGE_TYPES = [
  'jpeg',
  'jpg',
  'png',
  'webp',
  'gif'
];

const ALLOWED_VIDEO_TYPES = [
  'mp4',
  'webm',
  'mov'
];

const ALLOWED_PDF_TYPES = ['.pdf'];

// Allowed MIME types
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

const ALLOWED_PDF_MIME_TYPES = [
  'application/pdf'
];

// Maximum file sizes
const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 100;
const MAX_PDF_SIZE_MB = 5;

@Component({
  selector: 'app-media-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './media-modal.component.html',
  styleUrl: './media-modal.component.scss'
})
export class MediaModalComponent implements OnChanges {

  private fb = inject(FormBuilder);

  @Input() media: Media | null = null;
  @Input() albumId: number = 0;
  @Input() imageUrl: string = '';

  @Output() save = new EventEmitter<FormData>();
  @Output() close = new EventEmitter<void>();

  selectedFiles: File[] = [];
  mediaPreviews: MediaPreviewItem[] = [];
  errorMessage: string | null = null;

  pageForm = this.fb.group({
    id: this.fb.control<number>(0, { nonNullable: true })
  });

  get isEditMode(): boolean {
    return !!this.media;
  }

  get hasExistingMedia(): boolean {
    return !!(this.media?.image || this.media?.video);
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (this.media) {

      this.pageForm.patchValue({
        id: this.media.id
      });

      this.resetFormState();
      this.errorMessage = null;

      if (this.media.image) {
        this.mediaPreviews.push({
          id: this.media.id,
          type: 'image',
          url: this.getMediaUrl(this.media.image)
        });
      } else if (this.media.video) {
        this.mediaPreviews.push({
          id: this.media.id,
          type: 'video',
          url: this.getMediaUrl(this.media.video)
        });
      }

    } else {
      this.resetForm();
    }
  }

  private getMediaUrl(path: string): string {

    if (!path) return '';

    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:')
    ) {
      return path;
    }

    const baseUrl = this.imageUrl?.replace(/\/+$/, '') ?? '';
    const filePath = path.replace(/^\/+/, '');

    return `${baseUrl}/${filePath}`;
  }

  onFileChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.errorMessage = null;

    const files = Array.from(input.files);

    // Replace existing preview when editing
    if (this.isEditMode) {
      this.resetFormState();
    }

    const invalidFiles: string[] = [];

    files.forEach(file => {

      const validationError = this.validateFile(file);

      if (validationError) {
        invalidFiles.push(`${file.name}: ${validationError}`);
      } else {
        this.loadFile(file);
      }

    });

    if (invalidFiles.length > 0) {
      this.errorMessage = invalidFiles.join(' | ');
    }

    // Allow selecting the same file again
    input.value = '';
  }

  /**
   * Validate file extension, MIME type and file size.
   */
  private validateFile(file: File): string | null {

    const extension =
      file.name.split('.').pop()?.toLowerCase() ?? '';

    const fileType = file.type.toLowerCase();

    const isImage = ALLOWED_IMAGE_TYPES.includes(extension);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(extension);
    const isPdf = ALLOWED_PDF_TYPES.includes(`.${extension}`);

    if (!isImage && !isVideo && !isPdf) {
      return 'Invalid file type. Only JPG, JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV and PDF are allowed.';
    }

    // Verify MIME type when the browser provides one
    if (fileType) {

      if (
        isImage &&
        !ALLOWED_IMAGE_MIME_TYPES.includes(fileType)
      ) {
        return 'Invalid image MIME type.';
      }

      if (
        isVideo &&
        !ALLOWED_VIDEO_MIME_TYPES.includes(fileType)
      ) {
        return 'Invalid video MIME type.';
      }

      if (
        isPdf &&
        !ALLOWED_PDF_MIME_TYPES.includes(fileType)
      ) {
        return 'Invalid PDF MIME type.';
      }
    }

    const fileSizeMB = file.size / (1024 * 1024);

    if (isImage && fileSizeMB > MAX_IMAGE_SIZE_MB) {
      return `Image size exceeds the ${MAX_IMAGE_SIZE_MB}MB limit.`;
    }

    if (isVideo && fileSizeMB > MAX_VIDEO_SIZE_MB) {
      return `Video size exceeds the ${MAX_VIDEO_SIZE_MB}MB limit.`;
    }

    if (isPdf && fileSizeMB > MAX_PDF_SIZE_MB) {
      return `PDF size exceeds the ${MAX_PDF_SIZE_MB}MB limit.`;
    }

    return null;
  }

  private loadFile(file: File): void {

    this.selectedFiles.push(file);

    const extension =
      file.name.split('.').pop()?.toLowerCase() ?? '';

    let type: 'image' | 'video' | 'pdf';

    if (ALLOWED_IMAGE_TYPES.includes(extension)) {
      type = 'image';
    } else if (ALLOWED_VIDEO_TYPES.includes(extension)) {
      type = 'video';
    } else {
      type = 'pdf';
    }

    const objectUrl = URL.createObjectURL(file);

    this.mediaPreviews.push({
      url: objectUrl,
      type,
      file
    });
  }

  removeMedia(index: number): void {

    const removedItem = this.mediaPreviews[index];

    if (!removedItem) return;

    if (removedItem.file) {

      URL.revokeObjectURL(removedItem.url);

      this.selectedFiles = this.selectedFiles.filter(
        file => file !== removedItem.file
      );
    }

    this.mediaPreviews.splice(index, 1);

    if (
      this.selectedFiles.length === 0 &&
      this.mediaPreviews.length === 0
    ) {
      this.errorMessage = null;
    }
  }

  submit(): void {

    if (!this.albumId) return;

    if (
      this.selectedFiles.length === 0 &&
      !this.hasExistingMedia
    ) {
      this.errorMessage =
        'Please select at least one valid image, video or PDF file.';
      return;
    }

    const formData = new FormData();

    formData.append('AlbumId', this.albumId.toString());

    if (this.isEditMode && this.media) {
      formData.append('Id', this.media.id.toString());
    }

    // Append all validated files
    this.selectedFiles.forEach(file => {
      formData.append('Photos', file, file.name);
    });

    this.save.emit(formData);
  }

  cancel(): void {
    this.resetForm();
    this.close.emit();
  }

  private resetFormState(): void {

    this.mediaPreviews.forEach(item => {
      if (item.file) {
        URL.revokeObjectURL(item.url);
      }
    });

    this.selectedFiles = [];
    this.mediaPreviews = [];
  }

  private resetForm(): void {

    this.pageForm.reset({
      id: 0
    });

    this.resetFormState();
    this.errorMessage = null;
  }
}
