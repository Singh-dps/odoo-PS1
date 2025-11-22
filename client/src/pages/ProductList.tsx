import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import type { Product } from '../types/product';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import Modal from '../components/Modal';
import ProductForm from './ProductForm';

const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { token } = useAuth();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setProducts(products.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleFormSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
        setIsLoading(true);
        try {
            const url = editingProduct
                ? `${API_URL}/api/products/${editingProduct.id}`
                : `${API_URL}/api/products`;

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                await fetchProducts();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="text-slate-400">Manage your product inventory</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-neon-purple hover:bg-neon-pink text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-lg shadow-neon-purple/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Product</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-dark-surface p-4 rounded-lg border border-dark-border flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                    />
                </div>
                <button className="px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-slate-300 hover:text-white hover:border-neon-cyan transition-colors flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-dark-bg border-b border-dark-border text-slate-400 uppercase text-xs font-medium">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4 text-right">per unit cost</th>
                            <th className="px-6 py-4 text-right">On hand</th>
                            <th className="px-6 py-4 text-right">free to Use</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-dark-bg/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                                <td className="px-6 py-4 text-right text-slate-300">₹{product.cost.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-white">{product.onHand || 0}</td>
                                <td className="px-6 py-4 text-right text-white">{product.freeToUse || 0}</td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="p-1 text-slate-400 hover:text-neon-cyan transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Edit Product' : 'New Product'}
            >
                <ProductForm
                    initialData={editingProduct}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>
        </div>
    );
};

export default ProductList;

