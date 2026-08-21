import dotenv from 'dotenv';
dotenv.config({ path: './.env' });




import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  // host: process.env.DB_HOST,
  // port: Number(process.env.DB_PORT) || 5432,
  // user: process.env.DB_USER,  // ✅ REQUIRED
  // password: String(process.env.DB_PASSWORD), // ensure it's a string
  // database: process.env.DB_NAME,
  // ssl: false,
  user: 'FARMSEASY',
  host: 'farmseasy.cp0q8uuqk8by.ap-south-1.rds.amazonaws.com',
  database: 'postgres',
  password: '9096465405',  // 👈 Replace with your actual RDS password
  port: 5432,
  ssl: {
    rejectUnauthorized: false, // needed for AWS RDS SSL
  },
});


export default {
  query: (text, params) => pool.query(text, params),
  pool
};
