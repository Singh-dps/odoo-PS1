import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import type { StockOperation } from '../types/operation';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const OperationsList = () => {
    const [operations, setOperations] = useState<StockOperation[]>([]);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');
    const { token } = useAuth();

    // Search and view mode state
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    // Check if we're on the Receipts page
    const isReceiptsPage = location.pathname === '/receipts';

    useEffect(() => {
        fetchOperations();
    }, []);

    const fetchOperations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/operations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) setOperations(await response.json());
        } catch (error) {
            console.error('Error fetching operations:', error);
        }
    };

    const filteredOperations = operations.filter(op => {
        // Auto-filter for Receipts page
        if (isReceiptsPage && op.operationType?.type !== 'receipt') return false;

        // Search filter (by reference and contact)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesReference = op.reference.toLowerCase().includes(searchLower);
            const matchesContact = 'azure interior'.toLowerCase().includes(searchLower); // Mock contact data
            if (!matchesReference && !matchesContact) return false;
        }

        if (typeFilter && op.operationType?.id !== typeFilter) return false;

        if (statusFilter) {
            if (statusFilter === 'late') {
                // Simple check for late: pending status and created more than 7 days ago (mock logic)
                // In real app, check scheduledDate
                const isPending = ['draft', 'waiting', 'ready'].includes(op.status);
                const isOld = new Date(op.createdAt).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000;
                return isPending && isOld;
            }
            return op.status === statusFilter;
        }

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
        <div className="space-y-0">
            {/* Header with NEW button and user info */}
            <div className="bg-dark-bg border-b border-white/20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to={isReceiptsPage ? "/operations/new?type=receipt" : "/operations/new"}
                        className="border border-white text-white px-6 py-2 rounded-md hover:bg-white hover:text-black transition-colors uppercase text-sm font-medium"
                    >
                        NEW
                    </Link>
                    <h1 className="text-2xl font-light text-white">
                        {isReceiptsPage ? 'Receipts' : 'Operations'}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by reference or contact..."
                            className="bg-dark-surface border border-dark-border rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-colors w-64"
                        />
                    </div>

                    {/* View Mode Switchers */}
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-neon-purple text-white' : 'hover:bg-dark-surface text-slate-400'}`}
                        title="List View"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-neon-purple text-white' : 'hover:bg-dark-surface text-slate-400'}`}
                        title="Kanban View"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                    </button>

                    <div className="bg-neon-pink px-4 py-2 rounded-md">
                        <span className="text-white font-medium text-sm">Neel Singh</span>
                    </div>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black border-b border-white/20 text-white text-sm font-normal">
                            <tr>
                                <th className="px-6 py-3 font-normal">Reference</th>
                                <th className="px-6 py-3 font-normal">From</th>
                                <th className="px-6 py-3 font-normal">To</th>
                                <th className="px-6 py-3 font-normal">Contact</th>
                                <th className="px-6 py-3 font-normal">Schedule date</th>
                                <th className="px-6 py-3 font-normal">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredOperations.map((op) => (
                                <tr key={op.id} className="hover:bg-dark-surface/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        <Link to={`/operations/${op.id}`} className="hover:text-neon-cyan transition-colors">
                                            {op.reference}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 text-sm">
                                        {op.moves?.[0]?.locationSrc?.type === 'supplier' ? 'vendor' : op.moves?.[0]?.locationSrc?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 text-sm">
                                        {op.moves?.[0]?.locationDest?.warehouse?.name
                                            ? `${op.moves[0].locationDest.warehouse.shortCode}/${op.moves[0].locationDest.name}`
                                            : op.moves?.[0]?.locationDest?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 text-sm">
                                        Azure Interior
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 text-sm">
                                        {op.scheduledDate ? new Date(op.scheduledDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm capitalize">
                                            {op.status}
                                        </span>
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
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-4">
                        {['draft', 'waiting', 'ready', 'done'].map(status => {
                            const statusOps = filteredOperations.filter(op => op.status === status);
                            return (
                                <div key={status} className="bg-dark-surface rounded-lg border border-dark-border p-4">
                                    <h3 className="text-white font-bold mb-4 capitalize flex items-center justify-between">
                                        <span>{status}</span>
                                        <span className="bg-dark-bg px-2 py-1 rounded text-xs">{statusOps.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {statusOps.map(op => (
                                            <Link
                                                key={op.id}
                                                to={`/operations/${op.id}`}
                                                className="block bg-dark-bg border border-dark-border rounded-lg p-3 hover:border-neon-purple transition-colors"
                                            >
                                                <div className="font-medium text-white text-sm mb-2">{op.reference}</div>
                                                <div className="text-xs text-slate-400 space-y-1">
                                                    <div>From: {op.moves?.[0]?.locationSrc?.type === 'supplier' ? 'vendor' : op.moves?.[0]?.locationSrc?.name || '-'}</div>
                                                    <div>To: {op.moves?.[0]?.locationDest?.warehouse?.name
                                                        ? `${op.moves[0].locationDest.warehouse.shortCode}/${op.moves[0].locationDest.name}`
                                                        : op.moves?.[0]?.locationDest?.name || '-'}</div>
                                                    <div className="text-neon-cyan">{op.scheduledDate ? new Date(op.scheduledDate).toLocaleDateString() : '-'}</div>
                                                </div>
                                            </Link>
                                        ))}
                                        {statusOps.length === 0 && (
                                            <div className="text-center text-slate-500 text-sm py-4">
                                                No items
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer info */}
            <div className="px-6 py-8 text-center space-y-2">
                <p className="text-slate-400 text-sm">
                    Populate all work orders added to manufacturing order
                </p>
                <p className="text-slate-400 text-sm">
                    Locations of warehouse
                </p>
            </div>
        </div>
    );
};

export default OperationsList;
