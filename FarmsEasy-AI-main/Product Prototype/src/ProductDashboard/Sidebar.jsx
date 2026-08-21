import React, { useState } from 'react';
import { Home, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import './dashboard.css';

import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        // { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'Products', path: '/add-product' },
        { icon: Package, label: 'Show Products', path: '/products' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Package size={28} />
                    <span className="logo-text">FarmsEasy</span>
                </div>
                <button
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav>
                <ul className="nav-links">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <item.icon size={20} />
                                <span className="nav-text">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
