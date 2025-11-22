import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types/product';
import type { Location } from '../types/inventory';
import type { OperationType, StockOperation } from '../types/operation';

const OperationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { token } = useAuth();

    const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [operation, setOperation] = useState<StockOperation | null>(null);

    const [formData, setFormData] = useState({
        operationTypeId: '',
        contact: '',
        status: 'draft',
        scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
        moves: [] as any[]
    });

    // Receipt-specific fields
    const [receiveFrom, setReceiveFrom] = useState('');
    const [contact, setContact] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [responsible, setResponsible] = useState('');
    const [destinationLocation, setDestinationLocation] = useState('');

    useEffect(() => {
        fetchData();
        if (id) fetchOperation();
    }, [id]);

    // Auto-select receipt type when coming from Receipts page
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'receipt' && operationTypes.length > 0 && !formData.operationTypeId) {
            const receiptType = operationTypes.find(t => t.type === 'receipt');
            if (receiptType) {
                setFormData(prev => ({ ...prev, operationTypeId: receiptType.id }));
            }
        }
    }, [searchParams, operationTypes]);

    const fetchData = async () => {
        try {
            const [typesRes, prodsRes, locsRes] = await Promise.all([
                fetch('http://localhost:3001/api/operations/types', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('http://localhost:3001/api/products', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('http://localhost:3001/api/inventory/locations', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (typesRes.ok) setOperationTypes(await typesRes.json());
            if (prodsRes.ok) setProducts(await prodsRes.json());
            if (locsRes.ok) setLocations(await locsRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchOperation = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/operations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOperation(data);
                setFormData({
                    operationTypeId: data.operationTypeId,
                    contact: data.contact || '',
                    status: data.status,
                    scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString().slice(0, 16) : '',
                    moves: data.moves.map((m: any) => ({
                        productId: m.productId,
                        quantity: m.quantity,
                        locationSrcId: m.locationSrcId,
                        locationDestId: m.locationDestId
                    }))
                });
            }
        } catch (error) {
            console.error('Error fetching operation:', error);
        }
    };

    const getLocationsByType = (typeId: string) => {
        const type = operationTypes.find(t => t.id === typeId);
        if (!type) return { src: '', dest: '' };

        let srcLoc = '';
        let destLoc = '';

        if (type.type === 'receipt') {
            srcLoc = locations.find(l => l.type === 'supplier')?.id || '';
            destLoc = locations.find(l => l.type === 'internal')?.id || '';
        } else if (type.type === 'delivery') {
            srcLoc = locations.find(l => l.type === 'internal')?.id || '';
            destLoc = locations.find(l => l.type === 'customer')?.id || '';
        } else {
            srcLoc = locations.find(l => l.type === 'internal')?.id || '';
            destLoc = locations.find(l => l.type === 'internal')?.id || '';
        }

        return { src: srcLoc, dest: destLoc };
    };

    const addLine = () => {
        const { src, dest } = getLocationsByType(formData.operationTypeId);
        setFormData({
            ...formData,
            moves: [...formData.moves, { productId: '', quantity: 1, locationSrcId: src, locationDestId: dest }]
        });
    };

    const updateLine = (index: number, field: string, value: any) => {
        const newMoves = [...formData.moves];
        newMoves[index] = { ...newMoves[index], [field]: value };
        setFormData({ ...formData, moves: newMoves });
    };

    const removeLine = (index: number) => {
        const newMoves = formData.moves.filter((_, i) => i !== index);
        setFormData({ ...formData, moves: newMoves });
    };

    const handleSubmit = async () => {
        // Validate receipt-specific fields
        const isCreatingReceipt = searchParams.get('type') === 'receipt';

        if (isCreatingReceipt) {
            if (formData.moves.length === 0) {
                alert('Please add at least one product');
                return;
            }
            if (!destinationLocation) {
                alert('Please select a destination location');
                return;
            }

            // For receipts, auto-assign supplier source and selected destination
            const supplierLocation = locations.find(l => l.type === 'supplier');
            if (!supplierLocation) {
                alert('Supplier location not found');
                return;
            }

            // Update moves with locations
            const movesWithLocations = formData.moves.map(move => ({
                ...move,
                locationSrcId: supplierLocation.id,
                locationDestId: destinationLocation
            }));

            try {
                const res = await fetch('http://localhost:3001/api/operations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        ...formData,
                        contact: contact, // Use the contact state
                        moves: movesWithLocations,
                        scheduledDate: scheduleDate || undefined
                    })
                });
                if (res.ok) {
                    navigate('/receipts');
                } else {
                    const error = await res.json();
                    alert(`Error: ${error.message || 'Failed to create receipt'}`);
                }
            } catch (error) {
                console.error('Error creating receipt:', error);
                alert('Failed to create receipt');
            }
        } else {
            // Standard operation creation
            try {
                const res = await fetch('http://localhost:3001/api/operations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    navigate('/operations');
                } else {
                    const error = await res.json();
                    alert(`Error: ${error.message || 'Failed to create operation'}`);
                }
            } catch (error) {
                console.error('Error creating operation:', error);
                alert('Failed to create operation');
            }
        }
    };

    const handleValidate = async () => {
        if (!operation) return;
        try {
            const res = await fetch(`http://localhost:3001/api/operations/${operation.id}/validate`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchOperation(); // Refresh to see done status
            }
        } catch (error) {
            console.error('Error validating operation:', error);
        }
    };

    const isCreatingReceipt = searchParams.get('type') === 'receipt';
    const backPath = isCreatingReceipt ? '/receipts' : '/operations';

    if (isCreatingReceipt) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(backPath)} className="p-2 hover:bg-dark-surface rounded-full text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">New Receipt</h1>
                            <p className="text-slate-400">Receive products from vendor</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSubmit}
                            className="bg-neon-purple hover:bg-neon-pink text-white px-6 py-2 rounded-md transition-colors shadow-lg shadow-neon-purple/20"
                        >
                            Save Receipt
                        </button>
                        <button className="border border-dark-border text-slate-400 hover:text-white hover:border-slate-400 px-6 py-2 rounded-md transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-dark-surface rounded-lg border border-dark-border p-6 space-y-6">
                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Receive From</label>
                            <input
                                type="text"
                                value={receiveFrom}
                                onChange={(e) => setReceiveFrom(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                                placeholder="Vendor or source location"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Contact</label>
                            <input
                                type="text"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                                placeholder="Contact person or company"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Schedule Date</label>
                            <input
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neon-purple transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Responsible</label>
                            <input
                                type="text"
                                value={responsible}
                                onChange={(e) => setResponsible(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-purple transition-colors"
                                placeholder="Person responsible"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Destination Location</label>
                            <select value={destinationLocation} onChange={(e) => setDestinationLocation(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neon-purple transition-colors">
                                <option value="">Select destination...</option>
                                {locations.filter(l => l.type === 'internal').map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white">Products</h3>
                            <button
                                onClick={addLine}
                                className="text-neon-cyan hover:text-white text-sm flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Product
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.moves.map((move, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 items-center bg-dark-bg p-4 rounded-lg border border-dark-border">
                                    <div className="col-span-6">
                                        <select
                                            value={move.productId}
                                            onChange={e => updateLine(index, 'productId', e.target.value)}
                                            className="w-full bg-dark-surface border border-dark-border rounded-md py-2 px-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={move.quantity}
                                            onChange={e => updateLine(index, 'quantity', parseFloat(e.target.value))}
                                            className="w-full bg-dark-surface border border-dark-border rounded-md py-2 px-3 text-white text-center focus:outline-none focus:border-neon-cyan transition-colors"
                                            placeholder="Qty"
                                        />
                                    </div>
                                    <div className="col-span-2 text-slate-400 text-sm">
                                        units
                                    </div>
                                    <div className="col-span-2 flex justify-center gap-2">
                                        <button
                                            className="text-green-500 hover:text-green-400 transition-colors"
                                            title="Save line"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeLine(index)}
                                            className="text-red-500 hover:text-red-400 transition-colors"
                                            title="Delete line"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {formData.moves.length === 0 && (
                                <div className="text-center py-8 text-slate-500 border border-dashed border-dark-border rounded-lg">
                                    No products added yet. Click "Add Product" to start.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Standard Operation Form (for other types or editing)
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/operations')} className="p-2 hover:bg-dark-surface rounded-full text-slate-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {operation ? operation.reference : 'New Operation'}
                        </h1>
                        <p className="text-slate-400">
                            {operation ? `Status: ${operation.status}` : 'Create a stock movement'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {operation && operation.status === 'draft' && (
                        <button
                            onClick={handleValidate}
                            className="bg-neon-cyan hover:bg-neon-blue text-dark-bg font-bold px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Validate</span>
                        </button>
                    )}
                    {!operation && (
                        <button
                            onClick={handleSubmit}
                            className="bg-neon-purple hover:bg-neon-pink text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Draft</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            {operation && (
                <div className="bg-dark-surface border border-dark-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {['draft', 'waiting', 'ready', 'done'].map((step, idx) => (
                            <div key={step} className="flex items-center">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${operation.status === step
                                        ? 'bg-neon-purple text-white'
                                        : 'text-slate-500'
                                    }`}>
                                    {step}
                                </div>
                                {idx < 3 && <div className="w-8 h-px bg-dark-border mx-2"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-dark-surface p-6 rounded-lg border border-dark-border space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Operation Type</label>
                    <select
                        value={formData.operationTypeId}
                        onChange={e => setFormData({ ...formData, operationTypeId: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan"
                        disabled={!!operation}
                    >
                        <option value="">Select Type...</option>
                        {operationTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.sequenceCode})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Contact (Vendor/Customer)</label>
                        <input
                            type="text"
                            value={formData.contact}
                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan"
                            placeholder="e.g. Acme Corp"
                            disabled={!!operation}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Schedule Date</label>
                        <input
                            type="datetime-local"
                            value={formData.scheduledDate}
                            onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan"
                            disabled={!!operation}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white">Product Moves</h3>
                        {!operation && (
                            <button onClick={addLine} className="text-neon-cyan hover:text-white text-sm flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Line
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {(operation ? operation.moves : formData.moves).map((move: any, index: number) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-end bg-dark-bg p-4 rounded-md border border-dark-border">
                                <div className="col-span-4">
                                    <label className="block text-xs text-slate-500 mb-1">Product</label>
                                    {operation ? (
                                        <div className="text-white text-sm">{move.product?.name}</div>
                                    ) : (
                                        <select
                                            value={move.productId}
                                            onChange={e => updateLine(index, 'productId', e.target.value)}
                                            className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white"
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs text-slate-500 mb-1">From</label>
                                    {operation ? (
                                        <div className="text-slate-300 text-sm">{move.locationSrc?.name}</div>
                                    ) : (
                                        <select
                                            value={move.locationSrcId}
                                            onChange={e => updateLine(index, 'locationSrcId', e.target.value)}
                                            className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white"
                                        >
                                            <option value="">Select Location...</option>
                                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs text-slate-500 mb-1">To</label>
                                    {operation ? (
                                        <div className="text-slate-300 text-sm">{move.locationDest?.name}</div>
                                    ) : (
                                        <select
                                            value={move.locationDestId}
                                            onChange={e => updateLine(index, 'locationDestId', e.target.value)}
                                            className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white"
                                        >
                                            <option value="">Select Location...</option>
                                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs text-slate-500 mb-1">Qty</label>
                                    {operation ? (
                                        <div className="text-white text-sm font-mono">{move.quantity}</div>
                                    ) : (
                                        <input
                                            type="number"
                                            value={move.quantity}
                                            onChange={e => updateLine(index, 'quantity', parseFloat(e.target.value))}
                                            className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white"
                                        />
                                    )}
                                </div>
                                {!operation && (
                                    <div className="col-span-1 flex justify-center pb-1">
                                        <button onClick={() => removeLine(index)} className="text-red-500 hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationForm;
