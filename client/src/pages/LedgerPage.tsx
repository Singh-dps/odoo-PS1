import { useEffect, useState } from 'react';
import { Plus, Search, ArrowRight } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const LedgerPage = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        fetchLocations();
        fetchHistory();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/inventory/locations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setLocations(await res.json());
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/reporting/ledger', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setHistory(await res.json());
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const filteredHistory = history.filter(move => {
        // Search Term Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesSearch = (
                move.operation?.reference?.toLowerCase().includes(term) ||
                move.locationSrc?.name?.toLowerCase().includes(term) ||
                move.locationDest?.name?.toLowerCase().includes(term) ||
                move.product?.name?.toLowerCase().includes(term)
            );
            if (!matchesSearch) return false;
        }

        // Location Filter Logic
        if (fromLocation && toLocation) {
            return (
                (move.locationSrcId === fromLocation && move.locationDestId === toLocation) ||
                (move.locationSrcId === fromLocation || move.locationDestId === fromLocation) ||
                (move.locationSrcId === toLocation || move.locationDestId === toLocation)
            );
        }

        if (fromLocation) {
            return move.locationSrcId === fromLocation || move.locationDestId === fromLocation;
        }

        if (toLocation) {
            return move.locationSrcId === toLocation || move.locationDestId === toLocation;
        }

        return true;
    });

    const getQuantityStyle = (move: any) => {
        let isInbound = false;
        let isOutbound = false;

        if (toLocation && move.locationDestId === toLocation) isInbound = true;
        else if (fromLocation && move.locationSrcId === fromLocation) isOutbound = true;
        else {
            if (move.locationDest.type === 'internal' && move.locationSrc.type !== 'internal') isInbound = true;
            else if (move.locationSrc.type === 'internal' && move.locationDest.type !== 'internal') isOutbound = true;
        }

        if (isInbound) return 'bg-green-500/10 text-green-500 border-green-500/20';
        if (isOutbound) return 'bg-red-500/10 text-red-500 border-red-500/20';
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Stock Ledger</h1>
                        <p className="text-slate-400">View stock movement history</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-dark-surface border border-dark-border rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors w-64"
                            />
                        </div>
                        <button
                            className="bg-neon-purple hover:bg-neon-pink text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-lg shadow-neon-purple/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New</span>
                        </button>
                    </div>
                </div>

                {/* Location Filters */}
                <div className="flex items-center gap-4 bg-dark-surface p-4 rounded-lg border border-dark-border">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">From:</span>
                        <select
                            value={fromLocation}
                            onChange={(e) => setFromLocation(e.target.value)}
                            className="bg-dark-bg border border-dark-border rounded-md py-1.5 px-3 text-white text-sm focus:outline-none focus:border-neon-cyan"
                        >
                            <option value="">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">To:</span>
                        <select
                            value={toLocation}
                            onChange={(e) => setToLocation(e.target.value)}
                            className="bg-dark-bg border border-dark-border rounded-md py-1.5 px-3 text-white text-sm focus:outline-none focus:border-neon-cyan"
                        >
                            <option value="">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-dark-bg border-b border-dark-border text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">From</th>
                            <th className="px-6 py-4">To</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4 text-right">Qty Change</th>
                            <th className="px-6 py-4 text-center">Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                        {filteredHistory.map((move) => (
                            <tr key={move.id} className="hover:bg-dark-bg/50">
                                <td className="px-6 py-4 text-slate-400 text-sm">
                                    {new Date(move.createdAt).toLocaleDateString()} {new Date(move.createdAt).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-4 text-neon-cyan font-mono text-sm">
                                    {move.operation?.reference || '-'}
                                </td>
                                <td className="px-6 py-4 text-slate-400">{move.locationSrc.name}</td>
                                <td className="px-6 py-4 text-slate-400">{move.locationDest.name}</td>
                                <td className="px-6 py-4 font-medium text-white">{move.product.name}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`px-2 py-1 rounded text-xs border font-mono ${getQuantityStyle(move)}`}>
                                        {move.quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 rounded text-xs border bg-slate-500/10 text-slate-400 border-slate-500/20">
                                        {move.operation?.operationType?.type?.toUpperCase() || 'N/A'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredHistory.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                    No history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LedgerPage;
