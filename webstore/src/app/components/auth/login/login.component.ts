import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-header text-center">
            <h4><i class="fas fa-sign-in-alt me-2"></i>Login</h4>
          </div>
          <div class="card-body">
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username"
                  formControlName="username"
                  [class.is-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
                >
                <div class="invalid-feedback" *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
                  Username is required
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password"
                  formControlName="password"
                  [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                >
                <div class="invalid-feedback" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                  Password is required
                </div>
              </div>
              
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isLoading">
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Login
                </button>
              </div>
            </form>
            
            <div class="alert alert-danger mt-3" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
            
            <div class="text-center mt-3">
              <p>Don't have an account? <a routerLink="/register">Register here</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Redirect based on user role
          if (response.roles.includes('ROLE_SUPER_ADMIN')) {
            this.router.navigate(['/super-admin-dashboard']);
          } else if (response.roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/admin-dashboard']);
          } else if (response.roles.includes('ROLE_CLEANER')) {
            this.router.navigate(['/cleaner-dashboard']);
          } else if (response.roles.includes('ROLE_CUSTOMER')) {
            this.router.navigate(['/customer-dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid username or password';
        }
      });
    }
  }
}
