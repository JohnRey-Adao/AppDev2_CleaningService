import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Customer, Cleaner, Booking, CleanerRegistrationRequest } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  customers: Customer[] = [];
  cleaners: Cleaner[] = [];
  bookings: Booking[] = [];
  recentBookings: Booking[] = [];
  
  totalUsers = 0;
  totalCustomers = 0;
  totalCleaners = 0;
  totalBookings = 0;
  completedBookings = 0;
  pendingBookings = 0;
  availableCleaners = 0;
  totalRevenue = 0;

  // Tab navigation
  activeTab = 'overview';

  // Cleaner management
  showCreateCleanerForm = false;
  isCreating = false;
  errorMessage = '';
  successMessage = '';

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
    this.loadBookings();
  }

  // Tab navigation methods
  setActiveTab(tabName: string) {
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
    this.http.get<Customer[]>(`${environment.apiBaseUrl}/customers`, { headers: this.getAuthHeaders() }).subscribe({
      next: (customers) => {
        this.customers = customers;
        this.totalCustomers = customers.length;
        this.updateTotalUsers();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  loadCleaners() {
    this.http.get<Cleaner[]>(`${environment.apiBaseUrl}/cleaners`, { headers: this.getAuthHeaders() }).subscribe({
      next: (cleaners) => {
        this.cleaners = cleaners;
        this.totalCleaners = cleaners.length;
        this.availableCleaners = cleaners.filter(c => c.cleanerStatus === 'AVAILABLE').length;
        this.updateTotalUsers();
      },
      error: (error) => {
        console.error('Error loading cleaners:', error);
      }
    });
  }

  loadBookings() {
    this.http.get<Booking[]>(`${environment.apiBaseUrl}/bookings`, { headers: this.getAuthHeaders() }).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.recentBookings = bookings.slice(0, 10); // Show last 10 bookings
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }

  // Statistics calculation
  updateTotalUsers() {
    this.totalUsers = this.totalCustomers + this.totalCleaners;
  }

  calculateStats() {
    this.totalBookings = this.bookings.length;
    this.completedBookings = this.bookings.filter(b => b.status === 'COMPLETED').length;
    this.pendingBookings = this.bookings.filter(b => b.status === 'PENDING').length;
    this.totalRevenue = this.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);
  }

  // Utility methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getAverageBookingValue(): number {
    if (this.completedBookings === 0) return 0;
    return this.totalRevenue / this.completedBookings;
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
      case 'ACTIVE': return 'bg-success';
      case 'INACTIVE': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  // Cleaner actions
  viewCleaner(cleanerId: number) {
    this.http.get<Cleaner>(`${environment.apiBaseUrl}/cleaners/${cleanerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (cleaner) => {
        alert(`${cleaner.firstName} ${cleaner.lastName}\nEmail: ${cleaner.email}\nRate: ₱${cleaner.hourlyRate}/hr\nStatus: ${cleaner.cleanerStatus}`);
      },
      error: () => alert('Failed to load cleaner details')
    });
  }

  editCleanerRate(cleaner: Cleaner) {
    const input = prompt('Enter new hourly rate (₱):', String(cleaner.hourlyRate));
    if (input === null) return;
    const newRate = Number(input);
    if (isNaN(newRate) || newRate < 0) {
      alert('Invalid rate');
      return;
    }
    this.http.put<Cleaner>(`${environment.apiBaseUrl}/cleaners/${cleaner.id}/rate?hourlyRate=${newRate}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.successMessage = 'Cleaner updated successfully';
        this.loadCleaners();
      },
      error: () => alert('Failed to update cleaner')
    });
  }

  deleteCleaner(cleanerId: number) {
    if (!confirm('Delete this cleaner?')) return;
    this.http.delete(`${environment.apiBaseUrl}/cleaners/${cleanerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.successMessage = 'Cleaner deleted';
        this.loadCleaners();
      },
      error: () => alert('Failed to delete cleaner')
    });
  }

  // Customer actions
  viewCustomer(customerId: number) {
    this.http.get<Customer>(`${environment.apiBaseUrl}/customers/${customerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (customer) => {
        alert(`${customer.firstName} ${customer.lastName}\nEmail: ${customer.email}\nPhone: ${customer.phoneNumber || 'N/A'}\nAddress: ${customer.address}`);
      },
      error: () => alert('Failed to load customer details')
    });
  }

  editCustomer(customer: Customer) {
    const newPhone = prompt('Update phone number:', customer.phoneNumber || '');
    if (newPhone === null) return;
    const updated: Customer = { ...customer, phoneNumber: newPhone } as Customer;
    this.http.put<Customer>(`${environment.apiBaseUrl}/customers/${customer.id}`, updated, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.successMessage = 'Customer updated successfully';
        this.loadCustomers();
      },
      error: () => alert('Failed to update customer')
    });
  }

  deleteCustomer(customerId: number) {
    if (!confirm('Delete this customer?')) return;
    this.http.delete(`${environment.apiBaseUrl}/customers/${customerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.successMessage = 'Customer deleted';
        this.loadCustomers();
      },
      error: () => alert('Failed to delete customer')
    });
  }

  createCleaner() {
    this.isCreating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(`${environment.apiBaseUrl}/cleaners/register`, this.newCleaner, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.isCreating = false;
        this.successMessage = 'Cleaner created successfully!';
        this.loadCleaners();
        this.closeCreateCleanerForm();
        this.resetNewCleanerForm();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => {
        this.isCreating = false;
        this.errorMessage = 'Failed to create cleaner. Please try again.';
      }
    });
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

  getCleanerImage(cleaner: Cleaner): string {
    if (cleaner.profilePicture) {
      // If it's already a full URL, return as is, otherwise prepend backend URL
    return cleaner.profilePicture.startsWith('http') ? cleaner.profilePicture : `${environment.backendBaseUrl}${cleaner.profilePicture}`;
    }
    return 'assets/images/default-cleaner.svg';
  }
}