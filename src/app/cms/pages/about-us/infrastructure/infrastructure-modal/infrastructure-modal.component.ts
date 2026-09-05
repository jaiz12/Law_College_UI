import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InfrastructureBody } from '../infrastructure.component';
import { ConfigService } from '../../../../../services/config.service';
import { ValidationService } from '../../../../../services/validation-service.service';
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
export class InfrastructureModalComponent implements OnChanges {

  editorConfig: any;
  public Editor: any;

  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);

  constructor(
    private config: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {
    // CKEditor build
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();
  }

  // ---------------------------------------
  // Input / Output
  // ---------------------------------------

  @Input()
  infrastructure: InfrastructureBody | null = null;

  @Output()
  save = new EventEmitter<FormData>();

  @Output()
  close = new EventEmitter<void>();

  // ---------------------------------------
  // File Variables
  // ---------------------------------------

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  dragging = false;

  readonly allowedExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp'
  ];

  // ---------------------------------------
  // Form
  // ---------------------------------------

  pageForm = this.fb.group({
    id: this.fb.control<string>('', {
      nonNullable: true
    }),

    title: this.fb.control<string>('', {
      validators: [
        Validators.required,
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    content: this.fb.control<string>('', {
      validators: [
        Validators.required,
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

  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {
    return !!this.infrastructure;
  }

  // ---------------------------------------
  // Input Changes
  // ---------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    if (this.infrastructure) {
      this.pageForm.patchValue({
        id: this.infrastructure.id ?? '',
        title: this.infrastructure.title ?? '',
        content: this.infrastructure.content ?? '',
        photo: this.infrastructure.photo ?? ''
      });

      const photoPath = this.infrastructure.photo;

      if (photoPath) {
        this.imagePreview = this.config.get('IMAGE_API_URL') + photoPath;
        // Existing photo is valid during edit
        this.pageForm.get('photo')?.setErrors(null);
      } else {
        this.imagePreview = null;
        this.pageForm.get('photo')?.setErrors({ required: true });
      }

      this.selectedFile = null;
    } else {
      this.pageForm.reset({
        id: '',
        title: '',
        content: '',
        photo: ''
      });

      this.imagePreview = null;
      this.selectedFile = null;

      this.pageForm.get('photo')?.setErrors(null);
    }
  }

  // ---------------------------------------
  // File Selection
  // ---------------------------------------

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    if (!this.isAllowedFile(file)) {
      this.selectedFile = null;
      this.imagePreview = null;

      this.pageForm.get('photo')?.setErrors({
        invalidFileType: true
      });

      this.pageForm.get('photo')?.markAsTouched();

      input.value = '';
      return;
    }

    this.loadFile(file);
    input.value = '';
  }

  // ---------------------------------------
  // File Validation
  // ---------------------------------------

  private isAllowedFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    return this.allowedExtensions.includes(extension);
  }

  // ---------------------------------------
  // Load Image
  // ---------------------------------------

  loadFile(file: File): void {
    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;

      this.pageForm.get('photo')?.setValue(this.imagePreview);
      this.pageForm.get('photo')?.setErrors(null);
    };

    reader.readAsDataURL(file);
  }

  // ---------------------------------------
  // Drag & Drop
  // ---------------------------------------

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

    const file = event.dataTransfer?.files?.[0];

    if (!file) {
      return;
    }

    if (!this.isAllowedFile(file)) {
      this.pageForm.get('photo')?.setErrors({
        invalidFileType: true
      });

      this.pageForm.get('photo')?.markAsTouched();
      return;
    }

    this.loadFile(file);
  }

  // ---------------------------------------
  // Remove Image
  // ---------------------------------------

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;

    const photoControl = this.pageForm.get('photo');
    photoControl?.setValue(null);

    // Required when not in edit mode or when existing image is removed
    if (!this.isEditMode) {
      photoControl?.setErrors({
        required: true
      });
    }

    photoControl?.markAsTouched();
    photoControl?.updateValueAndValidity();
  }

  // ---------------------------------------
  // Submit
  // ---------------------------------------
  isSubmitting = false;
  submit(): void {
    const photoControl = this.pageForm.get('photo');

    // Required only when creating with no file or preview
    if (!this.isEditMode && !this.selectedFile && !this.imagePreview) {
      photoControl?.setErrors({
        required: true
      });
    }

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = new FormData();
    const id = this.pageForm.get('id')?.value;

    // Id
    if (id) {
      formData.append('Id', id);
    }

    // Title
    formData.append(
      'Title',
      this.pageForm.get('title')?.value ?? ''
    );

    // Content
    formData.append(
      'Content',
      this.pageForm.get('content')?.value ?? ''
    );

    // Photo
    if (this.selectedFile) {
      formData.append(
        'Photo',
        this.selectedFile,
        this.selectedFile.name
      );
    }

    this.save.emit(formData);
  }

  // ---------------------------------------
  // Cancel
  // ---------------------------------------

  cancel(): void {
    this.pageForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.close.emit();
  }
}
