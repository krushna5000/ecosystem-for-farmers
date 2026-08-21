This is a simple Node.js backend server for OTP-based user authentication using PostgreSQL database. It allows users to send an OTP to their phone number and verify it to get a JWT token for login.

## Features
- Send OTP to a phone number (stores user data if new).
- Verify OTP and issue a JWT token on success.
- Uses Express.js for the API and PostgreSQL for database operations.
- OTP expires in 5 minutes.
- For new users, full_name is required before sending OTP.

## Prerequisites
- Node.js (version 18 or higher recommended).
- PostgreSQL database.
- Environment variables set up.

## Setup
1. Clone or download the project files.

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here (use a strong secret)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   OTP_TTL_MINUTES=5
   ```

4. Ensure PostgreSQL is running and run the schema.sql file to set up the database:
   ```
   psql -U your_db_username -d your_db_name -f backend/schema.sql
   ```

   This will create the required tables:
   - `users_schema.users` (id, full_name, phone_number, is_verified, created_at, updated_at)
   - `users_schema.otp_verifications` (id, phone_number, otp_code, expires_at, is_used)

5. Start the server:
   ```
   cd backend
   npm start
   ```

   The server will run on `http://localhost:5000` (or your PORT).

## API Endpoints
All auth routes are under `/api/auth`.

### 1. Send OTP
- **Method**: POST `/api/auth/send-otp`
- **Body** (JSON):
  ```json
  {
    "phone_number": "1234567890",  // Required
    "full_name": "User Name"       // Required only for new users
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```
- **Response** (Error - 400 for new user without full_name):
  ```json
  {
    "success": false,
    "message": "Full name required for new user"
  }
  ```
- **Notes**:
  - For new users, provide `full_name`. Existing users can omit it.
  - OTP is a 6-digit random number, stored in database.
  - Logged to console for testing.

### 2. Verify OTP
- **Method**: POST `/api/auth/verify-otp`
- **Body** (JSON):
  ```json
  {
    "phone_number": "1234567890",
    "otp": "123456"
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "full_name": "User Name",
      "phone_number": "1234567890",
      "is_verified": true
    }
  }
  ```
- **Response** (Error - 400):
  ```json
  {
    "success": false,
    "message": "Invalid or expired OTP"
  }
  ```
- **Notes**:
  - Marks OTP as used after successful verification.
  - Token expires in 30 days and contains `id` and `phone_number`.
  - Invalid/expired OTP returns error.

### Root Route
- **Method**: GET `/`
- **Response**: "Server is running"

## Project Structure
- `server.js`: Main Express app setup.
- `routes/auth.routes.js`: Authentication routes (send OTP, verify OTP).
- `controllers/authController.js`: Controller logic for auth endpoints.
- `config/db.js`: PostgreSQL database connection.
- `package.json`: Dependencies and scripts.

## Security Notes
- In production:
  - Send OTP via SMS (e.g., integrate Twilio) instead of console log.
  - Use HTTPS.
  - Validate phone numbers properly.
  - Store sensitive data securely.
- JWT is used for session management; verify it in protected routes.

## Troubleshooting
- If database connection fails, check `.env` variables and PostgreSQL setup.
- Errors? Check console logs.

## License
ISC License (see package.json).

For questions or improvements, feel free to contribute!
