'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import api from '@/utils/axiosInstance';

const Admin = () => {
    const router = useRouter();


    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Handle Login Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setLoading(true);

        // ✅ Validate Inputs
        if (!email || !password) {
            setError("Both email and password are required.");
            setLoading(false);
            return;
        }

        // ✅ Validate Email Format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError("Invalid email format.");
            setLoading(false);
            return;
        }

        try {
            // ✅ Call API for login
            const res = await api.put("/api/user", { email, password });

            if (res.status === 200) {
                console.log("✅ Login Successful:", res.data);
                // ✅ Store user data in localStorage
                localStorage.setItem("User", JSON.stringify(res.data));

                // ✅ Redirect after saving token
                router.push("/admin/category");
            } else {
                setError("Invalid credentials.");
            }
        } catch (err) {
            console.log("🚨 Login Error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* <nav className="bg-white text-black shadow-md sticky top-0">
                <div className="flex mx-auto container items-center justify-between py-3 px-6">
                    <div className="flex items-center" onClick={() => router.push("/")}>
                        <img
                            src="/images/farsight-logo.png"
                            alt="Farsight Logo"
                            width={250}
                            height={60}
                            className="mr-4 w-64 h-16"
                        />
                    </div>
                </div>
            </nav> */}
            <nav className="bg-white text-black shadow-md sticky top-0 w-full p-4">
                <div className="flex mx-auto container items-center">
                    <Image
                        src="/images/farsight-logo.png"
                        alt="Farsight Logo"
                        width={200}
                        height={50}
                        className="w-48 sm:w-56 lg:w-64"
                    />
                </div>
            </nav>

            {/* ✅ Login Form */}
            <div className="flex justify-center text-black items-center h-[80vh] px-4">
                <div className="w-full max-w-md bg-white shadow-md p-6 rounded-lg border border-blue-400">
                    <h1 className="text-2xl font-bold text-center text-blue-400">LOGIN</h1>
                    <p className="text-gray-600 text-center mb-6">Access the admin panel</p>



                    <form className="w-full flex flex-col" onSubmit={handleSubmit}>
                        {/* ✅ Email Input */}
                        <label className="text-gray-700 text-sm mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            className="border border-gray-300 rounded p-2 mb-3 w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {/* ✅ Password Input */}
                        <label className="text-gray-700 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            className="border border-gray-300 rounded p-2 mb-3 w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {/* ✅ Error Message */}
                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                        {/* ✅ Login Button */}
                        <button
                            type="submit"
                            className={`bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 w-full ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={loading}
                            onClick={handleSubmit}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Admin;
