package com.adao.controller;

import com.adao.dto.CleanerRegistrationRequest;
import com.adao.entity.Cleaner;
import com.adao.entity.CleanerStatus;
import com.adao.entity.UserStatus;
import com.adao.service.CleanerService;
import com.adao.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/cleaners")
public class CleanerController {

    @Autowired
    private CleanerService cleanerService;
    
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerCleaner(@Valid @RequestBody CleanerRegistrationRequest request) {
        try {
            // Check if username or email already exists
            if (userService.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("message", "Username is already taken!"));
            }
            if (userService.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("message", "Email is already in use!"));
            }

            Cleaner cleaner = new Cleaner();
            cleaner.setUsername(request.getUsername());
            cleaner.setEmail(request.getEmail());
            cleaner.setPassword(request.getPassword());
            cleaner.setFirstName(request.getFirstName());
            cleaner.setLastName(request.getLastName());
            cleaner.setPhoneNumber(request.getPhoneNumber());
            cleaner.setAddress(request.getAddress());
            cleaner.setCity(request.getCity());
            cleaner.setRegion(request.getRegion());
            cleaner.setPostalCode(request.getPostalCode());
            cleaner.setCountry(request.getCountry());
            cleaner.setHourlyRate(request.getHourlyRate());
            cleaner.setBio(request.getBio());
            cleaner.setProfilePicture(request.getProfilePicture());
            cleaner.setCleanerStatus(CleanerStatus.AVAILABLE); // Set to available immediately
            cleaner.setStatus(UserStatus.ACTIVE); // Enable login immediately

            Cleaner savedCleaner = cleanerService.createCleaner(cleaner);
            return ResponseEntity.ok(savedCleaner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Cleaner>> getAllCleaners() {
        List<Cleaner> cleaners = cleanerService.getAllCleaners();
        return ResponseEntity.ok(cleaners);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Cleaner>> getAvailableCleaners() {
        List<Cleaner> cleaners = cleanerService.getAvailableCleaners();
        System.out.println("Returning " + cleaners.size() + " cleaners");
        if (!cleaners.isEmpty()) {
            System.out.println("First cleaner: " + cleaners.get(0).getFirstName() + " " + cleaners.get(0).getLastName());
        }
        return ResponseEntity.ok(cleaners);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cleaner> getCleanerById(@PathVariable("id") Long id) {
        Optional<Cleaner> cleaner = cleanerService.getCleanerById(id);
        return cleaner.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or (hasRole('CLEANER') and @cleanerService.getCleanerById(#id).orElse(null)?.getUsername() == authentication.name)")
    public ResponseEntity<Cleaner> updateCleaner(@PathVariable("id") Long id, @Valid @RequestBody Cleaner cleaner) {
        Optional<Cleaner> existingCleaner = cleanerService.getCleanerById(id);
        if (existingCleaner.isPresent()) {
            cleaner.setId(id);
            Cleaner updatedCleaner = cleanerService.updateCleaner(cleaner);
            return ResponseEntity.ok(updatedCleaner);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('CLEANER') and @cleanerService.getCleanerById(#id).orElse(null)?.getUsername() == authentication.name")
    public ResponseEntity<Cleaner> updateCleanerStatus(@PathVariable("id") Long id, @RequestParam CleanerStatus status) {
        try {
            Cleaner updatedCleaner = cleanerService.updateCleanerStatus(id, status);
            return ResponseEntity.ok(updatedCleaner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/rate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or (hasRole('CLEANER') and @cleanerService.getCleanerById(#id).orElse(null)?.getUsername() == authentication.name)")
    public ResponseEntity<Cleaner> updateCleanerRate(@PathVariable("id") Long id, @RequestParam BigDecimal hourlyRate) {
        try {
            Cleaner updatedCleaner = cleanerService.updateCleanerRate(id, hourlyRate);
            return ResponseEntity.ok(updatedCleaner);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteCleaner(@PathVariable("id") Long id) {
        try {
            cleanerService.deleteCleaner(id);
            return ResponseEntity.ok("Cleaner deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Cleaner>> getCleanersByCity(@PathVariable("city") String city) {
        List<Cleaner> cleaners = cleanerService.getCleanersByCity(city);
        return ResponseEntity.ok(cleaners);
    }

    @GetMapping("/city/{city}/available")
    public ResponseEntity<List<Cleaner>> getAvailableCleanersByCity(@PathVariable("city") String city) {
        List<Cleaner> cleaners = cleanerService.getAvailableCleanersByCity(city);
        return ResponseEntity.ok(cleaners);
    }

    @GetMapping("/max-rate/{maxRate}")
    public ResponseEntity<List<Cleaner>> getCleanersByMaxRate(@PathVariable("maxRate") BigDecimal maxRate) {
        List<Cleaner> cleaners = cleanerService.getCleanersByMaxRate(maxRate);
        return ResponseEntity.ok(cleaners);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Cleaner>> getCleanersByStatus(@PathVariable("status") CleanerStatus status) {
        List<Cleaner> cleaners = cleanerService.getCleanersByStatus(status);
        return ResponseEntity.ok(cleaners);
    }

    @PutMapping("/migrate-pending-to-available")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> migratePendingToAvailable() {
        try {
            List<Cleaner> updatedCleaners = cleanerService.migratePendingToAvailable();
            return ResponseEntity.ok(java.util.Map.of(
                "message", "Successfully migrated " + updatedCleaners.size() + " cleaners from PENDING_APPROVAL to AVAILABLE",
                "updatedCleaners", updatedCleaners.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

}
