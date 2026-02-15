"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Product } from "@/types";
import { Plus, Edit2, Trash2, Search, Package, ShieldCheck, Upload } from "lucide-react";
import NextImage from "next/image";
import Modal from "@/components/ui/Modal";

interface ProductsTabProps {
    initialProducts: Product[];
    searchQuery: string;
}

export default function ProductsTab({ initialProducts, searchQuery }: ProductsTabProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    // const [searchTerm, setSearchTerm] = useState(""); // Removed in favor of prop
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [syncing, setSyncing] = useState(false);

    // Form Stats
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        brand: "",
        stock: "",
        images: [] as string[]
    });

    const [imageUrlInput, setImageUrlInput] = useState("");

    useEffect(() => {
        // Sync passed products only if empty (initial load)
        if (products.length === 0 && initialProducts.length > 0) {
            setProducts(initialProducts);
        }
    }, [initialProducts, products.length]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const refreshProducts = async () => {
        const snapshot = await getDocs(collection(db, "products"));
        const newProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(newProducts);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        const uploadPromises = files.map(async (file) => {
            // Sanitize filename: remove spaces and special characters
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const fileName = `${Date.now()}-${sanitizedName}`;
            const storageRef = ref(storage, `products/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise<string>((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
                        console.log(`Upload progress for ${fileName}: ${progress}%`);
                    },
                    (error) => {
                        console.error(`Upload error for ${fileName}:`, error);
                        alert(`Failed to upload ${file.name}: ${error.message}`);
                        reject(error);
                    },
                    async () => {
                        try {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            setUploadProgress(prev => {
                                const newProgress = { ...prev };
                                delete newProgress[fileName];
                                return newProgress;
                            });
                            resolve(url);
                        } catch (err: any) {
                            console.error("Error getting download URL:", err);
                            reject(err);
                        }
                    }
                );
            });
        });

        try {
            const results = await Promise.allSettled(uploadPromises);
            const successfulUrls = results
                .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
                .map(r => r.value);

            if (successfulUrls.length > 0) {
                setFormData(prev => ({ ...prev, images: [...prev.images, ...successfulUrls] }));
            }

            const failedUploads = results.filter(r => r.status === 'rejected');
            if (failedUploads.length > 0) {
                alert(`${failedUploads.length} image(s) failed to upload. Check console for details.`);
            }
        } catch (error) {
            console.error("Batch upload error:", error);
        } finally {
            setUploading(false);
            setUploadProgress({}); // Clear all progress on finish
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "products"), {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stock: parseInt(formData.stock),
                images: formData.images,
                status: "approved",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await refreshProducts();
            setIsAddModalOpen(false);
            setFormData({ name: "", description: "", price: "", originalPrice: "", category: "", brand: "", stock: "", images: [] });
        } catch (error) {
            console.error("Error adding product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product: Product) => {
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            originalPrice: product.originalPrice?.toString() || "",
            category: product.category,
            brand: product.brand,
            stock: product.stock.toString(),
            images: product.images || []
        });
        setIsEditModalOpen(true);
    };

    const addImageURL = (e: React.MouseEvent) => {
        e.preventDefault();
        if (imageUrlInput.trim()) {
            setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
            setImageUrlInput("");
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProduct) return;
        setLoading(true);
        try {
            const productRef = doc(db, "products", currentProduct.id!);
            await updateDoc(productRef, {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stock: parseInt(formData.stock),
                images: formData.images,
                updatedAt: new Date()
            });
            await refreshProducts();
            setIsEditModalOpen(false);
            setCurrentProduct(null);
        } catch (error) {
            console.error("Error updating product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteDoc(doc(db, "products", productId));
            setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleSyncImages = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/api/admin/sync-local-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dryRun: false })
            });
            const data = await response.json();
            if (response.ok) {
                alert(`Sync complete! ${data.toAdd} new products were added.`);
                await refreshProducts();
            } else {
                throw new Error(data.error || 'Sync failed');
            }
        } catch (error: any) {
            console.error("Sync error:", error);
            alert(`Sync failed: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[30px] shadow-sm border border-slate-50">
                <div className="relative group w-full md:w-96 hidden">
                    {/* Hidden local search in favor of global search */}
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={handleSyncImages}
                        disabled={syncing}
                        className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Upload className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? "Syncing..." : "Sync Local"}
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 md:flex-none px-8 py-4 bg-flyer-red text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-flyer-red/20 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Gear
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-6">Product Item</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6 text-flyer-red">Valuation</th>
                                <th className="px-8 py-6">Stock</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shadow-inner relative">
                                                {product.images && product.images[0] ? (
                                                    <NextImage
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized={product.images[0].startsWith('/')}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wide">{product.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-black text-slate-900">
                                        <div className="flex flex-col">
                                            {product.originalPrice && (
                                                <span className="text-[10px] text-slate-400 line-through decoration-flyer-red/50">₵ {product.originalPrice.toFixed(2)}</span>
                                            )}
                                            <span>₵ {product.price.toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-600">
                                        {product.stock} units
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider">Active</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">

                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className="p-2 text-slate-400 hover:text-flyer-blue hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id!)}
                                                className="p-2 text-slate-400 hover:text-flyer-red hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Product Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Gear">
                <form onSubmit={handleAddProduct} className="space-y-6">
                    <div className="space-y-4">
                        <Input label="Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. MacBook Pro M3" required />
                        <TextArea label="Description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Product details..." required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Regular Price (₵)" name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="0.00" required />
                            <Input label="Original Price (₵)" name="originalPrice" type="number" value={formData.originalPrice} onChange={handleInputChange} placeholder="Strikethrough" />
                        </div>
                        <Input label="Stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} placeholder="0" required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Category" name="category" value={formData.category} onChange={handleInputChange} placeholder="Electronics" required />
                            <Input label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Apple" required />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Manage Images</label>

                            {/* URL Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder="Enter Image URL (Unsplash, etc.)"
                                    className="flex-1 bg-slate-50 border-2 border-transparent focus:border-flyer-blue/20 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={addImageURL}
                                    className="px-6 bg-flyer-blue text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors"
                                >
                                    Add
                                </button>
                                <label className="flex items-center justify-center px-4 bg-slate-100 hover:bg-slate-200 rounded-2xl cursor-pointer transition-colors border-2 border-dashed border-slate-300">
                                    <Upload className={`w-5 h-5 ${uploading ? 'animate-bounce text-flyer-blue' : 'text-slate-500'}`} />
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} multiple />
                                </label>
                            </div>

                            {/* Upload Progress */}
                            {Object.entries(uploadProgress).length > 0 && (
                                <div className="space-y-2 px-2">
                                    {Object.entries(uploadProgress).map(([name, progress]) => (
                                        <div key={name} className="flex flex-col gap-1">
                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
                                                <span className="truncate max-w-[200px]">{name}</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-flyer-blue transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Image Previews */}
                            <div className="grid grid-cols-4 gap-4 px-2">
                                {formData.images.map((url, index) => (
                                    <div key={index} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group">
                                        <NextImage src={url} alt={`Preview ${index}`} fill className="object-cover" unoptimized={url.startsWith('/')} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {uploading && (
                                    <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-flyer-blue animate-bounce" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-flyer-red text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-all disabled:opacity-50">
                        {loading ? "Processing..." : "Create Product"}
                    </button>
                </form>
            </Modal>

            {/* Edit Product Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Gear Details">
                <form onSubmit={handleUpdateProduct} className="space-y-6">
                    <div className="space-y-4">
                        <Input label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
                        <TextArea label="Description" name="description" value={formData.description} onChange={handleInputChange} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Regular Price (₵)" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
                            <Input label="Original Price (₵)" name="originalPrice" type="number" value={formData.originalPrice} onChange={handleInputChange} />
                        </div>
                        <Input label="Stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Category" name="category" value={formData.category} onChange={handleInputChange} required />
                            <Input label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Manage Images</label>

                            {/* URL Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder="Enter Image URL"
                                    className="flex-1 bg-slate-50 border-2 border-transparent focus:border-flyer-blue/20 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={addImageURL}
                                    className="px-6 bg-flyer-blue text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors"
                                >
                                    Add
                                </button>
                                <label className="flex items-center justify-center px-4 bg-slate-100 hover:bg-slate-200 rounded-2xl cursor-pointer transition-colors border-2 border-dashed border-slate-300">
                                    <Upload className={`w-5 h-5 ${uploading ? 'animate-bounce text-flyer-blue' : 'text-slate-500'}`} />
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} multiple />
                                </label>
                            </div>

                            {/* Upload Progress */}
                            {Object.entries(uploadProgress).length > 0 && (
                                <div className="space-y-2 px-2">
                                    {Object.entries(uploadProgress).map(([name, progress]) => (
                                        <div key={name} className="flex flex-col gap-1">
                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
                                                <span className="truncate max-w-[200px]">{name}</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-flyer-blue transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Image Previews */}
                            <div className="grid grid-cols-4 gap-4 px-2">
                                {formData.images.map((url, index) => (
                                    <div key={index} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group">
                                        <NextImage src={url} alt={`Preview ${index}`} fill className="object-cover" unoptimized={url.startsWith('/')} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {uploading && (
                                    <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-flyer-blue animate-bounce" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-flyer-navy text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all disabled:opacity-50">
                        {loading ? "Updating..." : "Save Changes"}
                    </button>
                </form>
            </Modal >
        </div >
    );
}

// Reusable Form Components
const Input = ({ label, ...props }: React.ComponentProps<"input"> & { label: string }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{label}</label>
        <input {...props} className="w-full bg-slate-50 border-2 border-transparent focus:border-flyer-blue/20 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none transition-all" />
    </div>
);

const TextArea = ({ label, ...props }: React.ComponentProps<"textarea"> & { label: string }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{label}</label>
        <textarea {...props} rows={3} className="w-full bg-slate-50 border-2 border-transparent focus:border-flyer-blue/20 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:outline-none transition-all resize-none" />
    </div>
);
