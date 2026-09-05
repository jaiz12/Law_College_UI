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
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AcademicCalendar } from '../academic-calendar.component';
import { CKEditorConfigService } from '../../../../../services/ckeditor-config.service';

@Component({
  selector: 'app-academic-calendar-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './academic-calendar-modal.component.html',
  styleUrl: './academic-calendar-modal.component.scss'
})
export class AcademicCalendarModalComponent implements OnChanges {

  public Editor: any;
  editorConfig: any;

  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);

  constructor(
    private configService: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();
  }

  // ---------------------------------------
  // Inputs / Outputs
  // ---------------------------------------

  @Input()
  academicCalendar: AcademicCalendar | null = null;

  @Output()
  save = new EventEmitter<AcademicCalendar>();

  @Output()
  close = new EventEmitter<void>();

  // ---------------------------------------
  // File Variables
  // ---------------------------------------

  selectedFile: File | null = null;
  existingFile: string | null = null;
  fileName = '';
  dragging = false;

  readonly allowedExtensions = ['.pdf'];

  // ---------------------------------------
  // Form Configuration
  // ---------------------------------------

  pageForm = this.fb.group({
    id: this.fb.control<number | null>(null),

    title: this.fb.control<string>('', {
      validators: [
        Validators.required,
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    }),

    content: this.fb.control<string>('', {
      nonNullable: true
    }),

    file: this.fb.control<string | null>(null)
  });

  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {
    return !!this.academicCalendar;
  }

  // ---------------------------------------
  // Input Changes
  // ---------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    if (this.academicCalendar) {
      this.pageForm.patchValue({
        id: this.academicCalendar.id,
        title: this.academicCalendar.title,
        content: this.academicCalendar.content ?? '',
        file: this.academicCalendar.file ?? null
      });

      this.existingFile = this.academicCalendar.file ?? null;
      this.fileName = this.getFileName(this.existingFile);
      this.selectedFile = null;

      this.pageForm.get('file')?.setErrors(null);
    } else {
      this.pageForm.reset({
        id: null,
        title: '',
        content: '',
        file: null
      });

      this.existingFile = null;
      this.fileName = '';
      this.selectedFile = null;

      this.pageForm.get('file')?.setErrors(null);
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

    this.loadFile(input.files[0]);
    input.value = '';
  }

  // ---------------------------------------
  // File Loading & Validation
  // ---------------------------------------

  loadFile(file: File): void {
    const fileControl = this.pageForm.get('file');

    if (!this.isAllowedFile(file)) {
      this.selectedFile = null;
      this.fileName = '';

      fileControl?.setErrors({
        invalidFileType: true
      });
      fileControl?.markAsTouched();
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;

    fileControl?.setValue(file.name);
    fileControl?.setErrors(null);
    fileControl?.markAsTouched();
  }

  private isAllowedFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    return this.allowedExtensions.includes(extension);
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

    if (file) {
      this.loadFile(file);
    }
  }

  // ---------------------------------------
  // Remove File
  // ---------------------------------------

  removeFile(): void {
    this.selectedFile = null;
    this.fileName = '';

    const fileControl = this.pageForm.get('file');
    fileControl?.setValue(null);

    if (!this.isEditMode) {
      this.existingFile = null;
      fileControl?.setErrors({
        required: true
      });
    } else {
      fileControl?.setErrors(null);
    }

    fileControl?.markAsTouched();
    fileControl?.updateValueAndValidity();
  }

  // ---------------------------------------
  // Helpers
  // ---------------------------------------

  private getFileName(path: string | null): string {
    if (!path) {
      return '';
    }

    return path.split('/').pop()?.split('\\').pop() ?? '';
  }

  // ---------------------------------------
  // Submit & Cancel
  // ---------------------------------------
  isSubmitting = false;
  submit(): void {
    const fileControl = this.pageForm.get('file');

    // File required on creation mode when no file is selected
    if (!this.isEditMode && !this.selectedFile) {
      fileControl?.setErrors({
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
      content: value.content,
      file: this.academicCalendar?.file ?? null,
      filePath: this.selectedFile,
      isActive: this.academicCalendar?.isActive ?? true
    });
  }

  cancel(): void {
    this.pageForm.reset();
    this.selectedFile = null;
    this.existingFile = null;
    this.fileName = '';
    this.dragging = false;
    this.close.emit();
  }
}
