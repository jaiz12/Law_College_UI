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

import {
  Library
} from '../library.component';


@Component({

  selector: 'app-library-modal',

  standalone: true,

  imports: [

    CommonModule,
    ReactiveFormsModule

  ],

  templateUrl:
    './library-modal.component.html',

  styleUrl:
    './library-modal.component.scss'

})

export class LibraryModalComponent
  implements OnChanges {


  private fb =
    inject(FormBuilder);


  private validationService =
    inject(ValidationService);


  // -------------------------------------------------
  // Inputs
  // -------------------------------------------------

  @Input()
  library: Library | null = null;


  // -------------------------------------------------
  // Outputs
  // -------------------------------------------------

  @Output()
  save =
    new EventEmitter<Library>();


  @Output()
  close =
    new EventEmitter<void>();


  // -------------------------------------------------
  // Form
  // -------------------------------------------------

  pageForm =
    this.fb.group({

      id:
        this.fb.control<number | null>(null),


      title:
        this.fb.control('', {

          validators: [

            Validators.required,

            this.validationService
              .noWhitespaceValidator()

          ],

          nonNullable: true

        }),


      externalLink:
        this.fb.control('', {

          validators: [

            Validators.maxLength(500)

          ],

          nonNullable: true

        })

    });


  // -------------------------------------------------
  // Edit Mode
  // -------------------------------------------------

  get isEditMode(): boolean {

    return !!this.library;

  }


  // -------------------------------------------------
  // Input Changes
  // -------------------------------------------------

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.library) {

      this.pageForm.patchValue({

        id:
          this.library.id,

        title:
          this.library.title,

        externalLink:
          this.library.externalLink ?? ''

      });

    }

    else {

      this.pageForm.reset({

        id: null,

        title: '',

        externalLink: ''

      });

    }

  }


  // -------------------------------------------------
  // Submit
  // -------------------------------------------------

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

      externalLink:
        value.externalLink || null

    });

  }


  // -------------------------------------------------
  // Cancel
  // -------------------------------------------------

  cancel(): void {

    this.close.emit();

  }

}
