import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { IdentityService } from '../identity-service';
import { IResetPassword } from '../../Shared/Models/IResetPassword';

const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[#$@!.\-]).{8,}$/;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  resetPasswordForm: FormGroup;
  isSubmitting = false;

  resetPasswordModel: IResetPassword = {
    email: '',
    token: '',
    password: '',
  };

  constructor(
    private fb: FormBuilder,
    private identityService: IdentityService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: ResetPassword.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.queryParamMap;
    this.resetPasswordModel.email = params.get('email') ?? '';
    this.resetPasswordModel.token = params.get('token') ?? '';
  }

  get _password() {
    return this.resetPasswordForm.get('password');
  }

  get _confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  private static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  submit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.resetPasswordModel.email || !this.resetPasswordModel.token) {
      this.toastr.error(
        'The password reset link is missing required information. Please request a new link.',
        'Invalid Reset Link',
      );
      return;
    }

    this.isSubmitting = true;
    this.resetPasswordModel.password = this._password?.value ?? '';

    this.identityService.resetPassword(this.resetPasswordModel).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success(
          'Your password has been reset successfully. You can now sign in with your new password.',
          'Password Reset Successful',
          { timeOut: 5000 },
        );
        this.router.navigateByUrl('/login');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const message =
          err?.error?.message ??
          'We couldn’t reset your password. The link may be invalid or expired. Please try again or request a new reset link.';
        this.toastr.error(message, 'Password Reset Failed', { timeOut: 6000 });
      },
    });
  }
}
