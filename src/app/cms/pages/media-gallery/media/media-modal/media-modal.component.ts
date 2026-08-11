import {
  CommonModule
} from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import {
  Media
} from '../media.component';


@Component({

  selector:
    'app-media-modal',

  standalone:
    true,

  imports: [

    CommonModule,

    ReactiveFormsModule

  ],

  templateUrl:
    './media-modal.component.html',

  styleUrl:
    './media-modal.component.scss'

})
export class MediaModalComponent
  implements OnChanges {


  // ===================================================
  // SERVICES
  // ===================================================

  private fb =
    inject(FormBuilder);


  // ===================================================
  // INPUTS
  // ===================================================

  @Input()
  media:
    Media | null = null;


  @Input()
  albumId:
    number = 0;


  @Input()
  imageUrl:
    string = '';


  // ===================================================
  // OUTPUTS
  // ===================================================

  @Output()
  save =
    new EventEmitter<FormData>();


  @Output()
  close =
    new EventEmitter<void>();


  // ===================================================
  // FILE
  // ===================================================

  selectedFile:
    File | null = null;


  // ===================================================
  // PREVIEW
  // ===================================================

  mediaPreview:
    string | null = null;


  mediaType:
    'image' |
    'video' |
    null = null;


  // ===================================================
  // FORM
  // ===================================================

  pageForm =
    this.fb.group({

      id:
        this.fb.control<number>(

          0,

          {
            nonNullable:
              true
          }

        )

    });


  // ===================================================
  // EDIT MODE
  // ===================================================

  get isEditMode(): boolean {

    return !!this.media;

  }


  // ===================================================
  // EXISTING MEDIA
  // ===================================================

  get hasExistingMedia(): boolean {

    return !!(

      this.media?.image ||

      this.media?.video

    );

  }


  // ===================================================
  // INPUT CHANGES
  // ===================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.media) {

      this.pageForm.patchValue({

        id:
          this.media.id

      });


      this.selectedFile =
        null;


      // ---------------------------------------------
      // Existing image
      // ---------------------------------------------

      if (this.media.image) {

        this.mediaType =
          'image';


        this.mediaPreview =
          this.getMediaUrl(
            this.media.image
          );

      }


      // ---------------------------------------------
      // Existing video
      // ---------------------------------------------

      else if (this.media.video) {

        this.mediaType =
          'video';


        this.mediaPreview =
          this.getMediaUrl(
            this.media.video
          );

      }


      else {

        this.mediaType =
          null;


        this.mediaPreview =
          null;

      }

    }

    else {

      this.resetForm();

    }

  }


  // ===================================================
  // GET MEDIA URL
  // ===================================================

  private getMediaUrl(
    path: string
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
      this.imageUrl
        ?.replace(/\/+$/, '') ?? '';


    const filePath =
      path
        .replace(/^\/+/, '');


    return `${baseUrl}/${filePath}`;

  }


  // ===================================================
  // FILE CHANGE
  // ===================================================

  onFileChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (!input.files?.length) {

      return;

    }


    const file =
      input.files[0];


    this.loadFile(file);

  }


  // ===================================================
  // LOAD FILE
  // ===================================================

  loadFile(
    file: File
  ): void {

    // -----------------------------------------------
    // Validate image/video
    // -----------------------------------------------

    if (

      !file.type.startsWith('image/') &&

      !file.type.startsWith('video/')

    ) {

      return;

    }


    this.selectedFile =
      file;


    // -----------------------------------------------
    // Determine media type
    // -----------------------------------------------

    if (
      file.type.startsWith('image/')
    ) {

      this.mediaType =
        'image';

    }

    else {

      this.mediaType =
        'video';

    }


    // -----------------------------------------------
    // Preview
    // -----------------------------------------------

    const objectUrl =
      URL.createObjectURL(file);


    this.mediaPreview =
      objectUrl;

  }


  // ===================================================
  // REMOVE MEDIA
  // ===================================================

  removeMedia(): void {

    this.selectedFile =
      null;


    this.mediaPreview =
      null;


    this.mediaType =
      null;

  }


  // ===================================================
  // SUBMIT
  // ===================================================

  submit(): void {

    // -----------------------------------------------
    // Album ID required
    // -----------------------------------------------

    if (!this.albumId) {

      return;

    }


    // -----------------------------------------------
    // Media required
    //
    // For CREATE:
    // selectedFile is mandatory.
    //
    // For EDIT:
    // existing media OR new file is required.
    // -----------------------------------------------

    if (

      !this.selectedFile &&

      !this.hasExistingMedia

    ) {

      return;

    }


    const formData =
      new FormData();


    // -----------------------------------------------
    // Album ID
    // -----------------------------------------------

    formData.append(

      'AlbumId',

      this.albumId.toString()

    );


    // -----------------------------------------------
    // ID
    // -----------------------------------------------

    if (this.isEditMode) {

      formData.append(

        'Id',

        this.media!.id.toString()

      );

    }


    // -----------------------------------------------
    // Photo
    //
    // IMPORTANT:
    // Both image and video are sent as "Photo"
    // because your backend DTO should have:
    //
    // public IFormFile? Photo { get; set; }
    // -----------------------------------------------

    if (this.selectedFile) {

      formData.append(

        'Photo',

        this.selectedFile,

        this.selectedFile.name

      );

    }


    // -----------------------------------------------
    // Debug
    // -----------------------------------------------

    console.log(
      'Media FormData'
    );


    formData.forEach(
      (value, key) => {

        console.log(
          key,
          value
        );

      }
    );


    // -----------------------------------------------
    // Send to parent
    // -----------------------------------------------

    this.save.emit(
      formData
    );

  }


  // ===================================================
  // CANCEL
  // ===================================================

  cancel(): void {

    this.resetForm();

    this.close.emit();

  }


  // ===================================================
  // RESET
  // ===================================================

  private resetForm(): void {

    this.pageForm.reset({

      id:
        0

    });


    this.selectedFile =
      null;


    this.mediaPreview =
      null;


    this.mediaType =
      null;

  }

}
