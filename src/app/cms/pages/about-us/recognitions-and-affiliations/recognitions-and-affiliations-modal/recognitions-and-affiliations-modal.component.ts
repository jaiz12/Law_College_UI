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
export class RecognitionsAndAffiliationsModalComponent
  implements OnChanges {

  constructor(private config: ConfigService) {

  }

  private fb = inject(FormBuilder);

  private validationService = inject(
    ValidationService
  );

  // ---------------------------------------
  // Inputs
  // ---------------------------------------

  @Input()
  recognition: RecognitionAffiliation | null = null;

  @Input()
  recognitions: RecognitionAffiliation[] = [];

  @Input()
  imageURL = '';

  // ---------------------------------------
  // Outputs
  // ---------------------------------------

  @Output()
  save = new EventEmitter<RecognitionAffiliation>();

  @Output()
  close = new EventEmitter<void>();

  // ---------------------------------------
  // Variables
  // ---------------------------------------

  imagePreview: string | ArrayBuffer | null = null;

  selectedFile: File | null = null;

  // ---------------------------------------
  // Form
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

    image: this.fb.control<string | null>(
      null,
      Validators.required
    ),

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
  // Load Data
  // ---------------------------------------

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.recognition) {

      this.pageForm.patchValue({

        id: this.recognition.id,

        title: this.recognition.title,

        description: this.recognition.description,

        externalUrl:
          this.recognition.externalUrl ?? '',

        image:
          this.recognition.image,

        displayOrder:
          this.recognition.displayOrder

      });

      const photoPath =
        this.recognition.image;


      if (photoPath) {

        this.imagePreview =
          this.config.get('IMAGE_API_URL') +
          photoPath;

      }

      else {

        this.imagePreview = null;

      }

      

    }

    else {

      this.pageForm.reset({

        id: null,

        title: '',

        description: '',

        externalUrl: '',

        image: null,

        displayOrder: 0

      });

      this.imagePreview = null;

    }

    this.selectedFile = null;

    // Existing image is valid in edit mode
    this.pageForm
      .get('photo')
      ?.setErrors(null);

  }

  // ---------------------------------------
  // Image Upload
  // ---------------------------------------

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

    const allowedTypes = [

      'image/jpeg',

      'image/png',

      'image/webp',

      'image/gif'

    ];

    if (
      !allowedTypes.includes(file.type)
    ) {

      alert(
        'Only JPG, PNG, WEBP and GIF images are allowed.'
      );

      input.value = '';

      return;

    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {

      alert(
        'Maximum image size is 2 MB.'
      );

      input.value = '';

      return;

    }

    this.selectedFile = file;

    this.pageForm.patchValue({

      image: file.name

    });

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result;

    };

    reader.readAsDataURL(file);

  }

  // ---------------------------------------
  // Remove Image
  // ---------------------------------------

  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;

    this.pageForm.patchValue({

      image: null

    });

  }

  // ---------------------------------------
  // Submit
  // ---------------------------------------

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
        value.title,

      description:
        value.description,

      externalUrl:
        value.externalUrl || null,

      image:
        this.recognition?.image ?? null,

      imageFile:
        this.selectedFile,

      displayOrder:
        value.displayOrder

    });

  }

  // ---------------------------------------
  // Close
  // ---------------------------------------

  cancel(): void {

    this.close.emit();

  }

}
