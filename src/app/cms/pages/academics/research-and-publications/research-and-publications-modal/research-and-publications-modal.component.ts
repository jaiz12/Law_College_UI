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

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { CKEditorConfigService } from '../../../../../services/ckeditor-config.service';

import { ValidationService } from '../../../../../services/validation-service.service';

import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';

import { ResearchAndPublications }
  from '../research-and-publications.component';


@Component({
  selector: 'app-research-and-publications-modal',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],

  templateUrl:
    './research-and-publications-modal.component.html',

  styleUrl:
    './research-and-publications-modal.component.scss'
})
export class ResearchAndPublicationsModalComponent
  implements OnChanges {


  // =================================================
  // SERVICES
  // =================================================

  private fb =
    inject(FormBuilder);

  private validationService =
    inject(ValidationService);

  private dublicateValidationService =
    inject(DublicateValidationService);


  constructor(
    private ckEditorConfig:
      CKEditorConfigService
  ) {

    this.Editor =
      this.ckEditorConfig.Editor;

    this.editorConfig =
      this.ckEditorConfig.getConfig();

  }


  // =================================================
  // CKEDITOR
  // =================================================

  public Editor: any;

  editorConfig: any;


  // =================================================
  // INPUTS
  // =================================================

  @Input()
  researchAndPublication:
    ResearchAndPublications | null = null;


  @Input()
  researchAndPublications:
    ResearchAndPublications[] = [];


  // =================================================
  // OUTPUTS
  // =================================================

  @Output()
  save =
    new EventEmitter<ResearchAndPublications>();


  @Output()
  close =
    new EventEmitter<void>();


  // =================================================
  // FORM
  // =================================================

  pageForm =
    this.fb.group({

      // ------------------------------------------------
      // ID
      // ------------------------------------------------

      id:
        this.fb.control<number | null>(
          null
        ),


      // ------------------------------------------------
      // TITLE
      // ------------------------------------------------

      title:
        this.fb.control<string>('', {

          validators: [

            Validators.required,

            Validators.maxLength(100),

            this.validationService
              .noWhitespaceValidator(),

            this.dublicateValidationService
              .duplicateValidator(
                () => this.researchAndPublications,
                ['title']
              )

          ],

          nonNullable: true

        }),


      // ------------------------------------------------
      // DESCRIPTION
      // ------------------------------------------------

      description:
        this.fb.control<string>('', {

          validators: [

            Validators.required,

            this.validationService
              .noWhitespaceValidator()

          ],

          nonNullable: true

        }),


      // ------------------------------------------------
      // LINK
      // ------------------------------------------------

      link:
        this.fb.control<string>('', {

          validators: [

            // Required
            Validators.required,

            // Leading / trailing / only whitespace
            this.validationService
              .noWhitespaceValidator(),

            // URL validation
            this.urlValidator()

          ],

          nonNullable: true

        })

    });


  // =================================================
  // EDIT MODE
  // =================================================

  get isEditMode(): boolean {

    return !!this.researchAndPublication;

  }


  // =================================================
  // URL VALIDATOR
  // Same validation logic as
  // RecognitionsAndAffiliationsModalComponent
  // =================================================

  private urlValidator() {

    return (control: any) => {

      const value =
        control.value?.trim();


      // -----------------------------------------------
      // Empty value
      // Required validator handles this
      // -----------------------------------------------

      if (!value) {

        return null;

      }


      // -----------------------------------------------
      // No whitespace anywhere
      // -----------------------------------------------

      if (/\s/.test(value)) {

        return {
          urlWhitespace: true
        };

      }


      // -----------------------------------------------
      // URL FORMAT
      // -----------------------------------------------

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


  // =================================================
  // LIFECYCLE
  // =================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {


    // =================================================
    // UPDATE DUPLICATE VALIDATION
    // =================================================

    if (
      changes['researchAndPublications']
    ) {

      this.pageForm
        .get('title')
        ?.updateValueAndValidity();

    }


    // =================================================
    // EDIT MODE
    // =================================================

    if (
      this.researchAndPublication
    ) {

      this.pageForm.patchValue({

        id:
          this.researchAndPublication.id,

        title:
          this.researchAndPublication.title ?? '',

        description:
          this.researchAndPublication.description ?? '',

        link:
          this.researchAndPublication.link ?? ''

      });


      // Revalidate title
      this.pageForm
        .get('title')
        ?.updateValueAndValidity();


      // Revalidate link
      this.pageForm
        .get('link')
        ?.updateValueAndValidity();

    }


    // =================================================
    // CREATE MODE
    // =================================================

    else {

      this.pageForm.reset({

        id: null,

        title: '',

        description: '',

        link: ''

      });

    }

  }


  // =================================================
  // SUBMIT
  // =================================================

  isSubmitting = false;


  submit(): void {


    // =================================================
    // MARK ALL CONTROLS AS TOUCHED
    // =================================================

    this.pageForm.markAllAsTouched();


    // =================================================
    // REVALIDATE
    // =================================================

    this.pageForm
      .get('title')
      ?.updateValueAndValidity();


    this.pageForm
      .get('description')
      ?.updateValueAndValidity();


    this.pageForm
      .get('link')
      ?.updateValueAndValidity();


    // =================================================
    // INVALID
    // =================================================

    if (
      this.pageForm.invalid
    ) {

      return;

    }


    // =================================================
    // SUBMITTING
    // =================================================

    this.isSubmitting = true;


    const value =
      this.pageForm.getRawValue();


    // =================================================
    // EMIT
    // =================================================

    this.save.emit({

      id:
        value.id ?? 0,

      title:
        value.title.trim(),

      description:
        value.description.trim(),

      link:
        value.link.trim()

    });


    // =================================================
    // RESET SUBMITTING STATE
    // =================================================

    setTimeout(() => {

      this.isSubmitting = false;

    }, 5000);

  }


  // =================================================
  // CANCEL
  // =================================================

  cancel(): void {

    this.pageForm.reset();

    this.close.emit();

  }

}
