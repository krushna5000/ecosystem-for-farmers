import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './dashboard.css';

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
