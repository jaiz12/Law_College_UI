
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { DublicateValidationService } from '../../../../../services/dublicate-validation.-service.service';
import { ValidationService } from '../../../../../services/validation-service.service';

export interface User {
  id: string | null;
  userName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  roleId: string | null;
}

export interface Role {
  id: string;
  name: string;
}

@Component({
  selector: 'app-create-edit-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-edit-user-modal.component.html'
})
export class CreateEditUserModalComponent implements OnChanges {

  @Input() user: User | null = null;

  @Input() users: User[] = [];

  @Input() roles: Role[] = [];

  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<User>();

  showPassword = false;

  submitted = false;

  isSubmitting = false;

  userForm: FormGroup;


  constructor(private fb: FormBuilder) {

    this.userForm = this.fb.group(

      {
        userName: [
          '',
          [
            Validators.required,
            Validators.maxLength(200),
            this.noWhitespaceValidator()
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.maxLength(200),
            this.noWhitespaceValidator(),
            Validators.pattern(
              /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
            ),
          ]
        ],

        phoneNumber: [
          '',
          [
            Validators.required,

            Validators.minLength(10),

            Validators.maxLength(10),

            Validators.pattern(
              /^[0-9]{10}$/
            ),

            this.noWhitespaceValidator()
          ]
        ],

        password: [''],

        roleId: [
          null,
          Validators.required
        ],

        createdBy: [''],

        updatedBy: ['']
      },

      {
        validators: [
          this.duplicateUserValidator()
        ]
      }

    );
  }


  
  // --------------------------------------------------
  // Form controls
  // --------------------------------------------------

  get f() {
    return this.userForm.controls;
  }


  // --------------------------------------------------
  // Edit mode
  // --------------------------------------------------

  get isEditMode(): boolean {

    return !!this.user;

  }


  // --------------------------------------------------
  // No whitespace validator
  // --------------------------------------------------

  noWhitespaceValidator(): ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const stringValue = String(value);

      if (stringValue.trim().length === 0) {
        return {
          whitespace: true
        };
      }

      if (stringValue !== stringValue.trim()) {
        return {
          whitespace: true
        };
      }

      return null;
    };
  }


  // --------------------------------------------------
  // Duplicate combination validator
  // User Id + Email + Phone + Role
  // --------------------------------------------------

  duplicateUserValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      if (!this.users?.length) {
        return null;
      }

      const userName = String(control.get('userName')?.value ?? '')
        .trim()
        .toLowerCase();

      const email = String(control.get('email')?.value ?? '')
        .trim()
        .toLowerCase();

      const phoneNumber = String(control.get('phoneNumber')?.value ?? '')
        .trim();

      const roleId = String(control.get('roleId')?.value ?? '')
        .trim();

      // Don't check duplicate until all required
      // combination fields have valid values.
      if (!userName || !email || !phoneNumber || !roleId) {
        return null;
      }

      const currentUserId = this.user?.id
        ? String(this.user.id)
        : null;

      const duplicate = this.users.some(existingUser => {

        const existingId = existingUser.id
          ? String(existingUser.id)
          : null;

        // Ignore current record while editing
        if (
          currentUserId &&
          existingId === currentUserId
        ) {
          return false;
        }

        return (
          String(existingUser.userName ?? '')
            .trim()
            .toLowerCase() === userName &&

          String(existingUser.email ?? '')
            .trim()
            .toLowerCase() === email &&

          String(existingUser.phoneNumber ?? '')
            .trim() === phoneNumber &&

          String(existingUser.roleId ?? '')
            .trim() === roleId
        );
      });

      return duplicate
        ? { duplicate: true }
        : null;
    };
  }


  // --------------------------------------------------
  // Input changes
  // --------------------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.user)

    if (this.user) {

      this.userForm.patchValue({
        userName: this.user.userName ?? '',
        email: this.user.email ?? '',
        phoneNumber: this.user.phoneNumber ?? '',
        password: this.user.password,
        roleId: this.user.roleId ?? null
      });

      // Password optional in edit
      this.userForm.controls['password'].clearValidators();

    } else {

      this.userForm.reset({
        userName: '',
        email: '',
        phoneNumber: '',
        password: '',
        roleId: null,
        createdBy: '',
        updatedBy: ''
      });

      // Password required in create
      this.userForm.controls['password'].setValidators([
        Validators.required,
        this.passwordMinLengthValidator(),
        this.passwordUppercaseValidator(),
        this.passwordLowercaseValidator(),
        this.passwordNumberValidator(),
        this.passwordSpecialCharacterValidator()
      ]);
    }

    this.userForm.controls['password'].updateValueAndValidity();

    /*
     * Important:
     * Duplicate validation depends on users and user inputs.
     */
    this.userForm.updateValueAndValidity();

    this.submitted = false;
    this.isSubmitting = false;
  }


  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  submit(): void {

    this.submitted = true;

    this.userForm.markAllAsTouched();

    this.userForm.updateValueAndValidity();

    if (this.userForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.userForm.value;

    this.save.emit({

      id: this.user?.id ?? null,

      userName: String(formValue.userName).trim(),

      email: String(formValue.email).trim(),

      phoneNumber: String(formValue.phoneNumber).trim(),

      password: formValue.password,

      roleId: formValue.roleId

    });
  }


  // --------------------------------------------------
  // Cancel
  // --------------------------------------------------

  cancel(): void {

    this.close.emit();

  }

  passwordStrength: 'Poor' | 'Good' | 'Excellent' | '' = '';

  getPasswordStrength(): void {

    const password = String(
      this.userForm.get('password')?.value ?? ''
    );

    if (!password) {
      this.passwordStrength = '';
      return;
    }

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    const score =
      Number(hasMinLength) +
      Number(hasUppercase) +
      Number(hasLowercase) +
      Number(hasNumber) +
      Number(hasSpecial);

    if (score <= 2) {
      this.passwordStrength = 'Poor';
    }
    else if (score <= 4) {
      this.passwordStrength = 'Good';
    }
    else {
      this.passwordStrength = 'Excellent';
    }
  }

  passwordMinLengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '');

      if (!value) {
        return null;
      }

      return value.length >= 8
        ? null
        : { passwordMinLength: true };
    };
  }

  passwordUppercaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '');

      if (!value) {
        return null;
      }

      return /[A-Z]/.test(value)
        ? null
        : { passwordUppercase: true };
    };
  }

  passwordLowercaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '');

      if (!value) {
        return null;
      }

      return /[a-z]/.test(value)
        ? null
        : { passwordLowercase: true };
    };
  }

  passwordNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '');

      if (!value) {
        return null;
      }

      return /\d/.test(value)
        ? null
        : { passwordNumber: true };
    };
  }

  passwordSpecialCharacterValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '');

      if (!value) {
        return null;
      }

      return /[@$!%*?&]/.test(value)
        ? null
        : { passwordSpecialCharacter: true };
    };
  }

}



function inject(ValidationService: any) {
    throw new Error('Function not implemented.');
}
