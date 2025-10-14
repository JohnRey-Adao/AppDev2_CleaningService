import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Customer, Cleaner, Booking, Admin, AdminRegistrationRequest, CleanerRegistrationRequest } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css']
})
export class SuperAdminDashboardComponent implements OnInit {
  customers: Customer[] = [];
  cleaners: Cleaner[] = [];
  pendingCleaners: Cleaner[] = [];
  admins: Admin[] = [];
  bookings: Booking[] = [];
  recentBookings: Booking[] = [];
  
  totalUsers = 0;
  totalCustomers = 0;
  totalCleaners = 0;
  totalAdmins = 0;
  totalBookings = 0;
  completedBookings = 0;
  pendingBookings = 0;
  availableCleaners = 0;
  activeCustomers = 0;
  totalRevenue = 0;

  // Tab navigation
  activeTab = 'overview';

  // Admin creation
  showCreateAdminForm = false;
  isCreating = false;
  errorMessage = '';
  successMessage = '';

  // Cleaner management
  showCreateCleanerForm = false;
  showPendingCleaners = false;
  pendingCleanersCount = 0;
  
  newAdmin: AdminRegistrationRequest = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    adminLevel: 'ADMIN'
  };

  newCleaner: CleanerRegistrationRequest = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    hourlyRate: 0,
    bio: '',
    profilePicture: ''
  };

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadCustomers();
    this.loadCleaners();
    this.loadAdmins();
    this.loadBookings();
    this.loadPendingCleaners();
  }

  // Tab navigation methods
  setActiveTab(tabName: string) {
    console.log('Switching to tab:', tabName);
    this.activeTab = tabName;
  }

  // Authentication helper
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Data loading methods
  loadCustomers() {
    this.http.get<Customer[]>('http://localhost:8080/api/customers', { headers: this.getAuthHeaders() }).subscribe({
      next: (customers) => {
        this.customers = customers;
        this.totalCustomers = customers.length;
        this.activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
        this.updateTotalUsers();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.errorMessage = 'Failed to load customers. Please try again.';
      }
    });
  }

  loadCleaners() {
    this.http.get<Cleaner[]>('http://localhost:8080/api/cleaners', { headers: this.getAuthHeaders() }).subscribe({
      next: (cleaners) => {
        this.cleaners = cleaners;
        this.totalCleaners = cleaners.length;
        this.availableCleaners = cleaners.filter(c => c.cleanerStatus === 'AVAILABLE').length;
        this.updateTotalUsers();
      },
      error: (error) => {
        console.error('Error loading cleaners:', error);
        this.errorMessage = 'Failed to load cleaners. Please try again.';
      }
    });
  }

  loadAdmins() {
    this.http.get<Admin[]>('http://localhost:8080/api/admins', { headers: this.getAuthHeaders() }).subscribe({
      next: (admins) => {
        this.admins = admins;
        this.totalAdmins = admins.length;
        this.updateTotalUsers();
      },
      error: (error) => {
        console.error('Error loading admins:', error);
        this.errorMessage = 'Failed to load admins. Please try again.';
      }
    });
  }

  loadBookings() {
    this.http.get<Booking[]>('http://localhost:8080/api/bookings', { headers: this.getAuthHeaders() }).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.recentBookings = bookings.slice(0, 10);
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.errorMessage = 'Failed to load bookings. Please try again.';
      }
    });
  }

  // Statistics calculation
  updateTotalUsers() {
    this.totalUsers = this.totalCustomers + this.totalCleaners + this.totalAdmins;
  }

  calculateStats() {
    this.totalBookings = this.bookings.length;
    this.completedBookings = this.bookings.filter(b => b.status === 'COMPLETED').length;
    this.pendingBookings = this.bookings.filter(b => b.status === 'PENDING').length;
    this.totalRevenue = this.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);
  }

  // Admin management methods
  createAdmin() {
    this.isCreating = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Transform the form data to match the backend Admin entity structure
    const adminData = {
      username: this.newAdmin.username,
      email: this.newAdmin.email,
      password: this.newAdmin.password,
      firstName: this.newAdmin.firstName,
      lastName: this.newAdmin.lastName,
      phoneNumber: this.newAdmin.phoneNumber || null,
      adminLevel: this.newAdmin.adminLevel
    };

    this.http.post('http://localhost:8080/api/admins/create', adminData, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.isCreating = false;
        this.successMessage = 'Admin created successfully!';
        this.loadAdmins();
        this.closeCreateAdminForm();
        this.resetNewAdminForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isCreating = false;
        console.error('Error creating admin:', error);
        
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid data provided. Please check all fields.';
        } else if (error.status === 409) {
          this.errorMessage = 'Username or email already exists.';
        } else if (error.status === 403) {
          this.errorMessage = 'You do not have permission to create admins.';
        } else {
          this.errorMessage = 'Failed to create admin. Please try again.';
        }
      }
    });
  }

  deleteAdmin(adminId: number) {
    if (confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      this.http.delete(`http://localhost:8080/api/admins/${adminId}`, { headers: this.getAuthHeaders() }).subscribe({
        next: () => {
          this.successMessage = 'Admin deleted successfully!';
          this.loadAdmins();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error deleting admin:', error);
          
          if (error.status === 403) {
            this.errorMessage = 'You do not have permission to delete this admin.';
          } else if (error.status === 404) {
            this.errorMessage = 'Admin not found.';
          } else {
            this.errorMessage = 'Failed to delete admin. Please try again.';
          }
        }
      });
    }
  }

  closeCreateAdminForm() {
    this.showCreateAdminForm = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetNewAdminForm();
  }

  resetNewAdminForm() {
    this.newAdmin = {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      phoneNumber: '',
      adminLevel: 'ADMIN'
    };
  }

  // Utility methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'CONFIRMED': return 'bg-info';
      case 'IN_PROGRESS': return 'bg-primary';
      case 'COMPLETED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      case 'AVAILABLE': return 'bg-success';
      case 'BUSY': return 'bg-warning';
      case 'OFFLINE': return 'bg-secondary';
      case 'ON_BREAK': return 'bg-info';
      case 'PENDING_APPROVAL': return 'bg-warning';
      case 'REJECTED': return 'bg-danger';
      case 'ACTIVE': return 'bg-success';
      case 'INACTIVE': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  // Cleaner management methods
  loadPendingCleaners() {
    this.http.get<Cleaner[]>('http://localhost:8080/api/cleaners/pending-approval', { headers: this.getAuthHeaders() }).subscribe({
      next: (cleaners) => {
        this.pendingCleaners = cleaners;
        this.pendingCleanersCount = cleaners.length;
        // Automatically show pending cleaners section if there are any
        if (cleaners.length > 0) {
          this.showPendingCleaners = true;
        }
      },
      error: (error) => {
        console.error('Error loading pending cleaners:', error);
      }
    });
  }

  createCleaner() {
    this.isCreating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:8080/api/cleaners/register', this.newCleaner, { headers: this.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.isCreating = false;
        this.successMessage = 'Cleaner created successfully!';
        this.loadCleaners();
        this.closeCreateCleanerForm();
        this.resetNewCleanerForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isCreating = false;
        console.error('Error creating cleaner:', error);
        
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid data provided. Please check all fields.';
        } else if (error.status === 409) {
          this.errorMessage = 'Username or email already exists.';
        } else {
          this.errorMessage = 'Failed to create cleaner. Please try again.';
        }
      }
    });
  }

  approveCleaner(cleanerId: number) {
    this.errorMessage = '';
    this.successMessage = '';
    
    // Check if token is expired
    if (!this.authService.refreshTokenIfNeeded()) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      return;
    }
    
    this.http.put(`http://localhost:8080/api/cleaners/${cleanerId}/approve`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.successMessage = 'Cleaner approved successfully!';
        this.loadCleaners();
        this.loadPendingCleaners();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error approving cleaner:', error);
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Your session may have expired or there was a server configuration change. Please log in again.';
          this.authService.logout();
        } else if (error.status === 403) {
          this.errorMessage = 'You do not have permission to approve cleaners.';
        } else if (error.status === 404) {
          this.errorMessage = 'Cleaner not found.';
        } else {
          this.errorMessage = 'Failed to approve cleaner. Please try again.';
        }
      }
    });
  }

  rejectCleaner(cleanerId: number) {
    if (confirm('Are you sure you want to reject this cleaner application?')) {
      this.errorMessage = '';
      this.successMessage = '';
      
      // Check if token is expired
      if (!this.authService.refreshTokenIfNeeded()) {
        this.errorMessage = 'Your session has expired. Please log in again.';
        return;
      }
      
      this.http.put(`http://localhost:8080/api/cleaners/${cleanerId}/reject`, {}, { headers: this.getAuthHeaders() }).subscribe({
        next: () => {
          this.successMessage = 'Cleaner application rejected.';
          this.loadCleaners();
          this.loadPendingCleaners();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error rejecting cleaner:', error);
          if (error.status === 401) {
            this.errorMessage = 'Authentication failed. Your session may have expired or there was a server configuration change. Please log in again.';
            this.authService.logout();
          } else if (error.status === 403) {
            this.errorMessage = 'You do not have permission to reject cleaners.';
          } else if (error.status === 404) {
            this.errorMessage = 'Cleaner not found.';
          } else {
            this.errorMessage = 'Failed to reject cleaner. Please try again.';
          }
        }
      });
    }
  }

  closeCreateCleanerForm() {
    this.showCreateCleanerForm = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetNewCleanerForm();
  }

  resetNewCleanerForm() {
    this.newCleaner = {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      phoneNumber: '',
      address: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      hourlyRate: 0,
      bio: '',
      profilePicture: ''
    };
  }
}