import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ArrowLeftRight,
    History,
    Settings,
    ChevronLeft,
    ChevronRight,
    Box
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Operations', path: '/operations', icon: ArrowLeftRight },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Stock Ledger', path: '/ledger', icon: History },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className={clsx(
            "h-screen bg-dark-surface border-r border-dark-border transition-all duration-300 flex flex-col",
            collapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className="h-16 flex items-center justify-center border-b border-dark-border">
                {collapsed ? (
                    <Box className="text-neon-pink w-8 h-8" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Box className="text-neon-pink w-6 h-6" />
                        <span className="text-xl font-bold text-white tracking-wider">NEXUS<span className="text-neon-cyan">IMS</span></span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 group",
                                isActive
                                    ? "bg-dark-bg text-neon-cyan border-l-2 border-neon-cyan"
                                    : "text-slate-400 hover:bg-dark-bg hover:text-white"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5", isActive ? "text-neon-cyan" : "group-hover:text-white")} />
                            {!collapsed && <span className="font-medium">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-4 border-t border-dark-border flex justify-center hover:bg-dark-bg text-slate-400 hover:text-white transition-colors"
            >
                {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
        </div>
    );
};

export default Sidebar;
