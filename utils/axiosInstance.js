import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // ✅ Ensure credentials are included
});

export default api;
