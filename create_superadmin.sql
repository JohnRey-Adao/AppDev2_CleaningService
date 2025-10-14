-- Create super admin manually
USE cleaningservice;

-- First, create the user if it doesn't exist
INSERT IGNORE INTO users (username, email, password, first_name, last_name, phone_number, status, created_at, updated_at)
VALUES ('superadmin', 'superadmin@cleaningservice.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Super', 'Admin', '123-456-7890', 'ACTIVE', NOW(), NOW());

-- Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Create admin record
INSERT IGNORE INTO admins (user_id, admin_level)
VALUES (@user_id, 'SUPER_ADMIN');

-- Create role if it doesn't exist
INSERT IGNORE INTO roles (name, description)
VALUES ('ROLE_SUPER_ADMIN', 'Super Administrator with full system access');

-- Get role ID
SET @role_id = (SELECT id FROM roles WHERE name = 'ROLE_SUPER_ADMIN');

-- Assign role to user
INSERT IGNORE INTO user_roles (user_id, role_id)
VALUES (@user_id, @role_id);

-- Verify the super admin was created
SELECT u.username, u.email, r.name as role, a.admin_level 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
JOIN admins a ON u.id = a.user_id 
WHERE u.username = 'superadmin';
