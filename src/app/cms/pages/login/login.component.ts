import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
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

  constructor(private fb: FormBuilder, private apiService: CmsApiService, private toastr: ToastrService, private router: Router) { }


  ngOnInit(): void {

    this.loginForm = this.fb.group({
      email: [
        localStorage.getItem('rememberEmail') || '',
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
        localStorage.getItem('rememberMe') === 'true'
      ]
    });

  }

  login() {

    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const { email, password, remember } = this.loginForm.value;

    if (remember) {

      localStorage.setItem('rememberEmail', email);
      localStorage.setItem('rememberMe', 'true');

    } else {

      localStorage.removeItem('rememberEmail');
      localStorage.removeItem('rememberMe');

    }

    const request = {
      email,
      password
    };

    this.apiService.login(request).subscribe({

      next: (response) => {

        localStorage.setItem('token', response.token);

        localStorage.setItem('user', JSON.stringify(response.user));

        this.router.navigate(['/dashboard']);
        this.toastr.success(
          response.message,
          'Success'
        );
      },

      error: (err) => {

        this.toastr.error(
          err?.error?.message ||
          err?.message ||
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
