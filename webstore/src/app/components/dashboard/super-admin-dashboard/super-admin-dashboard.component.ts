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

  // Cleaner creation (optional)
  showCreateCleanerForm = false;

  newAdmin: AdminRegistrationRequest = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    adminLevel: 'ADMIN'
  };

  // Cleaner creation form state
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
    this.http.get<Customer[]>('http://localhost:8080/api/customers', { headers: this.getAuthHeaders() }).subscribe({
      next: (customers) => {
        this.customers = customers;
        this.totalCustomers = customers.length;
        this.activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
        this.updateTotals();
      }
    });
  }

  loadCleaners() {
    this.http.get<Cleaner[]>('http://localhost:8080/api/cleaners', { headers: this.getAuthHeaders() }).subscribe({
      next: (cleaners) => {
        this.cleaners = cleaners;
        this.totalCleaners = cleaners.length;
        this.availableCleaners = cleaners.filter(c => c.cleanerStatus === 'AVAILABLE').length;
        this.updateTotals();
      }
    });
  }

  loadAdmins() {
    this.http.get<Admin[]>('http://localhost:8080/api/admins', { headers: this.getAuthHeaders() }).subscribe({
      next: (admins) => {
        this.admins = admins;
        this.totalAdmins = admins.length;
        this.updateTotals();
      }
    });
  }

  loadBookings() {
    this.http.get<Booking[]>('http://localhost:8080/api/bookings', { headers: this.getAuthHeaders() }).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.recentBookings = bookings.slice(0, 10);
        this.calculateStats();
      }
    });
  }

  // Totals and stats
  updateTotals() {
    this.totalUsers = this.totalCustomers + this.totalCleaners + this.totalAdmins;
  }

  calculateStats() {
    this.totalBookings = this.bookings.length;
    this.completedBookings = this.bookings.filter(b => b.status === 'COMPLETED').length;
    this.pendingBookings = this.bookings.filter(b => b.status === 'PENDING').length;
    this.totalRevenue = this.bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.totalAmount, 0);
  }

  // Helpers used by template
  formatDate(dateString: string): string { return new Date(dateString).toLocaleDateString(); }
  getStatusClass(status: string): string { switch (status) { case 'PENDING': return 'bg-warning'; case 'CONFIRMED': return 'bg-info'; case 'IN_PROGRESS': return 'bg-primary'; case 'COMPLETED': return 'bg-success'; case 'CANCELLED': return 'bg-danger'; case 'AVAILABLE': return 'bg-success'; case 'BUSY': return 'bg-warning'; case 'OFFLINE': return 'bg-secondary'; case 'ON_BREAK': return 'bg-info'; case 'ACTIVE': return 'bg-success'; case 'INACTIVE': return 'bg-secondary'; default: return 'bg-secondary'; } }
  getCurrentDate(): string { return new Date().toLocaleDateString(); }

  // Cleaner actions
  viewCleaner(cleanerId: number) {
    this.http.get<Cleaner>(`http://localhost:8080/api/cleaners/${cleanerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (cleaner) => alert(`${cleaner.firstName} ${cleaner.lastName}\nEmail: ${cleaner.email}\nRate: ₱${cleaner.hourlyRate}/hr\nStatus: ${cleaner.cleanerStatus}`)
    });
  }

  editCleanerRate(cleaner: Cleaner) {
    const input = prompt('Enter new hourly rate (₱):', String(cleaner.hourlyRate));
    if (input === null) return;
    const newRate = Number(input);
    if (isNaN(newRate) || newRate < 0) return alert('Invalid rate');
    this.http.put(`http://localhost:8080/api/cleaners/${cleaner.id}/rate?hourlyRate=${newRate}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.successMessage = 'Cleaner updated'; this.loadCleaners(); }
    });
  }

  deleteCleaner(cleanerId: number) {
    if (!confirm('Delete this cleaner?')) return;
    this.http.delete(`http://localhost:8080/api/cleaners/${cleanerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.successMessage = 'Cleaner deleted'; this.loadCleaners(); },
      error: (err) => {
        console.error('Failed to delete cleaner', err);
        const msg = err?.error || err?.message || 'Failed to delete cleaner';
        alert(typeof msg === 'string' ? msg : 'Failed to delete cleaner');
      }
    });
  }

  // Customer actions
  viewCustomer(customerId: number) {
    this.http.get<Customer>(`http://localhost:8080/api/customers/${customerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (customer) => alert(`${customer.firstName} ${customer.lastName}\nEmail: ${customer.email}\nPhone: ${customer.phoneNumber || 'N/A'}\nAddress: ${customer.address}`)
    });
  }

  editCustomer(customer: Customer) {
    const newPhone = prompt('Update phone number:', customer.phoneNumber || '');
    if (newPhone === null) return;
    const updated: Customer = { ...customer, phoneNumber: newPhone } as Customer;
    this.http.put(`http://localhost:8080/api/customers/${customer.id}`, updated, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.successMessage = 'Customer updated'; this.loadCustomers(); }
    });
  }

  deleteCustomer(customerId: number) {
    if (!confirm('Delete this customer?')) return;
    this.http.delete(`http://localhost:8080/api/customers/${customerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.successMessage = 'Customer deleted'; this.loadCustomers(); }
    });
  }

  // Cleaner creation (modal)
  createCleaner() {
    this.isCreating = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.http.post('http://localhost:8080/api/cleaners/register', this.newCleaner, { headers: this.getAuthHeaders() }).subscribe({
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
        this.errorMessage = 'Failed to create cleaner.';
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
      firstName: '', lastName: '', email: '', username: '', password: '', phoneNumber: '', address: '', city: '', region: '', postalCode: '', country: '', hourlyRate: 0, bio: '', profilePicture: ''
    };
  }

  // Admin management methods
  createAdmin() {
    this.isCreating = true;
    this.errorMessage = '';
    this.successMessage = '';

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
      next: () => {
        this.isCreating = false;
        this.successMessage = 'Admin created successfully!';
        this.loadAdmins();
        this.closeCreateAdminForm();
        this.resetNewAdminForm();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => {
        this.isCreating = false;
        this.errorMessage = 'Failed to create admin.';
      }
    });
  }

  deleteAdmin(adminId: number) {
    if (!confirm('Delete this admin?')) return;
    this.http.delete(`http://localhost:8080/api/admins/${adminId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.successMessage = 'Admin deleted'; this.loadAdmins(); }
    });
  }

  closeCreateAdminForm() {
    this.showCreateAdminForm = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetNewAdminForm();
  }

  resetNewAdminForm() {
    this.newAdmin = { firstName: '', lastName: '', email: '', username: '', password: '', phoneNumber: '', adminLevel: 'ADMIN' };
  }

  getCleanerImage(cleaner: Cleaner): string {
    if (cleaner.profilePicture) {
      // If it's already a full URL, return as is, otherwise prepend backend URL
      return cleaner.profilePicture.startsWith('http') ? cleaner.profilePicture : `http://localhost:8080${cleaner.profilePicture}`;
    }
    return 'assets/images/default-cleaner.svg';
  }
}