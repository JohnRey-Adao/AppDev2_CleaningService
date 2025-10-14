package com.adao.config;

import com.adao.entity.Admin;
import com.adao.entity.AdminLevel;
import com.adao.entity.Role;
import com.adao.entity.RoleName;
import com.adao.repository.RoleRepository;
import com.adao.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AdminService adminService;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeDefaultAdmin();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            // Create roles
            Role superAdminRole = new Role(RoleName.ROLE_SUPER_ADMIN, "Super Administrator with full system access");
            Role adminRole = new Role(RoleName.ROLE_ADMIN, "Administrator with management access");
            Role cleanerRole = new Role(RoleName.ROLE_CLEANER, "Cleaning service provider");
            Role customerRole = new Role(RoleName.ROLE_CUSTOMER, "Customer who books cleaning services");

            roleRepository.save(superAdminRole);
            roleRepository.save(adminRole);
            roleRepository.save(cleanerRole);
            roleRepository.save(customerRole);

            System.out.println("Roles initialized successfully!");
        }
    }

    private void initializeDefaultAdmin() {
        if (adminService.getAllAdmins().isEmpty()) {
            Admin superAdmin = new Admin();
            superAdmin.setUsername("superadmin");
            superAdmin.setEmail("superadmin@cleaningservice.com");
            superAdmin.setPassword("admin123");
            superAdmin.setFirstName("Super");
            superAdmin.setLastName("Admin");
            superAdmin.setPhoneNumber("123-456-7890");
            superAdmin.setAdminLevel(AdminLevel.SUPER_ADMIN);

            adminService.createAdmin(superAdmin);
            System.out.println("Default super admin created successfully!");
        }
    }
}
