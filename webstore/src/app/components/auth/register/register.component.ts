import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card">
          <div class="card-header text-center">
            <h4><i class="fas fa-user-plus me-2"></i>Register</h4>
          </div>
          <div class="card-body">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="firstName" class="form-label">First Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="firstName"
                    formControlName="firstName"
                    [class.is-invalid]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                    First name is required
                  </div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="lastName"
                    formControlName="lastName"
                    [class.is-invalid]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                    Last name is required
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username"
                  formControlName="username"
                  [class.is-invalid]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
                >
                <div class="invalid-feedback" *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
                  Username is required (3-20 characters)
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email"
                  formControlName="email"
                  [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                >
                <div class="invalid-feedback" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                  Valid email is required
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password"
                  formControlName="password"
                  [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                >
                <div class="invalid-feedback" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                  Password is required (6-40 characters)
                </div>
              </div>

              <div class="mb-3">
                <label for="phoneNumber" class="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phoneNumber"
                  formControlName="phoneNumber"
                >
              </div>

              <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="address"
                  formControlName="address"
                  [class.is-invalid]="registerForm.get('address')?.invalid && registerForm.get('address')?.touched"
                >
                <div class="invalid-feedback" *ngIf="registerForm.get('address')?.invalid && registerForm.get('address')?.touched">
                  Address is required
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="city" class="form-label">City</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="city"
                    formControlName="city"
                  >
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="region" class="form-label">Region/Province</label>
                  <select 
                    class="form-control" 
                    id="region"
                    formControlName="region"
                  >
                    <option value="">Select Region/Province</option>
                    <option value="NCR">National Capital Region (NCR)</option>
                    <option value="Region I">Region I - Ilocos</option>
                    <option value="Region II">Region II - Cagayan Valley</option>
                    <option value="Region III">Region III - Central Luzon</option>
                    <option value="Region IV-A">Region IV-A - CALABARZON</option>
                    <option value="Region IV-B">Region IV-B - MIMAROPA</option>
                    <option value="Region V">Region V - Bicol</option>
                    <option value="Region VI">Region VI - Western Visayas</option>
                    <option value="Region VII">Region VII - Central Visayas</option>
                    <option value="Region VIII">Region VIII - Eastern Visayas</option>
                    <option value="Region IX">Region IX - Zamboanga Peninsula</option>
                    <option value="Region X">Region X - Northern Mindanao</option>
                    <option value="Region XI">Region XI - Davao</option>
                    <option value="Region XII">Region XII - SOCCSKSARGEN</option>
                    <option value="Region XIII">Region XIII - Caraga</option>
                    <option value="BARMM">Bangsamoro Autonomous Region in Muslim Mindanao</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="postalCode" class="form-label">Postal Code</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="postalCode"
                    formControlName="postalCode"
                  >
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="country" class="form-label">Country</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="country"
                    formControlName="country"
                    value="Philippines"
                    readonly
                  >
                </div>
              </div>
              
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" [disabled]="registerForm.invalid || isLoading">
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Register
                </button>
              </div>
            </form>
            
            <div class="alert alert-danger mt-3" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
            
            <div class="alert alert-success mt-3" *ngIf="successMessage">
              {{ successMessage }}
            </div>
            
            <div class="text-center mt-3">
              <p>Already have an account? <a routerLink="/login">Login here</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
      phoneNumber: [''],
      address: ['', Validators.required],
      city: [''],
      region: [''],
      postalCode: [''],
      country: ['Philippines']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const formData = { ...this.registerForm.value };
      
      this.http.post(`http://localhost:8080/api/customers/register`, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! You can now log in as a customer.';
          this.registerForm.reset();
          this.registerForm.patchValue({ country: 'Philippines' });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
