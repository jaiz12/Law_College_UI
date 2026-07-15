import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

export interface Role {

  Id?: number | null;

  Name: string;

}

@Component({
  selector: 'app-create-edit-role-modal',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './create-edit-role-modal.component.html',
  styleUrl: './create-edit-role-modal.component.scss'
})
export class CreateEditRoleModalComponent implements OnChanges {

  private fb = inject(FormBuilder);

  @Input() role: Role | null = null;

  @Output() save = new EventEmitter<Role>();

  @Output() close = new EventEmitter<void>();

  roleForm = this.fb.group({
    Id: this.fb.control<number | null>(null),
    Name: this.fb.control('', {
      validators: [
        Validators.required,
        this.noWhitespaceValidator()
      ],
      nonNullable: true
    })
  }); 

  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace && control.value.trim() === control.value;
      return !isValid ? { 'whitespace': true } : null;
    };
  }

  get isEditMode() {

    return !!this.role;

  }

  ngOnChanges(): void {

    if (this.role) {

      this.roleForm.patchValue({
        Id: this.role?.Id ?? null,
        Name: this.role?.Name ?? ''
      });

    } else {

      this.roleForm.reset({
        Id: null,
        Name: ''
      });

    }

  }

  submit() {

    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();
      return;

    }

    this.save.emit({

      Id: this.role?.Id,

      Name: this.roleForm.value.Name!

    });

  }

  cancel() {

    this.roleForm.reset();

    this.close.emit();

  }

}
