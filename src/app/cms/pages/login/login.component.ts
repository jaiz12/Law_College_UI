import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CmsApiService } from '../../../services/cms-api-service.service';
import { Router, RouterModule } from '@angular/router';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;

  showPassword = false;

  submitted = false;
  private platformId = inject(PLATFORM_ID);

  constructor(private fb: FormBuilder, private apiService: CmsApiService, private toastr: ToastrService, private router: Router) { }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const rememberEmail = localStorage.getItem('rememberEmail') || ''
      const rememberMe = localStorage.getItem('rememberMe')

      this.loginForm = this.fb.group({
        email: [
          rememberEmail,
          [
            Validators.required,
            Validators.email
          ]
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            )
          ]
        ],
        remember: [
          rememberMe === 'true'
        ]
      });
    }

  }

  login() {

    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const { email, password, remember } = this.loginForm.value;

    if (remember) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('rememberEmail', email);
        localStorage.setItem('rememberMe', 'true');
      }

    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('rememberEmail');
        localStorage.removeItem('rememberMe');
      }
    }

    const request = {
      email,
      password
    };

    this.apiService.login(request).subscribe({

      next: (response) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);

          localStorage.setItem('user', JSON.stringify(response.user));

        }
        this.router.navigate(['/dashboard']);
        this.toastr.success(
          response.messageDescription,
          'Success'
        );
      },

      error: (err) => {

        this.toastr.error(
          err?.error?.messageDescription ||
          err?.messageDescription ||
          'Something went wrong. Please try again.',
          'Error'
        );
      }

    });

  }

  get f() {
    return this.loginForm.controls;
  }

}
