import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJY_m1BZ237BtFPTyp63i8JA4zRxwuAGI",
  authDomain: "imgp-20315.firebaseapp.com",
  projectId: "imgp-20315",
  storageBucket: "imgp-20315.firebasestorage.app",
  messagingSenderId: "181038428072",
  appId: "1:181038428072:web:61c326acd511793e57f79d",
  measurementId: "G-W7QXBY7Z45"
};

const app = firebaseConfig.apiKey !== "YOUR_API_KEY" ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;

const Signup = () => {

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Guest',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast.error("Firebase config missing in Signup.jsx");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      // send firebase token to backend 
      const response = await api.post('/google-login/', { token });

      if (response.status === 200) {
        localStorage.setItem('authTokens', JSON.stringify(response.data));
        toast.success("Account created via Google!");
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      toast.error("Google Sign-In failed.");
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/register/', formData);
      toast.success('Account created successfully! Please log in.');
      window.location.href = '/login';
    } catch (err) {
      const errorMsg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Signup failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-700 text-white rounded text-sm">{error}</div>
        )}

        <button 
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full mb-4 flex justify-center items-center gap-2 bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition"
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
            Sign up with Google
        </button>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or use email</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
            <div className="h-full flex items-center px-3 text-gray-400">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              name="full_name"
              type="text"
              placeholder="Full Name"
              className="w-full py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
            <div className="h-full flex items-center px-3 text-gray-400">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
            <div className="h-full flex items-center px-3 text-gray-400">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
            <select
              name="role"
              className="w-full py-2 px-3 bg-gray-700 text-white focus:outline-none border-0"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="" disabled>Select Role</option>
              {/* Note: Google Signup defaults to 'Guest' in backend */}
              <option value="Admin">Admin</option>
              <option value="Coordinator">Event Coordinator</option>
              <option value="Photographer">Photographer</option>
              <option value="Member">Club Member</option>
              <option value="Guest">Guest</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
           {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
