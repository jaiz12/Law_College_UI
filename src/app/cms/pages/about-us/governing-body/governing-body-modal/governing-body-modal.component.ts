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
  ValidatorFn,
  Validators
} from '@angular/forms';

import { ValidationService } from '../../../../../services/validation-service.service';
import { ConfigService } from '../../../../../services/config.service';
import { GoverningBody } from '../governing-body.component';


@Component({
  selector: 'app-governing-body-modal',

  standalone: true,

  imports: [

    CommonModule,

    ReactiveFormsModule

  ],

  templateUrl:
    './governing-body-modal.component.html',

  styleUrl:
    './governing-body-modal.component.scss'

})
export class GoverningBodyModalComponent
  implements OnChanges {


  constructor(private config: ConfigService) {

  }

  private fb = inject(FormBuilder);

  private validationService = inject(ValidationService);


  // ---------------------------------------
  // Input / Output
  // ---------------------------------------

  @Input()
  member: GoverningBody | null = null;


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


  // ---------------------------------------
  // Form
  // ---------------------------------------

  pageForm = this.fb.group({

    id: this.fb.control<string>('', {

      nonNullable: true

    }),

    name: this.fb.control<string>('', {

      validators: [

        Validators.required,

        this.validationService.noWhitespaceValidator()

      ],

      nonNullable: true

    }),

    description: this.fb.control<string>('', {

      validators: [

        Validators.required,

        this.validationService.noWhitespaceValidator()

      ],

      nonNullable: true

    }),

    photo: this.fb.control<string>('', {

      nonNullable: true

    })

  });


  // ---------------------------------------
  // Edit Mode
  // ---------------------------------------

  get isEditMode(): boolean {

    return !!this.member;

  }


  // ---------------------------------------
  // Input Changes
  // ---------------------------------------

  ngOnChanges(changes: SimpleChanges): void {

    if (this.member) {

      this.pageForm.patchValue({

        id: this.member.id ?? '',

        name: this.member.name ?? '',

        description: this.member.description ?? '',

        photo: this.member.photo ?? ''

      });


      const photoPath =
        this.member.photo;


      if (photoPath) {

        this.imagePreview =
          this.config.get('IMAGE_API_URL') +
          photoPath;

      }

      else {

        this.imagePreview = null;

      }


      this.selectedFile = null;


      // Existing photo is valid during edit

      this.pageForm
        .get('photo')
        ?.setErrors(null);

    }

    else {

      this.pageForm.reset({

        id: '',

        name: '',

        description: '',

        photo: ''

      });


      this.imagePreview = null;

      this.selectedFile = null;


      this.pageForm
        .get('photo')
        ?.setErrors(null);

    }

  }


  // ---------------------------------------
  // File Selection
  // ---------------------------------------

  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (!input.files?.length) {

      return;

    }


    const file =
      input.files[0];


    this.loadFile(file);

  }


  // ---------------------------------------
  // Load Image
  // ---------------------------------------

  loadFile(file: File): void {

    this.selectedFile = file;


    // Clear validation error

    this.pageForm
      .get('photo')
      ?.setErrors(null);


    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

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


    const file =
      event.dataTransfer?.files[0];


    if (file) {

      this.loadFile(file);

    }

  }


  // ---------------------------------------
  // Remove Image
  // ---------------------------------------

  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;


    this.pageForm
      .get('photo')
      ?.setValue('');


    const id =
      this.pageForm.get('id')?.value;


    // Photo is required only for CREATE

    if (!id) {

      this.pageForm
        .get('photo')
        ?.setErrors({

          required: true

        });

    }

  }


  // ---------------------------------------
  // Submit
  // ---------------------------------------

  submit(): void {


    // CREATE validation

    const id =
      this.pageForm.get('id')?.value;


    if (!id && !this.selectedFile) {

      this.pageForm
        .get('photo')
        ?.setErrors({

          required: true

        });

    }


    // EDIT mode allows existing image

    if (id && (this.selectedFile || this.imagePreview)) {

      this.pageForm
        .get('photo')
        ?.setErrors(null);

    }


    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }


    const formData =
      new FormData();


    // Id

    if (id) {

      formData.append(

        'Id',

        id

      );

    }


    // Name

    formData.append(

      'Name',

      this.pageForm
        .get('name')
        ?.value ?? ''

    );


    // Description

    formData.append(

      'Description',

      this.pageForm
        .get('description')
        ?.value ?? ''

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
