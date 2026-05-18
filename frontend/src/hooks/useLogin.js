import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import api from '../config/api';

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(response.data));
            dispatch({ type: 'LOGIN', payload: response.data });
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return { login, isLoading, error };
};
