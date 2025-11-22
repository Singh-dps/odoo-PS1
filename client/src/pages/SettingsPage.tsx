import { useEffect, useState } from 'react';
import { Plus, MapPin, Warehouse as WarehouseIcon } from 'lucide-react';
import type { Warehouse, Location } from '../types/inventory';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [activeTab, setActiveTab] = useState<'warehouses' | 'locations'>('warehouses');
    const { token } = useAuth();

    useEffect(() => {
        fetchWarehouses();
        fetchLocations();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/inventory/warehouses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) setWarehouses(await response.json());
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/inventory/locations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) setLocations(await response.json());
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400">Configure warehouses and locations</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-dark-border">
                <button
                    onClick={() => setActiveTab('warehouses')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'warehouses'
                        ? 'text-neon-cyan border-b-2 border-neon-cyan'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Warehouses
                </button>
                <button
                    onClick={() => setActiveTab('locations')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'locations'
                        ? 'text-neon-cyan border-b-2 border-neon-cyan'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    Locations
                </button>
            </div>

            {/* Content */}
            <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
                {activeTab === 'warehouses' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <WarehouseIcon className="w-5 h-5 text-neon-purple" />
                                Warehouses
                            </h2>
                            <button className="bg-neon-purple hover:bg-neon-pink text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> Add Warehouse
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {warehouses.map(wh => (
                                <div key={wh.id} className="bg-dark-bg p-4 rounded-md border border-dark-border hover:border-neon-purple transition-colors">
                                    <h3 className="font-bold text-white">{wh.name}</h3>
                                    <p className="text-sm text-slate-400">Code: {wh.shortCode}</p>
                                    <div className="mt-2 text-xs text-slate-500">
                                        {wh.locations?.length || 0} Locations
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'locations' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-neon-cyan" />
                                Locations
                            </h2>
                            <button className="bg-neon-cyan hover:bg-neon-blue text-dark-bg font-bold px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> Add Location
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-dark-bg text-slate-400 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Warehouse</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border">
                                    {locations.map(loc => (
                                        <tr key={loc.id} className="hover:bg-dark-bg/50">
                                            <td className="px-4 py-3 text-white">{loc.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded border ${loc.type === 'internal' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                                    loc.type === 'customer' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                                        loc.type === 'supplier' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                            'border-red-500/30 text-red-400 bg-red-500/10'
                                                    }`}>
                                                    {loc.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">{loc.warehouse?.name || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
