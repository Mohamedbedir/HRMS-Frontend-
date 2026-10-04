import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  isLoading = false;
  errorMessage = '';

  loginform = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  get email(){
    return this.loginform.get("email")
  }
  get password(){
    return this.loginform.get("password")
  }

  submit(): void {
    if (this.loginform.invalid) {
      this.loginform.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginform.getRawValue()).subscribe({
      next: (response) => {
        if (!response.succeeded) {
          this.isLoading = false;
          this.toastr.error(
            response.message || response.errors?.[0] || 'Login failed. Please check your credentials.',
            'Login failed',
          );
          return;
        }

        this.authService.saveLoginTokens(response.data.accessToken, response.data.refreshToken);

        this.isLoading = false;
        this.toastr.success('Login successful!', 'Success');
        this.router.navigate(['auth/register']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const message =
          err.error?.message ||
          err.error?.errors?.[0] ||
          'Login failed. Please check your credentials.';

        this.toastr.error(message, 'Login failed');
      },
    });
  }
}