import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/dbConnect.js';
import {
    helmetMiddleware,
    corsMiddleware,
    mongoSanitizeMiddleware,
    xssMiddleware,
    hppMiddleware
} from "./middlewares/security.middleware.js";
import { apiLimiter } from "./config/ratelimiter.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
connectDB();



// Body parser
app.use(express.json());

// 🔐 Security Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(xssMiddleware);
app.use(hppMiddleware);

// 🚦 Rate Limiting (apply globally)
app.use("/api", apiLimiter);



app.get('/', (req, res) => { res.send('Server running on port ' + PORT); })




app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})