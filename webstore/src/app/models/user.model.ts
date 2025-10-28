export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  status: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Customer extends User {
  address: string;
  city?: string;
  postalCode?: string;
  region?: string;
  country: string;
  bio?: string;
  profilePicture?: string;
}

export interface Cleaner extends User {
  address: string;
  city?: string;
  postalCode?: string;
  region?: string;
  country: string;
  hourlyRate: number;
  cleanerStatus: 'PENDING_APPROVAL' | 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK' | 'REJECTED';
  bio?: string;
  profilePicture?: string;
}

export interface Admin extends User {
  adminLevel: string;
}

export interface Booking {
  id: number;
  customer: Customer;
  cleaner: Cleaner;
  bookingDate: string;
  durationHours: number;
  totalAmount: number;
  status: string;
  specialInstructions?: string;
  serviceAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  profilePicture?: string;
}

export interface CustomerRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address: string;
  city?: string;
  postalCode?: string;
  region?: string;
  country?: string;
}

export interface CleanerRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address: string;
  city?: string;
  postalCode?: string;
  region?: string;
  country?: string;
  hourlyRate: number;
  bio?: string;
  profilePicture?: string;
}

export interface BookingRequest {
  customerId: number;
  cleanerId: number;
  bookingDate: string;
  durationHours: number;
  specialInstructions?: string;
  serviceAddress?: string;
}

export interface AdminRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  adminLevel: string;
}