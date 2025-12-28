import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios'; 

const Login = () => {
    
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

    const loginUser = async (email, password) => {
        const response = await api.post('/api/auth/login/', {
                email: email, 
                password: password
        });

    if(response.status === 200) {
        toast.success('Login successful.');
        localStorage.setItem('authTokens', JSON.stringify(response.data));
        navigate('/home');
    }
    return response;
 };

  const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill in all the fields!");
            return;
        }
        setLoading(true);
        try {
            await loginUser(email, password);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Login failed.";
            // Handles unverified email case
            if (String(errorMsg).toLowerCase().includes("not verified")) {
                toast((t) => (
                    <div className="flex flex-col gap-2">
                        <span>Email not verified!</span>
                        <button 
                            onClick={() => {
                                toast.dismiss(t.id); // removes this toast before navigating
                                navigate('/verify-email', { state: { email } });
                            }}
                            className="bg-black px-3 py-1 rounded text-sm text-white font-bold hover:bg-gray-800"
                        >
                            Verify Now 
                        </button>
                    </div>
                ), { duration: 5000, icon: '⚠️' });
            } else {
                toast.error('Login failed. Check credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

   return (
          <div className="min-h-screen bg-white flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-white rounded-lg border border-black p-8 space-y-6">
                  
                  <div className="text-center">
                      <h1 className="text-3xl font-bold text-black">Welcome Back</h1>
                      <p className="mt-2 text-sm text-gray-600">Login to access your gallery</p>
                  </div>
  
                  <div className="space-y-4">
                      <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-600">Use email</span>
                          </div>
                      </div>
                  </div>
  
                  <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="flex items-center border border-black rounded-lg overflow-hidden">
                          <div className="h-full flex items-center px-3 text-gray-600">
                              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <input 
                              type="email" 
                              required 
                              className="w-full py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                          />
                      </div>
                      
                      <div className="flex items-center border border-black rounded-lg overflow-hidden">
                          <div className="h-full flex items-center px-3 text-gray-600">
                              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <input 
                              type="password" 
                              required 
                              className="w-full py-2 px-3 bg-white text-black placeholder-gray-500 focus:outline-none"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                          />
                      </div>
                      
                      <button 
                          type="submit" 
                          disabled={loading}
                          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {loading ? 'Logging In...' : 'Log In'}
                      </button>
                  </form>
  
                  <p className="text-center text-sm text-gray-600">
                      New here?{' '}
                      <Link to="/signup" className="font-semibold text-black hover:underline">
                          Create an account
                      </Link>
                  </p>
  
              </div>
          </div>
      );
};

export default Login;

