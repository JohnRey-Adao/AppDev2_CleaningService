import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Cleaner, Booking } from '../../../models/user.model';

@Component({
  selector: 'app-cleaner-dashboard',
  standalone: true,
  imports: [CommonModule],
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCleanerData();
    this.loadBookings();
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  loadCleanerData() {
    const cleanerId = 2; // This should come from the logged-in user
    this.http.get<Cleaner>(`http://localhost:8080/api/cleaners/${cleanerId}`).subscribe({
      next: (cleaner) => {
        this.cleaner = cleaner;
      },
      error: (error) => {
        console.error('Error loading cleaner data:', error);
      }
    });
  }

  loadBookings() {
    const cleanerId = 2; // This should come from the logged-in user
    this.http.get<Booking[]>(`http://localhost:8080/api/bookings/cleaner/${cleanerId}`).subscribe({
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
    
    // Calculate monthly stats (simplified)
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
    this.http.put(`http://localhost:8080/api/bookings/${bookingId}/confirm`, {}).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error confirming booking:', error);
      }
    });
  }

  startBooking(bookingId: number) {
    this.http.put(`http://localhost:8080/api/bookings/${bookingId}/start`, {}).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error starting booking:', error);
      }
    });
  }

  completeBooking(bookingId: number) {
    this.http.put(`http://localhost:8080/api/bookings/${bookingId}/complete`, {}).subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error completing booking:', error);
      }
    });
  }

  toggleStatus() {
    if (!this.cleaner) return;
    
    const newStatus = this.cleaner.cleanerStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    this.http.put(`http://localhost:8080/api/cleaners/${this.cleaner.id}/status?status=${newStatus}`, {}).subscribe({
      next: () => {
        this.loadCleanerData();
      },
      error: (error) => {
        console.error('Error updating status:', error);
      }
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
      case 'AVAILABLE': return 'bg-success';
      case 'BUSY': return 'bg-warning';
      case 'OFFLINE': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }
}
