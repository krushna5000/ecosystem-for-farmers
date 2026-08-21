// app.js
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port', process.env.PORT || 5000);
});
