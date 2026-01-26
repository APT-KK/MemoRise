import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        // we exchange auth code for tokens{access,refresh} from backend
        if (code) {
            const exchangeCode = async () => {
                try {
                    const response = await fetch('http://127.0.0.1:8000/api/auth/omniport/callback/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem('authTokens', JSON.stringify(data));
                        toast.success('Login successful!');
                        navigate('/home');
                    } else {
                        toast.error('Login failed.');
                        navigate('/login');
                    }
                } catch (error) {
                    console.error("Omniport login error", error);
                    toast.error('Login failed.');
                    navigate('/login');
                }
            };

            exchangeCode();

        } else if (searchParams.get('access')) {
            const accessToken = searchParams.get('access');
            const refreshToken = searchParams.get('refresh');
            const tokens = { access: accessToken, refresh: refreshToken };
            localStorage.setItem('authTokens', JSON.stringify(tokens));
            toast.success('Login successful!');
            navigate('/home');
        }
    }, [searchParams, navigate]);

    return (
        <div className="h-screen flex items-center justify-center">
            <p>Processing login...</p>
        </div>
    );
};

export default AuthCallback;