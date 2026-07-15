import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsApiService } from '../../../services/cms-api-service.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {

  submitted = false;

  forgotForm: FormGroup;

  constructor(private fb: FormBuilder, private apiservice: CmsApiService) {

    this.forgotForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]

    });

  }

  get f() {
    return this.forgotForm.controls;
  }

  sendResetLink() {

    this.submitted = true;

    if (this.forgotForm.invalid) {
      return;
    }

    console.log(this.forgotForm.value);


    this.apiservice
      .forgotPassword(this.forgotForm.value.email)
      .subscribe({
        next: (res: any) => {
          console.log(res);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

}
