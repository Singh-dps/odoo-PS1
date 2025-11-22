import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List as ListIcon, Package, Clock } from 'lucide-react';
import type { StockOperation } from '../types/operation';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const OperationsList = () => {
    const [operations, setOperations] = useState<StockOperation[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

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

    // KPIs
    const kpis = {
        pendingReceipts: operations.filter(op => op.operationType?.type === 'receipt' && op.status !== 'done' && op.status !== 'canceled').length,
        pendingDeliveries: operations.filter(op => op.operationType?.type === 'delivery' && op.status !== 'done' && op.status !== 'canceled').length,
        lateOperations: operations.filter(op => {
            const isPending = ['draft', 'waiting', 'ready'].includes(op.status);
            // Check scheduledDate if available, else createdAt
            const targetDate = op.scheduledDate ? new Date(op.scheduledDate) : new Date(op.createdAt);
            return isPending && targetDate.getTime() < Date.now();
        }).length
    };

    // Filtering
    const filteredOperations = operations.filter(op => {
        // Tab Filter
        if (activeTab !== 'all') {
            if (activeTab === 'receipts' && op.operationType?.type !== 'receipt') return false;
            if (activeTab === 'deliveries' && op.operationType?.type !== 'delivery') return false;
            if (activeTab === 'internal' && op.operationType?.type !== 'internal') return false;
            if (activeTab === 'adjustments' && op.operationType?.type !== 'adjustment') return false;
        }

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                op.reference.toLowerCase().includes(term) ||
                op.contact?.toLowerCase().includes(term) ||
                op.operationType?.name.toLowerCase().includes(term)
            );
        }

        return true;
    });

    const KanbanColumn = ({ title, status, items }: { title: string, status: string, items: StockOperation[] }) => (
        <div className="flex-1 min-w-[300px] bg-dark-surface/50 rounded-lg p-4 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-300">{title}</h3>
                <span className="bg-dark-bg px-2 py-1 rounded text-xs text-slate-400">{items.length}</span>
            </div>
            <div className="space-y-3">
                {items.map(op => (
                    <Link key={op.id} to={`/operations/${op.id}`} className="block bg-dark-surface border border-dark-border p-3 rounded-md hover:border-neon-cyan transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-white group-hover:text-neon-cyan transition-colors">{op.reference}</span>
                            <span className="text-xs text-slate-500">{op.scheduledDate ? new Date(op.scheduledDate).toLocaleDateString() : new Date(op.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-slate-400 mb-2">
                            {op.contact || 'No Contact'}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs px-2 py-1 rounded bg-dark-bg text-slate-300 border border-dark-border">
                                {op.operationType?.name}
                            </span>
                            <StatusBadge status={op.status} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header & KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-dark-surface p-4 rounded-lg border border-dark-border">
                    <div className="flex items-center gap-3 mb-1">
                        <Package className="w-5 h-5 text-neon-purple" />
                        <span className="text-slate-400 text-sm">Pending Receipts</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{kpis.pendingReceipts}</span>
                </div>
                <div className="bg-dark-surface p-4 rounded-lg border border-dark-border">
                    <div className="flex items-center gap-3 mb-1">
                        <Package className="w-5 h-5 text-neon-cyan" />
                        <span className="text-slate-400 text-sm">Pending Deliveries</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{kpis.pendingDeliveries}</span>
                </div>
                <div className="bg-dark-surface p-4 rounded-lg border border-dark-border">
                    <div className="flex items-center gap-3 mb-1">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-slate-400 text-sm">Late Operations</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{kpis.lateOperations}</span>
                </div>
                <div className="flex items-center justify-end">
                    <Link
                        to="/operations/new"
                        className="bg-neon-purple hover:bg-neon-pink text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-lg shadow-neon-purple/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Operation</span>
                    </Link>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-dark-surface p-2 rounded-lg border border-dark-border">
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    {['all', 'receipts', 'deliveries', 'internal', 'adjustments'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm capitalize transition-colors ${activeTab === tab
                                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50'
                                : 'text-slate-400 hover:text-white hover:bg-dark-bg'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors text-sm"
                        />
                    </div>
                    <div className="flex bg-dark-bg rounded-md border border-dark-border p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-dark-surface text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-dark-surface text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-dark-bg border-b border-dark-border text-slate-400 uppercase text-xs font-medium">
                            <tr>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Contact</th>
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
                                    <td className="px-6 py-4 text-slate-300">{op.contact || '-'}</td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {op.moves?.[0]?.locationSrc?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {op.moves?.[0]?.locationDest?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={op.status} />
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {op.scheduledDate ? new Date(op.scheduledDate).toLocaleDateString() : new Date(op.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredOperations.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        No operations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 h-full">
                    <KanbanColumn title="Draft" status="draft" items={filteredOperations.filter(op => op.status === 'draft')} />
                    <KanbanColumn title="Waiting" status="waiting" items={filteredOperations.filter(op => op.status === 'waiting')} />
                    <KanbanColumn title="Ready" status="ready" items={filteredOperations.filter(op => op.status === 'ready')} />
                    <KanbanColumn title="Done" status="done" items={filteredOperations.filter(op => op.status === 'done')} />
                    <KanbanColumn title="Canceled" status="canceled" items={filteredOperations.filter(op => op.status === 'canceled')} />
                </div>
            )}
        </div>
    );
};

export default OperationsList;
