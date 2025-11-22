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
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400">Configure your inventory system</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                        <button
                            onClick={() => setActiveTab('warehouses')}
                            className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'warehouses'
                                ? 'bg-neon-purple/10 text-neon-purple border-l-2 border-neon-purple'
                                : 'text-slate-400 hover:bg-dark-bg hover:text-white'
                                }`}
                        >
                            <WarehouseIcon className="w-4 h-4" />
                            1. Warehouses
                        </button>
                        <button
                            onClick={() => setActiveTab('locations')}
                            className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'locations'
                                ? 'bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan'
                                : 'text-slate-400 hover:bg-dark-bg hover:text-white'
                                }`}
                        >
                            <MapPin className="w-4 h-4" />
                            2. Locations
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-dark-surface rounded-lg border border-dark-border p-6 min-h-[500px]">
                    {activeTab === 'warehouses' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Warehouses</h2>
                                    <p className="text-slate-400 text-sm">Manage your physical storage locations</p>
                                </div>
                                <button className="bg-neon-purple hover:bg-neon-pink text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors shadow-lg shadow-neon-purple/20">
                                    <Plus className="w-4 h-4" /> Add Warehouse
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {warehouses.map(wh => (
                                    <div key={wh.id} className="bg-dark-bg p-4 rounded-lg border border-dark-border flex items-center justify-between hover:border-neon-purple transition-colors group">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{wh.name}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs font-mono bg-dark-surface px-2 py-1 rounded text-neon-purple border border-neon-purple/30">
                                                    {wh.shortCode}
                                                </span>
                                                <span className="text-sm text-slate-400">
                                                    {wh.locations?.length || 0} Locations
                                                </span>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-white transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'locations' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Locations</h2>
                                    <p className="text-slate-400 text-sm">Define specific spots within warehouses</p>
                                </div>
                                <button className="bg-neon-cyan hover:bg-neon-blue text-dark-bg font-bold px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors shadow-lg shadow-neon-cyan/20">
                                    <Plus className="w-4 h-4" /> Add Location
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-dark-border">
                                <table className="w-full text-left">
                                    <thead className="bg-dark-bg text-slate-400 text-xs uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Warehouse</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border bg-dark-bg/50">
                                        {locations.map(loc => (
                                            <tr key={loc.id} className="hover:bg-dark-bg transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{loc.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs px-2 py-1 rounded border capitalize ${loc.type === 'internal' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                                        loc.type === 'customer' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                                            loc.type === 'supplier' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                                'border-red-500/30 text-red-400 bg-red-500/10'
                                                        }`}>
                                                        {loc.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">{loc.warehouse?.name || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
