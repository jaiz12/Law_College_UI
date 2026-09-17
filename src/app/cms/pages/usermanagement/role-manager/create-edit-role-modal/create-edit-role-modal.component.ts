import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';
import { ValidationService } from '../../../../../services/validation-service.service';

export interface Role {
  Id?: number | null;
  Name: string;
}

@Component({
  selector: 'app-create-edit-role-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-edit-role-modal.component.html',
  styleUrl: './create-edit-role-modal.component.scss'
})
export class CreateEditRoleModalComponent implements OnChanges {

  private fb = inject(FormBuilder);

  private validationService = inject(ValidationService);

  private duplicateValidationService =
    inject(DublicateValidationService);

  @Input() role: Role | null = null;

  @Input() roles: Role[] = [];

  @Output() save = new EventEmitter<Role>();

  @Output() close = new EventEmitter<void>();

  isSubmitting = false;

  roleForm = this.fb.group({
    Id: this.fb.control<number | null>(null),

    Name: this.fb.control('', {
      validators: [
        Validators.required,

        Validators.maxLength(200),

        this.validationService.noWhitespaceValidator(),

        this.duplicateValidationService.duplicateValidator(
          () => this.roles,
          ['Name']
        )
      ],
      nonNullable: true
    })
  });


  get isEditMode(): boolean {
    return !!this.role;
  }


  ngOnChanges(): void {

    this.isSubmitting = false;

    if (this.role) {

      this.roleForm.patchValue({
        Id: this.role.Id ?? null,
        Name: this.role.Name ?? ''
      });

    } else {

      this.roleForm.reset({
        Id: null,
        Name: ''
      });

    }

    // Re-run duplicate validation when roles input changes
    this.roleForm.controls.Name.updateValueAndValidity();

  }


  submit(): void {

    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    const role: Role = {
      Id: this.roleForm.controls.Id.value,
      Name: this.roleForm.controls.Name.value.trim()
    };

    this.save.emit(role);
    setTimeout(() => {
      this.isSubmitting = false;
    }, 5000);
  }


  cancel(): void {

    this.isSubmitting = false;

    this.roleForm.reset({
      Id: null,
      Name: ''
    });

    this.close.emit();

  }

}
