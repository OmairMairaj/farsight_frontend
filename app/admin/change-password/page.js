'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';
import Nav from '../components/Nav';

const ChangePassword = () => {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('All fields are required.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem('User'))?.token;
            const response = await api.put('/api/user/change-password', {
                currentPassword,
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // ✅ Include token in headers
                }
            });

            if (response.status === 200) {
                setSuccess('Password updated successfully.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');

                localStorage.removeItem('User'); // ✅ Remove user data from localStorage

                // Redirect to admin dashboard after 2 seconds
                setTimeout(() => router.push('/admin'), 2000);
            }
        } catch (error) {
            console.log('🚨 Error changing password:', error);
            setError(error.response?.data?.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Nav />
            <div className="container mx-auto flex items-center justify-center h-[70vh]">
                <div className='flex flex-col p-8 items-center justify-between mb-6 w-1/3 min-w-72 bg-white shadow-md rounded-xl mt-10'>
                    <h2 className="text-2xl text-blue-400 font-semibold text-center mb-4">Change Password</h2>




                    <form onSubmit={handlePasswordChange} className="w-full flex flex-col text-black">
                        <label className="block text-gray-700 font-semibold mb-1">Current Password</label>
                        <input
                            type="password"
                            placeholder="Enter current password"
                            className="w-full border p-2 rounded mb-3"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />

                        <label className="block text-gray-700 font-semibold mb-1">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            className="w-full border p-2 rounded mb-3"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <label className="block text-gray-700 font-semibold mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full border p-2 rounded mb-4"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />

                        {error && <p className="text-red-500 text-center">{error}</p>}
                        {success && <p className="text-green-500 text-center">{success}</p>}

                        <button
                            type="submit"
                            className={`w-full mt-4 bg-blue-500 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
