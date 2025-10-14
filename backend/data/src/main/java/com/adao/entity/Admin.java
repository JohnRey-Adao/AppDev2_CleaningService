package com.adao.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "user_id")
public class Admin extends User {
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AdminLevel adminLevel = AdminLevel.ADMIN;
    
    // Constructors
    public Admin() {
        super();
    }
    
    public Admin(String username, String email, String password, String firstName, String lastName) {
        super(username, email, password, firstName, lastName);
    }
    
    public Admin(String username, String email, String password, String firstName, String lastName, AdminLevel adminLevel) {
        super(username, email, password, firstName, lastName);
        this.adminLevel = adminLevel;
    }
    
    // Getters and Setters
    public AdminLevel getAdminLevel() {
        return adminLevel;
    }
    
    public void setAdminLevel(AdminLevel adminLevel) {
        this.adminLevel = adminLevel;
    }
}
