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
import { ConfigService } from '../../../../../services/config.service';
import { ValidationService } from '../../../../../services/validation-service.service';
import { OrganizationMember } from '../faculty.component';

@Component({
  selector: 'app-faculty-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './faculty-modal.component.html',
  styleUrl: './faculty-modal.component.scss'
})
export class FacultyModalComponent implements OnChanges {
  constructor(private config: ConfigService) { }

  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);

  @Input()
  member: OrganizationMember | null = null;

  @Input()
  members: OrganizationMember[] = [];

  @Output()
  save = new EventEmitter<OrganizationMember>();

  @Output()
  close = new EventEmitter<void>();

  // ===================================================
  // IMAGE & DRAG-AND-DROP
  // ===================================================

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  dragging = false;

  readonly allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

  // ===================================================
  // FORM
  // ===================================================

  pageForm = this.fb.group({
    id: this.fb.control<number | null>(null),

    name: this.fb.control('', {
      validators: [
        Validators.required,
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    designation: this.fb.control('', {
      validators: [
        Validators.required,
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    email: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.email,
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    phone: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]{10}$/),
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    parentId: this.fb.control<number | null>(null),

    photo: this.fb.control<string | null>(null, {
      validators: [Validators.required]
    }),

    displayOrder: this.fb.control(1, {
      validators: [Validators.required, Validators.min(1)],
      nonNullable: true
    })
  });

  get isEditMode(): boolean {
    return !!this.member;
  }

  // ===================================================
  // LIFECYCLE
  // ===================================================

  ngOnChanges(changes: SimpleChanges): void {
    if (this.member) {
      this.pageForm.patchValue({
        id: this.member.id,
        name: this.member.name,
        designation: this.member.designation,
        email: this.member.email,
        phone: this.member.phone,
        parentId: this.member.parentId,
        photo: this.member.photo,
        displayOrder: this.member.displayOrder
      });

      const photoPath = this.member.photo;

      if (photoPath) {
        this.imagePreview =
          this.config.get('IMAGE_API_URL') + photoPath;
        this.pageForm.get('photo')?.setErrors(null);
      } else {
        this.imagePreview = null;
        this.pageForm.get('photo')?.setErrors({ required: true });
      }

      this.selectedFile = null;
    } else {
      this.pageForm.reset({
        id: null,
        name: '',
        designation: '',
        email: '',
        phone: '',
        parentId: null,
        photo: null,
        displayOrder: 1
      });

      this.imagePreview = null;
      this.selectedFile = null;
      this.pageForm.get('photo')?.setErrors(null);
    }
  }

  // ===================================================
  // INPUT HANDLERS
  // ===================================================

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = value;

    this.pageForm.get('phone')?.setValue(value, { emitEvent: false });
  }

  // ===================================================
  // FILE CHANGE & VALIDATION
  // ===================================================

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

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;

      this.pageForm.get('photo')?.setValue(this.imagePreview);
      this.pageForm.get('photo')?.setErrors(null);
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  private isAllowedFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    return this.allowedExtensions.includes(extension);
  }

  // ===================================================
  // DRAG AND DROP HANDLERS
  // ===================================================

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

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;

      this.pageForm.get('photo')?.setValue(this.imagePreview);
      this.pageForm.get('photo')?.setErrors(null);
    };

    reader.readAsDataURL(file);
  }

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;

    const photoControl = this.pageForm.get('photo');
    photoControl?.setValue(null);

    if (!this.isEditMode) {
      photoControl?.setErrors({
        required: true
      });
    }

    photoControl?.markAsTouched();
    photoControl?.updateValueAndValidity();
  }

  // ===================================================
  // SUBMIT & CANCEL
  // ===================================================

  isSubmitting = false;
  submit(): void {

    const photoControl = this.pageForm.get('photo');

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
    const value = this.pageForm.getRawValue();

    this.save.emit({
      id: value.id ?? 0,
      name: value.name,
      designation: value.designation,
      email: value.email,
      phone: value.phone,
      parentId: value.parentId,
      photo: this.member?.photo ?? null,
      photoFile: this.selectedFile,
      displayOrder: value.displayOrder
    });
  }

  cancel(): void {
    this.close.emit();
  }
}
