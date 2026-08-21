import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '../Pages/Login'
import Layout from '../layout/Layout'
import CompanyManagement from '../Pages/CompanyManagement'
import VendorManagement from '../Pages/VendorManagement'
import Dashboard from '../Pages/Dashboard'
import ProtectedRoute from './ProtectedRoute'
import ResetPassword from '../Pages/ResetPassword'
import EmailVerified from '../Pages/EmailVerified'

function AdminRoutes() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route
                    path="/email-verified/:role/:token"
                    element={<EmailVerified />}
                />
                <Route
                    path="/reset-password/:role/:token"
                    element={<ResetPassword />}
                />
                <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="/admin/company-management" element={<CompanyManagement />} />
                        <Route path="/admin/vendor-management" element={<VendorManagement />} />
                    </Route>
                </Route>
            </Routes>

        </div>
    )
}

export default AdminRoutes
