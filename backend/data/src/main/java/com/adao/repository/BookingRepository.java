package com.adao.repository;

import com.adao.entity.Booking;
import com.adao.entity.BookingStatus;
import com.adao.entity.Cleaner;
import com.adao.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer(Customer customer);
    List<Booking> findByCleaner(Cleaner cleaner);
    List<Booking> findByStatus(BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    List<Booking> findByBookingDateBetween(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer AND b.status = :status")
    List<Booking> findByCustomerAndStatus(@Param("customer") Customer customer, 
                                         @Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.cleaner = :cleaner AND b.status = :status")
    List<Booking> findByCleanerAndStatus(@Param("cleaner") Cleaner cleaner, 
                                        @Param("status") BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.cleaner = :cleaner AND b.bookingDate BETWEEN :startOfDay AND :endOfDay AND b.status <> 'CANCELLED'")
    List<Booking> findCleanerBookingsOnDay(@Param("cleaner") Cleaner cleaner,
                                           @Param("startOfDay") LocalDateTime startOfDay,
                                           @Param("endOfDay") LocalDateTime endOfDay);

    // Hard delete all bookings for a specific cleaner (used when deleting a cleaner)
    void deleteByCleaner(Cleaner cleaner);
}
