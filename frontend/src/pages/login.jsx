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
    const response = await api.post('/login/', {
        email: email, 
        password: password
    });

    if(response.status === 200) {
        toast.success('Login successful.');
        localStorage.setItem('authTokens', JSON.stringify(response.data));
        navigate('/');
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
            toast.error('Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

   return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
                  
                  <div className="text-center">
                      <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                      <p className="mt-2 text-sm text-gray-400">Login to access your gallery</p>
                  </div>
  
                  <div className="space-y-4">
                      <button 
                          onClick={handleGoogleSignIn}
                          className="w-full flex justify-center items-center gap-3 bg-white text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition"
                      >
                          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                          <span>Sign in with Google</span>
                      </button>
  
                      <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-600"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-gray-800 text-gray-400">Or use email</span>
                          </div>
                      </div>
                  </div>
  
                  <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
                          <div className="h-full flex items-center px-3 text-gray-400">
                              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <input 
                              type="email" 
                              required 
                              className="w-full py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                          />
                      </div>
                      
                      <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
                          <div className="h-full flex items-center px-3 text-gray-400">
                              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <input 
                              type="password" 
                              required 
                              className="w-full py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                          />
                      </div>
                      
                      <button 
                          type="submit" 
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition duration-200"
                      >
                          {loading ? 'Logging In...' : 'Log In'}
                      </button>
                  </form>
  
                  <p className="text-center text-sm text-gray-400">
                      New here?{' '}
                      <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
                          Create an account
                      </Link>
                  </p>
  
              </div>
          </div>
      );
};

export default Login;

