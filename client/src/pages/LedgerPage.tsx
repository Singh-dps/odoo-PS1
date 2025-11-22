import { useEffect, useState } from 'react';
import { Plus, Search, ArrowRight, Printer, X, Save, Check, AlertCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const LedgerPage = () => {
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [history, setHistory] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [operationTypes, setOperationTypes] = useState<any[]>([]);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        reference: 'DRAFT',
        deliveryAddressId: '',
        scheduleDate: new Date().toISOString().split('T')[0],
        responsible: 'Administrator', // Placeholder
        operationTypeId: '',
        lines: [] as any[] // { productId, productName, sku, quantity, onHand }
    });

    const { token } = useAuth();

    useEffect(() => {
        fetchLocations();
        fetchHistory();
        fetchProducts();
        fetchOperationTypes();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await fetch(`${API_URL}/api/inventory/locations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setLocations(await res.json());
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/api/reporting/ledger`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setHistory(await res.json());
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchOperationTypes = async () => {
        try {
            const res = await fetch(`${API_URL}/api/operations/types`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setOperationTypes(await res.json());
        } catch (error) {
            console.error('Error fetching operation types:', error);
        }
    };

    const handleAddLine = () => {
        setFormData({
            ...formData,
            lines: [...formData.lines, { productId: '', quantity: 1, onHand: 0 }]
        });
    };

    const handleUpdateLine = (index: number, field: string, value: any) => {
        const newLines = [...formData.lines];
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            newLines[index] = {
                ...newLines[index],
                productId: value,
                productName: product?.name,
                sku: product?.sku,
                onHand: product?.onHand || 0 // Assuming product object has onHand from API
            };
        } else {
            newLines[index] = { ...newLines[index], [field]: value };
        }
        setFormData({ ...formData, lines: newLines });
    };

    const filteredHistory = history.filter(move => {
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

        if (fromLocation && toLocation) {
            return (
                (move.locationSrcId === fromLocation && move.locationDestId === toLocation) ||
                (move.locationSrcId === fromLocation || move.locationDestId === fromLocation) ||
                (move.locationSrcId === toLocation || move.locationDestId === toLocation)
            );
        }

        if (fromLocation) return move.locationSrcId === fromLocation || move.locationDestId === fromLocation;
        if (toLocation) return move.locationSrcId === toLocation || move.locationDestId === toLocation;

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

    if (viewMode === 'form') {
        return (
            <div className="space-y-6">
                {/* Top Bar */}
                <div className="flex items-center justify-between bg-dark-surface p-4 rounded-lg border border-dark-border">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white mr-4">Delivery</h1>
                        <button
                            onClick={() => setViewMode('list')}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button className="bg-neon-purple hover:bg-neon-pink text-white px-4 py-1.5 rounded-md text-sm transition-colors shadow-lg shadow-neon-purple/20 flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                        </button>
                        <button className="bg-dark-bg border border-dark-border hover:border-neon-cyan text-slate-300 px-4 py-1.5 rounded-md text-sm transition-colors">
                            Validate
                        </button>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Status Timeline */}
                    <div className="flex items-center bg-dark-bg rounded-full px-1 py-1 border border-dark-border">
                        {['Draft', 'Waiting', 'Ready', 'Done'].map((status, idx) => (
                            <div key={status} className={`px-4 py-1 rounded-full text-xs font-medium ${idx === 0 ? 'bg-neon-purple text-white' : 'text-slate-500'
                                }`}>
                                {status.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-dark-surface rounded-lg border border-dark-border p-6 space-y-8">

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-mono text-white font-bold">{formData.reference}</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-slate-400 text-sm font-medium">Delivery Address</label>
                                    <select
                                        className="col-span-2 bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-white focus:border-neon-cyan outline-none"
                                        value={formData.deliveryAddressId}
                                        onChange={(e) => setFormData({ ...formData, deliveryAddressId: e.target.value })}
                                    >
                                        <option value="">Select Address...</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-slate-400 text-sm font-medium">Operation Type</label>
                                    <select
                                        className="col-span-2 bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-white focus:border-neon-cyan outline-none"
                                        value={formData.operationTypeId}
                                        onChange={(e) => setFormData({ ...formData, operationTypeId: e.target.value })}
                                    >
                                        <option value="">Select Type...</option>
                                        {operationTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-14">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-slate-400 text-sm font-medium">Schedule Date</label>
                                <input
                                    type="date"
                                    className="col-span-2 bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-white focus:border-neon-cyan outline-none"
                                    value={formData.scheduleDate}
                                    onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <label className="text-slate-400 text-sm font-medium">Responsible</label>
                                <select
                                    className="col-span-2 bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-white focus:border-neon-cyan outline-none"
                                    value={formData.responsible}
                                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                                >
                                    <option>Administrator</option>
                                    <option>Staff</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Table */}
                    <div className="mt-8">
                        <div className="border border-dark-border rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-dark-bg border-b border-dark-border text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium w-32 text-right">Quantity</th>
                                        <th className="px-4 py-3 font-medium w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border">
                                    {formData.lines.map((line, idx) => (
                                        <tr key={idx} className={`group ${line.onHand < line.quantity ? 'bg-red-500/5' : ''}`}>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="w-full bg-transparent text-white outline-none py-1"
                                                        value={line.productId}
                                                        onChange={(e) => handleUpdateLine(idx, 'productId', e.target.value)}
                                                    >
                                                        <option value="" className="bg-dark-surface">Select Product...</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id} className="bg-dark-surface">
                                                                [{p.sku}] {p.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {line.onHand < line.quantity && line.productId && (
                                                        <div className="text-red-500" title="Out of Stock">
                                                            <AlertCircle className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent text-right text-white outline-none py-1 font-mono"
                                                    value={line.quantity}
                                                    onChange={(e) => handleUpdateLine(idx, 'quantity', parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => {
                                                        const newLines = formData.lines.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, lines: newLines });
                                                    }}
                                                    className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Add New Line */}
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3">
                                            <button
                                                onClick={handleAddLine}
                                                className="text-neon-cyan hover:text-neon-blue text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                Add a line
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            onClick={() => setViewMode('form')}
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
