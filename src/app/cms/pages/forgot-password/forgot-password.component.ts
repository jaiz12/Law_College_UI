import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsApiService } from '../../../services/cms-api-service.service';
import { ToastrService } from 'ngx-toastr';

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

  isLoading = false;
  constructor(private fb: FormBuilder, private apiservice: CmsApiService, private toastr: ToastrService) {

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
    this.isLoading = true;
    this.apiservice
      .forgotPassword(this.forgotForm.value.email)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.messageType == 'success') {
            this.toastr.success(res.messageDescription,
              res.messageType);
          }
          else {
            this.toastr.error(res.messageDescription,
              res.messageType);
          }
          console.log(res);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.toastr.success(err.messageDescription,
            err.messageType);
        }
      });
  }


}
