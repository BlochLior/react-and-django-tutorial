import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for auth data

    const checkAuthStatus = useCallback(async () => {
        try {
            console.log('Checking authentication status...', 'refreshKey:', refreshKey);
            console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
            console.log('Making request to:', '/auth/user-info/');
            console.log('Current URL:', window.location.href);
            console.log('Document cookies:', document.cookie);
            
            const response = await pollsApi.getUserInfo();
            console.log('Full response object:', response);
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            console.log('Response data type:', typeof response.data);
            console.log('Response data keys:', response.data ? Object.keys(response.data) : 'No keys');
            
            if (response.data && response.data.authenticated) {
                console.log('User is authenticated, setting user data');
                setUser(response.data);
            } else {
                console.log('User is not authenticated or data is invalid');
                setUser(null);
            }
            
            setLoading(false);
        } catch (error) {
            console.log('Auth check failed:', error);
            console.log('Error details:', error.response ? error.response.data : error.message);
            setUser(null);
            setLoading(false);
        }
    }, [refreshKey]);

    useEffect(() => {
        checkAuthStatus();
        
        // Check if we're returning from OAuth (look for common OAuth parameters)
        const urlParams = new URLSearchParams(window.location.search);
        const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('error');
        
        if (hasOAuthParams) {
            console.log('Detected OAuth callback, re-checking auth status...');
            // Small delay to ensure backend has processed the OAuth
            setTimeout(() => {
                checkAuthStatus();
            }, 1000);
        }
        
        // Also check on page load if we're coming from OAuth redirect
        const isOAuthRedirect = window.location.href.includes('localhost:3000') && 
                               (window.location.href.includes('code=') || 
                                window.location.href.includes('state=') ||
                                document.referrer.includes('accounts.google.com'));
        
        if (isOAuthRedirect) {
            console.log('Detected OAuth redirect, checking auth status...');
            setTimeout(() => {
                checkAuthStatus();
            }, 500);
        }
    }, [checkAuthStatus]);

    // Check auth status when the page becomes visible (after OAuth redirect)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkAuthStatus();
            }
        };

        const handleFocus = () => {
            checkAuthStatus();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [checkAuthStatus]);

    // Refresh auth status when refreshKey changes
    useEffect(() => {
        if (refreshKey > 0) {
            console.log('AuthContext: Refresh key changed, checking auth status');
            checkAuthStatus();
        }
    }, [refreshKey, checkAuthStatus]);

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
