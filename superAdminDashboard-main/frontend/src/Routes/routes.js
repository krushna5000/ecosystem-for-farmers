import React from 'react'
import {  Routes, Route, Router } from "react-router-dom";
import {Login} from "../Pages/Login/Login.js";
import { Home } from "../Pages/Home/Home.js";
// import { RouterProvider } from 'react-router-dom';
// import { AuthProvider } from "./Login/AuthContext.js";
import { Dashboard } from '../Pages/Dashboard/Dashboard.js';
import Master from '../Pages/master/master.js';

export const routes = () => {
  return (
    <Router>
        <Routes>
          
          <Route path="/" element={<Home/>} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Dashboard" element={<Dashboard/>} />
          <Route path="/Master" element={<Master/>} />
          
        </Routes>
    </Router>
  )
}
