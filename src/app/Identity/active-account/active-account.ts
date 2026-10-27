import { Component, OnInit } from '@angular/core';
import { IActiveAccount } from '../../Shared/Models/IActiveAccount';
import { IdentityService } from '../identity-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { take, timer } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-active-account',
  styleUrl: './active-account.scss',
  templateUrl: './active-account.html',
})
export class ActiveAccount implements OnInit {
  params: IActiveAccount = { email: '', token: '' };

  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private identityService: IdentityService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(take(1)).subscribe((param) => {
      const email = param['email'];
      const token = param['token'];

      if (!email || !token) {
        this.isLoading = false;
        this.errorMessage = 'The activation link is invalid or incomplete.';
        return;
      }

      this.params = { email, token };

      this.identityService.active(this.params).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSuccess = true;

          this.toastr.success('Your account has been activated successfully.', 'SUCCESS');

          timer(2500)
            .pipe(take(1))
            .subscribe(() => this.goToLogin());
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Activation failed. The link may be invalid or expired.';

          this.toastr.error(this.errorMessage, 'ACTIVATION FAILED');
        },
      });
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
