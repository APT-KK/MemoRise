import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios'; 
import { Mail, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // In navigate('/some-path', { state: { key: value } }),
    // the state object is attached to the location. So,
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            toast.error("No email found. Please register first.");
            navigate('/signup');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/auth/verify-email/', { email, otp });
            toast.success("Email verified! Please login.");
            navigate('/login');
        } catch (error) {
            const msg = error.response?.data?.error || "Verification failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await api.post('/api/auth/resend-otp/', { email });
            toast.success("New code sent to your email!");
        } catch (error) {
            toast.error("Failed to resend code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                        <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Verify your Email</h2>
                    <p className="text-gray-400 mt-2 text-sm">
                        Enter the 6-digit code sent to <br/>
                        <span className="font-medium text-white">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="000000"
                            className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // this only allow numbers
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Account"}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm border-t border-gray-700 pt-4">
                    <button 
                        onClick={handleResend}
                        disabled={resending}
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 transition-colors"
                    >
                        {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Resend Code
                    </button>
                    
                    <Link to="/signup" className="text-gray-500 hover:text-gray-400 transition-colors">
                        Change Email
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;