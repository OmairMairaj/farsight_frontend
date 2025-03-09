'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import api from '@/utils/axiosInstance';
import Nav from '../components/Nav';
import { useAdminAuth } from '@/utils/checkAuth';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Admin = () => {
    useAdminAuth();

    const router = useRouter();
    const [categories, setCategories] = useState();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImagePublicId, setUploadedImagePublicId] = useState(null);
    const [newCategory, setNewCategory] = useState({
        category_name: '',
        category_image_path: '',
        comments: '',
    });
    const [error, setError] = useState(null);
    const [isReordering, setIsReordering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const placeholderImage = "https://res.cloudinary.com/dtgniimdc/image/upload/v1738739887/categories/tww1osnw4knfvstndywz.png";

    useEffect(() => {
        const hasOpenModal = showAddModal || showEditModal;

        if (hasOpenModal) {
            document.body.style.overflow = "hidden"; // ✅ Prevent scrolling
        } else {
            document.body.style.overflow = "auto"; // ✅ Allow scrolling when modal is closed
        }

        return () => {
            document.body.style.overflow = "auto"; // Cleanup when component unmounts
        };
    }, [showAddModal, showEditModal]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640); // Adjust threshold as needed (e.g., 640px for Tailwind's 'sm')
        };

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Fetch categories from the backend
    useEffect(() => {
        api.get('/api/category')
            .then((response) => {
                setCategories(response.data);
            })
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    // Function to calculate total cost of a category
    const calculateCategoryTotalCost = (category) => {
        return category.products.reduce((acc, product) => {
            const totalCost = product.quantity * (product.unit_cost || 0);
            return acc + totalCost;
        }, 0);
    };

    // Calculate grand total cost (sum of all category totals)
    const grandTotal = categories?.reduce((sum, category) => sum + calculateCategoryTotalCost(category), 0);

    const handleAddClick = () => {
        setShowAddModal(true);
        setImagePreview(null);
        setIsUploading(false); // ✅ Reset upload state
    };

    // Handle edit button click
    const handleEditClick = (category) => {
        setSelectedCategory({ ...category });
        setImagePreview(category.category_image_path || '/images/placeholder.png');
        setShowEditModal(true);
        setIsUploading(false); // ✅ Reset upload state
    };

    // Handle input changes in the edit modal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedCategory((prevCategory) => ({
            ...prevCategory,
            [name]: value,
        }));
    };

    // Handle input changes in the add category modal
    const handleNewCategoryChange = (e) => {
        const { name, value } = e.target;
        setNewCategory((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = async (e, isNew = false, usePlaceholder = false) => {
        setIsUploading(true); // ✅ Start uploading

        if (usePlaceholder) {
            if (isNew) {
                setNewCategory(prev => ({ ...prev, category_image_path: placeholderImage }));
            } else {
                setSelectedCategory(prev => ({ ...prev, category_image_path: placeholderImage }));
            }
            setImagePreview(placeholderImage);
            setIsUploading(false);
            setUploadedImagePublicId(null);
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
            if (!isNew && selectedCategory?.category_image_path) {
                const previousImage = selectedCategory.category_image_path;

                if (isCloudinaryUrl(previousImage) && previousImage !== placeholderImage) {
                    const publicId = extractPublicId(previousImage);
                    if (publicId) {
                        await api.delete(`/api/delete-image?public_id=${publicId}`);
                    }
                }
            }

            const res = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const data = res.data;

            if (res.status === 201) {
                if (isNew) {
                    setNewCategory(prev => ({ ...prev, category_image_path: data.url }));
                } else {
                    setSelectedCategory(prev => ({ ...prev, category_image_path: data.url }));
                }
                setImagePreview(data.url);
                setUploadedImagePublicId(extractPublicId(data.url));
            } else {
                console.error('Upload failed:', data.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false); // ✅ Stop uploading after completion
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

    // Handle save changes for editing category
    const handleSaveChanges = () => {
        console.log(selectedCategory);
        if (!selectedCategory.category_name) {
            setError('Category name is required.');
            return;
        }
        api.put(`/api/category/${selectedCategory._id}`, selectedCategory)
            .then(() => {
                setCategories(categories.map(category =>
                    category._id === selectedCategory._id ? selectedCategory : category
                ));
                setShowEditModal(false);
                setError(null);
            })
            .catch(error => console.error('Error updating category:', error));
    };

    // Handle save new category
    const handleSaveNewCategory = () => {
        if (!newCategory.category_name) {
            setError('Category name is required.');
            return;
        }
        api.post('/api/category', newCategory)
            .then((response) => {
                setCategories([...categories, response.data]); // Update UI
                setShowAddModal(false);
                setError(null);
                setNewCategory({ category_name: '', category_image_path: '', comments: '' }); // Reset form
            })
            .catch(error => console.error('Error adding category:', error));
    };


    const handleRemoveImage = async () => {
        // If the current image is a placeholder, just reset it
        if (imagePreview === placeholderImage) {
            setImagePreview("/images/placeholder.png");
            if (selectedCategory) {
                setSelectedCategory(prev => ({ ...prev, category_image_path: "" }));
            } else {
                setNewCategory(prev => ({ ...prev, category_image_path: "" }));
            }
            return;
        }

        // If it's a Cloudinary image, delete it
        if (isCloudinaryUrl(imagePreview)) {
            const publicId = extractPublicId(imagePreview);
            if (publicId) {
                try {
                    await api.delete(`/api/delete-image?public_id=${publicId}`);
                    console.log(`✅ Deleted from Cloudinary: ${publicId}`);
                } catch (error) {
                    console.error("🚨 Error deleting image from Cloudinary:", error);
                }
            }
        }

        // Remove the image from state
        setImagePreview("/images/placeholder.png");
        if (selectedCategory) {
            setSelectedCategory(prev => ({ ...prev, category_image_path: "" }));
        } else {
            setNewCategory(prev => ({ ...prev, category_image_path: "" }));
        }
    };

    const handleCloseAddModal = async () => {
        if (uploadedImagePublicId) {
            try {
                await api.delete(`/api/delete-image?public_id=${uploadedImagePublicId}`);
                console.log(`✅ Deleted orphan Cloudinary image: ${uploadedImagePublicId}`);
            } catch (error) {
                console.error("🚨 Error deleting orphan image from Cloudinary:", error);
            }
        }
        setUploadedImagePublicId(null); // ✅ Reset public_id
        setShowAddModal(false);
        setError(null);
        setNewCategory({ category_name: '', category_image_path: '', comments: '' }); // ✅ Reset form
        setImagePreview('');
    };


    // ✅ Function to update category order in the backend
    const updateCategoryOrder = async (updatedCategories) => {
        setIsReordering(true);

        try {
            const reorderedCategories = updatedCategories.map(category => ({
                _id: category._id,
                order: category.order
            }));

            console.log("📤 Sending reordered categories:", reorderedCategories); // ✅ Debugging log

            await api.put("/api/category", { reorderedCategories });

            console.log("✅ Order updated successfully!");
        } catch (error) {
            console.error("🚨 Error updating order:", error.response?.data || error.message);
        } finally {
            setIsReordering(false);
        }
    };

    // ✅ Handle drag end event
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const updatedCategories = [...categories];
        const [movedCategory] = updatedCategories.splice(result.source.index, 1);
        updatedCategories.splice(result.destination.index, 0, movedCategory);

        // ✅ Update order fields
        const reorderedCategories = updatedCategories.map((category, index) => ({
            ...category,
            order: index + 1,
        }));

        setCategories(reorderedCategories);
        updateCategoryOrder(reorderedCategories);
    };

    return (
        <div className='min-h-screen bg-white'>
            {/* <nav className="bg-white text-black shadow-md sticky top-0">
                <div className="flex mx-auto container items-center justify-between py-3 px-6">
                    <div className="flex items-center">
                        <img src="/images/farsight-logo.png" alt="Farsight Logo" width={250} height={60} className="mr-4 w-64 h-16" />
                    </div>
                    <button onClick={() => router.push('/')} className="bg-blue-400 px-8 py-2 rounded-xl text-white hover:bg-blue-500">
                        LOGOUT
                    </button>
                </div>
            </nav> */}
            <Nav />
            <div className="container mx-auto mt-4 px-4 sm:px-6 text-sm">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">Product Portfolio</h1>
                    <button
                        onClick={() => handleAddClick()}
                        className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 text-sm sm:text-base"
                    >
                        {isMobile ? "Add New" : "Add New Category"}
                    </button>
                </div>

                {/* ✅ Drag & Drop Table */}
                <div className="table-container overflow-x-auto overflow-y-auto h-[70vh] rounded-lg {border border-gray-300">
                    {isMobile ? (
                        <table className="table-auto w-full text-left border-collapse border border-gray-300">
                            <thead className="bg-blue-400 text-white text-xs sm:text-sm md:text-sm sticky top-[-1px]">
                                <tr>
                                    <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center">S#</th>
                                    <th className="border border-gray-300 py-2 px-2 sm:px-4 min-w-40">Product Name</th>
                                    <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center min-w-40">Product Picture</th>
                                    {/* <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center min-w-20">No. of Products</th> */}
                                    {/* <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center">Total Cost (Rs)</th> */}
                                    <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center">Comments</th>
                                    {/* <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="text-xs sm:text-sm md:text-sm">
                                {categories ? categories.length > 0 ? (
                                    categories.map((category, index) => (
                                        <tr key={category._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/category/${category._id}`)}>
                                            <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-gray-700">{index + 1}</td>
                                            <td className="border border-gray-300 px-2 sm:px-4 py-2 text-gray-700 min-w-40">{category.category_name}</td>
                                            <td className="border border-gray-300 px-2 sm:px-4 py-0 flex items-center justify-center text-center min-w-40">
                                                <Image
                                                    src={category.category_image_path || '/images/placeholder.png'}
                                                    alt={category.category_name}
                                                    width={100}
                                                    height={50}
                                                    className="w-64 h-16 rounded-md flex items-center object-contain"
                                                />
                                            </td>
                                            {/* <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-gray-700 font-semibold min-w-20">{category.products.length}</td> */}
                                            {/* <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-gray-800 font-bold">
                                                {calculateCategoryTotalCost(category).toLocaleString()}
                                            </td> */}
                                            <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-green-700 font-semibold min-w-48 max-w-48 sm:max-w-96 truncate-3-lines">
                                                {category.comments || '--'}
                                            </td>
                                            {/* <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // ✅ Prevent row click event from firing
                                                        handleEditClick(category);
                                                    }}
                                                    className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                                                >
                                                    Edit
                                                </button>
                                            </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-gray-500">
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center py-4 text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {/* {categories && categories.length > 0 && (
                                <tfoot className='sticky bottom-[-1px] text-xs sm:text-sm md:text-sm'>
                                    <tr className="bg-gray-200 font-bold text-gray-600">
                                        <td colSpan="4" className="border border-gray-300 py-3 px-4 text-left">Total Cost (Rs)</td>
                                        <td className="border border-gray-300 py-3 px-4 text-center text-gray-800">
                                            {grandTotal.toLocaleString()}
                                        </td>
                                        <td colSpan="2" className="border border-gray-300 py-3 px-4"></td>
                                    </tr>
                                </tfoot>
                            )} */}
                        </table>
                    ) : (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="categories">
                                {(provided) => (
                                    <table
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="table-auto w-full text-left border-collapse border border-gray-300"
                                    >
                                        <thead className="bg-blue-400 text-white text-xs sm:text-sm md:text-sm sticky top-[-1px]">
                                            <tr>
                                                <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center">S#</th>
                                                <th className="border border-gray-300 py-2 px-2 sm:px-4 min-w-40">Category Name</th>
                                                <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center min-w-40">Category Picture</th>
                                                <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center min-w-20">No. of Products</th>
                                                <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center">Total Cost (Rs)</th>
                                                <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center">Comments</th>
                                                <th className="border border-gray-300 py-2 px-2 sm:px-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='text-xs sm:text-sm md:text-sm'>
                                            {categories ?
                                                categories.length > 0 ? (
                                                    categories.map((category, index) => (
                                                        <Draggable key={category._id} draggableId={category._id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <tr ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`hover:bg-gray-50 cursor-pointer ${snapshot.isDragging ? "bg-gray-200 flex flex-1 w-full" : ""
                                                                        }`}
                                                                    onClick={() => router.push(`/admin/category/${category._id}`)}
                                                                >
                                                                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-gray-700">{index + 1}</td>
                                                                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-gray-700 min-w-40">{category.category_name}</td>
                                                                    <td className="border border-gray-300 px-2 sm:px-4 py-0 flex items-center justify-center text-center min-w-40">
                                                                        <Image
                                                                            src={category.category_image_path || '/images/placeholder.png'}
                                                                            alt={category.category_name}
                                                                            width={100}
                                                                            height={50}
                                                                            className="w-64 h-16 rounded-md flex items-center object-contain"
                                                                        />
                                                                    </td>
                                                                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-gray-700 font-semibold min-w-20">{category.products.length > 0 ? category.products.length : '-'}</td>
                                                                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-gray-800 font-bold">
                                                                        {calculateCategoryTotalCost(category) > 0 ? calculateCategoryTotalCost(category).toLocaleString() : "-"}
                                                                    </td>
                                                                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-green-700 font-semibold min-w-48 max-w-48 sm:max-w-96 truncate-3-lines">
                                                                        {category.comments || '--'}
                                                                    </td>
                                                                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // ✅ Prevent row click event from firing
                                                                                handleEditClick(category);
                                                                            }}
                                                                            className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="10" className="text-center py-4 text-gray-500">
                                                            No categories found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <tr>
                                                        <td colSpan="10" className="text-center py-4 text-gray-500">
                                                            Loading...
                                                        </td>
                                                    </tr>
                                                )}
                                            {provided.placeholder}
                                        </tbody>
                                        {categories && categories.length > 0 && (
                                            <tfoot className='sticky bottom-[-1px] text-xs sm:text-sm md:text-sm'>
                                                <tr className="bg-gray-200 font-bold text-gray-600">
                                                    <td colSpan="4" className="border border-gray-300 py-3 px-4 text-left">Total Cost (Rs)</td>
                                                    <td className="border border-gray-300 py-3 px-4 text-center text-gray-800">
                                                        {grandTotal.toLocaleString()}
                                                    </td>
                                                    <td colSpan="2" className="border border-gray-300 py-3 px-4"></td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </div>
            </div>

            {/* Modal for editing category */}
            {
                showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-0">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg sm:max-w-md relative text-gray-600 animate-fadeIn">
                            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 px-2" onClick={() => setShowEditModal(false)}>✕</button>
                            <h2 className="text-xl sm:text-2xl text-blue-400 font-bold mb-4">Edit Category</h2>

                            {/* Category Name */}
                            <label className="block text-gray-700 mb-1 text-sm">Category Name</label>
                            <input
                                type="text"
                                name="category_name"
                                value={selectedCategory?.category_name || ''}
                                onChange={handleInputChange}
                                className="w-full border rounded p-2 mb-3 text-sm sm:text-base"
                            />

                            {/* Upload Image */}
                            <label className="block text-gray-700 mb-1 text-sm">Upload Image</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, false)}
                                    className={`w-full border rounded p-2 mb-3 cursor-pointer text-sm sm:text-base ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isUploading} // ✅ Prevent selecting a new file while upload is in progress
                                />
                                <button
                                    onClick={() => handleImageUpload(null, false, true)}
                                    className="bg-gray-300 px-2 py-1 mb-3 rounded-lg text-xs hover:bg-gray-400"
                                    disabled={isUploading}
                                >
                                    Use Placeholder
                                </button>
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative w-48 h-24 mb-3">
                                    {/* Delete button */}
                                    {imagePreview !== '/images/placeholder.png' &&
                                        <button
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                            onClick={() => handleRemoveImage()}
                                        >
                                            X
                                        </button>
                                    }

                                    {/* Image */}
                                    <img
                                        src={imagePreview}
                                        className="h-full w-full object-contain rounded-md"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/images/placeholder.png";
                                        }}
                                    />
                                </div>
                            )}

                            {/* Comments */}
                            <label className="block text-gray-700 mb-1 text-sm">Comments</label>
                            <textarea
                                name="comments"
                                value={selectedCategory?.comments || ''}
                                onChange={handleInputChange}
                                className="w-full border rounded p-2 mb-3 text-sm sm:text-base"
                            ></textarea>

                            {/* Error Message */}
                            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                            <button onClick={handleSaveChanges} disabled={isUploading} className={`w-full bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 text-sm sm:text-base ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isUploading ? 'Uploading...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Modal for adding new category */}
            {
                showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-0">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg sm:max-w-md relative text-gray-600 animate-fadeIn">
                            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 px-2" onClick={handleCloseAddModal}>✕</button>
                            <h2 className="text-xl sm:text-2xl text-blue-400 font-bold mb-4">Add New Category</h2>

                            {/* Category Name */}
                            <label className="block text-gray-700 mb-1 text-sm">Category Name</label>
                            <input
                                type="text"
                                name="category_name"
                                required
                                value={newCategory.category_name}
                                onChange={handleNewCategoryChange}
                                className="w-full border rounded p-2 mb-3 text-sm sm:text-base"
                            />

                            {/* Upload Image */}
                            <label className="block text-gray-700 mb-1 text-sm">Upload Image</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, true)}
                                    className="w-full border rounded p-2 mb-3 cursor-pointer text-sm sm:text-base"
                                />
                                <button
                                    onClick={() => handleImageUpload(null, true, true)}
                                    className="bg-gray-300 px-2 py-1 mb-3 rounded-lg text-xs hover:bg-gray-400"
                                    disabled={isUploading}
                                >
                                    Use Placeholder
                                </button>
                            </div>

                            {/* Image Preview */}
                            {imagePreview &&
                                <img src={imagePreview} className="h-24 w-32 object-contain rounded-md mb-3" onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/placeholder.png';
                                }} />
                            }

                            {/* Comments */}
                            <label className="block text-gray-700 mb-1 text-sm">Comments</label>
                            <textarea name="comments" value={newCategory.comments} onChange={handleNewCategoryChange} className="w-full border rounded p-2 mb-3 text-sm sm:text-base"></textarea>

                            {/* Error Message */}
                            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                            <button onClick={handleSaveNewCategory} disabled={isUploading} className={`w-full bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 text-sm sm:text-base ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isUploading ? 'Uploading...' : 'Save Category'}
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Admin;
