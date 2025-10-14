# Cleaning Service Application by John Rey Christian Adao

A comprehensive cleaning service platform built with Spring Boot, Angular, and MySQL. This application provides separate dashboards for customers, cleaners, admins, and super admins.

## Architecture

The project follows a multi-module Maven architecture:

- **backend**: Aggregator with three submodules
  - app: Spring Boot REST API with controllers and security
  - business: Business logic and service layer
  - data: JPA entities and repositories
- **webstore**: Angular WebStore (customer-facing) application
- **admin**: Angular Admin application (management UI)
- **database**: MySQL database initialization scripts

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- MySQL 8.0+
- IntelliJ IDEA (recommended)

## Setup Instructions

### 1. Database Setup

1. Install MySQL 8.0+ on your system
2. Create a MySQL user and database:
   ```sql
   CREATE USER 'cleaningservice'@'localhost' IDENTIFIED BY 'password';
   CREATE DATABASE cleaningservice;
   GRANT ALL PRIVILEGES ON cleaningservice.* TO 'cleaningservice'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Run the database initialization script:
   ```bash
   mysql -u cleaningservice -p cleaningservice < database/init.sql
   ```

### 2. Backend Setup

1. Open the project in IntelliJ IDEA
2. Import the Maven project (File → Open → select the project folder)
3. Wait for Maven dependencies to download
4. Update database credentials in `backend/app/src/main/resources/application.yml` if needed:
   ```properties
   spring.datasource.username=cleaningservice
   spring.datasource.password=password
   ```

5. Run the Spring Boot application:
   - Right-click on `CleaningServiceApplication.java` in the backend app module
   - Select "Run 'CleaningServiceApplication'"
   - Or use the terminal: `mvn -f backend/app exec:java`
The backend will start on `http://localhost:8080`

### 3. WebStore Frontend Setup
1. Navigate to the WebStore directory:
   ```bash
   cd webstore
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The WebStore frontend will start on `http://localhost:4200`

### 4. Default Login Credentials

After running the application, a default super admin will be created:

- **Username**: `superadmin`
- **Password**: `admin123`

## User Roles and Dashboards

### 1. Customer Dashboard
- Register as a customer
- Book cleaning services
- View booking history
- Manage profile and address
- Cancel bookings

### 2. Cleaner Dashboard
- Register as a cleaner
- Set hourly rates and availability
- View and manage job requests
- Update job status (confirm, start, complete)
- View earnings and statistics

### 3. Admin Dashboard
- Manage cleaners (create, edit, delete)
- View all bookings and customers
- Monitor system statistics
- Handle customer support

### 4. Super Admin Dashboard
- Full system access
- Create and manage other admins
- System configuration
- Advanced reporting and analytics

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login

### Customers
- `POST /api/customers/register` - Register new customer
- `GET /api/customers` - Get all customers (Admin only)
- `GET /api/customers/{id}` - Get customer by ID
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer (Admin only)

### Cleaners
- `POST /api/cleaners/register` - Register new cleaner
- `GET /api/cleaners` - Get all cleaners
- `GET /api/cleaners/available` - Get available cleaners
- `GET /api/cleaners/{id}` - Get cleaner by ID
- `PUT /api/cleaners/{id}` - Update cleaner
- `DELETE /api/cleaners/{id}` - Delete cleaner (Admin only)

### Bookings
- `POST /api/bookings` - Create new booking (Customer only)
- `GET /api/bookings` - Get all bookings (Admin only)
- `GET /api/bookings/{id}` - Get booking by ID
- `PUT /api/bookings/{id}/confirm` - Confirm booking (Cleaner only)
- `PUT /api/bookings/{id}/start` - Start booking (Cleaner only)
- `PUT /api/bookings/{id}/complete` - Complete booking (Cleaner only)
- `PUT /api/bookings/{id}/cancel` - Cancel booking

### Admins
- `POST /api/admins/create` - Create new admin (Super Admin only)
- `GET /api/admins` - Get all admins (Admin only)
- `DELETE /api/admins/{id}` - Delete admin (Super Admin only)

## Testing with Postman

1. Import the following collection into Postman:

### Authentication
```json
POST http://localhost:8080/api/auth/signin
Content-Type: application/json

{
  "username": "superadmin",
  "password": "admin123"
}
```

### Create Customer
```json
POST http://localhost:8080/api/customers/register
Content-Type: application/json

{
  "username": "customer1",
  "email": "customer1@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "123-456-7890",
  "address": "123 Main St",
  "city": "Manila",
  "region": "NCR",
  "postalCode": "1000",
  "country": "Philippines"
}
```

### Create Cleaner
```json
POST http://localhost:8080/api/cleaners/register
Content-Type: application/json

{
  "username": "cleaner1",
  "email": "cleaner1@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "098-765-4321",
  "address": "456 Oak Ave",
  "city": "Quezon City",
  "region": "NCR",
  "postalCode": "1100",
  "country": "Philippines",
  "hourlyRate": 500.00,
  "bio": "Professional cleaner with 5 years experience"
}
```

### Create Booking
```json
POST http://localhost:8080/api/bookings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "customerId": 1,
  "cleanerId": 2,
  "bookingDate": "2024-01-15T10:00:00",
  "durationHours": 3,
  "specialInstructions": "Focus on kitchen and bathrooms",
  "serviceAddress": "123 Main St, New York, NY 10001"
}
```

## Deployment with Tomcat

### 1. Build the Backend
```bash
mvn clean package -pl backend
```

### 2. Deploy to Tomcat
1. Copy `backend/target/backend-1.0.0.jar` to Tomcat's `webapps` directory
2. Rename it to `cleaningservice.war`
3. Start Tomcat server
4. Access the application at `http://localhost:8080/cleaningservice`

### 3. Build the WebStore Frontend for Production
```bash
cd webstore
npm run build
```

4. Copy the contents of `webstore/dist/cleaningservice-frontend/` to your web server

## Development Tips

1. **Database Changes**: The application uses `spring.jpa.hibernate.ddl-auto=update`, so schema changes will be applied automatically during development.

2. **CORS**: The backend is configured to allow CORS requests from `http://localhost:4200` for development.

3. **JWT Tokens**: Authentication tokens expire after 24 hours by default. You can modify this in `application.properties`.

4. **Logging**: Debug logging is enabled for the application packages. Check the console for detailed logs.

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure MySQL is running and credentials are correct
2. **Port Already in Use**: Change the port in `application.properties` or stop the conflicting service
3. **CORS Errors**: Ensure the frontend is running on `http://localhost:4200`
4. **JWT Token Expired**: Login again to get a new token

### Logs Location
- Backend logs: Console output
- Frontend logs: Browser developer console
- Database logs: MySQL error log

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
