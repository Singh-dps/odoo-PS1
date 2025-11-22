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
        <div className="bg-dark-bg border border-white rounded-xl p-6 flex flex-col justify-between h-48 hover:border-neon-purple transition-colors group relative overflow-hidden">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-white">{type.name}</h3>
            </div>

            <div className="flex justify-between items-end mt-4">
                <a
                    href={`/operations?type=${type.id}`}
                    className="bg-dark-surface border border-white rounded-lg px-6 py-2 text-white hover:bg-white hover:text-dark-bg transition-colors font-medium"
                >
                    {type.pendingCount} to {type.type === 'receipt' ? 'receive' : type.type === 'delivery' ? 'deliver' : 'process'}
                </a>

                <div className="text-right text-sm text-slate-400">
                    {type.lateCount > 0 && (
                        <div className="text-white font-medium">{type.lateCount} Late</div>
                    )}
                    {type.waitingCount > 0 && (
                        <div>{type.waitingCount} waiting</div>
                    )}
                    <div className="text-slate-500">{type._count?.operations || 0} operations</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Operation Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.operationTypes && stats.operationTypes.length > 0 ? (
                    stats.operationTypes.map((type) => (
                        <OperationCard key={type.id} type={type} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-slate-500 border border-dashed border-dark-border rounded-lg">
                        Loading operations...
                    </div>
                )}
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

            {/* Recent Activity Placeholder */}
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
