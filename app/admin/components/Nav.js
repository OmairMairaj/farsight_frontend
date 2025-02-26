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
        <nav className="bg-white text-black shadow-md sticky top-0 w-full">
            <div className="flex mx-auto container items-center justify-between py-3 px-6">
                {/* Logo - Click to go to Categories */}
                <div className="flex items-center cursor-pointer" onClick={() => router.push("/admin/category")}>
                    {/* <div className="flex items-center"> */}
                    <Image
                        src="/images/farsight-logo.png"
                        alt="Farsight Logo"
                        width={250}
                        height={60}
                        className="mr-4 w-48 sm:w-64 h-12 sm:h-16"
                    />
                    {/* </div> */}
                </div>

                {/* User Menu */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center justify-between gap-2 bg-white border border-gray-300 px-1 sm:px-8 py-1 sm:py-2 rounded-full cursor-pointer shadow-sm hover:bg-gray-100 transition-all"
                        >
                            {/* User Initials - Shown on all screens */}
                            <span className="bg-black text-white font-semibold flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm">
                                {user.name?.charAt(0).toUpperCase()}
                            </span>

                            {/* Name & Chevron (Hidden on Mobile) */}
                            <span className="hidden sm:flex items-center text-gray-700">
                                {user.name
                                    .split(" ") // Split name into words
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
                                    .join(" ")}
                                <FaChevronDown className="ml-2 text-xs" />
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
