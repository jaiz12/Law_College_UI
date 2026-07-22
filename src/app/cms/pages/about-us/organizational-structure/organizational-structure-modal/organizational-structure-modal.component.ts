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

import { OrganizationMember } from '../organizational-structure.component';
import { ConfigService } from '../../../../../services/config.service';



@Component({
  selector: 'app-organizational-structure-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './organizational-structure-modal.component.html',
  styleUrl: './organizational-structure-modal.component.scss'
})
export class OrganizationalStructureModalComponent
  implements OnChanges {

  constructor(private config: ConfigService) {

  }

  private fb = inject(FormBuilder);

  private validationService = inject(
    ValidationService
  );


  @Input()
  member: OrganizationMember | null = null;


  @Input()
  members: OrganizationMember[] = [];


  @Output()
  save = new EventEmitter<OrganizationMember>();


  @Output()
  close = new EventEmitter<void>();


  imagePreview: string | ArrayBuffer | null = null;

  selectedFile: File | null = null;


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

        Validators.pattern(/^[0-9+\-\s()]{7,20}$/),

        this.validationService.noWhitespaceValidator()

      ],

      nonNullable: true

    }),

    parentId: this.fb.control<number | null>(null),

    photo: this.fb.control<string | null>(null),

    displayOrder: this.fb.control(1, {

      validators: [

        Validators.required,

        Validators.min(1)

      ],

      nonNullable: true

    })

  });


  get isEditMode(): boolean {

    return !!this.member;

  }


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

      // Existing image is valid in edit mode
      this.pageForm
        .get('photo')
        ?.setErrors(null);

    }

    else {

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

      this.pageForm
        .get('photo')
        ?.setErrors(null);

    }

  }


  onFileChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files?.length) {

      return;

    }

    this.selectedFile =
      input.files[0];

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

      // Important
      this.pageForm
        .get('photo')
        ?.setValue(this.imagePreview);

      this.pageForm
        .get('photo')
        ?.setErrors(null);

    };

    reader.readAsDataURL(
      this.selectedFile
    );

  }


  removeImage(): void {

    this.selectedFile = null;

    this.imagePreview = null;

    const photoControl =
      this.pageForm.get('photo');

    photoControl?.setValue(null);

    // Required only when creating
    if (!this.isEditMode) {

      photoControl?.setErrors({

        required: true

      });

    }

    photoControl?.markAsTouched();

    photoControl?.updateValueAndValidity();

  }


  submit(): void {

    const photoControl = this.pageForm.get('photo');

    // Required only when creating
    if (!this.isEditMode && !this.selectedFile && !this.imagePreview) {

      photoControl?.setErrors({
        required: true
      });

    }

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;

    }

    const value = this.pageForm.getRawValue();

    this.save.emit({

      id: value.id ?? 0,

      name: value.name,

      designation: value.designation,

      email: value.email,

      phone: value.phone,

      parentId: value.parentId,

      // Existing image path
      photo: this.member?.photo ?? null,

      // Actual selected File
      photoFile: this.selectedFile,

      displayOrder: value.displayOrder

    });

  }


  cancel(): void {

    this.close.emit();

  }

}
