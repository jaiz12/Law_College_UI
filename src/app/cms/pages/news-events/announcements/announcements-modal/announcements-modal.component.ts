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
    AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { ValidationService } from '../../../../../services/validation-service.service';

import { Announcements } from '../announcements.component';
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';


@Component({
  selector: 'app-announcements-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './announcements-modal.component.html',
  styleUrl: './announcements-modal.component.scss'
})
export class AnnouncementsModalComponent implements OnChanges {

  // ===================================================
  // SERVICES
  // ===================================================

  private fb = inject(FormBuilder);

  private validationService = inject(ValidationService);
  private dublicateValidationService =
    inject(DublicateValidationService);

  // ===================================================
  // INPUT
  // ===================================================

  @Input()
  announcements: Announcements | null = null;

  @Input()
  items: Announcements [] = [];


  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  save = new EventEmitter<Announcements>();


  @Output()
  close = new EventEmitter<void>();


  // ===================================================
  // FILE
  // ===================================================

  selectedFile: File | null = null;

  existingFile: string | null = null;

  fileName = '';

  dragging = false;


  // ===================================================
  // ALLOWED FILE TYPES
  // ===================================================

  readonly allowedExtensions = ['.pdf'];

  readonly allowedMimeTypes = [
    'application/pdf'
  ];

  readonly maxFileSize = 5 * 1024 * 1024; // 5 MB


  // ===================================================
  // FORM
  // ===================================================

  pageForm = this.fb.group({

    id: this.fb.control<number | null>(null),

    title: this.fb.control<string>(
      '',
      {
        validators: [
          Validators.required,

          Validators.maxLength(2500),

          this.validationService.noWhitespaceValidator(),
        ],
        nonNullable: true
      }
    ),

    category: this.fb.control<string>(
      '',
      {
        validators: [
          Validators.required,
          this.validationService.noWhitespaceValidator()
        ],
        nonNullable: true
      }
    ),

    startDate: this.fb.control<string>(
      '',
      {
        validators: [
          Validators.required
        ],
        nonNullable: true
      }
    ),

    endDate: this.fb.control<string>(
      '',
      {
        nonNullable: true
      }
    ),

    file: this.fb.control<string | null>(
      null,
      {
        validators: [
          Validators.required
        ]
      }
    )

  },

    {

      // =================================================
      // NAME + PHONE COMBINATION DUPLICATE
      // =================================================

      validators: [

        this.dublicateValidationService
          .duplicateCombinationValidator(
            () => this.items,
            ['startDate', 'category', 'title']
        ),

        // Start Date / End Date validation
        this.endDateValidator()

      ]

    });


  // ===================================================
  // EDIT MODE
  // ===================================================

  get isEditMode(): boolean {
    return !!this.announcements;
  }


  // ===================================================
  // INPUT CHANGES
  // ===================================================

  ngOnChanges(changes: SimpleChanges): void {
    

    console.log(this.items, this.announcements)
    if (this.announcements) {

      this.pageForm.patchValue({

        id: this.announcements.id,

        title: this.announcements.title,

        category:
          this.announcements.category ?? '',

        startDate:
          this.formatDateForInput(
            this.announcements.startDate
          ),

        endDate:
          this.formatDateForInput(
            this.announcements.endDate
          ),

        file:
          this.announcements.file ?? null

      });


      this.existingFile =
        this.announcements.file ?? null;


      this.fileName =
        this.getFileName(
          this.existingFile
        );


      this.selectedFile = null;


      this.pageForm
        .get('file')
        ?.setErrors(null);

    }

    else {

      this.pageForm.reset({

        id: null,

        title: '',

        category: '',

        startDate: '',

        endDate: '',

        file: null

      });


      this.existingFile = null;

      this.fileName = '';

      this.selectedFile = null;

      this.pageForm
        .get('file')
        ?.setErrors(null);


    }

    // ===================================================
    // REVALIDATE AFTER PATCH
    // ===================================================

    this.pageForm.updateValueAndValidity({
      emitEvent: false
    }); 

  }


  // ===================================================
  // DATE FORMAT
  // ===================================================

  private formatDateForInput(
    date: string | null
  ): string {

    if (!date) {
      return '';
    }

    // Handles:
    // 2026-09-03 00:00:00
    // 2026-09-03T00:00:00
    // 2026-09-03
    const datePart = date
      .toString()
      .split('T')[0]
      .split(' ')[0];

    // Validate YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return '';
    }

    return datePart;
  }


  private endDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;

      // End date is optional
      if (!startDate || !endDate) {
        return null;
      }

      // Compare YYYY-MM-DD directly
      if (endDate < startDate) {
        return {
          endDateBeforeStartDate: true
        };
      }

      return null;
    };
  }

  // ===================================================
  // FILE CHANGE
  // ===================================================


  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.loadFile(input.files[0]);

    input.value = '';
  }


  // ===================================================
  // LOAD FILE
  // ===================================================

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


  // ===================================================
  // FILE VALIDATION
  // ===================================================

  // ===================================================
  // FILE VALIDATION
  // ===================================================

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





  // ===================================================
  // DRAG OVER
  // ===================================================

  onDragOver(event: DragEvent): void {

    event.preventDefault();

    this.dragging = true;

  }


  // ===================================================
  // DRAG LEAVE
  // ===================================================

  onDragLeave(event: DragEvent): void {

    event.preventDefault();

    this.dragging = false;

  }


  // ===================================================
  // DROP
  // ===================================================

  onDrop(event: DragEvent): void {

    event.preventDefault();

    this.dragging = false;


    const file =
      event.dataTransfer?.files?.[0];


    if (!file) {
      return;
    }


    this.loadFile(file);

  }


  // ===================================================
  // REMOVE FILE
  // ===================================================

  removeFile(): void {

    this.selectedFile = null;

    this.fileName = '';

    this.existingFile = null;


    const fileControl =
      this.pageForm.get('file');

    fileControl?.setValue(null);

    fileControl?.setErrors(null);

  }


  // ===================================================
  // FILE NAME
  // ===================================================

  private getFileName(
    path: string | null
  ): string {

    if (!path) {
      return '';
    }

    return path
      .split('/')
      .pop()
      ?.split('\\')
      .pop()
      ?? '';

  }


  // ===================================================
  // SUBMIT
  // ===================================================
  isSubmitting = false;
  submit(): void {

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }

    this.isSubmitting = true;


    const value =
      this.pageForm.getRawValue();


    this.save.emit({

      id:
        value.id ?? 0,

      title:
        value.title.trim(),

      category:
        value.category.trim(),

      startDate:
        value.startDate,

      endDate:
        value.endDate || null,

      file:
        this.existingFile,

      filePath:
        this.selectedFile,

      urgent:
        this.announcements?.urgent ?? false,

      isActive: true,

    });
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

    this.existingFile = null;

    this.fileName = '';

    this.dragging = false;

    this.close.emit();

  }

}
