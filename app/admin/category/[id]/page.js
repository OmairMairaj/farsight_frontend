'use client';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import api from '@/utils/axiosInstance';
import { FaChevronCircleLeft, FaHome, FaTrash } from 'react-icons/fa';
import Nav from '../../components/Nav';
import { useAdminAuth } from '@/utils/checkAuth';

const CategoryPage = () => {
    useAdminAuth(); // ✅ Check if user is logged in

    const router = useRouter();
    const { id: categoryId } = useParams(); // ✅ Extract category ID from URL
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const hasOpenModal = showAddModal || showEditModal || showDeleteModal;

        if (hasOpenModal) {
            document.body.style.overflow = "hidden"; // ✅ Prevent scrolling
        } else {
            document.body.style.overflow = "auto"; // ✅ Allow scrolling when modal is closed
        }

        return () => {
            document.body.style.overflow = "auto"; // Cleanup when component unmounts
        };
    }, [showAddModal, showEditModal, showDeleteModal]);

    const placeholderImage = "https://res.cloudinary.com/dtgniimdc/image/upload/v1738739887/categories/tww1osnw4knfvstndywz.png";

    const [newProduct, setNewProduct] = useState({
        model: '',
        type: '',
        deflection: '',
        quantity: 0,
        supplier: '',
        unit_cost: '',
        comments: '',
        image_path: '',
    });

    // ✅ Fetch all categories and preselect the category from URL
    useEffect(() => {
        api.get('/api/category')
            .then((response) => {
                setCategories(response.data);

                // ✅ Find the category from the URL and set as selected
                const foundCategory = response.data.find(cat => cat._id === categoryId);
                if (foundCategory) {
                    setSelectedCategory(foundCategory);
                    fetchProducts(foundCategory._id); // Fetch products for this category
                }
            })
            .catch(error => console.error('Error fetching categories:', error));
    }, [categoryId]); // Re-run when URL ID changes

    // ✅ Fetch products of selected category
    const fetchProducts = (categoryId) => {
        console.log(categoryId);
        api.get(`/api/product?category=${categoryId}`)
            .then(response => {
                setProducts(response.data);
                console.log("Products:", response.data);
            })
            .catch(error => console.error('Error fetching products:', error));
    };

    // ✅ Open Delete Confirmation Modal
    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    // ✅ Handle Category Deletion
    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setPasswordError(""); // Reset error message

        if (!adminPassword) {
            setPasswordError("Admin password is required!");
            setIsDeleting(false);
            return;
        }

        try {
            // ✅ Verify Admin Credentials
            const verifyRes = await api.put("/api/verify-admin", {
                password: adminPassword,
            });

            if (verifyRes.status !== 200) {
                setPasswordError("Incorrect admin credentials.");
                setIsDeleting(false);
                return;
            }

            // ✅ If admin verification is successful, delete the category
            await api.delete(`/api/category/${selectedCategory._id}`);

            // ✅ Remove deleted category from UI
            setCategories(prev => prev.filter(cat => cat._id !== selectedCategory._id));
            setSelectedCategory(null);
            setProducts([]);
            setShowDeleteModal(false);
            setAdminPassword("");
            router.push('/admin/category'); // ✅ Redirect to category list

        } catch (error) {
            console.error("Error verifying admin credentials or deleting category:", error);
            setPasswordError("Error verifying credentials.");
        } finally {
            setIsDeleting(false);
        }
    };

    // ✅ Calculate total cost of each product
    const calculateTotalCost = (product) => {
        return product.unit_cost && product.quantity ? product.unit_cost * product.quantity : 0;
    };

    // ✅ Calculate Grand Total of all products in the category
    const grandTotal = products?.reduce((sum, product) => sum + calculateTotalCost(product), 0);

    // ✅ Handle category change from dropdown
    const handleCategoryChange = (e) => {
        const selectedId = e.target.value;
        const newCategory = categories.find(cat => cat._id === selectedId);
        setSelectedCategory(newCategory);
        router.push(`/admin/category/${selectedId}`); // Change URL
    };

    // ✅ Handle Image Upload
    const handleImageUpload = async (e, isEditing, usePlaceholder) => {
        setIsUploading(true);

        if (usePlaceholder) {
            if (isEditing) {
                setEditingProduct(prev => ({ ...prev, image_path: placeholderImage }));
            } else {
                setNewProduct(prev => ({ ...prev, image_path: placeholderImage }));
            }
            setImagePreview(placeholderImage);
            setIsUploading(false);
            return;
        }

        const file = e.target.files[0];
        if (!file) {
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // ✅ STEP 1: Delete Old Image (Only if it's a Cloudinary URL)
            if (isEditing && editingProduct?.image_path) {
                const previousImage = editingProduct.image_path;

                if (isCloudinaryUrl(previousImage) && previousImage !== placeholderImage) {
                    const publicId = extractPublicId(previousImage);
                    if (publicId) {
                        await api.delete(`/api/delete-image?public_id=${publicId}`);
                    }
                }
            }

            // ✅ STEP 2: Upload New Image
            const res = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.status === 201) {
                const newImageUrl = res.data.url;
                setImagePreview(newImageUrl);

                if (isEditing) {
                    setEditingProduct(prev => ({ ...prev, image_path: newImageUrl }));
                } else {
                    setNewProduct(prev => ({ ...prev, image_path: newImageUrl }));
                }
            } else {
                console.error('Upload failed:', res.data.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const isCloudinaryUrl = (url) => {
        return url && url.includes("res.cloudinary.com");
    };

    // ✅ Function to extract Cloudinary public ID from the URL
    const extractPublicId = (url) => {
        if (!url) return null;
        const parts = url.split("/");
        const filename = parts.pop().split(".")[0]; // Extract filename without extension
        return filename;
    };

    // ✅ Handle Input Change
    const handleInputChange = (e, isEditing = false) => {
        const { name, value } = e.target;
        if (isEditing) {
            setEditingProduct(prev => ({
                ...prev, [name]: value
            }));
        } else {
            setNewProduct(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // const handleEditImageUpload = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             const base64String = reader.result;
    //             setEditingProduct((prev) => ({
    //                 ...prev,
    //                 image_path: base64String,
    //             }));
    //             setImagePreview(base64String);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    // ✅ Handle Adding a New Product
    const handleAddProduct = () => {
        const validationErrors = validateProductForm(newProduct);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        api.post('/api/product', { ...newProduct, category_id: selectedCategory._id })
            .then((response) => {
                if (response.data.product) {
                    setProducts((prevProducts) => [...prevProducts, response.data.product]); // ✅ Append properly
                }
                setShowAddModal(false);
            })
            .catch(error => console.error('Error adding product:', error));
    };

    // ✅ Handle Add Click
    const handleAddClick = () => {
        setShowAddModal(true);
        setErrors({});
        setNewProduct({
            model: '',
            type: '',
            deflection: '',
            quantity: 0,
            supplier: '',
            unit_cost: '',
            comments: '',
            image_path: '',
        });
        setImagePreview('');
        setIsUploading(false);
    };

    // ✅ Handle Editing a Product
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setImagePreview(product.image_path || '/images/placeholder.png');
        setShowEditModal(true);
        setErrors({});
        setIsUploading(false);
    };

    const validateProductForm = (product) => {
        let validationErrors = {};

        if (!product.model.trim()) validationErrors.model = "Model is required.";
        if (!product.type.trim()) validationErrors.type = "Type is required.";
        if (!product.unit_cost || isNaN(product.unit_cost) || product.unit_cost <= 0)
            validationErrors.unit_cost = "Valid unit cost is required.";

        return validationErrors;
    };

    const handleEditProduct = () => {
        const validationErrors = validateProductForm(editingProduct);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        api.put(`/api/product/${editingProduct._id}`, editingProduct)
            .then(() => {
                setProducts(prevProducts =>
                    prevProducts.map(prod =>
                        prod._id === editingProduct._id ? editingProduct : prod
                    )
                );
                setShowEditModal(false);
            })
            .catch(error => console.error('Error updating product:', error));
    };

    return (
        <div className='min-h-screen bg-white'>
            <Nav />

            <div className="container mx-auto mt-4 pb-10 px-6 text-sm">
                <button onClick={() => router.push('/admin/category')} className='text-xl text-gray-600 flex gap-2 items-center mb-2'>
                    <FaChevronCircleLeft />Back
                </button>
                <div className='mb-2 flex justify-between space-x-4'>
                    {/* ✅ Category Selection Dropdown */}
                    <div className="text-center flex items-center">
                        <label className="text-gray-700 font-medium mr-4 text-base">Select Category:</label>
                        <select
                            className="text-sm border border-gray-300 min-w-96 max-w-96 text-black px-4 py-2 rounded-md focus:outline-none focus:ring-0 truncate"
                            value={selectedCategory?._id || ''}
                            onChange={handleCategoryChange}
                        >
                            {categories.map(category => (
                                <option key={category._id} value={category._id} className='text-sm'>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleDeleteClick}
                            className="bg-red-500 px-4 py-2 ml-3 rounded-lg text-white flex items-center hover:bg-red-600"
                        >
                            <span className='mr-2'><FaTrash /></span>Delete Category
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <div className='flex items-center space-x-2'>
                            <div className='bg-gray-400 rounded-full p-2 flex items-center justify-center shadow shadow-black hover:bg-gray-500' onClick={() => router.push('/admin/category')}>
                                <FaHome className='w-5 h-5 text-white' />
                            </div>
                            <button
                                onClick={() => handleAddClick()}
                                className="bg-blue-400 px-4 py-2 rounded-lg text-white hover:bg-blue-500"
                            >
                                Add New Product
                            </button>
                        </div>
                    </div>
                </div>

                <h1 className="text-lg italic font-bold text-center bg-blue-400 text-white py-2 rounded-lg">
                    {selectedCategory?.category_name || "Product Listing"}
                </h1>

                <div className="overflow-x-auto overflow-y-auto h-[68vh] rounded-lg border border-gray-50">
                    <table className="table-auto w-full text-left border-collapse border border-gray-300">
                        <thead className="bg-blue-400 text-white sticky top-[-1px]">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">S#</th>
                                <th className="border border-gray-300 px-4 py-2">PICTURE</th>
                                <th className="border border-gray-300 px-4 py-2">MODEL</th>
                                <th className="border border-gray-300 px-4 py-2">TYPE</th>
                                <th className="border border-gray-300 px-4 py-2 min-w-10">Def (Inch)</th>
                                <th className="border border-gray-300 px-4 py-2">QTY</th>
                                <th className="border border-gray-300 px-4 py-2">VENDOR</th>
                                <th className="border border-gray-300 px-4 py-2">Unit Cost</th>
                                <th className="border border-gray-300 px-4 py-2">Total Cost</th>
                                <th className="border border-gray-300 px-4 py-2">COMMENTS</th>
                                <th className="border border-gray-300 py-2 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products ?
                                products.length > 0 ? (
                                    products.map((product, index) => (
                                        <tr key={product._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/product/${product._id}`)}>
                                            <td className="border border-gray-300 px-4 py-0 text-gray-700 text-center">{index + 1}</td>
                                            <td className="border border-gray-300 px-4 py-0 text-center flex items-center justify-center">
                                                <img
                                                    src={product.image_path || '/images/placeholder.png'}
                                                    alt={product.model}
                                                    loading="lazy"
                                                    className="w-20 h-20 rounded-md object-contain"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                                                />
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-700">{product.model}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-700">{product.type}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-700 text-center min-w-28">{product.deflection || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-700 text-center font-bold">{product.quantity.toLocaleString() || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-700">{product.supplier}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-700 text-center">{product.unit_cost.toLocaleString() || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-700 text-center font-bold">{calculateTotalCost(product).toLocaleString()}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-green-700 font-semibold">{product.comments || '-'}</td>
                                            <td className="border border-gray-300 py-0 px-4 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // ✅ Prevent row click event from firing
                                                        handleEditClick(product);
                                                    }}
                                                    className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="text-center py-4 text-gray-500">
                                            No products available in this category.
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="text-center py-4 text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                        {products && products.length > 0 && (
                            <tfoot className='sticky bottom-[-1px]'>
                                <tr className="bg-gray-200 font-bold text-gray-600">
                                    <td colSpan="8" className="border border-gray-300 py-3 px-4 text-left text-base">Total Cost (Rs)</td>
                                    <td className="border border-gray-300 py-3 px-4 text-center text-gray-800">
                                        {grandTotal.toLocaleString()}
                                    </td>
                                    <td colSpan="2" className="border border-gray-300 py-3 px-4"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative text-gray-600">
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Add New Product</h2>
                        <button className="absolute top-2 right-2 text-gray-600" onClick={() => setShowAddModal(false)}>X</button>
                        {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                        <input type="text" name="model" required placeholder="Model" className="w-full mb-2 border p-2" onChange={handleInputChange} value={newProduct.model} />
                        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                        <input type="text" name="type" required placeholder="Type" className="w-full mb-2 border p-2" onChange={handleInputChange} value={newProduct.type} />

                        <input type="text" name="deflection" placeholder="Deflection (Inch)" className="w-full mb-2 border p-2" onChange={handleInputChange} value={newProduct.deflection} />
                        {errors.supplier && <p className="text-red-500 text-sm">{errors.supplier}</p>}
                        <input type="text" name="supplier" required placeholder="Vendor" className="w-full mb-2 border p-2" onChange={handleInputChange} value={newProduct.supplier} />
                        {errors.unit_cost && <p className="text-red-500 text-sm">{errors.unit_cost}</p>}
                        <input type="number" name="unit_cost" required placeholder="Unit Cost" className="w-full mb-2 text-gray-600 border p-2" onChange={handleInputChange} value={newProduct.unit_cost} />

                        <textarea name="comments" placeholder="Comments" className="w-full mb-2 border p-2" onChange={handleInputChange} value={newProduct.comments}></textarea>

                        <div className="flex space-x-2">
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false, false)} className="mb-2 w-2/3" />
                            <button
                                onClick={() => handleImageUpload(null, false, true)}
                                className="bg-gray-300 px-2 py-1 mb-2 rounded-lg text-xs hover:bg-gray-400"
                                disabled={isUploading}
                            >
                                Use Placeholder
                            </button>
                        </div>
                        {imagePreview && <img src={imagePreview} className="w-20 h-20 mb-2" onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder.png';
                        }} />}

                        <button onClick={handleAddProduct} disabled={isUploading}
                            className={`bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isUploading ? 'Uploading...' : 'Add Product'}
                        </button>
                    </div>
                </div>
            )}
            {/* ✅ Edit Product Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative text-gray-600">
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Edit Product</h2>
                        <button className="absolute top-2 right-2 text-gray-600" onClick={() => setShowEditModal(false)}>X</button>

                        <label className="block text-sm font-semibold">Model:</label>
                        {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                        <input type="text" name="model" required placeholder="Model" className="w-full mb-2 border p-1" onChange={(e) => handleEditInputChange(e)} value={editingProduct?.model || ''} />

                        <label className="block text-sm font-semibold">Type:</label>
                        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                        <input type="text" name="type" required placeholder="Type" className="w-full mb-2 border p-1" onChange={(e) => handleEditInputChange(e)} value={editingProduct?.type || ''} />

                        <label className="block text-sm font-semibold">Def (Inch):</label>
                        <input type="text" name="deflection" placeholder="Deflection (Inch)" className="w-full mb-2 border p-1"
                            onChange={(e) => handleEditInputChange(e)} value={editingProduct?.deflection || ''} />

                        <label className="block text-sm font-semibold">Vendor:</label>
                        {errors.supplier && <p className="text-red-500 text-sm">{errors.supplier}</p>}
                        <input type="text" name="supplier" placeholder="Vendor" className="w-full mb-2 border p-1"
                            onChange={(e) => handleEditInputChange(e)} value={editingProduct?.supplier || ''} />

                        <label className="block text-sm font-semibold">Unit Cost:</label>
                        {errors.unit_cost && <p className="text-red-500 text-sm">{errors.unit_cost}</p>}
                        <input type="number" name="unit_cost" placeholder="Unit Cost" className="w-full mb-2 border p-1"
                            onChange={(e) => handleEditInputChange(e)} value={editingProduct?.unit_cost || ''} />

                        <label className="block text-sm font-semibold">Comments:</label>
                        <textarea name="comments" placeholder="Comments" className="w-full mb-2 border p-1"
                            onChange={(e) => handleEditInputChange(e)} value={editingProduct?.comments || ''}></textarea>

                        <label className="block text-sm font-semibold">Image:</label>
                        <div className="flex space-x-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, true, false)}
                                disabled={isUploading} // ✅ Prevent selecting a new file while upload is in progress
                                className={`mb-2 w-2/3 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <button
                                onClick={() => handleImageUpload(null, true, true)}
                                className="bg-gray-300 px-2 py-1 mb-2 rounded-lg text-xs hover:bg-gray-400"
                                disabled={isUploading}
                            >
                                Use Placeholder
                            </button>
                        </div>

                        {/* Show Image Preview */}
                        {imagePreview ? (
                            <img src={imagePreview} className="w-20 h-20 mb-2 rounded-md object-cover" alt="Product preview" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder.png';
                            }} />
                        ) : (
                            <img src={editingProduct?.image_path || '/images/placeholder.png'} className="w-20 h-20 mb-2 rounded-md object-cover" alt="Existing product image" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder.png';
                            }} />
                        )}

                        <button onClick={handleEditProduct}
                            disabled={isUploading}
                            className={`px-4 py-2 rounded-lg ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-400 text-white hover:bg-blue-500'}`}
                        >
                            {isUploading ? "Uploading..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}
            {/* ✅ Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-gray-600 text-center relative">
                        <h2 className="text-xl font-bold mb-4 text-red-500">Confirm Delete?</h2>
                        <p className="text-gray-700">
                            Are you sure you want to delete <b>{selectedCategory?.category_name}</b>?
                        </p>
                        <p className="text-gray-700 mt-2">
                            This will also delete <b>{products?.length}</b> related products.
                        </p>

                        {/* ✅ Admin Password Input */}
                        <label className="block text-left text-gray-700 font-semibold mt-4">
                            Admin Password:
                        </label>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                        />

                        {/* ✅ Show Error Message */}
                        {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}

                        {/* ✅ Delete & Cancel Buttons */}
                        <div className="mt-4 flex justify-center">
                            <button
                                className={`bg-red-500 px-4 py-2 text-white rounded-lg mr-2 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>

                            <button
                                className="bg-gray-400 px-4 py-2 text-white rounded-lg"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
