package com.adao.repository;

import com.adao.entity.Cleaner;
import com.adao.entity.CleanerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CleanerRepository extends JpaRepository<Cleaner, Long> {
    Optional<Cleaner> findByEmail(String email);
    List<Cleaner> findByCleanerStatus(CleanerStatus status);
    List<Cleaner> findByCity(String city);
    List<Cleaner> findByRegion(String region);
    
    @Query("SELECT c FROM Cleaner c WHERE c.hourlyRate <= :maxRate AND c.cleanerStatus = :status")
    List<Cleaner> findByHourlyRateLessThanEqualAndStatus(@Param("maxRate") BigDecimal maxRate, 
                                                         @Param("status") CleanerStatus status);
    
    @Query("SELECT c FROM Cleaner c WHERE c.city = :city AND c.cleanerStatus = 'AVAILABLE'")
    List<Cleaner> findAvailableCleanersByCity(@Param("city") String city);
}
