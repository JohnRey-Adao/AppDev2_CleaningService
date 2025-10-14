import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CustomerDashboardComponent } from './components/dashboard/customer-dashboard/customer-dashboard.component';
import { CleanerDashboardComponent } from './components/dashboard/cleaner-dashboard/cleaner-dashboard.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
import { SuperAdminDashboardComponent } from './components/dashboard/super-admin-dashboard/super-admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'customer-dashboard', 
    component: CustomerDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] }
  },
  { 
    path: 'cleaner-dashboard', 
    component: CleanerDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CLEANER'] }
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  { 
    path: 'super-admin-dashboard', 
    component: SuperAdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_SUPER_ADMIN'] }
  },
  { path: '**', redirectTo: '' }
];
