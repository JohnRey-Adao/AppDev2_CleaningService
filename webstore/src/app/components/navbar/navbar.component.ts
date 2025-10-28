import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <img src="assets/images/Logo_CleaningService.png" alt="Cleaning Service" height="40" class="me-2" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
          <span class="logo-text" style="display: none;">🧹</span>
          Cleaning Service
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active">Home</a>
            </li>
          </ul>
          
          <ul class="navbar-nav" *ngIf="!authService.isLoggedIn()">
            <li class="nav-item">
              <a class="nav-link" routerLink="/login">Login</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/register">Register</a>
            </li>
          </ul>
          
          <ul class="navbar-nav" *ngIf="authService.isLoggedIn()">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                <img [src]="getProfilePicture()" [alt]="getCurrentUser()?.username" 
                     class="rounded-circle me-2" width="32" height="32" 
                     style="object-fit: cover;"
                     (error)="onImageError($event)"
                     (load)="onImageLoad($event)">
                {{ getCurrentUser()?.username }}
              </a>
              <ul class="dropdown-menu">
                <li *ngIf="authService.hasRole('ROLE_CUSTOMER')">
                  <a class="dropdown-item" routerLink="/customer-dashboard">
                    <i class="fas fa-home me-2"></i>Customer Dashboard
                  </a>
                </li>
                <li *ngIf="authService.hasRole('ROLE_CLEANER')">
                  <a class="dropdown-item" routerLink="/cleaner-dashboard">
                    <i class="fas fa-broom me-2"></i>Cleaner Dashboard
                  </a>
                </li>
                <li *ngIf="authService.hasRole('ROLE_ADMIN')">
                  <a class="dropdown-item" routerLink="/admin-dashboard">
                    <i class="fas fa-cog me-2"></i>Admin Dashboard
                  </a>
                </li>
                <li *ngIf="authService.hasRole('ROLE_SUPER_ADMIN')">
                  <a class="dropdown-item" routerLink="/super-admin-dashboard">
                    <i class="fas fa-crown me-2"></i>Super Admin Dashboard
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" (click)="logout()">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  getProfilePicture(): string {
    const user = this.getCurrentUser();
    if (user?.profilePicture) {
      return user.profilePicture;
    }
    return 'assets/images/default-cleaner.jpg';
  }

  onImageError(event: any) {
    console.log('Profile picture failed to load, using default');
    event.target.src = 'assets/images/default-cleaner.jpg';
  }

  onImageLoad(event: any) {
    console.log('Profile picture loaded successfully');
  }

  logout() {
    this.authService.logout();
  }
}
