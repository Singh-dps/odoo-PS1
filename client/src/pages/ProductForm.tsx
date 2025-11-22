import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { Product } from '../types/product';

interface ProductFormProps {
    initialData?: Product | null;
    onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isLoading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        cost: 0,
        price: 0,
        barcode: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                sku: initialData.sku,
                category: initialData.category || '',
                cost: initialData.cost,
                price: initialData.price,
                barcode: initialData.barcode || ''
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                category: '',
                cost: 0,
                price: 0,
                barcode: ''
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Product Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                        placeholder="e.g. Wireless Mouse"
                        required
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
                        required
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
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Sales Price</label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                        min="0"
                        step="0.01"
                        required
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

            <div className="flex justify-end gap-4 pt-4 border-t border-dark-border">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-neon-purple hover:bg-neon-pink text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors shadow-lg shadow-neon-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Product'}</span>
                </button>
            </div>
        </form>
    );
};

export default ProductForm;

