import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IdentityService } from '../identity-service';
import { ToastrService } from '@relynn/ngx-toastr';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private identityService: IdentityService,
    private toastr: ToastrService,
  ) {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', [Validators.required]],
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

  get _username() {
    return this.registerForm.get('userName');
  }
  get _email() {
    return this.registerForm.get('email');
  }
  get _displayName() {
    return this.registerForm.get('displayName');
  }
  get _password() {
    return this.registerForm.get('password');
  }

  submit() {
    if (this.registerForm.valid) {
      this.identityService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.toastr.success(
            'Register success , please confierm your email',
            'success'.toUpperCase(),
          );
        },
        error: (err:any) => {
          this.toastr.error(err.error.message, 'error'.toUpperCase());
        },
      });
    }
  }
}
