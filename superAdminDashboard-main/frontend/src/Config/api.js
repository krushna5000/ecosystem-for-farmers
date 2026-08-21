// const BASE_URL = "http://localhost:5000/api"; // Make sure this matches your backend route
// export default BASE_URL;


// src/api.js
// import axios from "axios";

// const BASE_URL = "http://localhost:5000/api";

// const api = axios.create({
//   baseURL: BASE_URL,
// });

// export default api;


import axios from "axios";


//const BASE_URL = "http://65.1.108.78:5000/api"; //use this when backend is running on your machine
const BASE_URL = "http://localhost:5000/api"; //on local machine

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;