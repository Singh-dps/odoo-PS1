import { useEffect, useState } from 'react';
import { Package, ArrowLeftRight, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const [stats, setStats] = useState({
        productCount: 0,
        operationCount: 0,
        pendingOperations: 0,
        totalValue: 0,
        operationTypes: [] as any[]
    });
    const { token } = useAuth();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setStats(await res.json());
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const KPICard = ({ title, value, icon: Icon, color }: any) => (
        <div className="bg-dark-surface p-6 rounded-lg border border-dark-border hover:border-neon-purple transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full bg-${color}-500/10 text-${color}-400 group-hover:text-${color}-300 transition-colors`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={`text-2xl font-bold text-white group-hover:text-${color}-400 transition-colors`}>{value}</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        </div>
    );

    const OperationCard = ({ type }: { type: any }) => (
        <div className="bg-dark-surface p-6 rounded-lg border border-dark-border hover:border-neon-purple transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowLeftRight className="w-24 h-24 text-neon-purple" />
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-1">{type.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{type.sequenceCode}</p>

                <div className="flex items-end justify-between">
                    <div>
                        <span className="text-3xl font-bold text-neon-cyan">{type.pendingCount}</span>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">To Process</p>
                    </div>

                    <a
                        href={`/operations?type=${type.id}`}
                        className="px-4 py-2 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple hover:text-white rounded-md text-sm font-medium transition-all"
                    >
                        Process
                    </a>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400">Overview of your inventory status</p>
            </div>

            {/* KPIs */}
            {/* Operation Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.operationTypes.map((type) => (
                    <OperationCard key={type.id} type={type} />
                ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Products"
                    value={stats.productCount}
                    icon={Package}
                    color="neon-purple"
                />
                <KPICard
                    title="Total Operations"
                    value={stats.operationCount}
                    icon={ArrowLeftRight}
                    color="neon-cyan"
                />
                <KPICard
                    title="Pending Actions"
                    value={stats.pendingOperations}
                    icon={Clock}
                    color="yellow"
                />
                <KPICard
                    title="Stock Value"
                    value={`$${stats.totalValue.toFixed(2)}`}
                    icon={DollarSign}
                    color="green"
                />
            </div>

            {/* Recent Activity Placeholder (could be a chart or list) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-dark-surface p-6 rounded-lg border border-dark-border h-64 flex items-center justify-center">
                    <p className="text-slate-500">Activity Chart Placeholder</p>
                </div>
                <div className="bg-dark-surface p-6 rounded-lg border border-dark-border h-64 flex items-center justify-center">
                    <p className="text-slate-500">Recent Alerts Placeholder</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
