import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  @Input() roles: Role[] = [];

  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<User>();

  showPassword = false;

  submitted = false;

  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    

    this.userForm = this.fb.group({

      userName: ['', Validators.required],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/)
        ]
      ],

      password: [''],

      roleId: [
        null,
        Validators.required
      ],

      createdBy: '',
      updatedBy: ''

    });

  }

  get isEditMode() {
    console.log(this.user)
    return !!this.user;
  }

  get f() {
    return this.userForm.controls;
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (this.user) {

      this.userForm.patchValue({

        userName: this.user.userName,

        email: this.user.email,

        phoneNumber: this.user.phoneNumber,

        password: '',

        roleId: this.user.roleId


      });

      this.userForm.controls['password']
        .clearValidators();

    }
    else {

      this.userForm.reset();

      this.userForm.controls['password']
        .setValidators([
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
          )
        ]);

    }

    this.userForm.controls['password']
      .updateValueAndValidity();

    this.submitted = false;

  }

  submit() {

    this.submitted = true;

    if (this.userForm.invalid)
      return;

    this.save.emit({

      id: this.user?.id ?? null,

      ...this.userForm.value

    });

  }

  cancel() {

    this.close.emit();

  }

}
