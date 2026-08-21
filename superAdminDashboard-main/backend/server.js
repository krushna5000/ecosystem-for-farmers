

// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const bodyParser = require("body-parser");

// const superAdminController = require('./controllers/authController');

// const cropRoutes = require("./routes/cropRoutes");

// const authRoutes = require('./routes/authRoutes');

// // Load environment variables
// dotenv.config();

// const app = express();

// const server = http.createServer(app);

// //  Secure CORS Configuration
// const allowedOrigins = [

//   'http://localhost:3000'
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Allow mobile apps / Postman / etc.
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   next();
// });

// app.use(express.json());
// app.use(bodyParser.json());
// //  Socket.IO Initialization
// const io = socketIo(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });

// //  Socket.IO Authentication Middleware
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error('Authentication error: No token'));

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.user = decoded;
//     next();
//   } catch (err) {
//     next(new Error('Authentication error: Invalid token'));
//   }
// });

// //  Socket.IO Event Handling
// io.on('connection', (socket) => {
//   console.log(` Socket connected: ${socket.user?.id}`);

//   if (socket.user?.role === 'super_admin') {
//     socket.join('super_admins');
//   }

//   socket.on('disconnect', () => {
//     console.log(`Socket disconnected: ${socket.user?.id}`);
//   });
// });

// // Pass `io` to controllers
// const controllers = superAdminController(io);

// //  Define API routes
// app.use('/api/auth', authRoutes(controllers));
// app.use("/api", cropRoutes);

// // Root Test Route
// app.get('/', (req, res) => {
//   res.send(' Backend is working!');
// });

// // Server Listen
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(` Server running at http://0.0.0.0:${PORT}`);
// });





// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const superAdminController = require("./controllers/authController");
// const pincodeController = require("./controllers/pincodeController");
// const categoryControllers = require("./controllers/categoryController");
// const stageControllers = require("./controllers/stageController");      
// const cropControllers = require("./controllers/cropController");
// // const cropRoutes = require("./routes/cropRoutes");
// const authRoutes = require("./routes/authRoutes");
// const pincodeRoutes = require("./routes/pincodeRoutes");
// const categoryRoutes = require("./routes/categoryRoutes");
// const stageRoutes = require("./routes/stageRoutes");  
//   const cropRoutes = require("./routes/cropRoutes");
// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: (origin, callback) => {
//       const allowedOrigins = [
//         "https://super-admin-sage-two.vercel.app",
//         "http://localhost:3000",
//         "http://localhost:3001",
//         "https://super-admin-ga55.onrender.com",
//       ];
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST"],
//   },
// });

// // Socket.IO JWT Authentication
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     return next(new Error("Authentication error: No token provided"));
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.user = decoded;
//     next();
//   } catch (error) {
//     next(new Error("Authentication error: Invalid token"));
//   }
// });

// // Socket.IO Connection Handling
// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.user.id}`);
//   if (socket.user.role === "super_admin") {
//     socket.join("super_admins");
//   }
//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.user.id}`);
//   });
// });

// // Instantiate controllers with io
// const authControllers = superAdminController(io);
// const pincodeControllers = pincodeController(io);

// // Express Middleware
// app.use(express.json());
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = [
//         "https://super-admin-sage-two.vercel.app",
//         "http://localhost:3000",
//         "http://localhost:3001",
//         "https://super-admin-ga55.onrender.com",
//       ];
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
//   next();
// });

// // Routes
// app.use("/api/auth", authRoutes(authControllers));
// // app.use("/api", cropRoutes);
// app.use("/api", pincodeRoutes(pincodeControllers));
// app.use("/api/category", categoryRoutes(categoryControllers));
// app.use("/api/stage", stageRoutes(stageControllers));
// app.use("/api/crop", cropRoutes(cropControllers));


// // app.use("/api/category", require("./routes/categoryRoutes"));
// // app.use("/api/stage", require("./routes/stageRoutes"));
// // app.use("/api/crop", require("./routes/cropRoutes"));

// // Server listen
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//  console.log(` Server running at http://0.0.0.0:${PORT}`);
// });





const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const superAdminController = require("./controllers/authController");
const pincodeController = require("./controllers/pincodeController");

const authRoutes = require("./routes/authRoutes");
const pincodeRoutes = require("./routes/pincodeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const stageRoutes = require("./routes/stageRoutes");
const cropRoutes = require("./routes/cropRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://super-admin-sage-two.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://super-admin-ga55.onrender.com",
        "http://65.1.108.78:3000",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket.IO JWT Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error: No token provided"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  if (socket.user.role === "super_admin") {
    socket.join("super_admins");
  }
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Instantiate controllers with io
const authControllers = superAdminController(io);
const pincodeControllers = pincodeController(io);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://super-admin-sage-two.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://super-admin-ga55.onrender.com",
        "http://65.1.108.78:3000",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

// Routes
app.use("/api/auth", authRoutes(authControllers));
app.use("/api", pincodeRoutes(pincodeControllers));

// ✅ Fixed: no controller injection
app.use("/api/category", categoryRoutes);
app.use("/api/stage", stageRoutes);
app.use("/api/crop", cropRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
