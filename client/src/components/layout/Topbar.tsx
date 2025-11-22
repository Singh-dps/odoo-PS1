
import { Search, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
    const { user, logout } = useAuth();

    return (
        <div className="h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex items-center bg-dark-bg px-3 py-1.5 rounded-md border border-dark-border w-96 focus-within:border-neon-purple transition-colors">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-slate-500"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full"></span>
                </button>

                <div className="h-8 w-[1px] bg-dark-border mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">{user?.username || 'Guest'}</p>
                        <p className="text-xs text-slate-400 capitalize">{user?.role || 'Visitor'}</p>
                    </div>
                    <div className="w-8 h-8 bg-dark-bg rounded-full flex items-center justify-center border border-dark-border text-neon-purple">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <button onClick={logout} className="ml-2 text-slate-400 hover:text-neon-pink transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
