package com.adao.controller;

import com.adao.entity.Cleaner;
import com.adao.entity.Customer;
import com.adao.service.CleanerService;
import com.adao.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
                    return ResponseEntity.ok(customerService.updateCustomer(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/cleaner/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or (hasRole('CLEANER') and @cleanerService.getCleanerById(#id).orElse(null)?.getUsername() == authentication.name)")
    public ResponseEntity<?> updateCleanerProfile(@PathVariable("id") Long id, @RequestBody Cleaner payload) {
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

    @PostMapping("/cleaner/{id}/photo")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or (hasRole('CLEANER') and @cleanerService.getCleanerById(#id).orElse(null)?.getUsername() == authentication.name)")
    public ResponseEntity<?> uploadCleanerPhoto(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        try {
            if (!Files.exists(UPLOADS_DIR)) {
                Files.createDirectories(UPLOADS_DIR);
            }

            String original = StringUtils.cleanPath(file.getOriginalFilename());
            String filename = "cleaner-" + id + "-" + System.currentTimeMillis() + "-" + original;
            Path target = UPLOADS_DIR.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = "/api/uploads/" + filename; // will be served by StaticResourceConfig under /api context

            Cleaner cleaner = cleanerService.getCleanerById(id).orElseThrow();
            cleaner.setProfilePicture(publicUrl);
            cleanerService.updateCleaner(cleaner);
            return ResponseEntity.ok(publicUrl);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
}


