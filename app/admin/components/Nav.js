import React from 'react'

const Nav = () => {

    const handleLogout = () => {
        localStorage.removeItem("User");
        window.location.href = "/admin";
    }

    return (
        <nav className="bg-white text-black shadow-md sticky top-0">
            <div className="flex mx-auto container items-center justify-between py-3 px-6">
                <div className="flex items-center" onClick={() => window.location.href = "/admin/category"}>
                    <img src="/images/farsight-logo.png" alt="Farsight Logo" width={250} height={60} className="mr-4 w-64 h-16" />
                </div>
                <button onClick={handleLogout} className="bg-blue-400 px-8 py-2 rounded-xl text-white hover:bg-blue-500">
                    LOGOUT
                </button>
            </div>
        </nav>
    )
}

export default Nav