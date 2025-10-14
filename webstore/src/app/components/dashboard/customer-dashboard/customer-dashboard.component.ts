import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Customer, Cleaner, Booking } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styles: [`
    .cleaner-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
    
    .cleaner-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .cleaner-card.selected {
      border-color: #007bff;
      background-color: #f8f9fa;
    }
    
    .cleaner-image img {
      border: 3px solid #e9ecef;
      transition: border-color 0.3s ease;
    }
    
    .cleaner-card.selected .cleaner-image img {
      border-color: #007bff;
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  customer: Customer | null = null;
  bookings: Booking[] = [];
  availableCleaners: Cleaner[] = [];
  totalBookings = 0;
  pendingBookings = 0;
  completedBookings = 0;
  totalSpent = 0;
  showBookingForm = false;
  activeTab = 'cleaners';
  
  selectedCleanerId: number | null = null;
  bookingDate = '';
  durationHours = 2;
  specialInstructions = '';
  errorMessage = '';
  successMessage = '';
  filteredCleaners: Cleaner[] = [];
  selectedDate = '';
  isFiltering = false;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadCustomerData();
    this.loadAvailableCleaners();
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
    // Refresh bookings when switching to My Bookings tab
    if (tabName === 'bookings') {
      this.loadBookings();
    }
  }

  loadCustomerData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      console.log('Loading customer data for user:', currentUser);
      this.http.get<Customer>(`http://localhost:8080/api/customers/${currentUser.id}`, { headers: this.getAuthHeaders() }).subscribe({
        next: (customer) => {
          console.log('Customer data loaded successfully:', customer);
          this.customer = customer;
          // Load bookings after customer data is loaded
          this.loadBookings();
        },
        error: (error) => {
          console.error('Error loading customer data:', error);
          if (error.status === 401) {
            this.errorMessage = 'Authentication failed. Please log in again.';
            this.authService.logout();
          } else if (error.status === 404) {
            this.errorMessage = 'Customer profile not found. Please contact support.';
          } else {
            this.errorMessage = 'Failed to load customer data. Please try again.';
          }
        }
      });
    } else {
      console.error('No current user found');
      this.errorMessage = 'No user session found. Please log in again.';
    }
  }

  loadBookings() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.http.get<Booking[]>(`http://localhost:8080/api/bookings/customer/${currentUser.id}`, { headers: this.getAuthHeaders() }).subscribe({
        next: (bookings) => {
          this.bookings = bookings;
          this.calculateStats();
          // Clear any previous error messages when bookings load successfully
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          // Only show error message if we're not already showing a success message
          if (!this.successMessage) {
            this.errorMessage = 'Failed to load bookings. Please try again.';
          }
        }
      });
    }
  }

  loadAvailableCleaners() {
    this.http.get<Cleaner[]>('http://localhost:8080/api/cleaners/available', { headers: this.getAuthHeaders() }).subscribe({
      next: (cleaners) => {
        console.log('Loaded cleaners:', cleaners);
        this.availableCleaners = cleaners;
        this.filteredCleaners = cleaners;
        if (cleaners.length === 0) {
          console.log('No cleaners available');
        }
      },
      error: (error) => {
        console.error('Error loading cleaners:', error);
        this.errorMessage = 'Failed to load available cleaners. Please try again.';
      }
    });
  }

  calculateStats() {
    this.totalBookings = this.bookings.length;
    this.pendingBookings = this.bookings.filter(b => b.status === 'PENDING').length;
    this.completedBookings = this.bookings.filter(b => b.status === 'COMPLETED').length;
    this.totalSpent = this.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);
  }

  createBooking() {
    if (!this.selectedCleanerId || !this.bookingDate) {
      this.errorMessage = 'Please select a cleaner and date.';
      return;
    }

    if (!this.customer) {
      this.errorMessage = 'Customer data not loaded. Please refresh the page and try again.';
      return;
    }

    if (!this.customer.id) {
      this.errorMessage = 'Invalid customer ID. Please refresh the page and try again.';
      return;
    }

    // Note: We'll use a fallback address if customer address is not available

    // Format the date for the backend (remove seconds and milliseconds)
    const formattedDate = this.bookingDate ? this.bookingDate.substring(0, 16) : '';
    
    const bookingRequest = {
      customerId: this.customer.id,
      cleanerId: this.selectedCleanerId,
      bookingDate: formattedDate,
      durationHours: this.durationHours,
      specialInstructions: this.specialInstructions || '',
      serviceAddress: this.customer.address || 'Address not provided'
    };

    console.log('Creating booking with request:', bookingRequest);
    console.log('Auth headers:', this.getAuthHeaders());

    this.http.post('http://localhost:8080/api/bookings', bookingRequest, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        // Clear any previous error messages
        this.errorMessage = '';
        this.successMessage = 'Booking created successfully!';
        this.loadBookings();
        this.showBookingForm = false;
        this.resetBookingForm();
        this.filterCleanersByDate();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        console.error('Error details:', error.error);
        
        // Clear any previous success messages
        this.successMessage = '';
        
        if (error.error && typeof error.error === 'string' && error.error.includes('not available')) {
          this.errorMessage = 'This cleaner is not available on the selected date. Please choose another date or cleaner.';
        } else if (error.error && typeof error.error === 'string' && error.error.includes('Error:')) {
          this.errorMessage = error.error;
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid booking data. Please check all fields and try again.';
        } else if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please log in again.';
          this.authService.logout();
        } else {
          this.errorMessage = 'Failed to create booking. Please try again.';
        }
      }
    });
  }

  cancelBooking(bookingId: number) {
    this.http.put(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.successMessage = 'Booking cancelled successfully.';
        this.loadBookings();
        this.filterCleanersByDate();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        this.errorMessage = 'Failed to cancel booking. Please try again.';
      }
    });
  }

  resetBookingForm() {
    this.selectedCleanerId = null;
    this.bookingDate = '';
    this.selectedDate = '';
    this.durationHours = 2;
    this.specialInstructions = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.filteredCleaners = this.availableCleaners;
  }

  selectCleaner(cleanerId: number) {
    this.selectedCleanerId = cleanerId;
    this.errorMessage = '';
  }

  onDateChange() {
    if (this.bookingDate) {
      this.selectedDate = this.bookingDate.split('T')[0];
      this.filterCleanersByDate();
    }
  }

  filterCleanersByDate() {
    if (!this.selectedDate) {
      this.filteredCleaners = this.availableCleaners;
      return;
    }

    // Compute availability in parallel and update the list once to avoid flicker
    this.isFiltering = true;
    const checks = this.availableCleaners.map(cleaner =>
      this.http.get<boolean>(`http://localhost:8080/api/bookings/availability/${cleaner.id}/${this.selectedDate}`, { headers: this.getAuthHeaders() })
        .pipe(
          map(isAvailable => (isAvailable ? cleaner : null)),
          // On error, keep cleaner visible
          catchError(() => of(cleaner))
        )
    );

    forkJoin(checks).subscribe({
      next: results => {
        const beforeSelected = this.selectedCleanerId;
        this.filteredCleaners = results.filter((c): c is Cleaner => !!c);
        // If previously selected cleaner becomes unavailable, clear selection
        if (beforeSelected && !this.filteredCleaners.some(c => c.id === beforeSelected)) {
          this.selectedCleanerId = null;
        }
        this.isFiltering = false;
      },
      error: () => {
        // On unexpected error, fall back to showing all available cleaners
        this.filteredCleaners = this.availableCleaners;
        this.isFiltering = false;
      }
    });
  }

  getCleanerImage(cleaner: Cleaner): string {
    return cleaner.profilePicture || 'assets/images/default-cleaner.svg';
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'CONFIRMED': return 'bg-info';
      case 'IN_PROGRESS': return 'bg-primary';
      case 'COMPLETED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
