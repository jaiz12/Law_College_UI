
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

import { InfrastructureBody } from '../infrastructure.component';
import { ConfigService } from '../../../../../services/config.service';
import { ValidationService } from '../../../../../services/validation-service.service';
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CKEditorConfigService } from '../../../../../services/ckeditor-config.service';

@Component({
  selector: 'app-infrastructure-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './infrastructure-modal.component.html',
  styleUrl: './infrastructure-modal.component.scss'
})
export class InfrastructureModalComponent
  implements OnChanges {

  // ===================================================
  // SERVICES
  // ===================================================

  private fb = inject(FormBuilder);

  private validationService =
    inject(ValidationService);

  private dublicateValidationService =
    inject(DublicateValidationService);

  constructor(
    private config: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig =
      this.ckEditorConfig.getConfig();
  }

  // ===================================================
  // CKEDITOR
  // ===================================================

  editorConfig: any;
  public Editor: any;

  // ===================================================
  // INPUT
  // ===================================================

  @Input()
  infrastructure: InfrastructureBody | null = null;

  @Input()
  infrastructures: InfrastructureBody[] = [];

  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  save = new EventEmitter<FormData>();

  @Output()
  close = new EventEmitter<void>();

  // ===================================================
  // IMAGE & DRAG/DROP
  // ===================================================

  imagePreview:
    string | ArrayBuffer | null = null;

  selectedFile:
    File | null = null;

  dragging = false;

  readonly allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp'
  ];

  readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  readonly maxFileSize =
    1 * 1024 * 1024; // 1 MB

  // ===================================================
  // FORM
  // ===================================================

  pageForm = this.fb.group(
    {
      id:
        this.fb.control<string>('', {
          nonNullable: true
        }),

      title:
        this.fb.control<string>('', {
          validators: [
            Validators.required,

            Validators.maxLength(200),

            this.dublicateValidationService.duplicateValidator(() => this.infrastructures,
              ['title']
            ),

            this.validationService
              .noWhitespaceValidator()
          ],

          nonNullable: true
        }),

      content:
        this.fb.control<string>('', {
          validators: [
            Validators.required,

            this.validationService
              .noWhitespaceValidator()
          ],

          nonNullable: true
        }),

      photo:
        this.fb.control<string | null>(
          null,
          {
            validators: [
              Validators.required
            ]
          }
        )
    }
  );

  // ===================================================
  // EDIT MODE
  // ===================================================

  get isEditMode(): boolean {
    return !!this.infrastructure;
  }

  // ===================================================
  // LIFECYCLE
  // ===================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.infrastructure) {

      this.pageForm.patchValue({

        id:
          this.infrastructure.id ?? '',

        title:
          this.infrastructure.title ?? '',

        content:
          this.infrastructure.content ?? '',

        photo:
          this.infrastructure.photo ?? ''

      });

      // ===============================================
      // EXISTING PHOTO
      // ===============================================

      const photoPath =
        this.infrastructure.photo;

      if (photoPath) {

        this.imagePreview =
          this.config.get(
            'IMAGE_API_URL'
          ) + photoPath;

        this.pageForm
          .get('photo')
          ?.setErrors(null);

      }

      else {

        this.imagePreview = null;

        this.pageForm
          .get('photo')
          ?.setErrors({
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

        id: '',

        title: '',

        content: '',

        photo: null

      });

      this.imagePreview = null;

      this.selectedFile = null;

    }

    // ===============================================
    // REVALIDATE DUPLICATE
    // ===============================================

    this.pageForm.controls.title.updateValueAndValidity();
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

  // ===================================================
  // LOAD IMAGE
  // ===================================================

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

  // ===================================================
  // DRAG OVER
  // ===================================================

  onDragOver(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = true;
  }

  // ===================================================
  // DRAG LEAVE
  // ===================================================

  onDragLeave(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = false;
  }

  // ===================================================
  // DROP
  // ===================================================

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

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;

    const photoControl =
      this.pageForm.get('photo');

    photoControl?.setValue(null);

    photoControl?.setErrors({
      required: true
    });

    photoControl?.markAsTouched();

    photoControl?.updateValueAndValidity();
  }

  // ===================================================
  // SUBMIT
  // ===================================================

  isSubmitting = false;

  submit(): void {

    const photoControl =
      this.pageForm.get('photo');

    // ===============================================
    // PHOTO REQUIRED
    // ===============================================

    if (
      !this.isEditMode &&
      !this.selectedFile &&
      !this.imagePreview
    ) {

      photoControl?.setErrors({
        required: true
      });

    }

    // ===============================================
    // REVALIDATE FORM
    // ===============================================

    this.pageForm.updateValueAndValidity();

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;
    }

    // ===============================================
    // START SUBMIT
    // ===============================================

    this.isSubmitting = true;

    const formData =
      new FormData();

    const id =
      this.pageForm.get('id')?.value;

    // ===============================================
    // ID
    // ===============================================

    if (id) {

      formData.append(
        'Id',
        id
      );

    }

    // ===============================================
    // TITLE
    // ===============================================

    formData.append(
      'Title',
      this.pageForm
        .get('title')
        ?.value
        ?.trim() ?? ''
    );

    // ===============================================
    // CONTENT
    // ===============================================

    formData.append(
      'Content',
      this.pageForm
        .get('content')
        ?.value
        ?.trim() ?? ''
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

  // ===================================================
  // CANCEL
  // ===================================================

  cancel(): void {

    this.pageForm.reset();

    this.selectedFile = null;

    this.imagePreview = null;

    this.close.emit();
  }
}

