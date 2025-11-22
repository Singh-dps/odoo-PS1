import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface MainLayoutProps {
    children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="min-h-screen bg-dark-bg text-slate-200 font-sans selection:bg-neon-purple/30">
            <Header />
            <main className="p-6 max-w-7xl mx-auto">
                <div className="animate-fade-in">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
