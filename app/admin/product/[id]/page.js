'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMemo } from 'react';
import { FaChevronCircleLeft, FaFilePdf, FaFileWord, FaFileImage, FaFileAlt, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import api from '@/utils/axiosInstance';
import imageCompression from 'browser-image-compression';
import Nav from '../../components/Nav';
import { useAdminAuth } from '@/utils/checkAuth';

const ProductDetail = () => {
    useAdminAuth(); // ✅ Ensure user is logged in

    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState({ stock_data: [] });
    const [stocks, setStocks] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [editingStock, setEditingStock] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockToDelete, setStockToDelete] = useState(null);
    const [stockType, setStockType] = useState('Stock In'); // ✅ Store whether Stock In or Out
    const [stockTransaction, setStockTransaction] = useState({
        quantity: '',
        description: '',
        attachments: [], // ✅ Store uploaded file URLs
    });
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [adminPassword, setAdminPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [newAttachments, setNewAttachments] = useState([]);
    const [originalAttachments, setOriginalAttachments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const hasOpenModal = showEditModal || showDeleteModal || showStockModal || showDeleteProductModal;

        if (hasOpenModal) {
            document.body.style.overflow = "hidden"; // ✅ Prevent scrolling
        } else {
            document.body.style.overflow = "auto"; // ✅ Allow scrolling when modal is closed
        }

        return () => {
            document.body.style.overflow = "auto"; // Cleanup when component unmounts
        };
    }, [showEditModal, showDeleteModal, showStockModal, showDeleteProductModal]);

    // ✅ Fetch product details from API
    useEffect(() => {
        if (!id) return;

        setIsLoaded(false);

        // ✅ Fetch product data
        api.get(`/api/product/${id}`)
            .then(response => {
                setProduct(response.data);
                console.log("Product", response.data)
                return api.get(`/api/stock?product_id=${id}`); // ✅ Fetch stock separately
            })
            .then(stockResponse => {
                setStocks(stockResponse.data);
                console.log("Stocks:", stockResponse.data); // 🔍 Debug Stocks
                setIsLoaded(true);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setError("Error loading product data");
                setIsLoaded(true);
            });
    }, [id]);

    // ✅ Move this function ABOVE its usage
    const formatDate = (date) => {
        if (!date) return 'N/A';

        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short', // ✅ "Feb", "Mar", "Apr", etc.
            year: 'numeric',
        }).toUpperCase(); // ✅ Convert "Feb" -> "FEB"
    };

    // Extract Cloudinary Public ID from a URL
    const extractPublicId = (url) => {
        if (!url) return null;
        const parts = url.split('/');
        const filenameWithExt = parts.pop(); // Get filename with extension
        const lastDotIndex = filenameWithExt.lastIndexOf(".");
        // const filename = filenameWithExt.split('.')[-1]; // Remove extension
        const filename = lastDotIndex !== -1 ? filenameWithExt.slice(0, lastDotIndex) : filenameWithExt;
        const isPDForDocx = filenameWithExt.endsWith('.pdf') || filenameWithExt.endsWith('.docx') || filenameWithExt.endsWith('.doc');

        // ✅ For images, remove extensions in public_id
        // ✅ For PDFs/DOCs, keep the extension
        return isPDForDocx
            ? `${parts.pop()}/${filenameWithExt}` // PDFs & DOCX keep the extension
            : `${parts.pop()}/${filename}`;
    };

    // ✅ Handle file selection for stock add/edit modal
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];

        for (const file of files) {
            console.log("Original File:", file);

            if (!file.name.includes(".")) {
                console.warn("❌ File missing extension. Setting default name.");
                Object.defineProperty(file, 'name', { value: `image_${Date.now()}.png` });
            }

            validFiles.push(file);
        }

        setSelectedFiles(validFiles);
        const uploadedUrls = await uploadFilesToCloudinary(validFiles);

        // ✅ Add uploaded images to state
        setStockTransaction((prev) => ({
            ...prev,
            attachments: [...prev.attachments, ...uploadedUrls],
        }));

        console.log("🖼️ Uploaded File URLs:", uploadedUrls);
    };

    // ✅ Upload images to Cloudinary before submitting the stock transaction
    const uploadFilesToCloudinary = async (files) => {
        setIsUploading(true);
        let uploadedUrls = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            // 🔹 Ensure the file has a proper name and extension
            const fileName = file.name || `image_${Date.now()}.png`;

            try {
                const res = await api.post('/api/upload-attachments', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: {
                        public_id: `stock_attachments/${fileName.split('.')[0]}`,  // Ensure a valid filename
                        format: fileName.split('.').pop() || 'png',  // Ensure the format is correct
                    },
                    timeout: 120000, // Increase timeout to prevent failure
                });

                if (res.status === 201 && Array.isArray(res.data.urls)) {
                    console.log("✅ Upload successful:", res.data);
                    uploadedUrls.push(...res.data.urls);
                } else {
                    console.error('❌ Upload failed:', res.data.message);
                }
            } catch (error) {
                console.error('🚨 Error uploading file:', error);
            }
        }

        setIsUploading(false);
        return uploadedUrls;
    };

    // ✅ Now it can be used below
    const formattedStockData = product?.stock_data?.map(transaction => ({
        ...transaction,
        formattedDate: formatDate(transaction.date), // ✅ Now it works fine!
    })) || [];

    const handleDeleteProductClick = () => {
        setShowDeleteProductModal(true);
        setAdminPassword("");
        setPasswordError("");
    };

    // ✅ Store original attachments before editing
    const handleEditStockClick = (stock) => {
        setEditingStock({ ...stock });
        setShowEditModal(true);
        setIsEditing(true);
        setSelectedFiles(stock.attachments || []); // ✅ Load existing attachments
        setNewAttachments([]); // ✅ Clear any previously added attachments
        setOriginalAttachments([...stock.attachments]); // ✅ Store original attachments for comparison
    };

    // ✅ Handle File Upload in Edit Modal
    const handleEditFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const uploadedUrls = await uploadFilesToCloudinary(files);

        setNewAttachments((prev) => [...prev, ...uploadedUrls]); // ✅ Add to new attachments
    };

    // ✅ Handle Input Change in Edit Stock Modal
    const handleStockEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingStock((prev) => ({
            ...prev,
            [name]: name === "date" ? new Date(value).toISOString() : value, // Convert date to ISO format
        }));
    };

    // ✅ Handle Save Changes for Stock
    const handleSaveStockChanges = async () => {
        console.log("📢 Editing Stock:", editingStock); // ✅ Debugging

        if (!editingStock || !editingStock._id) {
            console.error("❌ No stock ID to update.");
            return;
        }

        // ✅ Ensure unit cost is not empty
        if (!editingStock.unit_cost || isNaN(editingStock.unit_cost)) {
            alert("Unit cost is required and must be a valid number.");
            return;
        }

        // ✅ Merge existing and new attachments
        const updatedAttachments = [...(editingStock.attachments || []), ...newAttachments];
        console.log("📢 Saving Attachments:", updatedAttachments);

        try {
            const response = await api.put(`/api/stock/${editingStock._id}`, {
                quantity: editingStock.quantity,
                unit_cost: editingStock.unit_cost,
                date: editingStock.date,
                description: editingStock.description,
                attachments: updatedAttachments, // ✅ Send merged attachments list
            });

            if (response.status === 200) {
                console.log("✅ Stock Updated:", response.data);

                // ✅ Update stock list in state
                setStocks((prevStocks) =>
                    prevStocks.map((stock) =>
                        stock._id === editingStock._id ? response.data.stock : stock
                    )
                );

                // ✅ Update product stock quantity if needed
                if (response.data.product && response.data.product.quantity !== undefined) {
                    setProduct((prev) => ({
                        ...prev,
                        quantity: response.data.product.quantity,
                    }));
                }

                // ✅ Reset modal state
                setShowEditModal(false);
                setNewAttachments([]);
                setEditingStock(null);
                setIsEditing(false);
            } else {
                console.error("❌ Error updating stock:", response.data.message);
            }
        } catch (error) {
            console.error("🚨 Error updating stock:", error);
        }
    };

    // ✅ Handle Delete Stock Click
    const handleDeleteStockClick = (stockId) => {
        setStockToDelete(stockId);
        setShowDeleteModal(true);
    };

    // ✅ Remove Attachment from Cloudinary & State
    const removeAttachment = async (publicId, isEditing = false) => {
        console.log("🗑️ Deleting Attachment:", publicId);

        try {
            // ✅ Delete from Cloudinary
            await api.delete(`/api/delete-attachment?public_id=${publicId}`);
            console.log("✅ Attachment Deleted from Cloudinary");

            if (isEditing) {
                setEditingStock((prev) => {
                    if (!prev) return prev; // ✅ Ensure `prev` is not null

                    return {
                        ...prev,
                        attachments: prev.attachments ? prev.attachments.filter((url) => !url.includes(publicId)) : [],
                    };
                });

                // ✅ Remove from `newAttachments` state
                setNewAttachments((prev) => prev.filter((url) => !url.includes(publicId)));
            } else {
                // ✅ Remove from stock transaction UI state
                setStockTransaction((prev) => ({
                    ...prev,
                    attachments: prev.attachments ? prev.attachments.filter((url) => !url.includes(publicId)) : [],
                }));
            }

            console.log("✅ Updated UI state after removing attachment.");
        } catch (error) {
            console.error("🚨 Error deleting attachment:", error);
        }
    };

    // ✅ Handle Confirm Delete Stock
    const handleConfirmDeleteStock = async () => {
        console.log("🚀 Deleting Stock ID:", stockToDelete); // Ensure stock ID is valid

        if (!stockToDelete) {
            console.error("❌ No stock ID to delete.");
            return;
        }

        const stockItem = stocks.find(stock => stock._id === stockToDelete);
        if (!stockItem) {
            console.error("❌ Stock item not found.");
            return;
        }

        // ✅ Extract Cloudinary public IDs from URLs
        const publicIds = stockItem.attachments.map(url => {
            const parts = url.split('/');
            const filenameWithExt = parts.pop(); // Get filename with extension
            const lastDotIndex = filenameWithExt.lastIndexOf(".");
            // const filename = filenameWithExt.split('.')[-1]; // Remove extension
            const filename = lastDotIndex !== -1 ? filenameWithExt.slice(0, lastDotIndex) : filenameWithExt;
            const isPDForDocx = filenameWithExt.endsWith('.pdf') || filenameWithExt.endsWith('.docx') || filenameWithExt.endsWith('.doc');

            // ✅ For images, remove extensions in public_id
            // ✅ For PDFs/DOCs, keep the extension
            return isPDForDocx
                ? `${parts.pop()}/${filenameWithExt}` // PDFs & DOCX keep the extension
                : `${parts.pop()}/${filename}`; // Images remove the extension
        });

        console.log("🗑️ Cloudinary Public IDs to Delete:", publicIds);

        try {
            // ✅ Delete images from Cloudinary (calling API for each image)
            await Promise.all(publicIds.map(async (publicId) => {
                await api.delete(`/api/delete-attachment?public_id=${publicId}`);
            }));

            console.log("✅ Cloudinary images deleted successfully.");

            // ✅ Delete the stock entry from the database
            api.delete(`/api/stock/${stockToDelete}`)
                .then(response => {
                    console.log("✅ Stock Deleted:", response.data);

                    setStocks(prevStocks => prevStocks.filter(stock => stock._id !== stockToDelete));
                    setProduct(prev => ({
                        ...prev,
                        quantity: response.data.product.quantity
                    }));
                    setShowDeleteModal(false);
                })
                .catch(error => {
                    console.error("🚨 Error deleting stock:", error.response?.data || error.message);
                });
        } catch (error) {
            console.error("🚨 Error deleting stock or images:", error);
        }
    };

    // ✅ Handle Confirm Delete Stock
    const handleConfirmDeleteProduct = async () => {
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

            // ✅ If admin verification is successful, delete the product
            await api.delete(`/api/product/${id}`);

            // ✅ Remove deleted product from UI
            router.back();
            setShowDeleteProductModal(false);
            setAdminPassword("");

        } catch (error) {
            console.log("Error verifying admin credentials or deleting product:", error);
            setPasswordError("Error verifying credentials.");
        } finally {
            setIsDeleting(false);
        }
    };

    // ✅ Handle Stock In/Out Click
    const handleStockModalOpen = (type) => {
        setStockType(type); // ✅ Set Stock Type
        setShowStockModal(true);
        setStockTransaction({ quantity: '', description: '', attachments: [] });
        setSelectedFiles([]);
    };

    // ✅ Handle Stock Modal Close - Remove Unsaved Attachments
    const handleStockModalClose = async () => {
        if (stockTransaction.attachments.length > 0) {
            console.log("🛑 Removing all uploaded attachments before closing modal...");

            for (const url of stockTransaction.attachments) {
                const publicId = extractPublicId(url);
                if (publicId) {
                    await removeAttachment(publicId);
                }
            }
        }

        setShowStockModal(false);
        setStockTransaction({ quantity: '', description: '', attachments: [] });
        setSelectedFiles([]);
    };

    // ✅ Handle Input Change in Stock Modal
    const handleStockInputChange = (e) => {
        const { name, value } = e.target;
        setStockTransaction((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ✅ Prevent closing if attachments have changed
    const handleEditModalClose = () => {
        // ✅ Check if attachments have changed
        const hasAttachmentsChanged = JSON.stringify(originalAttachments) !== JSON.stringify(editingStock?.attachments);

        if (hasAttachmentsChanged || newAttachments.length > 0) {
            if (!confirm("You have unsaved changes. Do you want to save before closing?")) {
                return;
            }

            // ✅ Save changes before closing
            handleSaveStockChanges();
        }

        setShowEditModal(false);
        setEditingStock(null);
        setNewAttachments([]);
        setIsEditing(false);
    };

    // ✅ Handle Add Stock Transaction
    const handleAddStockTransaction = async () => {
        if (!stockTransaction.quantity) {
            alert("Please enter quantity.");
            return;
        }

        console.log("🚀 Adding Stock Transaction:", stockTransaction);

        try {
            const stockData = {
                product_id: id,
                stock_type: stockType,
                quantity: Number(stockTransaction.quantity), // ✅ Ensure it's a number
                unit_cost: product.unit_cost, // ✅ Add unit cost
                description: stockTransaction.description,
                attachments: stockTransaction.attachments, // ✅ Correctly send image URLs
            };

            console.log("📤 Sending Stock Data:", stockData);

            const response = await api.post(`/api/stock`, stockData);

            if (response.status === 201) {
                console.log("✅ Stock Added Successfully:", response.data);
                setStocks(prevStocks => [response.data.stock, ...prevStocks]); // ✅ Add new stock

                if (response.data.product && response.data.product.quantity !== undefined) {
                    setProduct(prev => ({
                        ...prev,
                        quantity: response.data.product.quantity, // ✅ Update product quantity
                    }));
                }

                setShowStockModal(false);
            } else {
                console.error("❌ Error adding stock:", response.data.message);
            }
        } catch (error) {
            console.error("🚨 Error adding stock transaction:", error);
        }
    };

    // ✅ Loading State
    if (!isLoaded || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <h1 className="text-2xl text-gray-500">Loading...</h1>
            </div>
        );
    }

    // ✅ Error State
    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <h1 className="text-2xl text-gray-500">{error || "Product not found."}</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Nav />

            {product ?
                <div className="container mx-auto p-6">
                    <button onClick={() => router.back()} className='text-xl text-gray-600 flex gap-2 items-center mb-6'>
                        <FaChevronCircleLeft />Back
                    </button>
                    <div className="flex gap-8 relative">
                        <button onClick={() => handleDeleteProductClick()} className="bg-red-500 absolute flex items-center right-0 top-0 px-3 py-2 rounded-lg text-white">
                            <FaTrash className='mr-3' /><span>Delete Product</span>
                        </button>
                        <Image
                            src={product.image_path || '/images/placeholder.png'}
                            alt={product.model}
                            width={200}
                            height={200}
                            className="rounded-lg"
                            priority // Ensures it loads fast
                            onError={(e) => e.target.src = '/images/placeholder.png'}
                        />
                        <div className='flex flex-col w-2/3'>
                            <h1 className="text-3xl font-bold text-gray-800">{product.model}</h1>
                            <div className='grid grid-cols-2'>
                                <div>
                                    <p className="text-lg text-gray-600 mt-2"><strong>Category:</strong> {product.category_id?.category_name}</p>
                                    <p className="text-lg text-gray-600 mt-2"><strong>Supplier:</strong> {product.supplier}</p>
                                    <p className="text-lg text-gray-600 mt-2"><strong>Type:</strong> {product.type}</p>
                                    <p className="text-lg text-gray-600 mt-2"><strong>Deflection:</strong> {product.deflection}</p>
                                </div>
                                <div>
                                    <p className="text-lg text-gray-600 mt-2"><strong>Current Stock:</strong> {product.quantity.toLocaleString()}</p>
                                    <p className="text-lg text-gray-600 mt-2"><strong>Unit Cost:</strong> {product.unit_cost ? product.unit_cost.toLocaleString() : 0}</p>
                                    <p className="text-lg text-gray-600 mt-2"><strong>Total Cost:</strong> {product.unit_cost && product.quantity ? `${(product.unit_cost * product.quantity).toLocaleString()}` : 0}</p>
                                    <p className="text-lg text-gray-600 mt-2"><strong>Comments:</strong> {product.comments || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className='absolute right-0 bottom-0 flex gap-4'>
                            <button className="bg-blue-400 flex items-center px-3 py-2 rounded-lg text-white hover:bg-blue-500" onClick={() => handleStockModalOpen("Stock In")}>
                                <FaPlus className='mr-3' /><span>Stock In</span>
                            </button>
                            <button className="bg-blue-400 flex items-center px-3 py-2 rounded-lg text-white hover:bg-blue-500" onClick={() => handleStockModalOpen("Stock Out")}>
                                <FaMinus className='mr-3' /><span>Stock Out</span>
                            </button>
                        </div>

                    </div>

                    {/* ✅ Stock Data Table with Actions */}
                    <div className="overflow-x-auto mt-4">
                        <table className="table-auto w-full text-left border-collapse border border-gray-200">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="border border-gray-200 px-4 py-2">Date</th>
                                    <th className="border border-gray-200 px-4 py-2">Type</th>
                                    <th className="border border-gray-200 px-4 py-2">Quantity</th>
                                    <th className="border border-gray-200 px-4 py-2">Unit Cost</th>
                                    <th className="border border-gray-200 px-4 py-2">Description</th>
                                    <th className="border border-gray-200 px-4 py-2">Attachments</th>
                                    <th className="border border-gray-200 px-4 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.length > 0 ? (
                                    stocks.map((stock) => (
                                        <tr key={stock._id} className="hover:bg-gray-50">
                                            <td className="border border-gray-200 px-4 py-2 text-gray-700">
                                                {formatDate(stock.date)}
                                            </td>
                                            <td className={`border border-gray-200 px-4 py-2 font-semibold ${stock.stock_type === "Stock In" ? 'text-green-600' : 'text-red-600'}`}>
                                                {stock.stock_type}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-gray-700">
                                                {`${stock.stock_type === "Stock In" ? "+" : "-"}${stock.quantity}`}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-gray-700">
                                                {stock.unit_cost ? `${stock.unit_cost}` : "-"} {/* ✅ NEW FIELD */}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-gray-700 min-w-64 whitespace-normal">
                                                {stock.description || "--"}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2">
                                                {stock.attachments?.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {stock.attachments.map((url, index) => {
                                                            // Extract filename with extension
                                                            const parts = url.split("/");
                                                            const filenameWithExt = parts[parts.length - 1];

                                                            // Get file extension
                                                            const extension = filenameWithExt.split(".").pop().toLowerCase();

                                                            // Determine file icon based on extension
                                                            let FileIcon = FaFileAlt; // Default icon
                                                            if (extension === "pdf") FileIcon = FaFilePdf;
                                                            else if (["doc", "docx"].includes(extension)) FileIcon = FaFileWord;
                                                            else if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) FileIcon = FaFileImage;

                                                            return (
                                                                <a
                                                                    key={index}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 hover:underline flex items-center gap-2 break-all text-sm"
                                                                >
                                                                    <FileIcon className="text-lg" /> {filenameWithExt}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span>No Attachments</span>
                                                )}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-center">
                                                <button onClick={() => handleEditStockClick(stock)} className="bg-blue-400 px-3 py-1 rounded text-white mr-2">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDeleteStockClick(stock._id)} className="bg-red-500 px-3 py-1 rounded text-white">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="border border-gray-200 px-4 py-4 text-center text-gray-600">
                                            No stock data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                : (
                    <div className="min-h-screen flex items-center justify-center">
                        <h1 className="text-2xl text-gray-500">Loading...</h1>
                    </div>
                )}
            {/* ✅ Stock In/Out Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-gray-600 relative">
                        <h2 className="text-xl font-bold mb-4 text-center text-blue-400">{stockType}</h2>
                        <button className="absolute top-2 right-2 text-gray-600" onClick={handleStockModalClose}>X</button>

                        {/* ✅ Quantity (Required) */}
                        <label className="block text-gray-700">Quantity <span className="text-red-500">*</span></label>
                        <input type="number" name="quantity" placeholder="Quantity" className="w-full mb-2 border p-2"
                            onChange={handleStockInputChange} value={stockTransaction.quantity} required />

                        {/* ✅ Description */}
                        <label className="block text-gray-700">Description</label>
                        <textarea name="description" placeholder="Description" className="w-full mb-2 border p-2"
                            onChange={handleStockInputChange} value={stockTransaction.description}></textarea>

                        {/* ✅ File Upload */}
                        <label className="block text-gray-700 font-semibold">Attachments</label>
                        <input type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
                            onChange={handleFileChange} className="w-full mb-2 border p-2" />

                        {/* ✅ Show Uploaded Files */}
                        {stockTransaction.attachments.length > 0 && (
                            <div className="mt-2">
                                {stockTransaction.attachments.map((url, index) => (
                                    <div key={index} className="flex items-center justify-between gap-2 border p-2">
                                        <a href={url} target="_blank" className="text-blue-500 truncate text-xs hover:underline">{url.split('/').pop()}</a>
                                        <button onClick={() => removeAttachment(extractPublicId(url))} className="text-red-500 w-4 h-4 flex items-center justify-center font-bold">x</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ✅ Submit Button */}
                        <button onClick={handleAddStockTransaction}
                            className={`bg-blue-400 px-4 py-2 mt-4 text-white rounded-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Submit'}
                        </button>
                    </div>
                </div>
            )}


            {/* ✅ Edit Stock Modal */}
            {showEditModal && editingStock && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-gray-600 relative">
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Edit Stock</h2>
                        <button className="absolute top-2 right-2 text-gray-600" onClick={handleEditModalClose}>X</button>

                        {/* ✅ Quantity Input */}
                        <label className="block text-gray-600 text-base mb-1">Quantity<span className="text-red-500 ml-1">*</span></label>
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Quantity"
                            className="w-full mb-3 border p-2"
                            onChange={handleStockEditInputChange}
                            value={editingStock.quantity}
                        />

                        {/* ✅ Unit Cost (Read-Only) */}
                        <label className="block text-gray-600 text-sm mb-1">Unit Cost:</label>
                        <input
                            type="text"
                            name="unit_cost"
                            className="w-full mb-3 border p-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                            onChange={handleStockEditInputChange}
                            value={editingStock.unit_cost}
                        />

                        {/* ✅ Date Input */}
                        <label className="block text-gray-600 text-base mb-1">Date</label>
                        <input
                            type="date"
                            name="date"
                            className="w-full mb-3 border p-2"
                            onChange={handleStockEditInputChange}
                            value={new Date(editingStock.date).toISOString().split('T')[0]}
                        />

                        {/* ✅ Description Input */}
                        <label className="block text-gray-600 text-base mb-1">Description</label>
                        <textarea
                            name="description"
                            placeholder="Description"
                            className="w-full mb-3 border p-2"
                            onChange={handleStockEditInputChange}
                            value={editingStock.description}
                        ></textarea>

                        {/* ✅ File Upload for New Attachments */}
                        <label className="block text-gray-700 font-semibold">Add New Attachments</label>
                        <input type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
                            onChange={handleEditFileChange} className="w-full mb-2 border p-2" />

                        {/* ✅ Show New Attachments */}
                        {newAttachments.length > 0 && (
                            <div className="mt-2">
                                {newAttachments.map((url, index) => (
                                    <div key={index} className="flex items-center justify-between gap-2 border p-2">
                                        <a href={url} target="_blank" className="text-blue-500 text-xs truncate hover:underline">{url.split('/').pop()}</a>
                                        <button onClick={() => removeAttachment(extractPublicId(url), true)} className="text-red-500 w-4 h-4 flex justify-center items-center font-bold">x</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ✅ Show Existing Attachments */}
                        {editingStock.attachments?.length > 0 && (
                            <div className="mt-2">
                                <label className="block text-gray-700 font-semibold">Existing Attachments:</label>
                                {editingStock.attachments.map((url, index) => (
                                    <div key={index} className="flex items-center justify-between gap-2 border p-2">
                                        <a href={url} target="_blank" className="text-blue-500 text-xs truncate hover:underline">{url.split('/').pop()}</a>
                                        <button onClick={() => removeAttachment(extractPublicId(url), true)} className="text-red-500 w-4 h-4 flex justify-center items-center font-bold">x</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ✅ Save Changes Button */}
                        <button onClick={handleSaveStockChanges} className="bg-blue-400 px-4 py-2 mt-4 text-white rounded-lg w-full">
                            Save Changes
                        </button>
                    </div>
                </div>
            )}


            {/* ✅ Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-gray-600 text-center relative">
                        <h2 className="text-xl font-bold mb-4 text-gray-600">Confirm Delete Transaction?</h2>
                        <button className="absolute top-2 right-2 text-gray-600" onClick={() => setShowDeleteModal(false)}>X</button>
                        <button onClick={handleConfirmDeleteStock} className="bg-red-500 px-4 py-2 text-white rounded-lg mr-2">
                            Yes, Delete
                        </button>
                        <button onClick={() => setShowDeleteModal(false)} className="bg-gray-400 px-4 py-2 text-white rounded-lg">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ✅ Delete Confirmation Modal */}
            {showDeleteProductModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-gray-600 text-center relative">
                        <h2 className="text-xl font-bold mb-4 text-red-500">Confirm Delete Product?</h2>
                        <p className="text-gray-700">
                            Are you sure you want to delete <b>{product.model}</b>?
                        </p>
                        <p className="text-gray-700 mt-2">
                            This will also delete <b>{stocks.length}</b> related stock transactions.
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
                                onClick={handleConfirmDeleteProduct}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>

                            <button
                                className="bg-gray-400 px-4 py-2 text-white rounded-lg"
                                onClick={() => setShowDeleteProductModal(false)}
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

export default ProductDetail;
