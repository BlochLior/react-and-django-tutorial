import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { pollsApi } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const isCheckingRef = useRef(false);

    // Simple auth check function without useCallback to avoid dependency issues
    const checkAuthStatus = async () => {
        if (isCheckingRef.current) {
            return; // Prevent concurrent calls
        }
        
        isCheckingRef.current = true;
        try {
            const response = await pollsApi.getUserInfo();
            
            if (response.data && response.data.authenticated) {
                setUser(response.data);
            } else {
                setUser(null);
            }
            
            setLoading(false);
        } catch (error) {
            setUser(null);
            setLoading(false);
        } finally {
            isCheckingRef.current = false;
        }
    };

    // Initial auth check on mount only
    useEffect(() => {
        checkAuthStatus();
    }, []); // Only run on mount

    // Separate effect for refreshKey changes
    useEffect(() => {
        if (refreshKey > 0) {
            checkAuthStatus();
        }
    }, [refreshKey]); // Only depend on refreshKey

    const login = () => {
        // Redirect to Django OAuth URL - use localhost to match frontend domain
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        console.log('Redirecting to OAuth:', `${apiBaseUrl}/accounts/google/login/`);
        window.location.href = `${apiBaseUrl}/accounts/google/login/`;
    };

    const logout = async () => {
        try {
            await pollsApi.logout();
            setUser(null);
            const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
            window.location.href = `${apiBaseUrl}/accounts/logout/`;
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const refreshAuthStatus = () => {
        console.log('AuthContext: Manual refresh triggered');
        setRefreshKey(prev => prev + 1);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuthStatus, // Expose this function for manual refresh
        refreshAuthStatus, // Expose refresh function
        refreshKey, // Expose refresh key for components to listen to
        isAuthenticated: user?.authenticated || false,
        isAdmin: user?.is_admin || false,
        hasVoted: user?.has_voted || false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
