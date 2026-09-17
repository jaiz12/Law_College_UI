
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
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { ConfigService } from '../../../../../services/config.service';
import { ValidationService } from '../../../../../services/validation-service.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { StatutoryBodiesBody } from '../statutory-bodies.component';
import { CKEditorConfigService } from '../../../../../services/ckeditor-config.service';
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';

@Component({
  selector: 'app-statutory-bodies-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './statutory-bodies-modal.component.html',
  styleUrl: './statutory-bodies-modal.component.scss'
})
export class StatutoryBodiesModalComponent implements OnChanges {

  editorConfig: any;
  public Editor: any;

  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);

  private dublicateValidationService =
    inject(DublicateValidationService);

  constructor(
    private config: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();
  }

  // =========================================================
  // INPUT / OUTPUT
  // =========================================================

  @Input()
  statutorybody: StatutoryBodiesBody | null = null;

  @Input()
  statutorybodies: StatutoryBodiesBody[] = [];

  @Output()
  save = new EventEmitter<FormData>();

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

    id: this.fb.control<string>('', {
      nonNullable: true
    }),

    title: this.fb.control<string>('', {
      validators: [
        Validators.required,
        Validators.maxLength(200),
        this.validationService.noWhitespaceValidator(),

        this.dublicateValidationService.duplicateValidator(
          () => this.statutorybodies,
          ['title']
        )
      ],
      nonNullable: true
    }),

    content: this.fb.control<string>('', {
      validators: [
        Validators.required,
        Validators.maxLength(1000),
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    photo: this.fb.control<string | null>(null, {
      validators: [
        Validators.required
      ]
    })

  });

  // =========================================================
  // EDIT MODE
  // =========================================================

  get isEditMode(): boolean {
    return !!this.statutorybody;
  }

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (this.statutorybody) {

      // ===============================================
      // EDIT MODE
      // ===============================================

      this.pageForm.patchValue({
        id: this.statutorybody.id ?? '',
        title: this.statutorybody.title ?? '',
        content: this.statutorybody.content ?? '',
        photo: this.statutorybody.photo ?? ''
      });

      const photoPath = this.statutorybody.photo;

      if (photoPath) {

        this.imagePreview =
          this.config.get('IMAGE_API_URL') + photoPath;

        // Existing image is valid in edit mode
        this.pageForm.get('photo')?.setErrors(null);

      } else {

        this.imagePreview = null;

        this.pageForm.get('photo')?.setErrors({
          required: true
        });

      }

      this.selectedFile = null;

    } else {

      // ===============================================
      // CREATE MODE
      // ===============================================

      this.pageForm.reset({
        id: '',
        title: '',
        content: '',
        photo: null
      });

      this.imagePreview = null;
      this.selectedFile = null;

    }

    // ===============================================
    // REVALIDATE DUPLICATE TITLE
    // ===============================================

    this.pageForm.controls.title.updateValueAndValidity();
  }

  // =========================================================
  // FILE CHANGE
  // =========================================================

  onFileChange(event: Event): void {

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
        .get('photo')
        ?.setErrors({
          [error]: true
        });

      this.pageForm
        .get('photo')
        ?.markAsTouched();

      input.value = '';

      return;
    }

    this.loadFile(file);

    input.value = '';
  }

  // =========================================================
  // FILE VALIDATION
  // =========================================================

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

  private loadFile(file: File): void {

    this.selectedFile = file;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

      this.pageForm
        .get('photo')
        ?.setValue(
          this.imagePreview
        );

      this.pageForm
        .get('photo')
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

  onDrop(event: DragEvent): void {

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
        .get('photo')
        ?.setErrors({
          [error]: true
        });

      this.pageForm
        .get('photo')
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

    const photoControl =
      this.pageForm.get('photo');

    photoControl?.setValue(null);

    // Image is required after removal,
    // including edit mode.
    photoControl?.setErrors({
      required: true
    });

    photoControl?.markAsTouched();

    photoControl?.updateValueAndValidity();
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  isSubmitting = false;

  submit(): void {

    const photoControl =
      this.pageForm.get('photo');

    // ===============================================
    // IMAGE REQUIRED
    // ===============================================

    if (
      !this.selectedFile &&
      !this.imagePreview
    ) {

      photoControl?.setErrors({
        required: true
      });

    }

    // ===============================================
    // REVALIDATE DUPLICATE TITLE
    // ===============================================

    this.pageForm
      .get('title')
      ?.updateValueAndValidity();

    // ===============================================
    // FORM VALIDATION
    // ===============================================

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;
    }

    // ===============================================
    // START SUBMITTING
    // ===============================================

    this.isSubmitting = true;

    const formData =
      new FormData();

    const value =
      this.pageForm.getRawValue();

    // ===============================================
    // ID
    // ===============================================

    if (value.id) {

      formData.append(
        'Id',
        value.id
      );

    }

    // ===============================================
    // TITLE
    // ===============================================

    formData.append(
      'Title',
      value.title.trim()
    );

    // ===============================================
    // CONTENT
    // ===============================================

    formData.append(
      'Content',
      value.content.trim()
    );

    // ===============================================
    // PHOTO
    // ===============================================

    if (this.selectedFile) {

      formData.append(
        'Photo',
        this.selectedFile,
        this.selectedFile.name
      );

    }

    this.save.emit(formData);
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

