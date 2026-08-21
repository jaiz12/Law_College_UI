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

import {
  ValidationService
} from '../../../../../services/validation-service.service';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import {
  AcademicCalendar
} from '../academic-calendar.component';
import { CKEditorConfigService } from '../../../../../services/ckeditor-config.service';


@Component({

  selector:
    'app-academic-calendar-modal',

  standalone: true,

  imports: [

    CommonModule,

    ReactiveFormsModule,

    CKEditorModule

  ],

  templateUrl:
    './academic-calendar-modal.component.html',

  styleUrl:
    './academic-calendar-modal.component.scss'

})
export class AcademicCalendarModalComponent
  implements OnChanges {


  // ===================================================
  // CKEDITOR
  // ===================================================

  public Editor: any;


  // ===================================================
  // SERVICES
  // ===================================================

  private fb =
    inject(FormBuilder);

  private validationService =
    inject(ValidationService);


  // ===================================================
  // INPUT
  // ===================================================

  @Input()
  academicCalendar:
    AcademicCalendar | null = null;


  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  save =
    new EventEmitter<AcademicCalendar>();


  @Output()
  close =
    new EventEmitter<void>();


  // ===================================================
  // FILE
  // ===================================================

  selectedFile:
    File | null = null;


  existingFile:
    string | null = null;


  fileName:
    string = '';


  dragging =
    false;

  editorConfig: any;
  constructor(private configService: ConfigService, private ckEditorConfig: CKEditorConfigService) {
    // CKEditor build
    this.Editor =
      this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();
  };

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

  pageForm =
    this.fb.group({

      id:
        this.fb.control<number | null>(
          null
        ),

      title:
        this.fb.control<string>(
          '',
          {

            validators: [

              Validators.required,

              this.validationService
                .noWhitespaceValidator()

            ],

            nonNullable: true

          }
        ),

      content:
        this.fb.control<string>(
          '',
          {

            nonNullable: true

          }
        ),

      file:
        this.fb.control<string | null>(
          null
        )

    });


  // ===================================================
  // EDIT MODE
  // ===================================================

  get isEditMode(): boolean {

    return !!this.academicCalendar;

  }


  // ===================================================
  // INPUT CHANGES
  // ===================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.academicCalendar) {

      // -----------------------------------------------
      // EDIT MODE
      // -----------------------------------------------

      this.pageForm.patchValue({

        id:
          this.academicCalendar.id,

        title:
          this.academicCalendar.title,

        content:
          this.academicCalendar.content ?? '',

        file:
          this.academicCalendar.file ?? null

      });


      // Existing file path
      this.existingFile =
        this.academicCalendar.file ?? null;


      // Existing file name
      this.fileName =
        this.getFileName(
          this.existingFile
        );


      // No new file selected
      this.selectedFile =
        null;


      // Existing file is valid
      this.pageForm
        .get('file')
        ?.setErrors(null);

    }

    else {

      // -----------------------------------------------
      // CREATE MODE
      // -----------------------------------------------

      this.pageForm.reset({

        id:
          null,

        title:
          '',

        content:
          '',

        file:
          null

      });


      this.existingFile =
        null;


      this.fileName =
        '';


      this.selectedFile =
        null;


      this.pageForm
        .get('file')
        ?.setErrors(null);

    }

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


    this.loadFile(
      input.files[0]
    );


    // Allow selecting same file again
    input.value = '';

  }


  // ===================================================
  // LOAD FILE
  // ===================================================

  loadFile(
    file: File
  ): void {

    // -----------------------------------------------
    // Validate extension
    // -----------------------------------------------

    if (
      !this.isAllowedFile(file)
    ) {

      this.selectedFile =
        null;

      this.fileName =
        '';


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


    // -----------------------------------------------
    // Valid file
    // -----------------------------------------------

    this.selectedFile =
      file;


    this.fileName =
      file.name;


    this.pageForm
      .get('file')
      ?.setValue(
        file.name
      );


    this.pageForm
      .get('file')
      ?.setErrors(null);


    this.pageForm
      .get('file')
      ?.markAsTouched();

  }


  // ===================================================
  // FILE VALIDATION
  // ===================================================

  private isAllowedFile(
    file: File
  ): boolean {

    const fileName =
      file.name.toLowerCase();


    const extension =
      fileName.substring(
        fileName.lastIndexOf('.')
      );


    return this.allowedExtensions
      .includes(extension);

  }


  // ===================================================
  // DRAG OVER
  // ===================================================

  onDragOver(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging =
      true;

  }


  // ===================================================
  // DRAG LEAVE
  // ===================================================

  onDragLeave(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging =
      false;

  }


  // ===================================================
  // DROP
  // ===================================================

  onDrop(
    event: DragEvent
  ): void {

    event.preventDefault();

    this.dragging =
      false;


    const file =
      event.dataTransfer
        ?.files?.[0];


    if (file) {

      this.loadFile(file);

    }

  }


  // ===================================================
  // REMOVE FILE
  // ===================================================

  removeFile(): void {

    this.selectedFile =
      null;


    this.fileName =
      '';


    const fileControl =
      this.pageForm.get('file');


    fileControl?.setValue(null);


    // -----------------------------------------------
    // Create mode
    // File is required
    // -----------------------------------------------

    if (!this.isEditMode) {

      this.existingFile =
        null;

      fileControl?.setErrors({

        required: true

      });

    }

    else {

      /*
       * In edit mode, keep the existing database
       * file path. The API can continue using it
       * when no new file is selected.
       */

      fileControl?.setErrors(null);

    }


    fileControl?.markAsTouched();

    fileControl?.updateValueAndValidity();

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

    const fileControl =
      this.pageForm.get('file');


    // -----------------------------------------------
    // File required only while creating
    // -----------------------------------------------

    if (
      !this.isEditMode &&
      !this.selectedFile
    ) {

      fileControl?.setErrors({

        required: true

      });

    }


    // -----------------------------------------------
    // Form validation
    // -----------------------------------------------

    if (
      this.pageForm.invalid
    ) {

      this.pageForm.markAllAsTouched();

      return;

    }


    // -----------------------------------------------
    // Get form values
    // -----------------------------------------------

    const value =
      this.pageForm.getRawValue();


    // -----------------------------------------------
    // Emit AcademicCalendar object
    // -----------------------------------------------

    this.save.emit({

      id:
        value.id ?? 0,

      title:
        value.title,

      content:
        value.content,

      // Existing file path
      file:
        this.academicCalendar?.file ?? null,

      // Actual selected file
      filePath:
        this.selectedFile,

      isActive:
        this.academicCalendar?.isActive ?? true

    });

  }


  // ===================================================
  // CANCEL
  // ===================================================

  cancel(): void {

    this.pageForm.reset();

    this.selectedFile =
      null;

    this.existingFile =
      null;

    this.fileName =
      '';

    this.dragging =
      false;

    this.close.emit();

  }

}
