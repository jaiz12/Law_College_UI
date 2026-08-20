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
import { LegalAidCell } from '../legal-aid-cell.component';

@Component({
  selector: 'app-legal-aid-cell-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
],
  templateUrl: './legal-aid-cell-modal.component.html',
  styleUrl: './legal-aid-cell-modal.component.scss'
})
export class LegalAidCellModalComponent implements OnChanges {


  private fb =
    inject(FormBuilder);


  private validationService =
    inject(ValidationService);


  // -------------------------------------------------
  // Inputs
  // -------------------------------------------------

  @Input()
  legalAidCell: LegalAidCell | null = null;


  // -------------------------------------------------
  // Outputs
  // -------------------------------------------------

  @Output()
  save =
    new EventEmitter<LegalAidCell>();


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

    return !!this.legalAidCell;

  }


  // -------------------------------------------------
  // Input Changes
  // -------------------------------------------------

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (this.legalAidCell) {

      this.pageForm.patchValue({

        id:
          this.legalAidCell.id,

        title:
          this.legalAidCell.title,

        externalLink:
          this.legalAidCell.externalLink ?? ''

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
