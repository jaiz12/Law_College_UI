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

import { Syllabus } from '../syllabus.component';

import { CKEditorConfigService } from '../../../../../services/ckeditor-config.service';

import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';


@Component({

  selector: 'app-syllabus-modal',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],

  templateUrl: './syllabus-modal.component.html',

  styleUrl: './syllabus-modal.component.scss'

})
export class SyllabusModalComponent implements OnChanges {


  // =========================================
  // CKEDITOR
  // =========================================

  public Editor: any;

  editorConfig: any;


  // =========================================
  // SERVICES
  // =========================================

  private fb = inject(FormBuilder);

  private validationService =
    inject(ValidationService);

  private dublicateValidationService =
    inject(DublicateValidationService);


  constructor(
    private configService: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {

    this.Editor =
      this.ckEditorConfig.Editor;

    this.editorConfig =
      this.ckEditorConfig.getConfig();

  }


  // =========================================
  // INPUTS / OUTPUTS
  // =========================================

  @Input()
  selectedSyllabus: Syllabus | null = null;


  @Input()
  syllabus: Syllabus[] = [];


  @Output()
  save =
    new EventEmitter<Syllabus>();


  @Output()
  close =
    new EventEmitter<void>();


  // =========================================
  // FILE VARIABLES
  // =========================================

  selectedFile: File | null = null;

  existingFile: string | null = null;

  fileName = '';

  dragging = false;


  readonly allowedExtensions = [
    '.pdf'
  ];


  readonly allowedMimeTypes = [
    'application/pdf'
  ];


  readonly maxFileSize =
    5 * 1024 * 1024; // 5 MB


  // =========================================
  // FORM CONFIGURATION
  // =========================================

  pageForm = this.fb.group({

    id: this.fb.control<number | null>(
      null
    ),


    title: this.fb.control<string>('', {

      validators: [

        Validators.required,

        Validators.maxLength(100),

        this.validationService
          .noWhitespaceValidator(),

        this.dublicateValidationService
          .duplicateValidator(
            () => this.syllabus,
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
  // EDIT MODE
  // =========================================

  get isEditMode(): boolean {

    return !!this.selectedSyllabus;

  }


  // =========================================
  // INPUT CHANGES
  // =========================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {


    // =====================================
    // UPDATE DUPLICATE VALIDATION
    // =====================================

    if (changes['syllabus']) {

      this.pageForm
        .get('title')
        ?.updateValueAndValidity();

    }


    // =====================================
    // EDIT
    // =====================================

    if (this.selectedSyllabus) {

      this.pageForm.patchValue({

        id:
          this.selectedSyllabus.id,

        title:
          this.selectedSyllabus.title,

        content:
          this.selectedSyllabus.content ?? '',

        file:
          this.selectedSyllabus.file ?? null

      });


      // Existing PDF

      this.existingFile =
        this.selectedSyllabus.file ?? null;


      this.fileName =
        this.getFileName(
          this.existingFile
        );


      // Reset selected file

      this.selectedFile = null;


      this.pageForm
        .get('file')
        ?.setErrors(null);


      this.pageForm
        .get('title')
        ?.updateValueAndValidity();

    }

    // =====================================
    // CREATE
    // =====================================

    else {

      this.pageForm.reset({

        id: null,

        title: '',

        content: '',

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


  // =========================================
  // FILE SELECTION
  // =========================================

  onFileChange(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (!input.files?.length) {

      return;

    }


    this.loadFile(
      input.files[0]
    );


    // Allow selecting the same
    // file again

    input.value = '';

  }


  // =========================================
  // FILE LOADING & VALIDATION
  // =========================================

  loadFile(
    file: File
  ): void {

    const fileControl =
      this.pageForm.get('file');


    const validationError =
      this.validateFile(file);


    // =====================================
    // INVALID
    // =====================================

    if (validationError) {

      this.selectedFile = null;

      this.fileName = '';

      fileControl?.setErrors(
        validationError
      );

      fileControl?.markAsTouched();

      return;

    }


    // =====================================
    // VALID
    // =====================================

    this.selectedFile = file;

    this.fileName = file.name;


    fileControl?.setValue(
      file.name
    );


    fileControl?.setErrors(null);

    fileControl?.markAsTouched();


    /*
     * New PDF selected.
     *
     * Existing PDF should no longer
     * be submitted as the selected file.
     */

    this.existingFile = null;

  }


  // =========================================
  // COMPLETE FILE VALIDATION
  // =========================================

  private validateFile(
    file: File
  ): { [key: string]: boolean } | null {


    const fileName =
      file.name
        .trim()
        .toLowerCase();


    const extension =
      fileName.substring(
        fileName.lastIndexOf('.')
      );


    // =====================================
    // EXTENSION
    // =====================================

    if (
      !this.allowedExtensions
        .includes(extension)
    ) {

      return {
        invalidFileType: true
      };

    }


    // =====================================
    // MIME TYPE
    // =====================================

    if (
      !this.allowedMimeTypes
        .includes(file.type)
    ) {

      return {
        invalidFileType: true
      };

    }


    // =====================================
    // FILE SIZE
    // =====================================

    if (
      file.size > this.maxFileSize
    ) {

      return {
        maxFileSize: true
      };

    }


    return null;

  }


  // =========================================
  // DRAG & DROP
  // =========================================

  onDragOver(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging = true;

  }


  onDragLeave(
    event: DragEvent
  ): void {

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


    if (file) {

      this.loadFile(file);

    }

  }


  // =========================================
  // REMOVE FILE
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

    }

    else {

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
  // GET FILE NAME
  // =========================================

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
      .pop() ?? '';

  }


  // =========================================
  // SUBMIT
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

    if (
      !this.selectedFile &&
      !this.existingFile
    ) {

      fileControl?.setErrors({
        required: true
      });

      fileControl?.markAsTouched();
    }


    // =====================================
    // FORM INVALID
    // =====================================

    if (
      this.pageForm.invalid
    ) {

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

      id:
        value.id ?? 0,


      title:
        value.title.trim(),


      content:
        value.content,


      /*
       * Keep existing file when no new file
       * has been selected.
       */
      file: this.existingFile,

      /*
       * New file if selected.
       */

      filePath:
        this.selectedFile

    });

    console.log(value)
    /*
     * Fallback reset.
     *
     * Parent normally closes the modal
     * after successful API response.
     */

    setTimeout(() => {

      this.isSubmitting = false;

    }, 5000);

  }


  // =========================================
  // CANCEL
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
