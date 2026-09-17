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
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';

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

  private dublicateValidationService =
    inject(DublicateValidationService);

  constructor(
    private configService: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();
  }

  // =========================================
  // Inputs / Outputs
  // =========================================

  @Input()
  academicCalendar: AcademicCalendar | null = null;

  @Input()
  academicCalendars: AcademicCalendar[] = [];

  @Output()
  save = new EventEmitter<AcademicCalendar>();

  @Output()
  close = new EventEmitter<void>();


  // =========================================
  // File Variables
  // =========================================

  selectedFile: File | null = null;

  existingFile: string | null = null;

  fileName = '';

  dragging = false;

  readonly allowedExtensions = ['.pdf'];

  readonly allowedMimeTypes = [
    'application/pdf'
  ];

  readonly maxFileSize = 5 * 1024 * 1024; // 5 MB


  // =========================================
  // Form Configuration
  // =========================================

  pageForm = this.fb.group({

    id: this.fb.control<number | null>(null),

    title: this.fb.control<string>('', {
      validators: [
        Validators.required,

        Validators.maxLength(100),

        this.validationService.noWhitespaceValidator(),

        this.dublicateValidationService.duplicateValidator(
          () => this.academicCalendars,
          ['title']
        )
      ],

      nonNullable: true
    }),

    content: this.fb.control<string>('', {
      nonNullable: true
    }),

    file: this.fb.control<string | null>(null)

  });


  // =========================================
  // Edit Mode
  // =========================================

  get isEditMode(): boolean {
    return !!this.academicCalendar;
  }


  // =========================================
  // Input Changes
  // =========================================

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['academicCalendars']) {
      this.pageForm.get('title')?.updateValueAndValidity();
    }

    if (this.academicCalendar) {

      this.pageForm.patchValue({

        id: this.academicCalendar.id,

        title: this.academicCalendar.title,

        content: this.academicCalendar.content ?? '',

        file: this.academicCalendar.file ?? null

      });

      this.existingFile =
        this.academicCalendar.file ?? null;

      this.fileName =
        this.getFileName(this.existingFile);

      this.selectedFile = null;

      this.pageForm.get('file')?.setErrors(null);

      this.pageForm.get('title')?.updateValueAndValidity();

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


  // =========================================
  // File Selection
  // =========================================

  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.loadFile(input.files[0]);

    input.value = '';
  }


  // =========================================
  // File Loading & Validation
  // =========================================

  loadFile(file: File): void {

    const fileControl =
      this.pageForm.get('file');

    const validationError =
      this.validateFile(file);

    if (validationError) {

      this.selectedFile = null;

      this.fileName = '';

      fileControl?.setErrors(validationError);

      fileControl?.markAsTouched();

      return;
    }

    this.selectedFile = file;

    this.fileName = file.name;

    fileControl?.setValue(file.name);

    fileControl?.setErrors(null);

    fileControl?.markAsTouched();

    /*
     * New file has been selected.
     * Existing file is no longer the file
     * being submitted.
     */
    this.existingFile = null;
  }


  // =========================================
  // Complete File Validation
  // =========================================

  private validateFile(file: File): { [key: string]: boolean } | null {

    const fileName =
      file.name.trim().toLowerCase();

    const extension =
      fileName.substring(
        fileName.lastIndexOf('.')
      );

    // -------------------------------
    // Extension validation
    // -------------------------------

    if (!this.allowedExtensions.includes(extension)) {

      return {
        invalidFileType: true
      };
    }


    // -------------------------------
    // MIME type validation
    // -------------------------------

    if (!this.allowedMimeTypes.includes(file.type)) {

      return {
        invalidFileType: true
      };
    }


    // -------------------------------
    // File size validation
    // -------------------------------

    if (file.size > this.maxFileSize) {

      return {
        maxFileSize: true
      };
    }


    return null;
  }


  // =========================================
  // Drag & Drop
  // =========================================

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
      event.dataTransfer?.files?.[0];

    if (file) {

      this.loadFile(file);
    }
  }


  // =========================================
  // Remove File
  // =========================================

  removeFile(): void {

    this.selectedFile = null;

    this.fileName = '';

    const fileControl =
      this.pageForm.get('file');

    fileControl?.setValue(null);


    /*
     * Creation:
     * File is required.
     */
    if (!this.isEditMode) {

      this.existingFile = null;

      fileControl?.setErrors({
        required: true
      });

    } else {

      /*
       * Editing:
       * If existing file was removed,
       * require a replacement file.
       */
      this.existingFile = null;

      fileControl?.setErrors({
        required: true
      });
    }

    fileControl?.markAsTouched();

    fileControl?.updateValueAndValidity();
  }


  // =========================================
  // Helpers
  // =========================================

  private getFileName(path: string | null): string {

    if (!path) {
      return '';
    }

    return path
      .split('/')
      .pop()
      ?.split('\\')
      .pop() ?? '';
  }


  // =========================================
  // Submit
  // =========================================

  isSubmitting = false;

  submit(): void {

    const fileControl =
      this.pageForm.get('file');


    // =====================================
    // TITLE VALIDATION
    // =====================================

    const titleControl =
      this.pageForm.get('title');

    titleControl?.markAsTouched();

    titleControl?.updateValueAndValidity();


    // =====================================
    // FILE VALIDATION
    // =====================================

    /*
     * Create:
     * A file is mandatory.
     *
     * Edit:
     * Existing file OR newly selected file
     * must be available.
     */
    if (!this.selectedFile && !this.existingFile) {

      fileControl?.setErrors({
        required: true
      });

      fileControl?.markAsTouched();
    }


    // =====================================
    // FORM INVALID
    // =====================================

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;
    }


    // =====================================
    // START SUBMIT
    // =====================================

    this.isSubmitting = true;

    const value =
      this.pageForm.getRawValue();


    // =====================================
    // SAVE MODEL
    // =====================================

    this.save.emit({

      id: value.id ?? 0,

      title: value.title.trim(),

      content: value.content,

      /*
       * Keep existing file when no new file
       * has been selected.
       */
      file: this.existingFile,

      /*
       * New file if selected.
       */
      filePath: this.selectedFile,

      isActive:
        this.academicCalendar?.isActive ?? true
    });


    /*
     * Parent component should ideally
     * reset isSubmitting after API response.
     *
     * This timeout is only a fallback.
     */
    setTimeout(() => {

      this.isSubmitting = false;

    }, 5000);
  }


  // =========================================
  // Cancel
  // =========================================

  cancel(): void {

    this.pageForm.reset();

    this.selectedFile = null;

    this.existingFile = null;

    this.fileName = '';

    this.dragging = false;

    this.close.emit();
  }
}
