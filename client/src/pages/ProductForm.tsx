import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductForm = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        cost: 0,
        price: 0,
        barcode: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/products');
            }
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="p-2 hover:bg-dark-surface rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">New Product</h1>
                        <p className="text-slate-400">Create a new product record</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-neon-purple hover:bg-neon-pink text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors shadow-lg shadow-neon-purple/20"
                >
                    <Save className="w-4 h-4" />
                    <span>Save Product</span>
                </button>
            </div>

            {/* Form */}
            <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Product Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="e.g. Wireless Mouse"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">SKU</label>
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="e.g. WM-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="e.g. Electronics"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Cost Price</label>
                        <input
                            type="number"
                            value={formData.cost}
                            onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Sales Price</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Barcode</label>
                        <input
                            type="text"
                            value={formData.barcode}
                            onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="Scan barcode..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
