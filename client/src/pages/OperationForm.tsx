import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types/product';
import type { Location } from '../types/inventory';
import type { OperationType, StockOperation } from '../types/operation';

const OperationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [operation, setOperation] = useState<StockOperation | null>(null);

    const [formData, setFormData] = useState({
        operationTypeId: '',
        moves: [] as any[]
    });

    useEffect(() => {
        fetchData();
        if (id) fetchOperation();
    }, [id]);

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
                // If viewing existing, we might not need to populate formData for editing if we only support create/validate
            }
        } catch (error) {
            console.error('Error fetching operation:', error);
        }
    };

    const addLine = () => {
        setFormData({
            ...formData,
            moves: [...formData.moves, { productId: '', quantity: 1, locationSrcId: '', locationDestId: '' }]
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
        try {
            const res = await fetch('http://localhost:3001/api/operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                navigate('/operations');
            }
        } catch (error) {
            console.error('Error creating operation:', error);
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

    // Render View Mode (if id exists)
    if (id && operation) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/operations')} className="p-2 hover:bg-dark-surface rounded-full text-slate-400 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{operation.reference}</h1>
                            <p className="text-slate-400">{operation.operationType?.name}</p>
                        </div>
                        <span className={`ml-4 px-3 py-1 rounded-full text-sm font-bold capitalize ${operation.status === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                            }`}>
                            {operation.status}
                        </span>
                    </div>
                    {operation.status !== 'done' && (
                        <button
                            onClick={handleValidate}
                            className="bg-neon-cyan hover:bg-neon-blue text-dark-bg font-bold px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Validate</span>
                        </button>
                    )}
                </div>

                <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-dark-bg border-b border-dark-border text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">From</th>
                                <th className="px-6 py-4">To</th>
                                <th className="px-6 py-4 text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {operation.moves?.map((move) => (
                                <tr key={move.id}>
                                    <td className="px-6 py-4 text-white">{move.product?.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{move.locationSrc?.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{move.locationDest?.name}</td>
                                    <td className="px-6 py-4 text-right text-white font-mono">{move.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Render Create Mode
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/operations')} className="p-2 hover:bg-dark-surface rounded-full text-slate-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">New Operation</h1>
                        <p className="text-slate-400">Create a stock movement</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-neon-purple hover:bg-neon-pink text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                </button>
            </div>

            <div className="bg-dark-surface p-6 rounded-lg border border-dark-border space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Operation Type</label>
                    <select
                        value={formData.operationTypeId}
                        onChange={e => setFormData({ ...formData, operationTypeId: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan"
                    >
                        <option value="">Select Type...</option>
                        {operationTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.sequenceCode})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white">Product Moves</h3>
                        <button onClick={addLine} className="text-neon-cyan hover:text-white text-sm flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Line
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.moves.map((move, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-end bg-dark-bg p-4 rounded-md border border-dark-border">
                                <div className="col-span-4">
                                    <label className="block text-xs text-slate-500 mb-1">Product</label>
                                    <select
                                        value={move.productId}
                                        onChange={e => updateLine(index, 'productId', e.target.value)}
                                        className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white"
                                    >
                                        <option value="">Select Product...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs text-slate-500 mb-1">From</label>
                                    <select
                                        value={move.locationSrcId}
                                        onChange={e => updateLine(index, 'locationSrcId', e.target.value)}
                                        className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white"
                                    >
                                        <option value="">Source...</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs text-slate-500 mb-1">To</label>
                                    <select
                                        value={move.locationDestId}
                                        onChange={e => updateLine(index, 'locationDestId', e.target.value)}
                                        className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white"
                                    >
                                        <option value="">Dest...</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs text-slate-500 mb-1">Qty</label>
                                    <input
                                        type="number"
                                        value={move.quantity}
                                        onChange={e => updateLine(index, 'quantity', parseFloat(e.target.value))}
                                        className="w-full bg-dark-surface border border-dark-border rounded px-2 py-1 text-sm text-white"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center pb-1">
                                    <button onClick={() => removeLine(index)} className="text-red-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationForm;
