package com.adao.controller;

import com.adao.entity.Cleaner;
import com.adao.entity.Customer;
import com.adao.service.CleanerService;
import com.adao.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/profile")
public class UserProfileController {

    private static final Path UPLOADS_DIR = Paths.get("uploads");

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CleanerService cleanerService;

    @GetMapping("/cleaner/{id}/debug")
    public ResponseEntity<?> debugCleaner(@PathVariable("id") Long id) {
        System.out.println("Debug: Checking cleaner with ID: " + id);
        if (id == null) {
            System.out.println("Debug: ID is null");
            return ResponseEntity.badRequest().body("ID is null");
        }
        
        var cleaner = cleanerService.getCleanerById(id);
        if (cleaner.isPresent()) {
            System.out.println("Debug: Cleaner found: " + cleaner.get().getUsername());
            return ResponseEntity.ok(cleaner.get());
        } else {
            System.out.println("Debug: Cleaner not found for ID: " + id);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/customer/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or (hasRole('CUSTOMER') and @customerService.getCustomerById(#id).orElse(null)?.getUsername() == authentication.name)")
    public ResponseEntity<?> updateCustomerProfile(@PathVariable("id") Long id, @RequestBody Customer payload) {
        return customerService.getCustomerById(id)
                .map(existing -> {
                    existing.setFirstName(payload.getFirstName());
                    existing.setLastName(payload.getLastName());
                    existing.setPhoneNumber(payload.getPhoneNumber());
                    existing.setAddress(payload.getAddress());
                    existing.setCity(payload.getCity());
                    existing.setRegion(payload.getRegion());
                    existing.setPostalCode(payload.getPostalCode());
                    existing.setCountry(payload.getCountry());
                    existing.setBio(payload.getBio());
                    return ResponseEntity.ok(customerService.updateCustomer(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/cleaner/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('CLEANER')")
    public ResponseEntity<?> updateCleanerProfile(@PathVariable("id") Long id, @RequestBody Cleaner payload) {
        System.out.println("Update cleaner profile called for ID: " + id);
        System.out.println("Authentication name: " + SecurityContextHolder.getContext().getAuthentication().getName());
        
        // Manual authorization check for cleaner role
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CLEANER"))) {
            var cleaner = cleanerService.getCleanerById(id);
            if (cleaner.isPresent() && !cleaner.get().getUsername().equals(auth.getName())) {
                System.out.println("Cleaner can only update their own profile");
                return ResponseEntity.status(403).body("You can only update your own profile");
            }
        }
        
        return cleanerService.getCleanerById(id)
                .map(existing -> {
                    existing.setFirstName(payload.getFirstName());
                    existing.setLastName(payload.getLastName());
                    existing.setPhoneNumber(payload.getPhoneNumber());
                    existing.setAddress(payload.getAddress());
                    existing.setCity(payload.getCity());
                    existing.setRegion(payload.getRegion());
                    existing.setPostalCode(payload.getPostalCode());
                    existing.setCountry(payload.getCountry());
                    existing.setBio(payload.getBio());
                    return ResponseEntity.ok(cleanerService.updateCleaner(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/customer/{id}/photo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or (hasRole('CUSTOMER') and #id != null and @customerService.getCustomerById(#id).orElse(null)?.getUsername() == authentication.name)")
    public ResponseEntity<?> uploadCustomerPhoto(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
        System.out.println("Uploading customer photo for ID: " + id);
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        
        if (file.isEmpty()) {
            System.out.println("File is empty");
            return ResponseEntity.badRequest().body("File is empty");
        }
        try {
            if (!Files.exists(UPLOADS_DIR)) {
                System.out.println("Creating uploads directory: " + UPLOADS_DIR.toAbsolutePath());
                Files.createDirectories(UPLOADS_DIR);
            }

            String original = StringUtils.cleanPath(file.getOriginalFilename());
            String filename = "customer-" + id + "-" + System.currentTimeMillis() + "-" + original;
            Path target = UPLOADS_DIR.resolve(filename);
            System.out.println("Saving file to: " + target.toAbsolutePath());
            
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File saved successfully");

            String publicUrl = "http://localhost:8080/api/uploads/" + filename; // absolute URL for consistent frontend usage
            System.out.println("Public URL: " + publicUrl);

            Customer customer = customerService.getCustomerById(id).orElseThrow();
            customer.setProfilePicture(publicUrl);
            customerService.updateCustomer(customer);
            System.out.println("Customer profile picture updated in database");
            
            return ResponseEntity.ok(publicUrl);
        } catch (IOException e) {
            System.out.println("Upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/cleaner/{id}/photo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('CLEANER')")
    public ResponseEntity<?> uploadCleanerPhoto(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
        System.out.println("Uploading cleaner photo for ID: " + id);
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        
        if (file.isEmpty()) {
            System.out.println("File is empty");
            return ResponseEntity.badRequest().body("File is empty");
        }
        // Manual authorization check for cleaner role (owner can only upload for self)
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CLEANER"))) {
            var cleaner = cleanerService.getCleanerById(id);
            if (cleaner.isPresent() && !cleaner.get().getUsername().equals(auth.getName())) {
                System.out.println("Cleaner can only upload photo for their own profile");
                return ResponseEntity.status(403).body("You can only upload your own photo");
            }
        }
        try {
            if (!Files.exists(UPLOADS_DIR)) {
                System.out.println("Creating uploads directory: " + UPLOADS_DIR.toAbsolutePath());
                Files.createDirectories(UPLOADS_DIR);
            }

            String original = StringUtils.cleanPath(file.getOriginalFilename());
            String filename = "cleaner-" + id + "-" + System.currentTimeMillis() + "-" + original;
            Path target = UPLOADS_DIR.resolve(filename);
            System.out.println("Saving file to: " + target.toAbsolutePath());
            
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File saved successfully");

            String publicUrl = "http://localhost:8080/api/uploads/" + filename; // absolute URL for consistent frontend usage
            System.out.println("Public URL: " + publicUrl);

            Cleaner cleaner = cleanerService.getCleanerById(id).orElseThrow();
            cleaner.setProfilePicture(publicUrl);
            cleanerService.updateCleaner(cleaner);
            System.out.println("Cleaner profile picture updated in database");
            
            return ResponseEntity.ok(publicUrl);
        } catch (IOException e) {
            System.out.println("Upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
}


