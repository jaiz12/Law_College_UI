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
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ValidationService } from '../../../../../services/validation-service.service';
import { RecognitionAffiliation } from '../recognitions-and-affiliations.component';
import { ConfigService } from '../../../../../services/config.service';
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';

@Component({
  selector: 'app-recognitions-and-affiliations-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './recognitions-and-affiliations-modal.component.html',
  styleUrl: './recognitions-and-affiliations-modal.component.scss'
})
export class RecognitionsAndAffiliationsModalComponent implements OnChanges {

  constructor(private config: ConfigService) { }

  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);

  private dublicateValidationService =
    inject(DublicateValidationService);

  // =========================================================
  // INPUT / OUTPUT
  // =========================================================

  @Input()
  recognition: RecognitionAffiliation | null = null;

  @Input()
  recognitions: RecognitionAffiliation[] = [];

  @Input()
  imageURL = '';

  @Output()
  save = new EventEmitter<RecognitionAffiliation>();

  @Output()
  close = new EventEmitter<void>();

  // =========================================================
  // IMAGE
  // =========================================================

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  dragging = false;

  readonly allowedExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp'
  ];

  readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  readonly maxFileSize = 1 * 1024 * 1024; // 1 MB

  // =========================================================
  // FORM
  // =========================================================

  pageForm = this.fb.group({

    id: this.fb.control<number | null>(null),

    title: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.maxLength(200),
        this.validationService.noWhitespaceValidator(),
        this.dublicateValidationService.duplicateValidator(() => this.recognitions,
          ['title']
        ),
      ],
      nonNullable: true
    }),

    description: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.maxLength(1000),
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    externalUrl: this.fb.control('', {
      validators: [
        this.validationService.noWhitespaceValidator(),
        this.urlValidator()
      ],
      nonNullable: true
    }),

    image: this.fb.control<string | null>(null, {
      validators: [
        Validators.required
      ]
    }),

    displayOrder: this.fb.control(1, {
      validators: [
        Validators.required,
        Validators.min(1)
      ],
      nonNullable: true
    })

  });

  // =========================================================
  // EDIT MODE
  // =========================================================

  get isEditMode(): boolean {
    return !!this.recognition;
  }

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.recognition) {

      this.pageForm.patchValue({
        id: this.recognition.id,
        title: this.recognition.title ?? '',
        description: this.recognition.description ?? '',
        externalUrl: this.recognition.externalUrl ?? '',
        image: this.recognition.image,
        displayOrder: this.recognition.displayOrder
      });

      const photoPath = this.recognition.image;

      if (photoPath) {

        this.imagePreview =
          this.config.get('IMAGE_API_URL') + photoPath;

        this.pageForm.get('image')?.setErrors(null);

      } else {

        this.imagePreview = null;

        this.pageForm.get('image')?.setErrors({
          required: true
        });

      }

      this.selectedFile = null;


    }

    else {

      // ===============================================
      // CREATE MODE
      // ===============================================

      this.pageForm.reset({
        id: null,
        title: '',
        description: '',
        externalUrl: '',
        image: null,
        displayOrder: 0
      });

      this.imagePreview = null;

      this.selectedFile = null;

    }

    // ===============================================
    // REVALIDATE DUPLICATE
    // ===============================================

    this.pageForm.controls.title.updateValueAndValidity();
  }

 

  // =========================================================
  // URL VALIDATION
  // =========================================================

  private urlValidator() {

    return (control: any) => {

      const value = control.value?.trim();

      // URL is optional
      if (!value) {
        return null;
      }

      // No whitespace anywhere
      if (/\s/.test(value)) {
        return {
          urlWhitespace: true
        };
      }

      const urlPattern =
        /^https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?::\d+)?(?:[/?#][^\s]*)?$/;

      if (!urlPattern.test(value)) {
        return {
          invalidUrl: true
        };
      }

      return null;

    };

  }

  // =========================================================
  // FILE CHANGE
  // =========================================================

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

    const error =
      this.validateFile(file);

    if (error) {

      this.selectedFile = null;

      this.imagePreview = null;

      this.pageForm
        .get('image')
        ?.setErrors({
          [error]: true
        });

      this.pageForm
        .get('image')
        ?.markAsTouched();

      input.value = '';

      return;
    }

    this.loadFile(file);

    input.value = '';
  }

  // ===================================================
  // FILE VALIDATION
  // ===================================================

  private validateFile(
    file: File
  ):
    'invalidFileType'
    | 'fileTooLarge'
    | null {

    const fileName =
      file.name.toLowerCase();

    const extension =
      fileName.substring(
        fileName.lastIndexOf('.')
      );

    const validExtension =
      this.allowedExtensions.includes(
        extension
      );

    const validMimeType =
      this.allowedMimeTypes.includes(
        file.type
      );

    // ===============================================
    // FILE TYPE
    // ===============================================

    if (
      !validExtension ||
      !validMimeType
    ) {

      return 'invalidFileType';

    }

    // ===============================================
    // FILE SIZE
    // ===============================================

    if (
      file.size > this.maxFileSize
    ) {

      return 'fileTooLarge';

    }

    return null;
  }

  // =========================================================
  // LOAD IMAGE
  // =========================================================

  loadFile(
    file: File
  ): void {

    this.selectedFile = file;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

      this.pageForm
        .get('image')
        ?.setValue(
          this.imagePreview
        );

      this.pageForm
        .get('image')
        ?.setErrors(null);

    };

    reader.readAsDataURL(file);
  }

  // =========================================================
  // DRAG & DROP
  // =========================================================

  onDragOver(event: DragEvent): void {

    event.preventDefault();

    this.dragging = true;

  }

  onDragLeave(event: DragEvent): void {

    event.preventDefault();

    this.dragging = false;

  }

  onDrop(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;

    const file =
      event.dataTransfer
        ?.files?.[0];

    if (!file) {
      return;
    }

    const error =
      this.validateFile(file);

    if (error) {

      this.selectedFile = null;

      this.imagePreview = null;

      this.pageForm
        .get('image')
        ?.setErrors({
          [error]: true
        });

      this.pageForm
        .get('image')
        ?.markAsTouched();

      return;
    }

    this.loadFile(file);
  }

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  removeImage(): void {

    this.selectedFile = null;
    this.imagePreview = null;

    const imageControl =
      this.pageForm.get('image');

    imageControl?.setValue(null);

    // Image is required after removal,
    // including edit mode.
    imageControl?.setErrors({
      required: true
    });

    imageControl?.markAsTouched();

    imageControl?.updateValueAndValidity();

  }

  // =========================================================
  // SUBMIT
  // =========================================================

  isSubmitting = false;

  submit(): void {

    const imageControl =
      this.pageForm.get('image');

    // Image required if there is no existing/new image
    if (!this.selectedFile && !this.imagePreview) {

      imageControl?.setErrors({
        required: true
      });

    }

    // Re-check duplicate title
    this.pageForm.get('title')?.updateValueAndValidity();

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }

    this.isSubmitting = true;

    const value =
      this.pageForm.getRawValue();

    this.save.emit({

      id: value.id ?? 0,

      title: value.title.trim(),

      description: value.description.trim(),

      externalUrl:
        value.externalUrl.trim() || null,

      image:
        this.recognition?.image ?? null,

      imageFile:
        this.selectedFile,

      displayOrder:
        value.displayOrder

    });
    setTimeout(() => {
      this.isSubmitting = false;
    }, 5000);

  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    this.close.emit();

  }

}
