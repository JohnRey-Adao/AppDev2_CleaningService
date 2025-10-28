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
    <!-- Hero Section -->
    <div class="hero-section text-white py-5">
      <div class="container text-center">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <h1 class="display-3 fw-bold mb-4">Professional Cleaning Services</h1>
            <p class="lead mb-5 fs-4">Book reliable cleaners for your home or office. Quality service guaranteed with our trusted professionals!</p>
            <div class="d-flex justify-content-center gap-4 flex-wrap">
              <a routerLink="/register" class="btn btn-light btn-lg px-4 py-3">
                <i class="fas fa-user-plus me-2"></i>Get Started
              </a>
              <a routerLink="/login" class="btn btn-outline-light btn-lg px-4 py-3">
                <i class="fas fa-sign-in-alt me-2"></i>Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="container py-5">
      <div class="row">
        <div class="col-12 text-center mb-5">
          <h2 class="display-5 fw-bold text-primary mb-3">Why Choose Our Service?</h2>
          <p class="lead text-secondary">Experience the difference with our professional cleaning solutions</p>
        </div>
      </div>
      
      <div class="row g-4">
        <div class="col-lg-4 col-md-6">
          <div class="card h-100 text-center dashboard-card">
            <div class="card-body p-4">
              <div class="mb-4">
                <i class="fas fa-home fa-3x text-primary"></i>
              </div>
              <h5 class="card-title fw-bold">For Customers</h5>
              <p class="card-text text-secondary">Book professional cleaners for your home. Easy scheduling, reliable service, and competitive rates.</p>
              <a routerLink="/register" class="btn btn-primary">Register as Customer</a>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-6">
          <div class="card h-100 text-center dashboard-card">
            <div class="card-body p-4">
              <div class="mb-4">
                <i class="fas fa-broom fa-3x text-primary"></i>
              </div>
              <h5 class="card-title fw-bold">For Cleaners</h5>
              <p class="card-text text-secondary">Join our network of professional cleaners and earn money by providing quality cleaning services.</p>
              <a routerLink="/register" class="btn btn-primary">Register as Cleaner</a>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4 col-md-6">
          <div class="card h-100 text-center dashboard-card">
            <div class="card-body p-4">
              <div class="mb-4">
                <i class="fas fa-shield-alt fa-3x text-primary"></i>
              </div>
              <h5 class="card-title fw-bold">Trusted & Secure</h5>
              <p class="card-text text-secondary">All our cleaners are verified and insured. Your safety and satisfaction are our top priorities.</p>
              <div class="mt-3">
                <span class="badge bg-success me-2">Verified</span>
                <span class="badge bg-primary me-2">Insured</span>
                <span class="badge bg-warning">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- How It Works Section -->
    <div class="bg-light py-5">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="display-5 fw-bold text-primary mb-3">How It Works</h2>
            <p class="lead text-secondary">Simple steps to get your space cleaned professionally</p>
          </div>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4 text-center">
            <div class="step-number text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <span class="fw-bold fs-3">1</span>
            </div>
            <h4 class="fw-bold mb-3">Register</h4>
            <p class="text-secondary">Create your account in minutes. Choose to be a customer or cleaner.</p>
          </div>
          
          <div class="col-md-4 text-center">
            <div class="step-number text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <span class="fw-bold fs-3">2</span>
            </div>
            <h4 class="fw-bold mb-3">Browse & Book</h4>
            <p class="text-secondary">Find available cleaners in your area and book your preferred time slot.</p>
          </div>
          
          <div class="col-md-4 text-center">
            <div class="step-number text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 80px; height: 80px;">
              <span class="fw-bold fs-3">3</span>
            </div>
            <h4 class="fw-bold mb-3">Enjoy Clean Space</h4>
            <p class="text-secondary">Relax while our professionals take care of your cleaning needs.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="container py-5">
      <div class="row text-center">
        <div class="col-md-3 col-6 mb-4">
          <div class="h2 fw-bold text-primary">500+</div>
          <div class="text-secondary">Happy Customers</div>
        </div>
        <div class="col-md-3 col-6 mb-4">
          <div class="h2 fw-bold text-primary">100+</div>
          <div class="text-secondary">Professional Cleaners</div>
        </div>
        <div class="col-md-3 col-6 mb-4">
          <div class="h2 fw-bold text-primary">1000+</div>
          <div class="text-secondary">Cleaning Jobs</div>
        </div>
        <div class="col-md-3 col-6 mb-4">
          <div class="h2 fw-bold text-primary">4.9★</div>
          <div class="text-secondary">Average Rating</div>
        </div>
      </div>
    </div>
  `,
  styles: []
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
