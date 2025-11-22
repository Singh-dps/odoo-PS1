import { useEffect, useState } from 'react';
import { MapPin, Warehouse as WarehouseIcon } from 'lucide-react';
import type { Warehouse } from '../types/inventory';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [activeTab, setActiveTab] = useState<'warehouses' | 'locations'>('warehouses');
    const { token } = useAuth();

    // Warehouse form state
    const [warehouseName, setWarehouseName] = useState('');
    const [warehouseCode, setWarehouseCode] = useState('');
    const [warehouseAddress, setWarehouseAddress] = useState('');

    // Location form state
    const [locationName, setLocationName] = useState('');
    const [locationCode, setLocationCode] = useState('');
    const [locationWarehouse, setLocationWarehouse] = useState('');
    const [locationRoom, setLocationRoom] = useState('');
    const [locationRack, setLocationRack] = useState('');

    useEffect(() => {
        fetchWarehouses();
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

    const handleSaveWarehouse = async () => {
        if (!warehouseName || !warehouseCode) {
            alert('Please fill in Name and Short Code');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/inventory/warehouses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: warehouseName,
                    shortCode: warehouseCode,
                    address: warehouseAddress
                })
            });

            if (response.ok) {
                alert('Warehouse saved successfully!');
                setWarehouseName('');
                setWarehouseCode('');
                setWarehouseAddress('');
                fetchWarehouses();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'Failed to save warehouse'}`);
            }
        } catch (error) {
            console.error('Error saving warehouse:', error);
            alert('Failed to save warehouse');
        }
    };

    const handleSaveLocation = async () => {
        if (!locationName || !locationCode || !locationWarehouse) {
            alert('Please fill in Name, Short Code, and Warehouse');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/inventory/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: locationName,
                    shortCode: locationCode,
                    warehouseId: locationWarehouse,
                    type: 'internal',
                    roomNo: locationRoom,
                    rackNo: locationRack
                })
            });

            if (response.ok) {
                alert('Location saved successfully!');
                setLocationName('');
                setLocationCode('');
                setLocationWarehouse('');
                setLocationRoom('');
                setLocationRack('');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'Failed to save location'}`);
            }
        } catch (error) {
            console.error('Error saving location:', error);
            alert('Failed to save location');
        }
    };

    const handleCancelWarehouse = () => {
        setWarehouseName('');
        setWarehouseCode('');
        setWarehouseAddress('');
    };

    const handleCancelLocation = () => {
        setLocationName('');
        setLocationCode('');
        setLocationWarehouse('');
        setLocationRoom('');
        setLocationRack('');
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
                            Warehouses
                        </button>
                        <button
                            onClick={() => setActiveTab('locations')}
                            className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'locations'
                                ? 'bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan'
                                : 'text-slate-400 hover:bg-dark-bg hover:text-white'
                                }`}
                        >
                            <MapPin className="w-4 h-4" />
                            Locations
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-dark-surface rounded-lg border border-dark-border p-6 min-h-[500px]">
                    {activeTab === 'warehouses' && (
                        <div className="space-y-8">
                            <div className="border-b border-dark-border pb-4">
                                <h2 className="text-2xl font-bold text-white">Warehouse</h2>
                                <p className="text-slate-400 text-sm mt-1">Manage your physical storage locations</p>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={warehouseName}
                                        onChange={(e) => setWarehouseName(e.target.value)}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                                        placeholder="Enter warehouse name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Short Code</label>
                                    <input
                                        type="text"
                                        value={warehouseCode}
                                        onChange={(e) => setWarehouseCode(e.target.value)}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                                        placeholder="Enter short code (e.g., WH)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Address</label>
                                    <textarea
                                        value={warehouseAddress}
                                        onChange={(e) => setWarehouseAddress(e.target.value)}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors resize-none"
                                        placeholder="Enter warehouse address"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={handleSaveWarehouse} className="flex-1 bg-neon-purple hover:bg-neon-pink text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-neon-purple/25 hover:shadow-neon-pink/40">
                                        Save Warehouse
                                    </button>
                                    <button onClick={handleCancelWarehouse} className="px-6 py-3 border border-dark-border text-slate-400 hover:text-white hover:border-slate-400 rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'locations' && (
                        <div className="space-y-8">
                            <div className="border-b border-dark-border pb-4">
                                <h2 className="text-2xl font-bold text-white">Location</h2>
                                <p className="text-slate-400 text-sm mt-1">Define specific spots within warehouses</p>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={locationName}
                                        onChange={(e) => setLocationName(e.target.value)}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan transition-colors"
                                        placeholder="Enter location name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Short Code</label>
                                    <input
                                        type="text"
                                        value={locationCode}
                                        onChange={(e) => setLocationCode(e.target.value)}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan transition-colors"
                                        placeholder="Enter short code"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Warehouse</label>
                                    <select value={locationWarehouse} onChange={(e) => setLocationWarehouse(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors">
                                        <option value="">Select Warehouse</option>
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id}>{wh.name} ({wh.shortCode})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Room No.</label>
                                        <input
                                            type="text"
                                            value={locationRoom}
                                            onChange={(e) => setLocationRoom(e.target.value)}
                                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan transition-colors"
                                            placeholder="e.g., R101"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Rack No.</label>
                                        <input
                                            type="text"
                                            value={locationRack}
                                            onChange={(e) => setLocationRack(e.target.value)}
                                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan transition-colors"
                                            placeholder="e.g., RK-A1"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-dark-border">
                                    <p className="text-slate-400 text-sm text-center">
                                        This holds the multiple locations of warehouse, rooms etc.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={handleSaveLocation} className="flex-1 bg-neon-purple hover:bg-neon-pink text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-neon-purple/25 hover:shadow-neon-pink/40">
                                        Save Location
                                    </button>
                                    <button onClick={handleCancelLocation} className="px-6 py-3 border border-dark-border text-slate-400 hover:text-white hover:border-slate-400 rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
