import Image from 'next/image';
import React from 'react';
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 pt-12 pb-4">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-10 gap-4">
                {/* Logo and Description */}
                <div className='col-span-3'>
                    <div className="flex items-center mb-6">
                        <Image
                            src="/images/farsight-logo.png"
                            alt="Farsight Logo"
                            width={350}
                            height={60}
                            className="mr-4"
                        />
                    </div>
                    <p className="text-sm">
                        Manufacturer of Vibration Isolators with Certified PCSIR Tested
                        Springs supplying to more than 350+ Clients & recommended by Major
                        Consultants all across Pakistan.
                    </p>
                    <p
                        className="mt-4 text-4xl font-semibold text-transparent"
                        style={{
                            WebkitTextStroke: "2px #4691C5", // Outline color and thickness
                            WebkitTextFillColor: "transparent", // Makes the text inside transparent
                        }}
                    >
                        Since 2007
                    </p>
                </div>

                {/* Office Address */}
                <div className='col-span-3'>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Office Addresses</h3>
                        <p className="text-sm">
                            <strong>Head Office Address:</strong><br />
                            28/2 Phase V Main Khyban-e-badar DHA Karachi
                        </p>
                        <p className="text-sm mt-2">
                            <strong>Site Office - Far Sight:</strong><br />
                            3 - Avanti Terrace, Block-2 P.E.C.H.S Allama Iqbal Road, Karachi, Pakistan
                        </p>
                    </div>
                    <div className='mt-6'>
                        <h3 className="text-lg font-bold text-white mb-2">Email Addresses</h3>
                        <p className="text-sm">
                            info@farsight.com.pk
                        </p>
                        <p className="text-sm">
                            info@vibrationisolators.com.pk
                        </p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className='col-span-2'>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Contact Information</h3>
                        <p className="text-sm mt-2">
                            <strong>Phone Numbers:</strong><br />
                            +92 3222771511 - Sales<br />
                            +92 3222771511 - Technical<br />
                            +92 3332345787 - Technical
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mt-6">Websites</h3>
                        <p className="text-sm mt-2">
                            <a href='https://www.farsight.com.pk/' target='_blank' className='hover:text-blue-400'>https://www.farsight.com.pk/</a><br />
                            <a href="http://www.vibrationisolators.com.pk/" target='_blank' className='hover:text-blue-400'>http://www.vibrationisolators.com.pk/</a>
                        </p>
                    </div>
                </div>

                {/* Useful Links and Follow Us */}
                <div className='col-span-2'>
                    <h3 className="text-lg font-bold text-white mb-2">Useful Links</h3>
                    <ul className="text-sm space-y-1">
                        <li>
                            <a href="/" className="hover:text-white">About Us</a>
                        </li>
                        <li>
                            <a href="/projects" className="hover:text-white">Projects</a>
                        </li>
                        <li>
                            <a href="/blog" className="hover:text-white">Blog</a>
                        </li>
                        <li>
                            <a href="/contact" className="hover:text-white">Contact</a>
                        </li>
                    </ul>

                    <h3 className="text-lg font-bold text-white mt-6 mb-2">Follow Us</h3>
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                            <FaFacebook size={20} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                            <FaTwitter size={20} />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                            <FaYoutube size={20} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                            <FaLinkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-700 mt-8 pt-4 text-center">
                <p className="text-sm">&copy; 2023 FarSight. All rights reserved.</p>
            </div>
        </footer >
    );
};

export default Footer;
