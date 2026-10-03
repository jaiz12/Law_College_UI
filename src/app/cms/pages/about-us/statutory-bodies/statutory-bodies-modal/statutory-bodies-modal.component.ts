
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
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { ConfigService } from '../../../../../services/config.service';
import { ValidationService } from '../../../../../services/validation-service.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { StatutoryBodiesBody } from '../statutory-bodies.component';
import { CKEditorConfigService } from '../../../../../services/ckeditor-config.service';
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';

@Component({
  selector: 'app-statutory-bodies-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule
  ],
  templateUrl: './statutory-bodies-modal.component.html',
  styleUrl: './statutory-bodies-modal.component.scss'
})
export class StatutoryBodiesModalComponent implements OnChanges {

  editorConfig: any;
  public Editor: any;

  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);

  private dublicateValidationService =
    inject(DublicateValidationService);

  constructor(
    private config: ConfigService,
    private ckEditorConfig: CKEditorConfigService
  ) {
    this.Editor = this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();
  }

  // =========================================================
  // INPUT / OUTPUT
  // =========================================================

  @Input()
  statutorybody: StatutoryBodiesBody | null = null;

  @Input()
  statutorybodies: StatutoryBodiesBody[] = [];

  @Output()
  save = new EventEmitter<FormData>();

  @Output()
  close = new EventEmitter<void>();


  // =========================================================
  // FORM
  // =========================================================

  pageForm = this.fb.group({

    id: this.fb.control<number | null>(null),

    title: this.fb.control<string>('', {
      validators: [
        Validators.required,
        Validators.maxLength(200),
        this.validationService.noWhitespaceValidator(),

        this.dublicateValidationService.duplicateValidator(
          () => this.statutorybodies,
          ['title']
        )
      ],
      nonNullable: true
    }),

    content: this.fb.control<string>('', {
      validators: [
        Validators.required,
        this.validationService.noWhitespaceValidator()
      ],
      nonNullable: true
    })

  });

  // =========================================================
  // EDIT MODE
  // =========================================================

  get isEditMode(): boolean {
    return !!this.statutorybody;
  }

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (this.statutorybody) {

      // ===============================================
      // EDIT MODE
      // ===============================================

      this.pageForm.patchValue({
        id: this.statutorybody.id ?? '',
        title: this.statutorybody.title ?? '',
        content: this.statutorybody.content ?? '',
      });

          

    } else {

      // ===============================================
      // CREATE MODE
      // ===============================================

      this.pageForm.reset({
        id: 0,
        title: '',
        content: ''
      });


    }

    // ===============================================
    // REVALIDATE DUPLICATE TITLE
    // ===============================================

    this.pageForm.controls.title.updateValueAndValidity();
  }


  // =========================================================
  // SUBMIT
  // =========================================================

  isSubmitting = false;

  submit(): void {

    // ===============================================
    // REVALIDATE DUPLICATE TITLE
    // ===============================================

    this.pageForm
      .get('title')
      ?.updateValueAndValidity();

    // ===============================================
    // FORM VALIDATION
    // ===============================================

    if (this.pageForm.invalid) {

      this.pageForm.markAllAsTouched();

      return;
    }

    // ===============================================
    // START SUBMITTING
    // ===============================================

    this.isSubmitting = true;

    const formData =
      new FormData();

    const value =
      this.pageForm.getRawValue();

    console.log(value)

    // ===============================================
    // ID
    // ===============================================

    if (value.id) {

      formData.append(
        'Id',
        value.id.toString(),
      );

    }

    // ===============================================
    // TITLE
    // ===============================================

    formData.append(
      'Title',
      value.title.trim()
    );

    // ===============================================
    // CONTENT
    // ===============================================

    formData.append(
      'Content',
      value.content.trim()
    );

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.save.emit(formData);

    

    setTimeout(() => {
      this.isSubmitting = false;
    }, 5000);
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    this.close.emit();
  }

}

