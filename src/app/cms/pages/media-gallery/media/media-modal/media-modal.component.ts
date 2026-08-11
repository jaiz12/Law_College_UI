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
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ValidationService } from '../../../../../services/validation-service.service';
import { Media } from '../media.component';


@Component({
  selector: 'app-media-modal',

  standalone: true,

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

  private fb =
    inject(FormBuilder);

  private validationService =
    inject(ValidationService);

  // ---------------------------------------
  // Input / Output
  // ---------------------------------------

  @Input()
  media: Media | null = null;

  @Output()
  save =
    new EventEmitter<Media>();

  @Output()
  close =
    new EventEmitter<void>();

  // ---------------------------------------
  // File
  // ---------------------------------------

  selectedFile:
    File | null = null;

  preview:
    string | null = null;

  dragging = false;

  // ---------------------------------------
  // Form
  // ---------------------------------------

  pageForm =
    this.fb.group({

      id:
        this.fb.control<number>(
          0,
          {
            nonNullable: true
          }
        ),

      type:
        this.fb.control<
          'photo' | 'video'
        >(
          'photo',
          {
            validators: [
              Validators.required
            ],

            nonNullable: true
          }
        ),

      title:
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
            nonNullable: true
          }
        )
    });

  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {
    return !!this.media;
  }

  // ---------------------------------------
  // Input Changes
  // ---------------------------------------

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.media) {

      this.pageForm.patchValue({

        id:
          this.media.id,

        type:
          this.media.type,

        title:
          this.media.title,

        description:
          this.media.description

      });

      this.preview =
        this.media.file || null;

      this.selectedFile = null;

      this.dragging = false;

    } else {

      this.pageForm.reset({

        id: 0,

        type: 'photo',

        title: '',

        description: ''

      });

      this.preview = null;

      this.selectedFile = null;

      this.dragging = false;
    }
  }

  // ---------------------------------------
  // File Change
  // ---------------------------------------

  onFileChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.loadFile(
      input.files[0]
    );
  }

  // ---------------------------------------
  // Load File
  // ---------------------------------------

  loadFile(
    file: File
  ): void {

    const type =
      this.pageForm.controls.type.value;

    if (
      type === 'photo' &&
      !file.type.startsWith('image/')
    ) {

      return;
    }

    if (
      type === 'video' &&
      !file.type.startsWith('video/')
    ) {

      return;
    }

    this.selectedFile = file;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.preview =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // ---------------------------------------
  // Drag Over
  // ---------------------------------------

  onDragOver(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = true;
  }

  // ---------------------------------------
  // Drag Leave
  // ---------------------------------------

  onDragLeave(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;
  }

  // ---------------------------------------
  // Drop
  // ---------------------------------------

  onDrop(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;

    const file =
      event.dataTransfer?.files[0];

    if (file) {
      this.loadFile(file);
    }
  }

  // ---------------------------------------
  // Type Change
  // ---------------------------------------

  onTypeChange(): void {

    this.selectedFile = null;

    this.preview = null;
  }

  // ---------------------------------------
  // Submit
  // ---------------------------------------

  submit(): void {

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;
    }

    // New media must have a file

    if (
      !this.isEditMode &&
      !this.selectedFile
    ) {

      return;
    }

    const value =
      this.pageForm.getRawValue();

    const item: Media = {

      id:
        value.id,

      albumId:
        this.media?.albumId ?? 0,

      type:
        value.type,

      title:
        value.title.trim(),

      description:
        value.description.trim(),

      file:
        this.media?.file ?? '',

      selectedFile:
        this.selectedFile

    };

    this.save.emit(item);
  }

  // ---------------------------------------
  // Cancel
  // ---------------------------------------

  cancel(): void {

    this.close.emit();
  }

}
