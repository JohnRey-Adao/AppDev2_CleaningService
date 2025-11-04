import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Cleaner, Booking } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cleaner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cleaner-dashboard.component.html',
  styles: []
})
export class CleanerDashboardComponent implements OnInit {
  cleaner: Cleaner | null = null;
  bookings: Booking[] = [];
  totalJobs = 0;
  pendingJobs = 0;
  completedJobs = 0;
  totalEarnings = 0;
  jobsThisMonth = 0;
  earningsThisMonth = 0;
  activeTab = 'overview';
  editingProfile = false;
  private selectedPhotoFile: File | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadCleanerData();
    this.loadBookings();
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Auth token:', token ? 'Present' : 'Missing');
    console.log('Current user:', this.authService.getCurrentUser());
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadCleanerData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return;
    }
    
    const cleanerId = currentUser.id;
    if (!cleanerId) {
      console.error('Current user ID is null');
      return;
    }
    
    console.log('Loading cleaner data for ID:', cleanerId);
    this.http.get<Cleaner>(`${environment.apiBaseUrl}/cleaners/${cleanerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (cleaner) => {
        console.log('Cleaner data loaded:', cleaner);
        this.cleaner = cleaner;
      },
      error: (error) => {
        console.error('Error loading cleaner data:', error);
        if (error.status === 401) {
          console.error('Authentication failed, redirecting to login');
          this.authService.logout();
        }
      }
    });
  }

  loadBookings() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    const cleanerId = currentUser.id;
    this.http.get<Booking[]>(`${environment.apiBaseUrl}/bookings/cleaner/${cleanerId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }

  calculateStats() {
    this.totalJobs = this.bookings.length;
    this.pendingJobs = this.bookings.filter(b => b.status === 'PENDING').length;
    this.completedJobs = this.bookings.filter(b => b.status === 'COMPLETED').length;
    this.totalEarnings = this.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBookings = this.bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    
    this.jobsThisMonth = monthlyBookings.length;
    this.earningsThisMonth = monthlyBookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);
  }

  confirmBooking(bookingId: number) {
    this.http.put(`${environment.apiBaseUrl}/bookings/${bookingId}/confirm`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.loadBookings(); },
      error: (error) => { console.error('Error confirming booking:', error); }
    });
  }

  startBooking(bookingId: number) {
    this.http.put(`${environment.apiBaseUrl}/bookings/${bookingId}/start`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.loadBookings(); },
      error: (error) => { console.error('Error starting booking:', error); }
    });
  }

  completeBooking(bookingId: number) {
    this.http.put(`${environment.apiBaseUrl}/bookings/${bookingId}/complete`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.loadBookings(); },
      error: (error) => { console.error('Error completing booking:', error); }
    });
  }

  toggleStatus() {
    if (!this.cleaner) return;
    const newStatus = this.cleaner.cleanerStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    this.http.put(`${environment.apiBaseUrl}/cleaners/${this.cleaner.id}/status?status=${newStatus}`, {}, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.loadCleanerData(); },
      error: (error) => { console.error('Error updating status:', error); }
    });
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPhotoFile = input.files[0];
    }
  }

  saveCleanerProfile() {
    if (!this.cleaner) {
      console.error('Cleaner object is null');
      return;
    }
    
    const id = this.cleaner.id;
    if (!id) {
      console.error('Cleaner ID is null');
      return;
    }
    
    console.log('Saving cleaner profile for ID:', id);
    console.log('Cleaner object:', this.cleaner);

    // First update profile fields
    this.http.put(`${environment.apiBaseUrl}/profile/cleaner/${id}`, this.cleaner, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        console.log('Profile fields updated successfully');
        if (this.selectedPhotoFile) {
          const token = this.authService.getToken();
          const formData = new FormData();
          formData.append('file', this.selectedPhotoFile);
          this.http.post(`${environment.apiBaseUrl}/profile/cleaner/${id}/photo`, formData, {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
            responseType: 'text' as 'json'
          }).subscribe({
            next: (url: any) => {
              const returnedUrl = typeof url === 'string' ? url : (url?.toString?.() ?? '');
              if (returnedUrl) {
                this.cleaner!.profilePicture = returnedUrl;
              }
              this.editingProfile = false;
              this.selectedPhotoFile = null;
            },
            error: (error) => { 
              console.error('Photo upload error:', error);
              this.editingProfile = false; 
            }
          });
        } else {
          this.editingProfile = false;
        }
      },
      error: (error) => { 
        console.error('Profile update error:', error);
        this.editingProfile = false; 
      }
    });
  }

  getCleanerImage(cleaner: Cleaner): string {
    if (cleaner.profilePicture) {
      // If it's already a full URL, return as is, otherwise prepend backend URL
    return cleaner.profilePicture.startsWith('http') ? cleaner.profilePicture : `${environment.backendBaseUrl}${cleaner.profilePicture}`;
    }
    return 'assets/images/default-cleaner.svg';
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
      case 'AVAILABLE': return 'bg-success';
      case 'BUSY': return 'bg-warning';
      case 'OFFLINE': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }
}
