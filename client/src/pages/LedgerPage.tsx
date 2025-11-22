import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';

const LedgerPage = () => {
    const [activeTab, setActiveTab] = useState<'levels' | 'history'>('levels');
    const [levels, setLevels] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        fetchLevels();
        fetchHistory();
    }, []);

    const fetchLevels = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/reporting/levels', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setLevels(await res.json());
        } catch (error) {
            console.error('Error fetching levels:', error);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Stock Ledger</h1>
                    <p className="text-slate-400">View stock levels and movement history</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-dark-border">
                <button
                    onClick={() => setActiveTab('levels')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'levels'
                        ? 'text-neon-cyan border-b-2 border-neon-cyan'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Stock on Hand
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'history'
                        ? 'text-neon-cyan border-b-2 border-neon-cyan'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Move History
                </button>
            </div>

            {/* Content */}
            <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                {activeTab === 'levels' && (
                    <table className="w-full text-left">
                        <thead className="bg-dark-bg border-b border-dark-border text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-right">Quantity</th>
                                <th className="px-6 py-4 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {levels.map((item, idx) => (
                                <tr key={idx} className="hover:bg-dark-bg/50">
                                    <td className="px-6 py-4 font-medium text-white">{item.product.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{item.location.name}</td>
                                    <td className="px-6 py-4 text-right text-neon-cyan font-mono">{item.quantity}</td>
                                    <td className="px-6 py-4 text-right text-slate-300 font-mono">
                                        ${(item.quantity * item.product.cost).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {levels.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No stock found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'history' && (
                    <table className="w-full text-left">
                        <thead className="bg-dark-bg border-b border-dark-border text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">From</th>
                                <th className="px-6 py-4">To</th>
                                <th className="px-6 py-4 text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {history.map((move) => (
                                <tr key={move.id} className="hover:bg-dark-bg/50">
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {new Date(move.createdAt).toLocaleDateString()} {new Date(move.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{move.product.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{move.locationSrc.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{move.locationDest.name}</td>
                                    <td className="px-6 py-4 text-right text-white font-mono">{move.quantity}</td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LedgerPage;
