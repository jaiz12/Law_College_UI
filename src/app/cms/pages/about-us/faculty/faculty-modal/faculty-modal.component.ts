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
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';

@Component({
  selector: 'app-faculty-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './faculty-modal.component.html',
  styleUrl: './faculty-modal.component.scss'
})
export class FacultyModalComponent implements OnChanges {

  // ===================================================
  // SERVICES
  // ===================================================

  constructor(
    private config: ConfigService
  ) { }

  private fb = inject(FormBuilder);

  private validationService =
    inject(ValidationService);

  private dublicateValidationService =
    inject(DublicateValidationService);


  // ===================================================
  // INPUT
  // ===================================================

  @Input()
  member: OrganizationMember | null = null;

  @Input()
  members: OrganizationMember[] = [];


  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  save =
    new EventEmitter<OrganizationMember>();

  @Output()
  close =
    new EventEmitter<void>();


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

  readonly maxFileSize = 1 * 1024 * 1024; // 1 MB
  // ===================================================
  // FORM
  // ===================================================

  pageForm = this.fb.group(
    {

      id:
        this.fb.control<number | null>(null),

      name:
        this.fb.control('', {

          validators: [

            Validators.required,

            Validators.maxLength(200),

            this.validationService
              .noWhitespaceValidator()

          ],

          nonNullable: true

        }),

      designation:
        this.fb.control('', {

          validators: [

            Validators.required,

            Validators.maxLength(200),

            this.validationService
              .noWhitespaceValidator(),

          ],

          nonNullable: true

        }),

      email:
        this.fb.control('', {

          validators: [

            Validators.required,

            Validators.email,

            Validators.maxLength(200),

            this.validationService
              .noWhitespaceValidator(),
            Validators.pattern(
              /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
            )

          ],

          nonNullable: true

        }),

      phone:
        this.fb.control('', {

          validators: [

            Validators.required,

            Validators.minLength(10),

            Validators.maxLength(10),

            Validators.pattern(
              /^[0-9]{10}$/
            ),

            this.validationService
              .noWhitespaceValidator()

          ],

          nonNullable: true

        }),

      parentId:
        this.fb.control<number | null>(null),

      photo:
        this.fb.control<string | null>(
          null,
          {
            validators: [
              Validators.required
            ]
          }
        ),

      displayOrder:
        this.fb.control(1, {

          validators: [

            Validators.required,

            Validators.min(1)

          ],

          nonNullable: true

        })

    },

    {

      // =================================================
      // NAME + PHONE COMBINATION DUPLICATE
      // =================================================

      validators: [

        this.dublicateValidationService
          .duplicateCombinationValidator(
            () => this.members,
            ['name', 'phone', 'designation']
          )

      ]

    }
  );


  // ===================================================
  // EDIT MODE
  // ===================================================

  get isEditMode(): boolean {

    return !!this.member;

  }


  // ===================================================
  // LIFECYCLE
  // ===================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.member) {

      this.pageForm.patchValue({

        id:
          this.member.id,

        name:
          this.member.name ?? '',

        designation:
          this.member.designation ?? '',

        email:
          this.member.email ?? '',

        phone:
          this.member.phone ?? '',

        parentId:
          this.member.parentId,

        photo:
          this.member.photo,

        displayOrder:
          this.member.displayOrder

      });


      // ===============================================
      // EXISTING PHOTO
      // ===============================================

      const photoPath =
        this.member.photo;

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

        id: null,

        name: '',

        designation: '',

        email: '',

        phone: '',

        parentId: null,

        photo: null,

        displayOrder: 0

      });

      this.imagePreview = null;

      this.selectedFile = null;

    }


    // ===============================================
    // REVALIDATE COMBINATION
    // ===============================================

    this.pageForm.updateValueAndValidity({
      emitEvent: false
    });

  }


  // ===================================================
  // PHONE INPUT
  // ===================================================

  onPhoneInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const value =
      input.value
        .replace(/\D/g, '')
        .slice(0, 10);

    input.value = value;

    this.pageForm
      .controls
      .phone
      .setValue(
        value,
        {
          emitEvent: true
        }
      );

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


    // ===============================================
    // VALIDATE FILE
    // ===============================================

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


    // ===============================================
    // VALID FILE
    // ===============================================

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

    input.value = '';

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

    const validExtension =
      this.allowedExtensions.includes(
        extension
      );

    const validMimeType =
      this.allowedMimeTypes.includes(
        file.type
      );

    const validSize =
      file.size <= this.maxFileSize;

    return (
      validExtension &&
      validMimeType &&
      validSize
    );
  }


  private validateFile(
    file: File
  ): 'invalidFileType' | 'fileTooLarge' | null {

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


    // ===============================================
    // VALIDATE FILE
    // ===============================================

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


    // ===============================================
    // VALID FILE
    // ===============================================

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
  // REMOVE IMAGE
  // ===================================================

  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;


    const photoControl =
      this.pageForm.get('photo');


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
  // SUBMIT
  // ===================================================

  isSubmitting = false;

  submit(): void {

    const photoControl =
      this.pageForm.get('photo');


    // ===============================================
    // PHOTO REQUIRED FOR CREATE
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


    this.isSubmitting = true;


    const value =
      this.pageForm.getRawValue();


    const member: OrganizationMember = {

      id:
        value.id ?? 0,

      name:
        value.name.trim(),

      designation:
        value.designation.trim(),

      email:
        value.email.trim(),

      phone:
        value.phone.trim(),

      parentId:
        value.parentId,

      photo:
        this.member?.photo ?? null,

      photoFile:
        this.selectedFile,

      displayOrder:
        value.displayOrder

    };


    this.save.emit(member);
    setTimeout(() => {
      this.isSubmitting = false;
    }, 5000);

  }


  // ===================================================
  // CANCEL
  // ===================================================

  cancel(): void {

    this.close.emit();

  }

}
