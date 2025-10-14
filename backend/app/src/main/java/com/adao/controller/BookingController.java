package com.adao.controller;

import com.adao.dto.BookingRequest;
import com.adao.entity.Booking;
import com.adao.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request) {
        try {
            Booking savedBooking = bookingService.createBooking(
                request.getCustomerId(),
                request.getCleanerId(),
                request.getBookingDate(),
                request.getDurationHours(),
                request.getSpecialInstructions(),
                request.getServiceAddress()
            );
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Booking>> getBookingsByCustomer(@PathVariable("customerId") Long customerId) {
        List<Booking> bookings = bookingService.getBookingsByCustomer(customerId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/cleaner/{cleanerId}")
    @PreAuthorize("hasRole('CLEANER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Booking>> getBookingsByCleaner(@PathVariable("cleanerId") Long cleanerId) {
        List<Booking> bookings = bookingService.getBookingsByCleaner(cleanerId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/availability/{cleanerId}/{date}")
    public ResponseEntity<Boolean> checkCleanerAvailability(@PathVariable("cleanerId") Long cleanerId, 
                                                           @PathVariable("date") String date) {
        try {
            boolean isAvailable = bookingService.isCleanerAvailableOnDate(cleanerId, date);
            return ResponseEntity.ok(isAvailable);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(false);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable("id") Long id) {
        Optional<Booking> booking = bookingService.getBookingById(id);
        return booking.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('CLEANER')")
    public ResponseEntity<Booking> confirmBooking(@PathVariable("id") Long id) {
        try {
            Booking updatedBooking = bookingService.confirmBooking(id);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/start")
    @PreAuthorize("hasRole('CLEANER')")
    public ResponseEntity<Booking> startBooking(@PathVariable("id") Long id) {
        try {
            Booking updatedBooking = bookingService.startBooking(id);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('CLEANER')")
    public ResponseEntity<Booking> completeBooking(@PathVariable("id") Long id) {
        try {
            Booking updatedBooking = bookingService.completeBooking(id);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable("id") Long id) {
        try {
            Booking updatedBooking = bookingService.cancelBooking(id);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
