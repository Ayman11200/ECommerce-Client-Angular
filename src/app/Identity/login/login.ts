import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IdentityService } from '../identity-service';
import { ToastrService } from '@relynn/ngx-toastr';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private identityService: IdentityService,
    private toastr: ToastrService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[0-9])(?=.*[#$@!.\-])[A-Za-z\d#$@!.\-]{8,}$/),
        ],
      ],
    });
  }

  get _email() {
    return this.loginForm.get('email');
  }

  get _password() {
    return this.loginForm.get('password');
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.identityService.login(this.loginForm.value).subscribe({
      next: () => {
        this.toastr.success('You have logged in successfully.', 'SUCCESS');

        this.router.navigateByUrl('/');
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message ?? 'Invalid email or password.', 'LOGIN FAILED');
      },
    });
  }

  emailModel = '';

  sendPasswordResetEmail(): void {
    const email = this.emailModel.trim();

    if (!email) {
      this.toastr.warning('Please enter your email address.', 'EMAIL REQUIRED');
      return;
    }
    this.identityService.forgotPassword(email).subscribe({
      next: () => {
        this.toastr.success(
          'If the account exists, password-reset instructions will be sent.',
          'REQUEST SUBMITTED',
        );
      },
      error: (err) => {
        this.toastr.error(
          'Could not submit the password-reset request. Please try again.',
          'REQUEST FAILED',
        );
      },
    });
  }
}
