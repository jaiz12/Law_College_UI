import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ValidationService } from '../../../../../services/validation-service.service';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { OurProgram } from '../our-program.component';
import { ConfigService } from '../../../../../services/config.service';
import { CKEditorConfigService } from '../../../../../services/ckeditor-config.service';

@Component({
  selector: 'app-our-program-modal',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    CKEditorModule],
  templateUrl: './our-program-modal.component.html',
  styleUrl: './our-program-modal.component.scss'
})
export class OurProgramModalComponent implements OnChanges {


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
  item:
    OurProgram | null = null;


  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  save =
    new EventEmitter<OurProgram>();

  @Output()
  close =
    new EventEmitter<void>();

  public Editor: any;

  searchControl =
    new FormControl('', {
      nonNullable: true
    });

  editorConfig: any;
  constructor(private configService: ConfigService, private ckEditorConfig: CKEditorConfigService) {
    // CKEditor build
    this.Editor =
      this.ckEditorConfig.Editor;
    this.editorConfig = this.ckEditorConfig.getConfig();
  };

  

  // ===================================================
  // FORM
  // ===================================================

  pageForm = this.fb.group({

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

    shortDescription:
      this.fb.control('', {

        validators: [

          Validators.required,

          this.validationService
            .noWhitespaceValidator()

        ],

        nonNullable: true

      }),

    description:
      this.fb.control('', {

        validators: [

          Validators.required,

          this.validationService
            .noWhitespaceValidator()

        ],

        nonNullable: true

      }),

  });


  // ===================================================
  // EDIT MODE
  // ===================================================

  get isEditMode(): boolean {

    return !!this.item;

  }


  // ===================================================
  // INPUT CHANGES
  // ===================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.item) {

      this.pageForm.patchValue({

        id:
          this.item.id,

        title:
          this.item.title ?? '',

        shortDescription:
          this.item.shortDescription ?? '',

        description:
          this.item.description ?? ''

      });


    }

    else {

      this.pageForm.reset({

        id:
          0,

        title:
          '',

        shortDescription:
          '',

        description:
          ''

      });


    }

  }


  // ===================================================
  // SUBMIT
  // ===================================================

  submit(): void {

    

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    const value = this.pageForm.getRawValue();

    const item: OurProgram = {
      id: value.id ?? 0,
      title: value.title.trim(),
      shortDescription: value.shortDescription.trim(),
      description: value.description.trim()
    };

    console.log('EMITTING SAVE:', item);
    this.save.emit(item);
  }


  // ===================================================
  // CANCEL
  // ===================================================

  cancel(): void {

    this.searchControl.reset('');

    this.close.emit();

  }

}
