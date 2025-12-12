import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

// Create the context (a global state container)
const AuthContext = createContext();

// Custom hook to allow any component to easily use this context
export const useAuth = () => useContext(AuthContext);

// The Provider component wraps our entire App
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores the current logged-in user
    const [loading, setLoading] = useState(true); // Don't render the app until we check for a token

    // On App Start: Check if we already have a saved token/user in the browser
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                setUser(JSON.parse(storedUser)); // Restore user session
            }
            setLoading(false); // Done checking
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await api.post('/auth/register', { username, email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
