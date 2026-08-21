import React from 'react';
import { Bell, Mail } from 'lucide-react';
import './dashboard.css';

const Header = () => {
    return (
        <header className="dashboard-header">


            <div className="header-profile">
                <button className="notification-btn">
                    <Bell size={20} />
                </button>
                <button className="notification-btn">
                    <Mail size={20} />
                </button>
                <div className="avatar">
                    AG
                </div>
            </div>
        </header>
    );
};

export default Header;
