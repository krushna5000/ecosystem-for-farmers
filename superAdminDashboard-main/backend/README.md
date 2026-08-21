//Install Dependecies
npm install express pg bcryptjs dotenv jsonwebtoken cors body-parser
npm install --save-dev nodemon



//Database Setup

CREATE TABLE super_admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO super_admins (name, email, password, role, status) 
VALUES 
('Admin User', 'admin@example.com', 'your_hashed_password_here', 'super_admin', TRUE);


//Command to Generate Bcrypt Hash in the Terminal
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"


//Generate a Random JWT Secret Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"


add admin 

INSERT INTO super_admins (name, email, password, role, status) 
VALUES 
('Admin User', 'admin@example.com', '$2b$10$1oVhBbW13BuZSaLunu1dveRtKL3YyfhHl8cPRTC..yHEC9KO.en8C', 'super_admin', TRUE);

select * from super_admins;
select * from admins;


PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=Travel_agency
DB_PASS=root
DB_PORT=5432
JWT_SECRET=3c798d72797ec03e65f723ca0837ef8c6f9a5865c4c1ff1b703509bdd5246add
JWT_EXPIRES_IN=1h

# EMAIL_USER=nodemailer650@gmail.com
# EMAIL_PASS=jzgk flss utif pgrm


rutuja@example.com
superadmi@123