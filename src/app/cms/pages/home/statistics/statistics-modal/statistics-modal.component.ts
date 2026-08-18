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
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ValidationService } from '../../../../../services/validation-service.service';
import { Statistics } from '../statistics.component';


@Component({
  selector: 'app-statistics-modal',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './statistics-modal.component.html',
  styleUrl: './statistics-modal.component.scss'
})
export class StatisticsModalComponent implements OnChanges {


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
    Statistics | null = null;


  // ===================================================
  // OUTPUT
  // ===================================================

  @Output()
  save =
    new EventEmitter<Statistics>();

  @Output()
  close =
    new EventEmitter<void>();



  searchControl =
    new FormControl('', {
      nonNullable: true
    });


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

    count:
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

        count:
          this.item.count ?? ''

      });


    }

    else {

      this.pageForm.reset({

        id:
          0,

        title:
          '',

        count:
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

    const item: Statistics = {
      id: value.id ?? 0,
      title: value.title.trim(),
      count: value.count.trim()
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
