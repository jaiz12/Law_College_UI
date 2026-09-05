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

  // ---------------------------------------
  // Inputs / Outputs
  // ---------------------------------------

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

  // ---------------------------------------
  // Image & Drag-and-Drop Variables
  // ---------------------------------------

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  dragging = false;

  readonly allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

  // ---------------------------------------
  // Form Configuration
  // ---------------------------------------

  pageForm = this.fb.group({
    id: this.fb.control<number | null>(null),

    title: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.maxLength(200),
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    description: this.fb.control('', {
      validators: [
        Validators.required,
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    externalUrl: this.fb.control(''),

    image: this.fb.control<string | null>(null, {
      validators: [Validators.required]
    }),

    displayOrder: this.fb.control(1, {
      validators: [
        Validators.required,
        Validators.min(1)
      ],
      nonNullable: true
    })
  });

  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {
    return !!this.recognition;
  }

  // ---------------------------------------
  // Lifecycle / Changes
  // ---------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    if (this.recognition) {
      this.pageForm.patchValue({
        id: this.recognition.id,
        title: this.recognition.title,
        description: this.recognition.description,
        externalUrl: this.recognition.externalUrl ?? '',
        image: this.recognition.image,
        displayOrder: this.recognition.displayOrder
      });

      const photoPath = this.recognition.image;

      if (photoPath) {
        this.imagePreview = this.config.get('IMAGE_API_URL') + photoPath;
        this.pageForm.get('image')?.setErrors(null);
      } else {
        this.imagePreview = null;
        this.pageForm.get('image')?.setErrors({ required: true });
      }

      this.selectedFile = null;
    } else {
      this.pageForm.reset({
        id: null,
        title: '',
        description: '',
        externalUrl: '',
        image: null,
        displayOrder: 1
      });

      this.imagePreview = null;
      this.selectedFile = null;
      this.pageForm.get('image')?.setErrors(null);
    }
  }

  // ---------------------------------------
  // File Validation & Change Handlers
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

      this.pageForm.get('image')?.setErrors({
        invalidFileType: true
      });
      this.pageForm.get('image')?.markAsTouched();

      input.value = '';
      return;
    }

    this.loadFile(file);
    input.value = '';
  }

  private isAllowedFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    return this.allowedExtensions.includes(extension);
  }

  private loadFile(file: File): void {
    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;

      this.pageForm.get('image')?.setValue(this.imagePreview);
      this.pageForm.get('image')?.setErrors(null);
    };

    reader.readAsDataURL(file);
  }

  // ---------------------------------------
  // Drag and Drop Handlers
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
      this.pageForm.get('image')?.setErrors({
        invalidFileType: true
      });
      this.pageForm.get('image')?.markAsTouched();
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

    const imageControl = this.pageForm.get('image');
    imageControl?.setValue(null);

    if (!this.isEditMode) {
      imageControl?.setErrors({
        required: true
      });
    }

    imageControl?.markAsTouched();
    imageControl?.updateValueAndValidity();
  }

  // ---------------------------------------
  // Submit & Cancel
  // ---------------------------------------
  isSubmitting = false;
  submit(): void {
    const imageControl = this.pageForm.get('image');

    if (!this.isEditMode && !this.selectedFile && !this.imagePreview) {
      imageControl?.setErrors({
        required: true
      });
    }

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const value = this.pageForm.getRawValue();

    this.save.emit({
      id: value.id ?? 0,
      title: value.title,
      description: value.description,
      externalUrl: value.externalUrl || null,
      image: this.recognition?.image ?? null,
      imageFile: this.selectedFile,
      displayOrder: value.displayOrder
    });
  }

  cancel(): void {
    this.close.emit();
  }
}
