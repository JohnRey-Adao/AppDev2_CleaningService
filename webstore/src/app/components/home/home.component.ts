import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hero-section bg-primary text-white py-5 mb-5">
      <div class="container text-center">
        <h1 class="display-4 fw-bold mb-4">Professional Cleaning Services</h1>
        <p class="lead mb-4">Book reliable cleaners for your home or office. Quality service guaranteed!</p>
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/register" class="btn btn-light btn-lg">
            <i class="fas fa-user-plus me-2"></i>Get Started
          </a>
          <a routerLink="/login" class="btn btn-outline-light btn-lg">
            <i class="fas fa-sign-in-alt me-2"></i>Login
          </a>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-lg-12 mb-4">
          <div class="card h-100 text-center">
            <div class="card-body">
              <i class="fas fa-home fa-3x text-primary mb-3"></i>
              <h5 class="card-title">For Customers</h5>
              <p class="card-text">Book professional cleaners for your home. Easy scheduling, reliable service, and competitive rates.</p>
              <a routerLink="/register" class="btn btn-primary">Register as Customer</a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mt-5">
        <div class="col-12">
          <h2 class="text-center mb-4">How It Works</h2>
          <div class="row">
            <div class="col-md-4 text-center mb-4">
              <div class="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                <span class="fw-bold">1</span>
              </div>
              <h5>Register</h5>
              <p>Create your customer account to get started.</p>
            </div>
            <div class="col-md-4 text-center mb-4">
              <div class="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                <span class="fw-bold">2</span>
              </div>
              <h5>Browse</h5>
              <p>Find available cleaners in your area.</p>
            </div>
            <div class="col-md-4 text-center mb-4">
              <div class="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                <span class="fw-bold">3</span>
              </div>
              <h5>Book</h5>
              <p>Schedule cleaning services at your convenience and enjoy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    }
    
    .step-number {
      font-size: 1.5rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if (user?.roles?.includes('ROLE_SUPER_ADMIN')) {
        this.router.navigate(['/super-admin-dashboard']);
        return;
      }
      if (user?.roles?.includes('ROLE_ADMIN')) {
        this.router.navigate(['/admin-dashboard']);
        return;
      }
      if (user?.roles?.includes('ROLE_CLEANER')) {
        this.router.navigate(['/cleaner-dashboard']);
        return;
      }
      if (user?.roles?.includes('ROLE_CUSTOMER')) {
        this.router.navigate(['/customer-dashboard']);
        return;
      }
    }
  }
}
