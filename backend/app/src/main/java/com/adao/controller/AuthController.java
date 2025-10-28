package com.adao.controller;

import com.adao.dto.JwtResponse;
import com.adao.dto.LoginRequest;
import com.adao.security.JwtUtils;
import com.adao.security.UserPrincipal;
import com.adao.service.CustomerService;
import com.adao.service.CleanerService;
import com.adao.entity.Customer;
import com.adao.entity.Cleaner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    CustomerService customerService;

    @Autowired
    CleanerService cleanerService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            // Get profile picture based on user type
            String profilePicture = getProfilePicture(userDetails.getId(), roles);

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    roles,
                    profilePicture));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error: Invalid username or password");
        }
    }

    private String getProfilePicture(Long userId, List<String> roles) {
        try {
            // Check if user is a customer
            if (roles.contains("ROLE_CUSTOMER")) {
                Optional<Customer> customer = customerService.getCustomerById(userId);
                if (customer.isPresent() && customer.get().getProfilePicture() != null) {
                    return customer.get().getProfilePicture();
                }
            }
            
            // Check if user is a cleaner
            if (roles.contains("ROLE_CLEANER")) {
                Optional<Cleaner> cleaner = cleanerService.getCleanerById(userId);
                if (cleaner.isPresent() && cleaner.get().getProfilePicture() != null) {
                    return cleaner.get().getProfilePicture();
                }
            }
        } catch (Exception e) {
            // Log error but don't fail authentication
            System.err.println("Error getting profile picture: " + e.getMessage());
        }
        
        return null; // No profile picture found
    }
}
