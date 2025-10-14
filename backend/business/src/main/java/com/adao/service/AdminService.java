package com.adao.service;

import com.adao.entity.Admin;
import com.adao.entity.AdminLevel;
import com.adao.entity.RoleName;
import com.adao.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private UserService userService;
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
    
    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }
    
    public Optional<Admin> getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }
    
    public List<Admin> getAdminsByLevel(AdminLevel adminLevel) {
        return adminRepository.findByAdminLevel(adminLevel);
    }
    
    public Admin createAdmin(Admin admin) {
        Set<RoleName> roles = Set.of(RoleName.ROLE_ADMIN);
        return (Admin) userService.createUser(admin, roles);
    }
    
    public Admin createSuperAdmin(Admin admin) {
        Set<RoleName> roles = Set.of(RoleName.ROLE_SUPER_ADMIN);
        admin.setAdminLevel(AdminLevel.SUPER_ADMIN);
        return (Admin) userService.createUser(admin, roles);
    }
    
    public Admin updateAdmin(Admin admin) {
        return adminRepository.save(admin);
    }
    
    public void deleteAdmin(Long id) {
        adminRepository.deleteById(id);
    }
    
    public Admin updateAdminLevel(Long adminId, AdminLevel adminLevel) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        admin.setAdminLevel(adminLevel);
        return adminRepository.save(admin);
    }
}
