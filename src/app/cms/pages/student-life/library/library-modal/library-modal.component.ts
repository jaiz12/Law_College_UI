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
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';


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

  private dublicateValidationService =
    inject(DublicateValidationService);

  // -------------------------------------------------
  // Inputs
  // -------------------------------------------------

  @Input()
  library: Library | null = null;

  @Input()
  libraries: Library[] = [];


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

            Validators.maxLength(200),

            this.validationService.noWhitespaceValidator(),

            this.dublicateValidationService.duplicateValidator(
              () => this.libraries,
              ['title']
            )

          ],

          nonNullable: true

        }),


      externalLink:
        this.fb.control('', {

          validators: [

            this.urlValidator(),
            this.validationService.noWhitespaceValidator(),
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


  // ---------------------------------------
  // URL Validator
  // ---------------------------------------

  private urlValidator() {

    return (control: any) => {

      const value =
        control.value
          ?.trim();

      if (!value) {
        return null;
      }

      // No whitespace anywhere
      if (/\s/.test(value)) {
        return {
          urlWhitespace: true
        };
      }

      // Valid HTTP / HTTPS URL
      const urlPattern =
        /^https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?::\d+)?(?:[/?#][^\s]*)?$/;

      if (!urlPattern.test(value)) {
        return {
          invalidUrl: true
        };
      }

      return null;
    };
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
        value.title,

      externalLink:
        value.externalLink || null

    });
    setTimeout(() => {
      this.isSubmitting = false;
    }, 5000);

  }


  // -------------------------------------------------
  // Cancel
  // -------------------------------------------------

  cancel(): void {

    this.close.emit();

  }

}
