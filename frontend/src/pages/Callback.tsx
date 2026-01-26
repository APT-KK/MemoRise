import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = searchParams.get('access');
        const refreshToken = searchParams.get('refresh');

        if (accessToken && refreshToken) {
            const tokens = { access: accessToken, refresh: refreshToken };
            localStorage.setItem('authTokens', JSON.stringify(tokens));
            toast.success('Login successful!');
            navigate('/home');
        } else {
            toast.error('Login failed.');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="h-screen flex items-center justify-center">
            <p>Processing login...</p>
        </div>
    );
};

export default AuthCallback;