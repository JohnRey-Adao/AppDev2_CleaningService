package com.adao.service;

import com.adao.entity.Cleaner;
import com.adao.entity.CleanerStatus;
import com.adao.entity.RoleName;
import com.adao.entity.UserStatus;
import com.adao.repository.CleanerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class CleanerService {
    
    @Autowired
    private CleanerRepository cleanerRepository;
    
    @Autowired
    private UserService userService;

    @Autowired
    private com.adao.repository.BookingRepository bookingRepository;
    
    public List<Cleaner> getAllCleaners() {
        return cleanerRepository.findAll();
    }
    
    public Optional<Cleaner> getCleanerById(Long id) {
        return cleanerRepository.findById(id);
    }
    
    public Optional<Cleaner> getCleanerByEmail(String email) {
        return cleanerRepository.findByEmail(email);
    }
    
    public List<Cleaner> getCleanersByStatus(CleanerStatus status) {
        return cleanerRepository.findByCleanerStatus(status);
    }
    
    public List<Cleaner> getAvailableCleaners() {
        List<Cleaner> cleaners = cleanerRepository.findByCleanerStatus(CleanerStatus.AVAILABLE);
        System.out.println("Found " + cleaners.size() + " available cleaners");
        return cleaners;
    }
    
    public List<Cleaner> getCleanersByCity(String city) {
        return cleanerRepository.findByCity(city);
    }
    
    public List<Cleaner> getCleanersByRegion(String region) {
        return cleanerRepository.findByRegion(region);
    }
    
    public List<Cleaner> getAvailableCleanersByCity(String city) {
        return cleanerRepository.findAvailableCleanersByCity(city);
    }
    
    public List<Cleaner> getCleanersByMaxRate(BigDecimal maxRate) {
        return cleanerRepository.findByHourlyRateLessThanEqualAndStatus(maxRate, CleanerStatus.AVAILABLE);
    }
    
    public Cleaner createCleaner(Cleaner cleaner) {
        Set<RoleName> roles = Set.of(RoleName.ROLE_CLEANER);
        return (Cleaner) userService.createUser(cleaner, roles);
    }
    
    public Cleaner updateCleaner(Cleaner cleaner) {
        return cleanerRepository.save(cleaner);
    }
    
    public void deleteCleaner(Long id) {
        Cleaner cleaner = cleanerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));
        // Remove bookings first to avoid FK constraints
        bookingRepository.deleteByCleaner(cleaner);
        cleanerRepository.delete(cleaner);
    }
    
    public Cleaner updateCleanerStatus(Long cleanerId, CleanerStatus status) {
        Cleaner cleaner = cleanerRepository.findById(cleanerId)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));
        
        cleaner.setCleanerStatus(status);
        // All cleaner statuses allow login
        cleaner.setStatus(UserStatus.ACTIVE);
        return cleanerRepository.save(cleaner);
    }
    
    public Cleaner updateCleanerRate(Long cleanerId, BigDecimal hourlyRate) {
        Cleaner cleaner = cleanerRepository.findById(cleanerId)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));
        
        cleaner.setHourlyRate(hourlyRate);
        return cleanerRepository.save(cleaner);
    }
    
    public List<Cleaner> migratePendingToAvailable() {
        List<Cleaner> pendingCleaners = cleanerRepository.findByCleanerStatus(CleanerStatus.PENDING_APPROVAL);
        
        for (Cleaner cleaner : pendingCleaners) {
            cleaner.setCleanerStatus(CleanerStatus.AVAILABLE);
            cleaner.setStatus(UserStatus.ACTIVE);
        }
        
        return cleanerRepository.saveAll(pendingCleaners);
    }
}
