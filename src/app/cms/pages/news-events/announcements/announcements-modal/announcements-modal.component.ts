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

import { Announcements } from '../announcements.component';


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


  // ===================================================
  // INPUT
  // ===================================================

  @Input()
  announcements: Announcements | null = null;


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

  readonly allowedExtensions = [
    '.pdf',
    '.doc',
    '.docx'
  ];


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
          this.validationService.noWhitespaceValidator()
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

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toISOString().split('T')[0];
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

  loadFile(file: File): void {

    if (!this.isAllowedFile(file)) {

      this.selectedFile = null;

      this.fileName = '';

      this.pageForm
        .get('file')
        ?.setErrors({
          invalidFileType: true
        });

      this.pageForm
        .get('file')
        ?.markAsTouched();

      return;
    }


    this.selectedFile = file;

    this.fileName = file.name;


    this.pageForm
      .get('file')
      ?.setValue(file.name);


    this.pageForm
      .get('file')
      ?.setErrors(null);

  }


  // ===================================================
  // FILE VALIDATION
  // ===================================================

  private isAllowedFile(file: File): boolean {

    const fileName =
      file.name.toLowerCase();

    const extension =
      fileName.substring(
        fileName.lastIndexOf('.')
      );

    return this.allowedExtensions.includes(
      extension
    );

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

    if (file) {

      this.loadFile(file);

    }

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

  submit(): void {

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }


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
