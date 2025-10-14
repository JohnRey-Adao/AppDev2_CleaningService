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
        <a class="navbar-brand" routerLink="/">
          <i class="fas fa-broom me-2"></i>Cleaning Service
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
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i>{{ getCurrentUser()?.username }}
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

  logout() {
    this.authService.logout();
  }
}
