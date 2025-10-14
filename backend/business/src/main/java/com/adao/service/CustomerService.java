package com.adao.service;

import com.adao.entity.Customer;
import com.adao.entity.RoleName;
import com.adao.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private UserService userService;
    
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }
    
    public Optional<Customer> getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email);
    }
    
    public List<Customer> getCustomersByCity(String city) {
        return customerRepository.findByCity(city);
    }
    
    public List<Customer> getCustomersByRegion(String region) {
        return customerRepository.findByRegion(region);
    }
    
    public Customer createCustomer(Customer customer) {
        Set<RoleName> roles = Set.of(RoleName.ROLE_CUSTOMER);
        return (Customer) userService.createUser(customer, roles);
    }
    
    public Customer updateCustomer(Customer customer) {
        return customerRepository.save(customer);
    }
    
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
    
    public Customer updateCustomerAddress(Long customerId, String address, String city, 
                                         String region, String postalCode, String country) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        customer.setAddress(address);
        customer.setCity(city);
        customer.setRegion(region);
        customer.setPostalCode(postalCode);
        customer.setCountry(country);
        
        return customerRepository.save(customer);
    }
}
