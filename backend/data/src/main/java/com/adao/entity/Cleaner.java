package com.adao.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cleaners")
@PrimaryKeyJoinColumn(name = "user_id")
public class Cleaner extends User {
    
    @NotBlank
    @Size(max = 255)
    private String address;
    
    @Size(max = 100)
    private String city;
    
    @Size(max = 20)
    private String postalCode;
    
    @Size(max = 100)
    private String region;
    
    @Size(max = 100)
    private String country = "Philippines";
    
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal hourlyRate;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CleanerStatus cleanerStatus = CleanerStatus.AVAILABLE;
    
    @Size(max = 1000)
    private String bio;
    
    @Size(max = 500)
    private String profilePicture;
    
    @OneToMany(mappedBy = "cleaner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();
    
    // Constructors
    public Cleaner() {
        super();
    }
    
    public Cleaner(String username, String email, String password, String firstName, String lastName, 
                   String address, BigDecimal hourlyRate) {
        super(username, email, password, firstName, lastName);
        this.address = address;
        this.hourlyRate = hourlyRate;
    }
    
    // Getters and Setters
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getPostalCode() {
        return postalCode;
    }
    
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    public String getRegion() {
        return region;
    }
    
    public void setRegion(String region) {
        this.region = region;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }
    
    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
    
    public CleanerStatus getCleanerStatus() {
        return cleanerStatus;
    }
    
    public void setCleanerStatus(CleanerStatus cleanerStatus) {
        this.cleanerStatus = cleanerStatus;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public List<Booking> getBookings() {
        return bookings;
    }
    
    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }
    
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
