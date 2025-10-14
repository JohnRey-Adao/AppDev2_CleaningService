package com.adao.controller;

import com.adao.dto.CustomerRegistrationRequest;
import com.adao.entity.Customer;
import com.adao.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody CustomerRegistrationRequest request) {
        try {
            // Check if username or email already exists
            if (customerService.getCustomerByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body("Error: Email is already in use!");
            }

            Customer customer = new Customer();
            customer.setUsername(request.getUsername());
            customer.setEmail(request.getEmail());
            customer.setPassword(request.getPassword());
            customer.setFirstName(request.getFirstName());
            customer.setLastName(request.getLastName());
            customer.setPhoneNumber(request.getPhoneNumber());
            customer.setAddress(request.getAddress());
            customer.setCity(request.getCity());
            customer.setRegion(request.getRegion());
            customer.setPostalCode(request.getPostalCode());
            customer.setCountry(request.getCountry());

            Customer savedCustomer = customerService.createCustomer(customer);
            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Customer> getCustomerById(@PathVariable("id") Long id) {
        Optional<Customer> customer = customerService.getCustomerById(id);
        return customer.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or (hasRole('CUSTOMER') and @customerService.getCustomerById(#id).orElse(null)?.getUsername() == authentication.name)")
    public ResponseEntity<Customer> updateCustomer(@PathVariable("id") Long id, @Valid @RequestBody Customer customer) {
        Optional<Customer> existingCustomer = customerService.getCustomerById(id);
        if (existingCustomer.isPresent()) {
            customer.setId(id);
            Customer updatedCustomer = customerService.updateCustomer(customer);
            return ResponseEntity.ok(updatedCustomer);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/address")
    @PreAuthorize("hasRole('CUSTOMER') and @customerService.getCustomerById(#id).orElse(null)?.getUsername() == authentication.name")
    public ResponseEntity<Customer> updateCustomerAddress(@PathVariable("id") Long id,
                                                          @RequestParam String address,
                                                          @RequestParam(required = false) String city,
                                                          @RequestParam(required = false) String region,
                                                          @RequestParam(required = false) String postalCode,
                                                          @RequestParam(required = false) String country) {
        try {
            Customer updatedCustomer = customerService.updateCustomerAddress(id, address, city, region, postalCode, country);
            return ResponseEntity.ok(updatedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteCustomer(@PathVariable("id") Long id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.ok("Customer deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/city/{city}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Customer>> getCustomersByCity(@PathVariable String city) {
        List<Customer> customers = customerService.getCustomersByCity(city);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/region/{region}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Customer>> getCustomersByRegion(@PathVariable String region) {
        List<Customer> customers = customerService.getCustomersByRegion(region);
        return ResponseEntity.ok(customers);
    }
}
