import Image from "next/image";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaUserAlt, FaBuilding, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";

export default function Home() {
    return (
        <div>
            {/* Header */}
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="flex flex-col items-center justify-center h-[95vh] bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                    <h1 className="text-5xl font-bold">Welcome to FarSight</h1>
                    <p className="mt-4 text-xl">
                        Your trusted partner for vibration isolators and air filters
                    </p>
                    <button className="mt-6 px-6 py-3 bg-white text-blue-700 rounded-lg shadow-lg hover:bg-gray-200 transition">
                        Explore Products
                    </button>
                </section>

                {/* Product Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Product Grid */}
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {/* Product Card */}
                            <div className="group relative overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="relative w-full h-48">
                                    {/* Default Image */}
                                    <Image
                                        src="/images/pic1.jpeg"
                                        alt="Wire Rope Isolators"
                                        className="rounded-t-lg object-cover transition-opacity duration-300 group-hover:opacity-0"
                                        fill
                                    />
                                    {/* Hover Image */}
                                    <Image
                                        src="/images/hover-pic1.jpeg"
                                        alt="Wire Rope Isolators Hover"
                                        className="rounded-t-lg object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                        fill
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Wire Rope Isolators</h3>
                                    <p className="text-sm text-gray-600">5 Products</p>
                                </div>
                                <a
                                    href="#"
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100"
                                >
                                    View Details
                                </a>
                            </div>

                            {/* Repeat for other cards */}
                            <div className="group relative overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="relative w-full h-48">
                                    {/* Default Image */}
                                    <Image
                                        src="/images/pic2.jpeg"
                                        alt="Spring Mount Vibration Isolators"
                                        className="rounded-t-lg object-cover transition-opacity duration-300 group-hover:opacity-0"
                                        fill
                                    />
                                    {/* Hover Image */}
                                    <Image
                                        src="/images/hover-pic2.jpeg"
                                        alt="Spring Mount Vibration Isolators Hover"
                                        className="rounded-t-lg object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                        fill
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Spring Mount Vibration Isolators
                                    </h3>
                                    <p className="text-sm text-gray-600">14 Products</p>
                                </div>
                                <a
                                    href="#"
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100"
                                >
                                    View Details
                                </a>
                            </div>
                            <div className="group relative overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="relative w-full h-48">
                                    {/* Default Image */}
                                    <Image
                                        src="/images/pic1.jpeg"
                                        alt="Wire Rope Isolators"
                                        className="rounded-t-lg object-cover transition-opacity duration-300 group-hover:opacity-0"
                                        fill
                                    />
                                    {/* Hover Image */}
                                    <Image
                                        src="/images/hover-pic1.jpeg"
                                        alt="Wire Rope Isolators Hover"
                                        className="rounded-t-lg object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                        fill
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Wire Rope Isolators</h3>
                                    <p className="text-sm text-gray-600">5 Products</p>
                                </div>
                                <a
                                    href="#"
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100"
                                >
                                    View Details
                                </a>
                            </div>

                            {/* Repeat for other cards */}
                            <div className="group relative overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="relative w-full h-48">
                                    {/* Default Image */}
                                    <Image
                                        src="/images/pic2.jpeg"
                                        alt="Spring Mount Vibration Isolators"
                                        className="rounded-t-lg object-cover transition-opacity duration-300 group-hover:opacity-0"
                                        fill
                                    />
                                    {/* Hover Image */}
                                    <Image
                                        src="/images/hover-pic2.jpeg"
                                        alt="Spring Mount Vibration Isolators Hover"
                                        className="rounded-t-lg object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                        fill
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Spring Mount Vibration Isolators
                                    </h3>
                                    <p className="text-sm text-gray-600">14 Products</p>
                                </div>
                                <a
                                    href="#"
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100"
                                >
                                    View Details
                                </a>
                            </div>
                            <div className="group relative overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="relative w-full h-48">
                                    {/* Default Image */}
                                    <Image
                                        src="/images/pic1.jpeg"
                                        alt="Wire Rope Isolators"
                                        className="rounded-t-lg object-cover transition-opacity duration-300 group-hover:opacity-0"
                                        fill
                                    />
                                    {/* Hover Image */}
                                    <Image
                                        src="/images/hover-pic1.jpeg"
                                        alt="Wire Rope Isolators Hover"
                                        className="rounded-t-lg object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                        fill
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Wire Rope Isolators</h3>
                                    <p className="text-sm text-gray-600">5 Products</p>
                                </div>
                                <a
                                    href="#"
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100"
                                >
                                    View Details
                                </a>
                            </div>

                            {/* Repeat for other cards */}
                            <div className="group relative overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="relative w-full h-48">
                                    {/* Default Image */}
                                    <Image
                                        src="/images/pic2.jpeg"
                                        alt="Spring Mount Vibration Isolators"
                                        className="rounded-t-lg object-cover transition-opacity duration-300 group-hover:opacity-0"
                                        fill
                                    />
                                    {/* Hover Image */}
                                    <Image
                                        src="/images/hover-pic2.jpeg"
                                        alt="Spring Mount Vibration Isolators Hover"
                                        className="rounded-t-lg object-cover absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                        fill
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Spring Mount Vibration Isolators
                                    </h3>
                                    <p className="text-sm text-gray-600">14 Products</p>
                                </div>
                                <a
                                    href="#"
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100"
                                >
                                    View Details
                                </a>
                            </div>
                        </div>


                        {/* Project Information Sidebar */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Project Information
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Completely synergize resource taxing relationships via premier.
                            </p>
                            <ul className="space-y-4">
                                {/* Client Name */}
                                <li className="flex items-center">
                                    <div className="bg-gray-100 p-2 rounded-full text-blue-500 mr-4">
                                        <FaUserAlt size={20} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">CLIENT NAME</span>
                                        <p className="text-lg font-medium text-gray-800">John Henry</p>
                                    </div>
                                </li>

                                {/* Category */}
                                <li className="flex items-center">
                                    <div className="bg-gray-100 p-2 rounded-full text-blue-500 mr-4">
                                        <FaBuilding size={20} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">CATEGORY</span>
                                        <p className="text-lg font-medium text-gray-800">Metallurgy</p>
                                    </div>
                                </li>

                                {/* Start Time */}
                                <li className="flex items-center">
                                    <div className="bg-gray-100 p-2 rounded-full text-blue-500 mr-4">
                                        <FaCalendarAlt size={20} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">START TIME</span>
                                        <p className="text-lg font-medium text-gray-800">01 Jan, 2024</p>
                                    </div>
                                </li>

                                {/* End Time */}
                                <li className="flex items-center">
                                    <div className="bg-gray-100 p-2 rounded-full text-blue-500 mr-4">
                                        <FaCalendarAlt size={20} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">END TIME</span>
                                        <p className="text-lg font-medium text-gray-800">26 Apr, 2024</p>
                                    </div>
                                </li>

                                {/* Budget */}
                                <li className="flex items-center">
                                    <div className="bg-gray-100 p-2 rounded-full text-blue-500 mr-4">
                                        <FaDollarSign size={20} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">BUDGET</span>
                                        <p className="text-lg font-medium text-gray-800">$20,000</p>
                                    </div>
                                </li>

                                {/* Location */}
                                <li className="flex items-center">
                                    <div className="bg-gray-100 p-2 rounded-full text-blue-500 mr-4">
                                        <FaMapMarkerAlt size={20} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">LOCATION</span>
                                        <p className="text-lg font-medium text-gray-800">42 Mammoun Street, UK</p>
                                    </div>
                                </li>
                            </ul>
                        </div>


                    </div>
                </section>
                {/* Clientage Section */}
                <section className="py-16 bg-gray-100">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                            Our Clients
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center">
                            {/* Client Logos */}
                            <div className="w-56 h-56 bg-white rounded-lg shadow-md flex items-center justify-center">
                                <img
                                    src="https://www.pngitem.com/pimgs/m/529-5294086_transparent-random-logo-png-png-download.png"
                                    alt="Client 1"
                                    className="h-56 w-auto"
                                />
                            </div>
                            <div className="w-56 h-56 bg-white rounded-lg shadow-md flex items-center justify-center">
                                <img
                                    src="https://www.pngitem.com/pimgs/m/529-5294086_transparent-random-logo-png-png-download.png"
                                    alt="Client 2"
                                    className="h-56 w-auto"
                                />
                            </div>
                            <div className="w-56 h-56 bg-white rounded-lg shadow-md flex items-center justify-center">
                                <img
                                    src="https://www.pngitem.com/pimgs/m/529-5294086_transparent-random-logo-png-png-download.png"
                                    alt="Client 3"
                                    className="h-56 w-auto"
                                />
                            </div>
                            <div className="w-56 h-56 bg-white rounded-lg shadow-md flex items-center justify-center">
                                <img
                                    src="https://www.pngitem.com/pimgs/m/529-5294086_transparent-random-logo-png-png-download.png"
                                    alt="Client 4"
                                    className="h-56 w-auto"
                                />
                            </div>
                            <div className="w-56 h-56 bg-white rounded-lg shadow-md flex items-center justify-center">
                                <img
                                    src="https://www.pngitem.com/pimgs/m/529-5294086_transparent-random-logo-png-png-download.png"
                                    alt="Client 5"
                                    className="h-56 w-auto"
                                />
                            </div>
                            <div className="w-56 h-56 bg-white rounded-lg shadow-md flex items-center justify-center">
                                <img
                                    src="https://www.pngitem.com/pimgs/m/529-5294086_transparent-random-logo-png-png-download.png"
                                    alt="Client 6"
                                    className="h-56 w-auto"
                                />
                            </div>

                        </div>
                    </div>
                </section>

            </div>
            {/* Footer */}
            <Footer />
        </div>
    );
}
