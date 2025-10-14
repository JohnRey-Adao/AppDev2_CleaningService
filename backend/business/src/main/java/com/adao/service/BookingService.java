package com.adao.service;

import com.adao.entity.Booking;
import com.adao.entity.BookingStatus;
import com.adao.entity.Cleaner;
import com.adao.entity.Customer;
import com.adao.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private CleanerService cleanerService;
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }
    
    public List<Booking> getBookingsByCustomer(Long customerId) {
        Customer customer = customerService.getCustomerById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return bookingRepository.findByCustomer(customer);
    }
    
    public List<Booking> getBookingsByCleaner(Long cleanerId) {
        Cleaner cleaner = cleanerService.getCleanerById(cleanerId)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));
        return bookingRepository.findByCleaner(cleaner);
    }
    
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }
    
    public List<Booking> getBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return bookingRepository.findByBookingDateBetween(startDate, endDate);
    }
    
    public Booking createBooking(Long customerId, Long cleanerId, LocalDateTime bookingDate, 
                                Integer durationHours, String specialInstructions, String serviceAddress) {
        Customer customer = customerService.getCustomerById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        Cleaner cleaner = cleanerService.getCleanerById(cleanerId)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));
        
        // Enforce same-day availability: reject if cleaner already has any non-cancelled booking that day
        LocalDateTime startOfDay = bookingDate.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        List<Booking> existingForDay = bookingRepository.findCleanerBookingsOnDay(cleaner, startOfDay, endOfDay);
        if (!existingForDay.isEmpty()) {
            throw new RuntimeException("Cleaner is not available on the selected day");
        }
        
        // Calculate total amount
        BigDecimal totalAmount = cleaner.getHourlyRate().multiply(BigDecimal.valueOf(durationHours));
        
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setCleaner(cleaner);
        booking.setBookingDate(bookingDate);
        booking.setDurationHours(durationHours);
        booking.setTotalAmount(totalAmount);
        booking.setSpecialInstructions(specialInstructions);
        booking.setServiceAddress(serviceAddress);
        booking.setStatus(BookingStatus.PENDING);
        
        return bookingRepository.save(booking);
    }
    
    public Booking updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
    
    public Booking updateBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
    
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
    
    public Booking confirmBooking(Long bookingId) {
        return updateBookingStatus(bookingId, BookingStatus.CONFIRMED);
    }
    
    public Booking startBooking(Long bookingId) {
        Booking booking = updateBookingStatus(bookingId, BookingStatus.IN_PROGRESS);
        
        // Update cleaner status to busy
        Cleaner cleaner = booking.getCleaner();
        cleanerService.updateCleanerStatus(cleaner.getId(), com.adao.entity.CleanerStatus.BUSY);
        
        return booking;
    }
    
    public Booking completeBooking(Long bookingId) {
        Booking booking = updateBookingStatus(bookingId, BookingStatus.COMPLETED);
        
        // Update cleaner status back to available
        Cleaner cleaner = booking.getCleaner();
        cleanerService.updateCleanerStatus(cleaner.getId(), com.adao.entity.CleanerStatus.AVAILABLE);
        
        return booking;
    }
    
    public Booking cancelBooking(Long bookingId) {
        Booking booking = updateBookingStatus(bookingId, BookingStatus.CANCELLED);
        
        // Update cleaner status back to available if they were busy
        Cleaner cleaner = booking.getCleaner();
        if (cleaner.getCleanerStatus() == com.adao.entity.CleanerStatus.BUSY) {
            cleanerService.updateCleanerStatus(cleaner.getId(), com.adao.entity.CleanerStatus.AVAILABLE);
        }
        
        return booking;
    }
    
    public boolean isCleanerAvailableOnDate(Long cleanerId, String dateString) {
        Cleaner cleaner = cleanerService.getCleanerById(cleanerId)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));
        
        LocalDate date = LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        
        List<Booking> existingForDay = bookingRepository.findCleanerBookingsOnDay(cleaner, startOfDay, endOfDay);
        return existingForDay.isEmpty();
    }
}
