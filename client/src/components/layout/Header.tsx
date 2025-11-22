import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { name: 'Dashboard', path: '/' },
        { name: 'Operations', path: '/operations' },
        { name: 'Stock', path: '/products' },
        { name: 'Move History', path: '/ledger' },
        { name: 'Settings', path: '/settings' },
    ];

    return (
        <header className="bg-dark-bg border-b border-white/20 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            {/* Left: Navigation */}
            <nav className="flex items-center gap-8">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`text-sm font-medium transition-colors ${isActive(item.path)
                            ? 'text-white'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Right: Title & Profile */}
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-light text-white hidden md:block">
                    {navItems.find(i => isActive(i.path))?.name || 'IMS'}
                </h1>

                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-md border border-white flex items-center justify-center text-white font-bold bg-dark-surface">
                        {user?.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
