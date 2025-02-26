'use client';

import Image from "next/image";
import React, { useState } from "react";
import { FaPhoneAlt, FaBars, FaTimes } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";
import Link from 'next/link';
import { useRouter } from "next/navigation";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-white text-black shadow-md sticky top-0 z-50">
            <div className="flex mx-auto container items-center justify-between py-3 px-6">
                {/* Left Section: Logo */}
                <div className="flex items-center">
                    <Image
                        src="/images/farsight-logo.png"
                        alt="Farsight Logo"
                        width={250}
                        height={60}
                        className="mr-4"
                    />
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex space-x-4 relative">
                    <a href="#about" className="hover:text-blue-500 transition">
                        About Us
                    </a>
                    {/* Vibration Isolators Mega Menu */}
                    <div className="group relative">
                        <a href="#vibration-isolators" className="hover:text-blue-500 transition pb-8">
                            Vibration Isolators
                        </a>
                        <div className="absolute left-[-80px] top-full hidden group-hover:flex flex-col bg-white shadow-lg border mt-7 p-6 w-max">
                            <div className="flex flex-row flex-wrap">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold mb-1">Floor Mounted</h3>
                                    <ul>
                                        <li className="hover:text-blue-500">
                                            <a href="#floor-mounted">Open Spring Isolators – FS Series</a>
                                        </li>
                                        <li className="hover:text-blue-500">
                                            <a href="#ceiling-mounted">U-Channel Isolators – FSU Series</a>
                                        </li>
                                        <li className="hover:text-blue-500">
                                            <a href="#custom-solutions">Seismic Isolators – FLS</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Air Filters Mega Menu */}
                    <div className="group relative">
                        <a href="#air-filters" className="hover:text-blue-500 transition pb-8">
                            Air Filters
                        </a>
                        <div className="absolute left-0 top-full hidden group-hover:flex flex-col bg-white shadow-lg border mt-7 p-6 w-80">
                            <h3 className="text-lg font-bold mb-4">Air Filters</h3>
                            <ul>
                                <li className="mb-2 hover:text-blue-500">
                                    <a href="#bag-filters">Bag Filters</a>
                                </li>
                                <li className="mb-2 hover:text-blue-500">
                                    <a href="#carbon-filters">Carbon Filters</a>
                                </li>
                                <li className="hover:text-blue-500">
                                    <a href="#hepa-filters">HEPA Filters</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <a href="#projects" className="hover:text-blue-500 transition">
                        Projects
                    </a>
                    <a href="#clients" className="hover:text-blue-500 transition">
                        Clients
                    </a>
                    <a href="#certifications" className="hover:text-blue-500 transition">
                        Certifications
                    </a>
                    <a href="#get-quote" className="hover:text-blue-500 transition">
                        Get Quote
                    </a>
                </div>

                {/* Right Section: Icons */}
                <div className="hidden lg:flex items-center space-x-4">
                    <button className="text-blue-500 hover:text-blue-700">
                        <IoIosSearch size={24} />
                    </button>
                    <div className="text-sm text-gray-600">
                        <div className="flex text-blue-400 items-center gap-2">
                            <FaPhoneAlt size={14} /> <span className="text-black">+92-321-4433</span>
                        </div>
                        <div className="flex text-blue-400 items-center gap-1">
                            <MdEmail size={18} /> <span className="text-black">info@example.com</span>
                        </div>
                    </div>
                    <button onClick={() => router.push('/admin')} className="bg-blue-400 px-8 py-2 rounded-xl text-white hover:bg-blue-500">
                        LOGIN
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                    <button onClick={toggleMenu} className="text-black">
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="bg-white shadow-md lg:hidden">
                    <div className="flex flex-col space-y-4 p-4">
                        <a href="#about" className="hover:text-blue-500 transition">
                            About Us
                        </a>
                        <a href="#vibration-isolators" className="hover:text-blue-500 transition">
                            Vibration Isolators
                        </a>
                        <a href="#air-filters" className="hover:text-blue-500 transition">
                            Air Filters
                        </a>
                        <a href="#projects" className="hover:text-blue-500 transition">
                            Projects
                        </a>
                        <a href="#clients" className="hover:text-blue-500 transition">
                            Clients
                        </a>
                        <a href="#certifications" className="hover:text-blue-500 transition">
                            Certifications
                        </a>
                        <a href="#get-quote" className="hover:text-blue-500 transition">
                            Get Quote
                        </a>
                        <button className="bg-blue-400 px-8 py-2 rounded-xl text-white hover:bg-blue-500">
                            LOGIN
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
