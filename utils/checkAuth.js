// utils/checkAuth.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// ✅ Check if the user is logged in, otherwise redirect to login
export const useAdminAuth = () => {
    const router = useRouter();

    useEffect(() => {
        const isAdminLoggedIn = JSON.parse(localStorage.getItem("User"));
        const token = isAdminLoggedIn?.token;
        // console.log(token)   
        // console.log(isAdminLoggedIn)

        if (!token) {
            console.warn("🚨 Unauthorized access! Redirecting to login...");
            router.push("/admin"); // ✅ Redirect to login page
        }
    }, []);
};
