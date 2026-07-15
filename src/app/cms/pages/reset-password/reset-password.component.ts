import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CmsApiService } from '../../../services/cms-api-service.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {

  submitted = false;

  showPassword = false;
  showConfirm = false;

  email = '';
  token = '';

  loading = false;

  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiservice: CmsApiService,
    private toastr: ToastrService
  ) {

    this.passwordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
            )
          ]
        ],

        confirmPassword: [
          '',
          Validators.required
        ]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  ngOnInit(): void {

    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    // Prevent opening page directly
    if (!this.email || !this.token) {

      this.toastr.error(
        'Invalid or expired password reset link.'
      );

      this.router.navigate(['/']);

      return;
    }
  }

  get f() {
    return this.passwordForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {

    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;

    return password === confirm
      ? null
      : { passwordMismatch: true };
  }

  resetPassword(): void {

    this.submitted = true;

    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;

    const model = {

      email: this.email,

      token: this.token,

      newPassword: this.passwordForm.value.password

    };

    this.apiservice.resetPassword(model).subscribe({

      next: (res: any) => {

        this.loading = false;

        this.toastr.success(res.messageDescription);

        this.router.navigate(['/']);

      },

      error: (err) => {

        this.loading = false;

        this.toastr.error(
          err.error?.messageDescription || 'Unable to reset password.'
        );

      }

    });

  }

}
