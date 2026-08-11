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
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ValidationService
} from '../../../../../services/validation-service.service';

import {
  Album
} from '../album.component';

@Component({

  selector: 'app-album-modal',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './album-modal.component.html',

  styleUrl:
    './album-modal.component.scss'

})
export class AlbumModalComponent
  implements OnChanges {

  // =====================================================
  // SERVICES
  // =====================================================

  private fb =
    inject(FormBuilder);

  private validationService =
    inject(ValidationService);


  // =====================================================
  // INPUT
  // =====================================================

  @Input()
  album:
    Album | null = null;


  // =====================================================
  // IMAGE API URL
  // =====================================================

  @Input()
  imageUrl:
    string = '';


  // =====================================================
  // OUTPUT
  // =====================================================

  @Output()
  save =
    new EventEmitter<Album>();


  @Output()
  close =
    new EventEmitter<void>();


  // =====================================================
  // IMAGE
  // =====================================================

  selectedFile:
    File | null = null;


  imagePreview:
    string | null = null;


  // =====================================================
  // FORM
  // =====================================================

  pageForm =
    this.fb.group({

      id:
        this.fb.control<number>(
          0,
          {
            nonNullable: true
          }
        ),

      name:
        this.fb.control<string>(
          '',
          {
            validators: [

              Validators.required,

              this.validationService
                .noWhitespaceValidator()

            ],

            nonNullable: true
          }
        ),

      description:
        this.fb.control<string>(
          '',
          {
            validators: [

              this.validationService
                .noWhitespaceValidator()

            ],

            nonNullable: true
          }
        )

    });


  // =====================================================
  // EDIT MODE
  // =====================================================

  get isEditMode(): boolean {

    return !!this.album;

  }


  // =====================================================
  // INPUT CHANGES
  // =====================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.album) {

      // -----------------------------------------------
      // Fill form
      // -----------------------------------------------

      this.pageForm.patchValue({

        id:
          this.album.id,

        name:
          this.album.name,

        description:
          this.album.description

      });


      // -----------------------------------------------
      // Existing cover image
      // -----------------------------------------------

      this.selectedFile =
        null;


      if (this.album.coverImage) {

        this.imagePreview =
          this.getImageUrl(
            this.album.coverImage
          );

      }

      else {

        this.imagePreview =
          null;

      }

    }

    else {

      this.resetForm();

    }

  }


  // =====================================================
  // GET IMAGE URL
  // =====================================================

  private getImageUrl(
    image: string
  ): string {

    if (!image) {

      return '';

    }


    // If API already returns
    // complete URL

    if (
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('data:')
    ) {

      return image;

    }


    // Prevent double slash

    const baseUrl =
      this.imageUrl
        ?.replace(/\/+$/, '') ?? '';


    const imagePath =
      image
        .replace(/^\/+/, '');


    return `${baseUrl}/${imagePath}`;

  }


  // =====================================================
  // FILE CHANGE
  // =====================================================

  onFileChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files?.length
    ) {

      return;

    }


    const file =
      input.files[0];


    this.loadImage(file);

  }


  // =====================================================
  // LOAD IMAGE
  // =====================================================

  loadImage(file: File): void {

  // -----------------------------------------------
  // Validate image type
  // -----------------------------------------------

  if (!file.type.startsWith('image/')) {

    return;
  }


  // -----------------------------------------------
  // Store selected file
  // -----------------------------------------------

  this.selectedFile =
    file;


  // -----------------------------------------------
  // Preview
  // -----------------------------------------------

  const reader =
    new FileReader();


  reader.onload = () => {

    this.imagePreview =
      reader.result as string;

  };


  reader.readAsDataURL(file);

}


  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  removeImage(): void {

    this.selectedFile =
      null;


    this.imagePreview =
      null;

  }


  // =====================================================
  // SUBMIT
  // =====================================================

  submit(): void {

    // -----------------------------------------------
    // Validate normal form fields
    // -----------------------------------------------

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;
    }


    // -----------------------------------------------
    // PHOTO IS MANDATORY
    //
    // This applies to BOTH:
    // Create and Update
    //
    // On update:
    // - Existing image = imagePreview exists
    // - Removed image = imagePreview is null
    // - New image = selectedFile exists
    // -----------------------------------------------

    if (!this.selectedFile && !this.imagePreview) {

      return;
    }


    const value =
      this.pageForm.getRawValue();


    // -----------------------------------------------
    // Create Album object
    // -----------------------------------------------

    const album: Album = {

      id:
        value.id,

      name:
        value.name.trim(),

      description:
        value.description.trim(),

      // Existing image path
      coverImage:
        this.album?.coverImage ?? null,

      // New selected image
      photo:
        this.selectedFile

    };


    console.log(
      'Album from Modal:',
      album
    );


    // -----------------------------------------------
    // Send to parent
    // -----------------------------------------------

    this.save.emit(album);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.resetForm();

    this.close.emit();

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  private resetForm(): void {

    this.pageForm.reset({

      id:
        0,

      name:
        '',

      description:
        ''

    });


    this.selectedFile =
      null;


    this.imagePreview =
      null;

  }

}
