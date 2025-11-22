import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import type { StockOperation } from '../types/operation';
import { useAuth } from '../context/AuthContext';

const OperationsList = () => {
    const [operations, setOperations] = useState<StockOperation[]>([]);
    const [searchParams] = useSearchParams();
    const typeFilter = searchParams.get('type');
    const { token } = useAuth();

    useEffect(() => {
        fetchOperations();
    }, []);

    const fetchOperations = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/operations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) setOperations(await response.json());
        } catch (error) {
            console.error('Error fetching operations:', error);
        }
    };

    const filteredOperations = operations.filter(op => {
        if (typeFilter && op.operationType?.id !== typeFilter) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
            case 'waiting': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'ready': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'done': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'canceled': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Operations</h1>
                    <p className="text-slate-400">Manage receipts, deliveries, and transfers</p>
                </div>
                <Link
                    to="/operations/new"
                    className="bg-neon-purple hover:bg-neon-pink text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-lg shadow-neon-purple/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Operation</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-dark-surface p-4 rounded-lg border border-dark-border flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search operations..."
                        className="w-full bg-dark-bg border border-dark-border rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-dark-bg border-b border-dark-border text-slate-400 uppercase text-xs font-medium">
                        <tr>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Source Location</th>
                            <th className="px-6 py-4">Dest Location</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                        {filteredOperations.map((op) => (
                            <tr key={op.id} className="hover:bg-dark-bg/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">
                                    <Link to={`/operations/${op.id}`} className="hover:text-neon-cyan transition-colors">
                                        {op.reference}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-slate-300">{op.operationType?.name}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm">
                                    {op.moves?.[0]?.locationSrc?.name || '-'}
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">
                                    {op.moves?.[0]?.locationDest?.name || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded border capitalize ${getStatusColor(op.status)}`}>
                                        {op.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">
                                    {new Date(op.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {filteredOperations.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No operations found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperationsList;
