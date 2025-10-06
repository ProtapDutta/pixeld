// frontend/src/context/AuthContext.jsx

import React, { createContext, useState } from 'react'; // 💡 FIX: useEffect removed
import api, { setAuthToken } from '../api/axios';

export const AuthContext = createContext(); 

// 1. Initialize Auth Data
const getInitialAuthData = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
        try {
            const user = JSON.parse(storedUser);
            setAuthToken(storedToken); // Set Axios header on load
            return { user, token: storedToken };
        } catch (e) {
            console.error("Failed to parse user data from storage.");
        }
    }
    localStorage.clear();
    return { user: null, token: null };
};

export const AuthProvider = ({ children }) => {
    
    const initialData = getInitialAuthData();

    const [user, setUser] = useState(initialData.user);
    const [token, setToken] = useState(initialData.token);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Save/Sync Auth Data
    const saveAuthData = (userData, jwtToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', jwtToken);
        setUser(userData);
        setToken(jwtToken);
        setAuthToken(jwtToken); // Update Axios header
    };

    // 3. Logout function
    const logout = () => {
        localStorage.clear();
        setAuthToken(null);
        setUser(null);
        setToken(null);
        // Force refresh to clear state and redirect
        window.location.href = '/login'; 
    };
    
    // 4. Login API
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            
            // 🛑 CRITICAL FIX: Correctly access the data structure { user, token }
            const { user: userData, token: jwtToken } = res.data;
            
            saveAuthData(userData, jwtToken);
            setLoading(false);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Login failed.";
            setError(errorMessage);
            setLoading(false);
            return { success: false, message: errorMessage };
        }
    };

    // 5. Register API
    const register = async (userName, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/register', { userName, email, password });
            
            // 🛑 CRITICAL FIX: Correctly access the data structure { user, token }
            const { user: userData, token: jwtToken } = res.data;

            saveAuthData(userData, jwtToken);
            setLoading(false);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Registration failed.";
            setError(errorMessage);
            setLoading(false);
            return { success: false, message: errorMessage };
        }
    };

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token, 
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};