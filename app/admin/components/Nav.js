import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa"; // Dropdown icon
import { useRouter } from "next/navigation";
import Image from "next/image";

const Nav = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("User"));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("User");
        router.push("/admin");
    };

    return (
        <nav className="bg-white text-black shadow-md sticky top-0 w-full z-50">
            <div className="flex items-center justify-between container mx-auto px-4 sm:px-6 py-2 sm:py-3">
                {/* Logo - Click to go to Categories */}
                <div className="flex items-center cursor-pointer" onClick={() => router.push("/admin/category")}>
                    <Image
                        src="/images/farsight-logo.png"
                        alt="Farsight Logo"
                        width={250}
                        height={60}
                        className="w-40 sm:w-52 md:w-64"
                    />
                </div>

                {/* User Menu */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 bg-white border border-gray-300 px-1 sm:px-6 py-1 sm:py-2 rounded-full cursor-pointer shadow-sm hover:bg-gray-100 transition-all text-xs sm:text-sm"
                        >
                            {/* ✅ User Initials - Always visible */}
                            <span className="bg-black text-white font-semibold flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm sm:text-base">
                                {user.name?.charAt(0).toUpperCase()}
                            </span>

                            {/* Name & Chevron (Hidden on Mobile) */}
                            <span className="hidden sm:flex items-center text-gray-700 text-xs sm:text-sm">
                                {user.name
                                    .split(" ") // Split name into words
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
                                    .join(" ")}
                                <FaChevronDown className="ml-2 text-xs sm:text-sm" />
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-xs sm:text-sm">
                                <button
                                    onClick={() => router.push("/admin/change-password")}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Change Password
                                </button>
                                {/* <button
                                    onClick={() => router.push("/admin/users")}
                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Users
                                </button> */}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Nav;
