package com.adao.repository;

import com.adao.entity.Admin;
import com.adao.entity.AdminLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);
    List<Admin> findByAdminLevel(AdminLevel adminLevel);
}
